start: start-development-server
stop: stop-development-server

start-development-server: build stop run logs

stop-development-server:
	docker container stop not_jenkins || true

build-development:
	docker build -t not-jenkins -f docker/development.Dockerfile .

build-production:
	docker build -t $(version) -f docker/production.Dockerfile .

deploy:
	docker push huguesmcd/not-jenkins

deploy-prod:
	docker push huguesmcd/not-jenkins:$(version)

build-and-deploy-production: build-production deploy-production


test: test2
	echo $(TOTO)


test2: 
	echo $(TOTO)

build-and-deploy: build deploy

create-service:
	docker service create --publish 2000:2000 --name not_jenkins not-jenkins


service-logs:
	docker service logs -f not_jenkins


run:
	docker container run --rm -d \
	--name not_jenkins \
	-p 2000:2000 \
	-v $(shell pwd)/src:/app/src \
	--env LOG_LEVEL=debug \
	--env PORT=2000 \
	-it not-jenkins

logs:
	docker container logs -f not_jenkins


bash:
	docker container -it not_jenkins bash
