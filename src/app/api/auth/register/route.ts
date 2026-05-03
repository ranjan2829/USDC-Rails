import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, password required" }, { status: 400 });
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Sign up via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Signup failed" }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create Circle wallet for this user
    const ciphertext1 = await generateCiphertext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletSetRes = await circleClient.createWalletSet({
      idempotencyKey: uuidv4(),
      name: `user-${userId}`,
      entitySecretCiphertext: ciphertext1,
    } as any);

    const walletSetId = walletSetRes.data?.walletSet?.id;
    if (!walletSetId) throw new Error("Failed to create wallet set");

    const ciphertext2 = await generateCiphertext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletRes = await circleClient.createWallets({
      idempotencyKey: uuidv4(),
      blockchains: ["ARC-TESTNET"],
      count: 1,
      walletSetId,
      entitySecretCiphertext: ciphertext2,
    } as any);

    const wallet = walletRes.data?.wallets?.[0];
    if (!wallet) throw new Error("Failed to create wallet");

    // Save wallet info to profile (use admin to bypass RLS during setup)
    await admin
      .from("profiles")
      .update({ wallet_id: wallet.id, wallet_address: wallet.address, name })
      .eq("id", userId);

    return NextResponse.json({
      user: { id: userId, name, email, walletAddress: wallet.address },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("Register error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
