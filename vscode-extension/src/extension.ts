import * as vscode from "vscode";
import { CompletionTracker } from "./completion-tracker";
import { DocumentTracker } from "./document-tracker";
import { ApiClient } from "./api-client";

let completionTracker: CompletionTracker;
let documentTracker: DocumentTracker;
let apiClient: ApiClient;

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Code Metrics Tracker extension is now active");

  // Get configuration
  const config = vscode.workspace.getConfiguration("aiCodeMetrics");
  const backendUrl = config.get<string>("backendUrl", "http://localhost:8000");
  const developerId = config.get<string>("developerId", "");
  const enabled = config.get<boolean>("enabled", true);

  if (!enabled) {
    console.log("AI Code Metrics tracking is disabled");
    return;
  }

  if (!developerId) {
    vscode.window
      .showWarningMessage(
        "AI Code Metrics: Developer ID not set. Please configure 'aiCodeMetrics.developerId' in settings.",
        "Open Settings"
      )
      .then((selection: string | undefined) => {
        if (selection === "Open Settings") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "aiCodeMetrics.developerId"
          );
        }
      });
    return;
  }

  // Initialize API client
  apiClient = new ApiClient(backendUrl, developerId);

  // Initialize trackers
  completionTracker = new CompletionTracker(apiClient);
  documentTracker = new DocumentTracker(apiClient);

  // Register trackers
  const completionDisposable = completionTracker.register();
  const documentDisposable = documentTracker.register();

  context.subscriptions.push(completionDisposable);
  context.subscriptions.push(documentDisposable);

  vscode.window.showInformationMessage(
    `AI Code Metrics Tracker activated for developer: ${developerId}`
  );
}

export function deactivate() {
  if (completionTracker) {
    completionTracker.dispose();
  }
  if (documentTracker) {
    documentTracker.dispose();
  }
}
