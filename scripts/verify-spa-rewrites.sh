#!/usr/bin/env bash
# Verify SPA rewrite behaviour on a custom domain (or any CDN hostname).
# Usage:
#   ./verify-spa-rewrites.sh https://spa-demo.super-cdn.com
#   ASSET_JS=/assets/index-XXXX.js ASSET_CSS=/assets/index-XXXX.css ./verify-spa-rewrites.sh https://example.com
set -euo pipefail

BASE="${1:-}"
if [[ -z "$BASE" ]]; then
  echo "Usage: $0 https://spa-demo.super-cdn.com" >&2
  exit 2
fi
BASE="${BASE%/}"

SHELL_MARK="${SHELL_MARK:-gd-spa-shell}"
ASSET_JS="${ASSET_JS:-}"
ASSET_CSS="${ASSET_CSS:-}"
failures=0

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

discover_assets() {
  local body
  body="$(curl -fsS "$BASE/" || true)"
  if [[ -z "$ASSET_JS" ]]; then
    ASSET_JS="$(printf '%s' "$body" | sed -n 's/.*src="\([^"]*\/assets\/[^"]*\.js\)".*/\1/p' | head -n1)"
  fi
  if [[ -z "$ASSET_CSS" ]]; then
    ASSET_CSS="$(printf '%s' "$body" | sed -n 's/.*href="\([^"]*\/assets\/[^"]*\.css\)".*/\1/p' | head -n1)"
  fi
  # Allow relative paths
  ASSET_JS="${ASSET_JS#}"
  ASSET_CSS="${ASSET_CSS#}"
}

check() {
  local name="$1" url="$2" expect_code="$3" body_test="${4:-}" ctype_glob="${5:-}"
  local code ctype
  code="$(curl -sS -o "$tmp" -w '%{http_code}' "$url" || true)"
  ctype="$(curl -sS -o /dev/null -D - "$url" | awk -F': ' 'tolower($1)=="content-type"{print $2}' | tr -d '\r' | head -n1)"
  # also capture from the first request via -D if needed; re-fetch headers cheaply is ok
  local ok=1
  if [[ "$code" != "$expect_code" ]]; then
    ok=0
  fi
  if [[ -n "$body_test" ]]; then
    if [[ "$body_test" == "HAS_SHELL" ]]; then
      if ! grep -q "$SHELL_MARK" "$tmp" && ! grep -q "spa-shell:index.html" "$tmp"; then
        ok=0
      fi
    elif [[ "$body_test" == "NO_SHELL" ]]; then
      if grep -q "$SHELL_MARK" "$tmp" || grep -q "spa-shell:index.html" "$tmp"; then
        ok=0
      fi
    elif ! grep -q -- "$body_test" "$tmp"; then
      ok=0
    fi
  fi
  if [[ -n "$ctype_glob" ]]; then
    # shell-style substring match, comma-separated alternatives
    local matched=0 part
    IFS=',' read -ra parts <<< "$ctype_glob"
    for part in "${parts[@]}"; do
      if [[ "${ctype,,}" == *"${part,,}"* ]]; then
        matched=1
        break
      fi
    done
    if [[ $matched -eq 0 ]]; then
      ok=0
    fi
  fi
  if [[ $ok -eq 1 ]]; then
    printf 'PASS  %s  %s  (%s, %s)\n' "$name" "$url" "$code" "${ctype:-no-content-type}"
  else
    printf 'FAIL  %s  %s  (got %s, content-type=%s, expect %s %s %s)\n' \
      "$name" "$url" "$code" "${ctype:-?}" "$expect_code" "$body_test" "$ctype_glob"
    failures=$((failures + 1))
  fi
}

echo "Base: $BASE"
discover_assets
echo "Asset JS:  ${ASSET_JS:-<none found>}"
echo "Asset CSS: ${ASSET_CSS:-<none found>}"
echo

check "home"              "$BASE/"                              200 HAS_SHELL "text/html"
check "about"             "$BASE/about"                         200 HAS_SHELL "text/html"
check "about trailing /"  "$BASE/about/"                        200 HAS_SHELL "text/html"
check "about query"       "$BASE/about?utm=test"                200 HAS_SHELL "text/html"
check "product"           "$BASE/products/42"                   200 HAS_SHELL "text/html"
check "product query"     "$BASE/products/42?ref=email"         200 HAS_SHELL "text/html"
check "nested docs"       "$BASE/docs/a/b"                      200 HAS_SHELL "text/html"
check "nested docs /"     "$BASE/docs/a/b/"                     200 HAS_SHELL "text/html"
check "real index.html"   "$BASE/index.html"                    200 HAS_SHELL "text/html"
check "favicon"           "$BASE/favicon.ico"                   200 NO_SHELL  "image/,icon"
check "robots.txt"        "$BASE/robots.txt"                    200 "User-agent" "text/plain"
check "test-asset.txt"    "$BASE/test-asset.txt"                200 "not rewritten" "text/plain"
check "missing js"        "$BASE/missing-asset.js"              404 NO_SHELL  ""
check "missing css"       "$BASE/assets/does-not-exist.css"     404 NO_SHELL  ""
check "SPA unknown route" "$BASE/this-route-does-not-exist"     200 HAS_SHELL "text/html"

if [[ -n "${ASSET_JS:-}" ]]; then
  [[ "$ASSET_JS" == http* ]] || ASSET_JS="$BASE${ASSET_JS}"
  check "hashed js" "$ASSET_JS" 200 NO_SHELL "javascript"
fi
if [[ -n "${ASSET_CSS:-}" ]]; then
  [[ "$ASSET_CSS" == http* ]] || ASSET_CSS="$BASE${ASSET_CSS}"
  check "hashed css" "$ASSET_CSS" 200 NO_SHELL "text/css"
fi

# Confirm the browser-facing URL is not redirected away from the deep link
redir="$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/about")"
echo "Redirect check /about: $redir  (expect 200 and empty redirect_url)"
if [[ "$redir" != 200\  && "$redir" != 200 ]]; then
  # 200 with empty location is pass; 301/302 is fail
  code="${redir%% *}"
  if [[ "$code" == 301 || "$code" == 302 || "$code" == 307 || "$code" == 308 ]]; then
    echo "FAIL  /about was redirected (should be a rewrite, not a redirect)"
    failures=$((failures + 1))
  fi
fi

echo
if [[ $failures -eq 0 ]]; then
  echo "All checks passed."
  exit 0
fi
echo "$failures check(s) failed."
exit 1
