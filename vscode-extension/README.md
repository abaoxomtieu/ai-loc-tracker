# AI LOC Tracker - VSCode Extension

VSCode extension to automatically track AI-augmented engineering metrics and Lines of Code (LOC) - completion, agent, and manual code.

## Features

- **Automatic Tracking**: Tracks manual typing and AI completions automatically
- **Smart Detection**: Automatically detects code, test, and documentation files
- **Metrics Dashboard**: View your metrics in a beautiful webview panel
- **Status Bar Integration**: Quick access via status bar item
- **Backend Integration**: Sends events to FastAPI backend in real-time

## Installation

### From VSIX File

1. **Build the extension:**
   ```bash
   cd vscode-extension
   npm install
   npm run build
   ```

2. **Install in VSCode/Cursor:**
   - Open Command Palette: `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Run: `Extensions: Install from VSIX...`
   - Select: `ai-loc-tracker-0.1.0.vsix`
   - Reload window: `Cmd+Shift+P` → `Developer: Reload Window`

### Development Mode

1. **Install dependencies:**
   ```bash
   cd vscode-extension
   npm install
   ```

2. **Compile TypeScript:**
   ```bash
   npm run compile
   ```

3. **Launch Extension Development Host:**
   - Press `F5` in VSCode
   - A new window will open with the extension loaded

## Configuration

Configure the extension in VSCode settings:

**Via Settings UI:**
- `Cmd+,` (macOS) or `Ctrl+,` (Windows/Linux)
- Search for: `aiCodeMetrics`

**Via Settings JSON:**
- `Cmd+Shift+P` → `Preferences: Open User Settings (JSON)`

```json
{
  "aiCodeMetrics.backendUrl": "http://localhost:8000",
  "aiCodeMetrics.developerId": "your-developer-id",
  "aiCodeMetrics.enabled": true
}
```

**Required Settings:**
- `developerId`: Your unique developer identifier (required)
- `backendUrl`: Backend API URL (default: `http://localhost:8000`)
- `enabled`: Enable/disable tracking (default: `true`)

## Usage

### Opening Metrics Dashboard

**3 ways to open:**

1. **Keyboard Shortcut:** `Cmd+Shift+M` (macOS) or `Ctrl+Shift+M` (Windows/Linux)
2. **Status Bar:** Click the `$(graph) AI LOC` icon in the bottom-right corner
3. **Command Palette:** `Cmd+Shift+P` → `AI LOC Tracker: Show Metrics`

### Customizing Keyboard Shortcut

1. `Cmd+Shift+P` → `Preferences: Open Keyboard Shortcuts`
2. Search for: `AI LOC Tracker: Show Metrics`
3. Click the pencil icon and set your preferred shortcut

## How It Works

### Manual Code Tracking

1. Extension listens to `onDidChangeTextDocument` events
2. Detects when you type code (without AI markers)
3. Debounces changes (1 second delay)
4. Sends event with `source: "manual"` to backend

### AI Completion Tracking

1. Extension intercepts inline completion items
2. Adds marker `/*__AI__*/` to completion text
3. When completion is accepted, detects the marker
4. Sends event with `source: "completion"` to backend

### File Type Detection

- **Test files**: Contains "test", "spec", `__tests__`, `__spec__`
- **Documentation**: `.md`, `.txt`, `.rst`, or in `docs/` folder
- **Code**: Everything else

## Verification

### Check Extension is Active

1. **Output Channel:**
   - `View → Output` → Select "AI LOC Tracker"
   - Should see: `✅ AI LOC Tracker activated`

2. **Status Bar:**
   - Look for `$(graph) AI LOC` icon in bottom-right corner

3. **Command Palette:**
   - `Cmd+Shift+P` → Type: `AI LOC Tracker: Show Metrics`
   - Should appear in results

### Test Tracking

1. **Open a code file** (e.g., `.py`, `.js`, `.ts`)
2. **Type some code** (at least a few lines)
3. **Wait 1-2 seconds** (debounce delay)
4. **Check Output Channel:**
   ```
   [DocumentTracker] Detected X lines added in /path/to/file
   [ApiClient] ✅ Code event sent successfully
   ```
5. **Check backend logs** for POST request to `/api/events/code`

## Troubleshooting

### Extension Not Activating

**Symptoms:**
- No "AI LOC Tracker" in Output dropdown
- Status bar item not showing
- Command not found

**Solutions:**
1. Reload window: `Cmd+Shift+P` → `Developer: Reload Window`
2. Check extension is enabled: `Cmd+Shift+X` → Find "AI LOC Tracker" → Enable
3. Check Output Channel for errors
4. Verify VSCode version >= 1.74.0

### Typing Not Tracked

**Quick Checklist:**
- [ ] `developerId` is set in settings
- [ ] `enabled` is `true`
- [ ] Backend is running at `backendUrl`
- [ ] DocumentTracker is registered (check Output Channel)

**Debug Steps:**
1. **Check Output Channel:**
   - Should see: `[DocumentTracker] ✅ Document change listener registered`
   - If missing: Extension returned early (check `developerId`)

2. **Check Backend:**
   ```bash
   curl http://localhost:8000/api/metrics/health
   ```

3. **Test Typing:**
   - Type in a code file
   - Wait 2 seconds
   - Check Output Channel for: `[DocumentTracker] Detected X lines...`

### API Calls Failing

**Check Output Channel for errors:**
```
[ApiClient] ❌ Failed to send code event: ...
```

**Common errors:**
- `ECONNREFUSED` → Backend not running
- `HTTP 404` → Wrong endpoint URL
- `HTTP 500` → Backend error (check backend logs)

**Solutions:**
1. Verify backend is running: `curl http://localhost:8000/api/metrics/health`
2. Check `backendUrl` in settings matches backend address
3. Check backend logs for errors

### Keyboard Shortcut Not Working

**Solutions:**
1. Reload window: `Cmd+Shift+P` → `Developer: Reload Window`
2. Check for conflicts: `Preferences: Open Keyboard Shortcuts` → Search for `Cmd+Shift+M`
3. Verify extension is active (check Output Channel)

## Development

### Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts          # Main entry point
│   ├── document-tracker.ts   # Manual code tracking
│   ├── completion-tracker.ts # AI completion tracking
│   ├── api-client.ts         # Backend API client
│   └── metrics-view.ts       # Metrics dashboard UI
├── out/                      # Compiled JavaScript
├── package.json              # Extension manifest
└── tsconfig.json             # TypeScript config
```

### Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package

# Build and package in one command
npm run build
```

### Testing

1. Press `F5` to launch extension development host
2. Configure settings in the new window
3. Test typing and completion tracking
4. Check Output Channel for logs

## API Reference

The extension sends events to the backend API:

- `POST /api/events/code` - Code insertion events
- `POST /api/events/test` - Test generation events
- `POST /api/events/documentation` - Documentation events

Event format:
```json
{
  "source": "manual" | "completion",
  "lines": 10,
  "file_path": "/path/to/file",
  "language": "python",
  "developer_id": "dev1"
}
```

## Requirements

- VSCode >= 1.74.0
- Node.js >= 16.0.0 (for development)
- Backend API running (for tracking)

## License

MIT
