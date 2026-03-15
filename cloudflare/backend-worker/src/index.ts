import { Container } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

interface Env {
  JAEE_BACKEND: DurableObjectNamespace;
  // Non-secret vars
  SPRING_PROFILES_ACTIVE: string;
  CORS_ALLOWED_ORIGINS: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  SUPABASE_STORAGE_BUCKET: string;
  // Secrets (set via wrangler secret put)
  DATABASE_URL: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  JWT_SECRET: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  FIREBASE_CREDENTIALS: string;
}

export class JaeeBackend extends Container<Env> {
  defaultPort = 8080;

  // Keep alive for 5 minutes after last request to avoid cold starts.
  // Spring Boot takes ~10-30s to boot, so we want to minimize restarts.
  sleepAfter = "5m";

  override envVars = {
    SPRING_PROFILES_ACTIVE: env.SPRING_PROFILES_ACTIVE ?? "prod",
    PORT: "8080",
    // Override Dockerfile's conservative 256m with values suitable for standard-1 (4 GiB)
    JAVA_OPTS:
      "-Xmx2g -Xms512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom",
    CORS_ALLOWED_ORIGINS: env.CORS_ALLOWED_ORIGINS ?? "",
    DATABASE_URL: env.DATABASE_URL ?? "",
    DATABASE_USERNAME: env.DATABASE_USERNAME ?? "",
    DATABASE_PASSWORD: env.DATABASE_PASSWORD ?? "",
    JWT_SECRET: env.JWT_SECRET ?? "",
    RAZORPAY_KEY_ID: env.RAZORPAY_KEY_ID ?? "",
    RAZORPAY_KEY_SECRET: env.RAZORPAY_KEY_SECRET ?? "",
    RAZORPAY_WEBHOOK_SECRET: env.RAZORPAY_WEBHOOK_SECRET ?? "",
    RAZORPAY_TEST_MODE: "false",
    RESEND_API_KEY: env.RESEND_API_KEY ?? "",
    EMAIL_FROM: env.EMAIL_FROM ?? "",
    EMAIL_FROM_NAME: env.EMAIL_FROM_NAME ?? "",
    EMAIL_ENABLED: "true",
    TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID ?? "",
    TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN ?? "",
    TWILIO_PHONE_NUMBER: env.TWILIO_PHONE_NUMBER ?? "",
    SMS_ENABLED: "true",
    SUPABASE_URL: env.SUPABASE_URL ?? "",
    SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY ?? "",
    SUPABASE_STORAGE_BUCKET: env.SUPABASE_STORAGE_BUCKET ?? "images",
    FIREBASE_ENABLED: env.FIREBASE_CREDENTIALS ? "true" : "false",
    FIREBASE_CREDENTIALS: env.FIREBASE_CREDENTIALS ?? "",
  };

  override onStart(): void {
    console.log("Jaee backend container started");
  }

  override onStop(): void {
    console.log("Jaee backend container stopped");
  }

  override onError(error: unknown): void {
    console.error("Jaee backend container error:", error);
  }
}

function getRandomInstance(
  ns: DurableObjectNamespace,
  count: number
): DurableObjectStub {
  const idx = Math.floor(Math.random() * count);
  const id = ns.idFromName(`jaee-backend-${idx}`);
  return ns.get(id);
}

export default {
  async fetch(request: Request, workerEnv: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check at the Worker level
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({ status: "ok", service: "jaee-backend-worker" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Load-balance across 2 container instances
    const container = getRandomInstance(workerEnv.JAEE_BACKEND, 2);
    return (container as any).fetch(request);
  },
};
