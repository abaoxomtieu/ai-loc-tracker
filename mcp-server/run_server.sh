#!/bin/bash
# Wrapper script to run MCP server
# This avoids path parsing issues with spaces in Cursor

cd "/Users/baohoton/Desktop/Code/untitled folder/LOC/mcp-server"
exec "/Users/baohoton/Desktop/Code/untitled folder/LOC/.venv/bin/python3" -m src.server "$@"

