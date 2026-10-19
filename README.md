# inception_of_things

## Host VM

The subject requires the whole project to run inside a virtual machine. On the 42 cluster that means one VirtualBox VM (the host VM) in which Vagrant, libvirt, K3s, Docker and K3d all run. Nested virtualization is enabled on it.

| Item | Value |
|------|-------|
| Name | `IoT` |
| OS | Ubuntu 24.04.5 LTS desktop |
| Location | `~/sgoinfre/IoT/` (`IoT.vbox` config and `IoT.vdi` disk) |
| ISO | `~/sgoinfre/iso/ubuntu-24.04.5.1-desktop-amd64.iso` |
| Resources | 6 CPUs, 8 GB RAM, 60 GB dynamically allocated disk |
| Network | NAT, host port 2222 forwarded to guest port 22 |
| Login | `slombard` |

Why sgoinfre: home is 5 GB and goinfre is local to one machine and wiped on user switch. Sgoinfre follows you across the cluster and keeps up to 30 GB, as long as it is used at least once every 6 months. Check its size now and then:

```bash
du -sh ~/sgoinfre
```

Start and stop from the host:

```bash
VBoxManage startvm IoT --type gui
VBoxManage controlvm IoT acpipowerbutton
```

Reach it from the host once openssh-server is installed inside:

```bash
ssh -p 2222 slombard@localhost
```

The full rebuild procedure, disk resizing and recovery steps are in [slombard/docs/vm-setup.md](slombard/docs/vm-setup.md).

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

GNOME screenshots (Ubuntu 24.04):

| Shortcut | What it does |
|----------|--------------|
| `Print` | Opens the screenshot overlay. Area selection is the default: drag a rectangle, press Enter. Saved to `~/Pictures/Screenshots` and copied to the clipboard. |
| `Shift+Print` | Full screen immediately. |
| `Alt+Print` | Active window immediately. |

GNOME 42+ dropped the old `Shift+Ctrl+Print` binding, so use `Print` for partial screenshots.

Inside the VirtualBox window, click into the VM first so the `Print` key reaches the guest and not the host.

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

Sgoinfre had been emptied, taking the IoT VM, its disk and the Ubuntu ISO with it. Likely cause is the 6-month inactivity purge. Rebuilt from scratch the same day; the exact commands are in `slombard/docs/vm-setup.md`. Lesson: anything in sgoinfre must be rebuildable from the repo, and the rebuild steps must be written down.

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

It was, in the first version. The original playbook dropped the K3s node token into the `/vagrant` shared folder, which both VMs see only because they share a host. Two real servers have no shared folder. Commit `41683e9` replaced that with Ansible SSH delegation, and the current flow is honest:

1. Ansible, running on the host VM, SSHes into the server and waits for `/var/lib/rancher/k3s/server/node-token` to appear.
2. It reads the file over SSH (`slurp` with `delegate_to: slombardS`).
3. It SSHes into the worker and runs the K3s agent install with the token and `K3S_URL=https://192.168.56.110:6443`.
4. From then on the worker talks to the server over `eth1` on its own.

Nothing crosses between the nodes except over the network, which is what would happen between two physical servers. The facilitator is Ansible, and a config management tool with SSH access to every machine is the normal way join secrets move around a fleet. Swap the two IPs for real ones and the playbook is unchanged.

What production usually does differently: generate the token up front, keep it in a secrets store, and pass it to both server and worker as `K3S_TOKEN`. That removes the read-back step and lets you add workers later without touching the server. Possible small improvement to p1, not required by the subject.
