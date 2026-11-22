# Graphics study: the DevOps page

The first five design proposals in the lab changed the palette, the corner radius and the font. The structure stayed the same in all five: a header, a row of chips, a box with a question, four buttons. A DevOps page is recognised by its structure, not by its colour. This study looks at the structure of real tools first. There are no proposals in it yet.

Captured on 2026-11-22, headless, at 1440 by 900: the public Argo CD demo, a run of the argoproj/argo-cd repository on GitHub Actions, and the public Grafana playground. Sources are listed at the end. Not captured, known only from memory and left out of the evidence: the Kubernetes Dashboard, k9s, GitLab pipelines.

## 1. What the screenshots show

### Argo CD: the application list

![Argo CD applications as tiles](/lab-img/graphics-study/argocd-apps.png)

- The filters are the summary. The left sidebar groups Health status and Sync status, each value with its count: Healthy 42, Degraded 2, Synced 46, OutOfSync 4. Ticking one filters the list.
- A single stacked bar above the tiles shows the same totals as proportions, green, blue, red, yellow, grey. The state of the whole system can be read in one line before any tile is read.
- A tile has a coloured left edge, a title, then a key and value list: Project, Status, Repository, Target Revision, Path, Destination, Namespace, Last Sync. Three small action buttons at the bottom.
- Status is never colour alone. It is an icon, a word and a colour, and there are two independent axes: Healthy and Synced.
- Three icons at the top right switch the same data between tiles, list and a pie chart.

### Argo CD: one application as a resource tree

![Argo CD resource tree](/lab-img/graphics-study/argocd-tree.png)

- A summary strip comes first, in three blocks: App health, Sync status (to which commit), Last sync (who, when, which message). Big status word, small detail underneath.
- The canvas is a graph read from left to right. Config, service accounts and CRDs, then the Deployment, its ReplicaSet, its Pod. Dashed lines are ownership.
- A node is a kind icon with a three-letter label (cm, sa, crd, deploy, rs, pod), the name, status icons and an age chip. The kind is part of the picture.
- A zoom toolbar and four view icons (tree, pods, network, list) switch the same resources between graph and table.

### GitHub Actions: the run list and one run

![GitHub Actions run list](/lab-img/graphics-study/gh-actions.png)

![GitHub Actions run, job graph](/lab-img/graphics-study/gh-run.png)

- In the list the status icon comes first, then the title in bold, then one small line of metadata. The branch is a monospace pill, the time and the duration sit on the right with a small icon each. The title leads and the date is small, which is also the rule for our lists.
- A run page opens with a summary strip: Triggered, Status, Total duration, Artifacts.
- Below it a pipeline graph: boxes for jobs, each with its duration, joined by lines from left to right. A matrix of sixteen jobs is folded into one box with "Show all jobs". The sidebar repeats the same jobs as a flat list with status icons.

### Grafana: a cluster dashboard

![Grafana cluster dashboard](/lab-img/graphics-study/grafana-k8s.png)

- The controls come first and are global: data source, cluster, time range (Last 30 minutes) and refresh (30 s).
- Collapsible rows with a title: Headlines, CPU, CPU Quota. Inside, six stat tiles with a big number and a small unit, one area chart with a legend on the right, one table with links.
- The numbers are the graphic. Colour appears only on the chart series.

### Our deck today

![The public page](/lab-img/graphics-study/deck-home.png)

![The cards list](/lab-img/graphics-study/deck-cards.png)

A white page of text. The cards list is 138 equal boxes with no state: nothing shows which cards are new, due or known, and the tag chips carry no counts. The public page describes the three parts in paragraphs although the parts are, in fact, machines, addresses and arrows.

## 2. What the tools share

| Element | What it does | Seen in | Our equivalent |
|---|---|---|---|
| One line of totals | the state of everything before any detail | Argo CD stacked bar, Grafana headline tiles | a bar of new, learning, known cards |
| Status as icon, word and colour | readable without colour, two axes where needed | Argo CD, GitHub | card state and due |
| Filters with counts | filter and summary in one | Argo CD sidebar | tags with counts, state counts |
| Row with the status first, title, small metadata | a long list that can be scanned | GitHub | the 138 cards |
| Key and value block | an object's facts in a fixed order | Argo CD tile | a card's tags, part, last review |
| Dependency graph with kind labels | what owns what | Argo CD tree | the architecture of Part 1, 2 and 3 |
| Pipeline graph with a duration per step | order and cost of steps | GitHub run | the three parts as stages |
| Summary strip above the detail | the answer first | Argo CD, GitHub | the head of every desk page |
| Panels with big numerals and a time range | trends over time | Grafana | progress per day |
| Monospace for identifiers | names, hashes, branches stand out from prose | all three | commands, IPs, tags |

