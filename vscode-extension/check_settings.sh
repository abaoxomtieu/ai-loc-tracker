#!/bin/bash

# Script to check AI LOC Tracker settings in Cursor/VSCode

SETTINGS_FILE="$HOME/Library/Application Support/Cursor/User/settings.json"

# Try VSCode if Cursor not found
if [ ! -f "$SETTINGS_FILE" ]; then
    SETTINGS_FILE="$HOME/Library/Application Support/Code/User/settings.json"
fi

echo "=== AI LOC Tracker Settings Checker ==="
echo ""
echo "Settings file: $SETTINGS_FILE"
echo ""

if [ ! -f "$SETTINGS_FILE" ]; then
    echo "❌ Settings file not found!"
    echo ""
    echo "Please create settings file manually or use Cursor UI:"
    echo "  Cmd + Shift + P → 'Preferences: Open User Settings (JSON)'"
    exit 1
fi

echo "Checking settings..."
echo ""

# Check Backend URL
if grep -q "aiCodeMetrics.backendUrl" "$SETTINGS_FILE"; then
    BACKEND_URL=$(grep "aiCodeMetrics.backendUrl" "$SETTINGS_FILE" | sed 's/.*"aiCodeMetrics.backendUrl": *"\([^"]*\)".*/\1/')
    if [ -n "$BACKEND_URL" ] && [ "$BACKEND_URL" != "null" ]; then
        echo "✅ Backend URL: $BACKEND_URL"
    else
        echo "❌ Backend URL: NOT SET (empty or null)"
    fi
else
    echo "❌ Backend URL: NOT FOUND in settings"
fi

# Check Developer ID
if grep -q "aiCodeMetrics.developerId" "$SETTINGS_FILE"; then
    DEV_ID=$(grep "aiCodeMetrics.developerId" "$SETTINGS_FILE" | sed 's/.*"aiCodeMetrics.developerId": *"\([^"]*\)".*/\1/')
    if [ -n "$DEV_ID" ] && [ "$DEV_ID" != '""' ] && [ "$DEV_ID" != "null" ]; then
        echo "✅ Developer ID: $DEV_ID"
    else
        echo "❌ Developer ID: NOT SET (empty)"
        echo "   ⚠️  This is REQUIRED for extension to work!"
    fi
else
    echo "❌ Developer ID: NOT FOUND in settings"
    echo "   ⚠️  This is REQUIRED for extension to work!"
fi

# Check Enabled
if grep -q "aiCodeMetrics.enabled" "$SETTINGS_FILE"; then
    ENABLED=$(grep "aiCodeMetrics.enabled" "$SETTINGS_FILE" | sed 's/.*"aiCodeMetrics.enabled": *\([^,}]*\).*/\1/')
    if [ "$ENABLED" = "true" ]; then
        echo "✅ Enabled: true"
    else
        echo "❌ Enabled: false (extension is disabled)"
    fi
else
    echo "⚠️  Enabled: NOT FOUND (defaults to true)"
fi

echo ""
echo "=== Summary ==="
echo ""
echo "To fix missing settings, run:"
echo "  Cmd + Shift + P → 'Preferences: Open User Settings (JSON)'"
echo ""
echo "Then add:"
echo '  "aiCodeMetrics.backendUrl": "http://localhost:8000",'
echo '  "aiCodeMetrics.developerId": "your-developer-id",'
echo '  "aiCodeMetrics.enabled": true'
echo ""



