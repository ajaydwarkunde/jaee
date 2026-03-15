# Jaee - Premium E-Commerce Platform

A beautiful, mobile-first e-commerce web application for **Jaee** - a brand that sells aesthetic candles and other premium products.

## 🎨 Brand Style Guide

### Colors
```css
/* Primary Palette - Soft Luxury */
--color-cream:        #FAF7F2;     /* Background */
--color-blush:        #F5E6E0;     /* Soft accent */
--color-rose:         #D4A5A5;     /* Primary accent */
--color-dusty-rose:   #C89B9B;     /* Primary hover */
--color-champagne:    #E8DDD4;     /* Secondary accent */
--color-charcoal:     #2D2D2D;     /* Text primary */
--color-warm-gray:    #6B6B6B;     /* Text secondary */
--color-soft-white:   #FFFFFF;     /* Cards, inputs */

/* Semantic Colors */
--color-success:      #7FB685;
--color-error:        #D4726A;
--color-warning:      #E5C07B;
```

### Typography
- **Headings**: Cormorant Garamond (serif) - Elegant, feminine
- **Body**: DM Sans (sans-serif) - Clean, modern, readable
- **Scale**: 12, 14, 16, 18, 20, 24, 32, 40, 48, 64px

### Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

### Component Guidelines
- **Border radius**: 8px (small), 12px (medium), 16px (large), 9999px (pill)
- **Shadows**: Soft, warm-toned shadows
- **Buttons**: Rounded corners, subtle hover animations
- **Cards**: White background, soft shadow, generous padding
- **Inputs**: Rounded, subtle border, clear focus states

---

## 📁 Project Structure

```
jaee/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Spring Boot 3 REST API
├── docs/              # OpenAPI spec + documentation
├── infra/             # Docker, scripts
├── .env.example       # Root env template
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router v6 (routing)
- React Hook Form + Zod (forms + validation)
- TanStack Query (data fetching)

### Backend
- Java 21
- Spring Boot 3
- Gradle (build tool)
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway (migrations)
- Stripe Java SDK
- SendGrid / JavaMail (email)
- Twilio (SMS/OTP)

### Infrastructure
- **Frontend**: Vercel / Netlify
- **Backend**: Render / Fly.io
- **Database**: Neon / Supabase (free tier PostgreSQL)

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
# Server
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://jaee.vercel.app

# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/jaee
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-256-bit-secret-key-here-make-it-long-and-random
JWT_ACCESS_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:5173/order-success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=http://localhost:5173/cart

# Email (SendGrid)
SENDGRID_API_KEY=SG....
EMAIL_FROM=orders@jaee.com
EMAIL_FROM_NAME=Jaee

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Supabase (Database + Image Storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=images

# Environment
SPRING_PROFILES_ACTIVE=dev
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- Java 21 (Amazon Corretto recommended)
- Docker (for PostgreSQL)
- Stripe CLI (for webhook testing)

### 1. Start Database
```bash
cd infra
docker-compose up -d postgres
```

### 2. Start Backend
```bash
cd backend
# Edit src/main/resources/application.yml with your values
./gradlew bootRun
```

The API will be available at `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Start Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Stripe Webhook Testing
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:8080/webhooks/stripe
# Copy the webhook signing secret to your backend .env
```

---

## 🚢 Deployment Guide

### Database & Storage (Supabase)
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project → Note your project URL and service role key
3. Go to **Storage** → Create a bucket named `images` → Set it to **Public**
4. Copy connection details to your backend environment:
   - `DATABASE_URL`: Found in Settings → Database → Connection string (JDBC)
   - `SUPABASE_URL`: Your project URL (e.g., `https://xxx.supabase.co`)
   - `SUPABASE_SERVICE_KEY`: Found in Settings → API → Service role key

### Backend (Render)
1. Create a new Web Service
2. Connect your GitHub repo
3. Set build command: `cd backend && ./gradlew build -x test`
4. Set start command: `cd backend && java -jar build/libs/*.jar`
5. Add all environment variables
6. Set health check path: `/actuator/health`

### Frontend (Vercel)
1. Import your GitHub repo
2. Set root directory: `frontend`
3. Add environment variables
4. Deploy

### Post-Deployment
1. Update CORS origins in backend
2. Register Stripe webhook URL: `https://your-backend.onrender.com/webhooks/stripe`
3. Update success/cancel URLs in backend env

---

## 🧪 Testing

### Backend
```bash
cd backend
./gradlew test
```

### Frontend
```bash
cd frontend
npm run test
npm run build  # Type-safe build check
```

---

## 📦 Useful Gradle Commands

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Run tests
./gradlew test

# Clean build
./gradlew clean build

# Build JAR without tests
./gradlew build -x test

# Check dependencies
./gradlew dependencies
```

---

## 📝 License

Private - All rights reserved © Jaee
