#!/bin/sh
set -e
rm -rf "$WORKDDIR"
docker rm $(docker container ls -a -q) || echo "We know about the running container..."
docker image rm $(docker image ls -q) || echo "We know about the running container. But we freed space!"