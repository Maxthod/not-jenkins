#!/bin/bash
set -e
cd ~/"$WORKDDIR"
docker build -t "$IMAGE_NAME":"$IMAGE_VERSION" .