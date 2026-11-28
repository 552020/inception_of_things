# Inception-of-Things

## The project

Three small Kubernetes setups, each running on its own inside one Linux virtual machine,
the host VM.

- **Part 1: K3s and Vagrant, a cluster of two machines.** Vagrant creates two virtual
  machines and Ansible installs K3s, a lightweight Kubernetes, on both. One is the server
  and runs the control plane; the other is a worker that joins it over a private network
  (192.168.56.110 and 192.168.56.111).
- **Part 2: K3s and Traefik, three web applications behind one address.** One virtual
  machine runs K3s with three applications. Traefik, the Ingress controller that comes with
  K3s, picks the application by the host name in the request: app1.com, app2.com, and
  anything else goes to app3. The second application runs as three replicas.
- **Part 3: K3d and Argo CD, continuous deployment from GitHub.** K3d runs a K3s cluster as
  Docker containers. Argo CD, inside the cluster, watches a public GitHub repository and
  keeps the running application equal to what the repository says: change the version
  there and push, and the cluster follows.
- **Bonus: GitLab.** Part 3 with a GitLab running inside the cluster in place of GitHub.

## Folder structure

| Folder | What |
|--------|------|
| `p1` | Part 1: Vagrantfile, Ansible playbook, test script |
| `p2` | Part 2: Vagrantfile, Ansible playbook, the manifests of the three applications |
| `p3` | Part 3: install script, k3d and Argo CD setup, the Argo CD Application |
| `bonus` | Bonus: GitLab and Argo CD setup |

## Where we depart from the subject

The subject strongly advises 1 CPU and 512 MB of RAM (or 1024) per virtual machine. We follow
that for the worker of Part 1, `rpodackSW`: 1 CPU, 512 MB. The K3s server of Parts 1 and 2,
`rpodackS`, gets 2 CPUs and 2048 MB:

- K3s documents 2 cores and 2 GB as the minimum for a server node, and 1 core and 512 MB for
  an agent ([K3s requirements](https://docs.k3s.io/installation/requirements)).
- At 1024 MB our server ran out of memory about a minute after K3s started: 11 MB available,
  K3s alone using 689 MB, and it stopped answering. At 2048 MB it stays responsive, with more
  than 700 MB free.

## Requirements

Everything runs inside one virtual machine, as the subject asks. Ours: Ubuntu 26.04 with
6 CPUs, 8 GB of RAM and nested virtualization enabled, so that VMs can run inside it.

- Parts 1 and 2: Vagrant with the libvirt provider (vagrant-libvirt), QEMU/KVM, Ansible.
- Part 3 and bonus: Docker, kubectl, k3d; `p3/scripts/installationhost.sh` installs them.
