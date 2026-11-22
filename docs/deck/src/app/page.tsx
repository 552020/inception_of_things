import Link from "next/link";
import { currentUser } from "@/lib/session";

const parts = [
  {
    title: "Part 1: K3s and Vagrant",
    text: "Two virtual machines from one Vagrantfile, each with a fixed address on a private network. Ansible installs K3s on the first as the server and on the second as the agent that joins it. The result is a working two-node Kubernetes cluster built from nothing but text files.",
    tools: "Vagrant, libvirt, Ansible, K3s",
  },
  {
    title: "Part 2: K3s and three applications",
    text: "One virtual machine with a K3s server and three small web applications behind a single Ingress. The same IP address answers differently depending on the host name in the request: one name shows the first application, another shows the second, which runs as three replicas, and every other name falls through to the third.",
    tools: "K3s, Ingress, Traefik, Deployments and Services",
  },
  {
    title: "Part 3: K3d and Argo CD",
    text: "A cluster that lives in Docker containers instead of virtual machines. Argo CD watches a public GitHub repository and keeps the cluster equal to it: change the version of the application in Git, push, and the running application changes with no kubectl command. This is GitOps.",
    tools: "K3d, Docker, Argo CD, GitHub",
  },
];

export default async function HomePage() {
  const user = await currentUser();
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold leading-tight">Inception-of-Things</h1>
        <p className="mt-3 text-lg leading-relaxed">
          A system administration project of the 42 school: build small Kubernetes clusters three different ways, put applications on them, and then let a Git
          repository decide what runs. It is a minimal introduction to Kubernetes, done entirely inside a virtual machine.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {parts.map((part) => (
          <div key={part.title} className="ui-panel p-5 flex flex-col gap-3">
            <h2 className="text-lg font-medium leading-snug">{part.title}</h2>
            <p className="leading-relaxed">{part.text}</p>
            <p className="mt-auto text-sm text-muted">{part.tools}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Where it runs</h2>
        <p className="leading-relaxed">
          The school computers give no administrator rights, so the whole project lives in one host virtual machine started under QEMU with KVM. Inside it, Vagrant
          starts the machines of Part 1 and Part 2 through libvirt, and Docker runs the cluster of Part 3. The host machine, its start script and its backup are
          documented in the repository.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Code</h2>
        <p className="leading-relaxed">
          The configuration of the three parts is public:{" "}
          <a className="underline" href="https://github.com/552020/inception_of_things">
            github.com/552020/inception_of_things
          </a>
          . The application that Argo CD deploys in Part 3 lives in its own repository, because Argo CD needs a public GitHub repository of its own.
        </p>
      </section>

      <p className="text-sm text-muted">
        {user ? (
          <>
            You are logged in. <Link className="underline" href="/review">Open the cards</Link>.
          </>
        ) : (
          <>
            The study material, with flashcards, glossary and notes, is private. <Link className="underline" href="/login">Log in</Link>.
          </>
        )}
      </p>
    </div>
  );
}
