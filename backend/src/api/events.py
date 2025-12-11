"""API endpoints for event ingestion."""

from typing import Union
from fastapi import APIRouter, HTTPException
from ..models.events import (
    CodeInsertionEvent,
    TestGenerationEvent,
    DocumentationEvent,
)
from ..storage.json_storage import JSONStorage

router = APIRouter(prefix="/api/events", tags=["events"])

# Initialize storage (in production, use dependency injection)
storage = JSONStorage()


@router.post("/code", response_model=dict)
async def receive_code_event(event: CodeInsertionEvent) -> dict:
    """
    Receive code insertion event.

    Args:
        event: Code insertion event

    Returns:
        Success response
    """
    try:
        storage.save_event(event)
        return {
            "success": True,
            "message": "Code insertion event saved",
            "event_id": f"{event.developer_id}_{event.timestamp.isoformat()}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save event: {str(e)}")


@router.post("/test", response_model=dict)
async def receive_test_event(event: TestGenerationEvent) -> dict:
    """
    Receive test generation event.

    Args:
        event: Test generation event

    Returns:
        Success response
    """
    try:
        storage.save_event(event)
        return {
            "success": True,
            "message": "Test generation event saved",
            "event_id": f"{event.developer_id}_{event.timestamp.isoformat()}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save event: {str(e)}")


@router.post("/documentation", response_model=dict)
async def receive_documentation_event(event: DocumentationEvent) -> dict:
    """
    Receive documentation event.

    Args:
        event: Documentation event

    Returns:
        Success response
    """
    try:
        storage.save_event(event)
        return {
            "success": True,
            "message": "Documentation event saved",
            "event_id": f"{event.developer_id}_{event.timestamp.isoformat()}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save event: {str(e)}")


@router.post("/", response_model=dict)
async def receive_event(
    event: Union[CodeInsertionEvent, TestGenerationEvent, DocumentationEvent],
) -> dict:
    """
    Generic endpoint to receive any type of event.

    Args:
        event: Any event type

    Returns:
        Success response
    """
    try:
        storage.save_event(event)
        return {
            "success": True,
            "message": "Event saved",
            "event_type": event.type.value,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save event: {str(e)}")
