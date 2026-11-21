# Glossary

Terms of the Inception-of-Things project, grouped by area, alphabetical inside each group. Each entry is what the term means and, where it matters, where it appears in the project.

## Kubernetes core

**API server (kube-apiserver)** The entry point of the cluster. Every request, from kubectl or from an internal component, goes through it; it validates the request and stores the result in the datastore.

**Cluster** One control plane and the nodes it manages. In Part 1 the cluster is two VMs, in Part 2 one VM, in Part 3 a set of Docker containers created by K3d.

**ConfigMap** A resource holding non-secret configuration as key-value pairs, mounted into Pods as files or environment variables. In Part 2 a ConfigMap can hold the HTML served by each app.

**Container runtime** The software that creates and runs containers on a node. K3s uses containerd, not Docker.

**Control plane** The components that manage the cluster: API server, datastore, scheduler, controller manager. In K3s they run inside one process on the server node.

**Controller** A loop that watches resources of one kind and acts to make the actual state match the desired state. The Deployment controller, the ReplicaSet controller and the Node controller run inside the controller manager.

**Controller manager (kube-controller-manager)** The process that runs the built-in controllers.

**Declarative** The style of Kubernetes: a manifest describes what should exist, and the controllers work out the steps. The opposite is imperative, one command per action.

**Deployment** A resource describing an application: container image, number of replicas, update strategy. It manages ReplicaSets, which manage Pods. In Part 2 each of the three apps is a Deployment; app2 has three replicas.

**Desired state / actual state** What the manifests say should exist, and what is running right now. Kubernetes works to close the gap between the two.

**etcd** The distributed key-value store standard Kubernetes uses as its datastore. K3s replaces it by default with SQLite on a single server.

**kubeconfig** The file telling kubectl which cluster to talk to and with which credentials. K3s writes it to `/etc/rancher/k3s/k3s.yaml`; K3d writes a context into `~/.kube/config`.

**kubectl** The command-line client for the API server. Installed with K3s as a symlink to the k3s binary; `k` is the usual alias.

**kubelet** The agent on every node. It takes the Pods assigned to its node and makes sure their containers run, reporting status back to the API server.

**Label** A key-value pair attached to a resource, such as `app: app2`. Selectors in Services, Deployments and ReplicaSets match Pods by label.

**Liveness probe** A check telling the kubelet whether a container is still working. Repeated failure restarts the container.

**Manifest** A YAML (or JSON) file describing one or more resources, applied with `kubectl apply -f`. In this project the manifests live in `confs/`.

**Namespace** A partition of the cluster for resources. Part 3 requires two: `argocd` and `dev`; the bonus adds `gitlab`.

**Node** A machine, virtual or physical, running the kubelet and a container runtime. In Part 1 the server VM and the worker VM are the two nodes.

**Pod** The smallest unit Kubernetes schedules: one or more containers sharing a network namespace, an IP address and optionally volumes. Pods are ephemeral and usually created by a controller, not by hand.

**Readiness probe** A check telling Kubernetes whether a container may receive traffic. A Pod that is not ready is removed from its Service's endpoints.

**Reconciliation** The loop of comparing desired and actual state and acting on the difference. The core mechanism behind every controller.

**ReplicaSet** A controller keeping a fixed number of identical Pods running. Created and replaced by Deployments; rarely written by hand.

**Rolling update** The default Deployment strategy: new Pods are started and old ones stopped step by step, bounded by `maxSurge` and `maxUnavailable`, so the application stays available.

**Scheduler (kube-scheduler)** The component choosing a node for each new Pod, based on resources, selectors, affinity, taints and tolerations. It assigns; the kubelet starts.

**Secret** Like a ConfigMap but for sensitive data, stored base64-encoded. Argo CD keeps its initial admin password in the Secret `argocd-initial-admin-secret`.

**Startup probe** A check that delays liveness and readiness probes until a slow-starting container is up.

**Taint / toleration** A taint on a node repels Pods; a toleration on a Pod lets it be scheduled there anyway. K3s servers carry no taint by default, so they run workloads.

