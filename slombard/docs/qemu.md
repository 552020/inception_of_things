# **Core QEMU Stack**

| Package                 | Purpose                                                                      | Required For                 |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| `qemu-system`           | Full system emulators (x86, ARM, etc.)                                       | Always                       |
| `qemu-utils`            | Helper tools like `qemu-img` (for disk image creation, resizing, conversion) | Always                       |
| `libvirt-daemon-system` | Runs the libvirt service to manage VMs                                       | When using `vagrant-libvirt` |
| `libvirt-clients`       | CLI tools (`virsh`, `virt-install`)                                          | When using libvirt           |
| `virt-manager`          | Optional GUI for managing VMs                                                | Optional                     |
| `bridge-utils`          | Allows bridged networking (VMs on same LAN as host)                          | Optional                     |
| `dnsmasq-base`          | DHCP/DNS support for libvirt networks                                        | Libvirt only                 |
| `qemu-kvm`              | Enables hardware virtualization (KVM acceleration)                           | If host supports VT-x/AMD-V  |
| `virt-viewer`           | Lightweight GUI to view VM displays                                          | Optional                     |

---

### **For Vagrant Integration**

| Package / Plugin  | Purpose                                                 | Required For              |
| ----------------- | ------------------------------------------------------- | ------------------------- |
| `vagrant`         | Main tool                                               | Always                    |
| `vagrant-libvirt` | Libvirt provider plugin for Vagrant                     | If using libvirt          |
| `vagrant-qemu`    | Pure QEMU provider plugin (no libvirt)                  | If you cannot use libvirt |
| `vagrant-mutate`  | Converts VirtualBox/VMware boxes to libvirt/qemu format | Optional but useful       |

---

### **Typical Installation Commands**

#### If you can use libvirt (preferred setup):

```bash
sudo apt update
sudo apt install -y qemu-system qemu-utils qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils dnsmasq-base
vagrant plugin install vagrant-libvirt
vagrant plugin install vagrant-mutate
```

#### If you cannot use libvirt (no root / nested VM):

```bash
mkdir -p "$HOME/.local/bin"
curl -L -o "$HOME/.local/opt/vagrant.zip" \
  https://releases.hashicorp.com/vagrant/2.4.1/vagrant_2.4.1_linux_amd64.zip
unzip "$HOME/.local/opt/vagrant.zip" -d "$HOME/.local/bin"
export PATH="$HOME/.local/bin:$PATH"

sudo apt install -y qemu-system qemu-utils
vagrant plugin install vagrant-qemu
```

---

Do you want me to generate a **`setup-qemu.sh`** script that installs everything automatically for your no-sudo VM environment?
