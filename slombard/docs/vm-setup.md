# VM Setup and Maintenance

## Storage layout at 42

| Location | Size | Accessible anywhere | Persistent |
|----------|------|-------------------|------------|
| Home (`~`) | 5GB | Yes | Yes |
| Goinfre | Unlimited | No (local only) | No (deleted on user switch) |
| Sgoinfre | 30GB | Yes | Yes (if under 30GB) |

**VDI files must be stored in sgoinfre** — they are too large for home, and goinfre is lost when another user logs in.

Current VM location: `/sgoinfre/goinfre/Perso/slombard/IoT/IoT/IoT.vdi`
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
VBoxManage modifyhd "/home/slombard/sgoinfre/IoT/IoT/IoT.vdi" --resize 61440
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
- `IoT.vdi` — grows as VM fills up, currently ~14GB
- `IoT2_1.vdi` — 7.5GB
- Total: ~21.5GB — still under 30GB limit but watch it

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
VBoxManage clonemedium disk "/home/slombard/sgoinfre/IoT/IoT/IoT.vdi" ~/backup-IoT.vdi --format VDI
```
Then move `backup-IoT.vdi` to a USB drive or personal cloud storage.

## Current state

- Virtual disk size: 60GB
- Actual disk usage: ~14GB
- Free space: ~43GB
- VM OS: Ubuntu 24.04 LTS
