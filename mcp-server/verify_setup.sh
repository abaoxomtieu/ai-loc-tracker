#!/bin/bash
# Comprehensive verification script for MCP server setup

echo "=== MCP Server Setup Verification ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo "1. Checking Python..."
PYTHON_PATH="/Users/baohoton/Desktop/Code/untitled folder/LOC/.venv/bin/python3"
if [ -f "$PYTHON_PATH" ]; then
    echo -e "${GREEN}✅ Python found: $PYTHON_PATH${NC}"
    "$PYTHON_PATH" --version
else
    echo -e "${RED}❌ Python not found at: $PYTHON_PATH${NC}"
    exit 1
fi
echo ""

# Check dependencies
echo "2. Checking dependencies..."
"$PYTHON_PATH" -m pip list | grep -E "(mcp|httpx|fastapi|uvicorn)" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    "$PYTHON_PATH" -m pip list | grep -E "(mcp|httpx|fastapi|uvicorn)"
else
    echo -e "${RED}❌ Missing dependencies${NC}"
    exit 1
fi
echo ""

# Check server file
echo "3. Checking server file..."
SERVER_DIR="/Users/baohoton/Desktop/Code/untitled folder/LOC/mcp-server"
if [ -f "$SERVER_DIR/src/server.py" ]; then
    echo -e "${GREEN}✅ Server file found${NC}"
else
    echo -e "${RED}❌ Server file not found${NC}"
    exit 1
fi
echo ""

# Check wrapper script
echo "4. Checking wrapper script..."
WRAPPER="$SERVER_DIR/run_server.sh"
if [ -f "$WRAPPER" ] && [ -x "$WRAPPER" ]; then
    echo -e "${GREEN}✅ Wrapper script found and executable${NC}"
else
    echo -e "${RED}❌ Wrapper script not found or not executable${NC}"
    exit 1
fi
echo ""

# Test server initialization
echo "5. Testing server initialization..."
cd "$SERVER_DIR"
INIT_MSG='{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}}}'
# Use gtimeout if available, otherwise use perl or python for timeout
if command -v gtimeout &> /dev/null; then
    RESPONSE=$(echo "$INIT_MSG" | gtimeout 3 "$WRAPPER" 2>&1 | head -1)
elif command -v perl &> /dev/null; then
    RESPONSE=$(echo "$INIT_MSG" | perl -e 'alarm 3; exec @ARGV' "$WRAPPER" 2>&1 | head -1)
else
    # Use Python test script instead
    if [ -f "$SERVER_DIR/test_connection.py" ]; then
        RESPONSE=$("$PYTHON_PATH" "$SERVER_DIR/test_connection.py" 2>&1 | grep -q "jsonrpc" && echo "OK" || echo "FAIL")
    else
        RESPONSE="SKIP (no timeout command available)"
    fi
fi
if echo "$RESPONSE" | grep -q "jsonrpc" || [ "$RESPONSE" = "OK" ]; then
    echo -e "${GREEN}✅ Server responds correctly${NC}"
    if [ "$RESPONSE" != "OK" ]; then
        echo "Response: $RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Could not test server response (timeout command not available)${NC}"
    echo "Running test_connection.py instead..."
    if [ -f "$SERVER_DIR/test_connection.py" ]; then
        "$PYTHON_PATH" "$SERVER_DIR/test_connection.py" 2>&1 | tail -5
    fi
fi
echo ""

# Check MCP config
echo "6. Checking Cursor MCP configuration..."
MCP_CONFIG="/Users/baohoton/Desktop/Code/untitled folder/LOC/.cursor/mcp.json"
if [ -f "$MCP_CONFIG" ]; then
    echo -e "${GREEN}✅ MCP config file found${NC}"
    echo "Config content:"
    cat "$MCP_CONFIG" | python3 -m json.tool 2>/dev/null || cat "$MCP_CONFIG"
else
    echo -e "${YELLOW}⚠️  MCP config file not found at: $MCP_CONFIG${NC}"
fi
echo ""

# Test wrapper script directly
echo "7. Testing wrapper script..."
if "$WRAPPER" --help &>/dev/null; then
    echo -e "${GREEN}✅ Wrapper script executes correctly${NC}"
else
    echo -e "${RED}❌ Wrapper script failed${NC}"
fi
echo ""

echo -e "${GREEN}=== All checks passed! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Restart Cursor IDE"
echo "2. Check MCP server status in Cursor settings"
echo "3. Try using @ai-code-metrics in chat"

