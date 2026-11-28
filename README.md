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

### Extra folders, to be removed before submission

| Folder | What |
|--------|------|
| `docs/subject` | the subject and the evaluation sheet |
| `docs/journal.md` | decisions and their reasons, dated |
| `docs/diagrams` | hand-drawn sketches of each part, coming up and running |
| `docs/evaluation` | study notes for the oral, glossary, flashcards (web deck: https://iot-deck-pi.vercel.app) |
| `docs/deck` | the web deck's code |
| `docs/host-vm` | how the host VM is built, started and backed up |
| `docs/lab` | experiments that are not handed in |
| `docs/issues` | open questions and ideas |
| `docs/sessions` | working notes per session |
| `docs/slombard-start-here.md` | Stefano's checklist for the next session |

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

## Setup times

Measured in the host VM under QEMU/KVM (6 vCPUs, 8 GB), boxes and images already cached, one run each. A first run adds the downloads (the Debian box, the K3s binary per node, the k3d and Argo CD images).

| Part | Command | Time | Notes |
|------|---------|------|-------|
| 1 | `make up` | 103 s | measured 2026-11-28 with the server at 2 CPUs and 2048 MB, nothing else running; then `make watch` 5 min without a stall and `make test` 14 of 14 passed. Earlier: 102 s on 2026-11-22 at 1024 MB, but that server later ran out of memory |
| 2 | `make up` | not measured yet | |
| 3 | `make setup` | not measured yet | |
| bonus | `make setup` | about 10 min to all pods Running | GitLab CE plus Argo CD, 2.5 to 3 GB in the guest; unconfirmed, see `bonus/` |

Known problem, now explained: on 2026-11-22 the server stalled a few minutes after K3s came up, and we blamed the second provisioning pass. On 2026-11-28 it happened again after a single `make up`: the server was out of memory at 1024 MB. The fix and the reasons are in the journal entry of 2026-11-28; the times above were taken before it.

## Three repositories

| Repository | Holds | Read by |
|------------|-------|---------|
| The project repository on the 42 Git server | `p1`, `p2`, `p3`: what is turned in | the evaluator, who clones it |
| [552020/inception_of_things](https://github.com/552020/inception_of_things) | the same, plus `docs` (documents, the card deck, experiments): where we work | us |
| [Robin-Lenz/rpodackIoT](https://github.com/Robin-Lenz/rpodackIoT) | `deployment.yaml`: the application of Part 3 | Argo CD |

Argo CD does not read files on the machine. It fetches a Git repository over the network and keeps the cluster on what that repository says. So the application of Part 3 has to sit in a repository Argo CD can reach, and the subject fixes which kind: a public GitHub repository with the login of a group member in its name. The 42 server is not public, and `inception_of_things` carries no login. That is why `rpodackIoT` exists and must stay public.

`make setup` in `p3` builds the k3d cluster, the namespaces `argocd` and `dev`, installs Argo CD and applies `p3/confs/application.yaml`: the Argo CD Application `dev-app`, pointed at `rpodackIoT`, with automatic sync. Argo CD then creates the Deployment and the Service in `dev` itself; the app answers on `localhost:8888` (k3d publishes the NodePort). The change from v1 to v2 is shown by editing the image tag in `rpodackIoT` and pushing there: that push is the thing being demonstrated. `make argocd-setup` does the same registration with the CLI, for the demo.

`p3/confs/deployment.yaml` is a copy of the file in `rpodackIoT`, kept for reading; nothing applies it. The cluster follows what `rpodackIoT` says, so a change made only in the copy has no effect. Before a defense, `rpodackIoT` must say `v1`.

## Technologies

Official documentation for everything the project uses, in the order the parts need them.

### Foundation

| Tool | Docs | Concepts to learn |
|------|------|-------------------|
| Vagrant | https://developer.hashicorp.com/vagrant/docs | Vagrantfile, box, provider, provisioner, multi-machine, private network |
| vagrant-libvirt | https://vagrant-libvirt.github.io/vagrant-libvirt/ | How Vagrant options map to KVM domains and networks |
| Ansible | https://docs.ansible.com/ansible/latest/getting_started/index.html | Inventory, play, task, module, idempotency, `delegate_to` |

### Part 1 and 2: Kubernetes via K3s

| Tool | Docs | Concepts to learn |
|------|------|-------------------|
| K3s | https://docs.k3s.io | Server vs agent, node token, embedded kubectl, bundled Traefik and ServiceLB |
| Kubernetes | https://kubernetes.io/docs/concepts/ | Pods, Deployments, Services, Ingress (read in that order) |
| kubectl | https://kubernetes.io/docs/reference/kubectl/quick-reference/ | get, describe, apply, logs, exec |
| Traefik | https://doc.traefik.io/traefik/providers/kubernetes-ingress/ | Kubernetes Ingress provider, routing by Host header |

### Part 3: K3d and GitOps

| Tool | Docs | Concepts to learn |
|------|------|-------------------|
| Docker | https://docs.docker.com/get-started/ | Image, container, Dockerfile, tag, registry |
| K3d | https://k3d.io | K3s nodes as Docker containers, exposing services |
| Argo CD | https://argo-cd.readthedocs.io/en/stable/getting_started/ | Application resource, sync, GitOps: Git is the source of truth |

### Bonus

| Tool | Docs | Concepts to learn |
|------|------|-------------------|
| Helm | https://helm.sh/docs/intro/using_helm/ | Chart, release, values |
| GitLab on Kubernetes | https://docs.gitlab.com/charts/ | Helm chart install, pointing Argo CD at a local GitLab |

Shortest useful path: Kubernetes Pods, Deployment, Service and Ingress pages, then the K3s Quick-Start, then Argo CD Getting Started. Look the rest up as you hit it.

## Useful shortcuts while working in the Ubuntu VM

GNOME screenshots (Ubuntu 26.04):

| Shortcut | What it does |
|----------|--------------|
| `Print` | Opens the screenshot overlay. Area selection is the default: drag a rectangle, press Enter. Saved to `~/Pictures/Screenshots` and copied to the clipboard. |
| `Shift+Print` | Full screen immediately. |
| `Alt+Print` | Active window immediately. |

GNOME 42+ dropped the old `Shift+Ctrl+Print` binding, so use `Print` for partial screenshots.

Inside the QEMU window, click into the VM first so the `Print` key reaches the guest and not the host; `Ctrl+Alt+G` gives mouse and keyboard back.

## Journal

Decisions and the reasoning behind them, dated, newest last: [docs/journal.md](docs/journal.md).

---

Inception-of-Things is a project of the 42 curriculum, by Robin (rpodack) and
Stefano (slombard).
