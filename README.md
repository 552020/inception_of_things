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

## Folder structure

| Folder | What |
|--------|------|
| `p1` | Part 1: Vagrantfile, Ansible playbook, test script |
| `p2` | Part 2: Vagrantfile, Ansible playbook, the manifests of the three applications |
| `p3` | Part 3: install script, k3d and Argo CD setup, the Argo CD Application |
| `bonus` | Bonus: GitLab and Argo CD setup |

## Where we depart from the subject

The subject strongly advises 1 CPU and 512 MB of RAM (or 1024) per virtual machine. We follow
that for the worker of Part 1, `rpodackSW`: 1 CPU, 512 MB. The K3s server of Parts 1 and 2,
`rpodackS`, gets 2 CPUs and 2048 MB:

- K3s documents 2 cores and 2 GB as the minimum for a server node, and 1 core and 512 MB for
  an agent ([K3s requirements](https://docs.k3s.io/installation/requirements)).
- At 1024 MB our server ran out of memory about a minute after K3s started: 11 MB available,
  K3s alone using 689 MB, and it stopped answering. At 2048 MB it stays responsive, with more
  than 700 MB free.

## Host VM

The subject requires the whole project to run inside a virtual machine. On the 42 cluster that means one Ubuntu VM (the host VM) in which Vagrant, libvirt, K3s, Docker and K3d all run. Since 2026-11-22 it runs under QEMU/KVM, started by one script, with nested virtualization passed through. The VirtualBox setup it replaced, and why it had to go, are in the journal.

| Item | Value |
|------|-------|
| Name | `IoT` |
| OS | Ubuntu 26.04.1 LTS desktop (upgraded from 24.04 on 2026-11-22) |
| Runs under | QEMU/KVM on the 42 host, no root, no libvirt: [docs/host-vm/iot-kvm.sh](docs/host-vm/iot-kvm.sh) |
| Disk | `~/goinfre/VMs/IoT.qcow2`, 60 GB virtual, grows as used; compressed backup in `~/sgoinfre/IoT/` |
| Resources | 6 CPUs, 8 GB RAM, `-cpu host` so that KVM works inside |
| Network | user-mode NAT; host ports 2222 (SSH), 8080, 8888 and 30007 forwarded to the guest |
| Login | `slombard` |
| Inside | git, Ansible, QEMU/KVM, libvirt, Vagrant 2.4.9 with vagrant-libvirt, Docker, kubectl, k3d, argocd, Chrome, Claude Code |

Why two locations: goinfre is the machine's own disk, fast, but wiped when another user logs in. Sgoinfre follows you across the cluster and keeps up to 30 GB (purged after 6 months unused), but it is a network share, too slow to run a VM from. So the VM runs from goinfre, and a compressed copy in sgoinfre is what survives a seat change. Refresh that copy after real work; the commands are in [docs/host-vm/vm-setup.md](docs/host-vm/vm-setup.md). Check sgoinfre's size now and then:

```bash
du -sh ~/sgoinfre
```

Start, reach and stop from the host:

```bash
docs/host-vm/iot-kvm.sh            # window on the desktop
docs/host-vm/iot-kvm.sh headless   # no window, SSH only
ssh -p 2222 slombard@localhost
ssh -p 2222 slombard@localhost sudo poweroff
```

Inside the QEMU window, `Ctrl+Alt+G` releases the mouse and keyboard back to the host. VirtualBox and KVM cannot both hold VT-x, so no VirtualBox VM may run while the host VM is up.

The full rebuild procedure, disk resizing, backup and recovery steps are in [docs/host-vm/vm-setup.md](docs/host-vm/vm-setup.md).

## Requirements

Everything runs inside one virtual machine, as the subject asks. Ours: Ubuntu 26.04 with
6 CPUs, 8 GB of RAM and nested virtualization enabled, so that VMs can run inside it.

- Parts 1 and 2: Vagrant with the libvirt provider (vagrant-libvirt), QEMU/KVM, Ansible.
- Part 3 and bonus: Docker, kubectl, k3d; `p3/scripts/installationhost.sh` installs them.

## Running each part

Run the parts one at a time: Parts 1 and 2 both use 192.168.56.110, and Part 3 and the
bonus use the same ports. Times are from runs with the Vagrant box and the images already
downloaded.

### Part 1

```bash
cd p1
make up          # both VMs and K3s, about 2 minutes
make test        # checks hostnames, eth1, K3s on both machines, both nodes Ready
make show-nodes  # kubectl get nodes on the server
make down        # stops both VMs
```

Expected: `rpodacks` and `rpodacksw` Ready; `ip a show eth1` gives 192.168.56.110 on the
server (`make ssh-server`) and 192.168.56.111 on the worker (`make ssh-worker`).

### Part 2

```bash
make -C p1 down  # Part 1's VMs must be off, same IP
cd p2
make up          # the VM, K3s and the three applications, about 1 minute
curl -H "Host: app1.com" 192.168.56.110   # app1
curl -H "Host: app2.com" 192.168.56.110   # app2
curl 192.168.56.110                       # app3, the default
make ssh-server  # then: kubectl get all   (app2 shows 3 replicas)
```

### Part 3

```bash
bash p3/scripts/installationhost.sh   # once: Docker, kubectl, k3d, argocd; then log out and in
cd p3
make setup       # cluster, namespaces argocd and dev, Argo CD, the Application: about 20 s
kubectl get ns   # argocd and dev
kubectl get pods -n dev
curl localhost:8888   # {"status":"ok", "message": "v1"}
```

`make setup` returns before Argo CD is ready: the first sync, and with it the application,
comes about 3 to 4 minutes later, while the images download. Until then `curl` gets no
answer.

To show the version change: in the GitHub repository Robin-Lenz/rpodackIoT, change the image
tag in `deployment.yaml` from `v1` to `v2` and push. Argo CD checks the repository every
3 minutes; to have it check now:

```bash
kubectl -n argocd annotate application dev-app argocd.argoproj.io/refresh=normal --overwrite
curl localhost:8888   # "message": "v2"
```

Argo CD's web interface: `make port-forward`, then https://localhost:8080, user `admin`,
password from `make echo-password`.

`make delete` removes the cluster.

### Bonus

```bash
make -C p3 delete   # Part 3's cluster must be gone, same ports
cd bonus
make setup          # GitLab and Argo CD, about 10 minutes
```

The steps that follow, the GitLab login and the version change through GitLab, are in
`bonus/README.md`.
