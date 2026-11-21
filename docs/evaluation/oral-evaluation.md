# Inception-of-Things (IoT)

## The Three Parts at a Glance

The project builds the same thing three times, each time one step further: a cluster, applications on the cluster, and a cluster that deploys by itself.

| | Part 1 | Part 2 | Part 3 |
|---|---|---|---|
| Folder | `p1` | `p2` | `p3` |
| Cluster | K3s on two VMs: one server, one agent | K3s on one VM: server only | K3s in Docker containers made by K3d: one server, one agent |
| Built with | Vagrant (libvirt) and an Ansible playbook | Vagrant (libvirt) and an Ansible playbook | a Makefile calling k3d, kubectl and argocd; no Vagrant |
| Runs inside | nothing of ours | three web applications, app2 with three replicas | Argo CD and one application in two versions |
| Reached by | SSH, then kubectl on the server | `http://192.168.56.110` with a Host header | `localhost:8888` (application), `localhost:8080` (Argo CD) |
| New idea | the cluster: nodes, server and agent, token | Deployment, Service, Ingress | GitOps: a Git repository decides what runs |
| Shown to the evaluator | hostnames, the IPs on eth1, both nodes Ready | each application by its Host, the three replicas, the Ingress | the two namespaces, the change from v1 to v2 through GitHub |

Sections 1 to 3 are the theory behind all three parts. Sections 4 to 6 take the parts one by one.

---

## 1. Kubernetes – Architecture and Fundamentals

Kubernetes is a container orchestration platform designed to deploy, manage, scale, and maintain containerized applications.

Its central concept is **declarative state management**.

Instead of manually specifying every action required to run an application, we define the desired state of the system.

Kubernetes continuously compares this desired state with the actual state and attempts to reconcile any differences.

This process is called **reconciliation**.

For example, if a Deployment specifies three replicas but only two are running, Kubernetes attempts to create another Pod.

### 1.1 The Control Plane

The Control Plane manages the Kubernetes cluster.

It consists of several components.

**kube-apiserver**

The API server is the central entry point for Kubernetes management operations.

When executing:

    kubectl get pods

kubectl sends a request to the Kubernetes API server.

Internal Kubernetes components also communicate through this API.

**etcd**

etcd is a distributed key-value store used by standard Kubernetes installations to store cluster state.

It stores information such as:

- Deployments
- Services
- ConfigMaps
- Secrets
- Node information
- Cluster configuration

Important distinction:

K3s uses SQLite by default in simple single-server installations instead of etcd.

K3s can also use embedded etcd or external databases.

**kube-scheduler**

The scheduler determines which Node should execute a new Pod.

It considers:

- Available CPU and memory
- Node selectors
- Node affinity
- Taints and tolerations
- Scheduling constraints

The scheduler does not start containers itself.

It assigns Pods to suitable Nodes.

**kube-controller-manager**

The Controller Manager runs controllers that continuously reconcile Kubernetes resources.

For example, controllers monitor Nodes and other resources to maintain the desired cluster state.

### 1.2 Worker Nodes

Worker Nodes execute application workloads.

Important components include:

**kubelet**

The kubelet is an agent running on each Node.

It communicates with the API server and ensures that assigned Pods are running.

**Container Runtime**

The container runtime creates and manages containers.

K3s uses containerd by default.

**kube-proxy**

kube-proxy normally implements networking rules for Kubernetes Services.

Depending on the networking implementation, alternative mechanisms can be used.

**CNI plugin**

The network plugin gives every Pod its IP address and connects the Pods across Nodes.

K3s uses Flannel by default.

**Pods: what the Node runs**

These components are the machinery of the Node. The Pods are what the machinery executes.

A Node does not know about Deployments or replicas. It only sees Pods assigned to it.

The three replicas of app2 are three Pods, placed on Nodes by the Scheduler. The number three lives in the Deployment, which is stored in the Control Plane.

`kubectl get pods -o wide` shows every Pod with the Node it runs on.

### 1.3 What Happens When a Deployment Is Created?

Example command:

    kubectl apply -f deployment.yaml

The sequence is:

