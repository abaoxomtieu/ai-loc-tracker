# AI LOC Tracker - VSCode Extension

VSCode extension to track AI-augmented engineering metrics and Lines of Code (LOC).

## Features

- **Completion Tracking**: Detects when AI inline completions are accepted
- **Manual Code Tracking**: Tracks manually written code
- **Automatic Detection**: Automatically detects code, test, and documentation files
- **Backend Integration**: Sends events to FastAPI backend

## Installation

### Development

1. Install dependencies:

```bash
cd vscode-extension
npm install
```

2. Compile TypeScript:

```bash
npm run compile
```

3. Press F5 in VSCode to launch extension development host

### Production

1. Install dependencies (if not already done):

```bash
cd vscode-extension
npm install
```

2. Build and package extension:

```bash
# Option 1: Build and package in one command
npm run build

# Option 2: Package only (assumes already compiled)
npm run package
```

This will create a `.vsix` file in the `vscode-extension` directory (e.g., `ai-loc-tracker-0.1.0.vsix`).

3. Install the `.vsix` file in VSCode:
   - Open Command Palette (Cmd+Shift+P or Ctrl+Shift+P)
   - Run "Extensions: Install from VSIX..."
   - Select the generated `.vsix` file
   - Restart VSCode if needed

## Configuration

Configure in VSCode settings:

```json
{
  "aiCodeMetrics.backendUrl": "http://localhost:8000",
  "aiCodeMetrics.developerId": "your-developer-id",
  "aiCodeMetrics.enabled": true
}
```

## How It Works

### Completion Type (AI Inline Completion)

1. Extension intercepts inline completion items
2. Adds marker `/*__AI__*/` to completion text
3. When completion is accepted, `onDidChangeTextDocument` detects the marker
4. Sends event with `source: "completion"` to backend

### Manual Type

1. `onDidChangeTextDocument` detects document changes
2. If change doesn't contain AI marker → manual code
3. Sends event with `source: "manual"` to backend

### Agent Type

- Handled by MCP Server (separate component)
- Agent calls MCP tool when completing features

## File Type Detection

- **Test files**: Contains "test", "spec", "**tests**", "**spec**"
- **Documentation**: `.md`, `.txt`, `.rst`, or in `docs/` folder
- **Code**: Everything else

## Troubleshooting

1. Check Developer Console: View → Output → Select "AI Code Metrics Tracker"
2. Verify backend is running: `curl http://localhost:8000/api/metrics/health`
3. Check configuration: Ensure `developerId` is set
