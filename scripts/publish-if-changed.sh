#!/usr/bin/env bash
# Publish an npm workspace only when its packed CONTENT differs from the
# latest published version. Library versions are a signal to consumers;
# republishing identical bits under a new number is noise (Dependabot PRs,
# npm-outdated nags) — so we compare content, not commits.
#
# The version field is excluded from the comparison: it is stamped at publish
# time (0.1.<run>) and would otherwise make every tarball look "changed".
#
# Usage: scripts/publish-if-changed.sh <package-name> <version-to-publish>
set -euo pipefail

PKG="$1"
VERSION="$2"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

content_hash() {
  (
    cd "$1"
    {
      find . -type f ! -name package.json -print0 | sort -z | xargs -0 -r shasum -a 256
      node -e 'const p=require("./package.json");delete p.version;console.log(JSON.stringify(p))'
    } | shasum -a 256 | cut -d" " -f1
  )
}

mkdir -p "$WORK/local" "$WORK/remote"

LOCAL_TGZ=$(npm pack -w "$PKG" --pack-destination "$WORK" --silent | tail -1)
tar xzf "$WORK/$(basename "$LOCAL_TGZ")" -C "$WORK/local"
LOCAL_HASH=$(content_hash "$WORK/local/package")

REMOTE_HASH="(none published)"
if REMOTE_TGZ=$(cd "$WORK" && npm pack "$PKG@latest" --silent 2>/dev/null | tail -1); then
  tar xzf "$WORK/$REMOTE_TGZ" -C "$WORK/remote"
  REMOTE_HASH=$(content_hash "$WORK/remote/package")
fi

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
  echo "SKIP    $PKG — content identical to latest published ($LOCAL_HASH)"
else
  echo "PUBLISH $PKG@$VERSION — content differs (local ${LOCAL_HASH:0:12}… vs published ${REMOTE_HASH:0:12}…)"
  npm version --no-git-tag-version "$VERSION" -w "$PKG"
  npm publish -w "$PKG"
fi
