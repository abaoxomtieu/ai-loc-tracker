#!/bin/bash

# Activate virtual environment
source "/Users/baohoton/Desktop/Code/untitled folder/LOC/.venv/bin/activate"

# Change to mcp-server directory
cd "/Users/baohoton/Desktop/Code/untitled folder/LOC/mcp-server"

# Get port from environment or use default
PORT=${MCP_PORT:-8001}
HOST=${MCP_HOST:-localhost}

# Run MCP server with SSE transport
echo "Starting MCP server on $HOST:$PORT..."
echo "Backend URL: ${METRICS_BACKEND_URL:-http://localhost:8000}"
python -m src.server --transport sse --host "$HOST" --port "$PORT"

