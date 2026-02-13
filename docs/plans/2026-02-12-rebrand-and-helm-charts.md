# SmartDocs Rebrand + Helm Charts for K8s Deployment

> **Date:** 2026-02-12
> **Status:** Implemented

## Overview

Full rebrand from "Lexsy" to "SmartDocs" across the entire codebase, plus Helm charts for deploying to an existing Kubernetes cluster with nginx-ingress.

---

## Part 1: Full Rebrand (lexsy -> smartdocs)

### 1.1 Package Names and Imports

| File | Old | New |
|------|-----|-----|
| `package.json` | `"name": "lexsy"` | `"name": "smartdocs"` |
| `common/package.json` | `"@lexsy/common"` | `"@smartdocs/common"` |
| `backend/package.json` | `"@lexsy/backend"` + dep `"@lexsy/common"` | `"@smartdocs/backend"` + `"@smartdocs/common"` |
| `frontend/package.json` | `"@lexsy/frontend"` | `"@smartdocs/frontend"` |

All TypeScript imports of `@lexsy/common` updated across 22 backend files (agents, services, controllers, middleware, tests).

Ran `npm install` to regenerate lockfile.

### 1.2 Docker Container and Network Names

Both `docker-compose.yml` and `docker-compose.prod.yml`:
- Container names: `lexsy-postgres` -> `smartdocs-postgres`, `lexsy-backend` -> `smartdocs-backend`, `lexsy-frontend` -> `smartdocs-frontend`
- Network: `lexsy-network` -> `smartdocs-network`

### 1.3 Database Defaults

| File | Changes |
|------|---------|
| `backend/knexfile.ts` | `lexsy_user` -> `smartdocs_user`, `lexsy_password` -> `smartdocs_password`, `lexsy` -> `smartdocs`, `lexsy_test` -> `smartdocs_test` |
| `.env.example` | Updated POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB comments |
| `backend/.env.example` | DATABASE_URL updated to `smartdocs_test` |
| Docker compose files | All POSTGRES_* env vars and DATABASE_URL updated |

### 1.4 Seed Data

- `001_seed_users.ts`: `demo@lexsy.com` -> `demo@smartdocs.com`, org `Lexsy Demo` -> `SmartDocs Demo`
- `002_seed_documents.ts`: `demo@lexsy.com` -> `demo@smartdocs.com`, `Lexsy Inc.` -> `SmartDocs Inc.`

### 1.5 Frontend

- `Login.tsx:104`: Demo email display updated to `demo@smartdocs.com`

### 1.6 Deploy Script

- `deploy.sh`: All container names, user/db refs, and completion messages updated

### 1.7 Documentation

- `README.md`: All "Lexsy" -> "SmartDocs", URLs, credentials, commands
- `CLAUDE.md`: Project description and demo email updated
- `DEPLOYMENT_COMPLETE.md`: Demo email updated
- `.gitignore`: `lexsy-backups/` -> `smartdocs-backups/`

### 1.8 Test Scripts

- `test-e2e.sh`: Container names, DB credentials, email, grep patterns updated
- `test-real-workflow.sh`: Same updates

---

## Part 2: Helm Charts

### Directory Structure

```
helm/smartdocs/
├── Chart.yaml
├── values.yaml
├── .helmignore
└── templates/
    ├── NOTES.txt
    ├── _helpers.tpl
    ├── secrets.yaml
    ├── configmap-backend.yaml
    ├── configmap-frontend.yaml
    ├── statefulset-postgres.yaml
    ├── service-postgres.yaml
    ├── job-migration.yaml
    ├── deployment-backend.yaml
    ├── service-backend.yaml
    ├── deployment-frontend.yaml
    ├── service-frontend.yaml
    └── ingress.yaml
```

### Design Decisions

**Migrations**: Helm pre-install/pre-upgrade hook Job. Avoids race conditions with multiple backend replicas that init containers would cause. Uses `helm.sh/hook-delete-policy: before-hook-creation` to clean up old jobs.

