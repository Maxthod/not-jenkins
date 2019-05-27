docker service update --image "$IMAGE_NAME" "$SERVICE_NAME"
docker service update --force "$SERVICE_NAME"

#docker service update --replicas 0 "$SERVICE_NAME"
#docker service update --replicas 1 "$SERVICE_NAME"
