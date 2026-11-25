# Ideas from the yli branch

Pull request #1, the third member's work in progress from November 2025, was closed on 2026-11-22. The branch cannot be merged (Ubuntu focal64 on VirtualBox, 92 commits behind, `.vagrant` files and a node token committed), but it holds four ideas. The branch `yli` stays on GitHub.

| Idea | In `yli` | In `main` | State |
|---|---|---|---|
| One Ingress with three rules, the last one without a host as the default | one file, `p2/confs/ingress.yaml` | three files, one Ingress per app | to discuss with Robin |
| Each app carries its own page: nginx with the HTML in a ConfigMap mounted at `/usr/share/nginx/html` | all three apps | app1 is the nginx default page, app2 and app3 are `http-echo` with a text argument | optional |
| The interface is called `enp0s8`, not `eth1`, on Ubuntu 20.04 and later | noted in the p1 README | fixed by the playbook in PR #6 and #7, explained in a card | done |
| Provision with an inline shell script and `kubectl apply -f /vagrant/confs/` | p2 Vagrantfile | Ansible playbook | not taken, Ansible is idempotent |

## One Ingress or three

Both work: Traefik reads every Ingress object in the cluster and merges the rules. One file shows the whole routing table at once, which is easy to show in the defence. Three files let each app be applied and removed on its own. The subject does not ask for either. Open: decide with Robin, then the cards below get a sentence on what was chosen.

## The page inside a ConfigMap

The HTML sits in a ConfigMap and is mounted as a file into the nginx container, so no image has to be built. It shows a ConfigMap used as a volume, a question an evaluator can ask. Our apps do without it.

## Not taken

The committed `.vagrant` state, the node token, the `.DS_Store`, and the VirtualBox screenshots of the first run.
