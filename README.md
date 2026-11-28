# Inception-of-Things

## The project

Three small Kubernetes setups, each running on its own inside one Linux virtual machine,
the host VM.

- **Part 1: K3s and Vagrant, a cluster of two machines.** Vagrant creates two virtual
  machines and Ansible installs K3s, a lightweight Kubernetes, on both. One is the server
  and runs the control plane; the other is a worker that joins it over a private network
  (192.168.56.110 and 192.168.56.111).
- **Part 2: K3s and Traefik, three web applications behind one address.** One virtual
  machine runs K3s with three applications. Traefik, the Ingress controller that comes with
  K3s, picks the application by the host name in the request: app1.com, app2.com, and
  anything else goes to app3. The second application runs as three replicas.
- **Part 3: K3d and Argo CD, continuous deployment from GitHub.** K3d runs a K3s cluster as
  Docker containers. Argo CD, inside the cluster, watches a public GitHub repository and
  keeps the running application equal to what the repository says: change the version
  there and push, and the cluster follows.
- **Bonus: GitLab.** Part 3 with a GitLab running inside the cluster in place of GitHub.

> **Note:** the K3s server of Parts 1 and 2, `rpodackS`, gets 2 CPUs and 2048 MB, more than the
> subject's advised 1 CPU and 512 MB (or 1024). K3s documents 2 cores and 2 GB as the minimum
> for a server node ([K3s requirements](https://docs.k3s.io/installation/requirements)), and at
> 1024 MB our server ran out of memory about a minute after K3s started. The worker,
> `rpodackSW`, keeps 1 CPU and 512 MB, the K3s minimum for an agent.

## Prerequisites

Inside the host VM:

- Parts 1 and 2: Vagrant with the libvirt provider (vagrant-libvirt), QEMU/KVM, Ansible.
- Part 3 and the bonus: Docker, kubectl, k3d. `p3/scripts/installationhost.sh` installs them.

## Host VM

Everything runs inside one virtual machine, as the subject asks: Ubuntu 26.04.1 under
QEMU/KVM, 6 CPUs, 8 GB of RAM, with nested virtualization passed through so that the VMs of
Parts 1 and 2 can run inside it.

The host VM runs under QEMU/KVM rather than VirtualBox; the subject leaves the tool free.
VirtualBox froze twice under nested virtualization while Part 1's VMs were booting. QEMU/KVM
hands the host's KVM to the VM directly (`-cpu host`), the nested VMs run without a freeze,
and it needs no root on the 42 machines.

The options on the 42 machines, where we have no root:

| Option | On the 42 machines | Verdict |
|--------|--------------------|---------|
| VirtualBox | installed, runs without root | froze under nested virtualization |
| libvirt, system mode (`qemu:///system`) | its socket needs root or the libvirt group | not available |
| libvirt, session mode (`qemu:///session`) | runs without root, but cannot create networks | possible, with QEMU's user networking |
| QEMU/KVM directly | `qemu-system-x86_64` installed, `/dev/kvm` usable while logged in at the seat | our choice: one command, no daemon |

## Usage

Run one part at a time: Parts 1 and 2 share the IP 192.168.56.110, Part 3 and the bonus share
the ports 8080 and 8888. Times assume the Vagrant box and the container images are already
downloaded.

### Part 1: K3s and Vagrant

```bash
cd p1
make up           # creates both VMs and installs K3s (about 2 min)
make test         # hostnames, eth1, K3s on both machines, both nodes Ready
```

Check by hand:

```bash
make show-nodes   # rpodacks and rpodacksw, both Ready
make ssh-server   # then: ip a show eth1   gives 192.168.56.110
make ssh-worker   # then: ip a show eth1   gives 192.168.56.111
make down         # stops both VMs
```

### Part 2: K3s and three simple applications

```bash
make -C p1 down   # Part 1's VMs must be off: same IP
cd p2
make up           # the VM, K3s and the three applications (about 1 min)
```

Check:

```bash
curl -H "Host: app1.com" 192.168.56.110   # app1 (nginx welcome page)
curl -H "Host: app2.com" 192.168.56.110   # Hello from app2
curl 192.168.56.110                       # Hello from App3, the default
make ssh-server   # then: kubectl get all, ingress   (app2 has 3 replicas)
```

### Part 3: K3d and Argo CD

```bash
bash p3/scripts/installationhost.sh   # once: Docker, kubectl, k3d, argocd; then log out and in
cd p3
make setup        # k3d cluster, namespaces argocd and dev, Argo CD, the Application (about 20 s)
```

Argo CD deploys the application 3 to 4 minutes after `make setup` returns, while its images
download; until then `curl` gets no answer.

Check:

```bash
kubectl get ns            # argocd and dev
kubectl get pods -n dev   # wil-playground, Running
curl localhost:8888       # {"status":"ok", "message": "v1"}
```

Change the version: in the GitHub repository Robin-Lenz/rpodackIoT, set the image tag in
`deployment.yaml` from `v1` to `v2` and push. Argo CD checks the repository every 3 minutes;
to make it check now:

```bash
kubectl -n argocd annotate application dev-app argocd.argoproj.io/refresh=normal --overwrite
curl localhost:8888       # "message": "v2"
```

Argo CD web interface, in a second terminal:

```bash
make port-forward         # then open https://localhost:8080, user admin
make echo-password        # the admin password
```

`make delete` removes the cluster.

### Bonus: GitLab

```bash
make -C p3 delete   # Part 3's cluster must be gone: same ports
cd bonus
make setup          # k3d cluster, Argo CD, GitLab in namespace gitlab, the repository (about 4 min)
```

Check:

```bash
curl localhost:8888     # "message": "v1", deployed from the local GitLab
make v2                 # pushes v2 to GitLab and refreshes Argo CD
curl localhost:8888     # "message": "v2"
make gitlab-password    # GitLab at http://localhost:8929, user root
```

`make delete` removes the cluster. More in `bonus/README.md`.

## Folder structure

| Folder | What |
|--------|------|
| `p1` | Part 1: Vagrantfile, Ansible playbook, test script |
| `p2` | Part 2: Vagrantfile, Ansible playbook, the manifests of the three applications |
| `p3` | Part 3: install script, k3d and Argo CD setup, the Argo CD Application |
| `bonus` | Bonus: GitLab and Argo CD setup |
