import * as vscode from "vscode";
import { ApiClient } from "./api-client";

const AI_MARKER = "/*__AI__*/";

export class DocumentTracker {
  private apiClient: ApiClient;
  private disposables: vscode.Disposable[] = [];
  private lastChangeTime: Map<string, number> = new Map();
  private debounceDelay = 1000; // 1 second debounce

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  register(): vscode.Disposable {
    const changeListener = vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        this.handleDocumentChange(event);
      }
    );

    this.disposables.push(changeListener);

    return vscode.Disposable.from(...this.disposables);
  }

  private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    const filePath = event.document.uri.fsPath;
    const now = Date.now();
    
    // Debounce: only process if enough time has passed since last change
    const lastChange = this.lastChangeTime.get(filePath) || 0;
    if (now - lastChange < this.debounceDelay) {
      return;
    }
    this.lastChangeTime.set(filePath, now);

    // Process each content change
    for (const change of event.contentChanges) {
      const text = change.text;
      
      // Skip if empty or only whitespace
      if (!text.trim()) {
        continue;
      }

      // Check if this is AI-generated code (has marker)
      const isAI = text.includes(AI_MARKER);
      
      // Skip AI completions (handled by CompletionTracker)
      if (isAI) {
        continue;
      }

      // This is manual code
      const lines = this.countLines(text);
      
      if (lines > 0) {
        const language = this.detectLanguage(event.document);
        const codeType = this.detectCodeType(filePath);

        // Use setTimeout to debounce and batch changes
        setTimeout(() => {
          if (codeType === "test") {
            this.apiClient.sendTestEvent({
              source: "manual",
              lines,
              file_path: filePath,
              language,
            });
          } else if (codeType === "documentation") {
            this.apiClient.sendDocumentationEvent({
              source: "manual",
              lines,
              file_path: filePath,
              language,
              doc_type: this.detectDocType(filePath),
            });
          } else {
            this.apiClient.sendCodeEvent({
              source: "manual",
              lines,
              file_path: filePath,
              language,
            });
          }
        }, this.debounceDelay);
      }
    }
  }

  private countLines(text: string): number {
    return text.split("\n").filter((line) => line.trim().length > 0).length;
  }

  private detectLanguage(document: vscode.TextDocument): string {
    return document.languageId || "unknown";
  }

  private detectCodeType(filePath: string): "code" | "test" | "documentation" {
    const lowerPath = filePath.toLowerCase();
    
    // Detect test files
    if (
      lowerPath.includes("test") ||
      lowerPath.includes("spec") ||
      lowerPath.includes("__tests__") ||
      lowerPath.includes("__spec__")
    ) {
      return "test";
    }
    
    // Detect documentation files
    if (
      lowerPath.endsWith(".md") ||
      lowerPath.endsWith(".txt") ||
      lowerPath.endsWith(".rst") ||
      lowerPath.includes("docs/")
    ) {
      return "documentation";
    }
    
    return "code";
  }

  private detectDocType(filePath: string): string {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.endsWith(".md")) {
      if (lowerPath.includes("readme")) {
        return "readme";
      }
      return "markdown";
    }
    
    if (lowerPath.endsWith(".txt")) {
      return "text";
    }
    
    if (lowerPath.includes("api")) {
      return "api-doc";
    }
    
    return "comment";
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}

