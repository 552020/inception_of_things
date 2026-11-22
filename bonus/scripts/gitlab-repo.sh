#!/bin/bash
# Creates a public project owned by root on the local GitLab and pushes a first commit.
# Usage: gitlab-repo.sh <gitlab url> <project name> <directory to push>
# Does nothing when the project already exists.
set -euo pipefail

URL=$1
REPO=$2
SRC=$3

PASS=$(kubectl -n gitlab get secret gitlab-root -o jsonpath='{.data.password}' | base64 -d)

# Public projects are readable without login: that is how Argo CD will read this one.
if curl -sf -o /dev/null "$URL/api/v4/projects/root%2F$REPO"; then
    echo "Project root/$REPO already exists"
    exit 0
fi

# The API wants a token, not the password. GitLab's own console, inside the pod,
# gives root an access token valid for one day (documented way to script a token).
TOKEN=$(openssl rand -hex 20)
echo "Creating an access token for root (the GitLab console takes about a minute)..."
kubectl -n gitlab exec deployment/gitlab -- gitlab-rails runner "
  t = User.find_by_username('root').personal_access_tokens.create(
        scopes: ['api'], name: 'bonus-setup', expires_at: 1.day.from_now)
  t.set_token('$TOKEN')
  t.save!"

curl -sSf -o /dev/null -X POST "$URL/api/v4/projects" \
    -H "PRIVATE-TOKEN: $TOKEN" \
    -d "name=$REPO" -d visibility=public
echo "Project root/$REPO created"

# First commit: the manifests of the application
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cp -r "$SRC"/. "$TMP"/
cd "$TMP"
git init -q -b main
git add .
git -c user.name=root -c user.email=root@localhost commit -q -m "wil-playground v1"
git push -q "http://root:$PASS@${URL#http://}/root/$REPO.git" main
echo "Pushed $SRC to $URL/root/$REPO"
