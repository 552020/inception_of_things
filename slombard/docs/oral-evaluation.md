# Inception-of-Things (IoT)
# Technical Knowledge for the Oral Evaluation

Written by Robin (rpodack), shared on Slack on 2026-11-11.

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

## Glossary

The terms used above, one line each. The full glossary of the project, all three parts and the bonus, is in `glossary.md`.

- **Agent** A K3s node without control plane: kubelet, containerd, kube-proxy, Flannel. Joins a server with K3S_URL and K3S_TOKEN.
- **API server** The only door into the cluster; validates requests and stores objects in the datastore. kubectl and all components talk to it.
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
- **kubectl** The command-line client of the API server.
- **kubelet** The agent on every Node, server included: starts the Pods assigned to its Node through the runtime, runs probes, reports status.
- **kube-proxy** Writes the forwarding rules on each Node that make Service IPs reach Pods.
- **Label / selector** Key-value pairs on objects, and the way Deployments and Services find their Pods.
- **Liveness / readiness / startup probe** Alive? restart if not. Ready for traffic? remove from Service if not. Started? hold the other probes until then.
- **Manifest** A YAML file describing objects, applied with `kubectl apply -f`.
- **maxSurge / maxUnavailable** Limits of a rolling update: how many extra Pods, how many missing Pods, at any moment.
- **Node** A machine running kubelet and a runtime. Server and agent are both Nodes.
- **Pod** The smallest unit scheduled: one or more containers sharing network and optionally volumes. Ephemeral, made by controllers.
- **Reconciliation** The loop: compare desired and actual state, act on the difference, repeat.
- **ReplicaSet** Keeps N identical Pods alive. Created by Deployments, one per Pod template version.
- **Replicas** The number of Pods a Deployment wants. Replicas are Pods; the number lives in the control plane.
- **Rolling update** Replace old Pods with new ones step by step, so the application stays reachable.
- **Scheduler** Chooses a Node for each new Pod and writes it into spec.nodeName. Starts nothing.
- **Server** A K3s node with the control plane; also runs Pods by default.
- **Sidecar** A helper container in the same Pod as the application container.
- **SQLite** File-based database embedded in K3s, its default datastore on a single server.
- **Taint / toleration** A taint keeps Pods off a Node; a toleration lets a Pod on anyway. K3s servers have no taint.
- **Token** The secret an agent presents to join; in /var/lib/rancher/k3s/server/node-token on the server. Never committed.
