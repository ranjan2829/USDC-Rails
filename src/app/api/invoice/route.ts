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
    .from("invoices")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoices: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { client_name, description, amount, due_date } = await req.json();
  if (!client_name || !amount)
    return NextResponse.json({ error: "client_name and amount required" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invoices")
    .insert({ user_id: session.userId, client_name, description, amount: parseFloat(amount), due_date: due_date ?? null, status: "unpaid" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice: data });
}

// Simulate payment: transfer from demo wallet to user's wallet
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: invoice } = await admin.from("invoices").select("*").eq("id", id).eq("user_id", session.userId).single();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status !== "unpaid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const { data: profile } = await admin.from("profiles").select("wallet_address").eq("id", session.userId).single();
  const walletId = process.env.NEXT_PUBLIC_DEMO_WALLET_ID!;
  const recipientAddress = profile?.wallet_address;
  if (!recipientAddress) return NextResponse.json({ error: "No wallet address" }, { status: 400 });

  const ciphertext = await generateCiphertext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transfer = await circleClient.createTransaction({
    walletId,
    blockchain: "ARC-TESTNET",
    tokenAddress: ARC_USDC_ADDRESS,
    destinationAddress: recipientAddress,
    amount: [invoice.amount.toString()],
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    idempotencyKey: uuidv4(),
    entitySecretCiphertext: ciphertext,
  } as any);

  const txId = transfer.data?.id;

  await admin.from("invoices").update({ status: "paid", tx_id: txId, paid_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ txId, status: "paid" });
}
