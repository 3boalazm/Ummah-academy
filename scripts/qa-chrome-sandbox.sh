#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Builds a QA browser inside a container that has no Chrome, no apt and no
# access to the usual browser CDNs — only the npm registry.
#
#   npm : @sparticuz/chromium
#          bin/chromium.br   -> the Chromium binary (brotli-compressed)
#          bin/al2023.tar.br -> the Amazon Linux 2023 shared libraries it
#                               needs, *including* the real NSPR and NSS
#                               (libnspr4, libplc4, libplds4, libnss3,
#                               libnssutil3, libsoftokn3, libfreebl3…)
#
# Both come out of the one package, so no GitHub clone, no source build and no
# hand-written NSS stubs are involved. Everything lands in $UA_CHROME_DIR
# (default /tmp/ua-chrome, outside the repo so nothing large is committed) and
# the script is idempotent: run it again and it only rebuilds what is missing.
#
# Output (what the QA suites want):
#   CHROME_PATH=$UA_CHROME_DIR/chrome   <- a wrapper that sets LD_LIBRARY_PATH
#
# Usage:
#   bash scripts/qa-chrome-sandbox.sh
#   UA_CHROME_DIR=/somewhere bash scripts/qa-chrome-sandbox.sh
#   CHROME_PATH=$UA_CHROME_DIR/chrome npm run qa:browser
#
# Note: `chrome --dump-dom` never exits in some sandboxes (no /dev/shm, no
# fontconfig cache). The smoke test is therefore the `canary` suite, which
# launches the browser the same way puppeteer does — if that passes, the
# browser is usable.
# ---------------------------------------------------------------------------
set -euo pipefail

WORK="${UA_CHROME_DIR:-/tmp/ua-chrome}"
log() { printf '\033[2m·\033[0m %s\n' "$*" >&2; }
mkdir -p "$WORK"

# ---------------------------------------------------------------- the package
# Keep it outside the repository's node_modules: the run must not depend on the
# project's lockfile, and ~70 MB of browser must not be committed.
if [ ! -f "$WORK/pkg/package/bin/chromium.br" ]; then
  log "fetching @sparticuz/chromium from the npm registry"
  rm -rf "$WORK/pkg"
  mkdir -p "$WORK/pkg"
  ( cd "$WORK/pkg" && npm pack @sparticuz/chromium --silent >/dev/null )
  tar xzf "$WORK/pkg"/*.tgz -C "$WORK/pkg"
fi

# ---------------------------------------------------------------- Chromium
if [ ! -x "$WORK/chromium" ]; then
  log "decompressing the Chromium binary"
  node -e "
    const fs = require('fs'), zlib = require('zlib');
    const out = zlib.brotliDecompressSync(fs.readFileSync('$WORK/pkg/package/bin/chromium.br'));
    fs.writeFileSync('$WORK/chromium', out, { mode: 0o755 });
  "
fi

# ---------------------------------------------------------------- NSPR + NSS
if [ ! -f "$WORK/libs/lib/libnss3.so" ] || [ ! -f "$WORK/libs/lib/libplc4.so" ]; then
  log "unpacking the Amazon Linux 2023 libraries (real NSPR + NSS)"
  rm -rf "$WORK/libs"
  mkdir -p "$WORK/libs"
  node -e "
    const fs = require('fs'), zlib = require('zlib');
    fs.writeFileSync('$WORK/libs.tar', zlib.brotliDecompressSync(fs.readFileSync('$WORK/pkg/package/bin/al2023.tar.br')));
  "
  tar xf "$WORK/libs.tar" -C "$WORK/libs"
  rm -f "$WORK/libs.tar"
fi

# ---------------------------------------------------------------- wrapper
# LD_LIBRARY_PATH has to be set on every launch, so CHROME_PATH points at this
# wrapper rather than at the Chromium binary itself. Anything the caller had is
# kept at the end of the path.
cat > "$WORK/chrome" <<EOF
#!/bin/sh
export LD_LIBRARY_PATH="$WORK/libs/lib\${LD_LIBRARY_PATH:+:\$LD_LIBRARY_PATH}"
exec "$WORK/chromium" "\$@"
EOF
chmod +x "$WORK/chrome"

# ---------------------------------------------------------------- smoke test
# canary is the smallest suite (it injects ten known bugs into a couple of
# pages and expects every check to report them), and it exercises the same
# launch path as every other suite.
if [ "${UA_CHROME_SKIP_SMOKE:-0}" != "1" ]; then
  log "smoke test: qa/run.mjs canary"
  ( cd "$(dirname "$0")/.." && [ -d dist ] || ( echo "❌ run \`npm run build\` first" >&2; exit 1 ) )
  ( cd "$(dirname "$0")/.." && CHROME_PATH="$WORK/chrome" node qa/run.mjs canary 2>&1 | tail -3 )
fi

echo "✓ QA browser ready"
echo "  CHROME_PATH=$WORK/chrome"
echo
echo "  CHROME_PATH=$WORK/chrome npm run qa:browser"
