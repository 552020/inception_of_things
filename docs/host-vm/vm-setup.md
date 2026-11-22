# VM Setup and Maintenance

The host VM runs under QEMU/KVM on the 42 host since 2026-11-22. The VirtualBox procedure it replaced is kept at the end for reference.

## Storage layout at 42

| Location | Size | Accessible anywhere | Persistent | Speed |
|----------|------|-------------------|------------|-------|
| Home (`~`) | 5GB | Yes | Yes | local |
| Goinfre | about 140GB | No (local only) | No (deleted on user switch) | local NVMe |
| Sgoinfre | 30GB | Yes | Yes (if under 30GB and used within 6 months) | network share |

The running disk sits in goinfre: it is the only place that is both big enough and fast enough. Sgoinfre holds a compressed copy, which is what you restore from at another seat or after a wipe.

Current VM location: `~/goinfre/VMs/IoT.qcow2` (31 GB file, 22 GB used inside, 60 GB virtual)
Backup: `~/sgoinfre/IoT/IoT.qcow2` (compressed, 16.8 GB, made 2026-11-22 01:44, checked and byte-identical to the local compressed copy) next to `iot-kvm.sh`; sgoinfre then holds 16 GB of its 30 GB
Symlinks on the host: `~/goinfre -> /goinfre/slombard`, `~/sgoinfre -> /sgoinfre/goinfre/Perso/slombard`

## Start, stop, reach

```bash
docs/host-vm/iot-kvm.sh              # window on the desktop
docs/host-vm/iot-kvm.sh headless     # no window
ssh -p 2222 slombard@localhost
ssh -p 2222 slombard@localhost sudo poweroff
```

The script takes the disk path, memory, CPU count and SSH port from the environment (`IOT_DISK`, `IOT_MEM`, `IOT_CPUS`, `IOT_SSH_PORT`). It writes a PID file and a QEMU monitor socket next to the disk. Extra QEMU arguments after the first word go through: `docs/host-vm/iot-kvm.sh headless -m 12288`.

If a boot hangs or the guest freezes, the monitor socket gives you a screenshot and a hard reset without a window:

```bash
echo 'screendump /tmp/iot.ppm' | nc -U ~/goinfre/VMs/IoT.monitor
echo 'system_reset' | nc -U ~/goinfre/VMs/IoT.monitor
echo 'quit' | nc -U ~/goinfre/VMs/IoT.monitor        # hard power off
```

VirtualBox and KVM cannot both hold VT-x. A running VirtualBox VM stops QEMU from starting with KVM, and the other way round.

## Backup to sgoinfre

Shut the VM down first. A compressed qcow2 copies only the used blocks and shrinks them:

```bash
mkdir -p ~/sgoinfre/IoT
qemu-img convert -p -c -O qcow2 ~/goinfre/VMs/IoT.qcow2 ~/sgoinfre/IoT/IoT.qcow2
du -sh ~/sgoinfre
```

Compression takes about 6 minutes on the local disk and the copy to sgoinfre about 3 minutes (measured 2026-11-22; 85% of clusters compressed, 16.8 GB out of 31 GB). Do this after real work inside the VM (tool installs, configuration), not after every session; the Vagrant VMs, the K3s clusters and the k3d cluster are rebuilt from the repo and are not worth backing up.

## Restore from sgoinfre

At a new seat, or after goinfre was wiped:

```bash
mkdir -p ~/goinfre/VMs
cp ~/sgoinfre/IoT/IoT.qcow2 ~/goinfre/VMs/IoT.qcow2
docs/host-vm/iot-kvm.sh
```

The compressed copy runs as it is; QEMU decompresses on read and writes new blocks uncompressed. Copying it is enough.

## Disk full inside the VM

If the VM disk hits 100% it freezes on any write. Do not run apt on a full disk; free space with plain `rm` first:

```bash
sudo rm -rf /var/cache/apt/archives/*.deb
sudo rm -rf /var/log/*.gz /var/log/*.1
docker system prune -af          # if Part 3 images pile up
df -h /
```

## Resizing the disk

Shut down the VM, grow the image on the host, then grow the partition and filesystem inside:

```bash
qemu-img resize ~/goinfre/VMs/IoT.qcow2 +20G
docs/host-vm/iot-kvm.sh headless
ssh -p 2222 slombard@localhost
sudo growpart /dev/vda 2
sudo resize2fs /dev/vda2
df -h /
```

Inside the VM the disk is `/dev/vda` (virtio), no longer `/dev/sda`.

## Rebuild from scratch

Only if both the goinfre disk and the sgoinfre backup are gone. Install Ubuntu desktop into a fresh qcow2 under QEMU, then install the tools.

```bash
mkdir -p ~/goinfre/VMs ~/sgoinfre/iso
curl -L -o ~/sgoinfre/iso/ubuntu-26.04-desktop-amd64.iso https://releases.ubuntu.com/26.04/ubuntu-26.04-desktop-amd64.iso
qemu-img create -f qcow2 ~/goinfre/VMs/IoT.qcow2 60G
docs/host-vm/iot-kvm.sh window -cdrom ~/sgoinfre/iso/ubuntu-26.04-desktop-amd64.iso -boot d
```

Run the installer (erase disk, user `slombard`), reboot without the `-cdrom` arguments, then inside the VM:

```bash
sudo apt update
sudo apt install -y openssh-server
echo "slombard ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/slombard && sudo chmod 440 /etc/sudoers.d/slombard
```

From the host, `ssh-copy-id -p 2222 slombard@localhost`, then the tool installs over SSH:

```bash
sudo apt install -y git curl wget make gnupg cpu-checker \
  qemu-system-x86 qemu-utils libvirt-daemon-system libvirt-clients virtinst bridge-utils dnsmasq-base \
  libvirt-dev build-essential ansible
sudo usermod -aG libvirt,kvm "$USER"
# Vagrant: Ubuntu 26.04 has no package, use HashiCorp's repository
wget -qO- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com noble main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install -y vagrant
vagrant plugin install vagrant-libvirt
# Part 3: Docker, kubectl (repo script), then k3d and argocd
bash p3/scripts/installationhost.sh
make -C p3 check-k3d
```

Log out and in again so the group memberships apply, then `kvm-ok` must say KVM acceleration can be used.

## History: the VirtualBox VM (2026-10-19 to 2026-11-22)

Built with `VBoxManage` from the Ubuntu 24.04.5 desktop ISO, 6 CPUs, 8 GB, 60 GB VDI in sgoinfre, nested VT-x on, NAT with host port 2222 to guest 22. It froze twice under nested virtualization during Part 1 (see the journal in the README) and was converted to the qcow2 above with:

```bash
qemu-img convert -p -f vdi -O qcow2 ~/sgoinfre/IoT/IoT.vdi ~/goinfre/VMs/IoT.qcow2
```

The original `VBoxManage` build commands, if ever needed again, are in this file's history before 2026-11-22 (`git log -- docs/host-vm/vm-setup.md`).
