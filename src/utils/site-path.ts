/**
 * The backend's NEWS_CTA_URL_PATTERN: a path on this site only. One leading "/" (never "//", which
 * browsers read as another host), no backslash (browsers read "/\x" as "//x"), no whitespace or
 * control characters, at most 200 characters. Redirects taken from a form go through this, so a
 * tampered form can never send the visitor to another site.
 */
const SITE_PATH = /^\/(?![/\\])[^\s\\\u0000-\u001f\u007f]*$/;
const SITE_PATH_MAX = 200;

export function isSitePath(value: unknown): value is string {
  return typeof value === "string" && value.length <= SITE_PATH_MAX && SITE_PATH.test(value);
}
