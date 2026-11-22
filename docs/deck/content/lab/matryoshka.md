# Matryoshka sketches

Kubernetes drawn as nested dolls: what sits inside what, with the ports as small doors and a Service as the dashed address in front of its pods. Read each picture from the outside in. In the general picture the cluster holds three nodes, a node holds pods, a pod holds containers, and the replicas of one Deployment sit on different nodes behind one Service. The control plane, with the API server on port 6443, lives in the server node.

The pictures for the parts use the real names and ports of the project. Part 1 was run; Part 2 and 3 are drawn from the files and the subject. The pods that K3s and Argo CD start by themselves, and the node each pod lands on, are expected, not counted: they are to be read from `kubectl get pods -A -o wide` after a run.

<div class="shots">

<figure>
<img src="/lab-img/matryoshka/matryoshka-general.png" alt="Kubernetes as a Matryoshka">
<figcaption>The general picture: one cluster, three nodes, the control plane in the server node, replicas spread over the nodes, the Service in front of them.</figcaption>
</figure>

<figure>
<img src="/lab-img/matryoshka/matryoshka-p1.png" alt="Part 1 as a Matryoshka">
<figcaption>Part 1: the computer, the host VM, two VMs, one K3s node in each; the cluster is both nodes together, joined at port 6443.</figcaption>
</figure>

<figure>
<img src="/lab-img/matryoshka/matryoshka-p2.png" alt="Part 2 as a Matryoshka">
<figcaption>Part 2: one VM with one node; port 80 reaches Traefik, which picks one of three Services; app2 has three replica pods.</figcaption>
</figure>

<figure>
<img src="/lab-img/matryoshka/matryoshka-p3.png" alt="Part 3 as a Matryoshka">
<figcaption>Part 3: Docker, the k3d cluster, two node containers, the pods of Argo CD and of the app; GitHub outside.</figcaption>
</figure>

</div>