## Networking

**ClusterIP** The default Service type: a virtual IP reachable only inside the cluster. Used by the three app Services in Part 2 behind the Ingress.

**CNI (Container Network Interface)** The plugin giving Pods their network. K3s ships Flannel by default.

**CoreDNS** The cluster DNS server. It resolves Service names such as `app1-service.default.svc.cluster.local`.

**DHCP (Dynamic Host Configuration Protocol)** A machine joining a network asks, and a DHCP server hands it an address, a gateway and a DNS server for a while. The address can differ at every boot. eth0 of a Vagrant VM gets its address this way; eth1 does not: the Vagrantfile fixes it (`libvirt__dhcp_enabled: false`), so the subject's .110 and .111 are always the same.

**Endpoint** The list of Pod IPs behind a Service, kept current by Kubernetes as Pods come and go.

**Flannel** The default CNI in K3s: a simple overlay network (VXLAN) connecting the Pod networks of all nodes.

**Host header** The HTTP header carrying the requested hostname. The Ingress in Part 2 routes by it: `app1.com` to app1, `app2.com` to app2, anything else to app3.

**Ingress** A resource describing HTTP routing rules, by host and path, to Services. It does nothing on its own; an Ingress controller implements it.

**Ingress controller** The reverse proxy watching Ingress resources and applying their rules. K3s installs Traefik.

**kube-proxy** The component on each node implementing Service IPs with iptables or IPVS rules. K3s runs it by default.

**LoadBalancer** A Service type asking for an external IP. In the cloud a provider supplies it; K3s supplies it with ServiceLB, which is how Traefik is reachable on the VM's IP.

**NAT (Network Address Translation)** A router rewriting the addresses of the packets passing through it, so that many machines with private addresses share one public one. The machines inside can call out; nothing outside can call in uninvited. A home router does it, and so does the eth0 network of a Vagrant VM: the VM downloads K3s through NAT, but the VM is not reachable from outside on that address. This is why the cluster talks on eth1.

**NodePort** A Service type opening a fixed port (30000 to 32767) on every node. Used in Part 3 to reach the application on port 8888, or replaced by a port-forward.

**Port-forward** `kubectl port-forward` tunnels a local port to a Pod or Service through the API server. Common way to open the Argo CD UI on localhost.

**Service** A stable name and IP in front of a set of Pods selected by label. Pods change, the Service does not.

**ServiceLB (Klipper)** The small load balancer K3s installs so Services of type LoadBalancer get the node's IP.

**Traefik** The Ingress controller bundled with K3s. It receives the requests on 192.168.56.110 in Part 2 and routes them by Host header.

## K3s

**Agent** A K3s node without a control plane: kubelet, containerd, networking, and a connection to the server. The second VM in Part 1 (`<login>SW`).

**K3s** A lightweight, CNCF-certified Kubernetes distribution by Rancher (SUSE) packaged as one binary, with containerd, Flannel, CoreDNS, Traefik and ServiceLB included. Used in Parts 1 and 2.

**K3S_TOKEN** The secret an agent presents to join the cluster. The server writes it to `/var/lib/rancher/k3s/server/node-token`. It must not be committed.

**K3S_URL** The server address an agent joins, `https://192.168.56.110:6443` in Part 1.

**Node token** See K3S_TOKEN.

**Port 6443** The Kubernetes API port. Agents and kubectl both connect to it.

**Server** A K3s node running the control plane. It also runs workloads unless told otherwise. The first VM in Part 1 (`<login>S`) and the only VM in Part 2.

**SQLite** The default K3s datastore on a single server, replacing etcd.

## Vagrant and virtual machines

**Ansible** A configuration tool that runs tasks on machines over SSH from a playbook (YAML). Vagrant uses it as the provisioner in Part 1; it works below Kubernetes, installing it.

**Box** A packaged base image for Vagrant, named in the Vagrantfile. Here `debian/trixie64`: Debian 13, package manager apt.

**eth1** The second network interface of each VM, carrying the private IP 192.168.56.110 or .111 required by the subject.

