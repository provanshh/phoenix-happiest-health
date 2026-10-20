"""Base abstract class for research dataset ingestion adapters."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any
from .provenance import ProvenanceMetadata


class BaseDatasetAdapter(ABC):
    """Abstract base adapter enforcing strict schema, validation, and provenance."""

    def __init__(self, dataset_id: str, data_dir: Path | str | None = None) -> None:
        self.dataset_id = dataset_id
        self.data_dir = Path(data_dir) if data_dir else None

    @abstractmethod
    def list_available_records(self) -> list[str]:
        """List record identifiers available in the local repository or fixture store."""
        pass

    @abstractmethod
    def load_record(self, record_id: str) -> dict[str, Any]:
        """Load, parse, and validate a single record by its identifier."""
        pass

    @abstractmethod
    def get_provenance(self, record_id: str) -> ProvenanceMetadata:
        """Return the strict provenance metadata for the specified record."""
        pass

    def validate_schema(self, data: Any) -> bool:
        """Validate that incoming raw payload matches expected schema."""
        return True
