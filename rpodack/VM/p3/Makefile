CLUSTER_NAME := dockercluster
ARGO_NAMESPACE := argo

.PHONY: setup create install-argo delete shell info

# ✅ Full setup: k3d + cluster + Argo
setup: create install-argo
	@echo "🌟 Setup complete!"
	@echo "👉 Access Argo UI:"
	@echo "kubectl -n $(ARGO_NAMESPACE) port-forward svc/argo-server 2746:2746"
	@echo "Then open http://localhost:2746 in your browser"

# Install k3d if not found
check-k3d:
	@if ! command -v k3d >/dev/null 2>&1; then \
		echo "🔧 k3d not found. Installing..."; \
		curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash; \
	else \
		echo "✅ k3d is already installed"; \
	fi

# Create a K3s cluster using k3d
create: check-k3d
	@echo "🚀 Creating K3s cluster: $(CLUSTER_NAME)"
	-k3d cluster create $(CLUSTER_NAME) --agents 1 || true

# Deploy Argo Workflows
install-argo:
	@echo "🌟 Installing Argo Workflows in namespace $(ARGO_NAMESPACE)"
	-kubectl create namespace $(ARGO_NAMESPACE) || true
	-kubectl apply -n $(ARGO_NAMESPACE) -f https://raw.githubusercontent.com/argoproj/argo-workflows/stable/manifests/install.yaml

# Delete cluster
delete:
	@echo "🧹 Deleting K3s cluster: $(CLUSTER_NAME)"
	-k3d cluster delete $(CLUSTER_NAME)

# Open a shell in the K3s server container
shell:
	@echo "🔗 Opening shell to K3s server container"
	docker exec -it k3d-$(CLUSTER_NAME)-server-0 sh

# Cluster info
info:
	@echo "ℹ Cluster nodes:"
	k3d cluster list
	kubectl get nodes -o wide