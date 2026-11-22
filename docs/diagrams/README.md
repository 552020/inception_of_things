# Diagrams

One overview sketch per part, plus one of the finished setup, in the hand-drawn style of the Foto Kotti infrastructure docs (`fotokotti/docs`, `infrastructure/providers/*-overview-sketch.html`): paper, ink, one accent colour, three labelled columns, an accent dot where the actor of a step sits, dashes for what is not settled.

| Part | Sketch | What it shows |
|------|--------|---------------|
| 1 | [p1-overview-sketch.png](p1-overview-sketch.png) | host VM, the steps of `make up`, the two VMs, the known stall of `make provision` |
| 2 | [p2-overview-sketch.png](p2-overview-sketch.png) | Host header, Traefik, three apps, app3 as the default |
| 3 | [p3-overview-sketch.png](p3-overview-sketch.png) | GitHub repo, Argo CD, the k3d cluster, the v1 to v2 push |
| all | [final-architecture-sketch.png](final-architecture-sketch.png) | the four folders we turn in, where each one runs inside the host VM, what you see once it is up; dashed rows are written but not run yet |

The `.html` file is the source: one inline SVG, edit the text in it and open it in a browser. The `.png` is a screenshot of it (Chrome, 2x, with the handwriting font Patrick Hand because the host has no Bradley Hand):

```bash
google-chrome --headless=new --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1532,942 --screenshot=p1-overview-sketch.png p1-overview-sketch.html
```

State of the sketches: 22 November 2026. When a part has been run, remove the dashes of its row in the final-architecture sketch (delete `plan` from the class of its boxes and arrows). Part 1 was run; Parts 2 and 3 are drawn from the files and the subject and have not been run yet, which the status line at the bottom of each sketch says. Update the sketch when the part changes.
