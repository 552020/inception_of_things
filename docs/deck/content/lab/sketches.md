# Sketches

All sketches of the project on one page, one per screen, in the order Part 1, Part 2, Part 3, the bonus, the whole project, and last Kubernetes in general. Click a picture to see it full screen; there the arrows (or the arrow keys) go to the next and the previous one, and Escape closes it. For each part two pictures: the system when everything runs, and how it comes up, step by step.

A dot marks who opens a connection or starts a step; dashed means written but not run yet. Part 1 has been run, the bonus up to the start of GitLab. All pictures are drawn from `docs/lab/nesting/tools/gen.py`. Numbers of pods in the Kubernetes pictures are made up where they say so.

## Part 1: K3s and Vagrant

<div class="shots stack">

<figure>
<img src="/diagrams/p1-running-sketch.png" alt="Part 1 running">
<figcaption>Part 1 running: the physical computer at 42, the host VM on it, the two VMs as qemu processes in the host VM, K3s server and agent inside them, kubectl as a client in the server VM, Vagrant and Ansible not running.</figcaption>
</figure>

<figure>
<img src="/diagrams/p1-bringup-sketch.png" alt="Part 1 coming up">
<figcaption>Part 1 coming up: make up runs vagrant up, then Ansible over SSH renames the interfaces, installs the K3s server, reads the token and joins the agent.</figcaption>
</figure>

</div>

## Part 2: K3s and three applications

<div class="shots stack">

<figure>
<img src="/diagrams/p2-running-sketch.png" alt="Part 2 running">
<figcaption>Part 2 running: one VM with one node; port 80 reaches Traefik, which picks one of three Services; app2 has three replica pods.</figcaption>
</figure>

<figure>
<img src="/diagrams/p2-bringup-sketch.png" alt="Part 2 coming up">
<figcaption>Part 2 coming up: vagrant up, hostname and packages, the K3s server, then app1, app3 and app2 applied one after the other.</figcaption>
</figure>

</div>

## Part 3: K3d and Argo CD

<div class="shots stack">

<figure>
<img src="/diagrams/p3-running-sketch.png" alt="Part 3 running">
<figcaption>Part 3 running: Docker, the k3d cluster, two node containers, the pods of Argo CD and of the app; GitHub outside.</figcaption>
</figure>

<figure>
<img src="/diagrams/p3-bringup-sketch.png" alt="Part 3 coming up">
<figcaption>Part 3 coming up: make setup creates the cluster and Argo CD and the Application; from then on Argo CD deploys the app from GitHub.</figcaption>
</figure>

</div>

## Bonus: a local GitLab

<div class="shots stack">

<figure>
<img src="/diagrams/bonus-running-sketch.png" alt="Bonus running">
<figcaption>Bonus running: Docker, the k3d cluster bonus, one server node, and in it the pods of GitLab, Argo CD and the app.</figcaption>
</figure>

<figure>
<img src="/diagrams/bonus-bringup-sketch.png" alt="Bonus coming up">
<figcaption>Bonus coming up: make setup creates the cluster, Argo CD and GitLab; make repo and make deploy-app connect them.</figcaption>
</figure>

</div>

## The whole project

<div class="shots stack">

<figure>
<img src="/lab-img/sketches/final-architecture-sketch.png" alt="The finished setup">
<figcaption>The finished setup: the four folders that are turned in, where each runs inside the host VM, and what you see once it is up.</figcaption>
</figure>

</div>

## Kubernetes in general

The nesting reads from the outside in. The limits in the scale pictures are the documented ones for large clusters (kubernetes.io, Considerations for large clusters): 110 pods per node, 5,000 nodes, 150,000 pods in a cluster, at about two containers per pod or fewer.

<div class="shots stack">

<figure>
<img src="/diagrams/nesting-architecture.png" alt="Kubernetes architecture with our technologies">
<figcaption>A full Kubernetes architecture with the technologies we use: the control plane, the objects, the nodes with kubelet, kube-proxy, containerd and Flannel, the K3s add-on pods, Argo CD, and the tools outside that build and ask the cluster.</figcaption>
</figure>

<figure>
<img src="/diagrams/nesting-general.png" alt="Kubernetes: what sits inside what">
<figcaption>The cluster: three nodes, the control plane with the API server in the server node, replicas spread over the nodes with the Service in front of them.</figcaption>
</figure>

<figure>
<img src="/diagrams/nesting-scale.png" alt="Kubernetes at scale">
<figcaption>Kubernetes at scale: many nodes, each with up to 110 pods; squares of one colour are the replicas of one Deployment, spread over the nodes. One pod is zoomed in to show its containers.</figcaption>
</figure>

<figure>
<img src="/diagrams/nesting-node110.png" alt="One node with 110 pods">
<figcaption>One node at its limit: 110 pods, and the containers inside them. The 111th pod goes to another node, or waits as Pending if no node has room.</figcaption>
</figure>

<figure>
<img src="/lab-img/sketches/k8s-replicas-sketch.png" alt="Replicas">
<figcaption>Replicas: a manifest becomes a Deployment, a ReplicaSet and pods; the scheduler spreads the pods over the nodes; replicas are pods, not containers.</figcaption>
</figure>

</div>
