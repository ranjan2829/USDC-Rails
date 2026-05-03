import { NextRequest, NextResponse } from "next/server";
import { circleClient } from "@/lib/circle.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("id");

    if (!transactionId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const tx = await circleClient.getTransaction({ id: transactionId });

    return NextResponse.json({
      id: tx.data?.transaction?.id,
      status: tx.data?.transaction?.state,
      txHash: tx.data?.transaction?.txHash,
      amounts: tx.data?.transaction?.amounts,
      updateDate: tx.data?.transaction?.updateDate,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
