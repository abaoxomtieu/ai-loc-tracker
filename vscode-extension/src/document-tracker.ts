import * as vscode from "vscode";
import { ApiClient } from "./api-client";

const AI_MARKER = "/*__AI__*/";

export class DocumentTracker {
  private apiClient: ApiClient;
  private outputChannel: vscode.OutputChannel;
  private disposables: vscode.Disposable[] = [];
  private lastChangeTime: Map<string, number> = new Map();
  private debounceDelay = 1000; // 1 second debounce
  private pendingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(apiClient: ApiClient, outputChannel: vscode.OutputChannel) {
    this.apiClient = apiClient;
    this.outputChannel = outputChannel;
  }

  register(): vscode.Disposable {
    this.outputChannel.appendLine("[DocumentTracker] Registering document change listener...");
    
    const changeListener = vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        // Only track if document is not in output or other special views
        if (event.document.uri.scheme === "file" || event.document.uri.scheme === "untitled") {
          this.handleDocumentChange(event);
        }
      }
    );

    this.disposables.push(changeListener);
    this.outputChannel.appendLine("[DocumentTracker] ✅ Document change listener registered");

    return vscode.Disposable.from(...this.disposables);
  }

  private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    const filePath = event.document.uri.fsPath;
    
    // Skip if no changes
    if (event.contentChanges.length === 0) {
      return;
    }

    // Cancel any pending timeout for this file
    const existingTimeout = this.pendingTimeouts.get(filePath);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.pendingTimeouts.delete(filePath);
    }

    // Process each content change
    let totalLines = 0;
    let hasValidChange = false;

    for (const change of event.contentChanges) {
      const text = change.text;
      
      // Skip if empty or only whitespace
      if (!text || !text.trim()) {
        continue;
      }

      // Check if this is AI-generated code (has marker)
      const isAI = text.includes(AI_MARKER);
      
      // Skip AI completions (handled by CompletionTracker)
      if (isAI) {
        this.outputChannel.appendLine(`[DocumentTracker] Skipping AI completion in ${filePath}`);
        continue;
      }

      // This is manual code
      const lines = this.countLines(text);
      if (lines > 0) {
        totalLines += lines;
        hasValidChange = true;
        this.outputChannel.appendLine(`[DocumentTracker] Detected ${lines} lines added in ${filePath}`);
      }
    }

    if (!hasValidChange || totalLines === 0) {
      return;
    }

        const language = this.detectLanguage(event.document);
        const codeType = this.detectCodeType(filePath);

    this.outputChannel.appendLine(`[DocumentTracker] Detected ${totalLines} lines of manual ${codeType} code in ${filePath} (language: ${language})`);

        // Use setTimeout to debounce and batch changes
    const timeout = setTimeout(() => {
      this.pendingTimeouts.delete(filePath);
      
          if (codeType === "test") {
            this.apiClient.sendTestEvent({
              source: "manual",
          lines: totalLines,
              file_path: filePath,
              language,
            });
          } else if (codeType === "documentation") {
            this.apiClient.sendDocumentationEvent({
              source: "manual",
          lines: totalLines,
              file_path: filePath,
              language,
              doc_type: this.detectDocType(filePath),
            });
          } else {
            this.apiClient.sendCodeEvent({
              source: "manual",
          lines: totalLines,
              file_path: filePath,
              language,
            });
          }
        }, this.debounceDelay);

    this.pendingTimeouts.set(filePath, timeout);
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
    // Clear all pending timeouts
    this.pendingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.pendingTimeouts.clear();
    
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}

