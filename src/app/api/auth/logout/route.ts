import { NextRequest, NextResponse } from "next/server";

import { CUSTOMER_COOKIES } from "@/lib/constants";
import { clearTokenCookies, logoutUrl } from "@/lib/shopify/customer/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const idToken = req.cookies.get(CUSTOMER_COOKIES.idToken)?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Without id_token_hint Shopify keeps its SSO session alive and the next
  // login silently re-authenticates instead of showing the login form.
  let destination = new URL("/", req.url);
  if (idToken) {
    const shopifyLogout = new URL(logoutUrl());
    shopifyLogout.searchParams.set("id_token_hint", idToken);
    shopifyLogout.searchParams.set("post_logout_redirect_uri", appUrl);
    destination = shopifyLogout;
  }

  const response = NextResponse.redirect(destination);
  clearTokenCookies(response.cookies);

  return response;
}
