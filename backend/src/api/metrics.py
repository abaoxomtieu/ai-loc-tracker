"""API endpoints for metrics retrieval."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..storage.json_storage import JSONStorage
from ..services.aggregator import MetricsAggregator

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

# Initialize storage and aggregator (in production, use dependency injection)
storage = JSONStorage()
aggregator = MetricsAggregator(storage)


@router.get("/developer/{developer_id}", response_model=dict)
async def get_developer_metrics(
    developer_id: str,
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
) -> dict:
    """
    Get metrics for a specific developer.

    Args:
        developer_id: Developer identifier
        start_date: Optional start date filter (ISO format)
        end_date: Optional end date filter (ISO format)

    Returns:
        Developer metrics
    """
    try:
        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None

        metrics = aggregator.get_developer_metrics(developer_id, start, end)
        return metrics
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.get("/team", response_model=dict)
async def get_team_metrics(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
) -> dict:
    """
    Get aggregated metrics for the entire team.

    Args:
        start_date: Optional start date filter (ISO format)
        end_date: Optional end date filter (ISO format)

    Returns:
        Team metrics and leaderboard
    """
    try:
        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None

        metrics = aggregator.get_team_metrics(start, end)
        return metrics
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.get("/trends", response_model=dict)
async def get_trends(
    developer_id: Optional[str] = Query(
        None, description="Optional developer ID filter"
    ),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
) -> dict:
    """
    Get time-series trends for metrics.

    Args:
        developer_id: Optional developer ID to filter
        days: Number of days to look back (1-365)

    Returns:
        Trend data
    """
    try:
        trends = aggregator.get_trends(developer_id, days)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trends: {str(e)}")


@router.get("/health", response_model=dict)
async def health_check() -> dict:
    """
    Health check endpoint.

    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "ai-code-metrics-backend",
        "version": "0.1.0",
    }
