"""Data provenance and source classification standards for CardioTwin AI.

Every imported health record, signal, and model inference must carry explicit
provenance metadata indicating its origin, licensing, and whether it is
genuine open research data, synthetic EHR, authorized patient data, or a simulation.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class ProvenanceType(str, Enum):
    OPEN_RESEARCH_DATA = "OPEN_RESEARCH_DATA"
    SYNTHETIC_EHR = "SYNTHETIC_EHR"
    AUTHORIZED_PATIENT_DATA = "AUTHORIZED_PATIENT_DATA"
    SIMULATED_SENSOR_STREAM = "SIMULATED_SENSOR_STREAM"


class ProvenanceMetadata(BaseModel):
    provenance_type: ProvenanceType
    source_dataset: str
    dataset_url: str | None = None
    record_id: str
    license: str
    is_synthetic: bool = False
    is_clinical_evidence: bool = False
    collected_at: str | None = None
    imported_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    units_map: dict[str, str] = Field(default_factory=dict)
    limitations: list[str] = Field(default_factory=list)
    attribution: str = ""

    def to_dict(self) -> dict[str, Any]:
        return self.model_dump()


def make_provenance(
    provenance_type: ProvenanceType | str,
    source_dataset: str,
    record_id: str,
    license_str: str,
    dataset_url: str | None = None,
    is_synthetic: bool = False,
    is_clinical_evidence: bool = False,
    units_map: dict[str, str] | None = None,
    limitations: list[str] | None = None,
    attribution: str = "",
) -> ProvenanceMetadata:
    p_type = ProvenanceType(provenance_type) if isinstance(provenance_type, str) else provenance_type
    return ProvenanceMetadata(
        provenance_type=p_type,
        source_dataset=source_dataset,
        dataset_url=dataset_url,
        record_id=record_id,
        license=license_str,
        is_synthetic=is_synthetic,
        is_clinical_evidence=is_clinical_evidence,
        units_map=units_map or {},
        limitations=limitations or [],
        attribution=attribution,
    )
