import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COOKIE } from "@/lib/auth";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
