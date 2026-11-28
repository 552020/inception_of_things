#!/bin/bash
# Part 2 Verification Script
# Tests all requirements for Part 2: K3s and three simple applications
# Same style as p1/scripts/test_part1.sh: one PASS or FAIL per check, a total at the
# end, exit status 1 when anything failed. Run it with `make test` from the p2
# folder, after `make up`. Nothing is changed.

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0
test_count=0
failed_tests=()

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++)) || true
    ((test_count++)) || true
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++)) || true
    ((test_count++)) || true
    failed_tests+=("$1")
}

test_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

SERVER_IP="192.168.56.110"
# The images (nginx, http-echo) may still be downloading right after `make up`
WAIT=300

# retry <seconds> <command...>: run the command every 5 s until it succeeds or the time is up
retry() {
    local limit=$1
    shift
    local end=$(( $(date +%s) + limit ))
    while true; do
        if "$@" >/dev/null 2>&1; then
            return 0
        fi
        [ "$(date +%s)" -ge "$end" ] && return 1
        sleep 5
    done
}

# kubectl on the server (k3s has its own kubectl, and its config is readable by root)
kc() {
    vagrant ssh rpodackS -c "sudo k3s kubectl $*" 2>/dev/null
}

# What a request to the server returns, with the given Host header ("" for none)
fetch() {
    if [ -n "$1" ]; then
        curl -s -m 5 -H "Host: $1" "http://$SERVER_IP/"
    else
        curl -s -m 5 "http://$SERVER_IP/"
    fi
}

# answers <host> <text>: the page for that Host contains the text
answers() {
    fetch "$1" | grep -q "$2"
}

# Check one request: check_page <label> <host> <text>
check_page() {
    local label=$1 host=$2 text=$3
    if retry "$WAIT" answers "$host" "$text"; then
        test_pass "$label shows '$text'"
    else
        test_fail "$label does not show '$text'. Got: '$(fetch "$host" | head -c 80 | tr '\r\n' '  ')'"
    fi
}

node_ready() {
    kc "get nodes --no-headers" | grep -qw Ready
}

all_pods_running() {
    local phases
    phases=$(kc "get pods --no-headers" | awk '{print $3}')
    [ -n "$phases" ] && ! echo "$phases" | grep -qv '^Running$'
}

app2_ready_replicas() {
    [ "$(kc "get deployment app2 -o jsonpath='{.status.readyReplicas}'" | tr -d '\r\n')" = "3" ]
}

# Check if we're in the right directory
if [ ! -f "Vagrantfile" ]; then
    echo "Error: Must be run from p2 directory (where Vagrantfile is located)"
    exit 1
fi

echo "=========================================="
echo "Part 2 Verification Tests"
echo "=========================================="
echo ""

# 1. Check if the VM is running
test_info "Checking if the VM is running..."
if vagrant status rpodackS | grep -q "running"; then
    test_pass "VM rpodackS is running"
else
    test_fail "VM rpodackS is not running. Run 'make up' first."
    echo "  Exiting early. Start the VM with: make up"
    exit 1
fi

echo ""
test_info "Testing the machine..."
echo ""

# 2. SSH
if vagrant ssh rpodackS -c "echo 'SSH test'" &>/dev/null; then
    test_pass "SSH connection to rpodackS works"
else
    test_fail "SSH connection to rpodackS failed"
fi

# 3. Hostname
HOSTNAME_S=$(vagrant ssh rpodackS -c "hostname" 2>/dev/null | tr -d '\r\n')
if [ "$HOSTNAME_S" = "rpodackS" ]; then
    test_pass "Hostname on rpodackS is correct: $HOSTNAME_S"
else
    test_fail "Hostname on rpodackS is incorrect. Expected 'rpodackS', got '$HOSTNAME_S'"
fi

# 4. eth1 has the address
IP_S=$(vagrant ssh rpodackS -c "ip a show eth1 | grep 'inet ' | awk '{print \$2}' | cut -d/ -f1" 2>/dev/null | tr -d '\r\n')
if [ "$IP_S" = "$SERVER_IP" ]; then
    test_pass "eth1 interface on rpodackS has correct IP: $IP_S"
else
    test_fail "eth1 interface on rpodackS has wrong IP. Expected '$SERVER_IP', got '$IP_S'"
fi

echo ""
test_info "Testing K3s..."
echo ""

# 5. K3s server runs
if vagrant ssh rpodackS -c "systemctl is-active k3s" &>/dev/null; then
    test_pass "K3s server is running on rpodackS"
else
    test_fail "K3s server is not running on rpodackS"
fi

# 6. The node is Ready
if retry 120 node_ready; then
    test_pass "The node is Ready"
else
    test_fail "The node is not Ready"
fi

echo ""
test_info "Testing the applications (up to ${WAIT} s while images are still downloading)..."
echo ""

# 7. Three Deployments
DEPLOYMENTS=$(kc "get deployments --no-headers -o custom-columns=NAME:.metadata.name" | tr -d '\r' | sort | tr '\n' ' ')
if [ "$DEPLOYMENTS" = "app1 app2 app3 " ]; then
    test_pass "Three Deployments exist: $DEPLOYMENTS"
else
    test_fail "Expected the Deployments app1 app2 app3, found: '$DEPLOYMENTS'"
fi

# 8. app2 has three ready replicas
if retry "$WAIT" app2_ready_replicas; then
    test_pass "app2 has 3 ready replicas"
else
    test_fail "app2 does not have 3 ready replicas (ready: '$(kc "get deployment app2 -o jsonpath='{.status.readyReplicas}'" | tr -d '\r\n')')"
fi

# 9. All pods Running
if retry "$WAIT" all_pods_running; then
    test_pass "All pods are Running ($(kc "get pods --no-headers" | grep -c Running) pods)"
else
    test_fail "Not all pods are Running: $(kc "get pods --no-headers" | awk '{print $1":"$3}' | tr '\r\n' '  ')"
fi

# 10. Three Ingresses
INGRESSES=$(kc "get ingress --no-headers -o custom-columns=NAME:.metadata.name" | tr -d '\r' | sort | tr '\n' ' ')
if [ "$INGRESSES" = "app1-ingress app2-ingress app3-ingress " ]; then
    test_pass "Three Ingresses exist: $INGRESSES"
else
    test_fail "Expected the Ingresses app1-ingress app2-ingress app3-ingress, found: '$INGRESSES'"
fi

echo ""
test_info "Testing the answers of $SERVER_IP..."
echo ""

# 11. The Host header chooses the application
check_page "Host app1.com" "app1.com" "Welcome to nginx"
check_page "Host app2.com" "app2.com" "Hello from app2"
check_page "Host app3.com" "app3.com" "Hello from App3"
check_page "Another host (other.example)" "other.example" "Hello from App3"
check_page "No Host header (the bare IP)" "" "Hello from App3"

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total tests: $test_count"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed:${NC}"
    for test in "${failed_tests[@]}"; do
        echo -e "  ${RED}✗${NC} $test"
    done
    exit 1
fi
