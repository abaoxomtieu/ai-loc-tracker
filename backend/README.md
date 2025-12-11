# AI Code Metrics Backend

FastAPI backend for tracking AI-augmented engineering metrics.

## Features

- **Event Ingestion**: Receive code tracking events (completion, agent, manual)
- **Metrics Aggregation**: Calculate LOC percentages, compare with targets
- **Developer Metrics**: Get individual developer statistics
- **Team Leaderboard**: View team-wide metrics and rankings
- **Trends**: Time-series analysis of metrics

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

```bash
# Development mode
uvicorn src.main:app --reload

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Events

- `POST /api/events/code` - Receive code insertion event
- `POST /api/events/test` - Receive test generation event
- `POST /api/events/documentation` - Receive documentation event
- `POST /api/events/` - Generic event endpoint

### Metrics

- `GET /api/metrics/developer/{developer_id}` - Get developer metrics
- `GET /api/metrics/team` - Get team metrics and leaderboard
- `GET /api/metrics/trends` - Get time-series trends
- `GET /api/metrics/health` - Health check

## Data Storage

Events are stored in JSON files in `backend/logs/`:
- `code_insertions.json` (JSON array format)
- `test_generations.json` (JSON array format)
- `documentation.json` (JSON array format)

## Example Usage

### Send a code insertion event

```bash
curl -X POST "http://localhost:8000/api/events/code" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "completion",
    "lines": 10,
    "file_path": "src/main.py",
    "language": "python",
    "developer_id": "dev1"
  }'
```

### Get developer metrics

```bash
curl "http://localhost:8000/api/metrics/developer/dev1"
```

### Get team leaderboard

```bash
curl "http://localhost:8000/api/metrics/team"
```

