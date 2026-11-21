# Cards

One card per `###` heading: the heading is the front, the text under it the back, the `tags:` line the Anki tags. Convertible to Anki's tab-separated import.

### What is Kubernetes?
A system that runs containers across a set of machines and keeps them running the way a set of files says they should. Docker runs one container on one machine; Kubernetes runs many containers on many machines and takes over restarting, placing, networking and updating them.
tags: kubernetes basics

### Why do you need Kubernetes? Name the four reasons.
1. Failure recovery: a crashed container or a dead machine is restarted or rescheduled without anyone acting.
2. Updates without downtime: rolling updates replace Pods step by step.
3. Scaling: replicas up or down with one number.
4. One description for any cluster: the same manifests run on a laptop, a data centre or a cloud.
tags: kubernetes basics

### What does "declarative state management" mean? Is it a programming paradigm?
A style of specification, not a paradigm like functional or procedural: you state the result you want, something else computes the steps. React, SQL, HTML and Terraform are declarative in the same sense. The imperative counterpart is a shell script with three docker run lines. In Kubernetes you write replicas: 3; if a Pod dies you do nothing, the controller sees two, wants three, creates one.
tags: kubernetes basics

### What is the control plane?
Not a control panel, no screen involved. The deciding layer of the cluster: API server, datastore, scheduler, controllers. The nodes are the working layer that runs the containers. The only interface to the control plane is its API, used through kubectl.
tags: kubernetes architecture

### What does "plane" mean in everyday language, and what in IT?
Everyday: a flat surface (geometry), an aircraft, or a level of existence ("a higher plane"). IT takes the geometric sense, a layer: a system is cut into planes by function. From networking: the control plane decides routes, the data plane forwards packets. Kubernetes: the control plane decides, the nodes do the work.
tags: kubernetes vocabulary

### What is a manifest?
A YAML file describing resources you want to exist: kind (Deployment, Service, Ingress), name, spec. Applied with kubectl apply -f. The word is the ship's manifest, the list of what is on board; here the list of what should be in the cluster. It names no machines, so the same file runs on any cluster.
tags: kubernetes basics

### What is a Pod?
The smallest unit Kubernetes schedules: one or more containers sharing one network namespace (one IP, a common localhost) and optionally volumes. Nearly always one application container; the wrapper lets a helper container (log shipper, proxy) sit next to it with the same network. Pods are ephemeral and are created by controllers, not by hand.
tags: kubernetes resources

### Does Kubernetes assume Docker?
No. It needs a container runtime speaking the Container Runtime Interface (CRI). Docker was the first; since Kubernetes 1.24 (2022) the Docker shim is gone, containerd and CRI-O are the usual runtimes. Docker images still run everywhere because the image format is the OCI standard. K3s uses containerd. Part 3 needs Docker only because K3d runs the nodes as Docker containers.
tags: kubernetes basics containers

### What is a container in Kubernetes? Is it the same as a Docker container, a lightweight VM?
The same thing as a Docker container: a process (or process tree) on the host's kernel, isolated with Linux namespaces (own filesystem, network, process IDs) and limited with cgroups (CPU, memory), started from an OCI image. Not a VM: a VM has its own kernel on a hypervisor, a container shares the host's kernel, which is why it starts in milliseconds. Kubernetes runs containers through containerd from the same images Docker builds.
tags: kubernetes containers

### Why can K3s exist, and what makes it lightweight?
Kubernetes is open source (Apache licence, CNCF), so Rancher could take the code. Lightweight because of what they did with it: removed optional parts (legacy cloud providers, in-tree storage drivers, alpha features), put the whole control plane in one process in one binary of about 70 MB, swapped etcd for SQLite, bundled what a cluster needs anyway (containerd, Flannel, CoreDNS, Traefik). It passes the conformance tests, so it is still Kubernetes, fit for 512 MB of RAM.
tags: k3s

### What is a cluster in IT, and what is a Kubernetes cluster?
A cluster is a group of computers working together so they look and behave like one system; the word predates Kubernetes (high-availability clusters, compute clusters, database clusters). A Kubernetes cluster is one instance of that: a control plane plus the nodes it manages, addressed as one thing through one API.
tags: kubernetes vocabulary

### What are the alternatives to Kubernetes? Is Terraform one?
Terraform is not: it creates infrastructure from code (VMs, networks, DNS) and is often what creates the Kubernetes cluster itself. Alternatives for running containers: other orchestrators (Docker Swarm, HashiCorp Nomad, AWS ECS) or no orchestrator (docker compose on one host, serverless containers like Cloud Run or Fargate, a PaaS like Heroku or Fly.io). EKS, GKE, AKS are Kubernetes as a service, not alternatives.
tags: kubernetes basics

