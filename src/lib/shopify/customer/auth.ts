import { cookies } from "next/headers";

import {
  CUSTOMER_COOKIES,
  SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION,
} from "@/lib/constants";

const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;
const shopId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_SHOP_ID!;
const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

// Refresh this long before the real expiry to absorb clock skew and
// in-flight request time.
const EXPIRY_BUFFER_MS = 60_000;

export const redirectUri = () => `${appUrl}/api/auth/callback`;

export const authorizeUrl = () =>
  `https://shopify.com/authentication/${shopId}/oauth/authorize`;

export const tokenUrl = () =>
  `https://shopify.com/authentication/${shopId}/oauth/token`;

export const logoutUrl = () =>
  `https://shopify.com/authentication/${shopId}/logout`;

export const customerApiUrl = () =>
  `https://shopify.com/${shopId}/account/customer/api/${SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION}/graphql`;

export type TokenSet = {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: number;
};

// Minimal cookie surface shared by `await cookies()` (route handlers /
// server actions) and `NextResponse.cookies` (proxy).
export type CookieJar = {
  get(name: string): { value: string } | undefined;
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      path?: string;
      maxAge?: number;
    }
  ): unknown;
  delete(name: string): unknown;
};

const base64UrlEncode = (bytes: Uint8Array): string =>
  Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const randomBase64Url = (byteLength: number): string =>
  base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));

export const generateCodeVerifier = () => randomBase64Url(32);
export const generateState = () => randomBase64Url(16);
export const generateNonce = () => randomBase64Url(16);

export async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return base64UrlEncode(new Uint8Array(digest));
}

export function buildAuthorizationUrl({
  state,
  nonce,
  challenge,
}: {
  state: string;
  nonce: string;
  challenge: string;
}): string {
  const url = new URL(authorizeUrl());
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
};

async function requestTokens(params: URLSearchParams): Promise<TokenSet> {
  const result = await fetch(tokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!result.ok) {
    throw new Error(
      `Token request failed (${result.status}): ${await result.text()}`
    );
  }

  const body = (await result.json()) as TokenResponse;

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    idToken: body.id_token,
    expiresAt: Date.now() + body.expires_in * 1000 - EXPIRY_BUFFER_MS,
  };
}

export async function exchangeCodeForTokens(
  code: string,
  verifier: string
): Promise<TokenSet> {
  return requestTokens(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri(),
      code,
      code_verifier: verifier,
    })
  );
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenSet> {
  return requestTokens(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    })
  );
}

// The id_token arrives directly from Shopify over TLS, so decoding the
// payload without signature verification is sufficient for the nonce check.
export function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const payload = jwt.split(".")[1];
  if (!payload) {
    throw new Error("Malformed JWT");
  }
  return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
}

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;

export function setTokenCookies(jar: CookieJar, tokens: TokenSet) {
  jar.set(CUSTOMER_COOKIES.accessToken, tokens.accessToken, {
    ...TOKEN_COOKIE_OPTIONS,
  });
  jar.set(CUSTOMER_COOKIES.refreshToken, tokens.refreshToken, {
    ...TOKEN_COOKIE_OPTIONS,
    // Refresh tokens outlive the access token; cap at 30 days.
    maxAge: 60 * 60 * 24 * 30,
  });
  jar.set(CUSTOMER_COOKIES.expiresAt, String(tokens.expiresAt), {
    ...TOKEN_COOKIE_OPTIONS,
  });
  if (tokens.idToken) {
    jar.set(CUSTOMER_COOKIES.idToken, tokens.idToken, {
      ...TOKEN_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export function clearTokenCookies(jar: CookieJar) {
  jar.delete(CUSTOMER_COOKIES.accessToken);
  jar.delete(CUSTOMER_COOKIES.refreshToken);
  jar.delete(CUSTOMER_COOKIES.expiresAt);
  jar.delete(CUSTOMER_COOKIES.idToken);
}

export function clearOauthTransientCookies(jar: CookieJar) {
  jar.delete(CUSTOMER_COOKIES.state);
  jar.delete(CUSTOMER_COOKIES.nonce);
  jar.delete(CUSTOMER_COOKIES.verifier);
  jar.delete(CUSTOMER_COOKIES.returnTo);
}

export type CustomerSession = {
  accessToken: string;
};

export async function getCustomerSession(): Promise<
  CustomerSession | undefined
> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CUSTOMER_COOKIES.accessToken)?.value;
  const expiresAt = Number(
    cookieStore.get(CUSTOMER_COOKIES.expiresAt)?.value ?? 0
  );

  if (!accessToken || !expiresAt || Date.now() >= expiresAt) {
    return undefined;
  }

  return { accessToken };
}
