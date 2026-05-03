import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { circleClient } from "@/lib/circle.server";
import { generateCiphertext } from "@/lib/cipher";

const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("escrows")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ escrows: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, amount, recipient } = await req.json();
  if (!title || !amount || !recipient)
    return NextResponse.json({ error: "title, amount, recipient required" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("escrows")
    .insert({ user_id: session.userId, title, description, amount: parseFloat(amount), recipient, status: "locked" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ escrow: data });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: escrow } = await admin.from("escrows").select("*").eq("id", id).eq("user_id", session.userId).single();
  if (!escrow) return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  if (escrow.status !== "locked") return NextResponse.json({ error: "Already released" }, { status: 400 });

  const { data: profile } = await admin.from("profiles").select("wallet_id").eq("id", session.userId).single();
  const walletId = profile?.wallet_id ?? process.env.NEXT_PUBLIC_DEMO_WALLET_ID;
  if (!walletId) return NextResponse.json({ error: "No wallet" }, { status: 400 });

  const ciphertext = await generateCiphertext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transfer = await circleClient.createTransaction({
    walletId,
    blockchain: "ARC-TESTNET",
    tokenAddress: ARC_USDC_ADDRESS,
    destinationAddress: escrow.recipient,
    amount: [escrow.amount.toString()],
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    idempotencyKey: uuidv4(),
    entitySecretCiphertext: ciphertext,
  } as any);

  const txId = transfer.data?.id;

  await admin.from("escrows").update({ status: "released", tx_id: txId, released_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ txId, status: "released" });
}
