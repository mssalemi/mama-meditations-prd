// Session auth for a two-person admin. A signed cookie rather than a bare
// "is logged in" flag: the value carries an expiry and an HMAC, so it can't be
// forged or replayed past its lifetime by anyone who can set cookies.
//
// Web Crypto (not node:crypto) because middleware runs on the edge runtime.

const COOKIE = "mm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const value = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("SESSION_SECRET or ADMIN_PASSWORD must be set");
  return value;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time compare so a wrong signature can't be narrowed by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

export async function createSessionValue(): Promise<string> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${await sign(payload)}`;
}

export async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, await sign(payload))) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

/** Compares the submitted password to ADMIN_PASSWORD in constant time. */
export function passwordMatches(submitted: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(submitted, expected);
}
