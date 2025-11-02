# Part 1: K3s and Vagrant - TODO

## Completed ✅
- [x] Machine names set to `slombardS` and `slombardSW`
- [x] Hostnames configured correctly
- [x] Network IPs configured (192.168.56.110 and 192.168.56.111)
- [x] Resource constraints set (1 CPU, 512 MB RAM)
- [x] Basic Alpine Linux setup with essential packages
- [x] SSH passwordless authentication (handled automatically by Vagrant - `vagrant ssh slombardS` and `vagrant ssh slombardSW` work without password)
- [x] Network interface `eth1` verified on both VMs with correct IPs (192.168.56.110 and 192.168.56.111)

## Remaining Tasks

### 3. K3s Installation - Server (slombardS)
- [ ] Install K3s in server/controller mode on `slombardS`
- [ ] Retrieve and store the node token from server for worker registration
- [ ] Verify K3s server is running: `systemctl status k3s` or `k3s server --help`
- [ ] Get the server token: usually in `/var/lib/rancher/k3s/server/node-token`

### 4. K3s Installation - Worker (slombardSW)
- [ ] Install K3s in agent mode on `slombardSW`
- [ ] Use the token from the server to join the worker node
- [ ] Verify worker node joins the cluster successfully
- [ ] Command: `k3s agent --server https://192.168.56.110:6443 --token <TOKEN>`

### 5. kubectl Installation
- [ ] Install kubectl on at least the server machine (slombardS)
- [ ] Configure kubectl to use K3s kubeconfig (usually `/etc/rancher/k3s/k3s.yaml`)
- [ ] Verify kubectl can connect to the cluster: `kubectl get nodes`
- [ ] Both nodes (slombardS and slombardSW) should appear in the output

### 6. Verification and Testing
- [ ] Run `kubectl get nodes` and verify both nodes show as Ready
- [ ] Verify node names match hostnames (slombardS and slombardSW)
- [ ] Test that pods can be scheduled and run on the worker node
- [ ] Ensure network connectivity between server and worker nodes

## Notes
- The K3s worker needs to connect to the server at `https://192.168.56.110:6443`
- Server token is needed for worker registration
- kubectl config should be accessible and properly configured
- Follow modern Vagrant practices (as mentioned in requirements)

## Resources
- K3s installation script: `curl -sfL https://get.k3s.io | sh -` for server mode
- Worker mode: `curl -sfL https://get.k3s.io | K3S_URL=https://192.168.56.110:6443 K3S_TOKEN=<TOKEN> sh -`
- kubectl for Alpine: May need to download binary or use package manager

