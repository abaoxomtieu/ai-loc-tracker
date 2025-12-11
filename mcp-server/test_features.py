"""Test script for features API."""
import httpx
import json

BACKEND_URL = "http://localhost:8000"


def test_list_features():
    """Test list_recent_features functionality."""
    print("Testing list_recent_features API...")
    
    try:
        response = httpx.get(f"{BACKEND_URL}/api/metrics/features", params={"limit": 10}, timeout=5.0)
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Features retrieved: {data['showing']} of {data['total_features']}")
        print("\nRecent features:")
        for feature in data["features"][:5]:
            print(f"  - {feature['feature_name']}: {feature['total_loc']} LOC (Code: {feature['code_loc']}, Test: {feature['test_loc']}, Doc: {feature['doc_loc']})")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
def function_test():
    """Test function."""
    print("Testing function...")
    return True

def function_test2():
    """Test function."""
    print("Testing function...")
    return True
def test_track_with_feature():
    """Test tracking with feature name."""
    print("\nTesting track_agent_code with feature_name...")
    
    event = {
        "source": "agent",
        "lines": 75,
        "file_path": "/test/new_feature.py",
        "language": "unknown",
        "developer_id": "mcp-test",
        "type": "code",
        "metadata": {
            "feature_name": "New Test Feature",
        },
    }
    
    try:
        response = httpx.post(f"{BACKEND_URL}/api/events/code", json=event, timeout=5.0)
        response.raise_for_status()
        print(f"✅ Event tracked: {response.json()}")
        
        # Check features again
        response2 = httpx.get(f"{BACKEND_URL}/api/metrics/features", params={"limit": 10}, timeout=5.0)
        data = response2.json()
        print(f"\n✅ Total features now: {data['total_features']}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Testing Features API")
    print("=" * 50)
    
    results = [
        test_list_features(),
        test_track_with_feature(),
    ]
    
    print("\n" + "=" * 50)
    if all(results):
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed")
    print("=" * 50)






