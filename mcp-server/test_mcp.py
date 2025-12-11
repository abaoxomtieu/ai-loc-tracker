"""Test script for MCP server tools."""
import httpx
import json

BACKEND_URL = "http://localhost:8000"


def test_track_agent_code():
    """Test track_agent_code functionality."""
    print("Testing track_agent_code...")
    
    event = {
        "source": "agent",
        "lines": 25,
        "file_path": "/test/agent_generated.py",
        "language": "python",
        "developer_id": "mcp-test",
        "type": "code",
    }
    
    try:
        response = httpx.post(f"{BACKEND_URL}/api/events/code", json=event, timeout=5.0)
        response.raise_for_status()
        print(f"✅ Event sent: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_track_feature_completion():
    """Test track_agent_feature_completion functionality."""
    print("\nTesting track_agent_feature_completion...")
    
    event = {
        "source": "agent",
        "lines": 100,
        "file_path": "src/feature.py, tests/test_feature.py",
        "language": "python",
        "developer_id": "mcp-test",
        "type": "code",
        "metadata": {
            "feature_description": "Test feature completion",
            "files_count": 2,
            "files": ["src/feature.py", "tests/test_feature.py"],
        },
    }
    
    try:
        response = httpx.post(f"{BACKEND_URL}/api/events/code", json=event, timeout=5.0)
        response.raise_for_status()
        print(f"✅ Feature completion tracked: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_get_metrics():
    """Test getting metrics."""
    print("\nTesting get metrics...")
    
    try:
        response = httpx.get(f"{BACKEND_URL}/api/metrics/developer/mcp-test", timeout=5.0)
        response.raise_for_status()
        metrics = response.json()
        print(f"✅ Developer metrics retrieved:")
        print(f"   - Total LOC: {metrics['code_metrics']['total_lines']}")
        print(f"   - AI LOC: {metrics['code_metrics']['ai_lines']} ({metrics['code_metrics']['ai_percentage']}%)")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Testing MCP Server Integration")
    print("=" * 50)
    
    results = [
        test_track_agent_code(),
        test_track_feature_completion(),
        test_get_metrics(),
    ]
    
    print("\n" + "=" * 50)
    if all(results):
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed")
    print("=" * 50)

