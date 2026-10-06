import { headers } from "next/headers";

/**
 * The visitor's X-Forwarded-For, to pass on when the server calls the backend. The backend counts
 * requests per visitor IP and only believes this header from proxies it trusts (TRUST_PROXY), so
 * without it every visitor would share this server's address. The frontend applies no limits itself.
 */
export async function forwardedForHeader(): Promise<Record<string, string>> {
  const value = (await headers()).get("x-forwarded-for");
  return value ? { "X-Forwarded-For": value } : {};
}