1. kubectl sends the manifest to the API server.
2. The API server validates the request.
3. The desired configuration is stored.
4. The Controller Manager detects the new Deployment: its Deployment Controller receives the event from the API server through a watch.
5. The Deployment Controller creates a ReplicaSet object.
6. The ReplicaSet Controller sees the new ReplicaSet and creates the required Pod objects from its template.
7. The Scheduler assigns Pods to suitable Nodes.
8. On each chosen Node, the kubelet starts the containers of its Pods through the container runtime.
9. The kubelet reports the status of its Pods to the API server, and the controllers keep comparing desired and actual state. If a Pod dies, the ReplicaSet Controller counts two instead of three and creates a new Pod object; steps 7 and 8 repeat.

The important principle is that Kubernetes is declarative.

We define **what should exist**, not the individual commands needed to create it.

### Section Summary

The Control Plane manages the cluster, while Nodes execute workloads. Kubernetes continuously compares desired and actual states and uses controllers to reconcile differences.

---

## 2. K3s – Lightweight Kubernetes

K3s is a lightweight, CNCF-certified Kubernetes distribution developed by Rancher, now part of SUSE.

It simplifies Kubernetes installation and reduces resource requirements.

Typical use cases include:

- Development environments
- Edge computing
- IoT environments
- Small Kubernetes clusters
- Testing environments

### 2.1 K3s Compared to Standard Kubernetes

K3s is not a different container orchestration system.

It is a Kubernetes distribution.

Its main differences are simplified packaging, installation, and default components.

K3s includes or installs components such as:

- containerd as the container runtime
- Flannel as the default CNI (gives Pods their IPs and connects them across Nodes)
- CoreDNS for internal DNS
- Traefik as the default Ingress Controller
- ServiceLB for LoadBalancer Services
- SQLite as the default datastore for simple installations

Some of these components can be disabled or replaced.

Compared with a Kubernetes installation using kubeadm, K3s usually requires fewer manual configuration steps.

### 2.2 K3s Server

The K3s Server operates the Kubernetes Control Plane.

In Part 1, the first virtual machine acts as the server.

The server provides the Kubernetes API and manages the cluster.

A K3s Server can also execute application workloads by default.

A Control Plane Node is therefore not necessarily restricted to management operations.

### 2.3 K3s Agent

The K3s Agent joins an existing K3s cluster and executes workloads.

In Part 1, the second virtual machine is an agent.

It contains components such as:

- kubelet
- containerd
- Networking components
- Components for communication with the server

The agent does not operate its own Kubernetes Control Plane.

### 2.4 How Does an Agent Join the Cluster?

An agent needs:

1. The address of the K3s Server.
2. A valid cluster token.

Example installation:

    K3S_URL=https://192.168.56.110:6443 \
    K3S_TOKEN=<token> \
    sh install.sh

`K3S_URL` identifies the server.

`K3S_TOKEN` authenticates the agent during cluster registration.

Port 6443 is used for the Kubernetes API and K3s agent connectivity.

The cluster token is sensitive information and should not be committed to a public repository.

### 2.5 What Happens When a Node Fails?

Kubernetes detects that the Node is no longer reachable.

After the relevant detection and eviction periods, controllers may create replacement Pods on other available Nodes.

This requires sufficient resources and suitable scheduling conditions.

If the only K3s Server fails, the Control Plane becomes unavailable.

Existing containers may continue running, but centralized cluster management is disrupted.

### Section Summary

K3s is a lightweight Kubernetes distribution. The Server operates the Control Plane, while Agents execute workloads. Agents join the cluster through authenticated connections.

---

## 3. Kubernetes Resources: Pods, Deployments, and ReplicaSets

### 3.1 Pods

A Pod is the smallest deployable unit in Kubernetes.

A Pod contains one or more containers.

Containers inside the same Pod share:

- A network namespace
- An IP address
- The same localhost interface
- Optionally shared storage volumes

A Pod is not the same as a container.

Most Pods contain one application container, but additional containers can provide supporting functionality.

For example, a sidecar container may provide logging or proxy functionality.

### 3.2 Why Not Create Pods Directly?

Pods are generally ephemeral resources.

If a manually created Pod is deleted, Kubernetes does not automatically recreate it unless a controller manages it.

Applications are therefore usually deployed using Deployments.

