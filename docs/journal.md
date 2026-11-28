# Journal

Decisions and the reasoning behind them, newest last.

## 2026-10-19: Why the whole project runs inside a VM

The subject says "the whole project has to be done in a virtual machine". On the 42 cluster this is not a style choice, it is the only way, for the same reason Inception needed a VM: we have no sudo on the host, and everything here needs root.

- Vagrant, libvirt, Docker and K3d are system packages and daemons. No apt, no systemd services without root.
- The 192.168.56.0/24 network the subject demands is a host-only or libvirt network. Creating it means creating bridge interfaces, a root operation.
- K3s installs as a systemd service, binds ports 80, 443 and 6443, and rewrites iptables for Traefik, ServiceLB and kube-proxy. Docker does the same for its bridge. Not possible unprivileged, and not something to do on a shared campus machine anyway.
- Part 2 tests `app1.com` and `app2.com`, which means editing `/etc/hosts` or sending a Host header. Same wall as Inception.
- The VM lives in sgoinfre, so it follows us to any seat and the defense can happen on any machine.

Consequence: one Ubuntu VM in VirtualBox with nested virtualization on, and inside it Vagrant with the libvirt provider for Part 1 and 2, Docker and K3d for Part 3. We have sudo inside the VM, so every tool installs normally there.

## 2026-10-19: The VM was lost and rebuilt

Sgoinfre had been emptied, taking the IoT VM, its disk and the Ubuntu ISO with it. Likely cause is the 6-month inactivity purge. Rebuilt from scratch the same day; the exact commands are in `docs/host-vm/vm-setup.md`. Lesson: anything in sgoinfre must be rebuildable from the repo, and the rebuild steps must be written down.

## 2026-10-20: Can the host VM be launched without a desktop application?

Yes, and the 42 host supports it. What the host offers without sudo: `qemu-system-x86_64` is installed, our user has read-write access to `/dev/kvm` through an ACL, and the host kernel runs KVM with nested virtualization on. What it lacks: access to the libvirt socket, so `virsh` and `vagrant-libvirt` on the host are out, but raw QEMU does not need libvirt.

Two levels:

1. **Keep VirtualBox, drop every click.** `VBoxManage` is a complete CLI; the VM in this repo was built entirely with it. The one GUI step, the Ubuntu installer, disappears by using the Ubuntu cloud image (`ubuntu-24.04-server-cloudimg-amd64.img`, about 600MB, preinstalled) plus a cloud-init NoCloud seed that sets user, password and SSH key on first boot. Start headless, SSH in.
2. **Drop VirtualBox for QEMU/KVM.** Same cloud image, launched with one `qemu-system-x86_64` command: `-enable-kvm -cpu host` (so the guest sees VT-x and runs libvirt at full speed), a qcow2 disk in sgoinfre, user-mode networking with `hostfwd` for SSH, `-display none`. No root, no daemon, no GUI. Everything except the downloaded image lives in the repo as a Makefile.

Cost of both: no desktop and no browser inside the VM. Part 2 is then tested with `curl -H "Host: app1.com" 192.168.56.110`, which matches the subject's own example output.

Hard constraint: on Linux, VirtualBox and KVM cannot both hold VT-x. A running QEMU/KVM VM blocks VirtualBox from starting a VM and vice versa. Pick one.

Why VirtualBox with the interactive installer was used for the 2026-10-19 rebuild anyway: it matched the team's previous setup, 42 evaluators expect VirtualBox, and a desktop with Firefox is the least surprising thing to show at a defense. The QEMU route is sound and arguably cleaner; it is about one Makefile of work and a good follow-up.

An earlier attempt at this by the team went nowhere, but it was only discussed and never committed, so there is no trace in the repo. From the notes that remain, the likely culprits were the `vagrant-qemu` plugin and running libvirt with the plain `qemu` driver, i.e. software emulation, because the outer VM had no nested VT-x. Any new attempt must give the outer VM `-cpu host` (QEMU) or `--nested-hw-virt on` (VirtualBox) so that KVM is available inside. Without that, every Vagrant box takes minutes to boot and K3s is unusable.

## 2026-10-20: A proven headless setup exists: mc-putchar's repo

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

## 2026-10-20: Is the Part 1 token exchange "facilitated" by both VMs living on one laptop?

