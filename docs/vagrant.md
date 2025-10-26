# 📄 **Vagrant Primer (for our Kubernetes / Inception-of-Things Project)**

## ✅ **What is Vagrant?**

Vagrant is a tool that automates the creation of virtual machines.
It allows us to define everything (OS, hostname, IP address, provisioning scripts…) in a single file called **`Vagrantfile`**, so our setup is:

- **Reproducible**
- **Automated**
- **Shareable** across team members

Vagrant itself does **not run virtual machines**. It uses providers like:

- VirtualBox
- QEMU/libvirt
- VMware
- Parallels

---

## ✅ **Why we use it in this project**

In **Part 1** of the subject, we must:
✔ Create **two virtual machines**
✔ Assign **specific hostnames and static IPs**
✔ Connect via **SSH without a password**
✔ Install **K3s server on the first VM and K3s agent on the second**

Vagrant lets us do all of that automatically.

---

## ✅ **Basic Vagrant Workflow**

```bash
vagrant up          # Creates and starts the VM(s)
vagrant ssh <name>  # Connect to a VM via SSH
vagrant halt        # Stops the VM(s)
vagrant destroy     # Deletes the VM(s)
vagrant reload      # Restart with updated Vagrantfile
```

---

## ✅ **Minimal Example — Two Machines**

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"   # Base OS image (Ubuntu 22.04)

  # ────────────── Server (Master Node) ──────────────
  config.vm.define "aliceS" do |node|
    node.vm.hostname = "aliceS"                             # Required by subject
    node.vm.network "private_network", ip: "192.168.56.110" # Static IP for master

    node.vm.provider "virtualbox" do |vb|                   # Or "libvirt" for QEMU
      vb.memory = 1024
      vb.cpus   = 1
    end
  end

  # ────────────── Worker Node ──────────────
  config.vm.define "aliceSW" do |node|
    node.vm.hostname = "aliceSW"
    node.vm.network "private_network", ip: "192.168.56.111"

    node.vm.provider "virtualbox" do |vb|
      vb.memory = 1024
      vb.cpus   = 1
    end
  end
end
```

Replace `alice` with your own login.

---

## ✅ **Where Hostname, IP, and OS Are Defined**

| Config           | Where it is set                                           |
| ---------------- | --------------------------------------------------------- |
| Operating System | `config.vm.box = "ubuntu/jammy64"`                        |
| Hostname         | `node.vm.hostname = "aliceS"`                             |
| Private IP       | `node.vm.network "private_network", ip: "192.168.56.110"` |

These are applied **before any provisioning or K3s installation**.

---

## ✅ **After VMs are created**

You should be able to run:

```bash
vagrant ssh aliceS
hostname        # → aliceS
ip a            # → shows 192.168.56.110 on eth1
```

---

### ✅ That’s it — this is all you need to understand the Vagrant part before moving on to installing K3s.

Want me to extend this with provisioning (scripts for installing K3s), or keep it clean like this?
