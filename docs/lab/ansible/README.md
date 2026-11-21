# Ansible on the host

Part 1 and Part 2 provision their VMs with an Ansible playbook, so Ansible has to be installed on the machine that runs `vagrant up` (the host VM). This Makefile checks for it and installs it.

```bash
make check-ansible     # says whether Ansible is installed, and which version
make install-ansible   # installs it with apt if it is missing
```

It was written on 2025-11-02, together with the first Ansible playbook for Part 1, and stood at the root of the repository until 2026-11-21. Nothing calls it: `p1` and `p2` assume Ansible is already there. It is kept here as a helper for setting up a new host VM, not as part of the turned-in work.
