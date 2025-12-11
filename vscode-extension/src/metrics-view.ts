import * as vscode from "vscode";
import { ApiClient } from "./api-client";

export class MetricsView {
  private static currentPanel: vscode.WebviewPanel | undefined = undefined;
  private static context: vscode.ExtensionContext;
  private apiClient: ApiClient;
  private outputChannel: vscode.OutputChannel;

  constructor(apiClient: ApiClient, outputChannel: vscode.OutputChannel) {
    this.apiClient = apiClient;
    this.outputChannel = outputChannel;
  }

  static setContext(context: vscode.ExtensionContext) {
    MetricsView.context = context;
  }

  static createOrShow(apiClient: ApiClient, outputChannel: vscode.OutputChannel) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (MetricsView.currentPanel) {
      MetricsView.currentPanel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      "aiLocTrackerMetrics",
      "AI LOC Tracker - Metrics",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    MetricsView.currentPanel = panel;
    const view = new MetricsView(apiClient, outputChannel);
    view.updateWebview(panel.webview);

    // Handle panel disposal
    panel.onDidDispose(
      () => {
        MetricsView.currentPanel = undefined;
      },
      null,
      MetricsView.context.subscriptions
    );

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "refresh":
            view.updateWebview(panel.webview);
            break;
          case "getMetrics":
            await view.fetchAndUpdateMetrics(panel.webview);
            break;
        }
      },
      null,
      MetricsView.context.subscriptions
    );

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      if (panel.visible) {
        view.fetchAndUpdateMetrics(panel.webview);
      }
    }, 5000);

    panel.onDidDispose(() => {
      clearInterval(interval);
    });
  }

  private async fetchMetrics() {
    try {
      const backendUrl = this.apiClient.getBackendUrl();
      const developerId = this.apiClient.getDeveloperId();

      // Fetch developer metrics
      const devResponse = await fetch(`${backendUrl}/api/metrics/developer/${developerId}`);
      const devMetrics = devResponse.ok ? await devResponse.json() : null;

      // Fetch team metrics
      const teamResponse = await fetch(`${backendUrl}/api/metrics/team`);
      const teamMetrics = teamResponse.ok ? await teamResponse.json() : null;

      return {
        developer: devMetrics,
        team: teamMetrics,
        error: null,
      };
    } catch (error) {
      this.outputChannel.appendLine(`[MetricsView] Error fetching metrics: ${error}`);
      return {
        developer: null,
        team: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async fetchAndUpdateMetrics(webview: vscode.Webview) {
    const metrics = await this.fetchMetrics();
    webview.postMessage({
      command: "updateMetrics",
      metrics: metrics,
    });
  }

  private updateWebview(webview: vscode.Webview) {
    webview.html = this.getWebviewContent(webview);
    // Fetch metrics after a short delay
    setTimeout(() => {
      this.fetchAndUpdateMetrics(webview);
    }, 500);
  }

  private getWebviewContent(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI LOC Tracker - Metrics</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--vscode-panel-border);
        }
        
        h1 {
            color: var(--vscode-textLink-foreground);
            font-size: 24px;
        }
        
        .refresh-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .refresh-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .refresh-btn:active {
            transform: scale(0.98);
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
        
        .error {
            background: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border-left: 4px solid var(--vscode-inputValidation-errorBorder);
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .metric-card h3 {
            color: var(--vscode-textLink-foreground);
            margin-bottom: 15px;
            font-size: 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        
        .metric-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .metric-item:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            color: var(--vscode-descriptionForeground);
        }
        
        .metric-value {
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
        }
        
        .metric-value.good {
            color: #4caf50;
        }
        
        .metric-value.warning {
            color: #ff9800;
        }
        
        .metric-value.bad {
            color: #f44336;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h2 {
            color: var(--vscode-textLink-foreground);
            margin-bottom: 20px;
            font-size: 20px;
        }
        
        .leaderboard {
            background: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
        }
        
        .leaderboard-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            margin-bottom: 8px;
            background: var(--vscode-list-hoverBackground);
            border-radius: 4px;
        }
        
        .leaderboard-item:last-child {
            margin-bottom: 0;
        }
        
        .rank {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            margin-right: 10px;
        }
        
        .timestamp {
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            margin-top: 10px;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 AI LOC Tracker - Metrics Dashboard</h1>
            <button class="refresh-btn" onclick="refreshMetrics()">🔄 Refresh</button>
        </div>
        
        <div id="loading" class="loading">Loading metrics...</div>
        <div id="error" class="error" style="display: none;"></div>
        
        <div id="content" style="display: none;">
            <div class="section">
                <h2>👤 Your Metrics</h2>
                <div class="metrics-grid" id="developerMetrics"></div>
            </div>
            
            <div class="section">
                <h2>👥 Team Metrics</h2>
                <div class="metrics-grid" id="teamMetrics"></div>
            </div>
            
            <div class="section">
                <h2>🏆 Leaderboard</h2>
                <div class="leaderboard" id="leaderboard"></div>
            </div>
            
            <div class="timestamp" id="timestamp"></div>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function refreshMetrics() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('content').style.display = 'none';
            document.getElementById('error').style.display = 'none';
            vscode.postMessage({ command: 'getMetrics' });
        }
        
        function formatNumber(num) {
            if (num === null || num === undefined) return 'N/A';
            return typeof num === 'number' ? num.toLocaleString() : num;
        }
        
        function formatPercent(num) {
            if (num === null || num === undefined) return 'N/A';
            return typeof num === 'number' ? num.toFixed(2) + '%' : num;
        }
        
        function getStatusClass(value, target, reverse = false) {
            if (value === null || value === undefined || target === null || target === undefined) return '';
            const diff = reverse ? target - value : value - target;
            if (Math.abs(diff) < 5) return 'good';
            if (diff > 0) return reverse ? 'bad' : 'warning';
            return reverse ? 'warning' : 'bad';
        }
        
        function renderDeveloperMetrics(metrics) {
            if (!metrics || !metrics.code_metrics) {
                document.getElementById('developerMetrics').innerHTML = '<p>No metrics available</p>';
                return;
            }
            
            const cm = metrics.code_metrics;
            const tm = metrics.test_metrics || {};
            const dm = metrics.doc_metrics || {};
            
            const html = \`
                <div class="metric-card">
                    <h3>📝 Code Metrics</h3>
                    <div class="metric-item">
                        <span class="metric-label">Total LOC</span>
                        <span class="metric-value">\${formatNumber(cm.total_lines)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">AI LOC</span>
                        <span class="metric-value">\${formatNumber(cm.ai_lines)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Manual LOC</span>
                        <span class="metric-value">\${formatNumber(cm.manual_lines)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">AI Percentage</span>
                        <span class="metric-value \${getStatusClass(cm.ai_percentage, 15)}">\${formatPercent(cm.ai_percentage)}</span>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h3>🧪 Test Metrics</h3>
                    <div class="metric-item">
                        <span class="metric-label">Total Test LOC</span>
                        <span class="metric-value">\${formatNumber(tm.total_lines || 0)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">AI Test LOC</span>
                        <span class="metric-value">\${formatNumber(tm.ai_lines || 0)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">AI Test %</span>
                        <span class="metric-value">\${formatPercent(tm.ai_percentage || 0)}</span>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h3>📚 Documentation</h3>
                    <div class="metric-item">
                        <span class="metric-label">Total Doc LOC</span>
                        <span class="metric-value">\${formatNumber(dm.total_lines || 0)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">AI Doc LOC</span>
                        <span class="metric-value">\${formatNumber(dm.ai_lines || 0)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">AI Doc %</span>
                        <span class="metric-value">\${formatPercent(dm.ai_percentage || 0)}</span>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h3>🎯 Status</h3>
                    <div class="metric-item">
                        <span class="metric-label">AI LOC Status</span>
                        <span class="metric-value \${metrics.status?.ai_loc_status || ''}">\${metrics.status?.ai_loc_status || 'N/A'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Overall Score</span>
                        <span class="metric-value">\${formatNumber(metrics.overall_score)}</span>
                    </div>
                </div>
            \`;
            
            document.getElementById('developerMetrics').innerHTML = html;
        }
        
        function renderTeamMetrics(metrics) {
            if (!metrics || !metrics.code_metrics) {
                document.getElementById('teamMetrics').innerHTML = '<p>No team metrics available</p>';
                return;
            }
            
            const cm = metrics.code_metrics;
            const html = \`
                <div class="metric-card">
                    <h3>👥 Team Code Metrics</h3>
                    <div class="metric-item">
                        <span class="metric-label">Total Team LOC</span>
                        <span class="metric-value">\${formatNumber(cm.total_lines)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Team AI LOC</span>
                        <span class="metric-value">\${formatNumber(cm.ai_lines)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Team AI %</span>
                        <span class="metric-value">\${formatPercent(cm.ai_percentage)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Active Developers</span>
                        <span class="metric-value">\${formatNumber(metrics.developer_count || 0)}</span>
                    </div>
                </div>
            \`;
            
            document.getElementById('teamMetrics').innerHTML = html;
        }
        
        function renderLeaderboard(leaderboard) {
            if (!leaderboard || leaderboard.length === 0) {
                document.getElementById('leaderboard').innerHTML = '<p>No leaderboard data available</p>';
                return;
            }
            
            const html = leaderboard.map((dev, index) => \`
                <div class="leaderboard-item">
                    <div>
                        <span class="rank">#\${index + 1}</span>
                        <strong>\${dev.developer_id}</strong>
                    </div>
                    <div>
                        <span class="metric-value">\${formatNumber(dev.total_loc)} LOC</span>
                        <span style="margin-left: 10px; color: var(--vscode-descriptionForeground);">
                            (\${formatPercent(dev.ai_loc_percentage)} AI)
                        </span>
                    </div>
                </div>
            \`).join('');
            
            document.getElementById('leaderboard').innerHTML = html;
        }
        
        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'updateMetrics') {
                document.getElementById('loading').style.display = 'none';
                
                if (message.metrics.error) {
                    document.getElementById('error').textContent = 'Error: ' + message.metrics.error;
                    document.getElementById('error').style.display = 'block';
                    return;
                }
                
                document.getElementById('content').style.display = 'block';
                
                if (message.metrics.developer) {
                    renderDeveloperMetrics(message.metrics.developer);
                }
                
                if (message.metrics.team) {
                    renderTeamMetrics(message.metrics.team);
                    if (message.metrics.team.leaderboard) {
                        renderLeaderboard(message.metrics.team.leaderboard);
                    }
                }
                
                document.getElementById('timestamp').textContent = 
                    'Last updated: ' + new Date().toLocaleString();
            }
        });
        
        // Initial load
        refreshMetrics();
    </script>
</body>
</html>`;
  }
}



