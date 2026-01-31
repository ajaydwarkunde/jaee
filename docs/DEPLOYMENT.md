# Jaee Deployment Guide

This guide walks you through deploying the Jaee e-commerce platform using free-tier services.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│     Render      │────▶│      Neon       │
│   (Frontend)    │     │    (Backend)    │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │     Stripe      │
                        │   (Payments)    │
                        └─────────────────┘
```

## Prerequisites

- GitHub account (for CI/CD)
- Stripe account (test mode)
- Neon account (or Supabase/Railway)
- Vercel account (or Netlify)
- Render account (or Fly.io)
- SendGrid account (optional, for emails)
- Twilio account (optional, for SMS)

---

## Step 1: Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project (e.g., "jaee-production")
3. Copy the connection string:
   ```
   postgresql://user:password@host/dbname?sslmode=require
   ```
4. Save these values:
   - `DATABASE_URL`: The full connection URL
   - `DATABASE_USERNAME`: The username part
   - `DATABASE_PASSWORD`: The password part

### Alternative: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the URI connection string

---

## Step 2: Backend Deployment (Render)

### Create Web Service

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Configure:
   - **Name**: `jaee-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
   - **Instance Type**: Free

### Environment Variables

Add these environment variables in Render:

```env
# Server
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=https://jaee.vercel.app

# Database (from Neon)
DATABASE_URL=jdbc:postgresql://your-neon-host/your-db?sslmode=require
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password

# JWT (generate a secure random string)
JWT_SECRET=base64-encoded-256-bit-secret
JWT_ACCESS_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://jaee.vercel.app/order-success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=https://jaee.vercel.app/cart

# Email (SendGrid)
SENDGRID_API_KEY=SG....
EMAIL_FROM=orders@jaee.com
EMAIL_FROM_NAME=Jaee
EMAIL_ENABLED=true

# SMS (Twilio) - Optional
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
SMS_ENABLED=true

# Environment
SPRING_PROFILES_ACTIVE=prod
```

### Health Check

Set the health check path to: `/actuator/health`

---

## Step 3: Frontend Deployment (Vercel)

### Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Environment Variables

Add these in Vercel:

```env
VITE_API_URL=https://jaee-api.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

---

## Step 4: Stripe Configuration

### Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint:
   - URL: `https://jaee-api.onrender.com/webhooks/stripe`
   - Events: `checkout.session.completed`
3. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### Test Mode vs Live Mode

- Use test keys (pk_test_, sk_test_) for development
- Switch to live keys (pk_live_, sk_live_) for production
- Test cards: https://stripe.com/docs/testing

---

## Step 5: Email Configuration (SendGrid)

1. Create a SendGrid account
2. Go to Settings → API Keys → Create API Key
3. Copy the key to `SENDGRID_API_KEY`
4. Verify your sender email domain

---

## Step 6: SMS Configuration (Twilio) - Optional

1. Create a Twilio account
2. Get a phone number
3. Copy credentials:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
   - Phone Number → `TWILIO_PHONE_NUMBER`

---

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test mobile OTP (check Twilio logs if not working)
- [ ] Browse products and categories
- [ ] Add items to cart
- [ ] Complete a test purchase
- [ ] Verify order confirmation email
- [ ] Check webhook events in Stripe dashboard
- [ ] Test admin panel (create/edit products)

---

## Monitoring & Logs

### Render
- View logs: Dashboard → Your Service → Logs
- Set up alerts for errors

### Vercel
- View deployments: Project → Deployments
- Check function logs

### Stripe
- Monitor webhooks: Developers → Webhooks
- View events: Developers → Events

---

## Troubleshooting

### CORS Errors
Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL exactly.

### Database Connection Issues
- Check the connection string format
- Ensure SSL is enabled (`?sslmode=require`)
- Verify credentials

### Stripe Webhook Failures
- Check the signing secret is correct
- Verify the endpoint URL
- Check Render logs for errors

### OTP Not Sending
- Verify Twilio credentials
- Check Twilio console for errors
- Ensure phone number format is correct

---

## Scaling Considerations

When you outgrow free tiers:

1. **Database**: Upgrade to Neon Pro or managed PostgreSQL
2. **Backend**: Upgrade to Render paid tier for more resources
3. **CDN**: Consider Cloudflare for static assets
4. **Monitoring**: Add Sentry for error tracking
5. **Caching**: Add Redis for session/cart caching
