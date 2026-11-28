#!/bin/bash
# Part 3 Verification Script
# Tests all requirements for Part 3: K3d and Argo CD
# Same style as p1/scripts/test_part1.sh: one PASS or FAIL per check, a total at the
# end, exit status 1 when anything failed. Run it with `make test` from the p3
# folder, after `make setup`. Nothing is changed and nothing is pushed to GitHub.

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

CLUSTER="dockercluster"
KUBECTL="kubectl --context k3d-${CLUSTER}"
APP_URL="http://localhost:8888"
# Argo CD pulls its own images first, then looks at the repository: the first sync comes
# 3 to 4 minutes after `make setup`. Later syncs of a change take up to 3 minutes.
SYNC_TIMEOUT=360

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

app_is_synced_healthy() {
    [ "$($KUBECTL -n argocd get application dev-app -o jsonpath='{.status.sync.status} {.status.health.status}' 2>/dev/null)" = "Synced Healthy" ]
}

app_answers_ok() {
    curl -s -m 5 "$APP_URL" | grep -q '"status":"ok"'
}

# The version the application reports, e.g. v1
app_version() {
    curl -s -m 5 "$APP_URL" | sed -n 's/.*"message": *"\([^"]*\)".*/\1/p'
}

# The image tag of the Deployment in dev, e.g. v1
deployment_tag() {
    $KUBECTL -n dev get deployment wil-playground -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null | sed 's/.*://'
}

version_matches_tag() {
    local v t
    v=$(app_version)
    t=$(deployment_tag)
    [ -n "$v" ] && [ "$v" = "$t" ]
}

echo "=========================================="
echo "Part 3 Verification Tests"
echo "=========================================="
echo ""

# 1. The cluster is there and answers
test_info "Checking the cluster $CLUSTER..."
if $KUBECTL get nodes >/dev/null 2>&1; then
    test_pass "Cluster k3d-$CLUSTER answers"
else
    test_fail "Cluster k3d-$CLUSTER does not answer. Run 'make setup' first."
    echo "  Exiting early."
    exit 1
fi

# 2. Nodes are Ready (one server, one agent)
test_info "Testing that the nodes are Ready..."
READY=$($KUBECTL get nodes --no-headers 2>/dev/null | grep -cw Ready)
if [ "$READY" -ge 2 ]; then
    test_pass "Both nodes (server and agent) are Ready (found $READY)"
else
    test_fail "Expected 2 Ready nodes, found $READY"
fi

echo ""
test_info "Testing namespaces..."
echo ""

# 3. Namespaces
for ns in argocd dev; do
    if $KUBECTL get namespace "$ns" >/dev/null 2>&1; then
        test_pass "Namespace $ns exists"
    else
        test_fail "Namespace $ns is missing"
    fi
done

echo ""
test_info "Testing Argo CD (up to ${SYNC_TIMEOUT} s while it downloads its images and makes its first sync)..."
echo ""

# 4. Argo CD pods are Ready
if retry "$SYNC_TIMEOUT" $KUBECTL -n argocd wait --for=condition=Ready pod --all --timeout=5s; then
    test_pass "All pods in argocd are Ready ($($KUBECTL -n argocd get pods --no-headers | wc -l) pods)"
else
    test_fail "Not all pods in argocd are Ready"
fi

# 5. The Application dev-app exists and says where it reads from
REPO_URL=$($KUBECTL -n argocd get application dev-app -o jsonpath='{.spec.source.repoURL}' 2>/dev/null)
if [ -n "$REPO_URL" ]; then
    test_pass "Application dev-app exists, repository: $REPO_URL"
else
    test_fail "Application dev-app does not exist in namespace argocd"
fi

# 6. Synced and Healthy
if retry "$SYNC_TIMEOUT" app_is_synced_healthy; then
    test_pass "dev-app is Synced and Healthy"
else
    STATE=$($KUBECTL -n argocd get application dev-app -o jsonpath='{.status.sync.status} {.status.health.status}' 2>/dev/null)
    test_fail "dev-app is not Synced and Healthy (state: '$STATE')"
fi

echo ""
test_info "Testing the application in dev..."
echo ""

# 7. The pod in dev runs
if retry 120 $KUBECTL -n dev wait --for=condition=Ready pod -l app=wil-playground --timeout=5s; then
    test_pass "The pod wil-playground in namespace dev is Running and Ready"
else
    test_fail "The pod wil-playground in namespace dev is not Ready"
fi

# 8. Argo CD put it there, not kubectl
TRACK=$($KUBECTL -n dev get deployment wil-playground -o jsonpath='{.metadata.annotations.argocd\.argoproj\.io/tracking-id}' 2>/dev/null)
if echo "$TRACK" | grep -q '^dev-app:'; then
    test_pass "The Deployment is managed by Argo CD (tracking id $TRACK)"
else
    test_fail "The Deployment is not managed by Argo CD (tracking id: '$TRACK')"
fi

# 9. The application answers on port 8888
if retry 60 app_answers_ok; then
    test_pass "curl $APP_URL answers: $(curl -s -m 5 "$APP_URL")"
else
    test_fail "curl $APP_URL does not answer with status ok"
fi

# 10. The version it reports is the tag of the Deployment
if retry 60 version_matches_tag; then
    test_pass "The application serves $(app_version), the same as the image tag of the Deployment"
else
    test_fail "The application serves '$(app_version)' but the Deployment has the tag '$(deployment_tag)'"
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