### 3.3 Deployments

A Deployment defines how an application should be deployed and maintained.

Example:

    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: app2
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: app2
      template:
        metadata:
          labels:
            app: app2
        spec:
          containers:
            - name: app2
              image: nginx:stable
              ports:
                - containerPort: 80

`replicas: 3` defines the desired number of Pods.

`selector.matchLabels` identifies the Pods belonging to the Deployment.

`template` describes the Pods that should be created.

### 3.4 ReplicaSets

A ReplicaSet ensures that the required number of matching Pods exists.

Deployments manage ReplicaSets.

When the Pod template changes, for example when updating a container image, the Deployment normally creates a new ReplicaSet.

Kubernetes can then perform a rolling update.

### 3.5 Rolling Updates

A rolling update gradually replaces old Pods with new Pods.

This can maintain application availability during deployment.

Two important parameters are:

**maxSurge**

Controls how many additional Pods may temporarily exist during an update.

**maxUnavailable**

Controls how many Pods may be unavailable during the update.

A rolling update does not automatically guarantee that the application works correctly.

Readiness probes are important for determining when new Pods can receive traffic.

### 3.6 Health Probes

**Liveness Probe**

Determines whether a container is still functioning.

Repeated failures can cause Kubernetes to restart the container.

**Readiness Probe**

Determines whether a container is ready to receive traffic.

Pods that are not ready are normally excluded from regular Service traffic.

**Startup Probe**

Allows applications additional startup time before liveness and readiness checks become active.

### Section Summary

Pods execute containers. ReplicaSets maintain the desired number of Pods. Deployments manage ReplicaSets and application updates. Health probes help Kubernetes determine whether containers are functioning and ready.

---

## 4. Part 1 – K3s and Vagrant

Part 1 builds a cluster and nothing else.

There is no application in it.

The point is to see what a cluster is made of: two machines, one server, one agent, and a token that lets the agent in.

### 4.1 What Is Built

| | Server | Agent |
|---|---|---|
| VM and hostname | `rpodackS` | `rpodackSW` |
| IP on eth1 | 192.168.56.110 | 192.168.56.111 |
| K3s mode | server (control plane, and a node) | agent (a node only) |
| Resources | 1 CPU, 512 MB | 1 CPU, 512 MB |

Both VMs start from the box `generic/ubuntu2004` and run on libvirt.

### 4.2 Who Does What

Three tools work in a row.

- **Vagrant** reads the `Vagrantfile`. The file declares the two machines: name, hostname, IP, CPU, memory.
- **libvirt** creates the VMs when Vagrant asks for them. Vagrant itself is not a hypervisor.
- **Ansible** installs the software. Vagrant starts the playbook `confs/ansible/playbook.yml` once a machine is up, and Ansible connects to it over SSH.

Vagrant makes the machines. Ansible fills them. Neither is part of Kubernetes.

### 4.3 What the Playbook Does

On the server:

1. It sets the hostname.
2. It installs Python and curl.
3. It installs K3s in server mode: `server --node-name rpodackS --write-kubeconfig-mode 644`.
4. It waits until the kubeconfig and the token file exist.

On the agent:

1. It sets the hostname and installs Python and curl.
2. It waits until port 6443 answers on 192.168.56.110.
3. It reads the token from the server. Ansible runs this one task on the server (`delegate_to`), so the token is never written into the repository.
4. It installs K3s in agent mode with `K3S_URL` and `K3S_TOKEN` (section 2.4).

kubectl comes with K3s. Nothing installs it separately.

### 4.4 The Three Networks

| Network | Range | Made by | Who talks on it |
|---|---|---|---|
| VM network | 192.168.56.0/24, on eth1 | Vagrant, through libvirt | the two machines; the agent reaches the server here |
| Pod network | 10.42.0.0/16, one /24 per node | Flannel | Pods, also across nodes |
| Service network | 10.43.0.0/16 | kube-proxy | nobody directly; these are virtual addresses in front of Pods |

Each VM has a second interface, eth0. Vagrant uses it for its own SSH access.

### 4.5 What to Show

    vagrant status
    vagrant ssh rpodackS
    hostname
    ip a show eth1
    kubectl get nodes -o wide

