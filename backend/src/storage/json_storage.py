"""JSON file storage for events."""

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


class JSONStorage:
    """Storage layer using JSON files (array format)."""

    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize JSON storage.

        Args:
            data_dir: Directory to store JSON files. Defaults to backend/logs
        """
        if data_dir is None:
            # Default to backend/logs directory (relative to this file)
            backend_dir = Path(__file__).parent.parent.parent
            data_dir = backend_dir / "logs"

        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # File paths for different event types
        self.files = {
            CodeType.CODE: self.data_dir / "code_insertions.json",
            CodeType.TEST: self.data_dir / "test_generations.json",
            CodeType.DOCUMENTATION: self.data_dir / "documentation.json",
        }

    def save_event(self, event: Event) -> None:
        """
        Save an event to the appropriate JSON file.

        Args:
            event: Event to save
        """
        file_path = self.files[event.type]

        # Convert event to dict, handling datetime serialization
        event_dict = event.model_dump()
        event_dict["timestamp"] = event_dict["timestamp"].isoformat()

        # Read existing events
        events = self._load_events_from_file(file_path)

        # Append new event
        events.append(event_dict)

        # Write back to file
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(events, f, indent=2, ensure_ascii=False)

    def _load_events_from_file(self, file_path: Path) -> List[dict]:
        """
        Load events from a JSON file.

        Args:
            file_path: Path to JSON file

        Returns:
            List of event dictionaries
        """
        if not file_path.exists():
            return []

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                events = json.load(f)
                if not isinstance(events, list):
                    # If file contains single object or invalid format, return empty list
                    return []
                return events
        except (json.JSONDecodeError, IOError) as e:
            # If file is corrupted or empty, return empty list
            return []

    def load_events(
        self,
        event_type: CodeType,
        developer_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[dict]:
        """
        Load events from JSON file with optional filtering.

        Args:
            event_type: Type of events to load
            developer_id: Filter by developer ID
            start_date: Filter events after this date
            end_date: Filter events before this date

        Returns:
            List of event dictionaries
        """
        file_path = self.files[event_type]
        events = self._load_events_from_file(file_path)

        # Apply filters
        filtered_events = []
        for event in events:
            # Filter by developer_id
            if developer_id and event.get("developer_id") != developer_id:
                continue

            # Filter by date range
            if start_date or end_date:
                try:
                    event_timestamp = datetime.fromisoformat(event["timestamp"])
                    if start_date and event_timestamp < start_date:
                        continue
                    if end_date and event_timestamp > end_date:
                        continue
                except (KeyError, ValueError):
                    # Skip events with invalid timestamps
                    continue

            filtered_events.append(event)

        return filtered_events

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
