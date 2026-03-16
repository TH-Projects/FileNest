#!/usr/bin/env bash
set -euo pipefail

SERVICES=("Admin" "Broker" "ServerFastify" "MetaDBServer")
PASS=0
FAIL=0
FAILED_SERVICES=()

GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

ROOT="$(cd "$(dirname "$0")" && pwd)"

for SERVICE in "${SERVICES[@]}"; do
    echo ""
    echo -e "${BOLD}══════════════════════════════════════════"
    echo -e "  $SERVICE"
    echo -e "══════════════════════════════════════════${RESET}"

    if npm test --prefix "$ROOT/$SERVICE" 2>&1; then
        PASS=$((PASS + 1))
    else
        FAIL=$((FAIL + 1))
        FAILED_SERVICES+=("$SERVICE")
    fi
done

echo ""
echo -e "${BOLD}══════════════════════════════════════════"
echo -e "  Results"
echo -e "══════════════════════════════════════════${RESET}"
echo -e "  ${GREEN}Passed: $PASS${RESET}"

if [ $FAIL -gt 0 ]; then
    echo -e "  ${RED}Failed: $FAIL (${FAILED_SERVICES[*]})${RESET}"
    echo ""
    exit 1
else
    echo -e "  All services passed."
    echo ""
fi
