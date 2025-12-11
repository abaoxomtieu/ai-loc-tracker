# Troubleshooting: Why typing is not tracked

## Quick Checklist

- [ ] **Developer ID is set** in settings (`aiCodeMetrics.developerId`)
- [ ] **Extension is enabled** (`aiCodeMetrics.enabled` = true)
- [ ] **Backend is running** at `http://localhost:8000`
- [ ] **DocumentTracker is registered** (check Output Channel)
- [ ] **You're typing in a file** (not in Output/terminal)

## Step-by-Step Debugging

### Step 1: Check Extension Configuration

1. **Open Settings:**
   - `Cmd + Shift + P` → `Preferences: Open User Settings (JSON)`

2. **Verify settings:**
   ```json
   {
     "aiCodeMetrics.backendUrl": "http://localhost:8000",
     "aiCodeMetrics.developerId": "your-developer-id",
     "aiCodeMetrics.enabled": true
   }
   ```

3. **If missing, add them and reload window**

### Step 2: Check Output Channel

1. **Open Output Panel:**
   - `View → Output` (or `Cmd + Shift + U`)

2. **Select "AI LOC Tracker" from dropdown**

3. **Look for these messages:**
   ```
   ✅ Command 'aiLocTracker.showMetrics' registered
   [DocumentTracker] Registering document change listener...
   [DocumentTracker] ✅ Document change listener registered
   [Extension] ✅ Trackers registered successfully
   ```

4. **If you see:**
   - `ERROR: Developer ID not set!` → Set `developerId` in settings
   - `AI Code Metrics tracking is disabled` → Set `enabled: true`
   - No `[DocumentTracker]` messages → Trackers not registered

### Step 3: Test Typing Tracking

1. **Open a code file** (e.g., `.py`, `.js`, `.ts`)

2. **Type some code** (at least a few lines)

3. **Wait 1-2 seconds** (debounce delay)

4. **Check Output Channel** - you should see:
   ```
   [DocumentTracker] Detected X lines added in /path/to/file
   [ApiClient] Sending code event: manual, X lines, file: /path/to/file
   [ApiClient] ✅ Code event sent successfully (status: 200)
   ```

### Step 4: Check Backend

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/api/metrics/health
   ```

2. **Should return:**
   ```json
   {"status":"healthy","service":"ai-loc-tracker-backend","version":"0.1.0"}
   ```

3. **If not running, start it:**
   ```bash
   cd backend
   source ../.venv/bin/activate
   uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Step 5: Check API Calls

1. **Watch backend logs** while typing

2. **You should see POST requests:**
   ```
   POST /api/events/code
   ```

3. **If no requests:**
   - Check Output Channel for errors
   - Check if `developerId` is set
   - Check if extension is enabled

## Common Issues

### Issue 1: "ERROR: Developer ID not set!"

**Solution:**
1. Open Settings: `Cmd + Shift + P` → `Preferences: Open User Settings (JSON)`
2. Add: `"aiCodeMetrics.developerId": "your-id"`
3. Reload window: `Cmd + Shift + P` → `Developer: Reload Window`

### Issue 2: Trackers not registered

**Symptoms:**
- No `[DocumentTracker]` messages in Output Channel
- Extension returns early due to missing config

**Solution:**
- Set `developerId` and `enabled: true`
- Reload window

### Issue 3: No API calls when typing

**Check:**
1. Output Channel - look for `[DocumentTracker]` messages
2. If you see "Detected X lines" but no API call:
   - Check backend is running
   - Check network errors in Output Channel
   - Check `backendUrl` is correct

### Issue 4: API calls fail

**Check Output Channel for errors:**
```
[ApiClient] ❌ Failed to send code event: ...
```

**Common errors:**
- `ECONNREFUSED` → Backend not running
- `HTTP 404` → Wrong endpoint URL
- `HTTP 500` → Backend error (check backend logs)

### Issue 5: Typing in wrong file type

**Note:** Extension tracks:
- ✅ Code files (`.py`, `.js`, `.ts`, etc.)
- ✅ Test files (contains "test" or "spec")
- ✅ Documentation (`.md`, `.txt`)

**Not tracked:**
- ❌ Output/terminal
- ❌ Settings files
- ❌ Extension files

## Debug Commands

### Check if extension is active:
```javascript
// In Developer Console (Help → Toggle Developer Tools)
vscode.extensions.getExtension('ai-loc-tracker.ai-loc-tracker')?.isActive
```

### Check configuration:
```javascript
vscode.workspace.getConfiguration('aiCodeMetrics').get('developerId')
vscode.workspace.getConfiguration('aiCodeMetrics').get('enabled')
```

### Manually trigger tracking (for testing):
1. Type in a file
2. Wait 2 seconds
3. Check Output Channel for logs

## Expected Behavior

When you type in a file:

1. **Immediately:** `[DocumentTracker] Detected X lines added...`
2. **After 1 second:** `[ApiClient] Sending code event...`
3. **If successful:** `[ApiClient] ✅ Code event sent successfully`
4. **If failed:** `[ApiClient] ❌ Failed to send code event: ...`

## Still Not Working?

1. **Check all logs** in Output Channel
2. **Check backend logs** for incoming requests
3. **Verify settings** are correct
4. **Reload window** after changing settings
5. **Restart VSCode** if needed

## Test Script

To verify everything works:

1. Set `developerId` in settings
2. Start backend
3. Open a `.py` or `.js` file
4. Type 5-10 lines of code
5. Wait 2 seconds
6. Check Output Channel for success messages
7. Check backend logs for POST request
8. Check metrics: `curl http://localhost:8000/api/metrics/developer/your-id`

