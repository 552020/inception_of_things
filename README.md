# inception_of_things

42 project: K3s clusters built three ways, with Robin (rpodack) and Stefano (slombard).

| Folder | What |
|--------|------|
| `p1` | Part 1: two VMs with Vagrant and Ansible, K3s server and agent |
| `p2` | Part 2: one VM, K3s server, three web applications behind one Ingress |
| `p3` | Part 3: K3d cluster in Docker, Argo CD deploying the application from GitHub |
| `docs/subject` | the subject and the evaluation sheet |
| `docs/evaluation` | the study document for the oral, the glossary and the flashcards; the cards are served as a web deck at https://iot-deck-pi.vercel.app |
| `docs/host-vm` | how the host VM was built and is kept |
| `docs/lab` | experiments that are not turned in: early Vagrantfiles, a Docker-provider setup, an Ansible helper |
| `docs/deck` | the web deck's code |

Hand-drawn overview of each part: [docs/diagrams](docs/diagrams/README.md).

Only `p1`, `p2` and `p3` are turned in; the subject asks for exactly those folders at the root. Each has a `Makefile`; `make help` in `p1` and `p2` lists the targets, `make setup` in `p3` builds everything.

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

Measured on 2026-11-22 in the host VM under QEMU/KVM (6 vCPUs, 8 GB), boxes and images already cached, one run each. A first run adds the downloads (the Debian box, the K3s binary per node, the k3d and Argo CD images).

| Part | Command | Time | Notes |
|------|---------|------|-------|
| 1 | `make up` | 102 s | both VMs created, provisioned, one reboot each for the interface names, node Ready; measured while a k3d cluster was also running in the guest, so a quiet guest should be a little faster |
| 2 | `make up` | not measured yet | |
| 3 | `make setup` | not measured yet | |
| bonus | `make setup` | about 10 min to all pods Running | GitLab CE plus Argo CD, 2.5 to 3 GB in the guest; unconfirmed, see `bonus/` |

Known problem, not solved: running the playbook a second time on the existing `p1` VMs (`make provision`) stalls on the server a few minutes after K3s came up, with the server VM hammering its disk and unreachable over SSH. It happened with 512 MB and with 1024 MB. `make up` itself is not affected since it no longer provisions twice. First thing to check: log into `rpodackS` right after `make up` and watch `free -m`, `iostat` and `journalctl -u k3s` for a few minutes.

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

Decisions and the reasoning behind them, newest last.

### 2026-10-19: Why the whole project runs inside a VM

The subject says "the whole project has to be done in a virtual machine". On the 42 cluster this is not a style choice, it is the only way, for the same reason Inception needed a VM: we have no sudo on the host, and everything here needs root.

- Vagrant, libvirt, Docker and K3d are system packages and daemons. No apt, no systemd services without root.
- The 192.168.56.0/24 network the subject demands is a host-only or libvirt network. Creating it means creating bridge interfaces, a root operation.
- K3s installs as a systemd service, binds ports 80, 443 and 6443, and rewrites iptables for Traefik, ServiceLB and kube-proxy. Docker does the same for its bridge. Not possible unprivileged, and not something to do on a shared campus machine anyway.
- Part 2 tests `app1.com` and `app2.com`, which means editing `/etc/hosts` or sending a Host header. Same wall as Inception.
- The VM lives in sgoinfre, so it follows us to any seat and the defense can happen on any machine.

Consequence: one Ubuntu VM in VirtualBox with nested virtualization on, and inside it Vagrant with the libvirt provider for Part 1 and 2, Docker and K3d for Part 3. We have sudo inside the VM, so every tool installs normally there.

### 2026-10-19: The VM was lost and rebuilt

Sgoinfre had been emptied, taking the IoT VM, its disk and the Ubuntu ISO with it. Likely cause is the 6-month inactivity purge. Rebuilt from scratch the same day; the exact commands are in `docs/host-vm/vm-setup.md`. Lesson: anything in sgoinfre must be rebuildable from the repo, and the rebuild steps must be written down.

### 2026-10-20: Can the host VM be launched without a desktop application?

Yes, and the 42 host supports it. What the host offers without sudo: `qemu-system-x86_64` is installed, our user has read-write access to `/dev/kvm` through an ACL, and the host kernel runs KVM with nested virtualization on. What it lacks: access to the libvirt socket, so `virsh` and `vagrant-libvirt` on the host are out, but raw QEMU does not need libvirt.

Two levels:

1. **Keep VirtualBox, drop every click.** `VBoxManage` is a complete CLI; the VM in this repo was built entirely with it. The one GUI step, the Ubuntu installer, disappears by using the Ubuntu cloud image (`ubuntu-24.04-server-cloudimg-amd64.img`, about 600MB, preinstalled) plus a cloud-init NoCloud seed that sets user, password and SSH key on first boot. Start headless, SSH in.
2. **Drop VirtualBox for QEMU/KVM.** Same cloud image, launched with one `qemu-system-x86_64` command: `-enable-kvm -cpu host` (so the guest sees VT-x and runs libvirt at full speed), a qcow2 disk in sgoinfre, user-mode networking with `hostfwd` for SSH, `-display none`. No root, no daemon, no GUI. Everything except the downloaded image lives in the repo as a Makefile.

