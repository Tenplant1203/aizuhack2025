// 保留

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { error } = await supabase.auth.getSessionFromUrl({
    storeSession: true,
  });

  const url = new URL(request.url);
  url.pathname = "/auth/confirm";
  url.searchParams.set("status", error ? "error" : "success");
  return NextResponse.redirect(url);
}
