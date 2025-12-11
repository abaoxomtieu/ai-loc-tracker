"""Test script to call MCP server tools."""
import httpx
import json

BACKEND_URL = "http://localhost:8000"


def test_track_agent_code():
    """Test track_agent_code with new simplified API."""
    print("Testing track_agent_code (simplified)...")
    
    event = {
        "source": "agent",
        "lines": 50,
        "file_path": "/test/user_auth.py",
        "language": "unknown",
        "developer_id": "mcp-test",
        "type": "code",
        "metadata": {
            "feature_name": "User Authentication",
        },
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
    """Test track_agent_feature_completion with new simplified API."""
    print("\nTesting track_agent_feature_completion (simplified)...")
    
    event = {
        "source": "agent",
        "lines": 150,
        "file_path": "src/auth.py, tests/test_auth.py",
        "language": "unknown",
        "developer_id": "mcp-test",
        "type": "code",
        "metadata": {
            "feature_name": "Complete Authentication System",
            "files_count": 2,
            "files": ["src/auth.py", "tests/test_auth.py"],
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
        print(f"✅ Developer metrics:")
        print(f"   - Total LOC: {metrics['code_metrics']['total_lines']}")
        print(f"   - AI LOC: {metrics['code_metrics']['ai_lines']} ({metrics['code_metrics']['ai_percentage']}%)")
        print(f"   - Overall Score: {metrics['overall_score']}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Testing MCP Server (Simplified API)")
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
    
    print("\n📝 Example MCP calls:")
    print("""
# Track agent code
track_agent_code(
    loc_count=50,
    file_path="src/auth.py",
    feature_name="User Authentication",
    code_type="code",
    developer_id="agent-user"
)

# Track feature completion
track_agent_feature_completion(
    feature_name="Complete Authentication System",
    loc_count=150,
    files_modified=["src/auth.py", "tests/test_auth.py"],
    developer_id="agent-user"
)
    """)






