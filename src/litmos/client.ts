import axios, { AxiosInstance } from "axios";

export class LitmosClient {
  readonly http: AxiosInstance;

  constructor(apiKey: string, baseUrl: string, source = "litmos-mcp") {
    const normalized = baseUrl.replace(/\/$/, "");
    const apiBase = normalized.endsWith("/v1.svc")
      ? normalized
      : `${normalized}/v1.svc`;

    this.http = axios.create({
      baseURL: apiBase,
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: { source, format: "json" },
    });

    this.http.interceptors.response.use(
      (r) => r,
      (error) => {
        const status = error.response?.status as number | undefined;
        const data = error.response?.data as { Message?: string } | string | undefined;
        const message =
          typeof data === "string"
            ? data
            : data?.Message ?? error.message;

        if (status === 401 || status === 403) {
          throw new Error("Authentication failed. Check your LITMOS_API_KEY.");
        }
        if (status === 404) {
          throw new Error("Resource not found.");
        }
        if (status === 503) {
          throw new Error(
            "Litmos rate limit exceeded (100 req/min). Please wait and retry."
          );
        }
        if (status === 400) {
          throw new Error(`Bad request: ${message}`);
        }
        throw new Error(`Litmos API error (HTTP ${status ?? "unknown"}): ${message}`);
      }
    );
  }
}
