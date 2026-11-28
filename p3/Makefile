# -------------------------------
# Variables
# -------------------------------
CLUSTER_NAME := dockercluster
ARGO_NAMESPACE := argocd
ARGO_VERSION := v3.6.2
DEV_NAMESPACE := dev
ARGO_PORT := 8080
APP_PORT := 8888
K3D := k3d
ARGOCD := argocd
KUBECTL := kubectl

# The Argo CD Application: which repository Argo CD deploys into the namespace dev.
# confs/deployment.yaml is only the documented copy of what that repository holds;
# nothing here applies it, Argo CD does the deploying.
ARGO_APPLICATION := confs/application.yaml

# -------------------------------
# Phony targets
# -------------------------------
.PHONY: all setup create check-k3d create-namespaces install-argo deploy-app delete shell info \
	port-forward echo-password argocd-setup init-sync test

all: setup

# -------------------------------
# Full setup
# -------------------------------
setup: check-k3d create create-namespaces install-argo deploy-app
	@echo "🌟 Setup complete!"
	@echo "👉 Argo UI: make port-forward, then https://localhost:$(ARGO_PORT) (password: make echo-password)"
	@echo "👉 App, once Argo CD has synced it: curl http://localhost:$(APP_PORT)/"

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
		https://github.com/argoproj/argo-cd/releases/download/$(ARGO_VERSION)/argocd-linux-amd64; \
		chmod +x argocd; \
		sudo mv argocd /usr/local/bin/; \
	else \
		echo "✅ argocd CLI already installed"; \
	fi

# -------------------------------
# Create K3s cluster
# -------------------------------
create: check-k3d
	@# Host port 8888 goes to NodePort 30007 of the app, so "curl localhost:8888" works
	@# as the subject shows it. A real error from k3d stops make; an existing cluster does not.
	@if $(K3D) cluster list $(CLUSTER_NAME) >/dev/null 2>&1; then \
		echo "✅ K3s cluster $(CLUSTER_NAME) already exists"; \
	else \
		echo "🚀 Creating K3s cluster: $(CLUSTER_NAME)"; \
		$(K3D) cluster create $(CLUSTER_NAME) \
			--agents 1 \
			-p "$(APP_PORT):30007@server:0"; \
	fi

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
	@# Server-side apply: the Argo CD 3 CRDs are too large for the annotation
	@# that a client-side apply writes.
	$(KUBECTL) apply -n $(ARGO_NAMESPACE) --server-side --force-conflicts -f \
	https://raw.githubusercontent.com/argoproj/argo-cd/$(ARGO_VERSION)/manifests/install.yaml

# -------------------------------
# Hand the app to Argo CD
# -------------------------------
# Only the Application is created here. Argo CD then reads the GitHub repository
# and deploys what it finds there into the namespace dev.
deploy-app:
	@echo "🚀 Creating the Argo CD Application (Argo CD deploys the app into $(DEV_NAMESPACE))"
	$(KUBECTL) wait --for condition=established crd/applications.argoproj.io --timeout=120s
	$(KUBECTL) apply -f $(ARGO_APPLICATION)

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
	$(KUBECTL) get pods -n $(ARGO_NAMESPACE)
	$(KUBECTL) get pods -n $(DEV_NAMESPACE)

# -------------------------------
# Verification tests
# -------------------------------
# Checks the cluster, namespaces, Argo CD, the Application and the app on localhost:8888.
# Waits for Argo CD's first sync, which comes minutes after `make setup`. Changes nothing.
test:
	@bash scripts/test_part3.sh

# -------------------------------
# Port forwarding
# -------------------------------
port-forward:
	$(KUBECTL) -n $(ARGO_NAMESPACE) port-forward svc/argocd-server $(ARGO_PORT):443

# -------------------------------
# Show ArgoCD admin password
# -------------------------------
echo-password:
	$(KUBECTL) -n $(ARGO_NAMESPACE) get secret argocd-initial-admin-secret \
	-o jsonpath="{.data.password}" | base64 -d
	@echo

# -------------------------------
# The same Application through the argocd CLI (optional demo)
# -------------------------------
# make setup already creates the Application from $(ARGO_APPLICATION).
# This target shows the CLI way. It needs "make port-forward" running in another terminal.
argocd-setup:
	$(KUBECTL) -n $(ARGO_NAMESPACE) rollout status deploy/argocd-server --timeout=300s
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
