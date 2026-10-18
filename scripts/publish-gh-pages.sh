#!/usr/bin/env bash
# Rebuild and force-push dist/ to origin/gh-pages (root = site).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build
touch dist/.nojekyll
cp dist/index.html dist/404.html

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git clone --depth 1 --branch gh-pages "https://github.com/duragizer80/kierston-workout-app.git" "$TMP/site" 2>/dev/null \
  || git clone --depth 1 "https://github.com/duragizer80/kierston-workout-app.git" "$TMP/site" && (
       cd "$TMP/site" && git checkout --orphan gh-pages && git rm -rf . >/dev/null 2>&1 || true
     )

rm -rf "$TMP/site"/*
cp -a dist/. "$TMP/site/"
cd "$TMP/site"
git add -A
git -c user.email="cursoragent@cursor.com" -c user.name="Cursor Agent" \
  commit -m "Publish static site for GitHub Pages" || true
git push -u origin gh-pages --force
echo "Pushed gh-pages. Pages UI: Source=Deploy from a branch, Branch=gh-pages, Folder=/ (root)"
