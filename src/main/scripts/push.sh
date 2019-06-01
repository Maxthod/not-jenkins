#!/bin/bash
 set -e
if [ ! -f ~/.docker/config.json ] || ! grep -q "index.docker.io" ~/.docker/config.json; then 
docker login --username "$DOCKER_USER" --password-stdin <<< "$DOCKER_PASSWORD" > /dev/null
fi
docker push $IMAGE_NAME