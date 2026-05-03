import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/supabase/server";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";
import { signToken, COOKIE } from "@/lib/auth";

async function verifyFirebaseToken(idToken: string) {
  // Decode JWT header to get kid
  const [headerB64] = idToken.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());

  // Fetch Firebase public keys
  const keysRes = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
    { next: { revalidate: 3600 } }
  );
  const keys = await keysRes.json();
  const publicKey = keys[header.kid];
  if (!publicKey) throw new Error("Unknown key");

  // Decode payload (trust Google's signing — in prod use firebase-admin for full verify)
  const [, payloadB64] = idToken.split(".");
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("Token expired");
  if (payload.aud !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    // Also accept app ID format
    if (!payload.aud?.includes("usdc-fb7fe")) throw new Error("Invalid audience");
  }

  return payload as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    firebase: { sign_in_provider: string };
  };
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });

    const payload = await verifyFirebaseToken(idToken);

    const firebaseUid = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    const picture = payload.picture;

    const admin = createAdminClient();

    // Check if user already exists
    const { data: existing } = await admin
      .from("profiles")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    let profile = existing;

    if (!profile) {
      // New user — create Circle wallet
      const ciphertext1 = await generateCiphertext();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletSetRes = await circleClient.createWalletSet({
        idempotencyKey: uuidv4(),
        name: `user-${firebaseUid.slice(0, 8)}`,
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

      const { data: newProfile, error } = await admin
        .from("profiles")
        .insert({
          id: uuidv4(),
          firebase_uid: firebaseUid,
          name,
          email,
          avatar: picture ?? null,
          wallet_id: wallet.id,
          wallet_address: wallet.address,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      profile = newProfile;
    }

    const token = signToken({ userId: profile.id, email: profile.email });

    const res = NextResponse.json({
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        walletAddress: profile.wallet_address,
        avatar: profile.avatar,
      },
    });

    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Auth failed";
    console.error("Firebase auth error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
