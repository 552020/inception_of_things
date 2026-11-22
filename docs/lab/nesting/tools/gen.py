"""Nesting sketches of Kubernetes: what sits inside what, with the ports as small doors.
Same hand-drawn style as docs/diagrams (paper, ink, one accent colour). Writes ../src/*.html; the PNGs in ../img are
screenshots of them (see ../NOTES.md). Usage: python3 gen.py"""
import os
from html import escape

W, H = 1500, 960
HERE = os.path.dirname(os.path.abspath(__file__))

class Sketch:
    def __init__(self, title, label):
        self.title, self.label = title, label
        self.shapes, self.texts, self.marks, self.defs = [], [], [], []
    # shapes (inside the hand-drawn filter)
    def box(self, x, y, w, h, kind="thin", plan=False, svc=False, fill=True, rx=6):
        cls = [kind] + (["fill"] if fill else []) + (["plan"] if plan else []) + (["svc"] if svc else [])
        self.shapes.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="{" ".join(cls)}"/>')
    def arrow(self, x1, y1, x2, y2, plan=False, accent=False):
        cls = "line" + (" plan" if plan else "") + (" acc" if accent else "")
        self.shapes.append(f'<path d="M{x1},{y1} L{x2},{y2}" class="{cls}" marker-end="url(#arrow)"/>')
    def line(self, d, accent=True, plan=True):
        cls = "line" + (" acc" if accent else "") + (" plan" if plan else "")
        self.shapes.append(f'<path d="{d}" class="{cls}"/>')
    # marks (crisp, outside the filter)
    def door(self, x, y, w=16, h=30):
        self.marks.append(f'<rect x="{x - w/2}" y="{y - h/2}" width="{w}" height="{h}" rx="3" class="door"/>')
    def doorh(self, x, y, w=30, h=14):
        self.marks.append(f'<rect x="{x - w/2}" y="{y - h/2}" width="{w}" height="{h}" rx="3" class="door"/>')
    def dot(self, x, y): self.marks.append(f'<circle cx="{x}" cy="{y}" r="7" class="dot"/>')
    def t(self, x, y, s, cls="s", anchor=None):
        a = f' text-anchor="{anchor}"' if anchor else ""
        self.texts.append(f'<text x="{x}" y="{y}" class="{cls}"{a}>{escape(s)}</text>')
    def html(self):
        return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(self.title)}</title>