`vagrant ssh` logs in with a key that Vagrant generated. That is the SSH access without a password the subject asks for.

`kubectl get nodes` must list both machines as `Ready`: `rpodackS` with the role `control-plane`, `rpodackSW` without a role.

### Section Summary

Vagrant creates two VMs through libvirt, Ansible installs K3s on them. The first VM is the server and holds the control plane. The second is an agent and joins with the server's address and token.

---

## 5. Part 2 – K3s and Three Applications

Part 2 keeps one machine and puts applications on it.

The new question is how a request from outside finds the right application.

### 5.1 What Is Built

One VM, `rpodackS`, with the IP 192.168.56.110 and K3s in server mode.

There is no agent. The server is also a node, so the Pods run on it.

| Application | Image | Replicas | Port in the container |
|---|---|---|---|
| app1 | `nginx` | 1 | 80 |
| app2 | `hashicorp/http-echo` | 3 | 5678 |
| app3 | `hashicorp/http-echo` | 1 | 5678 |

### 5.2 Three Objects per Application

Every application is described by three manifests in `confs/`.

- **Deployment** (`confs/deployment/`): which image, and how many Pods. For app2 it says `replicas: 3`.
- **Service** (`confs/service/`): one stable address in front of the Pods. Pods come and go and change their IP; the Service does not. It finds its Pods by label.
- **Ingress** (`confs/ingress/`): the rule that says which host name leads to which Service.

The playbook copies the files to the VM and runs `kubectl apply -f` on each.

### 5.3 Why an Ingress

A Service makes one application reachable under one address.

Three applications would need three ports or three IPs.

The subject wants all three behind one IP, 192.168.56.110, on port 80.

The only thing that tells the requests apart is the **Host header**: the host name the client asked for, sent inside the HTTP request.

An Ingress is a rule on that level:

    rules:
      - host: app1.com
        http:
          paths:
            - path: /
              pathType: Prefix
              backend:
                service:
                  name: app1
                  port:
                    number: 80

An Ingress is only an object. It does nothing by itself.

### 5.4 Traefik

Traefik is the program that carries out the Ingress rules.

It is a reverse proxy: it stands in front of the applications, takes every request and passes it on.

K3s installs it as its Ingress controller. It runs as a Pod in the namespace `kube-system` and listens on ports 80 and 443 of the node.

Traefik watches the Ingress objects through the API server. When one is created or changed, it adjusts its routing. Nobody edits a Traefik configuration file.

### 5.5 The Path of a Request

1. The client sends a request to 192.168.56.110, port 80, with `Host: app2.com`.
2. Traefik receives it and looks for the Ingress rule with that host.
3. The rule names the Service `app2`.
4. The Service passes the request to one of the three Pods of app2.
5. The container in that Pod answers.

The Ingress points to a Service, never to a Pod.

### 5.6 The Default Application

The subject says: `app1.com` shows app1, `app2.com` shows app2, anything else shows app3.

A rule without `host` matches every host name. Traefik prefers the more specific rule, so app1 and app2 keep their own.

The rule for app3 must therefore carry no host.

### 5.7 What to Show

    kubectl get nodes
    kubectl get deployments
    kubectl get pods -o wide
    kubectl get svc
    kubectl get ingress
    curl -H "Host: app1.com" http://192.168.56.110
    curl -H "Host: app2.com" http://192.168.56.110
    curl http://192.168.56.110

`kubectl get deployments` must show app2 with `3/3`.

To show reconciliation, delete one Pod of app2 and list the Pods again: a new one is already there.

    kubectl delete pod <name of an app2 Pod>
    kubectl get pods

### Section Summary

A Deployment keeps the Pods running, a Service gives them one address, an Ingress chooses the Service by host name. Traefik is the program that reads the Ingress rules and routes the requests.

---

## 6. Part 3 – K3d and Argo CD

Part 3 drops Vagrant and the VMs.

The cluster runs in Docker, and a program inside the cluster deploys the application from a Git repository.

### 6.1 K3d Instead of Vagrant

K3s is the Kubernetes distribution. K3d is a tool that starts K3s nodes as Docker containers.

