.PHONY: help test verify up down status ssh-server ssh-worker clean

help: ## Show this help message
	@echo "Part 1 - K3s and Vagrant Management"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start the VMs
	@echo "Starting VMs..."
	vagrant up

down: ## Stop the VMs
	@echo "Stopping VMs..."
	vagrant halt

status: ## Show VM status
	vagrant status

ssh-server: ## SSH into slombardS (server)
	vagrant ssh slombardS

ssh-worker: ## SSH into slombardSW (worker)
	vagrant ssh slombardSW

test: ## Run all verification tests
	@echo "Running Part 1 verification tests..."
	@bash scripts/test_part1.sh

verify: test ## Alias for test

clean: ## Destroy VMs and clean up
	@echo "WARNING: This will destroy all VMs!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		vagrant destroy -f; \
	fi

# Additional useful targets
show-nodes: ## Show Kubernetes cluster nodes
	@echo "Cluster nodes:"
	@vagrant ssh slombardS -c "kubectl get nodes --kubeconfig=/etc/rancher/k3s/k3s.yaml 2>/dev/null || k3s kubectl get nodes 2>/dev/null"

show-ip-server: ## Show IP address of slombardS
	@vagrant ssh slombardS -c "ip a show eth1 | grep 'inet ' | awk '{print \$$2}'"

show-ip-worker: ## Show IP address of slombardSW
	@vagrant ssh slombardSW -c "ip a show eth1 | grep 'inet ' | awk '{print \$$2}'"

