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

### 1.3 What Happens When a Deployment Is Created?

Example command:

    kubectl apply -f deployment.yaml

The sequence is:

1. kubectl sends the manifest to the API server.
2. The API server validates the request.
3. The desired configuration is stored.
4. The Deployment Controller detects the Deployment.
5. A ReplicaSet is created.
6. The ReplicaSet creates the required Pods.
7. The Scheduler assigns Pods to suitable Nodes.
8. The kubelet starts the containers through the container runtime.
9. Kubernetes continuously monitors the resources.

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
- Flannel as the default CNI
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