In Part 1 a node is a VM made by Vagrant. In Part 3 a node is a container made by K3d. The cluster inside is K3s both times.

    k3d cluster create dockercluster --agents 1 -p "30007:30007@server:0"

This starts a server container, one agent container and a small load balancer container. It needs Docker and takes seconds.

### 6.2 Two Namespaces

A namespace is a named area inside a cluster. Objects in different namespaces do not get in each other's way.

- `argocd` holds Argo CD itself.
- `dev` holds the application.

### 6.3 Argo CD and GitOps

Argo CD runs inside the cluster, as Pods.

It watches a Git repository, compares the manifests there with what runs in the cluster, and applies the difference.

This way of working is called **GitOps**: the repository is the desired state. Nobody runs `kubectl apply` by hand. A deployment is a `git push`.

It is the reconciliation of section 1, one level up: Kubernetes keeps the cluster equal to its objects, Argo CD keeps the objects equal to Git.

### 6.4 The Application

The application is `wil42/playground` from Docker Hub.

It listens on port 8888 and exists in two versions, the tags `v1` and `v2`.

One file, `deployment.yaml`, describes it: a Deployment with one replica and a Service of type NodePort on port 30007.

### 6.5 Two Repositories

Argo CD does not read files on the machine. It fetches a repository over the network.

The subject asks for a public GitHub repository with the login of a group member in its name.

That repository is `Robin-Lenz/rpodackIoT`. It holds `deployment.yaml`.

The project repository holds everything that builds the setup. `p3/confs/deployment.yaml` is a copy.

### 6.6 The Argo CD Application

`make argocd-setup` creates an Argo CD application called `dev-app`.

| Setting | Value | Meaning |
|---|---|---|
| Repository | `rpodackIoT`, path `.` | where the manifests are |
| Destination | this cluster, namespace `dev` | where they are applied |
| Sync policy | automated | apply changes without a click |
| Prune | on | delete from the cluster what was deleted in Git |
| Self-heal | on | undo changes made by hand in the cluster |

### 6.7 The Order of Commands

    ./scripts/installationhost.sh   # Docker, the docker group, kubectl; then log out and in
    make setup              # k3d, the cluster, both namespaces, Argo CD, a first apply of the application
    make port-forward       # Argo CD on https://localhost:8080, leave it running
    make echo-password      # the password of the user admin
    make argocd-setup       # log in, add the repository, create dev-app
    make port-forward-app   # the application on localhost:8888

The script comes first because K3d needs Docker. It also puts the user into the group `docker`: the `docker` command reaches the Docker daemon through a socket that belongs to root and that group. Groups are read at login, so the new group only counts after logging in again.

### 6.8 From v1 to v2

1. In `rpodackIoT`, change the image tag in `deployment.yaml` from `v1` to `v2`.
2. Commit and push.
3. Argo CD notices the new commit. It checks the repository every three minutes; `argocd app sync dev-app` or the Refresh button does it at once.
4. Argo CD applies the changed Deployment.
5. The Deployment replaces the Pod with a rolling update (section 3.5).

Check:

    kubectl get pods -n dev
    curl http://localhost:8888/

The answer changes from `{"status":"ok", "message": "v1"}` to `"message": "v2"`.

The port-forward is tied to one Pod. After the update that Pod is gone, so `make port-forward-app` has to be started again.

### Section Summary

K3d runs the K3s cluster in Docker. Argo CD lives in the namespace `argocd`, watches a public GitHub repository and keeps the namespace `dev` equal to it. Changing the version means changing one line in Git.

---

## Glossary

The terms used above, one line each. The full glossary of the project, all three parts and the bonus, is in `glossary.md`.