<style>
  :root {{ --paper:#fbfaf6; --ink:#1d1d1b; --soft:#6b6a66; --accent:#b4531a; }}
  html, body {{ margin:0; background:var(--paper); color:var(--ink); }}
  body {{ padding:16px; font-family:"Patrick Hand","Bradley Hand","Segoe Print","Comic Sans MS","Chalkboard SE",cursive; }}
  svg {{ display:block; width:100%; height:auto; max-width:1500px; margin:0 auto; }}
  .line  {{ fill:none; stroke:var(--ink); stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; }}
  .thin  {{ fill:none; stroke:var(--ink); stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }}
  .plan  {{ stroke-dasharray:9 7; }}
  .svc   {{ stroke:var(--accent); stroke-width:2.2; }}
  .acc   {{ stroke:var(--accent); }}
  .fill  {{ fill:var(--paper); }}
  .dot   {{ fill:var(--accent); stroke:none; }}
  .door  {{ fill:var(--accent); stroke:var(--ink); stroke-width:1.6; }}
  .ca {{ fill:var(--accent); stroke:var(--ink); stroke-width:1; }}
  .cb {{ fill:var(--ink); stroke:var(--ink); stroke-width:1; }}
  .cc {{ fill:#c9c6bd; stroke:var(--ink); stroke-width:1; }}
  .cs {{ fill:url(#hatch); stroke:var(--ink); stroke-width:1; }}
  .ce {{ fill:none; stroke:#cfcdc6; stroke-width:1; }}
  .pw {{ fill:#f3d9c6; stroke:var(--accent); stroke-width:2; }}
  .pa {{ fill:#ffffff; stroke:var(--ink); stroke-width:2.2; }}
  .pk {{ fill:#dedbd2; stroke:var(--ink); stroke-width:1.4; }}
  .ps {{ fill:url(#hatch); stroke:var(--ink); stroke-width:1.4; }}
  .cn {{ fill:#fbfaf6; stroke:var(--ink); stroke-width:1.3; }}
  .cz {{ fill:none; stroke:var(--accent); stroke-width:3; }}
  .t     {{ font-size:22px; fill:var(--ink); }}
  .h     {{ font-size:30px; fill:var(--ink); }}
  .col   {{ font-size:24px; fill:var(--soft); letter-spacing:1px; }}
  .s     {{ font-size:18px; fill:var(--soft); }}
  .xs    {{ font-size:16px; fill:var(--soft); }}
  .a     {{ font-size:18px; fill:var(--accent); }}
  .mono  {{ font-family:ui-monospace,"SF Mono",Menlo,"DejaVu Sans Mono",monospace; font-size:17px; fill:var(--ink); }}
  .monoa {{ font-family:ui-monospace,"SF Mono",Menlo,"DejaVu Sans Mono",monospace; font-size:16px; fill:var(--accent); }}
</style>
</head>
<body>
<svg viewBox="0 0 {W} {H}" role="img" aria-label="{escape(self.label)}">
  <defs>
    <filter id="hand" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>
    </filter>
    <marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
      <path d="M1,1 L11,6 L1,11" fill="none" stroke="#1d1d1b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    {"".join(self.defs)}
  </defs>
  <g filter="url(#hand)">
    {chr(10).join("    " + s for s in self.shapes).strip()}
  </g>
  {chr(10).join("  " + m for m in self.marks).strip()}
  {chr(10).join("  " + s for s in self.texts).strip()}
</svg>
</body>
</html>
'''

def pod(sk, x, y, w, h, title, sub=None, tag=None, container="container", port=None, plan=False, two=None):
    """a pod box with its container(s) inside; the door on the left wall carries the container port"""
    sk.box(x, y, w, h, "thin", plan=plan)
    sk.t(x + 12, y + 26, title, "t")
    yy = y + 48
    if sub:
        sk.t(x + 12, yy, sub, "xs"); yy += 22
    if tag:
        sk.t(x + 12, yy, tag, "a"); yy += 22
    top = max(yy - 6, y + 56)
    ch = y + h - 12 - top
    if two:
        cw = (w - 36) // 2
        sk.box(x + 12, top, cw, ch, "thin", plan=plan)
        sk.box(x + 24 + cw, top, cw, ch, "thin", plan=plan)
        sk.t(x + 12 + cw // 2, top + ch // 2 + 6, two[0], "s", "middle")
        sk.t(x + 24 + cw + cw // 2, top + ch // 2 + 6, two[1], "s", "middle")
    else:
        sk.box(x + 12, top, w - 24, ch, "thin", plan=plan)
        if port and ch < 46:
            sk.t(x + 22, top + ch // 2 + 6, container, "s")
            sk.t(x + w - 22, top + ch // 2 + 6, port, "mono", "end")
        else:
            sk.t(x + 22, top + ch // 2 + (0 if port else 6), container, "s")
            if port: sk.t(x + 22, top + ch // 2 + 20, port, "mono")
    return top, ch

def footer(sk, lines, accent_line=None):
    y = 898
    for ln in lines:
        sk.t(60, y, ln, "s"); y += 28
    if accent_line:
        sk.t(60, y, accent_line, "a"); y += 28
    sk.t(1480, y - 28, "As of: 22 November 2026", "s", "end")

# ---------------------------------------------------------------- general
def general():
    sk = Sketch("Kubernetes: what sits inside what", "A Kubernetes cluster drawn as nested boxes: the cluster holds nodes, nodes hold pods, pods hold containers; ports are small doors")
    sk.t(750, 46, "Kubernetes: what sits inside what", "h", "middle")
    # outside: kubectl
    sk.box(20, 245, 150, 100, "line", rx=6)
    sk.t(38, 278, "kubectl", "t"); sk.t(38, 304, "you, from outside", "s"); sk.t(38, 328, "knocks at 6443", "a")
    # the cluster
    sk.box(190, 70, 1290, 760, "line", rx=10)
    sk.t(835, 108, "THE CLUSTER", "col", "middle"); sk.t(835, 134, "one control plane and its nodes", "s", "middle")
    for k in range(3):
        x0 = 215 + k * 420
        sk.box(x0, 150, 400, 650, "line")
        if k == 0:
            sk.t(x0 + 20, 184, "Node 1: the server", "t"); sk.t(x0 + 20, 208, "control plane, and a worker too", "s")
            sk.box(x0 + 20, 222, 360, 160, "thin")
            sk.t(x0 + 35, 248, "Control plane", "t")
            for (bx, by, a, b) in ((x0 + 35, 260, "API server", ":6443"), (x0 + 210, 260, "Scheduler", "places pods"),
                                   (x0 + 35, 318, "Controllers", "keep it as declared"), (x0 + 210, 318, "Datastore", "SQLite or etcd")):
                sk.box(bx, by, 160, 48, "thin")
                sk.t(bx + 12, by + 22, a, "t" if False else "s"); sk.t(bx + 12, by + 42, b, "mono" if b.startswith(":") else "xs")
            sk.box(x0 + 20, 396, 360, 44, "thin")
            sk.t(x0 + 36, 424, "kubelet · kube-proxy · containerd", "s")
        else:
            sk.t(x0 + 20, 184, f"Node {k+1}: a worker", "t"); sk.t(x0 + 20, 208, "runs pods", "s")
            for j, (a, b) in enumerate((("kubelet", "starts the pods the API server gives it"),
                                         ("kube-proxy", "makes the Service ports work"),
                                         ("containerd", "runs the containers"))):
                by = 222 + j * 74
                sk.box(x0 + 20, by, 360, 66, "thin")
                sk.t(x0 + 34, by + 26, a, "t"); sk.t(x0 + 34, by + 52, b, "s")
    # pods: row 1 (replicas of A) and row 2
    cx = []
    for k in range(3):
        x0 = 215 + k * 420
        top, ch = pod(sk, x0 + 20, 460, 170, 140, f"Pod A-{k+1}", tag=f"replica {k+1} of 3", port=":8080", container="container")
        sk.doorh(x0 + 105, 600); cx.append(x0 + 105)
    # system pod on node 1, a pod with two containers on node 2
    pod(sk, 215 + 210, 460, 170, 140, "Pod coredns", sub="an add-on of K3s", port=":53")
    pod(sk, 635 + 210, 460, 170, 140, "Pod with two", sub="containers share the pod", two=("app", "helper"))
    pod(sk, 635 + 20, 675, 170, 110, "Pod B-1", tag="replica 1 of 2")
    pod(sk, 1055 + 20, 675, 170, 110, "Pod B-2", tag="replica 2 of 2")
    # the Service in front of the three A pods
    sk.line(f"M{cx[0]},606 L{cx[0]},640 L{cx[2]},640 L{cx[2]},606", True, True)
    sk.line(f"M{cx[1]},606 L{cx[1]},640", True, True)
    sk.t(240, 668, "Service A: port 80", "a"); sk.t(240, 692, "one address for the three A pods", "s")
    sk.t(240, 716, "it hands each request to one of them", "s")
    sk.arrow(172, 285, 248, 288)
    sk.dot(176, 285)
    footer(sk, ["Read it from the outside in: cluster, node, pod, container. The small doors are ports: kubectl knocks at 6443, a Service at 80, a pod at 8080.",
                "Replicas are pods of one Deployment: the scheduler spreads them over the nodes, and the Service in front of them is the only address a client needs."])
    return sk

# ---------------------------------------------------------------- part 1
def part1():
    sk = Sketch("Part 1, what sits inside what: two VMs, two nodes, one cluster", "Part 1 drawn as nested boxes: the computer holds the host VM, which holds two VMs; each VM holds a K3s node with its pods")
    sk.t(750, 46, "Part 1, what sits inside what: two VMs, two nodes, one cluster", "h", "middle")
    sk.box(20, 70, 1460, 790, "line", rx=10); sk.t(40, 100, "The computer at 42", "t"); sk.t(1460, 100, "the outermost box", "s", "end")
    sk.box(40, 118, 1420, 700, "line", rx=8); sk.t(60, 150, "Host VM", "t"); sk.t(60, 172, "Ubuntu under QEMU/KVM, 6 CPUs, 8 GB", "s")
    # tools beside the VMs
    sk.box(60, 200, 190, 130, "line", rx=6); sk.t(78, 232, "Vagrant", "t"); sk.t(78, 256, "a client, not a process", "a"); sk.t(78, 282, "controls the two VMs:", "s"); sk.t(78, 304, "up, halt, ssh, destroy", "xs")
    sk.box(60, 350, 190, 130, "line", rx=6); sk.t(78, 382, "Ansible", "t"); sk.t(78, 406, "a client, runs once", "a"); sk.t(78, 432, "over SSH into both VMs:", "s"); sk.t(78, 454, "installs K3s in each", "xs")
    sk.arrow(252, 265, 268, 265); sk.dot(256, 265)
    sk.arrow(252, 415, 268, 415); sk.dot(256, 415)
    # VM 1: the server
    sk.box(270, 190, 540, 620, "line"); sk.t(290, 222, "VM rpodackS", "t"); sk.t(290, 246, "192.168.56.110 on eth1, 1 CPU, 1024 MB", "s")
    sk.box(580, 258, 205, 46, "thin"); sk.t(592, 280, "kubectl", "t"); sk.t(592, 298, "a client, on this VM", "xs")
    sk.box(290, 330, 500, 460, "line"); sk.t(305, 358, "K3s server: node 1", "t")
    sk.box(305, 372, 470, 70, "thin"); sk.t(320, 398, "Control plane", "t"); sk.t(320, 424, "scheduler, controllers, SQLite", "s")
    sk.box(560, 384, 205, 44, "thin"); sk.t(572, 404, "API server", "s"); sk.t(572, 422, ":6443", "mono")
    sk.box(305, 452, 470, 36, "thin"); sk.t(320, 476, "kubelet · kube-proxy · containerd", "s")
    sk.t(305, 520, "Pods on this node: the K3s add-ons", "s")
    for i, (a, b) in enumerate((("coredns", "DNS"), ("traefik", "Ingress"), ("metrics", "numbers"), ("local-path", "storage"))):
        x = 316 + i * 114
        pod(sk, x, 536, 100, 110, a, sub=b, container="container")
    sk.t(305, 690, "no apps of ours in Part 1", "a")
    sk.arrow(682, 306, 682, 382)
    sk.dot(682, 312)
    # VM 2: the worker
    sk.box(890, 190, 540, 620, "line"); sk.t(910, 222, "VM rpodackSW", "t"); sk.t(910, 246, "192.168.56.111 on eth1, 1 CPU, 512 MB", "s")
    sk.box(910, 330, 500, 460, "line"); sk.t(925, 358, "K3s agent: node 2", "t")
    sk.box(925, 372, 470, 70, "thin"); sk.t(940, 398, "Agent", "t"); sk.t(940, 424, "no control plane of its own", "s")
    sk.box(925, 452, 470, 36, "thin"); sk.t(940, 476, "kubelet · kube-proxy · containerd", "s")
    sk.t(925, 520, "Pods on this node: placed by the scheduler", "s")
    for i in range(2):
        pod(sk, 940 + i * 114, 536, 100, 110, "a pod", sub="expected", container="container", plan=True)
    # the join
    sk.arrow(908, 560, 792, 560, accent=False); sk.dot(902, 560)
    sk.t(850, 546, "joins", "a", "middle"); sk.t(850, 588, ":6443", "mono", "middle")
    sk.door(790, 560)
    # the cluster spans both nodes
    sk.line("M300,318 L1400,318", True, True)
    sk.line("M300,318 L300,330", True, False); sk.line("M1400,318 L1400,330", True, False)
    sk.t(910, 306, "THE CLUSTER: both nodes together, in two VMs", "a")
    # private network
    sk.line("M540,812 L540,830 L1160,830 L1160,812", False, False)
    sk.t(850, 848, "private network eth1, 192.168.56.0/24", "s", "middle")
    footer(sk, ["Read it from the outside in: computer, host VM, VM, node, pod, container. The cluster is not one box: it is the two nodes together, joined at port 6443.",
                "eth0 of both VMs is NAT and only reaches the internet, for image pulls; everything between the VMs goes over eth1."][:2],
           "Status: Part 1 was run; the pods on the worker are expected, to be checked with kubectl get pods -A -o wide.")
    return sk

# ---------------------------------------------------------------- part 2
def part2():
    sk = Sketch("Part 2, what sits inside what: one node, three Services, five app pods", "Part 2 drawn as nested boxes: one VM with one K3s node; Traefik at port 80 and three Services in front of the app pods")
    sk.t(750, 46, "Part 2, what sits inside what: one node, three Services, five app pods", "h", "middle")
    sk.box(20, 70, 1460, 790, "line", rx=10); sk.t(40, 100, "The computer at 42", "t")
    sk.box(40, 118, 1420, 700, "line", rx=8); sk.t(60, 150, "Host VM", "t"); sk.t(60, 172, "Ubuntu under QEMU/KVM", "s")
    sk.box(60, 400, 190, 140, "line", rx=6)
    sk.t(78, 428, "curl", "t"); sk.t(78, 454, "Host: app1.com", "mono"); sk.t(78, 476, "Host: app2.com", "mono"); sk.t(78, 498, "any other Host", "s"); sk.t(78, 522, "to 192.168.56.110", "xs")
    sk.box(270, 190, 1170, 620, "line"); sk.t(290, 222, "VM rpodackS", "t"); sk.t(290, 246, "192.168.56.110, 1 CPU, 1024 MB", "s")
    sk.box(290, 262, 1130, 534, "line"); sk.t(305, 290, "K3s server: the only node", "t")
    sk.t(520, 290, "control plane (API server :6443, scheduler, controllers, SQLite) and kubelet, kube-proxy, containerd", "xs")
    # Traefik
    y0 = 330
    sk.box(305, y0, 250, 440, "thin"); sk.t(320, y0 + 28, "Pod traefik", "t"); sk.t(320, y0 + 52, "the Ingress controller", "s")
    sk.box(320, y0 + 68, 220, 56, "thin"); sk.t(332, y0 + 92, "container", "s"); sk.t(332, y0 + 114, "listens on :80", "mono")
    sk.t(320, y0 + 160, "three Ingress rules:", "a")
    sk.t(320, y0 + 194, "app1.com: app1", "mono"); sk.t(320, y0 + 222, "app2.com: app2", "mono"); sk.t(320, y0 + 250, "anything else: app3", "mono")
    sk.t(320, y0 + 300, "it reads the Host", "xs"); sk.t(320, y0 + 320, "header and picks", "xs"); sk.t(320, y0 + 340, "the Service", "xs")
    sk.door(305, y0 + 96)
    sk.arrow(252, y0 + 96, 296, y0 + 96); sk.dot(256, y0 + 96); sk.t(258, y0 + 78, ":80", "mono")
    # the three Services with their pods
    bands = [(330, 120, "Service app1", "port 80 to 80", None), (465, 160, "Service app2", "port 80 to 5678", "spreads over 3 pods"), (640, 120, "Service app3", "port 80 to 5678", "the default")]
    for (by, bh, name, ports, note) in bands:
        sk.box(585, by, 820, bh, "thin", svc=True, plan=True)
        sk.t(600, by + 28, name, "a"); sk.t(600, by + 52, ports, "s")
        if note: sk.t(600, by + 76, note, "a")
        sk.door(585, by + bh // 2)
        sk.arrow(558, by + bh // 2, 575, by + bh // 2)
    pod(sk, 850, 340, 220, 100, "Pod app1", container="nginx", port=":80")
    sk.door(850, 400)
    for i in range(3):
        x = 790 + i * 205
        pod(sk, x, 475, 190, 140, f"Pod app2-{i+1}", container="http-echo", port=":5678")
        sk.door(x, 560)
    pod(sk, 850, 650, 220, 100, "Pod app3", container="http-echo", port=":5678")
    sk.door(850, 710)
    footer(sk, ["Read it from the outside in: computer, host VM, VM, node, pods. A Service is not a box: it is the dashed address in front of its pods. Doors are ports.",
                "A request travels: curl, port 80 of the node, Traefik, the Service named by the Host header, one of its pods. app2 has three replicas; with one node, all three sit on the same node."],
           "Status: written and reviewed, not run yet. Do not start it while the Part 1 VMs run: both use 192.168.56.110.")
    return sk

# ---------------------------------------------------------------- part 3
def part3():
    sk = Sketch("Part 3, what sits inside what: Argo CD in a k3d cluster in Docker", "Part 3 drawn as nested boxes: the host VM holds Docker, Docker holds the two k3d node containers, the nodes hold the pods of Argo CD and of the app")
    sk.t(750, 46, "Part 3, what sits inside what: Argo CD in a k3d cluster in Docker", "h", "middle")
    sk.box(20, 70, 1110, 790, "line", rx=10); sk.t(40, 100, "The computer at 42", "t")
    sk.box(40, 118, 1070, 700, "line", rx=8); sk.t(60, 150, "Host VM", "t"); sk.t(60, 172, "Ubuntu under QEMU/KVM", "s")
    # clients
    sk.box(60, 470, 170, 120, "line", rx=6); sk.t(76, 498, "Browser", "t"); sk.t(76, 524, "localhost:8080", "mono"); sk.t(76, 548, "the Argo CD UI", "s")
    sk.box(60, 660, 170, 120, "line", rx=6); sk.t(76, 688, "curl", "t"); sk.t(76, 714, "localhost:8888", "mono"); sk.t(76, 738, '"message": "v1"', "s")
    # docker, cluster, nodes
    sk.box(250, 190, 840, 610, "line"); sk.t(268, 220, "Docker", "t"); sk.t(268, 244, "k3d starts each node as a container", "s")
    sk.box(270, 262, 800, 520, "line"); sk.t(288, 290, "k3d cluster dockercluster", "t")
    sk.box(290, 305, 380, 465, "line"); sk.t(305, 333, "Server node", "t"); sk.t(470, 333, "a container running K3s", "xs")
    sk.box(305, 345, 350, 50, "thin"); sk.t(318, 366, "API server :6443, scheduler,", "xs"); sk.t(318, 386, "controllers, kubelet, containerd", "xs")
    sk.box(690, 305, 380, 465, "line"); sk.t(705, 333, "Agent node", "t"); sk.t(850, 333, "a container running K3s", "xs")
    sk.box(705, 345, 350, 50, "thin"); sk.t(718, 366, "kubelet, kube-proxy,", "xs"); sk.t(718, 386, "containerd; no control plane", "xs")
    # pods
    pod(sk, 305, 410, 165, 150, "UI and API", sub="argocd-server", tag="namespace argocd", port=":443")
    sk.door(305, 500)
    pod(sk, 485, 410, 165, 150, "Sync engine", sub="app-controller", tag="namespace argocd", container="container", plan=True)
    pod(sk, 705, 410, 165, 150, "More Argo CD", sub="redis, dex, ...", tag="namespace argocd", container="container", plan=True)
    pod(sk, 885, 410, 165, 150, "Git reader", sub="repo-server", tag="namespace argocd", container="container", plan=True)
    pod(sk, 305, 590, 165, 160, "The app", sub="wil-playground", tag="namespace dev", port=":8888")
    sk.door(305, 690)
    sk.t(485, 612, "Service of the app:", "a"); sk.t(485, 636, "NodePort 30007,", "s"); sk.t(485, 660, "port 8888", "s")
    sk.t(485, 700, "the scheduler decides on", "xs"); sk.t(485, 720, "which node a pod lands;", "xs"); sk.t(485, 740, "dashed placement: expected", "xs")
    sk.t(705, 600, "more pods can land here;", "xs"); sk.t(705, 620, "the scheduler spreads them", "xs")
    # arrows from the clients and to GitHub
    sk.arrow(232, 500, 296, 500); sk.dot(236, 500)
    sk.arrow(232, 690, 296, 690); sk.dot(236, 690)
    # GitHub, outside everything
    sk.box(1170, 430, 310, 200, "line", rx=6); sk.t(1188, 462, "GitHub", "t"); sk.t(1188, 490, "Robin-Lenz/rpodackIoT", "mono")
    sk.t(1188, 516, "public: deployment.yaml", "s"); sk.t(1188, 540, "image wil42/playground", "s"); sk.t(1188, 566, "tag v1, later v2", "a"); sk.t(1188, 596, "polled every 3 minutes", "a")
    sk.box(1170, 700, 310, 110, "line", rx=6); sk.t(1188, 732, "You", "t"); sk.t(1188, 758, "change the tag to v2", "s"); sk.t(1188, 782, "and push it", "s")
    sk.arrow(1052, 500, 1166, 500); sk.dot(1056, 500)
    sk.arrow(1325, 698, 1325, 634); sk.dot(1325, 692); sk.t(1345, 672, "pushes", "a")
    footer(sk, ["Read it from the outside in: computer, host VM, Docker, cluster, node, pod, container. Namespaces are not boxes: argocd and dev are tags on pods, and their pods can sit on either node.",
                "GitHub is outside the boxes: Argo CD reaches out and polls it about every three minutes, and applies what it finds to the namespace dev."],
           "Status: written and reviewed, not run yet. Which node each pod lands on is to be read from kubectl get pods -A -o wide after a run.")
    return sk

# ---------------------------------------------------------------- at scale
def scale():
    sk = Sketch("Kubernetes at scale: up to 110 pods on a node", "Kubernetes at scale as nested boxes: a cluster of many nodes, a node with up to 110 small squares for pods, replicas as squares of one colour spread over the nodes")
    sk.defs.append('<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fbfaf6"/><line x1="0" y1="0" x2="0" y2="6" stroke="#1d1d1b" stroke-width="2"/></pattern>')
    sk.t(750, 46, "Kubernetes at scale: up to 110 pods on a node", "h", "middle")
    sk.box(20, 70, 1460, 740, "line", rx=10)
    sk.t(40, 104, "THE CLUSTER", "col"); sk.t(250, 104, "one control plane and many nodes: up to 5,000, with up to 150,000 pods together", "s")
    nodes = [(45, "Node 1: the server", "also runs the control plane (API server :6443)", [("s", 6), ("a", 14), ("b", 8), ("c", 4)], 40),
             (465, "Node 2: a worker", "", [("s", 3), ("a", 40), ("b", 20), ("c", 6)], 88),
             (885, "Node 3: a worker", "", [("s", 3), ("a", 70), ("b", 25), ("c", 9)], 140)]
    zoom_cell = None
    for (x0, name, sub, mix, containers) in nodes:
        y0 = 130
        sk.box(x0, y0, 400, 570, "line")
        total = sum(n for _, n in mix)
        sk.t(x0 + 20, y0 + 30, name, "t")
        sk.t(x0 + 20, y0 + 54, sub or "a machine with its own kubelet, kube-proxy and containerd", "s" if sub else "xs")
        near = total >= 100
        sk.t(x0 + 20, y0 + 78, f"{total} of 110 pods, {containers} containers" + ("  (nearly full)" if near else ""), "a")
        gx, gy = x0 + 24, y0 + 96
        seq = []
        for kind, n in mix: seq += [kind] * n
        for i in range(110):
            col, row = i % 11, i // 11
            cx, cy = gx + col * 32, gy + row * 28
            kind = seq[i] if i < len(seq) else "e"
            sk.marks.append(f'<rect x="{cx}" y="{cy}" width="28" height="24" rx="3" class="c{kind}"/>')
            if x0 == 465 and i == 60: zoom_cell = (cx, cy)
    # the zoom into one pod of node 2
    x0, y0 = 465, 130
    zx, zy = zoom_cell
    sk.marks.append(f'<rect x="{zx-2}" y="{zy-2}" width="32" height="28" rx="3" class="cz"/>')
    sk.line(f"M{zx+14},{zy+26} L{zx+14},{y0+404}", True, True)
    sk.box(x0 + 20, y0 + 406, 360, 150, "thin")
    sk.t(x0 + 34, y0 + 432, "one pod, zoomed in: three containers", "a")
    sk.box(x0 + 34, y0 + 446, 332, 94, "thin")
    for j, nm in enumerate(("app", "sidecar proxy", "log shipper")):
        sk.box(x0 + 46 + j * 108, y0 + 466, 100, 62, "thin")
        sk.t(x0 + 96 + j * 108, y0 + 502, nm, "xs", "middle")
    # the other two lower areas
    sk.t(45 + 20, 130 + 420, "each small square is a pod:", "s"); sk.t(45 + 20, 130 + 444, "the unit Kubernetes places", "s"); sk.t(45 + 20, 130 + 468, "and counts, not the container", "s")
    sk.t(885 + 20, 130 + 420, "at 110 the node is full:", "s"); sk.t(885 + 20, 130 + 444, "the scheduler puts the next", "s"); sk.t(885 + 20, 130 + 468, "pod on another node", "s")
    # more nodes, drawn behind
    for k, off in enumerate((0, 14)):
        sk.box(1305 + off, 130 + off, 150, 570 - off, "thin", plan=True)
    sk.t(1380, 360, "more nodes", "t", "middle"); sk.t(1380, 390, "up to 5,000", "a", "middle"); sk.t(1380, 414, "in one cluster", "s", "middle")
    # legend
    ly = 745
    sk.marks.append(f'<rect x="45" y="{ly}" width="28" height="24" rx="3" class="ca"/>'); sk.t(82, ly + 18, "web: one Deployment, replicas on every node", "s")
    sk.marks.append(f'<rect x="470" y="{ly}" width="28" height="24" rx="3" class="cb"/>'); sk.t(507, ly + 18, "api: another Deployment", "s")
    sk.marks.append(f'<rect x="760" y="{ly}" width="28" height="24" rx="3" class="cc"/>'); sk.t(797, ly + 18, "worker", "s")
    sk.marks.append(f'<rect x="880" y="{ly}" width="28" height="24" rx="3" class="cs"/>'); sk.t(917, ly + 18, "system pod", "s")
    sk.marks.append(f'<rect x="1040" y="{ly}" width="28" height="24" rx="3" class="ce"/>'); sk.t(1077, ly + 18, "a free slot", "s")
    footer(sk, ["Read it from the outside in: cluster, node, pod, container. Squares of one colour are the replicas of one Deployment, spread over the nodes by the scheduler.",
                "The limits are the documented ones for large clusters: 110 pods per node, 5,000 nodes, 150,000 pods, at about two containers per pod or fewer."],
           "The numbers of pods and containers in this picture are made up, to show the scale. Source of the limits: kubernetes.io, Considerations for large clusters.")
    return sk

# ---------------------------------------------------------------- one node at its limit
def node110():
    sk = Sketch("One node at its limit: 110 pods and the containers inside them", "One Kubernetes node holding 110 pods, each drawn as a small box with its containers inside")
    sk.defs.append('<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fbfaf6"/><line x1="0" y1="0" x2="0" y2="6" stroke="#1d1d1b" stroke-width="2"/></pattern>')
    sk.t(750, 46, "One node at its limit: 110 pods, and the containers inside them", "h", "middle")
    sk.box(20, 70, 1460, 804, "line", rx=10)
    sk.t(44, 108, "Node 2: a worker, full", "t")
    sk.t(44, 134, "a machine; kubelet, kube-proxy and containerd run on the node itself", "s")
    sk.t(44, 160, "110 of 110 pods, 160 containers", "a")
    # legend
    lx, ly = 700, 96
    for i, (cls, name) in enumerate((("pw", "web"), ("pa", "api"), ("pk", "worker"), ("ps", "system pod"))):
        x = lx + i * 190
        sk.marks.append(f'<rect x="{x}" y="{ly}" width="44" height="28" rx="5" class="{cls}"/>')
        sk.marks.append(f'<rect x="{x+9}" y="{ly+6}" width="12" height="16" rx="2" class="cn"/>')
        sk.t(x + 54, ly + 22, name, "s")
    sk.t(lx, 152, "each square is a pod, the unit Kubernetes places; the boxes inside are its containers", "s")
    # the 110 pods
    kinds = ["ps"] * 5 + ["pw"] * 60 + ["pa"] * 30 + ["pk"] * 15
    gx, gy = 48, 182
    wcount = 0
    for i, k in enumerate(kinds):
        col, row = i % 11, i // 11
        x, y = gx + col * 128, gy + row * 66
        sk.marks.append(f'<rect x="{x}" y="{y}" width="122" height="58" rx="7" class="{k}"/>')
        if k == "pa": n = 2
        elif k == "pw":
            wcount += 1; n = 2 if wcount % 3 == 0 else 1
        else: n = 1
        total_w = n * 34 + (n - 1) * 8
        sx = x + (122 - total_w) / 2
        for j in range(n):
            sk.marks.append(f'<rect x="{sx + j*42}" y="{y + 17}" width="34" height="24" rx="4" class="cn"/>')
    footer(sk, ["Read it from the outside in: node, pods, containers. Most pods hold one container; some hold a second one, for example a proxy next to the app.",
                "110 pods per node is the documented limit for large clusters (the kubelet setting maxPods, default 110). The 111th pod goes to another node, or waits as Pending if no node has room."],
           "The mix of pods and containers is made up, to show a full node.")
    return sk

# ---------------------------------------------------------------- bonus, final state
def bonus_final():
    sk = Sketch("Bonus running: Argo CD follows a GitLab that runs inside the cluster", "The bonus when it runs: you push to a GitLab inside the k3d cluster, Argo CD polls it and applies the application to the namespace dev, curl reaches the application")
    sk.t(750, 46, "Bonus running: Argo CD follows a GitLab that runs inside the cluster", "h", "middle")
    sk.box(20, 70, 1460, 740, "line", rx=10)
    sk.t(175, 122, "YOU", "col", "middle"); sk.t(175, 150, "on the host VM", "s", "middle")
    sk.t(808, 122, "THE CLUSTER", "col", "middle"); sk.t(808, 150, "k3d cluster bonus, one server node, in Docker, on the host VM", "s", "middle")
    sk.t(1390, 122, "CLIENT", "col", "middle"); sk.t(1390, 150, "on the host VM", "s", "middle")
    sk.box(340, 170, 935, 570, "line")
    # namespaces
    sk.box(360, 215, 270, 500, "thin"); sk.t(375, 245, "namespace gitlab", "t")
    sk.box(640, 215, 340, 500, "thin"); sk.t(655, 245, "namespace argocd", "t")
    sk.box(990, 215, 270, 500, "thin"); sk.t(1005, 245, "namespace dev", "t")
    # GitLab
    sk.box(375, 270, 240, 260, "thin"); sk.t(390, 300, "GitLab", "t"); sk.t(390, 324, "official image gitlab-ce", "s")
    sk.t(390, 348, "every GitLab service in one", "s"); sk.t(390, 370, "container, one Deployment", "s")
    sk.t(390, 404, "the project root/rpodackIoT", "a"); sk.t(390, 428, "lives here, private", "s")
    sk.box(390, 450, 210, 60, "thin"); sk.t(402, 475, "its disk", "s"); sk.t(402, 497, "a volume of the cluster", "xs")
    sk.box(375, 545, 240, 150, "thin"); sk.t(390, 573, "Secret gitlab-root", "t"); sk.t(390, 597, "the root password, made", "s"); sk.t(390, 619, "once at setup, never", "s"); sk.t(390, 641, "written in the repository", "s")
    # Argo CD
    sk.box(660, 270, 300, 100, "thin"); sk.t(675, 298, "UI and API", "t"); sk.t(675, 322, "argocd-server", "s"); sk.t(675, 346, "make port-forward, :8080", "a")
    sk.box(660, 385, 300, 100, "thin"); sk.t(675, 413, "Sync engine", "t"); sk.t(675, 437, "application-controller", "s"); sk.t(675, 461, "keeps dev equal to Git", "a")
    sk.box(660, 500, 300, 100, "thin"); sk.t(675, 528, "Git reader", "t"); sk.t(675, 552, "repo-server", "s"); sk.t(675, 576, "polls the GitLab project", "a")
    sk.box(660, 615, 300, 85, "thin"); sk.t(675, 641, "Secret gitlab-repo", "t"); sk.t(675, 665, "the login for the private project,", "xs"); sk.t(675, 683, "with the label Argo CD looks for", "xs")
    # dev
    sk.box(1010, 270, 230, 100, "thin", plan=True); sk.t(1025, 298, "Service", "t"); sk.t(1025, 322, "NodePort 30007", "mono"); sk.t(1025, 346, "port 8888", "s")
    sk.box(1010, 410, 230, 130, "thin", plan=True); sk.t(1025, 438, "wil-playground", "t"); sk.t(1025, 462, "image wil42/playground", "s"); sk.t(1025, 486, "tag v1, then v2", "a"); sk.t(1025, 520, ":8888", "mono")
    sk.t(1010, 575, "the app is only a pod in dev:", "s"); sk.t(1010, 599, "Argo CD creates and replaces it", "s")
    # clients
    sk.box(40, 335, 272, 160, "line", plan=True, rx=6); sk.t(58, 366, "You", "t"); sk.t(58, 392, "browser or git, localhost", "s"); sk.t(58, 420, ":8929", "mono"); sk.t(58, 450, "push v2 to the GitLab project", "a")
    sk.box(1310, 260, 160, 130, "line", plan=True, rx=6); sk.t(1324, 292, "curl", "t"); sk.t(1324, 318, "localhost:8888", "mono"); sk.t(1324, 344, '"message": "v1"', "xs"); sk.t(1324, 366, "v2 after the push", "a")
    # arrows
    sk.door(375, 400); sk.arrow(314, 400, 365, 400, plan=True); sk.dot(318, 400); sk.t(322, 384, "8929", "mono")
    sk.arrow(658, 550, 617, 550, plan=True); sk.dot(654, 550); sk.t(636, 535, "polls", "a", "middle")
    sk.arrow(962, 435, 1008, 435, plan=True); sk.t(985, 420, "applies", "xs", "middle")
    sk.door(1240, 320); sk.arrow(1308, 320, 1246, 320, plan=True); sk.dot(1304, 320); sk.t(1276, 304, "8888", "mono", "middle")
    sk.arrow(1125, 372, 1125, 408)
    # legend and notes
    sk.dot(60, 842); sk.t(78, 848, "who opens the connection", "s")
    sk.line("M330,842 L400,842", False, True); sk.t(414, 848, "written, not run yet", "s")
    sk.t(60, 876, "Part 3 with one change: the repository Argo CD follows is a GitLab in the cluster, not GitHub. One server node, no agent. k3d publishes 8929 to NodePort 30929 and 8888 to NodePort 30007.", "s")
    sk.t(60, 904, "Argo CD reaches the project as gitlab.gitlab.svc.cluster.local:8929, the Service name inside the cluster.", "s")
    sk.t(60, 932, "Status: GitLab and Argo CD came up on 22 November 2026 (about 10 minutes); the push to GitLab, Argo CD following it and the change to v2 have not been run. Not together with Part 3: the memory does not fit.", "a")
    sk.t(1480, 876, "As of: 22 November 2026", "s", "end")
    return sk

# ---------------------------------------------------------------- bonus, nested
def bonus_nested():
    sk = Sketch("Bonus, what sits inside what: GitLab and Argo CD in one k3d node", "The bonus as nested boxes: the host VM holds Docker, Docker holds the k3d cluster, the cluster holds one server node, the node holds the pods of GitLab, Argo CD and the app")
    sk.t(750, 46, "Bonus, what sits inside what: GitLab and Argo CD in one k3d node", "h", "middle")
    sk.box(20, 70, 1460, 790, "line", rx=10); sk.t(40, 100, "The computer at 42", "t")
    sk.box(40, 118, 1420, 700, "line", rx=8); sk.t(60, 150, "Host VM", "t"); sk.t(60, 172, "Ubuntu under QEMU/KVM", "s")
    sk.box(60, 420, 170, 130, "line", rx=6); sk.t(76, 450, "You", "t"); sk.t(76, 476, "browser or git", "s"); sk.t(76, 502, "localhost:8929", "mono"); sk.t(76, 528, "push v2 here", "a")
    sk.box(60, 600, 170, 130, "line", rx=6); sk.t(76, 630, "curl", "t"); sk.t(76, 656, "localhost:8888", "mono"); sk.t(76, 682, '"message": "v1"', "xs"); sk.t(76, 706, "v2 after the push", "a")
    sk.box(250, 190, 1190, 610, "line"); sk.t(268, 220, "Docker", "t"); sk.t(268, 244, "k3d starts the node as a container", "s")
    sk.box(270, 262, 1150, 520, "line"); sk.t(288, 290, "k3d cluster bonus", "t"); sk.t(470, 290, "one server node, no agent node", "a")
    sk.box(290, 305, 1110, 465, "line"); sk.t(305, 333, "Server node", "t"); sk.t(430, 333, "a container running K3s: control plane, kubelet, kube-proxy, containerd", "xs")
    # pods, left to right: GitLab | Git reader | UI | Sync | app
    pod(sk, 305, 400, 270, 190, "GitLab", sub="gitlab-ce, one container", tag="ns: gitlab", container="container", port=":8929", plan=False)
    sk.door(305, 500)
    sk.box(305, 602, 270, 38, "thin"); sk.t(317, 627, "its disk: a volume of the cluster", "xs")
    pod(sk, 631, 400, 150, 190, "Git reader", sub="repo-server", tag="ns: argocd", container="container")
    pod(sk, 821, 400, 150, 190, "UI and API", sub="argocd-server", tag="ns: argocd", container="container", port=":443")
    pod(sk, 1011, 400, 150, 190, "Sync engine", sub="app-controller", tag="ns: argocd", container="container")
    pod(sk, 1217, 400, 150, 190, "The app", sub="wil-playground", tag="ns: dev", container="container", port=":8888", plan=True)
    sk.doorh(1292, 590)
    # in-cluster arrows
    sk.arrow(629, 495, 577, 495, plan=True); sk.dot(625, 495)
    sk.arrow(1163, 495, 1215, 495, plan=True)
    sk.t(603, 478, "polls", "xs", "middle"); sk.t(1189, 478, "applies", "xs", "middle")
    # client arrows
    sk.arrow(232, 500, 296, 500, plan=True); sk.dot(236, 500); sk.t(244, 484, "8929", "mono")
    sk.shapes.append('<path d="M232,665 L1292,665 L1292,598" class="line plan" marker-end="url(#arrow)"/>'); sk.dot(236, 665)
    sk.t(760, 690, "8888 to NodePort 30007: through the Service of the app into the pod", "s", "middle")
    sk.t(305, 722, "Argo CD finds the project at gitlab.gitlab.svc.cluster.local:8929/root/rpodackIoT.git,", "s")
    sk.t(305, 746, "the Service name inside the cluster; 8929 on the host is NodePort 30929 of the node.", "s")
    footer(sk, ["Read it from the outside in: computer, host VM, Docker, cluster, node, pods, container. ns = namespace, a tag on the pod here. The Argo CD interface: make port-forward, then https://localhost:8080.",
                "GitLab is the official image gitlab-ce as one Deployment, not the Helm chart; it fits in the memory of the host VM, the Helm chart would not."],
           "Status: GitLab and Argo CD came up once; the push, Argo CD following the GitLab project and the change to v2 have not been run.")
    return sk

# ---------------------------------------------------------------- the architecture with our technologies
def architecture():
    sk = Sketch("Kubernetes architecture, with the technologies we use", "A full Kubernetes architecture as nested boxes: the cluster, the control plane, the objects, the nodes with their components and the add-on pods, with the tool that fills each part in our project")
    sk.t(750, 46, "Kubernetes architecture, with the technologies we use", "h", "middle")
    # outside tools
    tools = [("kubectl", "a client, you type it", "asks the API server"),
             ("Vagrant", "client of libvirt", "controls the VMs (1, 2)"),
             ("Ansible", "client, runs once", "installs K3s (1, 2)"),
             ("k3d, Docker", "client of Docker", "builds the cluster (3)"),
             ("GitHub, GitLab", "outside, or inside", "Argo CD follows it")]
    for i, (a, b, c) in enumerate(tools):
        y = 110 + i * 142
        sk.box(20, y, 160, 124, "line", rx=6)
        sk.t(32, y + 28, a, "t"); sk.t(32, y + 54, b, "xs"); sk.t(32, y + 76, c, "xs")
    # the cluster
    sk.box(200, 70, 1280, 790, "line", rx=10)
    sk.t(840, 104, "THE CLUSTER", "col", "middle")
    # control plane
    sk.box(220, 118, 1240, 160, "thin")
    sk.t(236, 146, "Control plane", "t"); sk.t(420, 146, "K3s runs all of it as one process, k3s server", "a")
    cp = [("kube-apiserver", ":6443, the only door in"), ("kube-scheduler", "picks a node for each pod"), ("controller manager", "keeps what the manifests say"), ("datastore", "SQLite in K3s, etcd elsewhere")]
    for i, (a, b) in enumerate(cp):
        x = 236 + i * 303
        sk.box(x, 164, 288, 96, "thin"); sk.t(x + 14, 196, a, "t"); sk.t(x + 14, 224, b, "s")
        if i == 0: sk.door(x, 212)
    # the objects
    sk.box(220, 292, 1240, 64, "thin")
    sk.t(236, 320, "What the API server stores: Namespace, Deployment, ReplicaSet, Pod, Service, Ingress, ConfigMap, Secret, Node", "s")
    sk.t(236, 344, "Argo CD and kubectl work on these objects", "xs")
    # two nodes
    for k, (x0, name, sub) in enumerate(((220, "Node 1: the server", "a node that also runs the control plane"), (850, "Node 2: a worker, the agent", "joins with the server address and a token"))):
        sk.box(x0, 372, 610, 470, "line")
        sk.t(x0 + 18, 404, name, "t"); sk.t(x0 + 18, 428, sub, "s")
        comps = [("kubelet", "starts the pods"), ("kube-proxy", "Service ports"), ("containerd", "runs containers"), ("Flannel", "pod network, eth1")]
        for i, (a, b) in enumerate(comps):
            cx = x0 + 18 + i * 147
            sk.box(cx, 442, 138, 70, "thin"); sk.t(cx + 10, 470, a, "s"); sk.t(cx + 10, 494, b, "xs")
        sk.t(x0 + 18, 540, "Pods on this node (the placement is the scheduler's choice, an example here):", "xs")
    pods1 = [("CoreDNS", "cluster DNS"), ("Traefik", "Ingress controller :80"), ("ServiceLB", "svclb: node ports"),
             ("metrics-server", "node and pod numbers"), ("local-path", "volumes on the node disk"), ("our apps", "app1, app2 x3, app3")]
    pods2 = [("ServiceLB", "svclb: node ports"), ("our apps", "app1, app2 x3, app3"), ("Argo CD", "UI, sync, repo-server"),
             ("GitLab", "bonus: one pod, gitlab-ce"), ("the app", "Part 3: wil-playground"), ("more pods", "up to 110 on a node")]
    for x0, pods in ((220, pods1), (850, pods2)):
        for i, (a, b) in enumerate(pods):
            px = x0 + 18 + (i % 3) * 195
            py = 556 + (i // 3) * 140
            plan = (a in ("GitLab", "more pods"))
            sk.box(px, py, 185, 124, "thin", plan=plan)
            sk.t(px + 12, py + 28, "Pod " + a, "s" if len(a) > 8 else "t")
            sk.t(px + 12, py + 54, b, "xs")
            sk.box(px + 12, py + 66, 161, 44, "thin", plan=plan); sk.t(px + 24, py + 94, "container", "xs")
    sk.arrow(182, 160, 214, 205)
    sk.dot(186, 162)
    footer(sk, ["Read it from the outside in: cluster, control plane and objects, node, components and pods, container. Outside the cluster are the tools that build it and ask it.",
                "K3s bundles containerd, Flannel, CoreDNS, Traefik, ServiceLB, metrics-server and local-path in one binary; full Kubernetes installs each of them on its own. Argo CD v2.7.12 runs inside the cluster as pods."],
           "Which pods sit on which node is shown as an example: the scheduler decides, to be read from kubectl get pods -A -o wide.")
    return sk

if __name__ == "__main__":
    out = os.path.join(HERE, "..", "src")
    for name, fn in (("bonus-final-state-sketch", bonus_final), ("nesting-bonus", bonus_nested), ("nesting-architecture", architecture), ("nesting-node110", node110), ("nesting-scale", scale), ("nesting-general", general), ("nesting-p1", part1), ("nesting-p2", part2), ("nesting-p3", part3)):
        open(os.path.join(out, name + ".html"), "w").write(fn().html())
        print("wrote", name)
