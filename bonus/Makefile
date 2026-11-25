# Bonus: the lab of Part 3 (K3d, Argo CD, application in dev) with a local GitLab
# in the namespace gitlab as the repository Argo CD follows.
# Needs what Part 3 needs (Docker, kubectl, k3d) plus git.
# Delete the cluster of Part 3 first (make -C ../p3 delete): the two do not fit in memory.

CLUSTER_NAME := bonus
ARGO_NAMESPACE := argocd
DEV_NAMESPACE := dev
GITLAB_NAMESPACE := gitlab
ARGO_VERSION := v2.7.12
ARGO_PORT := 8080
GITLAB_URL := http://localhost:8929
REPO := rpodackIoT
K3D := k3d
# Every kubectl call names the cluster of the bonus: a run after Part 3 cannot
# land in another cluster by accident.
KUBECTL := kubectl --context k3d-$(CLUSTER_NAME)
# The password of the GitLab user root, read from its Secret
GITLAB_PASS = $$($(KUBECTL) -n $(GITLAB_NAMESPACE) get secret gitlab-root -o jsonpath='{.data.password}' | base64 -d)
REPO_URL_IN_CLUSTER := http://gitlab.gitlab.svc.cluster.local:8929/root/$(REPO).git

.PHONY: all setup check create create-namespaces install-argo install-gitlab wait-gitlab \
	repo deploy-app sync v1 v2 info port-forward argo-password gitlab-password delete

all: setup

setup: check create create-namespaces install-argo install-gitlab wait-gitlab repo deploy-app
	@echo
	@echo "Setup complete."
	@echo "GitLab:  $(GITLAB_URL)   user root, password: make gitlab-password"
	@echo "Argo CD: make port-forward, then https://localhost:$(ARGO_PORT)   user admin, password: make argo-password"
	@echo "App:     curl http://localhost:8888"

check:
	@for tool in docker kubectl $(K3D) git openssl; do \
		command -v $$tool >/dev/null 2>&1 || { echo "$$tool not found: ../p3/scripts/installationhost.sh installs Docker and kubectl, make -C ../p3 check-k3d installs k3d"; exit 1; }; \
	done

# One server node. Two ports of the node are published on the host:
# 8888 -> NodePort 30007 (the application), 8929 -> NodePort 30929 (GitLab).
create:
	@if $(K3D) cluster list $(CLUSTER_NAME) >/dev/null 2>&1; then \
		echo "Cluster $(CLUSTER_NAME) already exists"; \
	else \
		$(K3D) cluster create $(CLUSTER_NAME) \
			-p "8888:30007@server:0" \
			-p "8929:30929@server:0"; \
	fi

create-namespaces:
	@for ns in $(ARGO_NAMESPACE) $(DEV_NAMESPACE) $(GITLAB_NAMESPACE); do \
		$(KUBECTL) create namespace $$ns --dry-run=client -o yaml | $(KUBECTL) apply -f -; \
	done

install-argo:
	$(KUBECTL) apply -n $(ARGO_NAMESPACE) -f \
		https://raw.githubusercontent.com/argoproj/argo-cd/$(ARGO_VERSION)/manifests/install.yaml

# The root password is generated here, once, and kept in a Secret: no password in the repository.
install-gitlab:
	@$(KUBECTL) -n $(GITLAB_NAMESPACE) get secret gitlab-root >/dev/null 2>&1 || \
		$(KUBECTL) -n $(GITLAB_NAMESPACE) create secret generic gitlab-root \
			--from-literal=password=$$(openssl rand -hex 16)
	$(KUBECTL) apply -f confs/gitlab.yaml

wait-gitlab:
	@echo "Waiting for GitLab: image download, then a first start of several minutes..."
	$(KUBECTL) -n $(GITLAB_NAMESPACE) rollout status deployment/gitlab --timeout=30m

# Creates the project root/$(REPO) on GitLab by pushing confs/app into it
repo:
	@GITLAB_PASS=$(GITLAB_PASS) ./scripts/gitlab-repo.sh seed $(GITLAB_URL) $(REPO) confs/app

# Tells Argo CD to follow the GitLab repository. The project is private, so Argo CD
# first gets a login for it: a Secret with the label Argo CD looks for.
deploy-app:
	@$(KUBECTL) -n $(ARGO_NAMESPACE) create secret generic gitlab-repo \
		--from-literal=type=git \
		--from-literal=url=$(REPO_URL_IN_CLUSTER) \
		--from-literal=username=root \
		--from-literal=password=$(GITLAB_PASS) \
		--dry-run=client -o yaml \
		| $(KUBECTL) label --local -f - argocd.argoproj.io/secret-type=repository -o yaml \
		| $(KUBECTL) apply -f -
	$(KUBECTL) apply -f confs/argocd-app.yaml

# The change of version as one command: edits the image tag in the GitLab
# repository, pushes, and asks Argo CD to look. By hand: see README.md.
v1 v2:
	@GITLAB_PASS=$(GITLAB_PASS) ./scripts/gitlab-repo.sh tag $(GITLAB_URL) $(REPO) $@
	@$(MAKE) --no-print-directory sync

# Argo CD looks at the repository every 3 minutes. This asks it to look now.
sync:
	$(KUBECTL) -n $(ARGO_NAMESPACE) annotate application dev-app \
		argocd.argoproj.io/refresh=normal --overwrite

info:
	$(K3D) cluster list
	$(KUBECTL) get pods -A
	$(KUBECTL) -n $(ARGO_NAMESPACE) get application dev-app
	$(KUBECTL) -n $(DEV_NAMESPACE) get deployment wil-playground \
		-o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'

port-forward:
	$(KUBECTL) -n $(ARGO_NAMESPACE) port-forward svc/argocd-server $(ARGO_PORT):443

argo-password:
	@$(KUBECTL) -n $(ARGO_NAMESPACE) get secret argocd-initial-admin-secret \
		-o jsonpath="{.data.password}" | base64 -d; echo

gitlab-password:
	@$(KUBECTL) -n $(GITLAB_NAMESPACE) get secret gitlab-root \
		-o jsonpath="{.data.password}" | base64 -d; echo

delete:
	-$(K3D) cluster delete $(CLUSTER_NAME)
