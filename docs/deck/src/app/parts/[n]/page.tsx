import Link from "next/link";
import { notFound } from "next/navigation";

const parts = [
  {
    title: "K3s and Vagrant",
    lead: "Two virtual machines from one Vagrantfile, each with a fixed address on a private network. Ansible installs K3s on the first as the server and on the second as the agent that joins it.",
    tools: "Vagrant, libvirt, Ansible, K3s",
    reading: [
      "kubectl asks the API of the K3s server, on port 6443.",
      "The agent joins the server with the node token and watches it, over https on port 6443.",
      "Both VMs talk over the private network eth1, 192.168.56.0/24. eth0 is NAT and only reaches the internet, to pull images.",
      "Once it runs, kubectl get nodes shows two nodes: rpodackS, the control plane, and rpodackSW, the worker.",
    ],
  },
  {
    title: "K3s and three applications",
    lead: "One virtual machine with a K3s server and three small web applications behind a single Ingress. The same IP address answers differently depending on the host name in the request.",
    tools: "K3s, Ingress, Traefik, Deployments and Services",
    reading: [
      "A request travels: curl, Traefik on port 80, a Service, a pod.",
      "Traefik matches the Host header: app1.com goes to app1, app2.com to app2, anything else to app3, the default.",
      "app2 runs as three pods; its Service spreads the requests over them.",
      "Nothing else runs in Part 2 besides K3s itself.",
    ],
  },
  {
    title: "K3d and Argo CD",
    lead: "A cluster that lives in Docker containers instead of virtual machines. Argo CD watches a public GitHub repository and keeps the cluster equal to it: change the version in Git, push, and the running application changes.",
    tools: "K3d, Docker, Argo CD, GitHub",
    reading: [
      "The browser opens the Argo CD interface on localhost:8080 through a port-forward.",
      "Argo CD polls the public GitHub repository about every three minutes and applies what it finds to the namespace dev.",
      "The application is a single pod in dev, reached on port 8888. It answers v1; change the tag to v2, push, and after the next sync it answers v2.",
      "Nobody applies the application by hand: Argo CD creates and replaces it.",
    ],
  },
];

export function generateStaticParams() {
  return [{ n: "1" }, { n: "2" }, { n: "3" }];
}

export default async function PartPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const i = Number(n) - 1;
  const part = parts[i];
  if (!part) notFound();
  const prev = i > 0 ? i : null;
  const next = i < 2 ? i + 2 : null;
  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-sm text-muted">Part {n} of 3</p>
        <h1 className="text-3xl font-semibold leading-tight">{part.title}</h1>
        <p className="mt-3 text-lg leading-relaxed">{part.lead}</p>
        <p className="mt-2 text-sm text-muted">{part.tools}</p>
      </section>

      <figure className="ui-panel p-3">
        <div className="sketch">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/diagrams/p${n}-final-state-sketch.png`} alt={`Sketch of Part ${n} when it runs`} width={3064} height={1884} />
        </div>
        <figcaption className="mt-2 text-sm text-muted">The target state of Part {n}. A dot marks who opens a connection; dashed lines are written but not run yet.</figcaption>
      </figure>

      <figure className="ui-panel p-3">
        <div className="sketch is-nesting">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/diagrams/nesting-p${n}.png`} alt={`Part ${n} as nested boxes`} width={3064} height={1984} />
        </div>
        <figcaption className="mt-2 text-sm text-muted">The same part as nested boxes, read from the outside in. The small doors are ports; the dashed boxes are Services.</figcaption>
      </figure>

      <section>
        <h2 className="text-lg font-medium">Reading the sketch</h2>
        <ul className="mt-2 list-disc pl-5 leading-relaxed">
          {part.reading.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <nav className="flex gap-3 text-sm" aria-label="Parts">
        {prev && (
          <Link className="underline" href={`/parts/${prev}`}>
            Part {prev}
          </Link>
        )}
        <Link className="underline" href="/">
          Overview
        </Link>
        {next && (
          <Link className="underline" href={`/parts/${next}`}>
            Part {next}
          </Link>
        )}
      </nav>
    </div>
  );
}
