# Bonus: a local GitLab

The lab of Part 3, with one change: the repository Argo CD follows is no longer on GitHub. It is on a GitLab that runs inside the cluster, in the namespace `gitlab`.

## Status

Passed end to end on 2026-11-28 in the host VM (6 CPUs, 7 GB), twice, each time from an empty cluster.

| Step | Measured |
|------|----------|
| `make setup`, from nothing to "Setup complete" | 244 s and 269 s, image download included. GitLab's start is 250 s of it |
| Argo CD deploys v1 from the GitLab repository | 12 to 16 s after `make setup` returned |
| `make v2`, until `curl http://localhost:8888` answers `v2` | 8 s |
| `make v1`, back | 8 s |
| Memory | host VM at 4.7 GB used of 7.4; the GitLab pod alone 2.6 GB |

Not tried yet: the steps of the defense done by hand in the browser (log in to GitLab, create a project, edit a file there, the Argo CD page), and a restart of the cluster with `k3d cluster stop` and `start`.

In the first run the push of `make repo` got an HTTP 502: GitLab restarts its Git services once, just after its sign-in page first answers. The script now retries for two minutes. In the second run the push passed at the first try, so the retry itself has not been seen at work.

## What is in the folder

| File | What it is |
|------|------------|
| `Makefile` | every command below |
| `confs/gitlab.yaml` | GitLab: its disk, its Deployment (the official image `gitlab/gitlab-ce`), its Service |
| `confs/argocd-app.yaml` | the Argo CD application `dev-app`, pointed at the GitLab repository |
| `confs/app/deployment.yaml` | the application `wil-playground` in version v1: the first commit of the GitLab repository |
| `scripts/gitlab-repo.sh` | pushes that first commit, and changes the image tag (used by `make repo`, `make v1`, `make v2`) |

GitLab is one Deployment of the official image, not the Helm chart. The image holds every GitLab service in one container and fits in the 7 GB of the host VM. The current chart needs a database, a Redis and an object store installed next to it.

## Run it

Delete the cluster of Part 3 first: both do not fit in memory.

```bash
make -C ../p3 delete
make setup
```

`make setup` takes 4 to 5 minutes. Most of it is GitLab: the image download, then its first start.

| What | Where | Login |
|------|-------|-------|
| GitLab | http://localhost:8929 | `root`, password: `make gitlab-password` |
| Argo CD | `make port-forward`, then https://localhost:8080 | `admin`, password: `make argo-password` |
| The application | `curl http://localhost:8888` | |

`make info` shows the pods, the state of `dev-app` and the image the application runs. `make delete` removes everything.

## The defense

1. Show the namespaces and the GitLab pod:

   ```bash
   kubectl get ns
   kubectl -n gitlab get pods
   ```

2. GitLab works: log in at http://localhost:8929 as `root`. Create a project with the evaluator (New project, Create blank project), then add a file to it in the browser (the `+` button, New file, Commit changes). The file shows in the project.

3. Argo CD uses the local GitLab: in the Argo CD page, `dev-app` has the repository `http://gitlab.gitlab.svc.cluster.local:8929/root/rpodackIoT.git`. That is the GitLab Service seen from inside the cluster. The same project is at http://localhost:8929/root/rpodackIoT in the browser.

4. Version 1 runs:

   ```bash
   curl http://localhost:8888
   ```

5. Change the version in the GitLab repository. In the browser: open `deployment.yaml` in `root/rpodackIoT`, Edit, change `wil42/playground:v1` to `wil42/playground:v2`, Commit changes. Or in a terminal:

   ```bash
   git clone http://localhost:8929/root/rpodackIoT.git
   cd rpodackIoT
   sed -i 's/playground:v1/playground:v2/' deployment.yaml
   git commit -am "v2"
   git push
   ```

   git asks for a login: `root` and the password from `make gitlab-password`.

6. Argo CD looks at the repository every 3 minutes. `make sync` asks it to look now. Then:

   ```bash
   curl http://localhost:8888
   ```

   answers with `v2`.

`make v2` does steps 5 and 6 in one command, `make v1` goes back.
