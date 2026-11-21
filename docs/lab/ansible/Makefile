check-ansible:
	@which ansible > /dev/null || (echo "Ansible not found. Run 'make install-ansible'" && exit 1)
	@echo "✓ Ansible is installed: $$(ansible --version | head -n1)"

install-ansible:
	@which ansible > /dev/null || \
		(echo "Installing Ansible..." && \
		 sudo apt-get update && \
		 sudo apt-get install -y ansible) || \
		(echo "Failed to install via apt. Try: pip install ansible" && exit 1)
	@echo "✓ Ansible installed successfully"

.PHONY: check-ansible install-ansible

