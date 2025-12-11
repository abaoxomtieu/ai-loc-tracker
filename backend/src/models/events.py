"""Pydantic models for code tracking events."""

from datetime import datetime
from enum import Enum
from typing import Optional, Union
from pydantic import BaseModel, Field


class CodeSource(str, Enum):
    """Source of code generation."""

    COMPLETION = "completion"  # Inline completion from AI
    AGENT = "agent"  # Code from IDE agent (MCP)
    MANUAL = "manual"  # Manual code written by developer


class CodeType(str, Enum):
    """Type of code being tracked."""

    CODE = "code"
    TEST = "test"
    DOCUMENTATION = "documentation"


class CodeInsertionEvent(BaseModel):
    """Event for code insertion tracking."""

    type: CodeType = Field(default=CodeType.CODE, description="Type of code")
    source: CodeSource = Field(
        description="Source of code: completion, agent, or manual"
    )
    lines: int = Field(gt=0, description="Number of lines of code")
    file_path: str = Field(description="Path to the file")
    language: Optional[str] = Field(default=None, description="Programming language")
    developer_id: str = Field(description="Developer identifier")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Event timestamp"
    )
    metadata: Optional[dict] = Field(default=None, description="Additional metadata")


class TestGenerationEvent(BaseModel):
    """Event for test generation tracking."""

    type: CodeType = Field(default=CodeType.TEST, description="Type of code")
    source: CodeSource = Field(
        description="Source of test: completion, agent, or manual"
    )
    lines: int = Field(gt=0, description="Number of lines of test code")
    file_path: str = Field(description="Path to the test file")
    test_framework: Optional[str] = Field(
        default=None, description="Test framework used"
    )
    coverage: Optional[float] = Field(
        default=None, ge=0, le=100, description="Test coverage percentage"
    )
    developer_id: str = Field(description="Developer identifier")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Event timestamp"
    )
    metadata: Optional[dict] = Field(default=None, description="Additional metadata")


class DocumentationEvent(BaseModel):
    """Event for documentation tracking."""

    type: CodeType = Field(default=CodeType.DOCUMENTATION, description="Type of code")
    source: CodeSource = Field(
        description="Source of documentation: completion, agent, or manual"
    )
    lines: int = Field(gt=0, description="Number of lines of documentation")
    file_path: str = Field(description="Path to the file")
    doc_type: Optional[str] = Field(
        default=None, description="Type of documentation (comment, readme, api-doc)"
    )
    developer_id: str = Field(description="Developer identifier")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Event timestamp"
    )
    metadata: Optional[dict] = Field(default=None, description="Additional metadata")


# Union type for all events
Event = Union[CodeInsertionEvent, TestGenerationEvent, DocumentationEvent]
