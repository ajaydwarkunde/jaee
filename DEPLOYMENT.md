# Deployment Guide

## Architecture

| Component | Production (`main`) | Pre-prod / Staging (`develop`) |
|-----------|--------------------|---------------------------------|
| Backend   | Render: `jaee-backend` | Render: `jaee-backend-staging` |
| Frontend  | Vercel (production deploy) | Vercel (preview deployments) |
| Database  | Supabase project (prod) | Supabase project (staging) |
| Storage   | Supabase Storage (prod) | Supabase Storage (staging) |

## Branching Strategy

```
feature/* ──PR──> develop (pre-prod) ──PR──> main (production)
```

- **`main`** — production branch. Always deployed and stable.
- **`develop`** — pre-prod/staging branch. Features are integrated here first.
- **`feature/*`** — short-lived branches for individual features, merged into `develop` via PR.

## CI/CD Pipeline

On every push/PR to `main` or `develop`:
1. **Backend job** — builds with Gradle, runs tests
2. **Frontend job** — installs deps, runs `npm run build` (includes type checking)
3. **Deploy job** (push only, not PRs):
   - `main` push triggers production Render backend deploy
   - `develop` push triggers staging Render backend deploy
   - Vercel handles frontend deploys automatically (production on `main`, previews on other branches)

## One-Time Setup

### 1. Supabase — Create Staging Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (e.g., "jaee-staging")
3. Note down:
   - **Project URL** (`SUPABASE_URL`)
   - **Service Role Key** (`SUPABASE_SERVICE_KEY`) — found in Settings > API
   - **Database Connection String** (`DATABASE_URL`) — found in Settings > Database > Connection string (URI format)
4. Create a storage bucket named `images` (or your preferred name for `SUPABASE_STORAGE_BUCKET`)

### 2. Render — Create Staging Backend Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Create a new **Web Service**:
   - **Name**: `jaee-backend-staging`
   - **Repository**: your GitHub repo
   - **Branch**: `develop`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Region**: Singapore (match production)
   - **Plan**: Free
   - **Health Check Path**: `/actuator/health`
   - **Auto-Deploy**: Off (GitHub Actions handles this)
3. Set environment variables:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DATABASE_URL` | Staging Supabase DB connection string |
| `JWT_SECRET` | Generate a unique secret |
| `SUPABASE_URL` | Staging Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Staging Supabase service role key |
| `SUPABASE_STORAGE_BUCKET` | `images` |
| `CORS_ALLOWED_ORIGINS` | `https://*-your-project.vercel.app` |
| `RAZORPAY_KEY_ID` | Test mode key |
| `RAZORPAY_KEY_SECRET` | Test mode secret |
| `RAZORPAY_TEST_MODE` | `true` |

4. Go to **Settings > Deploy Hook** and create a deploy hook. Copy the URL.

### 3. GitHub Secrets

Go to your repo **Settings > Secrets and variables > Actions** and add:

| Secret | Description |
|--------|-------------|
| `RENDER_BACKEND_DEPLOY_HOOK` | Production Render backend deploy hook URL (should already exist) |
| `RENDER_STAGING_DEPLOY_HOOK` | Staging Render backend deploy hook URL (from step 2) |
| `BACKEND_URL` | Production backend URL, e.g. `https://jaee-backend.onrender.com` |
| `STAGING_BACKEND_URL` | Staging backend URL, e.g. `https://jaee-backend-staging.onrender.com` |
| `FRONTEND_URL` | Production frontend URL on Vercel |

### 4. Vercel — Configure Environment Variables

1. Go to your Vercel project **Settings > Environment Variables**
2. Set the following per scope:

| Variable | Production | Preview |
|----------|-----------|---------|
| `VITE_API_URL` | `https://jaee-backend.onrender.com` | `https://jaee-backend-staging.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | Production Razorpay key | Test Razorpay key |

Add any other environment-specific variables (Firebase, etc.) following the same pattern.

### 5. GitHub Branch Protection (Recommended)

Go to repo **Settings > Branches > Add rule**:

**`main` branch:**
- Require a pull request before merging
- Require status checks to pass (select `backend` and `frontend`)
- Do not allow bypassing the above settings

**`develop` branch:**
- Require status checks to pass (select `backend` and `frontend`)

## Database Migrations

Flyway migrations live in `backend/src/main/resources/db/migration/`. Each environment runs migrations independently against its own database on startup. When code merges from `develop` to `main`, the same migration files run on the production DB for the first time.

**Important**: Never manually alter database schemas. Always use Flyway migration files (e.g., `V29__description.sql`).

## Workflow Quick Reference

| Action | Result |
|--------|--------|
| Push to `feature/*` | No deployment. Local dev only. |
| PR to `develop` | CI runs. Vercel creates a preview deployment. |
| Merge to `develop` | CI + staging backend deploys to Render. Vercel preview updates. |
| PR from `develop` to `main` | CI runs. Vercel creates a preview. |
| Merge to `main` | CI + production backend deploys to Render. Vercel deploys to production. |

## Keep-Alive

The `keep-alive.yml` workflow pings both production and staging backends every 14 minutes to prevent Render free-tier services from sleeping. The staging ping is conditional on `STAGING_BACKEND_URL` being set.

## GraalVM Native Image (optional, evaluation)

For **smaller container images** than the default Temurin JRE + layered JAR flow:

| File | Purpose |
|------|---------|
| [backend/Dockerfile.native](backend/Dockerfile.native) | Multi-stage build: `nativeCompile` + slim Debian runtime |
| [backend/build.gradle](backend/build.gradle) | `org.graalvm.buildtools.native` + `graalvmNative { ... }` |

**Local:** Install GraalVM JDK 21 (with `native-image`), then from `backend/`: `./gradlew nativeCompile -x test`. Binary: `build/native/nativeCompile/jaee-backend`.

**Docker:** `docker build -f backend/Dockerfile.native -t jaee-backend:native backend` (context must be `backend/` so paths match).

**CI:** [.github/workflows/native-image.yml](.github/workflows/native-image.yml) runs `nativeCompile` on PRs that touch `backend/` and on pushes to `feature/*` branches.

Third-party SDKs (Firebase, Twilio, etc.) may need extra GraalVM reachability metadata before production use; validate all integrations against the native binary before changing Render’s Docker command.
