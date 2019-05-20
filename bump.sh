#!/bin/bash 

docker build -t huguesmcd/not-jenkins:"$VERSION" -f docker/development.Dockerfile .

docker push huguesmcd/not-jenkins:"$VERSION"

docker service update --image huguesmcd/not-jenkins:$VERSION not_jenkins