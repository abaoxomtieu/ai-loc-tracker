"""Simple test script for the API."""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    response = requests.get(f"{BASE_URL}/api/metrics/health")
    print("Health check:", response.json())
    assert response.status_code == 200

def test_code_event():
    """Test code insertion event."""
    event = {
        "source": "completion",
        "lines": 10,
        "file_path": "src/main.py",
        "language": "python",
        "developer_id": "dev1"
    }
    response = requests.post(f"{BASE_URL}/api/events/code", json=event)
    print("Code event:", response.json())
    assert response.status_code == 200

def test_test_event():
    """Test test generation event."""
    event = {
        "source": "agent",
        "lines": 15,
        "file_path": "tests/test_main.py",
        "test_framework": "pytest",
        "coverage": 85.5,
        "developer_id": "dev1"
    }
    response = requests.post(f"{BASE_URL}/api/events/test", json=event)
    print("Test event:", response.json())
    assert response.status_code == 200

def test_doc_event():
    """Test documentation event."""
    event = {
        "source": "manual",
        "lines": 5,
        "file_path": "README.md",
        "doc_type": "readme",
        "developer_id": "dev1"
    }
    response = requests.post(f"{BASE_URL}/api/events/documentation", json=event)
    print("Doc event:", response.json())
    assert response.status_code == 200

def test_developer_metrics():
    """Test developer metrics endpoint."""
    response = requests.get(f"{BASE_URL}/api/metrics/developer/dev1")
    print("Developer metrics:", json.dumps(response.json(), indent=2))
    assert response.status_code == 200

def test_team_metrics():
    """Test team metrics endpoint."""
    response = requests.get(f"{BASE_URL}/api/metrics/team")
    print("Team metrics:", json.dumps(response.json(), indent=2))
    assert response.status_code == 200

if __name__ == "__main__":
    print("Testing API endpoints...")
    print("=" * 50)
    
    try:
        test_health()
        test_code_event()
        test_test_event()
        test_doc_event()
        test_developer_metrics()
        test_team_metrics()
        print("\n" + "=" * 50)
        print("All tests passed!")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API. Make sure the server is running:")
        print("  uvicorn src.main:app --reload")
    except Exception as e:
        print(f"Error: {e}")

