"""Metrics calculation service."""

from typing import Dict, List
from ..models.events import CodeSource, CodeType
from ..storage.json_storage import JSONStorage


class MetricsCalculator:
    """Calculate metrics from events."""

    def __init__(self, storage: JSONStorage):
        """
        Initialize calculator with storage.

        Args:
            storage: JSONL storage instance
        """
        self.storage = storage

    def calculate_loc_metrics(
        self,
        events: List[Dict],
        code_type: CodeType = CodeType.CODE,
    ) -> Dict:
        """
        Calculate LOC metrics from events.

        Args:
            events: List of event dictionaries
            code_type: Type of code to calculate (CODE, TEST, DOCUMENTATION)

        Returns:
            Dictionary with metrics
        """
        # Filter by code type
        filtered_events = [e for e in events if e.get("type") == code_type.value]

        total_lines = sum(e.get("lines", 0) for e in filtered_events)

        # Count by source
        completion_lines = sum(
            e.get("lines", 0)
            for e in filtered_events
            if e.get("source") == CodeSource.COMPLETION.value
        )
        agent_lines = sum(
            e.get("lines", 0)
            for e in filtered_events
            if e.get("source") == CodeSource.AGENT.value
        )
        manual_lines = sum(
            e.get("lines", 0)
            for e in filtered_events
            if e.get("source") == CodeSource.MANUAL.value
        )

        # AI lines = completion + agent
        ai_lines = completion_lines + agent_lines

        # Calculate percentages
        ai_percentage = (ai_lines / total_lines * 100) if total_lines > 0 else 0.0
        completion_percentage = (
            (completion_lines / total_lines * 100) if total_lines > 0 else 0.0
        )
        agent_percentage = (agent_lines / total_lines * 100) if total_lines > 0 else 0.0
        manual_percentage = (
            (manual_lines / total_lines * 100) if total_lines > 0 else 0.0
        )

        return {
            "total_lines": total_lines,
            "ai_lines": ai_lines,
            "completion_lines": completion_lines,
            "agent_lines": agent_lines,
            "manual_lines": manual_lines,
            "ai_percentage": round(ai_percentage, 2),
            "completion_percentage": round(completion_percentage, 2),
            "agent_percentage": round(agent_percentage, 2),
            "manual_percentage": round(manual_percentage, 2),
        }

    def get_targets(self) -> Dict:
        """
        Get target percentages for metrics.

        Returns:
            Dictionary with target percentages
        """
        return {
            "ai_loc": 15.0,  # 15% target for AI-generated code
            "ai_tests": 20.0,  # 20% target for AI-generated tests
            "ai_docs": 10.0,  # 10% target for AI-assisted documentation
        }

    def check_target_status(
        self, actual: float, target: float, tolerance: float = 5.0
    ) -> str:
        """
        Check if actual percentage meets target.

        Args:
            actual: Actual percentage
            target: Target percentage
            tolerance: Tolerance range (default 5%)

        Returns:
            Status: "on-track", "below-target", or "above-target"
        """
        if actual >= target - tolerance and actual <= target + tolerance:
            return "on-track"
        elif actual < target:
            return "below-target"
        else:
            return "above-target"
