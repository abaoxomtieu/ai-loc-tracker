"""JSONL file storage for events."""

import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from ..models.events import (
    CodeInsertionEvent,
    TestGenerationEvent,
    DocumentationEvent,
    CodeType,
    Event,
)


class JSONLStorage:
    """Storage layer using JSONL files."""

    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize JSONL storage.

        Args:
            data_dir: Directory to store JSONL files. Defaults to backend/logs
        """
        if data_dir is None:
            # Default to backend/logs directory (relative to this file)
            backend_dir = Path(__file__).parent.parent.parent
            data_dir = backend_dir / "logs"

        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # File paths for different event types
        self.files = {
            CodeType.CODE: self.data_dir / "code_insertions.jsonl",
            CodeType.TEST: self.data_dir / "test_generations.jsonl",
            CodeType.DOCUMENTATION: self.data_dir / "documentation.jsonl",
        }

    def save_event(self, event: Event) -> None:
        """
        Save an event to the appropriate JSONL file.

        Args:
            event: Event to save
        """
        file_path = self.files[event.type]

        # Convert event to dict, handling datetime serialization
        event_dict = event.model_dump()
        event_dict["timestamp"] = event_dict["timestamp"].isoformat()

        # Append to JSONL file
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(event_dict) + "\n")

    def load_events(
        self,
        event_type: CodeType,
        developer_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[dict]:
        """
        Load events from JSONL file with optional filtering.

        Args:
            event_type: Type of events to load
            developer_id: Filter by developer ID
            start_date: Filter events after this date
            end_date: Filter events before this date

        Returns:
            List of event dictionaries
        """
        file_path = self.files[event_type]

        if not file_path.exists():
            return []

        events = []
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue

                try:
                    event = json.loads(line)

                    # Apply filters
                    if developer_id and event.get("developer_id") != developer_id:
                        continue

                    event_timestamp = datetime.fromisoformat(event["timestamp"])
                    if start_date and event_timestamp < start_date:
                        continue
                    if end_date and event_timestamp > end_date:
                        continue

                    events.append(event)
                except (json.JSONDecodeError, KeyError, ValueError) as e:
                    # Skip malformed lines
                    continue

        return events

    def get_all_events(
        self,
        developer_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[dict]:
        """
        Get all events across all types.

        Args:
            developer_id: Filter by developer ID
            start_date: Filter events after this date
            end_date: Filter events before this date

        Returns:
            List of all event dictionaries
        """
        all_events = []
        for event_type in CodeType:
            events = self.load_events(event_type, developer_id, start_date, end_date)
            all_events.extend(events)

        # Sort by timestamp
        all_events.sort(key=lambda x: x.get("timestamp", ""))
        return all_events
