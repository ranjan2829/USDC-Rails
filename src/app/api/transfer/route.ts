import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";
import { createClient } from "@/lib/supabase/server";

const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

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

    // Get logged-in user's wallet (fall back to demo wallet)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let walletId = process.env.NEXT_PUBLIC_DEMO_WALLET_ID ?? "b5d911fd-8d0b-5ed1-88b1-2d244bff80fe";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_id")
        .eq("id", user.id)
        .single();
      if (profile?.wallet_id) walletId = profile.wallet_id;
    }

    const ciphertext = await generateCiphertext();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transfer = await circleClient.createTransaction({
      walletId,
      blockchain: "ARC-TESTNET",
      tokenAddress: ARC_USDC_ADDRESS,
      destinationAddress: recipientAddress,
      amount: [amount.toString()],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
      idempotencyKey: uuidv4(),
      entitySecretCiphertext: ciphertext,
    } as any);

    const circleId = transfer.data?.id;
    const status = transfer.data?.state ?? "INITIATED";

    // Persist to Supabase if user is logged in
    if (user) {
      await supabase.from("transactions").insert({
        user_id: user.id,
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
