#!/bin/bash
# Part 1 Verification Script
# Tests all requirements for Part 1: K3s and Vagrant

set -uo pipefail  # Removed -e to allow script to continue through arithmetic operations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test counter
test_count=0
failed_tests=()

# Test functions
test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++)) || true  # || true prevents exit on arithmetic expansion
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

# Check if we're in the right directory
if [ ! -f "Vagrantfile" ]; then
    echo "Error: Must be run from p1 directory (where Vagrantfile is located)"
    exit 1
fi

echo "=========================================="
echo "Part 1 Verification Tests"
echo "=========================================="
echo ""

# 1. Check if VMs are running
test_info "Checking if VMs are running..."
if vagrant status | grep -q "running"; then
    test_pass "VMs are running"
else
    test_fail "VMs are not running. Run 'vagrant up' first."
    echo "  Exiting early. Start VMs with: vagrant up"
    exit 1
fi

echo ""
test_info "Testing SSH connectivity and basic configuration..."
echo ""

# 2. Test SSH to rpodackS
test_info "Testing SSH connection to rpodackS..."
if vagrant ssh rpodackS -c "echo 'SSH test'" &>/dev/null; then
    test_pass "SSH connection to rpodackS works"
else
    test_fail "SSH connection to rpodackS failed"
fi

# 3. Test SSH to rpodackSW
test_info "Testing SSH connection to rpodackSW..."
if vagrant ssh rpodackSW -c "echo 'SSH test'" &>/dev/null; then
    test_pass "SSH connection to rpodackSW works"
else
    test_fail "SSH connection to rpodackSW failed"
fi

# 4. Test hostname on rpodackS
test_info "Testing hostname on rpodackS..."
HOSTNAME_S=$(vagrant ssh rpodackS -c "hostname" 2>/dev/null | tr -d '\r\n')
if [ "$HOSTNAME_S" = "rpodackS" ]; then
    test_pass "Hostname on rpodackS is correct: $HOSTNAME_S"
else
    test_fail "Hostname on rpodackS is incorrect. Expected 'rpodackS', got '$HOSTNAME_S'"
fi

# 5. Test hostname on rpodackSW
test_info "Testing hostname on rpodackSW..."
HOSTNAME_SW=$(vagrant ssh rpodackSW -c "hostname" 2>/dev/null | tr -d '\r\n')
if [ "$HOSTNAME_SW" = "rpodackSW" ]; then
    test_pass "Hostname on rpodackSW is correct: $HOSTNAME_SW"
else
    test_fail "Hostname on rpodackSW is incorrect. Expected 'rpodackSW', got '$HOSTNAME_SW'"
fi

echo ""
test_info "Testing network configuration..."
echo ""

# 6. Test eth1 interface on rpodackS
test_info "Testing eth1 interface on rpodackS..."
if vagrant ssh rpodackS -c "ip a show eth1" &>/dev/null; then
    IP_S=$(vagrant ssh rpodackS -c "ip a show eth1 | grep 'inet ' | awk '{print \$2}' | cut -d/ -f1" 2>/dev/null | tr -d '\r\n')
    if [ "$IP_S" = "192.168.56.110" ]; then
        test_pass "eth1 interface on rpodackS has correct IP: $IP_S"
    else
        test_fail "eth1 interface on rpodackS has wrong IP. Expected '192.168.56.110', got '$IP_S'"
    fi
else
    test_fail "eth1 interface not found on rpodackS"
fi

# 7. Test eth1 interface on rpodackSW
test_info "Testing eth1 interface on rpodackSW..."
if vagrant ssh rpodackSW -c "ip a show eth1" &>/dev/null; then
    IP_SW=$(vagrant ssh rpodackSW -c "ip a show eth1 | grep 'inet ' | awk '{print \$2}' | cut -d/ -f1" 2>/dev/null | tr -d '\r\n')
    if [ "$IP_SW" = "192.168.56.111" ]; then
        test_pass "eth1 interface on rpodackSW has correct IP: $IP_SW"
    else
        test_fail "eth1 interface on rpodackSW has wrong IP. Expected '192.168.56.111', got '$IP_SW'"
    fi
