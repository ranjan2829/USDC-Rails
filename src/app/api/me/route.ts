import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { circleClient } from "@/lib/circle.server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", session.userId)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Live USDC balance from Circle
    let balance = "0";
    if (profile.wallet_id) {
      try {
        const res = await circleClient.getWalletTokenBalance({ id: profile.wallet_id });
        const usdc = (res.data?.tokenBalances ?? []).find(
          (b: { token?: { symbol?: string }; amount?: string }) => b.token?.symbol === "USDC"
        );
        balance = usdc?.amount ?? "0";
      } catch {}
    }

    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar ?? null,
      walletId: profile.wallet_id,
      walletAddress: profile.wallet_address,
      balance,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
