import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  apiKey: requireEnv("LITMOS_API_KEY"),
  baseUrl: requireEnv("LITMOS_BASE_URL"),
  source: process.env["LITMOS_SOURCE"] ?? "litmos-mcp",
};
