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
SQLite by default on a single server: a file-based database embedded in the k3s process, no second process, far less memory. SQLite is the default, not the only option: embedded etcd with k3s server --cluster-init (required for an HA cluster of three servers, since SQLite lives on one machine), or external MySQL/MariaDB or PostgreSQL through --datastore-endpoint. The shim kine makes the SQL backends look like etcd to the API server.
tags: k3s architecture

### What does the scheduler do, and what does it not do?
It picks a node for every new Pod that has none, based on free CPU and memory, node selectors, affinity, taints and tolerations. It only writes the node's name into the Pod object; it does not start anything. The kubelet on that node sees the assignment and starts the containers.
tags: kubernetes architecture

### What are taints and tolerations?
A taint (the word means a blemish) on a node says "keep Pods away unless they tolerate this"; a toleration on a Pod says "I may run on nodes with that taint". Form key=value:effect, effects NoSchedule (no new Pods), PreferNoSchedule (only if nothing else fits), NoExecute (new ones kept away, running ones evicted); set with kubectl taint nodes. The taint is the lock on the node, the toleration the key in the Pod. Used to reserve nodes: control plane for system components, GPU nodes for GPU Pods. A K3s server has no taint by default, so it runs ordinary workloads next to the control plane.
tags: kubernetes scheduling

### What is node affinity?
A rule in a Pod spec preferring or requiring nodes with certain labels (for example a node labelled disk=ssd). A softer, richer form of nodeSelector.
tags: kubernetes scheduling

### What does the controller manager do?
Runs the built-in controllers in one process: Deployment, ReplicaSet, Node, Job, and others. Each controller watches one kind of resource and reconciles it. Without the controller manager, manifests would be stored but nothing would act on them.
tags: kubernetes architecture

### What is the kubelet?
The agent on every node, including the server: the server is a node too and runs the system Pods (CoreDNS, Traefik) through its own kubelet; in kubeadm clusters the control plane components themselves run as Pods started by the control-plane node's kubelet, with a taint keeping application Pods away, which K3s does not set. It watches the API server for Pods assigned to its node, tells the container runtime to start their containers, runs the probes, and reports the Pod status back. It is the only Kubernetes component that is not itself a container, and the only one that touches containers. The name: kube plus the diminutive -let, the small Kubernetes piece on every machine; in K3s it lives inside the k3s server or k3s agent process.
tags: kubernetes architecture

### What is a container runtime, and which one does K3s use?
The program that actually creates and runs containers from images: unpacks the image, sets up namespaces and cgroups, starts the process. Kubernetes talks to it through the Container Runtime Interface (CRI). K3s bundles containerd, which runs as its own daemon next to k3s server (k3s crictl ps lists its containers). containerd was Docker's core, split out and given to the CNCF in 2017; Docker still uses it underneath, adding the docker command, image building and Compose on top. Kubernetes needs none of that and talks to containerd directly. CRI-O is the other common runtime.
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
A controller that keeps exactly N Pods matching a selector alive. A Deployment creates one ReplicaSet per version of the Pod template; on an image change it creates a new ReplicaSet and scales the old one down. You write the Deployment and let it manage the ReplicaSets; the old one stays at zero for kubectl rollout undo. kubectl get rs shows app2-7d9f8c6b5 (Deployment name plus a hash of the template) with DESIRED, CURRENT, READY; its Pods are app2-7d9f8c6b5-x4k2 and so on, the chain Deployment, ReplicaSet, Pod readable in the name.
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

### Why does Ingress exist: what problem does it solve?
A Service makes Pods reachable, but only one application per address: a NodePort gives every application its own odd port (30000 to 32767), a LoadBalancer its own IP. Three web applications would mean three ports or three IPs. Ingress puts them behind one IP on port 80 and 443 and tells them apart by what the request says: the host name (app1.com, app2.com) or the path (/shop, /blog). That needs something that reads HTTP, so Ingress works on layer 7, where a Service only knows IPs and ports (layer 4). The same place handles TLS certificates. It is what virtual hosts are in nginx or Apache, written as a Kubernetes object.
tags: kubernetes networking part2

### What does a request to app2.com pass through in Part 2?
Client, then 192.168.56.110 port 80 (ServiceLB holds the port on the node), then Traefik, which reads the Host header and finds the matching Ingress rule, then the Service app2 (a stable virtual IP), then one of the three Pods, chosen by kube-proxy. Four objects are involved: Ingress (rule), Service (address), Deployment (how many), Pod (the container). The Ingress never points at Pods, only at a Service.
tags: networking part2

### Is Ingress used in all three parts?
No. Part 1 has no application, so no Ingress; Traefik is installed anyway, because K3s brings it, and sits idle. Part 2 is the Ingress part: one IP, three applications, routing by Host header, and the evaluator asks to see the Ingress. Part 3 does not need one: the application is reached through a NodePort or kubectl port-forward on 8888, the Argo CD interface through port-forward; K3d clusters carry Traefik too, unused here. The bonus usually brings it back, to reach GitLab by name.
tags: networking part1 part2 part3

