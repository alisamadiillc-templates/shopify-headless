import { NextRequest, NextResponse } from "next/server";

import { CUSTOMER_COOKIES } from "@/lib/constants";
import {
  clearOauthTransientCookies,
  decodeJwtPayload,
  exchangeCodeForTokens,
  setTokenCookies,
} from "@/lib/shopify/customer/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const fail = (reason: string) => {
    console.error(`Customer login failed: ${reason}`);
    const response = NextResponse.redirect(new URL("/?login_error=1", req.url));
    clearOauthTransientCookies(response.cookies);
    return response;
  };

  if (error) {
    return fail(`${error}: ${searchParams.get("error_description") ?? ""}`);
  }

  const expectedState = req.cookies.get(CUSTOMER_COOKIES.state)?.value;
  const nonce = req.cookies.get(CUSTOMER_COOKIES.nonce)?.value;
  const verifier = req.cookies.get(CUSTOMER_COOKIES.verifier)?.value;

  if (!code || !state || !expectedState || !verifier) {
    return fail("missing code, state, or transient cookies");
  }

  if (state !== expectedState) {
    return fail("state mismatch");
  }

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code, verifier);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "token exchange error");
  }

  if (tokens.idToken && nonce) {
    const claims = decodeJwtPayload(tokens.idToken);
    if (claims.nonce !== nonce) {
      return fail("nonce mismatch");
    }
  }

  const returnTo = req.cookies.get(CUSTOMER_COOKIES.returnTo)?.value;
  const destination =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/account";

  const response = NextResponse.redirect(new URL(destination, req.url));
  setTokenCookies(response.cookies, tokens);
  clearOauthTransientCookies(response.cookies);

  return response;
}
