import { registerAs } from "@nestjs/config";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export default registerAs("sikdae", () => ({
  apiBaseUrl: process.env.SIKDAE_API_BASE_URL || "https://api.sikdae.com",
  clientId: requiredEnv("SIKDAE_CLIENT_ID"),
  clientSecret: requiredEnv("SIKDAE_CLIENT_SECRET"),
  kmsKeyId: requiredEnv("SIKDAE_KMS_KEY_ID"),
  oauthBaseUrl: requiredEnv("SIKDAE_OAUTH_BASE_URL"),
  password: requiredEnv("SIKDAE_PASSWORD"),
  signId: requiredEnv("SIKDAE_SIGN_ID"),
  timeoutMs: 10_000,
  xUserAgent: requiredEnv("SIKDAE_X_USER_AGENT"),
}));