### What comes after Ingress?
The Gateway API. The Ingress API is frozen: it stays and keeps working, but new features go to the Gateway API, which splits the one object into several (GatewayClass, Gateway, HTTPRoute) so that the cluster operator and the application team each own their part, and which also covers TCP and gRPC. Traefik supports both. For the project only Ingress matters.
tags: kubernetes networking context

### What is Traefik?
A reverse proxy, open source, written in Go by Traefik Labs; the name is said like "traffic". A reverse proxy stands in front of web servers, takes every request and passes it to the right one. K3s installs it as its Ingress controller: a Pod in the namespace kube-system, behind a Service of type LoadBalancer that ServiceLB puts on the node's IP, ports 80 and 443. Traefik watches the Ingress objects through the API server and rewrites its own routing table when one changes; nobody edits a Traefik config file. Ingress is the rule, Traefik is the program that obeys it. Show it: kubectl get pods -n kube-system, kubectl get svc -n kube-system traefik.
tags: k3s networking part2

### How does Part 2 route app1.com, app2.com and the default?
All three hosts resolve to 192.168.56.110, where Traefik listens on port 80. The Ingress has a rule host: app1.com to app1's Service, host: app2.com to app2's Service, and a rule without host (or a defaultBackend) to app3. Traefik reads the HTTP Host header and picks the rule. Test: curl -H "Host: app1.com" http://192.168.56.110.
tags: kubernetes networking part2