- **Agent** A K3s node without control plane: kubelet, containerd, kube-proxy, Flannel. Joins a server with K3S_URL and K3S_TOKEN.
- **Ansible** Installs and configures software on machines over SSH, following a playbook. It needs nothing installed on the target except Python.
- **API server** The only door into the cluster; validates requests and stores objects in the datastore. kubectl and all components talk to it.
- **Argo CD** A program running in the cluster that watches a Git repository and applies its manifests. The GitOps tool of Part 3.
- **CNI** Container Network Interface, the plugin that gives Pods IPs and connects them across Nodes. K3s uses Flannel.
- **containerd** The container runtime: pulls images, creates and runs containers. Split out of Docker in 2017.
- **Control plane** The deciding layer: API server, datastore, scheduler, controller manager. In K3s one process, `k3s server`.
- **Controller** A loop that watches one kind of object and acts to make actual state match desired state.
- **Controller manager** The process holding the built-in controllers (Deployment, ReplicaSet, Node, ...).
- **Datastore** Where all cluster objects live. etcd in standard Kubernetes, SQLite in a single-server K3s.
- **Declarative** You state what should exist; controllers work out the steps.
- **Deployment** Describes an application: image, replicas, update strategy. Manages ReplicaSets.
- **etcd** Distributed key-value store, the standard Kubernetes datastore. Name: /etc + distributed.
- **Flannel** The default CNI of K3s: an overlay network, each Node gets a /24 of Pod IPs, traffic between Nodes is tunnelled (VXLAN).
- **GitOps** Working so that a Git repository holds the desired state and a tool applies it. A deployment is a git push.
- **Host header** The host name the client asked for, sent inside the HTTP request. It lets one IP serve several sites.
- **Ingress** An object with HTTP routing rules: this host or path leads to that Service. It does nothing without an Ingress controller.
- **Ingress controller** The reverse proxy that reads Ingress objects and routes the requests. In K3s: Traefik.
- **K3d** A tool that runs K3s nodes as Docker containers. Used in Part 3 instead of VMs.
- **kube-proxy** Writes the forwarding rules on each Node that make Service IPs reach Pods.
- **kubectl** The command-line client of the API server.
- **kubelet** The agent on every Node, server included: starts the Pods assigned to its Node through the runtime, runs probes, reports status.
- **Label / selector** Key-value pairs on objects, and the way Deployments and Services find their Pods.
- **libvirt** The layer that creates and runs the VMs (with KVM/QEMU). The Vagrant provider of Parts 1 and 2.
- **Liveness / readiness / startup probe** Alive? restart if not. Ready for traffic? remove from Service if not. Started? hold the other probes until then.
- **Manifest** A YAML file describing objects, applied with `kubectl apply -f`.
- **maxSurge / maxUnavailable** Limits of a rolling update: how many extra Pods, how many missing Pods, at any moment.
- **Namespace** A named area inside a cluster that keeps objects apart. Part 3 uses argocd and dev.
- **Node** A machine running kubelet and a runtime. Server and agent are both Nodes.
- **NodePort** A Service type that also opens a port between 30000 and 32767 on every node.
- **Playbook** The YAML file that tells Ansible what to do on which machine.
- **Pod** The smallest unit scheduled: one or more containers sharing network and optionally volumes. Ephemeral, made by controllers.
- **Reconciliation** The loop: compare desired and actual state, act on the difference, repeat.
- **Replicas** The number of Pods a Deployment wants. Replicas are Pods; the number lives in the control plane.
- **ReplicaSet** Keeps N identical Pods alive. Created by Deployments, one per Pod template version.
- **Reverse proxy** A server in front of other servers: it takes every request and passes it to the right one.
- **Rolling update** Replace old Pods with new ones step by step, so the application stays reachable.
- **Scheduler** Chooses a Node for each new Pod and writes it into spec.nodeName. Starts nothing.
- **Server** A K3s node with the control plane; also runs Pods by default.
- **Service** A stable address in front of a group of Pods, found by label. Pods change their IP, the Service does not.
- **Sidecar** A helper container in the same Pod as the application container.
- **SQLite** File-based database embedded in K3s, its default datastore on a single server.
- **Taint / toleration** A taint keeps Pods off a Node; a toleration lets a Pod on anyway. K3s servers have no taint.
- **Token** The secret an agent presents to join; in /var/lib/rancher/k3s/server/node-token on the server. Never committed.
- **Traefik** The reverse proxy K3s installs as its Ingress controller. It routes the requests of Part 2 by Host header.
- **Vagrant** Creates and configures VMs from a description, the Vagrantfile, by asking a provider (here libvirt). Not a hypervisor.
- **Vagrantfile** The Ruby file that declares the VMs: name, hostname, IP, CPU, memory, provisioner.
