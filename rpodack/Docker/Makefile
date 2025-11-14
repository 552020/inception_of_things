IMAGE_NAME := dev-vm
CONTAINER_NAME := devvmIMAGE_NAME := dev-vm
CONTAINER_NAME := devvm

.PHONY: build run shell clean deepclean

build:
	@echo "🚧 Building Docker image: $(IMAGE_NAME)"
	docker build -t $(IMAGE_NAME) .

run:
	@echo "🚀 Starting container: $(CONTAINER_NAME)"
	docker run -it --privileged \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v /usr/bin/docker:/usr/bin/docker \
		--name $(CONTAINER_NAME) $(IMAGE_NAME) bash

shell:
	@echo "🔗 Attaching to running container: $(CONTAINER_NAME)"
	docker exec -it $(CONTAINER_NAME) bash

clean:
	@echo "🧹 Removing dev container and image"
	-docker rm -f $(CONTAINER_NAME)
	-docker rmi -f $(IMAGE_NAME)

deepclean:
	@echo "🔥 Removing ALL Docker containers and images..."
	-docker rm -f $$(docker ps -aq) 2>/dev/null || true
	-docker rmi -f $$(docker images -aq) 2>/dev/null || true
	@echo "🧹 Pruning leftover volumes and networks"
	-docker volume prune -f
	-docker network prune -f


.PHONY: build run shell clean

build:
	@echo "🚧 Building Docker image: $(IMAGE_NAME)"
	docker build -t $(IMAGE_NAME) .

run:
	docker run -it --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    --name devvm dev-vm bash

shell:
	@echo "🔗 Attaching to running container: $(CONTAINER_NAME)"
	docker exec -it $(CONTAINER_NAME) bash

clean:
	@echo "🧹 Removing container and image"
	-docker rm -f $(CONTAINER_NAME)
	-docker rmi -f $(IMAGE_NAME)
