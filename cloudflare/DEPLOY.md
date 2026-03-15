# Deploying Jaee on Cloudflare

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Cloudflare Network                        │
│                                                              │
│   ┌─────────────────┐      ┌───────────────────────────┐    │
│   │ Cloudflare Pages │      │  Cloudflare Containers    │    │
│   │                  │      │                           │    │
│   │  React SPA       │─────▶│  Worker (proxy/LB)       │    │
│   │  (frontend/)     │ API  │       │                   │    │
│   │                  │      │       ▼                   │    │
│   │  jaee.pages.dev  │      │  Spring Boot Container    │    │
│   └─────────────────┘      │  (backend/Dockerfile)     │    │
│                             │       │                   │    │
│                             └───────┼───────────────────┘    │
│                                     │                        │
└─────────────────────────────────────┼────────────────────────┘
                                      │
                              ┌───────▼───────┐
                              │  PostgreSQL    │
                              │  (Neon /       │
                              │   Supabase)    │
                              └───────┬───────┘
                                      │
                              ┌───────▼───────┐
                              │  Supabase      │
                              │  Storage       │
                              │  (images)      │
                              └───────────────┘
```

| Component | Service | Details |
|-----------|---------|---------|
| Frontend | Cloudflare Pages | SPA served from global CDN |
| Backend | Cloudflare Containers | Spring Boot in Docker, behind a Worker |
| Database | External PostgreSQL | Neon or Supabase (free tier) |
| Images | Supabase Storage | Existing setup, no change needed |

## Prerequisites

1. **Cloudflare Account** with Workers Paid plan ($5/month — required for Containers)
2. **Docker** running locally (needed to build the container image)
3. **Node.js 18+** and **npm**
4. **Wrangler CLI**: `npm install -g wrangler`
5. **External PostgreSQL** database (Neon or Supabase)

## Step-by-step Deployment

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser for OAuth. You only need to do this once.

### 2. Set Up the Backend

```bash
cd cloudflare

# Install dependencies
./deploy.sh backend:setup

# Set all secrets (database credentials, API keys, etc.)
./deploy.sh backend:secrets
```

The secrets you'll need:

| Secret | Description | Example |
|--------|-------------|---------|
| `DATABASE_URL` | JDBC PostgreSQL URL | `jdbc:postgresql://host:5432/jaee` |
| `DATABASE_USERNAME` | DB user | `jaee_user` |
| `DATABASE_PASSWORD` | DB password | `****` |
| `JWT_SECRET` | 256-bit JWT signing key | Random 64+ char string |
| `RAZORPAY_KEY_ID` | Razorpay key | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `****` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | `****` |
| `RESEND_API_KEY` | Resend email API key | `re_...` |
| `TWILIO_ACCOUNT_SID` | Twilio SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `****` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | `+1...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service key | `eyJ...` |
| `FIREBASE_CREDENTIALS` | Base64-encoded Firebase JSON | (optional) |

### 3. Deploy the Backend

```bash
./deploy.sh backend:deploy
```

This will:
- Build the Spring Boot Docker image locally
- Push it to Cloudflare's Container Registry
- Deploy the Worker that routes requests to the container

First deploy takes 5-10 minutes. After deploying, wait a few minutes for the container to be provisioned.

Check status:
```bash
./deploy.sh backend:status
```

Your backend will be available at: `https://jaee-backend.<your-account>.workers.dev`

### 4. Deploy the Frontend

**Option A: CLI deploy (one-time)**

```bash
./deploy.sh frontend:deploy
```

**Option B: Git integration (recommended for CI/CD)**

1. Go to [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. Click **Create application** → **Pages** → **Connect to Git**
3. Select your repository
4. Configure:
   - **Project name**: `jaee-frontend`
   - **Production branch**: `main`
   - **Root directory**: `frontend`
   - **Build command**: `npm ci && npm run build`
   - **Build output directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://jaee-backend.<your-account>.workers.dev`
   - Plus any other `VITE_*` variables from `frontend/.env.production`
6. Click **Save and Deploy**

Your frontend will be at: `https://jaee-frontend.pages.dev`

### 5. Post-deployment Configuration

After both services are deployed:

1. **Update CORS origins** in `cloudflare/backend-worker/wrangler.toml`:
   ```toml
   [vars]
   CORS_ALLOWED_ORIGINS = "https://jaee-frontend.pages.dev,https://yourdomain.com"
   ```
   Then redeploy: `./deploy.sh backend:deploy`

2. **Update Razorpay callback URL** (if using Razorpay):
   ```bash
   cd cloudflare/backend-worker
   echo "https://jaee-frontend.pages.dev/order-success" | npx wrangler secret put RAZORPAY_CALLBACK_URL
   ```

3. **Register webhook URL** with Razorpay:
   `https://jaee-backend.<your-account>.workers.dev/webhooks/razorpay`

### 6. Custom Domain (Optional)

**For the frontend** (Pages):
1. Dashboard → Pages → your project → **Custom domains**
2. Add your domain (e.g., `www.jaee.com`)
3. Follow DNS instructions

**For the backend** (Worker):
1. Dashboard → Workers → your worker → **Settings** → **Triggers** → **Custom Domains**
2. Add a subdomain (e.g., `api.jaee.com`)

## Useful Commands

```bash
# View backend logs
./deploy.sh backend:logs

# Check container status
./deploy.sh backend:status

# Redeploy backend after code changes
./deploy.sh backend:deploy

# Redeploy frontend (CLI)
./deploy.sh frontend:deploy

# Set/update a single secret
cd cloudflare/backend-worker && npx wrangler secret put SECRET_NAME
```

## Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Cloudflare Pages | Unlimited sites, 500 builds/month | — |
| Workers (Paid plan) | 10M requests/month | $5/month + $0.30/M requests |
| Containers | Per-instance billing | ~$0.025/hr for standard-1 |
| Neon PostgreSQL | 0.5 GB storage | Free tier available |
| Supabase Storage | 1 GB | Free tier available |

## Troubleshooting

**Container not starting**: Check logs with `./deploy.sh backend:logs`. Ensure Docker was running during deploy.

**Cold starts are slow**: Spring Boot takes 10-30s to boot. The `sleepAfter: 5m` setting keeps the container warm between requests. For production, consider increasing to `15m` or `30m`.

**Database connection errors**: Ensure your PostgreSQL allows connections from Cloudflare IPs. Neon and Supabase handle this automatically.

**CORS errors**: Update `CORS_ALLOWED_ORIGINS` in `wrangler.toml` and redeploy.