It was, in the first version. The original playbook dropped the K3s node token into the `/vagrant` shared folder, which both VMs see only because they share a host. Two real servers have no shared folder. Commit `41683e9` replaced that with Ansible SSH delegation; the `p1` in the repo today is Robin's, and it works the same way:

1. Ansible, running on the host VM, SSHes into the server and waits for `/var/lib/rancher/k3s/server/node-token` to appear.
2. It reads the file over SSH (`slurp` with `delegate_to` to the server VM, today `rpodackS`).
3. It SSHes into the worker and runs the K3s agent install with the token and `K3S_URL=https://192.168.56.110:6443`.
4. From then on the worker talks to the server over `eth1` on its own.

Nothing crosses between the nodes except over the network, which is what would happen between two physical servers. The facilitator is Ansible, and a config management tool with SSH access to every machine is the normal way join secrets move around a fleet. Swap the two IPs for real ones and the playbook is unchanged.

What production usually does differently: generate the token up front, keep it in a secrets store, and pass it to both server and worker as `K3S_TOKEN`. That removes the read-back step and lets you add workers later without touching the server. Possible small improvement to p1, not required by the subject.

## 2026-11-22: VirtualBox froze under nested virtualization; the host VM moved to QEMU/KVM

The first full run of `p1` froze the Ubuntu host VM twice. Same signature both times: the guest clock stopped, `VBox.log` said "Guest seems to be unresponsive", and most vCPU threads sat at 100% on the same instruction, the picture of a kernel waiting for a cross-CPU call that a vCPU in nested-guest mode never answers. The first freeze came while the second nested VM booted, the second with a single nested VM, two minutes in. The weak piece was VirtualBox's own nested VT-x.

So route 2 from the 2026-10-20 entry was taken, with the existing disk rather than a cloud image: `qemu-img convert` turned the VDI into a qcow2 in three minutes, and `qemu-system-x86_64 -enable-kvm -cpu host` boots it. Same Ubuntu, same desktop, same user, same SSH port; `kvm-ok` passes inside, libvirt and Docker come up, the guest boots in about ten seconds. The launch script is `docs/host-vm/iot-kvm.sh`, so the host VM is once more something the repo can rebuild.

What is different for whoever sits at the host: no VirtualBox manager and no guest additions, so the desktop does not follow the window size and there is no shared clipboard; copy over SSH instead. `Ctrl+Alt+G` releases the mouse from the QEMU window. The VirtualBox VM must stay off, since VirtualBox and KVM cannot share VT-x.

Storage changed with it. The VDI had grown to 22 GB after the release upgrade and the tool installs, and sgoinfre stood at 29 of its 30 GB, so the qcow2 could only go to goinfre. That is also the faster place to run a VM from. Later the same night, once `make up` had passed under KVM, the old installer ISO (6 GB) and the VirtualBox disk (24 GB) were deleted from sgoinfre, and a compressed copy of the qcow2, checked with `qemu-img check` and compared against the source before the VDI went, took their place as the portable backup, next to the launch script. Rule from now on: the VM runs from goinfre, sgoinfre holds one compressed copy, refreshed after real changes inside the VM; the commands are in `docs/host-vm/vm-setup.md`. The VirtualBox VM is unregistered on the host; nothing of it remains.

