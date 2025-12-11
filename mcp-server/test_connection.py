#!/usr/bin/env python3
"""Test MCP server connection and list available tools/resources."""
import json
import subprocess
import sys
import os

# Path to server
server_path = os.path.join(os.path.dirname(__file__), "src", "server.py")
venv_python = "/Users/baohoton/Desktop/Code/untitled folder/LOC/.venv/bin/python"

def test_mcp_server():
    """Test MCP server with stdio transport."""
    print("Testing MCP server connection...")
    
    # Initialize request
    init_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "test-client",
                "version": "1.0.0"
            }
        }
    }
    
    # List tools request
    tools_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list"
    }
    
    # List resources request
    resources_request = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "resources/list"
    }
    
    try:
        # Start server process
        process = subprocess.Popen(
            [venv_python, "-m", "src.server"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=os.path.dirname(__file__),
            text=True
        )
        
        # Send requests
        requests = [
            json.dumps(init_request),
            json.dumps(tools_request),
            json.dumps(resources_request)
        ]
        
        input_data = "\n".join(requests) + "\n"
        stdout, stderr = process.communicate(input=input_data, timeout=5)
        
        print("\n=== Server Output ===")
        print(stdout)
        
        if stderr:
            print("\n=== Server Errors ===")
            print(stderr)
        
        # Parse responses
        responses = [line for line in stdout.split("\n") if line.strip() and line.strip().startswith("{")]
        
        print("\n=== Parsed Responses ===")
        for i, response in enumerate(responses, 1):
            try:
                data = json.loads(response)
                print(f"\nResponse {i}:")
                print(json.dumps(data, indent=2))
                
                if data.get("method") == "tools/list" or (data.get("id") == 2 and "result" in data):
                    if "result" in data and "tools" in data["result"]:
                        print(f"\n✅ Found {len(data['result']['tools'])} tools:")
                        for tool in data["result"]["tools"]:
                            print(f"  - {tool.get('name', 'unknown')}: {tool.get('description', 'no description')}")
                
                if data.get("method") == "resources/list" or (data.get("id") == 3 and "result" in data):
                    if "result" in data and "resources" in data["result"]:
                        print(f"\n✅ Found {len(data['result']['resources'])} resources:")
                        for resource in data["result"]["resources"]:
                            print(f"  - {resource.get('uri', 'unknown')}: {resource.get('name', 'no name')}")
            except json.JSONDecodeError:
                print(f"Could not parse response {i}: {response[:100]}")
        
        process.terminate()
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ Server timeout")
        process.kill()
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_mcp_server()
    sys.exit(0 if success else 1)