Cost of both: no desktop and no browser inside the VM. Part 2 is then tested with `curl -H "Host: app1.com" 192.168.56.110`, which matches the subject's own example output.

Hard constraint: on Linux, VirtualBox and KVM cannot both hold VT-x. A running QEMU/KVM VM blocks VirtualBox from starting a VM and vice versa. Pick one.

Why VirtualBox with the interactive installer was used for the 2026-10-19 rebuild anyway: it matched the team's previous setup, 42 evaluators expect VirtualBox, and a desktop with Firefox is the least surprising thing to show at a defense. The QEMU route is sound and arguably cleaner; it is about one Makefile of work and a good follow-up.

An earlier attempt at this by the team went nowhere, but it was only discussed and never committed, so there is no trace in the repo. From the notes that remain, the likely culprits were the `vagrant-qemu` plugin and running libvirt with the plain `qemu` driver, i.e. software emulation, because the outer VM had no nested VT-x. Any new attempt must give the outer VM `-cpu host` (QEMU) or `--nested-hw-virt on` (VirtualBox) so that KVM is available inside. Without that, every Vagrant box takes minutes to boot and K3s is unusable.

### 2026-10-20: A proven headless setup exists: mc-putchar's repo

https://github.com/mc-putchar/Inception-of-Things (mcutura, 42 Berlin) solves the host-VM problem entirely from the command line, and every tool it needs is already on the 42 Berlin host image. Checked on 2026-10-20: `virt-install`, `virsh`, `qemu-img`, `qemu-system-x86_64` and Docker are present, and `virsh -c qemu:///session` starts a user libvirt daemon without root.

How it works:

- **libvirt session mode** (`qemu:///session`): a per-user libvirt daemon. No root, no libvirt group, no system socket. This is the piece we were missing.
- **Cloud image instead of installer**: Ubuntu server cloud image as a read-only backing file plus a qcow2 overlay, created with `qemu-img create -b`. Boots in seconds.
- **cloud-init seed ISO**: `user-data` with user, password hash, packages and first-boot commands, plus `meta-data`. Built with `mkisofs` inside a throwaway Alpine Docker container since the host has no ISO tools.
- **One `virt-install` call**: `--network user` with a `-netdev user,hostfwd=...` qemu-commandline for SSH and service ports, `--graphics none`, serial console, and `--filesystem $(pwd),iot` to share the repo into the VM over virtio 9p.
- **Inside the VM**: an Ansible playbook installs qemu-kvm, system libvirt, vagrant and the vagrant-libvirt plugin. The Part 1 Vagrantfile sets `libvirt.nested = true` and `cpu_mode` host-passthrough comes from the outer VM's XML.
- **Disposable VM**: the disk sits in goinfre on purpose. If it is wiped, `make install` rebuilds everything from the repo in minutes.

Adjustments for us: 8GB RAM instead of their 12GB (this host has 15GB), Ubuntu 24.04 cloud image instead of 22.04, and remember that VirtualBox and KVM cannot run at the same time, so the VirtualBox VM from 2026-10-19 must be powered off before trying this route. Plan: keep the VirtualBox VM as the working environment until the Makefile route is proven, then switch.

**How he got there, from his commit history.** Worth reading as a model, not just the result.

1. 2025-06-14, first commit "init: setup vm automation": the libvirt domain XML, cloud-init `user-data` and `meta-data`, and the Ansible provisioning playbook land together, 583 lines in one go. The ingredients (cloud image, cloud-init, virt-install, session libvirt, 9p share) are all standard Linux tooling; what is his is deciding on day one that the host VM must be a Makefile target.
2. 2025-06-20 and 06-21: "make it run on my machine" and an arm64 fix for a teammate's laptop. The same files work on both, because nothing is hand-configured.
3. 2026-06-14, 02:41, "fix: bypass locked network for unprivileged session": the 42-specific breakthrough. Session-mode libvirt is not allowed to create networks on the cluster host, so he dropped libvirt networking altogether (`--network none`) and handed QEMU a raw user-mode netdev with port forwards:

   ```
   --qemu-commandline="-netdev user,id=net0,hostfwd=tcp::2242-:22 -device virtio-net-pci,netdev=net0"
   ```

   That one line is not in any tutorial. It is the wall our own earlier attempt hit, solved by someone who kept pushing.
4. Same day: `make stop`, then Part 3 with k3d and Argo CD, then the bonus the day after. Once the environment was a command, the rest went fast.

The lesson for us: build the environment as code first, even if it costs a day, because every later step then costs minutes and nothing is lost when sgoinfre is purged.

### 2026-10-20: Is the Part 1 token exchange "facilitated" by both VMs living on one laptop?