else
    test_fail "eth1 interface not found on rpodackSW"
fi

echo ""
test_info "Testing K3s installation..."
echo ""

# 8. Test K3s server is running on rpodackS
test_info "Testing K3s server on rpodackS..."
if vagrant ssh rpodackS -c "systemctl is-active k3s 2>/dev/null || pgrep -x k3s > /dev/null" &>/dev/null; then
    test_pass "K3s server is running on rpodackS"
else
    test_fail "K3s server is not running on rpodackS"
fi

# 9. Test K3s agent is running on rpodackSW
test_info "Testing K3s agent on rpodackSW..."
if vagrant ssh rpodackSW -c "systemctl is-active k3s-agent 2>/dev/null || pgrep -x k3s-agent > /dev/null || pgrep -f 'k3s agent' > /dev/null" &>/dev/null; then
    test_pass "K3s agent is running on rpodackSW"
else
    test_fail "K3s agent is not running on rpodackSW"
fi

# 10. Test kubectl is installed on rpodackS
test_info "Testing kubectl installation on rpodackS..."
if vagrant ssh rpodackS -c "which kubectl || which k3s kubectl" &>/dev/null; then
    test_pass "kubectl is installed on rpodackS"
else
    test_fail "kubectl is not installed on rpodackS"
fi

# 11. Test kubectl can connect to cluster
test_info "Testing kubectl cluster connectivity..."
if vagrant ssh rpodackS -c "kubectl get nodes --kubeconfig=/etc/rancher/k3s/k3s.yaml 2>/dev/null || k3s kubectl get nodes 2>/dev/null" &>/dev/null; then
    test_pass "kubectl can connect to cluster"
else
    test_fail "kubectl cannot connect to cluster"
fi

# 12. Test both nodes are in the cluster
test_info "Testing cluster nodes..."
NODES=$(vagrant ssh rpodackS -c "kubectl get nodes --no-headers --kubeconfig=/etc/rancher/k3s/k3s.yaml 2>/dev/null || k3s kubectl get nodes --no-headers 2>/dev/null" 2>/dev/null | wc -l | tr -d ' \r\n')
if [ "$NODES" -ge 2 ]; then
    test_pass "Cluster has at least 2 nodes (found $NODES)"
else
    test_fail "Cluster does not have 2 nodes (found $NODES)"
fi

# 13. Test node names match hostnames
test_info "Testing node names match hostnames..."
NODE_NAMES=$(vagrant ssh rpodackS -c "kubectl get nodes --no-headers -o custom-columns=NAME:.metadata.name --kubeconfig=/etc/rancher/k3s/k3s.yaml 2>/dev/null || k3s kubectl get nodes --no-headers -o custom-columns=NAME:.metadata.name 2>/dev/null" 2>/dev/null | tr '\r\n' ' ')
if echo "$NODE_NAMES" | grep -q "rpodackS" && echo "$NODE_NAMES" | grep -q "rpodackSW"; then
    test_pass "Both nodes (rpodackS and rpodackSW) are in the cluster"
else
    test_fail "Node names don't match expected hostnames. Found: $NODE_NAMES"
fi

# 14. Test nodes are Ready
test_info "Testing nodes status..."
READY_NODES=$(vagrant ssh rpodackS -c "kubectl get nodes --no-headers --kubeconfig=/etc/rancher/k3s/k3s.yaml 2>/dev/null | grep -c Ready || k3s kubectl get nodes --no-headers 2>/dev/null | grep -c Ready" 2>/dev/null | tr -d ' \r\n')
if [ "$READY_NODES" -ge 2 ]; then
    test_pass "At least 2 nodes are in Ready state (found $READY_NODES)"
else
    test_fail "Not all nodes are Ready (found $READY_NODES Ready nodes)"
fi

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

