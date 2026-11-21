# -------------------------------
# Variables
# -------------------------------
CLUSTER_NAME := dockercluster
ARGO_NAMESPACE := argocd
DEV_NAMESPACE := dev
ARGO_PORT := 8080
APP_PORT := 8888
K3D := k3d
ARGOCD := argocd
KUBECTL := kubectl

# Paths to your k8s YAMLs
DEV_DEPLOYMENT := confs/deployment.yaml

# -------------------------------
# Phony targets
# -------------------------------
.PHONY: all setup create check-k3d create-namespaces install-argo deploy-app delete shell info \
	port-forward port-forward-app echo-password

all: setup

# -------------------------------
# Full setup
# -------------------------------
setup: check-k3d create create-namespaces install-argo deploy-app
	@echo "🌟 Setup complete!"
	@echo "👉 Argo UI: $(KUBECTL) -n $(ARGO_NAMESPACE) port-forward svc/argocd-server $(ARGO_PORT):443"
	@echo "👉 App: $(KUBECTL) -n $(DEV_NAMESPACE) port-forward svc/wil-playground $(APP_PORT):8888"

# -------------------------------
# Check k3d installation
# -------------------------------
check-k3d:
	@if ! command -v $(K3D) >/dev/null 2>&1; then \
		echo "🔧 k3d not found. Installing..."; \
		curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash; \
	else \
		echo "✅ k3d already installed"; \
	fi

	@if ! command -v $(ARGOCD) >/dev/null 2>&1; then \
		echo "🔧 argocd CLI not found. Installing..."; \
		curl -sSL -o argocd \
		https://github.com/argoproj/argo-cd/releases/download/v2.7.12/argocd-linux-amd64; \
		chmod +x argocd; \
		sudo mv argocd /usr/local/bin/; \
	else \
		echo "✅ argocd CLI already installed"; \
	fi

# -------------------------------
# Create K3s cluster
# -------------------------------
create: check-k3d
	@echo "🚀 Creating K3s cluster: $(CLUSTER_NAME)"
	-$(K3D) cluster create $(CLUSTER_NAME) \
		--agents 1 \
		-p "30007:30007@server:0" \
		|| true

# -------------------------------
# Create Namespaces (idempotent)
# -------------------------------
create-namespaces:
	@echo "📂 Creating namespaces..."
	$(KUBECTL) create namespace $(ARGO_NAMESPACE) --dry-run=client -o yaml | $(KUBECTL) apply -f -
	$(KUBECTL) create namespace $(DEV_NAMESPACE) --dry-run=client -o yaml | $(KUBECTL) apply -f -

# -------------------------------
# Install ArgoCD
# -------------------------------
install-argo:
	@echo "🌟 Installing Argo CD in namespace $(ARGO_NAMESPACE)"
	$(KUBECTL) apply -n $(ARGO_NAMESPACE) -f \
	https://raw.githubusercontent.com/argoproj/argo-cd/v2.7.12/manifests/install.yaml

# -------------------------------
# Deploy your app
# -------------------------------
deploy-app:
	@echo "🚀 Deploying app to namespace $(DEV_NAMESPACE)"
	$(KUBECTL) apply -f $(DEV_DEPLOYMENT) -n $(DEV_NAMESPACE)

# -------------------------------
# Delete cluster
# -------------------------------
delete:
	@echo "🧹 Deleting K3s cluster: $(CLUSTER_NAME)"
	-$(K3D) cluster delete $(CLUSTER_NAME)

# -------------------------------
# Shell into K3s server container
# -------------------------------
shell:
	@echo "🔗 Opening shell to K3s server container"
	docker exec -it k3d-$(CLUSTER_NAME)-server-0 sh

# -------------------------------
# Cluster info
# -------------------------------
info:
	@echo "ℹ Cluster nodes:"
	$(K3D) cluster list
	$(KUBECTL) get nodes -o wide
	$(KUBECTL) get pods -n $(ARGO_NAMESPACE) -w

# -------------------------------
# Port forwarding
# -------------------------------
port-forward:
	$(KUBECTL) -n $(ARGO_NAMESPACE) port-forward svc/argocd-server $(ARGO_PORT):443

port-forward-app:
	$(KUBECTL) -n $(DEV_NAMESPACE) port-forward svc/wil-playground $(APP_PORT):8888

# -------------------------------
# Show ArgoCD admin password
# -------------------------------
echo-password:
	$(KUBECTL) -n $(ARGO_NAMESPACE) get secret argocd-initial-admin-secret \
	-o jsonpath="{.data.password}" | base64 -d
	@echo

# -------------------------------
# provision Github repo
# -------------------------------
argocd-setup:
	argocd login localhost:$(ARGO_PORT) \
	  --username admin \
	  --password $$(kubectl -n argocd get secret argocd-initial-admin-secret \
	     -o jsonpath="{.data.password}" | base64 -d) \
	  --insecure \
	  --grpc-web

	argocd repo add https://github.com/Robin-Lenz/rpodackIoT.git \
	  --upsert

	argocd app create dev-app \
	  --repo https://github.com/Robin-Lenz/rpodackIoT.git \
	  --path . \
	  --dest-server https://kubernetes.default.svc \
	  --dest-namespace dev \
	  --sync-policy automated \
	  --auto-prune \
	  --self-heal \
	  --upsert

init-sync:
	argocd app sync dev-app
