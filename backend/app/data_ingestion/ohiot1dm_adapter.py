"""Ingestion adapter specification for the OhioT1DM Continuous Glucose Monitoring Dataset."""

from __future__ import annotations

from pathlib import Path
from typing import Any
import pandas as pd

from .base_adapter import BaseDatasetAdapter
from .dataset_registry import get_dataset_info
from .provenance import ProvenanceMetadata, ProvenanceType, make_provenance


DEFAULT_FIXTURES_DIR = Path(__file__).resolve().parents[1] / "data" / "research_fixtures" / "ohiot1dm"


class OhioT1DMPendingAccessError(PermissionError):
    """Raised when OhioT1DM raw dataset files are requested without a verified Data Use Agreement."""
    pass


class OhioT1DMDatasetAdapter(BaseDatasetAdapter):
    """Adapter for OhioT1DM CGM Dataset (Requires Data Use Agreement)."""

    def __init__(self, data_dir: Path | str | None = None) -> None:
        super().__init__(dataset_id="ohiot1dm", data_dir=data_dir or DEFAULT_FIXTURES_DIR)
        self.metadata = get_dataset_info("ohiot1dm") or {}

    def list_available_records(self) -> list[str]:
        if not self.data_dir or not self.data_dir.exists():
            return []
        records = []
        for file in self.data_dir.glob("*.xml"):
            records.append(file.stem)
        for file in self.data_dir.glob("*.csv"):
            records.append(file.stem)
        return sorted(records)

    def load_record(self, record_id: str) -> dict[str, Any]:
        """Load OhioT1DM continuous glucose records if legally authorized."""
        if not self.data_dir or not self.list_available_records():
            raise OhioT1DMPendingAccessError(
                "OhioT1DM raw data requires an executed Research Data Use Agreement (DUA). "
                "Apply at https://webpages.charlotte.edu/rbunescu/ohiot1dm.html to obtain credentials. "
                "Once granted, place XML/CSV files into backend/app/data/research_fixtures/ohiot1dm/."
            )

        csv_file = self.data_dir / f"{record_id}.csv"
        if csv_file.exists():
            df = pd.read_csv(csv_file)
            provenance = self.get_provenance(record_id)
            return {
                "record_id": record_id,
                "dataset": "OhioT1DM",
                "total_readings": len(df),
                "sampling_interval_minutes": 5,
                "prediction_horizon_minutes": 120,
                "provenance": provenance.to_dict(),
            }

        raise FileNotFoundError(f"Record {record_id} not found.")

    def get_provenance(self, record_id: str) -> ProvenanceMetadata:
        return make_provenance(
            provenance_type=ProvenanceType.OPEN_RESEARCH_DATA,
            source_dataset="OhioT1DM Continuous Glucose Monitoring Dataset (2020)",
            record_id=record_id,
            license_str=self.metadata.get("license", "Restricted Research Data Use Agreement"),
            dataset_url=self.metadata.get("source_url"),
            is_synthetic=False,
            is_clinical_evidence=True,
            units_map={"glucose": "mg/dL", "insulin": "units", "Time": "5-minute epoch"},
            limitations=self.metadata.get("known_limitations", []),
            attribution=self.metadata.get("attribution", ""),
        )
