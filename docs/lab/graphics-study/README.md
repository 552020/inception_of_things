# Graphics study: the DevOps page

Structure first, colour last. Captured 2026-11-22 in a headless browser, except the Kubernetes Dashboard and the two k9s screens, which come from the projects' own repositories.

## Consoles

<div class="shots">

<figure>
<img src="img/argocd-apps.png" alt="Argo CD application list">
<figcaption>Argo CD, list. Filters with counts on the left, one stacked bar of the totals, tiles with a coloured edge.</figcaption>
</figure>

<figure>
<img src="img/argocd-tree.png" alt="Argo CD resource tree">
<figcaption>Argo CD, tree. A graph of what owns what, a kind icon on every node, health and sync as big words on top.</figcaption>
</figure>

<figure>
<img src="img/gh-run.png" alt="GitHub Actions job graph">
<figcaption>GitHub Actions. Jobs as boxes with their duration, joined left to right; a matrix folded into one box.</figcaption>
</figure>

<figure>
<img src="img/grafana-k8s.png" alt="Grafana cluster dashboard">
<figcaption>Grafana. Big numerals, one chart, one table; time range and refresh on top.</figcaption>
</figure>

<figure>
<img src="img/k8s-dashboard.png" alt="Kubernetes Dashboard">
<figcaption>Kubernetes Dashboard. Blue title bar with breadcrumb, a menu of resource kinds, ring gauges for CPU, memory and pods, plain tables.</figcaption>
</figure>

</div>

## Retro

<div class="shots">

<figure>
<img src="img/posthog.png" alt="PostHog website as a desktop">
<figcaption>PostHog. The whole site is a desktop: icons down both sides, a menu bar on top, the page is a window with maximise and close.</figcaption>
</figure>

<figure>
<img src="img/win98.png" alt="98.css">
<figcaption>98.css, a CSS library for Windows 98: grey bevelled buttons, blue title bars, tree view, tabs. No JavaScript.</figcaption>
</figure>

</div>

## Command line

<div class="shots">

<figure>
<img src="img/k9s-pods.png" alt="k9s pods">
<figcaption>k9s. Key hints in the header, one table, colour only for state: green for running, cyan for the selection.</figcaption>
</figure>

<figure>
<img src="img/k9s-logs.png" alt="k9s logs">
<figcaption>k9s again, streaming logs in a framed pane.</figcaption>
</figure>

</div>

## Ours today

<div class="shots">

<figure>
<img src="img/deck-home.png" alt="The public page">
<figcaption>The public page: three paragraphs about machines and connections.</figcaption>
</figure>

<figure>
<img src="img/deck-cards.png" alt="The cards list">
<figcaption>The cards list: 138 equal boxes, no state, no counts on the tags.</figcaption>
</figure>

</div>

## Directions

Settled by you: the style is about the whole site, not the desk or the phone, and the public page shows off, with diagrams in it.

- A. Console: sidebar with filters and counts, a totals bar, rows with the state first.
- B. Topology: the public page drawn as diagrams, with real addresses, routes and a Git loop.
- C. Pipeline: the three parts as stages with progress numbers.
- D. Panels: Progress as a dashboard of big numerals and charts.
- E. Command line: one monospace screen, key hints in the header, framed panes, state-only colour.
- F. Retro desktop: grey bevelled windows with title bars, icons on a desktop, a taskbar. Diagrams sit well in a window.

E and F are style, A to D are structure; one of each kind combines.

## Sources

Argo CD demo https://cd.apps.argoproj.io · GitHub Actions run https://github.com/argoproj/argo-cd/actions/runs/45018135303 · Grafana playground https://play.grafana.org · Kubernetes Dashboard https://github.com/kubernetes/dashboard · k9s https://github.com/derailed/k9s · PostHog https://posthog.com · 98.css https://jdan.github.io/98.css/
