#!/bin/bash
# Bonus verification script: the lab of Part 3, with a local GitLab as the repository.
# Same style as p1/scripts/test_part1.sh: one PASS or FAIL per check, a total at the
# end, exit status 1 when anything failed. Run it with `make test` from the bonus folder,
# after `make setup`. Nothing is changed and nothing is pushed.

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

CLUSTER="bonus"
KUBECTL="kubectl --context k3d-${CLUSTER}"
GITLAB_URL="http://localhost:8929"
APP_URL="http://localhost:8888"
REPO="rpodackIoT"
EXPECTED_REPO_URL="http://gitlab.gitlab.svc.cluster.local:8929/root/${REPO}.git"
# The first sync of Argo CD can come minutes after setup (it pulls its own images first)
SYNC_TIMEOUT=300

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
echo "Bonus Verification Tests"
echo "=========================================="
echo ""

# 1. The cluster of the bonus is there and answers
test_info "Checking the cluster $CLUSTER..."
if $KUBECTL get nodes >/dev/null 2>&1; then
    test_pass "Cluster k3d-$CLUSTER answers"
else
    test_fail "Cluster k3d-$CLUSTER does not answer. Run 'make setup' first."
    echo "  Exiting early."
    exit 1
fi

# 2. Nodes are Ready
test_info "Testing that the node is Ready..."
if [ "$($KUBECTL get nodes --no-headers 2>/dev/null | grep -cw Ready)" -ge 1 ]; then
    test_pass "The node is Ready"
else
    test_fail "No node is Ready"
fi

echo ""
test_info "Testing namespaces..."
echo ""

# 3. Namespaces
for ns in argocd dev gitlab; do
    if $KUBECTL get namespace "$ns" >/dev/null 2>&1; then
        test_pass "Namespace $ns exists"
    else
        test_fail "Namespace $ns is missing"
    fi
done

echo ""
test_info "Testing Argo CD..."
echo ""

# 4. Argo CD pods are Ready
if retry 120 $KUBECTL -n argocd wait --for=condition=Ready pod --all --timeout=5s; then
    test_pass "All pods in argocd are Ready"
else
    test_fail "Not all pods in argocd are Ready"
fi

echo ""
test_info "Testing GitLab..."
echo ""

# 5. GitLab pod is Ready
if retry 120 $KUBECTL -n gitlab wait --for=condition=Ready pod -l app=gitlab --timeout=5s; then
    test_pass "The GitLab pod in namespace gitlab is Ready"
else
    test_fail "The GitLab pod in namespace gitlab is not Ready"
fi

# 6. GitLab answers on the host
CODE=$(curl -s -o /dev/null -m 10 -w '%{http_code}' "$GITLAB_URL/users/sign_in" 2>/dev/null)
if [ "$CODE" = "200" ]; then
    test_pass "GitLab answers at $GITLAB_URL (sign-in page, HTTP $CODE)"
else
    test_fail "GitLab does not answer at $GITLAB_URL (HTTP '$CODE')"
fi

# 7. The repository exists on GitLab. Read with the password of root, which comes from
#    its Secret; it is handed over by a helper and never printed.
GITLAB_PASS=$($KUBECTL -n gitlab get secret gitlab-root -o jsonpath='{.data.password}' 2>/dev/null | base64 -d)
if [ -z "$GITLAB_PASS" ]; then
    test_fail "The Secret gitlab-root with the password of root is missing"
else
    export GITLAB_PASS GIT_TERMINAL_PROMPT=0
    HEADS=$(git -c credential.helper= \
        -c credential.helper='!f() { echo username=root; echo "password=$GITLAB_PASS"; }; f' \
        ls-remote --heads "$GITLAB_URL/root/$REPO.git" 2>/dev/null)
    if echo "$HEADS" | grep -q 'refs/heads/main'; then
        test_pass "The repository root/$REPO exists on GitLab and has a branch main"
    else
        test_fail "The repository root/$REPO is not on GitLab, or has no branch main"
    fi
fi

echo ""
test_info "Testing that Argo CD follows the local GitLab (up to ${SYNC_TIMEOUT} s for the first sync)..."
echo ""

# 8. The Application points at the GitLab Service inside the cluster
REPO_URL=$($KUBECTL -n argocd get application dev-app -o jsonpath='{.spec.source.repoURL}' 2>/dev/null)
if [ "$REPO_URL" = "$EXPECTED_REPO_URL" ]; then
    test_pass "dev-app follows the local GitLab: $REPO_URL"
else
    test_fail "dev-app has the wrong repository. Expected '$EXPECTED_REPO_URL', got '$REPO_URL'"
fi

# 9. Synced and Healthy
if retry "$SYNC_TIMEOUT" app_is_synced_healthy; then
    test_pass "dev-app is Synced and Healthy"
else
    STATE=$($KUBECTL -n argocd get application dev-app -o jsonpath='{.status.sync.status} {.status.health.status}' 2>/dev/null)
    test_fail "dev-app is not Synced and Healthy (state: '$STATE')"
fi

echo ""
test_info "Testing the application in dev..."
echo ""

# 10. The pod in dev runs
if retry 120 $KUBECTL -n dev wait --for=condition=Ready pod -l app=wil-playground --timeout=5s; then
    test_pass "The pod wil-playground in namespace dev is Running and Ready"
else
    test_fail "The pod wil-playground in namespace dev is not Ready"
fi

# 11. The application answers on port 8888
if retry 60 app_answers_ok; then
    test_pass "curl $APP_URL answers: $(curl -s -m 5 "$APP_URL")"
else
    test_fail "curl $APP_URL does not answer with status ok"
fi

# 12. The version it reports is the tag of the Deployment
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
