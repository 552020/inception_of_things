#!/bin/bash
# Bonus: the change of version, end to end, with timings.
# `make v2` writes the new image tag into the GitLab repository and asks Argo CD to look;
# this script then waits until port 8888 answers with that version, does the same for v1,
# and prints how long each change took. Only the local GitLab is written to, so this is
# safe to run any time after `make setup`. Run it with `make test-switch`.

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_URL="http://localhost:8888"
# Argo CD looks at the repository every 3 minutes at most; `make sync` shortens that.
TIMEOUT=360
FAILED=0
results=()

app_version() {
    curl -s -m 5 "$APP_URL" | sed -n 's/.*"message": *"\([^"]*\)".*/\1/p'
}

# switch_to <v1|v2>: make <version>, then wait for that version on port 8888
switch_to() {
    local want=$1 start end got
    echo -e "${YELLOW}ℹ${NC} make $want (was: $(app_version))"
    start=$(date +%s)
    if ! make --no-print-directory "$want" >/dev/null 2>&1; then
        echo -e "${RED}✗${NC} make $want failed"
        results+=("make $want failed")
        FAILED=1
        return
    fi
    end=$(( start + TIMEOUT ))
    while true; do
        got=$(app_version)
        [ "$got" = "$want" ] && break
        if [ "$(date +%s)" -ge "$end" ]; then
            echo -e "${RED}✗${NC} port 8888 still serves '$got' after ${TIMEOUT} s, expected $want"
            results+=("switch to $want timed out")
            FAILED=1
            return
        fi
        sleep 2
    done
    local took=$(( $(date +%s) - start ))
    echo -e "${GREEN}✓${NC} $want is served after ${took} s"
    results+=("$want after ${took} s")
}

echo "=========================================="
echo "Bonus: change of version"
echo "=========================================="
echo ""

if [ -z "$(app_version)" ]; then
    echo -e "${RED}✗${NC} the application does not answer on $APP_URL. Run 'make setup' first."
    exit 1
fi

switch_to v2
switch_to v1

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
for r in "${results[@]}"; do
    echo "  $r"
done
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}Both changes worked! ✓${NC}"
    exit 0
else
    echo -e "${RED}A change failed.${NC}"
    exit 1
fi
