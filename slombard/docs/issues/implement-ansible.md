# Issue: Implement Ansible Provisioning for Part 1

## Objective
Replace shell-based provisioning in Vagrantfile with Ansible playbooks to manage K3s installation and configuration more effectively.

## Current State
- Shell inline scripts in Vagrantfile for basic package installation
- Manual installation of K3s still needed
- No coordination between server and worker for cluster setup

## Implementation Steps

### Step 1: Install Ansible
- [ ] Install Ansible on the host machine
  ```bash
  # On Ubuntu/Debian
  sudo apt update
  sudo apt install -y ansible
  ```
- [ ] Verify installation: `ansible --version`

### Step 2: Create Directory Structure
- [x] Create `slombard/p1/confs/` directory if it doesn't exist
- [x] Create `slombard/p1/confs/ansible/` directory
- [x] Minimal structure (only one file needed):
  ```
  confs/ansible/
  └── playbook.yml       # Main playbook with all tasks
  ```
- Note: No inventory file needed - Vagrant auto-generates it
- Note: No ansible.cfg needed - defaults work fine with Vagrant

### Step 3: Create Main Playbook
- [x] Create `confs/ansible/playbook.yml`
  - [x] Play 1: Configure server (slombardS)
    - [x] Install curl
    - [x] Install K3s server
    - [x] Wait for K3s to be ready
    - [x] Read token and store it for worker
  - [x] Play 2: Configure worker (slombardSW)
    - [x] Install curl
    - [x] Get server token
    - [x] Install K3s agent with token
  - [x] Play 3: Verify cluster
    - [x] Check cluster nodes

### Step 4: Update Vagrantfile
- [ ] Remove inline shell provisioning scripts
- [ ] Add Ansible provisioner configuration
  - Set playbook path: `confs/ansible/playbook.yml`
  - No inventory_path needed (Vagrant auto-generates)
- [ ] Test that basic VM setup still works

### Step 5: Handle Server Token Coordination
- [x] After server play, read token from `/var/lib/rancher/k3s/server/node-token`
- [x] Store token in a variable/fact for worker play
- [x] Use token in worker play to join cluster

### Step 6: Test Ansible Provisioning
- [ ] Test with fresh VMs:
  ```bash
  cd slombard/p1
  vagrant destroy -f
  vagrant up
  ```
- [ ] Verify all tasks complete successfully
- [ ] Check that K3s cluster is functional
- [ ] Verify kubectl works on server
- [ ] Run `make test` to verify all requirements

### Step 7: Add Error Handling
- [ ] Add retry logic for K3s installation
- [ ] Add wait conditions for K3s to be ready
- [ ] Add validation tasks
- [ ] Add proper error messages

### Step 8: Update Documentation
- [ ] Update README or add setup instructions
- [ ] Document Ansible requirements
- [ ] Document playbook structure
- [ ] Add troubleshooting section

### Step 9: Integration Testing
- [ ] Ensure test script (`scripts/test_part1.sh`) still works
- [ ] Verify all Part 1 requirements are met
- [ ] Test idempotency (run playbook multiple times)
- [ ] Test with VMs already running vs fresh

## Technical Details

### K3s Installation Commands

**Server:**
```bash
curl -sfL https://get.k3s.io | sh -
# Token will be in: /var/lib/rancher/k3s/server/node-token
# Kubeconfig: /etc/rancher/k3s/k3s.yaml
```

**Worker:**
```bash
curl -sfL https://get.k3s.io | K3S_URL=https://192.168.56.110:6443 K3S_TOKEN=<TOKEN> sh -
```

### Ansible Playbook Structure

**Server Play (`hosts: slombardS`):**
- Install curl (using `apk` for Alpine)
- Install K3s server
- Wait for K3s to be ready
- Read token and save as fact for worker

**Worker Play (`hosts: slombardSW`):**
- Install curl
- Install K3s agent using server token
- Wait for worker to join cluster

**Verify Play (`hosts: slombardS`):**
- Check cluster nodes with `k3s kubectl get nodes`

### Vagrant Ansible Provisioner Syntax

```ruby
config.vm.provision "ansible" do |ansible|
  ansible.playbook = "confs/ansible/playbook.yml"
end
```

Note: Vagrant automatically generates inventory, no `inventory_path` needed.
Use VM names directly in playbook (`hosts: slombardS`, `hosts: slombardSW`).

## Potential Challenges

1. **Token Sharing Between Plays**
   - Solution: Use Ansible facts or shared filesystem location

2. **Timing Issues**
   - K3s server must be fully ready before worker can join
   - Solution: Use `wait_for` or `uri` modules to check readiness

3. **Alpine Linux Compatibility**
   - Ensure Ansible modules work with Alpine
   - May need to install python3 on Alpine

4. **SSH Key Authentication**
   - Vagrant handles SSH automatically
   - Ensure Ansible uses Vagrant's SSH config

5. **Network Dependencies**
   - Worker needs network access to server
   - Ensure eth1 is configured before Ansible runs

## Success Criteria

- [ ] VMs can be provisioned with `vagrant up`
- [ ] K3s server installed and running on slombardS
- [ ] K3s worker installed and joined cluster on slombardSW
- [ ] kubectl works on server
- [ ] `kubectl get nodes` shows both nodes as Ready
- [ ] All tests in `scripts/test_part1.sh` pass
- [ ] Playbook is idempotent (can run multiple times)
- [ ] Code follows Ansible best practices

## References

- [Ansible Documentation](https://docs.ansible.com/)
- [Vagrant Ansible Provisioner](https://www.vagrantup.com/docs/provisioning/ansible)
- [K3s Installation Guide](https://docs.k3s.io/)
- [Ansible Galaxy Collections](https://galaxy.ansible.com/)

## Notes

- Keep shell scripts as fallback if needed
- Consider creating separate playbooks for server and worker if coordination is complex
- Use Ansible vault if storing sensitive tokens (though not needed for this project)
- Test thoroughly before committing to ensure reproducibility
