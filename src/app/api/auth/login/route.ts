import { NextRequest, NextResponse } from "next/server";

import { CUSTOMER_COOKIES } from "@/lib/constants";
import {
  buildAuthorizationUrl,
  codeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateState,
} from "@/lib/shopify/customer/auth";

const TRANSIENT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 600,
} as const;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const verifier = generateCodeVerifier();
  const state = generateState();
  const nonce = generateNonce();
  const challenge = await codeChallenge(verifier);

  const response = NextResponse.redirect(
    buildAuthorizationUrl({ state, nonce, challenge })
  );

  response.cookies.set(CUSTOMER_COOKIES.state, state, TRANSIENT_COOKIE_OPTIONS);
  response.cookies.set(CUSTOMER_COOKIES.nonce, nonce, TRANSIENT_COOKIE_OPTIONS);
  response.cookies.set(
    CUSTOMER_COOKIES.verifier,
    verifier,
    TRANSIENT_COOKIE_OPTIONS
  );

  const returnTo = req.nextUrl.searchParams.get("return_to");
  // Only same-origin paths — never an absolute URL an attacker could inject.
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    response.cookies.set(
      CUSTOMER_COOKIES.returnTo,
      returnTo,
      TRANSIENT_COOKIE_OPTIONS
    );
  }

  return response;
}
