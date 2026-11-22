# Questions for the cards

Collected while reading the documents. One line per question; the answer goes into the card file later.

## 1. Kubernetes

- What is Kubernetes?
- Why do you need Kubernetes? (not only scaling: failure recovery, zero-downtime updates, scaling, one description for any cluster)
- What does "declarative state management" mean? Is it a programming paradigm? (a style of specification, like React or SQL; imperative counterpart: a script of docker run commands)
- What is the control plane? (not a control panel: the deciding layer, term from networking, control plane vs data plane)
- What does "plane" mean in everyday language and in IT?
- What is a manifest?
- What is a Pod?
- Does Kubernetes assume Docker?
- What is a container in Kubernetes? Same as a Docker container, a lightweight VM?

## 2. K3s

- Why can K3s exist, and what makes it lightweight? (open source is the condition; stripping and bundling is the reason)
- What is a cluster in IT, and what is a Kubernetes cluster?
- What are the alternatives to Kubernetes? Is Terraform one? (no: Terraform provisions; alternatives are Swarm, Nomad, ECS, or compose / serverless / PaaS)
- Why are the control plane components named like kube-apiserver? (name of the executable)
- Where are those components in K3s? (inside the one process `k3s server`)
- What is the difference between K3d and K3s? (tricky, one letter: K3s is the Kubernetes, K3d a launcher that runs K3s nodes as Docker containers)

The complete list of questions is the set of headings in cards.md (`grep '^### ' cards.md`); this file keeps only the questions Stefano raised while reading, with the hint of the answer.
