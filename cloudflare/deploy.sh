#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

usage() {
  echo "Usage: $0 <command>"
  echo ""
  echo "Commands:"
  echo "  backend:setup     Install backend worker dependencies"
  echo "  backend:secrets   Interactively set all required secrets"
  echo "  backend:deploy    Deploy the backend (Worker + Container)"
  echo "  backend:logs      Tail backend logs"
  echo "  backend:status    Show container status"
  echo "  frontend:deploy   Build and deploy frontend to Cloudflare Pages"
  echo "  all               Deploy both backend and frontend"
  echo ""
  exit 1
}

backend_setup() {
  echo "==> Installing backend worker dependencies..."
  cd "$SCRIPT_DIR/backend-worker"
  npm install
  echo "==> Done."
}

backend_secrets() {
  echo "==> Setting backend secrets (you'll be prompted for each value)..."
  cd "$SCRIPT_DIR/backend-worker"

  SECRETS=(
    DATABASE_URL
    DATABASE_USERNAME
    DATABASE_PASSWORD
    JWT_SECRET
    RAZORPAY_KEY_ID
    RAZORPAY_KEY_SECRET
    RAZORPAY_WEBHOOK_SECRET
    RESEND_API_KEY
    TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN
    TWILIO_PHONE_NUMBER
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
    FIREBASE_CREDENTIALS
  )

  for secret in "${SECRETS[@]}"; do
    echo ""
    read -rp "Set $secret? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      npx wrangler secret put "$secret"
    else
      echo "  Skipped $secret"
    fi
  done

  echo ""
  echo "==> Secrets configured."
}

backend_deploy() {
  echo "==> Deploying backend (Worker + Container)..."
  echo "    This builds the Docker image and deploys the Worker."
  echo "    First deploy may take several minutes."
  cd "$SCRIPT_DIR/backend-worker"
  npx wrangler deploy
  echo ""
  echo "==> Backend deployed! Run '$0 backend:status' to check container status."
}

backend_logs() {
  cd "$SCRIPT_DIR/backend-worker"
  npx wrangler tail
}

backend_status() {
  cd "$SCRIPT_DIR/backend-worker"
  npx wrangler containers list
}

frontend_deploy() {
  echo "==> Building frontend..."
  cd "$PROJECT_ROOT/frontend"
  npm ci
  npm run build

  echo "==> Deploying to Cloudflare Pages..."
  npx wrangler pages deploy dist --project-name=jaee-frontend

  echo ""
  echo "==> Frontend deployed!"
}

deploy_all() {
  backend_setup
  backend_deploy
  frontend_deploy
}

# ── Main ────────────────────────────────────────────────────────────
[[ $# -lt 1 ]] && usage

case "$1" in
  backend:setup)    backend_setup ;;
  backend:secrets)  backend_secrets ;;
  backend:deploy)   backend_deploy ;;
  backend:logs)     backend_logs ;;
  backend:status)   backend_status ;;
  frontend:deploy)  frontend_deploy ;;
  all)              deploy_all ;;
  *)                usage ;;
esac