### Why was host: app3.com an error in Part 2?
The file is p2/confs/ingress/app3-ingress.yml. The subject says: app1.com shows app1, app2.com shows app2, anything else shows app3. With host: app3.com the rule matched only requests naming exactly app3.com. A request to the bare IP (curl http://192.168.56.110) or with any other host name matched no rule at all, and Traefik answered 404 page not found. app3 was a third named site, not the default. The fix is to delete the host line: a rule without host matches every host name. app1 and app2 are not swallowed by it, because Traefik takes the more specific rule first, and a rule with a host is more specific than one without. Test: curl http://192.168.56.110 and curl -H "Host: whatever.com" http://192.168.56.110 must both show app3.
tags: networking part2

### What is the Host header?
The HTTP header carrying the hostname the client typed. Several names can point to one IP; the server tells them apart only by this header. Browsers send it automatically; curl needs -H "Host: app1.com" or an /etc/hosts entry.
tags: networking vocabulary part2

### What is K3d, and how does it differ from K3s?
K3s is the Kubernetes distribution. K3d is a tool that runs K3s nodes as Docker containers on one machine: k3d cluster create starts a server container, optional agent containers and a load balancer container. No VMs, starts in seconds, needs Docker (the d). Part 3 uses it; the cluster inside is still K3s, the same manifests work. In Part 1 the nodes are VMs made by Vagrant, in Part 3 containers made by K3d. K3d is for development and tests, never production.
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
Vagrant creates and configures virtual machines from a text file. The Vagrantfile (Ruby) names the box (base image, here generic/alpine318), hostname, network, provider settings (libvirt, 512 MB, 1 CPU) and provisioners (here one Ansible playbook run after boot). vagrant up builds everything; vagrant destroy removes it.
tags: vagrant part1

### What is a Vagrant provider, and which one does this project use?
The hypervisor Vagrant drives: VirtualBox, libvirt (KVM on Linux), VMware, Hyper-V. The Vagrantfile selects it. This project uses libvirt inside the host VM, which requires nested virtualization to be enabled on that VM.
tags: vagrant part1

### Why eth1 and why 192.168.56.x?
eth0 is the NAT interface Vagrant uses to reach the VM for SSH and provisioning. eth1 is the private network interface with the fixed IP from the subject, 192.168.56.110 for the server and .111 for the worker, so the two VMs and the host reach each other at known addresses. Our playbook installs K3s with no interface flags; it works because the agent is pointed at 192.168.56.110 explicitly and both VMs also share libvirt's NAT network on eth0. On other setups --node-ip and --flannel-iface pin K3s to eth1.
tags: vagrant part1 networking

### What is a Vagrant box?
A packaged base image of a virtual machine (disk plus metadata) built for one provider, published on Vagrant Cloud under a name such as debian/bookworm64 or generic/ubuntu2204. The Vagrantfile names it in config.vm.box; vagrant up downloads it once, caches it, and clones it for every VM.
tags: vagrant part1

### What is a Vagrant provisioner?
A step Vagrant runs against the VM after its first boot: a shell script (inline or from a file), or Ansible, Puppet, Chef. In this project it is an Ansible playbook, confs/ansible/playbook.yml, run from the host over SSH after both VMs are up; it installs K3s as server and agent. It runs once; vagrant provision runs it again.
tags: vagrant part1

### What do vagrant up, ssh, halt, destroy and status do?
up: create the VMs from the Vagrantfile, boot them, run the provisioners (just boots them if they exist already). ssh <name>: open a shell in a VM without a password, with the key Vagrant generated. halt: shut the VMs down, keeping their disks. destroy: delete the VMs and their disks. status: show which VMs exist and whether they run.
tags: vagrant part1

### How does Vagrant give you SSH without a password?
On first boot Vagrant replaces the box's insecure public key with a freshly generated key pair, stores the private key under .vagrant/, and vagrant ssh uses it. For SSH from the host between the VMs or by name, the private key path is shown by vagrant ssh-config.
tags: vagrant part1

### Is Vagrant a hypervisor? What is a hypervisor?
No. A hypervisor is the software that actually runs virtual machines: VirtualBox, KVM (driven through libvirt on Linux), VMware, Hyper-V. Type 1 runs on the hardware (KVM, ESXi, Hyper-V), type 2 as a program inside an operating system (VirtualBox). Vagrant only drives one, called the provider: it reads the Vagrantfile and tells the hypervisor to create the VM from a box, attach the network, then runs the provisioners. This project drives libvirt/KVM inside the host VM, hence nested virtualization.
tags: vagrant vocabulary part1

### What are the alternatives to Vagrant, and why does the project use Vagrant?
Why: the subject requires it, and for the reason the subject does: a VM is created reproducibly from one text file, with network and provisioning, independent of the hypervisor, so vagrant up on the evaluator's machine gives the same two VMs. Alternatives: Multipass (Canonical, Ubuntu-only, cloud-init), Terraform with the libvirt or VirtualBox provider (VMs as code, built for larger infrastructure), virt-install/virsh scripts with cloud-init (no layer in between, more manual), Lima or Incus/LXD (light VMs or system containers), or containers instead of VMs, which is what Part 3 does with K3d.
tags: vagrant part1

### What would a startup use today instead of Vagrant?
Not VMs. On the laptop: Docker Compose or dev containers (Codespaces, Gitpod); if a local Kubernetes is needed, kind, K3d or minikube with Tilt or Skaffold, which is the step from Part 1 to Part 3. In production: no Kubernetes at all for small teams (Vercel, Fly.io, Railway, Render, Cloud Run), or managed Kubernetes (GKE, EKS, AKS) described with Terraform or Pulumi and deployed with Argo CD or Flux. Vagrant survives where real machines matter: OS tests, Ansible roles, network labs, teaching.
tags: vagrant context

### What does a large corporation use instead of Vagrant and K3s?
Still VMs, but without Vagrant: VMware vSphere/ESXi (now Broadcom; migrations to Nutanix, Proxmox, OpenShift Virtualization under way), Windows Server with Hyper-V. A VM comes by ticket from the infrastructure team, configured with Ansible or Puppet, maybe ordered through Terraform or a portal. Kubernetes as a supported product: Red Hat OpenShift, Rancher (SUSE, the company behind K3s), VMware Tanzu. Around it Jenkins, self-hosted GitLab or Bitbucket, Artifactory, Citrix desktops, and in banks still the mainframe. The difference to a startup is less the tool than who operates it: a department with a process.
tags: context

### How does a startup with real traffic peaks scale, and where do Terraform and Argo CD fit?
Managed Kubernetes (GKE, EKS) because it scales on two levels: the Horizontal Pod Autoscaler raises a Deployment's replicas when CPU or requests per Pod rise, and the cluster autoscaler (Karpenter on AWS) adds nodes when Pods find no room, returning them after the peak; KEDA scales on queue length or events. In production the replicas number is written by an autoscaler, not by hand. Terraform (or OpenTofu, Pulumi) creates the cluster and cloud resources; Argo CD, CNCF-graduated and the most used GitOps tool, deploys from Git. Teams that want no cluster use serverless containers (Cloud Run, Fargate) or functions (Lambda), which scale from zero automatically but cost more under constant load. A CDN in front keeps most of the peak away.
tags: context scaling

### What is HCL?
HashiCorp Configuration Language, the language of Terraform files: declarative like YAML but with blocks, variables, expressions and functions, for example resource "aws_instance" "web" { instance_type = "t3.small" }. Also used by Vault, Consul, Nomad and Packer. Pulumi is the alternative for writing the same thing in TypeScript, Python or Go.
tags: terraform vocabulary

### Managed versus self-managed Kubernetes: which one is this project?
Managed (GKE, EKS, AKS): the cloud provider runs the control plane, API server, etcd, scheduler, upgrades, high availability; you get a kubeconfig and pay per cluster-hour plus nodes, and never see the control plane. Self-managed: you install and run it yourself with kubeadm, K3s, RKE2 or kops, and own etcd backups, certificates and upgrades. This project is self-managed: Part 1 runs k3s server on one VM and k3s agent on the other, the control plane in our hands, the layer GKE hides.
tags: kubernetes context k3s

### Which part of our stack is made by HashiCorp?
Vagrant, HashiCorp's first product (2010), before Terraform, Packer, Vault, Consul and Nomad. HashiCorp belongs to IBM since 2025. Nothing else in the project is HashiCorp's; Terraform is not used here.
tags: vagrant context

### Do we use etcd anywhere? Why is it in our documentation?
No. K3s with one server stores the cluster state in SQLite (/var/lib/rancher/k3s/server/db/state.db), in Part 1 and in K3d in Part 3 alike; etcd would come only with several servers (--cluster-init). It is in the documentation because standard Kubernetes uses etcd and the evaluator asks about it, and because K3s is closer to it than it looks: the API server still speaks the etcd protocol, and a shim called kine translates it to SQLite. Kubernetes believes it has etcd.
tags: k3s architecture

### Where does the name etcd come from?
The Unix /etc directory, where configuration lives, plus d for distributed, not daemon: a distributed /etc, configuration for a whole system of machines instead of one. Built by CoreOS in 2013, adopted by Kubernetes in 2014 to hold the cluster objects, which are configuration plus their status.
tags: vocabulary kubernetes

### etcd is a configuration store, Kubernetes calls it a datastore: what does it actually hold?
Only Kubernetes objects: Deployments, Services, ConfigMaps, Secrets, Nodes, that is, the manifests as stored, which are configuration. The one part beyond configuration is each object's status, written by controllers: the node a Pod landed on, whether it is ready, replicas up. No application data, files or logs; a whole cluster is a few megabytes, and etcd's default limit is 2 GB. So: configuration plus the current state of that configuration. The Node objects are there too (key /registry/minions/<name>, the old word for nodes): capacity, allocatable, labels, and the kubelet's heartbeat every ten seconds; when it stops, the node turns NotReady. Everything anyone in the cluster knows is in the datastore, which is why it is the one thing to back up: nodes can be replaced, state.db cannot.
tags: kubernetes architecture

### Is the Ansible playbook inside or outside Kubernetes?
Outside, one layer below. Vagrant runs it from the host over SSH after both VMs are up; it configures the operating system and installs K3s. Nothing in it is given to kubectl. Layers of Part 1, bottom up: libvirt runs the VMs, Vagrant creates them, Ansible installs K3s, K3s is Kubernetes, and only above that come the manifests. Two YAML files, two worlds: a playbook describes steps on machines, a manifest describes objects in the cluster.
tags: ansible vagrant part1

### What does the Part 1 playbook do, step by step?
Play 1 on slombardS: install python3 and curl with apk (Alpine), run the K3s installer, wait for /etc/rancher/k3s/k3s.yaml and the node token. Play 2 on slombardSW: wait for port 6443 on 192.168.56.110, read the token from the server with delegate_to, install the agent with K3S_URL and K3S_TOKEN. Play 3 on the server: k3s kubectl get nodes and print it. The token never touches the repo; Ansible carries it over SSH.
tags: ansible part1

### Draw Part 1 as nested circles: where are the Vagrantfile, the playbook, K3s and the Pods?
Outer circle: the host VM. Inside: Vagrant with libvirt, and in that ring the Vagrantfile and the playbook as files. Inside Vagrant: the two Alpine VMs. Inside each VM: K3s. The Kubernetes circle with the Pods spans both VMs, one cluster across two machines. The playbook never enters the VMs: Ansible runs on the host and reaches in over SSH to install K3s; afterwards the cluster runs without it.
tags: part1 architecture

### Are the two Part 1 VMs on different physical servers? What does "server" mean in this project?
No: both run on the same host VM on one physical computer; libvirt gives each its own kernel, disk and IP, so K3s sees two machines. The exercise simulates a two-machine cluster on one laptop. In production nodes are separate physical servers or VMs on separate hosts, otherwise one hardware failure takes the cluster down. "Server" has three meanings here: the physical machine, the K3s server role (slombardS with the control plane, versus the agent slombardSW), and the API server component inside it. Say "server VM" or "server node" for slombardS.
tags: part1 vocabulary

### How do Vagrant and Ansible relate in Part 1?
Siblings on the host, neither contains the other. During vagrant up, Vagrant writes an inventory with the two VMs and their SSH details, runs ansible-playbook with it and the playbook, and waits. Ansible is agentless: no daemon, no instance, a run and nothing more. The same playbook works without Vagrant against any machines reachable by SSH. Vagrant owns the VMs, Ansible owns what happens inside them, once.
tags: ansible vagrant part1

### Where are the two Alpine VMs declared?
In p1/Vagrantfile, one config.vm.define block each: slombardS and slombardSW. Each block sets hostname, the box generic/alpine318, a private_network with the fixed IP (.110 or .111) on the libvirt network vagrant56 without DHCP, and the libvirt provider settings: 512 MB, 1 CPU, cpu_mode host-passthrough. The Ansible provisioner block at the end applies to both. Alpine is only the word in the box name: no ISO, no installation, Vagrant downloads the ready image from Vagrant Cloud.
tags: vagrant part1

### Does the Part 1 setup have a real-world equivalent?
Vagrant on a laptop is a lab, but take Vagrant away and the rest is a real pattern: K3s on two small Linux machines, one server, one agent, installed by Ansible, is what edge installations look like: supermarket tills, factory floors, sensor sites, Raspberry Pi clusters. Rancher maintains k3s-ansible, which does nearly what our playbook does, and the playbook would run on real machines with another inventory. Vagrant's real role: testing such a playbook on throwaway VMs before touching hardware. Part 2 (Ingress by host) is everyday cluster work; Part 3 (Argo CD) is the production pattern.
tags: part1 context

### Do you always need at least two servers on two machines? What does real high availability take?
For availability, two is not enough. Part 1 has workload redundancy (the agent can fail, Pods keep running on the server) but one control plane: slombardS is a single point of failure. Real HA needs three servers, not two, because etcd decides by majority and two minus one has none; three servers plus any number of agents, on separate machines, in the cloud across separate data centres. Availability is not the only point, though: at the edge K3s often runs on one box on purpose, because the gain is uniformity, the same manifests, kubectl and Argo CD for a thousand shops and the data centre. HA is what you get on top when you have enough machines.
tags: kubernetes architecture context

### What is Part 1 about?
Two VMs from one Vagrantfile, Alpine, 512 MB, fixed IPs on eth1: slombardS at 192.168.56.110, slombardSW at .111. Ansible installs K3s on the first as server and on the second as agent, which joins with the server's URL and token. Result: a two-node cluster, kubectl get nodes shows both Ready. Theme: how a cluster comes into being, control plane and worker, a node joining.
tags: part1 overview

### What is Part 2 about?
One VM, K3s as server, no agents. Three web applications as Deployments, app2 with three replicas, each behind a Service. One Ingress routes requests to 192.168.56.110 by Host header: app1.com to app1, app2.com to app2, anything else to app3; Traefik executes it. Theme: Deployments, Services, Ingress, replicas.
tags: part2 overview

### What is Part 3 about?
No Vagrant VMs. A script installs Docker and K3d; K3d starts the K3s cluster as Docker containers. Two namespaces: argocd with Argo CD, dev with an application Argo CD deploys from a public GitHub repo. The application has two image tags, v1 and v2; change the tag in the repo and push, Argo CD rolls out the new version, curl on port 8888 shows v2. Theme: K3d versus K3s, GitOps, continuous deployment.
tags: part3 overview

### How do the three parts build on each other, and what does the bonus add?
Part 1 builds the machines under the cluster, Part 2 the applications inside the cluster, Part 3 the road from Git into the cluster. The bonus repeats Part 3 with a local GitLab instead of GitHub, in a namespace gitlab, installed with Helm.
tags: overview bonus

### Is K3s used in the real world?
Yes, wherever clusters are small or numerous, not in large data-centre clusters (there: managed Kubernetes, OpenShift, or RKE2, K3s' hardened sibling from the same company). Edge and IoT: shops, factories, vehicles, wind farms, sold by SUSE as Rancher with K3s to customers with thousands of sites. Civo runs its managed Kubernetes on K3s. CI pipelines that need a cluster per test run. Developer laptops, homelabs, Raspberry Pi. Small companies with one to three servers. A CNCF project since 2020 and the most used lightweight Kubernetes.
tags: k3s context

### What is Rancher?
Two things. Rancher Labs is the company (California, 2014, part of SUSE since 2020) that built K3s, RKE and RKE2. Rancher is its main product: a management platform with a web UI for many Kubernetes clusters at once, installing clusters (K3s, RKE2), importing others (EKS, GKE, AKS), and giving users, permissions, monitoring and an app catalogue across all of them. The name is the "cattle, not pets" image: servers are a herd, interchangeable; whoever keeps the herd is a rancher. We use only K3s; the paths /etc/rancher/k3s and /var/lib/rancher on the VMs are the maker's mark.
tags: k3s vocabulary context

### Are server and agent roles we define, or part of K3s?
Part of K3s: the two ways the one binary can start. k3s server runs the control plane plus the worker part; k3s agent runs only the worker part and registers with a server. We only choose which machine gets which role. In the install script one thing decides: if K3S_URL is set, an agent is installed, otherwise a server; our playbook calls the installer without variables on slombardS and with K3S_URL and K3S_TOKEN on slombardSW. Standard Kubernetes calls the same roles control-plane node (formerly master) and worker node; the subject says controller mode and agent mode. kubectl get nodes shows it in the ROLES column: control-plane,master for slombardS, none for slombardSW.
tags: k3s part1

### Is the agent part of the server, since the server controls it?
No: it belongs to the cluster, not to the server; two processes on two machines. And the control runs the other way round: the server never logs into the agent or sends it commands. The agent's kubelet keeps a connection to the API server on port 6443 and watches for Pods assigned to its node, starts them itself, reports status, keeps watching. The server only writes "this Pod belongs on slombardSW" into its datastore. Control by asking, not by ordering, which is why the agent keeps running when the server dies. The agent also opens a tunnel to the server through which the server reaches the kubelet for kubectl logs and exec; even that connection is opened by the agent.
tags: k3s architecture part1

### Why does the server node mix control plane and workloads? Is that against the Unix philosophy?
The Unix philosophy is about programs, and there Kubernetes follows it: API server, scheduler, controller manager, kubelet and kube-proxy are separate programs with one job each, talking through the API. What is mixed is the machine, a choice of distribution, not of design. K3s mixes on purpose: it targets small setups (a 512 MB edge box, a laptop, Part 2 with one VM) where a machine doing only control plane would be waste, and a one-machine cluster would be impossible. Standard Kubernetes separates by taint; K3s can too, with --node-taint CriticalAddonsOnly=true:NoExecute on the server. The single binary is packaging, not mixing: inside, the components stay separate parts in one process.
tags: k3s architecture

### Who starts the container?
The kubelet, through the container runtime. The scheduler only writes the node name into the Pod object in the API server. The kubelet on that node sees a new Pod assigned to it and calls containerd over the CRI: pull the image, create namespaces and cgroups, start the process; containerd's helper runc actually creates the container. Then the kubelet watches it and reports status. Three parties, one job each: the scheduler decides where, the kubelet orders, containerd with runc executes.
tags: kubernetes architecture

### Is there a maximum number of replicas, or Pods, on one worker node?
Replicas have no limit; a node has one for Pods in total: the kubelet accepts 110 Pods per node by default (K3s too), changeable with --max-pods. Other limits bite first: resources (with CPU and memory requests the scheduler places only what the node covers; without requests the node simply fills up) and IP addresses (Flannel gives each node a /24, about 250 Pod IPs). Cluster-wide, Kubernetes tests up to 5000 nodes and 150 000 Pods. Nothing spreads replicas by default: app2's three Pods may all land on one node. To force different nodes, use podAntiAffinity or topologySpreadConstraints in the Pod template; only then does a replica protect against a machine failure.
tags: kubernetes scheduling

### Does Kubernetes regulate Pod creation by the machine's available resources?
Only if told. The scheduler counts what Pods declare, resources.requests (e.g. 100m CPU, 128Mi memory), not what they use: the sum of requests on a node must fit its capacity, and a Pod that fits nowhere stays Pending. Without requests, as in most teaching manifests, it counts only Pods up to 110 and the machine can fill up. After start: limits are enforced by the kernel (over the memory limit: OOMKilled and restarted; over CPU: throttled), and when the node as a whole runs short the kubelet evicts Pods, which are recreated elsewhere. What does not exist: replicas changing by themselves; replicas: 3 stays 3 whatever the load. That is the Horizontal Pod Autoscaler's job, and adding nodes the cluster autoscaler's. Picture: a hotel with 110 rooms where guests must say how many beds they need; whoever says nothing is checked in until the beds run out.
tags: kubernetes scheduling resources

### What does 100m CPU mean? How are CPU and memory requests written?
CPU is counted in millicores, thousandths of a core: 1000m is one core, 500m half, 100m a tenth. Memory in bytes with binary suffixes: 128Mi is 128 mebibytes, 1Gi a gibibyte. requests is what the scheduler reserves for the container (it must fit the node's free capacity), limits what the kernel enforces at run time. In the container spec: resources: {requests: {cpu: 100m, memory: 128Mi}, limits: {cpu: 500m, memory: 256Mi}}.
tags: kubernetes resources

### How does the scheduler know a node's capacity, if the VM size is set outside Kubernetes?
From the machine itself. The Vagrantfile tells libvirt how big the VM is and is then out of the picture; the VM's kernel simply sees 1 CPU and 512 MB. At start the kubelet asks that kernel (/proc/cpuinfo, /proc/meminfo, cgroups) and reports the result to the API server into the Node object: status.capacity, and status.allocatable, capacity minus what is reserved for system and kubelet. The scheduler reads only that object. kubectl describe node shows Capacity, Allocatable and Allocated resources, the sum of requests of the Pods there. Same pattern as everywhere: the kubelet looks at its machine and writes into the API, everyone else reads the API.
tags: kubernetes scheduling architecture

### How do the scheduler and the controller manager depend on each other?
They do not know each other; both talk only to the API server. The chain: the controller manager (its ReplicaSet controller) creates Pod objects with an empty nodeName; the scheduler watches for Pods without a node, picks one and writes it in; the kubelet watches for Pods with its node name and starts them. Three programs, each reacting to a field another wrote, none calling another. So they fail independently: scheduler down, Pods are still created but stay Pending; controller manager down, nothing new is created or repaired, but what runs keeps running. The pattern of the whole control plane: depend on the API server, never on each other. In K3s both live in one process and still talk through the API.
tags: kubernetes architecture

### What does "the ReplicaSet controller creates Pod objects" mean?
Creating a Pod object is writing a record into the API server, a document saying "a Pod named app2-7d9f-x4k2 with this image, ports and labels should exist": a wish, nothing running yet. The scheduler adds the node, the kubelet turns it into containers. In Kubernetes, object always means the database entry; the running thing is its status. The controller manager is one process holding dozens of small loops, one per object kind. The ReplicaSet loop: read all ReplicaSets, count the Pods matching each one's labels, if fewer than replicas write new Pod objects from its template with a random suffix, if more delete the surplus. Delete a Pod of app2 and the loop counts two, writes one: self-healing is a counting loop.
tags: kubernetes architecture resources

### What does "scheduling" or "placing" a Pod mean?
Deciding which node a Pod runs on and writing that decision into the Pod object: one field, spec.nodeName, created empty and filled by the scheduler with, say, slombardSW. The scheduler moves and starts nothing; it writes a name into a field. The word scheduling has nothing to do with time here, only with place. Two stages: filter the nodes that qualify (enough free requests, no taint without toleration, matching labels), then score the rest and pick the best, usually the least loaded. Part 1 has two candidates, Part 2 one. The kubelet seeing its name in the field makes the containers.
tags: kubernetes scheduling

### Does a worker node know about replicas?
No. A node sees only Pods: the kubelet is told "Pod app2-7d9f-x4k2 is yours" and starts it; whether it is one of three or the only one is written nowhere on the node. replicas is a number in the Deployment, stored in the control plane's datastore and enforced by the ReplicaSet controller on the server. The complete list of what runs on a node: kubelet, container runtime, kube-proxy, the CNI plugin (Flannel), and on top of them the Pods.
tags: kubernetes architecture

### Are Pods replicas?
Replicas are Pods, not the other way round. Every replica of a Deployment is a Pod: app2's three replicas are three Pods from the same template. But a Pod is a replica only if a ReplicaSet holds it; a Pod made by hand, or by a DaemonSet or a Job, is a Pod and a replica of nothing. Replica is the role, Pod is the thing.
tags: kubernetes resources vocabulary

### Is a Pod a configuration, like a class, or a process?
Both, in sequence, and the class is one step up: the Deployment's template is the class, a description without a name; the Pod object is an instance, a record with its own name, IP and status in the datastore, pure data with identity. A replica is such an instance seen as one of N siblings from the same template: an instance of the template, not of a Pod, since a Pod has no instances, it is one. Then the kubelet makes it run: one process per container, plus a tiny pause container that only sleeps and holds the shared namespaces (above all the network with the IP) so the containers share them and can restart one by one. A running Pod is a group of processes in shared namespaces, not one process; ps on the node shows the processes, the Pod is the bracket around them. The object's status (Running, Ready, Restarts) is the kubelet watching the processes and writing back. A Pod is not a running container: a Pending Pod exists as an object with no container running yet; in CrashLoopBackOff the object stays while its container dies and restarts. The object outlives its containers, never the reverse.
tags: kubernetes resources

### Which networks exist in Part 1, and who made each?
Three, stacked. The VM network from Vagrant: eth1 with 192.168.56.110 and .111 (plus eth0 NAT); machines talk here, the API listens on 6443, requests from outside arrive here; Kubernetes uses it, did not make it. The Pod network from Flannel: 10.42.0.0/16, a /24 per node (server Pods 10.42.0.x, agent Pods 10.42.1.x); every Pod reaches every Pod, between nodes through a tunnel over the VM network; exists only inside the cluster. The Service network: 10.43.0.0/16, the ClusterIPs, no interface at all, only forwarding rules written by kube-proxy on each node; an address without a machine. Traefik bridges bottom and top: it listens on the VM IP, port 80, and forwards into the Service network. Three commands, three layers: ip a, kubectl get pods -o wide, kubectl get svc.
tags: kubernetes networking part1

### How does a Pod on the agent reach a Pod on the server, if their IPs are not from the Vagrant network?
Through Flannel, the CNI plugin K3s installs. Flannel runs on every node, gives each node its own Pod range (server 10.42.0.0/24, agent 10.42.1.0/24) and hands every new Pod an IP from it. A packet from 10.42.1.5 to 10.42.0.7 is wrapped by Flannel into a second packet from 192.168.56.111 to 192.168.56.110 and unwrapped on the other side: VXLAN, an overlay network riding on the VM network. Without a CNI plugin Pods get no IP and nodes stay NotReady ("network plugin not ready"). The name is the flannel shirt, made by CoreOS in 2014, the makers of etcd.
tags: kubernetes networking part1

### What is kubectl?
The command-line client of the cluster. It does nothing inside the cluster itself: every command becomes an HTTPS request to the API server, get is a GET, apply -f a POST or PUT with your manifest, delete a DELETE; the JSON answer is printed as a table. It finds the server through the kubeconfig (address plus certificate), in K3s at /etc/rancher/k3s/k3s.yaml, which is why kubectl works on the server VM without setup, as k3s kubectl or through the symlink the installer creates. Name: kube control. It is a client, not part of the control plane, like a browser to a web server; with a copied kubeconfig it drives the cluster from a laptop.
tags: kubernetes kubectl

### What does "the API server validates the request" mean?
A chain of checks before anything is stored. 1. Authentication: who are you? The certificate from your kubeconfig; unknown is 401. 2. Authorization: may you do this? RBAC roles, e.g. may this user create Deployments in namespace dev; no is 403. 3. Admission: cluster rules that may change or reject the request, where defaults are filled in (an update strategy you did not write) and policies could apply (no container without limits). 4. Schema validation: is this a valid object of its kind, required fields, types, no unknown fields, selector matching the template labels; a typo like replica: instead of replicas: returns "error validating data". Only after all four is the object written and seen by controllers.
tags: kubernetes architecture

### Who discovers a new Deployment in the datastore, and how?
The Deployment controller in the controller manager, by subscribing, not by looking. At start every controller opens a request to the API server with ?watch=true, an HTTP connection that never ends; the API server pushes every event for that object kind over it as a line: ADDED, MODIFIED, DELETED, with the object. kubectl apply creates a Deployment, the API server stores it and at once sends ADDED on the controller's open connection. The controller puts the object in a local cache, its name in a work queue, and a loop takes it out and reconciles: ReplicaSet for it exists? No, create one. Watch plus cache plus queue is called an informer and sits in every controller, Argo CD included. The API server gets the events from etcd's own watch; with SQLite, kine imitates it by polling the table. If a connection breaks, the controller re-lists everything and watches again.
tags: kubernetes architecture

### Is the Deployment controller a process or a daemon?
Neither: a loop inside the controller manager, one Go routine (a lightweight thread) in the kube-controller-manager process, next to the ReplicaSet, Node, Job and some forty other controllers, all sharing one connection to the API server. kubeadm shows one kube-controller-manager process; in K3s it all lives inside k3s server. Packaging, not law: a controller is only the pattern watch, compare, act, and can run anywhere with API access. Argo CD is a controller for Application objects running as Pods in the argocd namespace; Traefik is a controller for Ingress objects running as a Pod. Built-in ones are bundled; added ones come as Pods.
tags: kubernetes architecture

### Is a ReplicaSet a process?
No, only an object: an entry in the datastore with replicas, selector and template, a note saying "three Pods like this template"; the note does nothing, however much is written on it. An object describes a desired state, a controller is the process that produces it. The doing is the ReplicaSet controller, one loop in the controller manager for all ReplicaSets in the cluster, not one per ReplicaSet. The pattern for every kind: the object is passive, its controller active. Deployment, ReplicaSet, Pod, Service, Ingress are entries; Deployment controller, ReplicaSet controller, kubelet, kube-proxy, Traefik are the loops or processes that read and realise them. "The ReplicaSet replaces the Pod" is shorthand for "the ReplicaSet controller replaces the Pod because the ReplicaSet asks for three".
tags: kubernetes architecture resources

### What is inside a ReplicaSet object?
replicas: the number. selector: not a pointer to Pods but a query, "all Pods with app=app2"; the controller recounts what matches on every pass, so a hand-made Pod with the label is counted too. A set in the mathematical sense, defined by a condition, not a list of members; the name came in 2016 because, unlike the older ReplicationController, the selector can take set expressions such as app in (app1, app2). template: the full Pod description (containers, image, ports, labels) from which new Pods are built, the largest part. metadata: name, namespace, and ownerReferences pointing to the Deployment that made it; the real pointer, and it points up, not down: Pods point to their ReplicaSet, the ReplicaSet to its Deployment, and deleting the owner removes the children through these pointers. Plus status written by the controller: replicas, readyReplicas, availableReplicas, the numbers kubectl get rs shows.
tags: kubernetes resources

### How do you show that a Pod is an object?
kubectl get pod <name> -o yaml prints it: apiVersion v1, kind Pod, metadata with name, labels and ownerReferences to its ReplicaSet, spec with the containers, status with phase, IP and restarts; the same shape as a Deployment, only kind Pod. kubectl api-resources lists every object kind the API server knows, pods in the first line; Pod is the oldest kind, in the core API v1, Deployment came later in apps/v1. The confusion: a Pod is the one object that becomes something running, and people mean the running thing. Both are true in sequence: first the entry, then the processes the kubelet makes from it. Proof by hand: kubectl apply -f pod.yaml with kind Pod, and it appears in kubectl get pods without any Deployment.
tags: kubernetes resources
