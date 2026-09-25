export interface HealthResponse {
  status: "ok" | "error";
  db: "connected" | "disconnected";
  timestamp: string;
}