Two side notes from the same day. The guest was upgraded from Ubuntu 24.04 to 26.04 by Software Updater before any of this; the consequence that matters is that Ubuntu 26.04 ships no `vagrant` package any more (Debian dropped it after HashiCorp's licence change), so Vagrant comes from HashiCorp's own apt repository and `vagrant-libvirt` is installed as a plugin, and `qemu-kvm` is now called `qemu-system-x86`. Under VirtualBox the upgraded guest also could not draw its login screen (the VMware SVGA driver rejected every cursor and page flip under GNOME 50), which the VBoxSVGA controller fixed; moot now.

## 2026-11-22: The Debian 13 box names its interfaces ens5 and ens6; the subject wants eth1

The first `make up` in `p1` built both VMs and ran the playbook through, but K3s refused to start: `unable to find interface eth1`. The box `cloud-image/debian-13` uses predictable interface names, so the NAT interface is `ens5` and the private one with 192.168.56.110 is `ens6`. The playbook pins `--flannel-iface eth1`, the test script checks `eth1`, the oral notes explain `eth1`, and the subject itself says the IP must sit on `eth1`.

Two ways out. Make the playbook interface-agnostic (look the interface up by its IP) and let the name be whatever the box gives: simpler, but then `ip a show eth1` fails at the defense and the subject's own wording is not met. Or give the guests classic names: a GRUB drop-in with `net.ifnames=0 biosdevname=0`, the netplan file (cloud-init, DHCP) and the systemd-networkd file (Vagrant, the private IP) rewritten to `eth0` and `eth1`, one reboot. The second was chosen and lives in `confs/ansible/eth-names.yml`, included once per play in `p1` and `p2`; after the first run the drop-in exists, so re-provisioning neither changes anything nor reboots. Cost: one reboot per VM on first provisioning, about 40 seconds each.

Open for discussion: a box that already uses `eth0`/`eth1` would remove the step entirely.

## 2026-11-28: The K3s servers get 2 CPUs and 2 GB, more than the subject advises

The subject says, for Part 1: "It is STRONGLY advised to allow only the bare minimum in terms of resources: 1 CPU, 512 MB of RAM (or 1024)." It is advice, not a rule, and the evaluation sheet has no check on CPU or memory. We follow it for the worker and depart from it for the K3s servers, for three reasons.

**1. At 1024 MB the server ran out of memory.** On 2026-11-28, `make up` in `p1` passed in 113 s and the server reported Ready. Less than a minute later it stopped answering, over SSH and to kubectl. The last health sample before that, taken by `make watch`:

| Measure | Value |
|---------|-------|
| Memory, total / available | 967 MB / 11 MB, no swap |
| `k3s-server` resident memory | 689 MB |
| Memory pressure (avg10) | 48 % |
| I/O pressure (avg10) | 71 % |
| Disk reads / writes since boot | 462 048 / 12 679 |

Many reads and few writes with no free memory is thrashing: the kernel keeps evicting program pages and reading them back from disk. It happens while K3s pulls and starts its bundled add-ons (CoreDNS, Traefik, metrics-server, ServiceLB, local-path). The stall seen on 2026-11-22 at 512 MB and at 1024 MB was the same thing; it only looked tied to the second provisioning pass because it began at that moment.

**2. K3s documents more for a server.** The [K3s requirements](https://docs.k3s.io/installation/requirements) give 2 cores and 2 GB as the minimum for a server node, and 1 core and 512 MB for an agent. The [K3s resource profiling](https://docs.k3s.io/reference/resource-profiling) measured a server with a simple workload at about 1.6 GB. The subject's numbers fit the agent; for the server they are below what K3s itself asks for. The subject was written for an older K3s that advertised itself as running in about 512 MB.

**3. It keeps the subject's own principle.** The subject asks for the bare minimum. For a current K3s server the bare minimum is 2 cores and 2 GB, so that is what the servers get, and no more.

| VM | Role | CPUs | Memory | Against |
|----|------|------|--------|---------|
| `rpodackS` in `p1` | K3s server | 2 | 2048 MB | K3s server minimum |
| `rpodackSW` in `p1` | K3s agent | 1 | 512 MB | subject and K3s agent minimum |
| `rpodackS` in `p2` | K3s server, three apps | 2 | 2048 MB | K3s server minimum |

**The result, same day.** Three runs of `p1`, each from scratch with the box cached and nothing else running in the guest:

| Server | `make up` | Server after the install (`make watch`, 5 min) | `make test` |
|--------|-----------|-----------------------------------------------|-------------|
| 1 CPU, 1024 MB, as the subject advises | 113 s | out of memory, unreachable to the end of the window and 3 minutes after | not reachable |
| 1 CPU, 1024 MB, without Traefik, metrics-server, ServiceLB | 109 s | unreachable for about 3.5 minutes with 62 MB free, then recovered | 14 of 14 |
| 2 CPUs, 2048 MB, K3s as shipped | 103 s | never unreachable; at least 715 MB available; memory pressure 0.15 %, I/O pressure 8 % | 14 of 14 |

With 2048 MB the disk reads in the first sample dropped from 462 048 to 5 882: no more thrashing. Turning off the add-ons helped only partly and would make `p1` a non-standard K3s, while `p2` needs Traefik anyway; memory is what fixes it. Swap was not tried: Kubernetes is designed to run without it.

At the defense, if asked: show this entry, the K3s requirements page and the measured sample above.
