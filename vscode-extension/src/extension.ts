import * as vscode from "vscode";
import { CompletionTracker } from "./completion-tracker";
import { DocumentTracker } from "./document-tracker";
import { ApiClient } from "./api-client";
import { MetricsView } from "./metrics-view";

let completionTracker: CompletionTracker;
let documentTracker: DocumentTracker;
let apiClient: ApiClient;
let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  // Create output channel IMMEDIATELY - before anything else
  // This ensures it appears in the Output dropdown even if activation fails
  outputChannel = vscode.window.createOutputChannel("AI LOC Tracker");
  context.subscriptions.push(outputChannel);

  try {
    outputChannel.appendLine("=".repeat(50));
    outputChannel.appendLine("AI LOC Tracker extension is activating...");
    outputChannel.appendLine("=".repeat(50));

    // Set context for MetricsView FIRST (before any checks)
    MetricsView.setContext(context);

    // Register command to show metrics EARLY (so it's always available)
    // This MUST be done before any return statements
    const showMetricsCommand = vscode.commands.registerCommand(
      "aiLocTracker.showMetrics",
      () => {
        try {
          // Get current config (may have changed)
          const config = vscode.workspace.getConfiguration("aiCodeMetrics");
          const backendUrl = config.get<string>(
            "backendUrl",
            "http://localhost:8000"
          );
          const developerId = config.get<string>("developerId", "");
          const enabled = config.get<boolean>("enabled", true);

          if (!enabled) {
            vscode.window.showWarningMessage(
              "AI LOC Tracker is disabled. Enable it in settings."
            );
            return;
          }

          if (!developerId) {
            vscode.window
              .showWarningMessage(
                "AI LOC Tracker: Developer ID not set. Please configure 'aiCodeMetrics.developerId' in settings.",
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

          // Initialize API client if not already done
          if (!apiClient) {
            apiClient = new ApiClient(backendUrl, developerId, outputChannel);
          }

          MetricsView.createOrShow(apiClient, outputChannel);
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(`Error opening metrics: ${errorMsg}`);
          if (outputChannel) {
            outputChannel.appendLine(
              `[ERROR] Failed to show metrics: ${errorMsg}`
            );
            outputChannel.show();
          }
        }
      }
    );
    context.subscriptions.push(showMetricsCommand);
    outputChannel.appendLine(
      "✅ Command 'aiLocTracker.showMetrics' registered"
    );

    // Create status bar item (always show, even if not fully configured)
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = "aiLocTracker.showMetrics";
    statusBarItem.text = "$(graph) AI LOC";
    statusBarItem.tooltip = "Show AI LOC Tracker Metrics";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Get configuration
    const config = vscode.workspace.getConfiguration("aiCodeMetrics");
    const backendUrl = config.get<string>(
      "backendUrl",
      "http://localhost:8000"
    );
    const developerId = config.get<string>("developerId", "");
    const enabled = config.get<boolean>("enabled", true);

    outputChannel.appendLine(`Configuration:`);
    outputChannel.appendLine(`  - Enabled: ${enabled}`);
    outputChannel.appendLine(`  - Backend URL: ${backendUrl}`);
    outputChannel.appendLine(`  - Developer ID: ${developerId || "(not set)"}`);

    if (!enabled) {
      outputChannel.appendLine("AI Code Metrics tracking is disabled");
      outputChannel.appendLine(
        "⚠️ Extension loaded but tracking is disabled. You can still view metrics."
      );
      return;
    }

    if (!developerId) {
      outputChannel.appendLine("ERROR: Developer ID not set!");
      outputChannel.appendLine(
        "⚠️ Extension loaded but Developer ID not configured. Click status bar to configure."
      );
      outputChannel.show();
      vscode.window
        .showWarningMessage(
          "AI LOC Tracker: Developer ID not set. Please configure 'aiCodeMetrics.developerId' in settings.",
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
    apiClient = new ApiClient(backendUrl, developerId, outputChannel);

    // Initialize trackers
    completionTracker = new CompletionTracker(apiClient, outputChannel);
    documentTracker = new DocumentTracker(apiClient, outputChannel);

    // Register trackers
    const completionDisposable = completionTracker.register();
    const documentDisposable = documentTracker.register();

    context.subscriptions.push(completionDisposable);
    context.subscriptions.push(documentDisposable);
    // Note: outputChannel already added to subscriptions at the beginning

    outputChannel.appendLine(
      `✅ AI LOC Tracker activated for developer: ${developerId}`
    );
    outputChannel.appendLine(`✅ Backend URL: ${backendUrl}`);
    outputChannel.appendLine("✅ Ready to track code changes!");

    vscode.window.showInformationMessage(
      `AI LOC Tracker activated for developer: ${developerId}`
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[AI LOC Tracker] Activation error:", errorMsg);
    if (outputChannel) {
      outputChannel.appendLine(
        `[ERROR] Extension activation failed: ${errorMsg}`
      );
      outputChannel.appendLine(
        "Stack trace: " + (error instanceof Error ? error.stack : "N/A")
      );
      outputChannel.show(); // Force show on error
    }
    vscode.window.showErrorMessage(
      `AI LOC Tracker activation failed: ${errorMsg}`
    );
  } finally {
    // Ensure output channel is always visible in dropdown
    // Even if there was an error, the channel should exist
    if (outputChannel) {
      outputChannel.appendLine(
        "Extension activation completed (with or without errors)"
      );
    }
  }
}

export function deactivate() {
  if (completionTracker) {
    completionTracker.dispose();
  }
  if (documentTracker) {
    documentTracker.dispose();
  }
}
