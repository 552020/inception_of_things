.PHONY: help up down status ssh-server clean show-nodes show-ip-server

SHELL := /bin/bash

help: ## Show this help message
	@echo "Part 2 - K3s and three applications"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Create and provision the VMs (vagrant up runs the playbook itself)
	@echo "Starting VMs..."
	vagrant up --provider=libvirt --no-parallel

provision: ## Re-run the playbook on VMs that already exist
	vagrant provision

down: ## Stop the VMs
	@echo "Stopping VMs..."
	vagrant halt

status: ## Show VM status
	vagrant status

ssh-server: ## SSH into rpodackS (server)
	vagrant ssh rpodackS

clean: ## Destroy VMs and clean up
	@echo "WARNING: This will destroy all VMs!"
	@read -p "Are you sure? [y/N] " -r REPLY; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		vagrant destroy -f; \
	else \
		echo "Aborted."; \
	fi


# Additional useful targets
show-nodes: ## Show Kubernetes cluster nodes
	@echo "Cluster nodes:"
	@vagrant ssh rpodackS -c "kubectl get nodes --kubeconfig=/etc/rancher/k3s/k3s.yaml 2>/dev/null || k3s kubectl get nodes 2>/dev/null"

show-ip-server: ## Show IP address of rpodackS
	@vagrant ssh rpodackS -c "ip a show eth1 | grep 'inet ' | awk '{print \$$2}'"