### Why are the control plane components named like kube-apiserver?
Because that is the name of the program. Kubernetes is a set of executables, each named like a file, lowercase with a kube- prefix: kube-apiserver, kube-scheduler, kube-controller-manager, kubelet, kube-proxy. On a kubeadm cluster they run as separate processes.
tags: kubernetes architecture

### Where are kube-apiserver, kube-scheduler and kube-controller-manager in K3s?
Compiled into the single k3s binary and run inside one process, `k3s server`. On the VM `ps` shows only `k3s server` and containerd; the components are there, inside that process. The agent runs `k3s agent`, which contains the kubelet and kube-proxy.
tags: k3s architecture

### What is reconciliation?
The loop every controller runs: read the desired state from the API server, look at the actual state, act on the difference, repeat. Three replicas wanted, two running: create one. It never stops, so the cluster heals itself without anyone issuing commands.
tags: kubernetes basics

### What is the difference between desired state and actual state?
Desired state is what the manifests say should exist, stored in the datastore. Actual state is what is running right now on the nodes. Kubernetes exists to make the second match the first.
tags: kubernetes basics

### What does the API server do, and who talks to it?
It is the only door into the cluster: it receives requests, authenticates them, validates them and stores the result in the datastore. kubectl talks to it, and so do all internal components (scheduler, controllers, kubelets); they never talk to the datastore directly.
tags: kubernetes architecture

### What happens when you run kubectl get pods?
kubectl reads the kubeconfig for the server address and credentials, sends an HTTPS GET to the API server (port 6443), the API server reads the Pod objects from the datastore and returns JSON, kubectl prints it as a table.
tags: kubernetes architecture kubectl

### What is etcd?
A distributed key-value store (values are stored under keys, like a dictionary, replicated across several machines with a consensus protocol, Raft). Standard Kubernetes stores every object in it: Deployments, Services, ConfigMaps, Secrets, node information. If etcd is lost, the cluster has no memory.
tags: kubernetes architecture

### What is a key-value store?
A database that stores a value under a key and retrieves it by that key, with no tables or joins: a dictionary on disk. Redis and etcd are key-value stores. Kubernetes keeps each object as one value under a key such as /registry/pods/default/app1.
tags: vocabulary

### What does "distributed" mean for a datastore?
The data is held by several machines that agree on it through a consensus protocol, so the store survives the loss of one machine. etcd is distributed; SQLite is a single file on one machine.
tags: vocabulary

### Which datastore does K3s use, and why?
SQLite by default on a single server: a file-based database embedded in the k3s process, no second process, far less memory. For several servers K3s can use embedded etcd or an external database (MySQL, PostgreSQL).
tags: k3s architecture

### What does the scheduler do, and what does it not do?
It picks a node for every new Pod that has none, based on free CPU and memory, node selectors, affinity, taints and tolerations. It only writes the node's name into the Pod object; it does not start anything. The kubelet on that node sees the assignment and starts the containers.
tags: kubernetes architecture

### What are taints and tolerations?
A taint on a node says "keep Pods away unless they tolerate this"; a toleration on a Pod says "I may run on nodes with that taint". Used to reserve nodes. A K3s server has no taint by default, so it runs ordinary workloads next to the control plane.
tags: kubernetes scheduling

### What is node affinity?
A rule in a Pod spec preferring or requiring nodes with certain labels (for example a node labelled disk=ssd). A softer, richer form of nodeSelector.
tags: kubernetes scheduling

### What does the controller manager do?
Runs the built-in controllers in one process: Deployment, ReplicaSet, Node, Job, and others. Each controller watches one kind of resource and reconciles it. Without the controller manager, manifests would be stored but nothing would act on them.
tags: kubernetes architecture

### What is the kubelet?
The agent on every node, including the server. It watches the API server for Pods assigned to its node, tells the container runtime to start their containers, runs the probes, and reports the Pod status back. It is the only Kubernetes component that is not itself a container.
tags: kubernetes architecture

### What is a container runtime, and which one does K3s use?
The program that actually creates and runs containers from images: unpacks the image, sets up namespaces and cgroups, starts the process. Kubernetes talks to it through the Container Runtime Interface (CRI). K3s bundles containerd; Docker Engine, CRI-O and others are alternatives.
tags: kubernetes architecture containers

### What does kube-proxy do?
It runs on every node and makes Service IPs work: it writes iptables (or IPVS) rules so that traffic to a Service's virtual IP is forwarded to one of the Service's Pods. It is not a proxy process in the request path; the kernel does the forwarding. K3s runs it by default.
tags: kubernetes networking

