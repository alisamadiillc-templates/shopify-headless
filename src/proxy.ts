import { NextResponse, type NextRequest } from "next/server";

import { CUSTOMER_COOKIES } from "@/lib/constants";
import {
  clearTokenCookies,
  refreshAccessToken,
  setTokenCookies,
} from "@/lib/shopify/customer/auth";

// Optimistic guard for /account: cookie presence + expiry only. Real
// authorization happens in the data layer — every read and action
// re-validates the token itself.
export async function proxy(request: NextRequest) {
  const loginRedirect = () => {
    const loginUrl = new URL("/api/auth/login", request.url);
    loginUrl.searchParams.set("return_to", request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    clearTokenCookies(response.cookies);
    return response;
  };

  const refreshToken = request.cookies.get(
    CUSTOMER_COOKIES.refreshToken
  )?.value;

  if (!refreshToken) {
    return loginRedirect();
  }

  const accessToken = request.cookies.get(CUSTOMER_COOKIES.accessToken)?.value;
  const expiresAt = Number(
    request.cookies.get(CUSTOMER_COOKIES.expiresAt)?.value ?? 0
  );

  if (accessToken && expiresAt && Date.now() < expiresAt) {
    return NextResponse.next();
  }

  // Access token expired — refresh here, the one render-path place that
  // can set cookies (Server Components can't).
  try {
    const tokens = await refreshAccessToken(refreshToken);
    // Downstream Server Components read request cookies, so the fresh
    // token has to be applied to the request as well as the response.
    request.cookies.set(CUSTOMER_COOKIES.accessToken, tokens.accessToken);
    request.cookies.set(CUSTOMER_COOKIES.refreshToken, tokens.refreshToken);
    request.cookies.set(CUSTOMER_COOKIES.expiresAt, String(tokens.expiresAt));
    const response = NextResponse.next({ request });
    setTokenCookies(response.cookies, tokens);
    return response;
  } catch {
    return loginRedirect();
  }
}

export const config = {
  matcher: ["/account/:path*"],
};
