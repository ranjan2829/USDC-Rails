import { NextRequest, NextResponse } from "next/server";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";
import { v4 as uuidv4 } from "uuid";

const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

export async function POST(req: NextRequest) {
  try {
    const { walletId, recipientAddress, amount, destinationCountry } = await req.json();

    if (!walletId || !recipientAddress || !amount) {
      return NextResponse.json(
        { error: "walletId, recipientAddress, amount are required" },
        { status: 400 }
      );
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

    return NextResponse.json({
      transactionId: transfer.data?.id,
      status: transfer.data?.state,
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