### What happens, step by step, after kubectl apply -f deployment.yaml?
1. kubectl sends the manifest to the API server. 2. The API server validates it and stores the Deployment. 3. The Deployment controller sees it and creates a ReplicaSet. 4. The ReplicaSet controller creates the Pods. 5. The scheduler assigns each Pod a node. 6. The kubelet on that node starts the containers through the container runtime. 7. All controllers keep watching.
tags: kubernetes architecture

### What is kubeadm?
The official tool for installing standard Kubernetes by hand: it initialises a control plane, generates certificates and join tokens, and adds nodes. K3s does the same in one script with one binary; that is the comparison when K3s is called "simpler than kubeadm".
tags: kubernetes k3s

### What does CNCF-certified mean for K3s?
The Cloud Native Computing Foundation, home of Kubernetes, runs a conformance test suite. A distribution that passes may call itself certified Kubernetes: the same API, the same behaviour, so manifests and kubectl work unchanged. K3s passes.
tags: k3s vocabulary

### Who makes K3s?
Rancher Labs, acquired by SUSE in 2020. The name: K8s has ten letters, K3s is meant to be half the size, five letters, so K3s. It is a joke, not an abbreviation.
tags: k3s

### What is edge computing, and why is K3s used there?
Running computation near where the data is produced (a shop, a factory, a vehicle) instead of in a central data centre. Those machines are small, so a Kubernetes that runs in 512 MB and one binary fits. Same reason for IoT devices and development VMs.
tags: k3s vocabulary

