#!/bin/bash
set -e
cd ~/not-jenkins
docker build -t "$IMAGE_NAME" .