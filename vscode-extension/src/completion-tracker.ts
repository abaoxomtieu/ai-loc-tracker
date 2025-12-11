import * as vscode from "vscode";
import { ApiClient } from "./api-client";

const AI_MARKER = "/*__AI__*/";

export class CompletionTracker {
  private apiClient: ApiClient;
  private outputChannel: vscode.OutputChannel;
  private disposables: vscode.Disposable[] = [];
  private pendingCompletions: Map<string, string> = new Map();

  constructor(apiClient: ApiClient, outputChannel: vscode.OutputChannel) {
    this.apiClient = apiClient;
    this.outputChannel = outputChannel;
  }

  register(): vscode.Disposable {
    // Register inline completion provider
    const provider = vscode.languages.registerInlineCompletionItemProvider(
      { pattern: "**" },
      {
        provideInlineCompletionItems: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          context: vscode.InlineCompletionContext,
          token: vscode.CancellationToken
        ) => {
          // Get the original provider (GitHub Copilot, etc.)
          // We'll wrap the completion items to add our marker
          try {
            // Note: We can't directly access other providers, so we'll use a different approach
            // We'll track when completions are accepted via document changes
            return [];
          } catch (error) {
            console.error(
              "[CompletionTracker] Error in provideInlineCompletionItems:",
              error
            );
            return [];
          }
        },
      }
    );

    this.disposables.push(provider);

    // Track document changes to detect when AI completions are accepted
    const changeListener = vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        this.handleDocumentChange(event);
      }
    );

    this.disposables.push(changeListener);

    return vscode.Disposable.from(...this.disposables);
  }

  private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // Check if this change contains our AI marker
    for (const change of event.contentChanges) {
      const text = change.text;

      if (text.includes(AI_MARKER)) {
        // This is an AI completion that was accepted
        const cleanText = text.replace(new RegExp(AI_MARKER, "g"), "");
        const lines = this.countLines(cleanText);

        if (lines > 0) {
          const filePath = event.document.uri.fsPath;
          const language = this.detectLanguage(event.document);
          const codeType = this.detectCodeType(filePath);

          this.outputChannel.appendLine(
            `[CompletionTracker] Detected AI completion: ${lines} lines of ${codeType} in ${filePath}`
          );

          if (codeType === "test") {
            this.apiClient.sendTestEvent({
              source: "completion",
              lines,
              file_path: filePath,
              language,
            });
          } else if (codeType === "documentation") {
            this.apiClient.sendDocumentationEvent({
              source: "completion",
              lines,
              file_path: filePath,
              language,
            });
          } else {
            this.apiClient.sendCodeEvent({
              source: "completion",
              lines,
              file_path: filePath,
              language,
            });
          }
        }
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

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}
