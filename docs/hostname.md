# **📘 Hostname — Linux, macOS, Windows**

## **1. What is a Hostname?**

A **hostname** is the name a computer uses to identify itself on a network or locally in the operating system.

You see it:

- In your terminal prompt (e.g., `user@myComputer`)
- In network tools (SSH, ping, etc.)
- As a machine name in system settings

It exists on **all major operating systems**.

---

## **2. Linux**

### ✅ **Check hostname**

```bash
hostname
```

Or:

```bash
cat /etc/hostname
```

### ✅ **Change hostname (temporary, until reboot)**

```bash
sudo hostname myNewHostname
```

### ✅ **Change hostname permanently (systemd-based systems like Ubuntu, Debian, Fedora)**

```bash
sudo hostnamectl set-hostname myNewHostname
```

Optional: edit `/etc/hosts` to avoid warnings:

```
127.0.0.1   myNewHostname
```

---

## **3. macOS**

### ✅ **Check current hostname**

```bash
hostname
```

or more system-specific:

```bash
scutil --get HostName
```

### ✅ **Set system hostname (permanent)**

```bash
sudo scutil --set HostName myNewHostname
```

You may also want to set:

```bash
sudo scutil --set LocalHostName myNewHostname    # for AirDrop, local network
sudo scutil --set ComputerName myNewHostname    # Name shown in System Settings
```

To verify:

```bash
scutil --get HostName
```

---

## **4. Windows**

### ✅ **Check hostname**

Open **Command Prompt** or **PowerShell**, then:

```powershell
hostname
```

Or:

```powershell
wmic computersystem get name
```

### ✅ **Change hostname via GUI**

1. Open **Settings**
2. Go to **System → About**
3. Click **Rename this PC**
4. Enter new name → Restart

### ✅ **Change hostname via PowerShell (Admin)**

```powershell
Rename-Computer -NewName "MyNewHostname" -Force -Restart
```

---

## **5. Summary Table**

| OS      | Check hostname                        | Change (temporary)      | Change (permanent)                      |
| ------- | ------------------------------------- | ----------------------- | --------------------------------------- |
| Linux   | `hostname`                            | `sudo hostname newName` | `sudo hostnamectl set-hostname newName` |
| macOS   | `hostname` or `scutil --get HostName` | –                       | `sudo scutil --set HostName newName`    |
| Windows | `hostname`                            | –                       | `Rename-Computer -NewName newName`      |

---

## **6. Notes for your Kubernetes/Vagrant project**

- You will set the **hostname inside each VM** (not on your Mac or host system).
- For example, if your login is `alice`, the required hostnames are:

  - `aliceS` (server node)
  - `aliceSW` (worker node)

- In Linux VMs, you’ll typically set it using:

  ```bash
  sudo hostnamectl set-hostname aliceS
  ```
