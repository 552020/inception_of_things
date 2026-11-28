#!/bin/bash
# Talks to the repository root/<name> on the local GitLab, with git only.
#   gitlab-repo.sh seed <gitlab url> <name> <directory>   first commit, from a directory
#   gitlab-repo.sh tag  <gitlab url> <name> <v1|v2>       change the image tag and push
# The password of root comes in the variable GITLAB_PASS (the Makefile sets it).
set -euo pipefail

ACTION=$1
URL=$2
REPO=$3
ARG=$4
REMOTE="$URL/root/$REPO.git"

: "${GITLAB_PASS:?GITLAB_PASS is not set, run this through make}"
export GITLAB_PASS
# Never stop to ask for a password: a wrong one must fail, not hang
export GIT_TERMINAL_PROMPT=0

# git with the login of root. The password is handed over by a helper that reads
# the variable, so it is neither in the URL nor in the list of processes.
git_root() {
    git -c credential.helper= \
        -c credential.helper='!f() { echo username=root; echo "password=$GITLAB_PASS"; }; f' \
        -c user.name=root -c user.email=root@localhost "$@"
}

# Work in a fresh temporary directory, removed when the script ends
TMP=$(mktemp -d)
trap '[ -d "$TMP" ] && rm -rf -- "$TMP"' EXIT

case $ACTION in
seed)
    # Done already when the branch main is there. A project without a branch
    # (a run that stopped halfway) is not done: it gets the push below.
    if git_root ls-remote --heads "$REMOTE" main 2>/dev/null | grep -q refs/heads/main; then
        echo "root/$REPO already has a branch main"
        exit 0
    fi
    cp -r "$ARG"/. "$TMP"/
    cd "$TMP"
    git init -q -b main
    git add .
    git_root commit -q -m "wil-playground v1"
    # No project yet: GitLab creates it on this first push (push to create).
    # It is created private, so Argo CD reads it with a login (make deploy-app).
    # A wrong root password shows here as "Authentication failed".
    # Right after its first start GitLab restarts its Git services once and answers
    # 502 for some seconds, although the sign-in page is already up: try for two minutes.
    for try in $(seq 1 12); do
        git_root push -q "$REMOTE" main && break
        [ "$try" -lt 12 ] || { echo "The push to $REMOTE keeps failing"; exit 1; }
        echo "GitLab is not ready for a push yet, next try in 10 seconds ($try/12)"
        sleep 10
    done
    echo "Pushed $ARG to $REMOTE"
    ;;
tag)
    git_root clone -q "$REMOTE" "$TMP/repo"
    cd "$TMP/repo"
    sed -i "s|wil42/playground:v[0-9]*|wil42/playground:$ARG|" deployment.yaml
    if git diff --quiet; then
        echo "root/$REPO is already on $ARG"
        exit 0
    fi
    git_root commit -q -am "wil-playground $ARG"
    git_root push -q origin main
    echo "root/$REPO now asks for wil42/playground:$ARG"
    ;;
*)
    echo "Usage: $0 seed|tag <gitlab url> <name> <directory|tag>"
    exit 1
    ;;
esac
