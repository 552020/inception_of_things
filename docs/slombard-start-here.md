# slombard: start here

Last updated 2026-11-22, end of the night session.

## Branch

Work on **`host-vm-kvm`**, open as [PR #6](https://github.com/552020/inception_of_things/pull/6). Discuss it with Robin before merging; it changes `p1` and `p2` (interface names, server memory, `make up`), moves the host VM to QEMU/KVM, and holds the bonus in progress.

```bash
git fetch origin && git checkout host-vm-kvm && git pull
```

## Picking a seat

RAM is the only thing that matters; this project wants 32 GB (8 GB VM with two nested VMs, k3d, GitLab). Cluster 3 seats have 16 GB. At any seat, before settling in:

```bash
free -g | sed -n 2p; lscpu | grep 'Model name'
```

31 or more in the first column: take it.

## Getting the VM up at a seat

The VM disk runs from goinfre (local, fast, wiped on user switch). The portable copy is in sgoinfre.

```bash
mkdir -p ~/goinfre/VMs
cp ~/sgoinfre/IoT/IoT.qcow2 ~/goinfre/VMs/IoT.qcow2      # only if goinfre is empty
cp ~/sgoinfre/IoT/iot-kvm.sh ~/goinfre/VMs/
~/goinfre/VMs/iot-kvm.sh                                 # window; add "headless" for none
ssh -p 2222 slombard@localhost
```

Inside the VM the repo is at `~/42/inception_of_things`. Never start the old VirtualBox VM; it is unregistered and gone from sgoinfre.

## Tests to do, in order

1. **p1**: `make up` in `p1`, then `make test`. Expect both nodes Ready, 192.168.56.110 on `eth1`. Last measured: `make up` 102 s.
2. **Open problem**: right after `make up`, `vagrant ssh rpodackS` and watch `free -m`, `iostat 5` and `journalctl -u k3s -f` for five minutes. A second playbook run (`make provision`) stalled the server twice; cause unknown. Find out whether the server dies on its own or only under the re-provision.
3. **p2**: `make up` in `p2`, then from the host VM `curl -H "Host: app1.com" 192.168.56.110`, same for `app2.com`, and a plain `curl 192.168.56.110` for app3. Time it for the README table.
4. **p3**: `make setup` in `p3`, Argo CD UI on port 8080, app on 30007, then the v1 to v2 change by pushing to `rpodackIoT`. Time it.
5. **bonus**: see `bonus/` and its commit message; the repository step is untested.

Put the times into the "Setup times" table in the README on the branch.

## Where things are

| What | Where |
|------|-------|
| VM disk, running | `~/goinfre/VMs/IoT.qcow2` |
| VM disk, backup | `~/sgoinfre/IoT/IoT.qcow2` (compressed) |
| Launch script | `docs/host-vm/iot-kvm.sh`, copy in `~/goinfre/VMs/` |
| VM docs | `docs/host-vm/vm-setup.md` |
| Test logs from 2026-11-22 | inside the VM, `~/p1_up*.log` |

Refresh the backup after real changes inside the VM (tool installs, config), with the VM shut down:

```bash
qemu-img convert -p -c -O qcow2 ~/goinfre/VMs/IoT.qcow2 ~/sgoinfre/IoT/IoT.qcow2
```
