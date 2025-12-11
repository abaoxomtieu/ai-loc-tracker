import * as vscode from "vscode";

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
  private developerId: string;
  private backendUrl: string;
  private outputChannel: vscode.OutputChannel;

  constructor(backendUrl: string, developerId: string, outputChannel: vscode.OutputChannel) {
    this.developerId = developerId;
    this.backendUrl = backendUrl;
    this.outputChannel = outputChannel;
    
    this.outputChannel.appendLine(`[ApiClient] Initialized with backend: ${backendUrl}`);
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<Response> {
    const url = `${this.backendUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getBackendUrl(): string {
    return this.backendUrl;
  }

  getDeveloperId(): string {
    return this.developerId;
  }

  async sendCodeEvent(event: Omit<CodeEvent, "developer_id">): Promise<void> {
    try {
      const payload: CodeEvent = {
        ...event,
        developer_id: this.developerId,
      };

      this.outputChannel.appendLine(`[ApiClient] Sending code event: ${event.source}, ${event.lines} lines, file: ${event.file_path}`);
      const response = await this.makeRequest("POST", "/api/events/code", payload);
      
      if (response.ok) {
        this.outputChannel.appendLine(`[ApiClient] ✅ Code event sent successfully (status: ${response.status})`);
      } else {
        const errorText = await response.text().catch(() => "No details");
        this.outputChannel.appendLine(`[ApiClient] ❌ Failed to send code event: HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.outputChannel.appendLine(`[ApiClient] ❌ Failed to send code event: ${errorMessage}`);
      this.outputChannel.appendLine(`[ApiClient] Payload was: ${JSON.stringify(event, null, 2)}`);
    }
  }

  async sendTestEvent(event: Omit<CodeEvent, "developer_id">): Promise<void> {
    try {
      const payload: CodeEvent = {
        ...event,
        developer_id: this.developerId,
      };

      this.outputChannel.appendLine(`[ApiClient] Sending test event: ${event.source}, ${event.lines} lines, file: ${event.file_path}`);
      const response = await this.makeRequest("POST", "/api/events/test", payload);
      
      if (response.ok) {
        this.outputChannel.appendLine(`[ApiClient] ✅ Test event sent successfully (status: ${response.status})`);
      } else {
        const errorText = await response.text().catch(() => "No details");
        this.outputChannel.appendLine(`[ApiClient] ❌ Failed to send test event: HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.outputChannel.appendLine(`[ApiClient] ❌ Failed to send test event: ${errorMessage}`);
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

      this.outputChannel.appendLine(`[ApiClient] Sending documentation event: ${event.source}, ${event.lines} lines, file: ${event.file_path}`);
      const response = await this.makeRequest("POST", "/api/events/documentation", payload);
      
      if (response.ok) {
        this.outputChannel.appendLine(`[ApiClient] ✅ Documentation event sent successfully (status: ${response.status})`);
      } else {
        const errorText = await response.text().catch(() => "No details");
        this.outputChannel.appendLine(`[ApiClient] ❌ Failed to send documentation event: HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.outputChannel.appendLine(`[ApiClient] ❌ Failed to send documentation event: ${errorMessage}`);
    }
  }
}

