#!/bin/bash
 set -e
 # If not log in into Docker Up, log in.
if [ ! -f ~/.docker/config.json ] || ! grep -q "$DOCKER_REGISTRY" ~/.docker/config.json; then 
docker login --username "$DOCKER_USER" --password-stdin <<< "$DOCKER_PASSWORD" > /dev/null
fi
# Push the image on repo Docker Hub
docker push $IMAGE_NAME