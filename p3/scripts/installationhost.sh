#!/bin/bash
# Installs everything Part 3 needs on a fresh host: Docker, access to Docker without
# sudo, kubectl, and (through the Makefile target check-k3d) k3d and the argocd CLI.
# Run it once, log out and in again, then: make setup
set -e

# curl is used by every download below, make by the last step
if ! command -v curl >/dev/null 2>&1 || ! command -v make >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y curl make
fi

# Docker: K3d runs every node of the cluster as a Docker container
if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sudo sh
fi

# The docker command reaches the daemon through /var/run/docker.sock, which belongs
# to root and the group docker. Without the group every docker and k3d call needs sudo.
if ! id -nG "$USER" | grep -qw docker; then
    sudo usermod -aG docker "$USER"
fi

# kubectl, latest stable release
if ! command -v kubectl >/dev/null 2>&1; then
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
fi

# k3d and the argocd CLI: the Makefile already knows how to install them
# (and which Argo CD version), so the versions are named in one place only.
make -C "$(dirname "$0")/.." check-k3d

docker --version
kubectl version --client
k3d version

# Groups are read at login: this shell does not have the new group yet.
if ! id -nG | grep -qw docker; then
    echo
    echo "Log out and in again (or run: newgrp docker), then: make setup"
fi