Two rules hold in all three. Status colours are reserved: green, red, yellow and blue mean a state and are used for nothing else. The accent colour marks the action, never the decoration.

## 3. What our screens have to show

- Public page: the facts of three setups. Part 1 is two machines at 192.168.56.110 and .111 with a K3s server and an agent. Part 2 is one machine, one Ingress, three apps chosen by host name, one with three replicas. Part 3 is a Git repository, Argo CD and a cluster in Docker. These are diagrams, not paragraphs.
- Review: one card at a time, used on the phone before the evaluation. It has to work with one thumb. Density would hurt here.
- Cards list: 138 rows, 27 tags, a state per card.
- Progress: two people, counts, last review, per tag.
- Desk and lab: documents, which want a navigation of their own.

## 4. Directions

Each is a structure, not a palette, and they can be combined. The numbers in the sketches are invented.

### A. Console

Fixed sidebar with the filters and their counts, a totals bar on top, the cards as rows with the state first. Closest to Argo CD.

```
+----------+--------------------------------------------+
| TAGS     | [#### new 62 ##### learning 31 ## known 45]|
| k3s   12 +--------------------------------------------+
| argocd 6 | o  What is Traefik?              networking|
| part1  9 | .  Why does Ingress exist?       networking|
| ...      | v  What is eth0, ...             part1     |
+----------+--------------------------------------------+
```

### B. Topology

The public page and a page per part are drawn: nodes with a kind label (vm, node, ingress, app, repo), addresses on the edges, ownership as dashed lines. Cards about Pod, ReplicaSet and Deployment link into the picture. Closest to the Argo CD tree.

```
[ repo ] --polls--> [ argocd ] --applies--> [ deploy wil-playground ] -> [ rs ] -> [ pod ]
   ^                                                   (k3d cluster, namespace dev)
   +------- git push v1 -> v2 -------------------------------+
```

### C. Pipeline

The three parts as stages left to right, each with the number of cards known, and the learning path as a flow of new, learning, known. Closest to the GitHub job graph.

```
[ Part 1 ] ----> [ Part 2 ] ----> [ Part 3 ]
 31 / 40 known    12 / 38 known    3 / 29 known
```

### D. Panels

The Progress page as a dashboard: big numerals, an area chart of answers per day, a heatmap of days, a table per tag with links into the cards, a global time range. Closest to Grafana.

```
+--------+--------+--------+--------+
|  45    |  31    |  62    |   7    |
| known  | learn  |  new   |  due   |
+--------+--------+--------+--------+
| answers per day ~~~~~~~~~~~~~~~~~~~ |
+-------------------------------------+
```

### E. Terminal

One monospace screen with keyboard commands, in the manner of k9s. It is the most recognisable, and the weakest on a phone.

| | Best for | Weak on | Effort |
|---|---|---|---|
| A Console | cards list, navigation, filters | the phone, unless the sidebar folds away | medium |
| B Topology | public page, the explanation of the parts | needs the facts drawn by hand as SVG | high, but most distinctive |
| C Pipeline | overview of the three parts | little content to show | low |
| D Panels | Progress | nothing to show until there is history | medium |
| E Terminal | desktop at night | the phone, where the cards are used | medium |

## 5. Recommendation

Combine three and keep the review as it is. B for the public page, because it is the only page whose content is a set of machines and connections, and a diagram of the real addresses says more than the three paragraphs. A for the cards list, with the state first and tag counts. D for Progress. The review screen stays a single card on the phone; the only change there is the status vocabulary. The palette comes last: reserved status colours (new grey, learning blue, due amber, known green) and one accent for the action.

## 6. To decide

1. Where is the deck used more, on the phone or at a desk? It decides whether A needs a folding sidebar and whether E is worth anything.
2. Who is the public page for? If it is for people judging the project, B is worth the effort. If it is only a signpost, the paragraphs are enough.
3. Which of A to E to prototype next, in the lab, as working pages and not as mock-ups.

## Sources

- Argo CD public demo: https://cd.apps.argoproj.io (applications, and the application argo-events)
- GitHub Actions run: https://github.com/argoproj/argo-cd/actions/runs/45018135303 and https://github.com/argoproj/argo-cd/actions
- Grafana playground: https://play.grafana.org, dashboard Kubernetes / Compute Resources / Cluster
- The screenshots are in `img/`; they show third-party interfaces and are kept for study only.
