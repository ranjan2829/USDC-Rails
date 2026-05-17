import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";
import { getChainConfig } from "@/lib/chain-config";
import { createAdminClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { recipientAddress, amount, destinationCountry, inputCurrency, inputAmount } =
      await req.json();

    if (!recipientAddress || !amount) {
      return NextResponse.json(
        { error: "recipientAddress and amount are required" },
        { status: 400 }
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("wallet_id")
      .eq("id", session.userId)
      .single();

    const walletId = profile?.wallet_id;
    if (!walletId) {
      return NextResponse.json({ error: "No wallet found. Please complete account setup." }, { status: 400 });
    }

    const { chain, usdcAddress } = getChainConfig();
    const ciphertext = await generateCiphertext();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transfer = await circleClient.createTransaction({
      walletId,
      blockchain: chain,
      tokenAddress: usdcAddress,
      destinationAddress: recipientAddress,
      amount: [amount.toString()],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
      idempotencyKey: uuidv4(),
      entitySecretCiphertext: ciphertext,
    } as any);

    const circleId = transfer.data?.id;
    const status = transfer.data?.state ?? "INITIATED";

    if (session) {
      const admin = createAdminClient();
      await admin.from("transactions").insert({
        user_id: session.userId,
        circle_id: circleId,
        amount: parseFloat(amount),
        recipient_address: recipientAddress,
        destination_country: destinationCountry ?? null,
        input_currency: inputCurrency ?? "USD",
        input_amount: inputAmount ? parseFloat(inputAmount) : null,
        status,
      });
    }

    return NextResponse.json({
      transactionId: circleId,
      status,
      amount,
      destinationCountry,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Transfer error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
