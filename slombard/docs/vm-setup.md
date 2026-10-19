# VM Setup and Maintenance

## Storage layout at 42

| Location | Size | Accessible anywhere | Persistent |
|----------|------|-------------------|------------|
| Home (`~`) | 5GB | Yes | Yes |
| Goinfre | Unlimited | No (local only) | No (deleted on user switch) |
| Sgoinfre | 30GB | Yes | Yes (if under 30GB) |

**VDI files must be stored in sgoinfre** — they are too large for home, and goinfre is lost when another user logs in.

Current VM location: `/sgoinfre/goinfre/Perso/slombard/IoT/IoT.vdi` (rebuilt 2026-10-19 after sgoinfre was purged)
Symlink on host: `~/sgoinfre -> /sgoinfre/goinfre/Perso/slombard`

## VM files explained

A VirtualBox VM needs two things:
- `.vbox` — the VM config (CPU, RAM, network, disk paths). Small, can live in home.
- `.vdi` — the virtual disk (OS + all data). Large, must live in sgoinfre.

The `.vdi` is **dynamically allocated**: the file on disk only grows as the VM actually uses space. A 60GB virtual disk won't take 60GB in sgoinfre unless the VM fills it.

## Disk full - recovery procedure

If the VM disk hits 100% it will freeze on any write operation (apt, logs, etc.).

**Do not run apt on a full disk** — it writes heavily and will hang the machine.

Instead, use simple `rm` commands:

```bash
sudo rm -rf /var/cache/apt/archives/*.deb
sudo rm -rf /var/log/*.gz /var/log/*.1
sudo rm -rf /var/lib/libvirt          # if libvirt not needed
```

Then check freed space:
```bash
df -h /
```

## Resizing the VDI (host side)

Shut down the VM first, then on the host:

```bash
VBoxManage modifyhd "/home/slombard/sgoinfre/IoT/IoT.vdi" --resize 61440
```

(`61440` = 60GB in MB)

## Expanding the partition (inside VM)

After resizing the VDI, the partition and filesystem still need to be expanded inside the VM:

```bash
sudo growpart /dev/sda 2
sudo resize2fs /dev/sda2
df -h /
```

## Backup strategy given 42 storage constraints

### The problem
- Sgoinfre is wiped if folder exceeds 30GB or unused for 6 months
- Goinfre is wiped when another user logs in
- Home is only 5GB — too small for VDI files

### Current actual usage in sgoinfre
- `IoT.vdi` — fresh install on 2026-10-19, grows as the VM fills up
- `iso/ubuntu-24.04.5.1-desktop-amd64.iso` — 5.9GB, can be deleted after the install is confirmed working

### Rules to stay safe
1. **Monitor sgoinfre size regularly:**
   ```bash
   du -h -d 0 /sgoinfre/goinfre/Perso/slombard
   ```
2. **Keep the VM disk lean** — don't accumulate Docker images you don't need, clean apt cache after big installs
3. **The Vagrantfile is in git** — the K3s cluster (p1, p2, p3) can always be rebuilt from scratch with `vagrant up`. Don't treat those VMs as precious.
4. **The IoT VM (Ubuntu desktop) is precious** — it contains your working environment. Back it up externally (USB drive or personal cloud) before it exceeds 30GB in sgoinfre.

### What to back up externally
Only the IoT.vdi needs an external backup. Everything else is in git or rebuildable.

Export a compressed copy when you have a stable working state:
```bash
VBoxManage clonemedium disk "/home/slombard/sgoinfre/IoT/IoT.vdi" ~/backup-IoT.vdi --format VDI
```
Then move `backup-IoT.vdi` to a USB drive or personal cloud storage.

## Current state

- Rebuilt on 2026-10-19: the previous VM and everything else in sgoinfre had been purged
- Virtual disk size: 60GB, dynamically allocated
- VM OS: Ubuntu 24.04.5 LTS desktop, user `slombard`
- 6 CPUs, 8GB RAM, nested VT-x enabled, NAT with host port 2222 forwarded to guest 22

## Rebuild from scratch (host side)

```bash
mkdir -p ~/sgoinfre/iso && cd ~/sgoinfre/iso
curl -L -O https://releases.ubuntu.com/24.04/ubuntu-24.04.5.1-desktop-amd64.iso
VBoxManage createvm --name IoT --ostype Ubuntu_64 --basefolder ~/sgoinfre --register
VBoxManage modifyvm IoT --cpus 6 --memory 8192 --vram 128 --graphicscontroller vmsvga \
  --nested-hw-virt on --nested-paging on --paravirtprovider kvm --ioapic on \
  --nic1 nat --audio-enabled off --usb off --clipboard-mode bidirectional \
  --boot1 dvd --boot2 disk --boot3 none --boot4 none
VBoxManage createmedium disk --filename ~/sgoinfre/IoT/IoT.vdi --size 61440 --format VDI
VBoxManage storagectl IoT --name SATA --add sata --controller IntelAhci --portcount 2 --bootable on
VBoxManage storageattach IoT --storagectl SATA --port 0 --device 0 --type hdd --medium ~/sgoinfre/IoT/IoT.vdi
VBoxManage storageattach IoT --storagectl SATA --port 1 --device 0 --type dvddrive --medium ~/sgoinfre/iso/ubuntu-24.04.5.1-desktop-amd64.iso
VBoxManage modifyvm IoT --natpf1 "ssh,tcp,127.0.0.1,2222,,22"
VBoxManage startvm IoT --type gui
```

Then run the Ubuntu installer interactively (erase disk, user `slombard`). After the first reboot, detach the ISO:

```bash
VBoxManage storageattach IoT --storagectl SATA --port 1 --device 0 --type dvddrive --medium emptydrive
```
