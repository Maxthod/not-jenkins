#!/bin/sh
set -e
cd
rm -rf "$WORKDDIR"
git clone "$REPO_URL" -b develop "$WORKDDIR"