**Host VM** The virtual machine in which the whole project runs, as the subject requires. Vagrant and K3d run inside it; the Part 1 VMs are nested inside it.

**Hostname** The name of a VM, set to a team member's login followed by `S` for the server and `SW` for the worker.

**Nested virtualization** Running a VM inside a VM. Needed for Part 1 because Vagrant creates VMs inside the host VM.

**Private network** The Vagrant network type giving a VM an IP reachable from the host but not from outside; it becomes eth1.

**Provider** The hypervisor Vagrant drives: VirtualBox, libvirt (KVM) or others. This project uses libvirt.

**Provisioner** A step Vagrant runs after a VM boots. Here one Ansible playbook, `confs/ansible/playbook.yml`, run from the host after both VMs are up, that installs K3s on both.

**Vagrant** A tool that creates and configures VMs from a text file. `vagrant up` builds the machines of Part 1 and Part 2.

**Vagrantfile** The Ruby file describing the VMs: box, hostname, network, provider settings, provisioners.

## K3d and Docker

**Docker** The container engine K3d needs on the host VM. Installed by the Part 3 script.

**Docker Hub** The public image registry. Part 3 pulls `wil42/playground:v1` and `v2` from it, or the team's own image.

**Image tag** The label after the colon in an image name, `v1` or `v2` here. Changing the tag in the manifest is what triggers the new version.

**K3d** A tool running K3s inside Docker containers: each node is a container, the cluster is created with `k3d cluster create`. Used in Part 3 instead of Vagrant.

**K3s vs K3d** K3s is the Kubernetes distribution; K3d is a way to run K3s nodes as Docker containers on one machine. The subject asks for this difference explicitly.

**Load balancer container** The extra container K3d starts in front of the cluster to map host ports to the cluster, set with `-p`.

## Argo CD and GitOps

**Application (Argo CD)** The Argo CD resource linking a Git repository path to a destination cluster and namespace. In Part 3 it points at the public GitHub repo and deploys into `dev`.

**Argo CD** A GitOps controller for Kubernetes: it watches a Git repository and keeps the cluster in sync with the manifests found there. Installed in the `argocd` namespace.

**argocd-server** The Argo CD API and web UI, reached by port-forward or NodePort; login `admin` with the initial password from the Secret.

**Continuous deployment** Changes pushed to Git reach the running system without a manual deploy step. Part 3: change `v1` to `v2` in the repo, Argo CD rolls out `v2`.

**GitOps** Operating a system from a Git repository as the single source of truth; a controller applies what the repository says.

**Self-heal** An Argo CD sync option that reverts manual changes in the cluster back to what Git says.

**Sync** The act of applying the Git state to the cluster. Manual, or automatic when the Application has automated sync enabled.

**Sync status** `Synced` when cluster and Git match, `OutOfSync` when they differ. Health status is separate: `Healthy`, `Progressing`, `Degraded`.

## GitLab (bonus)

**GitLab** A self-hosted Git server with CI. The bonus runs it locally in the `gitlab` namespace and uses it instead of GitHub as the Argo CD source.

**Helm** The package manager for Kubernetes: a chart is a templated set of manifests installed with `helm install`. The usual way to install GitLab.

**Helm chart** A packaged application for Helm, versioned, with values that customize the install.

## Commands worth knowing by heart

`kubectl get nodes` lists the nodes; in Part 1 it shows the server and the worker as `Ready`.

`kubectl get pods -A` lists all Pods in all namespaces.

`kubectl get ingress` shows the Ingress rules of Part 2.

`kubectl describe <kind> <name>` shows the full state and recent events of a resource.

`kubectl logs <pod>` prints a container's output.

`kubectl apply -f <file>` creates or updates the resources in a manifest.

`k3d cluster create <name> -p "8888:8888@loadbalancer"` creates a cluster and maps port 8888.

`curl -H "Host: app1.com" http://192.168.56.110` tests the Ingress routing of Part 2.

`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d` prints the Argo CD admin password.
