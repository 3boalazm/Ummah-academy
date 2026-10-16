#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Builds a QA browser inside a container that has no Chrome, no apt and no
# access to the usual browser CDNs — only the npm registry and github.com.
#
#   npm  : @sparticuz/chromium            -> the Chromium binary
#   github: mozilla/nspr + mozilla/nss    -> the shared libraries it needs
#
# Everything lands in $UA_CHROME_DIR (default /tmp/ua-chrome, i.e. outside the
# repo, so nothing large is committed) and the script is idempotent: run it
# again and it only rebuilds what is missing.
#
# Output (what the QA suites want):
#   CHROME_PATH=$UA_CHROME_DIR/chrome   <- a wrapper that sets LD_LIBRARY_PATH
#
# Usage:
#   bash scripts/qa-chrome-sandbox.sh
#   UA_CHROME_DIR=/somewhere UA_CHROME_JOBS=8 bash scripts/qa-chrome-sandbox.sh
# ---------------------------------------------------------------------------
set -euo pipefail

WORK="${UA_CHROME_DIR:-/tmp/ua-chrome}"
JOBS="${UA_CHROME_JOBS:-$(nproc 2>/dev/null || echo 4)}"
NSPR_SHA=9b57e4e5b8f5c2bcdbbd7fd0c4eb8ce1f0ec1b4d   # NSPR_4_36_RTM-ish head, pinned for reproducibility
NSS_SHA=NSS_3_107_RTM

log() { printf '\033[2m·\033[0m %s\n' "$*" >&2; }
mkdir -p "$WORK"

# ---------------------------------------------------------------- Chromium binary
# @sparticuz/chromium extracts the binary to /tmp/chromium. That path is not
# guaranteed to survive, so the location is remembered in $WORK/chromium.path
# and re-fetched whenever the recorded binary is missing.
CHROMIUM="$(cat "$WORK/chromium.path" 2>/dev/null || true)"
if [ ! -x "${CHROMIUM:-/nonexistent}" ]; then
  log "fetching the Chromium binary (@sparticuz/chromium, an npm download)"
  npm i --prefix "$WORK/npm" --no-audit --no-fund --silent @sparticuz/chromium
  CHROMIUM="$(node --input-type=module -e "
    import('$WORK/npm/node_modules/@sparticuz/chromium/build/index.js').then(async (m) => {
      process.stdout.write(await m.default.executablePath());
    });
  ")"
  printf '%s' "$CHROMIUM" > "$WORK/chromium.path"
fi
echo "$CHROMIUM" | grep -q '^/' || { echo "❌ could not resolve the Chromium binary" >&2; exit 1; }

# ---------------------------------------------------------------- NSPR + NSS
# Chromium links against libnspr4 / libnss3 / libnssutil3 / libsmime3 / libssl3.
if [ ! -f "$WORK/nspr/dist/lib/libnspr4.so" ]; then
  log "cloning NSPR"
  [ -d "$WORK/nspr/.git" ] || git clone --depth 1 --branch "$NSPR_SHA" \
    https://github.com/mozilla/nspr "$WORK/nspr" 2>/dev/null || \
    git clone --depth 1 https://github.com/mozilla/nspr "$WORK/nspr"
fi
if [ ! -f "$WORK/nspr/dist/lib/libnspr4.so" ]; then
  log "building NSPR"
  ( cd "$WORK/nspr" && ./configure --disable-debug --enable-optimize --prefix="$WORK/nspr/dist" >/dev/null && make -j"$JOBS" >/dev/null && make install >/dev/null )
fi

# NSS installs its shared libraries into the build tree, not into the source
# tree: $WORK/dist/<platform>_OBJ/lib. NSS_SHA pins the branch to a release tag
# so a source rebuild is reproducible.
NSS_LIB_DIR="$(ls -d "$WORK"/dist/*/lib 2>/dev/null | head -1 || true)"
if [ -z "${NSS_LIB_DIR:-}" ] || [ ! -f "$NSS_LIB_DIR/libnss3.so" ]; then
  [ -d "$WORK/nss/.git" ] || { log "cloning NSS (a shallow clone is ~300 MB)"; \
    git clone --depth 1 --branch "$NSS_SHA" https://github.com/mozilla/nss "$WORK/nss" 2>/dev/null || \
    git clone --depth 1 https://github.com/mozilla/nss "$WORK/nss"; }
  log "building NSS"
  ( cd "$WORK/nss"
    export NSPR_INCLUDE_DIR="$WORK/nspr/dist/include/nspr"
    export NSPR_LIB_DIR="$WORK/nspr/dist/lib"
    export BUILD_OPT=1 USE_64=1 NSS_ENABLE_WERROR=0 NSS_DISABLE_LIBPKIX=1
    # coreconf first: it builds nsinstall, which every later step shells out to
    make -C coreconf >/dev/null
    make export >/dev/null
    # coreconf cannot order the library directories on its own — build them in dependency order
    for d in util sqlite dbm freebl softoken base certdb certhigh cryptohi dev pki jar pk11wrap pkcs12 pkcs7 nss smime ssl ckfw; do
      make -C "lib/$d" all >/dev/null
    done
  )
  NSS_LIB_DIR="$(ls -d "$WORK"/dist/*/lib 2>/dev/null | head -1 || true)"
fi
[ -f "$NSS_LIB_DIR/libnss3.so" ] || { echo "❌ NSS did not build — see the output above" >&2; exit 1; }

# ---------------------------------------------------------------- wrapper
# LD_LIBRARY_PATH has to point at the freshly built NSS/NSPR on every launch, so
# CHROME_PATH points at this wrapper rather than at the Chromium binary itself.
cat > "$WORK/chrome" <<EOF
#!/bin/sh
export LD_LIBRARY_PATH="$NSS_LIB_DIR:$WORK/nspr/dist/lib\${LD_LIBRARY_PATH:+:\$LD_LIBRARY_PATH}"
exec "$CHROMIUM" "\$@"
EOF
chmod +x "$WORK/chrome"

# ---------------------------------------------------------------- smoke test
# --dump-dom on a data: URL is the smallest thing that proves the browser can
# start, render and exit. Wrapped in a timeout: a browser that hangs must fail
# loudly here instead of hanging every later suite.
SMOKE=$(timeout 120 "$WORK/chrome" --headless=new --no-sandbox --disable-gpu \
        --disable-dev-shm-usage --dump-dom 'data:text/html,<title>ok</title>' 2>/dev/null || true)
case "$SMOKE" in
  *ok*) ;;
  *) echo "❌ the browser did not start — NSS/NSPR may be incomplete (libs in $NSS_LIB_DIR)" >&2; exit 1 ;;
esac

echo "✓ QA browser ready"
echo "  CHROME_PATH=$WORK/chrome"
echo
echo "  CHROME_PATH=$WORK/chrome npm run qa:browser"
