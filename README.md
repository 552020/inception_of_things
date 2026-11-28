# Inception-of-Things

A minimal introduction to Kubernetes, in three parts and a bonus: K3s on virtual machines
made with Vagrant, then K3d with Argo CD. The whole project runs inside one virtual machine.

**Part 1: K3s and Vagrant.** Two virtual machines made with Vagrant: `rpodackS` (Server,
192.168.56.110) and `rpodackSW` (ServerWorker, 192.168.56.111), each with its IP on eth1
and SSH without a password. K3s runs on the first in controller mode and on the second in
agent mode; kubectl is installed.

**Part 2: K3s and three simple applications.** One virtual machine, `rpodackS` at
192.168.56.110, with K3s in server mode and three web applications. Which one answers
depends on the HOST of the request: app1.com gets app1, app2.com gets app2, anything else
gets app3. app2 runs as three replicas. An Ingress does the routing.

**Part 3: K3d and Argo CD.** No Vagrant: K3d runs K3s in Docker on the virtual machine, and
a script installs every tool it needs. Two namespaces: `argocd` for Argo CD, and `dev` with
an application that Argo CD deploys automatically from a public GitHub repository,
Robin-Lenz/rpodackIoT. The application is Wil's `wil42/playground` on port 8888, in two
versions, v1 and v2: changing the version in the GitHub repository updates the running
application.

**Bonus.** Part 3 with GitLab, in its latest version, running locally in the cluster in a
namespace named `gitlab`, in place of GitHub. Everything from Part 3 works with it.

| Folder | What |
|--------|------|
| `docs/subject` | the subject and the evaluation sheet |
| `docs/evaluation` | the study document for the oral, the glossary and the flashcards; the cards are served as a web deck at https://iot-deck-pi.vercel.app |
| `docs/host-vm` | how the host VM was built and is kept |
| `docs/lab` | experiments that are not turned in: early Vagrantfiles, a Docker-provider setup, an Ansible helper |
| `docs/deck` | the web deck's code |

Hand-drawn overview of each part: [docs/diagrams](docs/diagrams/README.md).

Only `p1`, `p2` and `p3` are turned in; the subject asks for exactly those folders at the root. Each has a `Makefile`; `make help` in `p1` and `p2` lists the targets, `make setup` in `p3` builds everything.

## Where we are

The work of 21 and 22 November is merged (PRs #6 and #7, 25 November); work on `main`. Part 1 passes (`make up` 103 s, `make test` 14 of 14, 2026-11-28, on branch `fix-p1-k3s-memory`); Parts 2, 3 and the bonus are being run next.

- **We depart from the subject on one point:** the K3s server VMs of `p1` and `p2` get 2 CPUs and 2048 MB, where the subject advises 1 CPU and 512 or 1024 MB. K3s itself documents 2 cores and 2 GB as the minimum for a server, and at 1024 MB our server ran out of memory. The worker keeps the subject's 1 CPU and 512 MB. Why, with the measurements: [journal, 2026-11-28](docs/journal.md#2026-11-28-the-k3s-servers-get-2-cpus-and-2-gb-more-than-the-subject-advises).
- Session notes, readable from any computer: [docs/sessions](docs/sessions/README.md). Delete that folder before submission.
- Personal checklist for the next session: [docs/slombard-start-here.md](docs/slombard-start-here.md).

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
