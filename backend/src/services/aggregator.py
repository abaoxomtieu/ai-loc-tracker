"""Metrics aggregation service."""

from datetime import datetime
from typing import Dict, List, Optional
from ..models.events import CodeType
from ..storage.json_storage import JSONStorage
from .calculator import MetricsCalculator


class MetricsAggregator:
    """Aggregate metrics from storage."""

    def __init__(self, storage: JSONStorage):
        """
        Initialize aggregator with storage.

        Args:
            storage: JSONL storage instance
        """
        self.storage = storage
        self.calculator = MetricsCalculator(storage)

    def get_developer_metrics(
        self,
        developer_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict:
        """
        Get aggregated metrics for a developer.

        Args:
            developer_id: Developer identifier
            start_date: Start date for filtering
            end_date: End date for filtering

        Returns:
            Dictionary with developer metrics
        """
        # Load all events for developer
        events = self.storage.get_all_events(developer_id, start_date, end_date)

        # Calculate metrics for each type
        code_metrics = self.calculator.calculate_loc_metrics(events, CodeType.CODE)
        test_metrics = self.calculator.calculate_loc_metrics(events, CodeType.TEST)
        doc_metrics = self.calculator.calculate_loc_metrics(
            events, CodeType.DOCUMENTATION
        )

        # Get targets
        targets = self.calculator.get_targets()

        # Check target status
        ai_loc_status = self.calculator.check_target_status(
            code_metrics["ai_percentage"], targets["ai_loc"]
        )
        ai_test_status = self.calculator.check_target_status(
            test_metrics["ai_percentage"], targets["ai_tests"]
        )
        ai_doc_status = self.calculator.check_target_status(
            doc_metrics["ai_percentage"], targets["ai_docs"]
        )

        # Calculate overall score
        overall_score = self._calculate_overall_score(
            ai_loc_status, ai_test_status, ai_doc_status
        )

        return {
            "developer_id": developer_id,
            "period": {
                "start": start_date.isoformat() if start_date else None,
                "end": end_date.isoformat() if end_date else None,
            },
            "code_metrics": code_metrics,
            "test_metrics": test_metrics,
            "documentation_metrics": doc_metrics,
            "targets": targets,
            "status": {
                "ai_loc": ai_loc_status,
                "ai_tests": ai_test_status,
                "ai_docs": ai_doc_status,
            },
            "overall_score": overall_score,
        }

    def get_team_metrics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict:
        """
        Get aggregated metrics for the entire team.

        Args:
            start_date: Start date for filtering
            end_date: End date for filtering

        Returns:
            Dictionary with team metrics
        """
        # Load all events
        events = self.storage.get_all_events(None, start_date, end_date)

        # Get unique developer IDs
        developer_ids = set(
            e.get("developer_id") for e in events if e.get("developer_id")
        )

        # Calculate metrics for each developer
        leaderboard = []
        for dev_id in developer_ids:
            dev_metrics = self.get_developer_metrics(dev_id, start_date, end_date)
            leaderboard.append(
                {
                    "developer_id": dev_id,
                    "overall_score": dev_metrics["overall_score"],
                    "ai_loc_percentage": dev_metrics["code_metrics"]["ai_percentage"],
                    "ai_test_percentage": dev_metrics["test_metrics"]["ai_percentage"],
                    "ai_doc_percentage": dev_metrics["documentation_metrics"][
                        "ai_percentage"
                    ],
                    "total_loc": dev_metrics["code_metrics"]["total_lines"],
                }
            )

        # Sort by overall score (descending)
        leaderboard.sort(key=lambda x: x["overall_score"], reverse=True)

        # Calculate team aggregates
        team_code_metrics = self.calculator.calculate_loc_metrics(events, CodeType.CODE)
        team_test_metrics = self.calculator.calculate_loc_metrics(events, CodeType.TEST)
        team_doc_metrics = self.calculator.calculate_loc_metrics(
            events, CodeType.DOCUMENTATION
        )

        return {
            "period": {
                "start": start_date.isoformat() if start_date else None,
                "end": end_date.isoformat() if end_date else None,
            },
            "team_metrics": {
                "code": team_code_metrics,
                "tests": team_test_metrics,
                "documentation": team_doc_metrics,
            },
            "leaderboard": leaderboard,
            "total_developers": len(developer_ids),
        }

    def get_trends(
        self,
        developer_id: Optional[str] = None,
        days: int = 30,
    ) -> Dict:
        """
        Get time-series trends for metrics.

        Args:
            developer_id: Optional developer ID to filter
            days: Number of days to look back

        Returns:
            Dictionary with trend data
        """
        end_date = datetime.now()
        start_date = datetime.fromtimestamp(
            end_date.timestamp() - (days * 24 * 60 * 60)
        )

        # Load events
        events = self.storage.get_all_events(developer_id, start_date, end_date)

        # Group by date
        daily_metrics = {}
        for event in events:
            event_date = datetime.fromisoformat(event["timestamp"]).date()
            if event_date not in daily_metrics:
                daily_metrics[event_date] = []
            daily_metrics[event_date].append(event)

        # Calculate metrics for each day
        trends = []
        for date, day_events in sorted(daily_metrics.items()):
            code_metrics = self.calculator.calculate_loc_metrics(
                day_events, CodeType.CODE
            )
            test_metrics = self.calculator.calculate_loc_metrics(
                day_events, CodeType.TEST
            )
            doc_metrics = self.calculator.calculate_loc_metrics(
                day_events, CodeType.DOCUMENTATION
            )

            trends.append(
                {
                    "date": date.isoformat(),
                    "code": code_metrics,
                    "tests": test_metrics,
                    "documentation": doc_metrics,
                }
            )

        return {
            "developer_id": developer_id,
            "period_days": days,
            "trends": trends,
        }

    def get_features_metrics(
        self,
        limit: int = 20,
    ) -> Dict:
        """
        Get metrics grouped by feature_name.
        
        Args:
            limit: Maximum number of features to return
            
        Returns:
            Dictionary with features and their LOC counts
        """
        # Load all events
        events = self.storage.get_all_events()
        
        # Group by feature_name from metadata
        features = {}
        for event in events:
            metadata = event.get("metadata") or {}
            feature_name = metadata.get("feature_name") if isinstance(metadata, dict) else "unknown"
            if not feature_name:
                feature_name = "unknown"
            
            if feature_name not in features:
                features[feature_name] = {
                    "feature_name": feature_name,
                    "total_loc": 0,
                    "code_loc": 0,
                    "test_loc": 0,
                    "doc_loc": 0,
                    "event_count": 0,
                    "last_updated": None,
                }
            
            features[feature_name]["total_loc"] += event.get("lines", 0)
            features[feature_name]["event_count"] += 1
            
            # Track by type
            event_type = event.get("type", "code")
            if event_type == "code":
                features[feature_name]["code_loc"] += event.get("lines", 0)
            elif event_type == "test":
                features[feature_name]["test_loc"] += event.get("lines", 0)
            elif event_type == "documentation":
                features[feature_name]["doc_loc"] += event.get("lines", 0)
            
            # Track last updated timestamp
            event_timestamp = event.get("timestamp", "")
            if event_timestamp:
                if features[feature_name]["last_updated"] is None or event_timestamp > features[feature_name]["last_updated"]:
                    features[feature_name]["last_updated"] = event_timestamp
        
        # Convert to list and sort by last_updated (most recent first)
        features_list = list(features.values())
        features_list.sort(
            key=lambda x: x["last_updated"] if x["last_updated"] else "",
            reverse=True
        )
        
        # Limit results
        features_list = features_list[:limit]
        
        return {
            "features": features_list,
            "total_features": len(features),
            "showing": len(features_list),
        }
    
    def _calculate_overall_score(
        self,
        ai_loc_status: str,
        ai_test_status: str,
        ai_doc_status: str,
    ) -> float:
        """
        Calculate overall score based on target status.

        Args:
            ai_loc_status: Status for AI LOC
            ai_test_status: Status for AI tests
            ai_doc_status: Status for AI docs

        Returns:
            Overall score (0-100)
        """
        # Weighted scoring
        weights = {
            "ai_loc": 0.5,  # 50% weight
            "ai_tests": 0.3,  # 30% weight
            "ai_docs": 0.2,  # 20% weight
        }

        status_scores = {
            "on-track": 100,
            "below-target": 50,
            "above-target": 75,
        }

        score = (
            status_scores.get(ai_loc_status, 0) * weights["ai_loc"]
            + status_scores.get(ai_test_status, 0) * weights["ai_tests"]
            + status_scores.get(ai_doc_status, 0) * weights["ai_docs"]
        )

        return round(score, 2)
