import { NextRequest, NextResponse } from "next/server";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const ciphertext = await generateCiphertext();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletSetResponse = await circleClient.createWalletSet({
      idempotencyKey: uuidv4(),
      name: `wallet-${userId}-${Date.now()}`,
      entitySecretCiphertext: ciphertext,
    } as any);

    const walletSetId = walletSetResponse.data?.walletSet?.id;
    if (!walletSetId) throw new Error("Failed to create wallet set");

    const ciphertext2 = await generateCiphertext();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletResponse = await circleClient.createWallets({
      idempotencyKey: uuidv4(),
      blockchains: ["ARC-TESTNET"],
      count: 1,
      walletSetId,
      entitySecretCiphertext: ciphertext2,
    } as any);

    const wallet = walletResponse.data?.wallets?.[0];
    if (!wallet) throw new Error("Failed to create wallet");

    return NextResponse.json({ wallet, walletSetId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
