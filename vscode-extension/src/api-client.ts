import axios, { AxiosInstance } from "axios";

export interface CodeEvent {
  source: "completion" | "agent" | "manual";
  lines: number;
  file_path: string;
  language?: string;
  developer_id: string;
  type?: "code" | "test" | "documentation";
  test_framework?: string;
  coverage?: number;
  doc_type?: string;
  metadata?: Record<string, any>;
}

export class ApiClient {
  private client: AxiosInstance;
  private developerId: string;

  constructor(backendUrl: string, developerId: string) {
    this.developerId = developerId;
    this.client = axios.create({
      baseURL: backendUrl,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async sendCodeEvent(event: Omit<CodeEvent, "developer_id">): Promise<void> {
    try {
      const payload: CodeEvent = {
        ...event,
        developer_id: this.developerId,
      };

      await this.client.post("/api/events/code", payload);
      console.log(`[AI Metrics] Code event sent: ${event.source}, ${event.lines} lines`);
    } catch (error) {
      console.error("[AI Metrics] Failed to send code event:", error);
      // Don't throw - we don't want to interrupt the user's workflow
    }
  }

  async sendTestEvent(event: Omit<CodeEvent, "developer_id">): Promise<void> {
    try {
      const payload: CodeEvent = {
        ...event,
        developer_id: this.developerId,
      };

      await this.client.post("/api/events/test", payload);
      console.log(`[AI Metrics] Test event sent: ${event.source}, ${event.lines} lines`);
    } catch (error) {
      console.error("[AI Metrics] Failed to send test event:", error);
    }
  }

  async sendDocumentationEvent(
    event: Omit<CodeEvent, "developer_id">
  ): Promise<void> {
    try {
      const payload: CodeEvent = {
        ...event,
        developer_id: this.developerId,
      };

      await this.client.post("/api/events/documentation", payload);
      console.log(`[AI Metrics] Documentation event sent: ${event.source}, ${event.lines} lines`);
    } catch (error) {
      console.error("[AI Metrics] Failed to send documentation event:", error);
    }
  }
}

