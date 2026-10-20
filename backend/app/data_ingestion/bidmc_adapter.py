"""Ingestion adapter for the PhysioNet BIDMC PPG and Respiration Dataset."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Any
import numpy as np
import pandas as pd

from .base_adapter import BaseDatasetAdapter
from .dataset_registry import get_dataset_info
from .provenance import ProvenanceMetadata, ProvenanceType, make_provenance
from ..services.preprocessing import clean_ppg_signal


DEFAULT_FIXTURES_DIR = Path(__file__).resolve().parents[1] / "data" / "research_fixtures" / "bidmc"


class BidmcDatasetAdapter(BaseDatasetAdapter):
    """Adapter for official BIDMC PPG recordings (PhysioNet)."""

    def __init__(self, data_dir: Path | str | None = None) -> None:
        super().__init__(dataset_id="bidmc", data_dir=data_dir or DEFAULT_FIXTURES_DIR)
        self.metadata = get_dataset_info("bidmc") or {}

    def list_available_records(self) -> list[str]:
        if not self.data_dir or not self.data_dir.exists():
            return []
        records = []
        for file in self.data_dir.glob("bidmc_*_Signals*.csv"):
            name = file.name.split("_Signals")[0]
            if name not in records:
                records.append(name)
        return sorted(records)

    def parse_signals_csv(self, raw_bytes: bytes) -> dict[str, Any]:
        """Parse raw CSV bytes from a BIDMC Signals file."""
        df = pd.read_csv(BytesIO(raw_bytes))
        # BIDMC standard columns: "Time [s]", " RESP", " PLETH", " V", " AVR", " II"
        # Column names may have leading spaces in original PhysioNet CSVs
        cleaned_cols = {c: c.strip() for c in df.columns}
        df = df.rename(columns=cleaned_cols)

        pleth_col = None
        for candidate in ["PLETH", "PPG", "pleth", "ppg"]:
            if candidate in df.columns:
                pleth_col = candidate
                break

        if pleth_col is None:
            raise ValueError("No PLETH (PPG) waveform column found in the provided BIDMC CSV.")

        time_col = None
        for candidate in ["Time [s]", "Time", "time", "t"]:
            if candidate in df.columns:
                time_col = candidate
                break

        pleth_signal = pd.to_numeric(df[pleth_col], errors="coerce").fillna(0.0).to_numpy(dtype=float)
        if time_col and time_col in df.columns:
            timestamps = pd.to_numeric(df[time_col], errors="coerce").fillna(0.0).to_numpy(dtype=float)
            sampling_rate = 125.0
            if len(timestamps) > 1:
                dt = np.median(np.diff(timestamps))
                if dt > 0:
                    sampling_rate = float(round(1.0 / dt, 1))
        else:
            sampling_rate = 125.0
            timestamps = np.arange(len(pleth_signal)) / sampling_rate

        return {
            "signal": pleth_signal,
            "timestamps": timestamps,
            "sampling_rate": sampling_rate,
            "total_samples": len(pleth_signal),
            "duration_seconds": float(round(len(pleth_signal) / sampling_rate, 2)),
            "channels_present": list(df.columns),
            "source_column": pleth_col,
        }

    def load_record(self, record_id: str) -> dict[str, Any]:
        if not self.data_dir:
            raise FileNotFoundError("BIDMC data directory is not configured.")
        matches = list(self.data_dir.glob(f"{record_id}_Signals*.csv"))
        if not matches:
            raise FileNotFoundError(f"Record {record_id} not found in {self.data_dir}")

        raw = matches[0].read_bytes()
        parsed = self.parse_signals_csv(raw)
        provenance = self.get_provenance(record_id)

        return {
            "record_id": record_id,
            "provenance": provenance.to_dict(),
            "sampling_frequency_hz": parsed["sampling_rate"],
            "duration_seconds": parsed["duration_seconds"],
            "total_samples": parsed["total_samples"],
            "channels": parsed["channels_present"],
            "signal": parsed["signal"],
            "timestamps": parsed["timestamps"],
        }

    def get_provenance(self, record_id: str) -> ProvenanceMetadata:
        return make_provenance(
            provenance_type=ProvenanceType.OPEN_RESEARCH_DATA,
            source_dataset="PhysioNet BIDMC PPG and Respiration Dataset v1.0.0",
            record_id=record_id,
            license_str=self.metadata.get("license", "Open Data Commons Public Domain (PDDL)"),
            dataset_url=self.metadata.get("source_url"),
            is_synthetic=False,
            is_clinical_evidence=True,
            units_map={"PLETH": "Arbitrary ADC units", "RESP": "Impedance pneumogram", "Time": "seconds"},
            limitations=self.metadata.get("known_limitations", []),
            attribution=self.metadata.get("attribution", ""),
        )