### Which components does K3s bundle, and what is each for?
containerd (runs containers), Flannel (Pod network between nodes), CoreDNS (names inside the cluster), Traefik (Ingress controller, HTTP routing), ServiceLB (gives LoadBalancer Services the node's IP), SQLite (datastore), plus the local-path storage provisioner. Each can be disabled with a flag such as --disable traefik.
tags: k3s architecture

### What is a CNI, and what is Flannel?
CNI, Container Network Interface, is the plugin standard for giving Pods their network. Flannel is the simple CNI K3s installs: an overlay network that tunnels Pod traffic between nodes (VXLAN), so every Pod in the cluster can reach every other Pod by IP.
tags: kubernetes networking k3s

### What is CoreDNS for?
The DNS server inside the cluster. Every Service gets a name such as app1-service.default.svc.cluster.local, so a container reaches another application by name rather than by an IP that changes.
tags: kubernetes networking

### What does a K3s server do that an agent does not?
The server runs the control plane: API server, datastore, scheduler, controllers. The agent runs only what a node needs: kubelet, kube-proxy, containerd, Flannel, and a tunnel to the server. Both can run workloads; only the server can manage the cluster.
tags: k3s architecture

### How does a K3s agent join the cluster?
It is installed with two variables: K3S_URL=https://192.168.56.110:6443 (where the server is) and K3S_TOKEN (the secret proving it may join). The install script downloads k3s, registers the node with the server, and the node appears in kubectl get nodes.
tags: k3s part1

### Where does the K3s token come from, and why must it stay out of git?
The server generates it at first start and writes it to /var/lib/rancher/k3s/server/node-token. Anyone holding it can join a node to the cluster and run workloads there, so it is a credential. In Part 1 the provisioning script reads it from the server VM and hands it to the worker, rather than committing it.
tags: k3s part1 security

### What is port 6443?
The port of the Kubernetes API server over HTTPS. kubectl connects to it, and so do agents when they join and afterwards. In Part 1 it is open on 192.168.56.110.
tags: kubernetes networking

### What happens when a worker node fails?
The kubelet stops reporting, the node controller marks the node NotReady after the grace period (40 s by default), and after the eviction timeout (5 min) its Pods are marked for deletion and the controllers create replacements on other nodes with free capacity. With a single worker there is nowhere to go; the Pods stay Pending until the node is back.
tags: kubernetes architecture

### What happens when the only K3s server fails?
The control plane is gone: no API, no kubectl, no scheduling, no reconciliation. Containers already running on the agent keep running, because the kubelet and containerd do not need the server to keep a process alive, but nothing can be changed or repaired until the server returns.
tags: k3s architecture

### What do containers in one Pod share?
The network namespace (one IP, one set of ports, they reach each other on localhost), optionally volumes, and the lifecycle: they are scheduled together on one node and die together. They do not share a filesystem unless a volume is mounted in both.
tags: kubernetes resources

### What is a sidecar container?
A second container in a Pod that helps the main one: shipping its logs, proxying its network traffic (service meshes do this), refreshing a certificate. It shares the Pod's IP and can share a volume, so it sees what the main container sees.
tags: kubernetes resources vocabulary

### Why not create Pods directly?
A Pod made by hand belongs to no controller: if it dies or its node fails, nothing recreates it. A Deployment owns its Pods through a ReplicaSet and replaces them. Bare Pods are for one-off debugging.
tags: kubernetes resources

### What does "ephemeral" mean for a Pod?
Short-lived and replaceable. A Pod is never repaired or moved; when it fails or its node fails it is deleted and a new Pod with a new name and IP is created. Nothing in the cluster should depend on a Pod's identity; Services exist for that reason.
tags: kubernetes vocabulary

### In a Deployment manifest, what are apiVersion, kind and metadata?
apiVersion names the API group and version the kind lives in (apps/v1 for Deployments, v1 for Pods and Services, networking.k8s.io/v1 for Ingress). kind is the resource type. metadata holds the name, the namespace and labels. Together they identify the object; spec says what you want.
tags: kubernetes manifests

### In a Deployment, what are replicas, selector and template?
replicas: how many Pods should run. template: the Pod to create, with its own labels, containers, image, ports. selector.matchLabels: which Pods count as this Deployment's, and it must match the template's labels, otherwise the manifest is rejected.
tags: kubernetes manifests

### What are labels and selectors?
Labels are key-value pairs on any object (app: app2). A selector picks objects by label. That is how a Deployment finds its Pods and how a Service finds the Pods to send traffic to. Nothing links them by name; only labels.
tags: kubernetes basics

### What does containerPort: 80 do?
It documents the port the container listens on. It opens nothing: the container's process listens on 80 anyway and a Service's targetPort refers to it. Leaving it out would still work; it is there for readers and for tools.
tags: kubernetes manifests

### What does the image name nginx:stable mean?
The image nginx from Docker Hub's official library, at the tag stable. Tags are labels on an image version; latest is the default tag, not necessarily the newest. In Part 3 the tags v1 and v2 are what distinguish the two versions of the application.
tags: containers vocabulary

### What is a ReplicaSet, and why do you never write one?
A controller that keeps exactly N Pods matching a selector alive. A Deployment creates one ReplicaSet per version of the Pod template; on an image change it creates a new ReplicaSet and scales the old one down. You write the Deployment and let it manage the ReplicaSets.
tags: kubernetes resources

### How does a rolling update work?
The Deployment creates a new ReplicaSet for the new template and moves Pods over step by step: scale the new one up by a few, wait until they are ready, scale the old one down by a few, repeat. The application stays reachable throughout. kubectl rollout undo goes back to the previous ReplicaSet.
tags: kubernetes resources

### What are maxSurge and maxUnavailable?
Limits of a rolling update. maxSurge: how many Pods above the desired count may exist during the update (default 25 %). maxUnavailable: how many of the desired Pods may be missing at once (default 25 %). maxSurge 1, maxUnavailable 0 means: add one new Pod, wait, remove one old Pod, never fewer than desired.
tags: kubernetes resources

### Liveness probe versus readiness probe?
Liveness: is the container alive? A failing liveness probe gets the container restarted. Readiness: can it take traffic? A failing readiness probe removes the Pod from its Service's endpoints without restarting it. A slow start fails liveness and gets killed; that is what the startup probe prevents.
tags: kubernetes resources

### What is a startup probe for?
For applications that take long to start. While the startup probe has not succeeded, liveness and readiness probes are not run, so a slow start is not mistaken for a dead container and restarted in a loop.
tags: kubernetes resources

### How are probes defined?
In the container spec: httpGet (a path and port that must return 2xx or 3xx), tcpSocket (the port must accept a connection) or exec (a command that must exit 0), with initialDelaySeconds, periodSeconds and failureThreshold.
tags: kubernetes resources

### What is a Service, and why is it needed?
A stable name and virtual IP in front of a set of Pods chosen by label. Pods come and go with new IPs; the Service stays, and kube-proxy forwards its IP to whichever Pods currently match. Without it nothing could find an application reliably.
tags: kubernetes networking part2

### ClusterIP, NodePort, LoadBalancer: what is the difference?
ClusterIP: reachable only inside the cluster (default). NodePort: additionally opens a port between 30000 and 32767 on every node. LoadBalancer: additionally asks for an external IP; in the cloud a provider gives it, in K3s ServiceLB gives the node's own IP. Traefik runs as a LoadBalancer Service, which is why it answers on 192.168.56.110.
tags: kubernetes networking part2

### What is an Ingress, and what is an Ingress controller?
An Ingress is a resource with HTTP routing rules: this host and path go to that Service. It does nothing by itself. The Ingress controller is a reverse proxy (Traefik in K3s, often nginx elsewhere) that reads Ingress resources and routes real requests accordingly.
tags: kubernetes networking part2

### How does Part 2 route app1.com, app2.com and the default?
All three hosts resolve to 192.168.56.110, where Traefik listens on port 80. The Ingress has a rule host: app1.com to app1's Service, host: app2.com to app2's Service, and a rule without host (or a defaultBackend) to app3. Traefik reads the HTTP Host header and picks the rule. Test: curl -H "Host: app1.com" http://192.168.56.110.
tags: kubernetes networking part2

### What is the Host header?
The HTTP header carrying the hostname the client typed. Several names can point to one IP; the server tells them apart only by this header. Browsers send it automatically; curl needs -H "Host: app1.com" or an /etc/hosts entry.
tags: networking vocabulary part2

### What is K3d, and how does it differ from K3s?
K3s is the Kubernetes distribution. K3d is a tool that runs K3s nodes as Docker containers on one machine: k3d cluster create starts a server container, optional agent containers and a load balancer container. No VMs, starts in seconds, needs Docker. Part 3 uses it; the cluster inside is still K3s.
tags: k3d part3

### What is Argo CD?
A GitOps controller for Kubernetes. It runs in the cluster, watches a Git repository, compares the manifests there with what is deployed, and applies the difference, automatically if the Application has automated sync. The Git repository is the source of truth; nobody runs kubectl apply.
tags: argocd part3

### What is GitOps?
Operating a system from a Git repository: the desired state of the cluster lives in Git, every change is a commit, and a controller (Argo CD, Flux) makes the cluster match. You get history, review and rollback for free, and the cluster never drifts from what is written.
tags: argocd vocabulary part3

### What is an Argo CD Application?
A custom resource saying: take the manifests at this path of this repository and keep them deployed in that cluster and namespace. In Part 3 it points at the public GitHub repo and the namespace dev. Its sync policy decides whether changes apply automatically.
tags: argocd part3

### How does the v1 to v2 change reach the cluster in Part 3?
Change the image tag in the deployment manifest in the GitHub repo, commit, push. Argo CD polls the repo (every three minutes by default) or is told by a webhook, sees the Deployment differ, and applies it. The Deployment performs a rolling update to v2. curl localhost:8888 then returns "v2".
tags: argocd part3

### Synced, OutOfSync, Healthy, Degraded: what do Argo CD's statuses mean?
Sync status compares Git with the cluster: Synced when they match, OutOfSync when they differ. Health status looks at the resources themselves: Healthy when Pods run and are ready, Progressing during a rollout, Degraded when something fails. An app can be Synced and Degraded at once.
tags: argocd part3

### What are the two namespaces of Part 3 for?
argocd holds Argo CD itself, installed from its official manifest. dev holds the application Argo CD deploys from the GitHub repo. Separate namespaces keep the tool and its target apart and let you list or delete one without the other.
tags: part3

### How do you get into the Argo CD UI?
Port-forward the argocd-server Service to a local port (kubectl port-forward svc/argocd-server -n argocd 8080:443), open https://localhost:8080, user admin, password from the Secret argocd-initial-admin-secret, decoded from base64.
tags: argocd part3

### What is Helm?
The package manager for Kubernetes. A chart is a set of manifest templates plus default values; helm install renders them with your values and applies them. GitLab in the bonus is installed from its official chart because its dozens of manifests would be unmanageable by hand.
tags: helm bonus

### What is Vagrant, and what is a Vagrantfile?
Vagrant creates and configures virtual machines from a text file. The Vagrantfile (Ruby) names the box (base image), hostname, network, provider settings and provisioners (shell scripts run after boot). vagrant up builds everything; vagrant destroy removes it.
tags: vagrant part1

### What is a Vagrant provider, and which one does this project use?
The hypervisor Vagrant drives: VirtualBox, libvirt (KVM on Linux), VMware, Hyper-V. The Vagrantfile selects it. This project uses libvirt inside the host VM, which requires nested virtualization to be enabled on that VM.
tags: vagrant part1

### Why eth1 and why 192.168.56.x?
eth0 is the NAT interface Vagrant uses to reach the VM for SSH and provisioning. eth1 is the private network interface with the fixed IP from the subject, 192.168.56.110 for the server and .111 for the worker, so the two VMs and the host reach each other at known addresses. K3s is told to use it with --node-ip and --flannel-iface.
tags: vagrant part1 networking
