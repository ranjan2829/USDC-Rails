import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { createAdminClient } from "@/lib/supabase/server";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";
import { signToken, COOKIE } from "@/lib/auth";

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "usdc-fb7fe";

async function verifyFirebaseToken(idToken: string) {
  const [headerB64] = idToken.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());

  // Plain fetch — no Next.js-specific options that changed in v16
  const keysRes = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  );
  if (!keysRes.ok) throw new Error("Failed to fetch Firebase public keys");
  const keys = await keysRes.json();

  const publicKey = keys[header.kid];
  if (!publicKey) throw new Error("Unknown signing key");

  // Full RS256 signature verification with jsonwebtoken
  const verified = jwt.verify(idToken, publicKey, {
    algorithms: ["RS256"],
    audience: FIREBASE_PROJECT_ID,
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
  }) as Record<string, unknown>;

  return {
    sub: verified.sub as string,
    email: verified.email as string,
    name: verified.name as string | undefined,
    picture: verified.picture as string | undefined,
    firebase: verified.firebase as { sign_in_provider: string },
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
