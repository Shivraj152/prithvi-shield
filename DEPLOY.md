## Deploying Prithvi Shield (public)

Important: you posted a GitHub Personal Access Token (PAT) in chat. Revoke it immediately in GitHub Settings → Developer settings → Personal access tokens and create a new one if needed.

Steps to publish this repo and enable CI/CD (recommended workflow):

1. Install `gh` (GitHub CLI) and authenticate interactively:

```bash
gh auth login
```

2. From the project root (`d:/HACKATHON SHIV`), create a public repo and push all files:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create <your-username>/prithvi-shield --public --source=. --remote=origin --push
```

Alternatively, create the repo on GitHub web and add the `origin` remote with SSH or HTTPS then push.

3. Connect the repo to a deployment provider (recommended: Render):
   - Sign in to https://render.com and connect your GitHub account.
   - Create three services:
     - A `Web Service` for the `backend` using the Dockerfile in `/backend` (port 5000).
     - A `Web Service` for the `frontend` using the Dockerfile in `/frontend` (port 3000) or use static hosting if you prefer.
     - A `Web Service` for the `ml-service` using the Dockerfile in `/ml-service` (port 8000).
   - Add a managed Postgres instance or use the provided `timescaledb` image on your own server. Set environment variables from `docker-compose.yml` in each Render service.

4. Or use Render's Docker Compose support by pointing it to this repository and letting Render build the services.

5. After connecting, GitHub Actions will run the `CI Build` workflow on push to `main`/`master`.

Publishing images to GitHub Container Registry (GHCR):

- This repository includes `/.github/workflows/publish.yml` which builds and pushes three images to GHCR on push to `main`.
- Images will be named `ghcr.io/<your-github-username>/prithvi-shield-frontend:latest`, `...-backend:latest`, and `...-ml:latest`.

Render/Cloud Run: after images are in GHCR you can configure your provider to pull those images (or connect Render directly to this repo and use the Dockerfiles).

I added the `publish.yml` workflow so you can push to GHCR without providing me any tokens. If you want, I can also add an Action to automatically deploy to a provider that supports API keys (you'll need to add the provider API key as a GitHub secret).

Automated Render deploy workflow
--------------------------------

I added `/.github/workflows/deploy_render.yml` which will trigger Render deploys after pushes to `main` when these GitHub Secrets are configured on your repo:

- `RENDER_API_KEY` — create in Render (Account → API Keys)
- `RENDER_FRONTEND_SERVICE_ID` — the Render service id for the frontend
- `RENDER_BACKEND_SERVICE_ID` — the Render service id for the backend
- `RENDER_ML_SERVICE_ID` — the Render service id for the ML service

To add secrets: on GitHub go to Settings → Secrets and variables → Actions → New repository secret. Add each key/value there.

Once secrets are set and you push `main`, the workflows will build images, push to GHCR, and trigger Render deploys automatically.

Quick helper script
-------------------

There's an interactive PowerShell helper `push_and_setup.ps1` added to the repository to automate creating the repo, pushing, and setting Render secrets using the GitHub CLI. Run it locally from the project root:

```powershell
cd 'd:\HACKATHON SHIV'
.\push_and_setup.ps1
```

The script requires `git` and `gh` to be installed and will prompt you for the GitHub owner, repo name, and optional Render secrets. It sets GitHub Actions secrets via `gh secret set` so you don't need to paste tokens here.
