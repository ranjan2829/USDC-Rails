import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

interface PaymentIntent {
  recipient: string;
  amount: string;
  note: string;
  valid: boolean;
}

function parseWithRegex(message: string): PaymentIntent | null {
  const addrMatch = message.match(/0x[a-fA-F0-9]{40}/);
  const amountMatch = message.match(/\b(\d+(?:\.\d+)?)\s*(?:USDC|usdc|\$)?/);
  if (!addrMatch || !amountMatch) return null;
  const noteMatch = message.replace(addrMatch[0], "").replace(amountMatch[0], "").trim();
  return {
    recipient: addrMatch[0],
    amount: amountMatch[1],
    note: noteMatch.replace(/^(for|to|pay|send)\s*/i, "").trim() || "Payment",
    valid: true,
  };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    const intent = parseWithRegex(message);
    return NextResponse.json({
      reply: intent
        ? `I found a payment: ${intent.amount} USDC → ${intent.recipient.slice(0, 10)}… for "${intent.note}". Confirm to execute.`
        : "I couldn't find a wallet address or amount. Try: 'Pay 10 USDC to 0x... for consulting'",
      intent,
    });
  }

  const systemPrompt = `You are a USDC payment assistant. Extract payment intent from user messages.
Always respond with a JSON tool call to extract_payment if you find payment details.
If no clear payment intent, reply conversationally explaining what you need (wallet address + amount).`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: systemPrompt,
      tools: [
        {
          name: "extract_payment",
          description: "Extract payment details from the user message",
          input_schema: {
            type: "object",
            properties: {
              recipient: { type: "string", description: "Ethereum wallet address (0x...)" },
              amount: { type: "string", description: "Amount in USDC (e.g. '10.5')" },
              note: { type: "string", description: "Payment description/note" },
            },
            required: ["recipient", "amount", "note"],
          },
        },
      ],
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = await res.json();

  // Check if Claude called the tool
  const toolUse = data.content?.find((c: { type: string }) => c.type === "tool_use");
  if (toolUse?.input) {
    const { recipient, amount, note } = toolUse.input;
    const valid = /^0x[a-fA-F0-9]{40}$/.test(recipient) && parseFloat(amount) > 0;
    return NextResponse.json({
      reply: valid
        ? `Ready to send **${amount} USDC** to \`${recipient.slice(0, 10)}…${recipient.slice(-6)}\` for "${note}". Confirm to execute.`
        : "I found some details but the wallet address looks invalid. Please check and try again.",
      intent: { recipient, amount, note, valid },
    });
  }

  // Text response from Claude
  const textContent = data.content?.find((c: { type: string }) => c.type === "text");
  return NextResponse.json({
    reply: textContent?.text ?? "Tell me who to pay, how much, and their wallet address.",
    intent: null,
  });
}