It was, in the first version. The original playbook dropped the K3s node token into the `/vagrant` shared folder, which both VMs see only because they share a host. Two real servers have no shared folder. Commit `41683e9` replaced that with Ansible SSH delegation; the `p1` in the repo today is Robin's, and it works the same way:

1. Ansible, running on the host VM, SSHes into the server and waits for `/var/lib/rancher/k3s/server/node-token` to appear.
2. It reads the file over SSH (`slurp` with `delegate_to` to the server VM, today `rpodackS`).
3. It SSHes into the worker and runs the K3s agent install with the token and `K3S_URL=https://192.168.56.110:6443`.
4. From then on the worker talks to the server over `eth1` on its own.

Nothing crosses between the nodes except over the network, which is what would happen between two physical servers. The facilitator is Ansible, and a config management tool with SSH access to every machine is the normal way join secrets move around a fleet. Swap the two IPs for real ones and the playbook is unchanged.

What production usually does differently: generate the token up front, keep it in a secrets store, and pass it to both server and worker as `K3S_TOKEN`. That removes the read-back step and lets you add workers later without touching the server. Possible small improvement to p1, not required by the subject.

### 2026-11-22: VirtualBox froze under nested virtualization; the host VM moved to QEMU/KVM

The first full run of `p1` froze the Ubuntu host VM twice. Same signature both times: the guest clock stopped, `VBox.log` said "Guest seems to be unresponsive", and most vCPU threads sat at 100% on the same instruction, the picture of a kernel waiting for a cross-CPU call that a vCPU in nested-guest mode never answers. The first freeze came while the second nested VM booted, the second with a single nested VM, two minutes in. The weak piece was VirtualBox's own nested VT-x.

So route 2 from the 2026-10-20 entry was taken, with the existing disk rather than a cloud image: `qemu-img convert` turned the VDI into a qcow2 in three minutes, and `qemu-system-x86_64 -enable-kvm -cpu host` boots it. Same Ubuntu, same desktop, same user, same SSH port; `kvm-ok` passes inside, libvirt and Docker come up, the guest boots in about ten seconds. The launch script is `docs/host-vm/iot-kvm.sh`, so the host VM is once more something the repo can rebuild.

What is different for whoever sits at the host: no VirtualBox manager and no guest additions, so the desktop does not follow the window size and there is no shared clipboard; copy over SSH instead. `Ctrl+Alt+G` releases the mouse from the QEMU window. The VirtualBox VM must stay off, since VirtualBox and KVM cannot share VT-x.

Storage changed with it. The VDI had grown to 22 GB after the release upgrade and the tool installs, and sgoinfre stood at 29 of its 30 GB, so the qcow2 could only go to goinfre. That is also the faster place to run a VM from. Later the same night, once `make up` had passed under KVM, the old installer ISO (6 GB) and the VirtualBox disk (24 GB) were deleted from sgoinfre, and a compressed copy of the qcow2, checked with `qemu-img check` and compared against the source before the VDI went, took their place as the portable backup, next to the launch script. Rule from now on: the VM runs from goinfre, sgoinfre holds one compressed copy, refreshed after real changes inside the VM; the commands are in `docs/host-vm/vm-setup.md`. The VirtualBox VM is unregistered on the host; nothing of it remains.

Two side notes from the same day. The guest was upgraded from Ubuntu 24.04 to 26.04 by Software Updater before any of this; the consequence that matters is that Ubuntu 26.04 ships no `vagrant` package any more (Debian dropped it after HashiCorp's licence change), so Vagrant comes from HashiCorp's own apt repository and `vagrant-libvirt` is installed as a plugin, and `qemu-kvm` is now called `qemu-system-x86`. Under VirtualBox the upgraded guest also could not draw its login screen (the VMware SVGA driver rejected every cursor and page flip under GNOME 50), which the VBoxSVGA controller fixed; moot now.

### 2026-11-22: The Debian 13 box names its interfaces ens5 and ens6; the subject wants eth1

The first `make up` in `p1` built both VMs and ran the playbook through, but K3s refused to start: `unable to find interface eth1`. The box `cloud-image/debian-13` uses predictable interface names, so the NAT interface is `ens5` and the private one with 192.168.56.110 is `ens6`. The playbook pins `--flannel-iface eth1`, the test script checks `eth1`, the oral notes explain `eth1`, and the subject itself says the IP must sit on `eth1`.

Two ways out. Make the playbook interface-agnostic (look the interface up by its IP) and let the name be whatever the box gives: simpler, but then `ip a show eth1` fails at the defense and the subject's own wording is not met. Or give the guests classic names: a GRUB drop-in with `net.ifnames=0 biosdevname=0`, the netplan file (cloud-init, DHCP) and the systemd-networkd file (Vagrant, the private IP) rewritten to `eth0` and `eth1`, one reboot. The second was chosen and lives in `confs/ansible/eth-names.yml`, included once per play in `p1` and `p2`; after the first run the drop-in exists, so re-provisioning neither changes anything nor reboots. Cost: one reboot per VM on first provisioning, about 40 seconds each.

Open for discussion: a box that already uses `eth0`/`eth1` would remove the step entirely.