**Frontend nginx**: ConfigMap with custom `default.conf` that:
- Serves static SPA files from `/usr/share/nginx/html`
- Proxies `/api/` to the backend Service internally (no hairpin through ingress)
- Proxies `/health` to backend
- SPA fallback: `try_files $uri $uri/ /index.html`
- Static asset caching headers (1 year, immutable)

**Ingress**: Single Ingress resource with nginx-ingress:
- `/api` and `/health` -> backend service
- `/` -> frontend service
- TLS via cert-manager annotation (`cert-manager.io/cluster-issuer`)
- Increased proxy timeouts (300s) for AI operations

**PostgreSQL**: StatefulSet with PVC:
- Single replica
- `PGDATA` set to subdirectory to avoid lost+found issues
- Password from Secret (secretKeyRef)
- Liveness/readiness probes via `pg_isready`

**Secrets**: Single Secret resource containing:
- `openai-api-key`
- `jwt-secret`
- `postgres-password`
- Passed via `--set` or external values file at install time

**Images**: Parameterized via `imageRegistry.url` (e.g., `gcr.io/my-project`). Image names: `smartdocs-backend`, `smartdocs-frontend`.

### Key values.yaml Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `imageRegistry.url` | `""` | Container registry URL |
| `ingress.host` | `smartdocs.servicetsunami.com` | Domain name |
| `ingress.tls.enabled` | `true` | Enable TLS via cert-manager |
| `ingress.tls.clusterIssuer` | `letsencrypt-prod` | cert-manager issuer |
| `backend.replicaCount` | `2` | Backend replicas |
| `frontend.replicaCount` | `2` | Frontend replicas |
| `postgres.auth.database` | `smartdocs` | DB name |
| `postgres.auth.username` | `smartdocs_user` | DB user |
| `postgres.auth.password` | `""` | DB password (required) |
| `backend.secrets.openaiApiKey` | `""` | OpenAI API key (required) |
| `backend.secrets.jwtSecret` | `""` | JWT secret (required) |
| `postgres.storage.size` | `10Gi` | PVC size |

### Resource Defaults

| Component | CPU Request | Memory Request | CPU Limit | Memory Limit |
|-----------|------------|----------------|-----------|--------------|
| Backend | 500m | 1Gi | 2 | 4Gi |
| Frontend | 100m | 128Mi | 500m | 512Mi |
| PostgreSQL | 500m | 1Gi | 2 | 4Gi |
| Migration Job | 100m | 256Mi | 500m | 512Mi |

### Installation

```bash
helm install smartdocs helm/smartdocs \
  --set imageRegistry.url=gcr.io/my-project \
  --set backend.secrets.openaiApiKey=sk-xxx \
  --set backend.secrets.jwtSecret=my-jwt-secret \
  --set postgres.auth.password=my-db-password
```

### Upgrade

```bash
helm upgrade smartdocs helm/smartdocs \
  --set imageRegistry.url=gcr.io/my-project \
  --set backend.secrets.openaiApiKey=sk-xxx \
  --set backend.secrets.jwtSecret=my-jwt-secret \
  --set postgres.auth.password=my-db-password
```

---

## Verification

```bash
# No remaining "lexsy" references
grep -ri "lexsy" --include="*.ts" --include="*.tsx" --include="*.json" \
  --include="*.yml" --include="*.yaml" --include="*.sh" --include="*.md" \
  . | grep -v node_modules | grep -v .git

# Helm lint passes
helm lint helm/smartdocs --set backend.secrets.openaiApiKey=test \
  --set backend.secrets.jwtSecret=test --set postgres.auth.password=test

# Helm template renders all 11 resources
helm template smartdocs helm/smartdocs --set backend.secrets.openaiApiKey=test \
  --set backend.secrets.jwtSecret=test --set postgres.auth.password=test \
  --set imageRegistry.url=gcr.io/test | grep "^# Source:"

# npm install succeeds after rename
npm install
```
