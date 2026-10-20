"""Ingestion adapter for the PhysioNet MIT-BIH Arrhythmia Database."""

from __future__ import annotations

from pathlib import Path
from typing import Any
import numpy as np
import pandas as pd

from .base_adapter import BaseDatasetAdapter
from .dataset_registry import get_dataset_info
from .provenance import ProvenanceMetadata, ProvenanceType, make_provenance


DEFAULT_FIXTURES_DIR = Path(__file__).resolve().parents[1] / "data" / "research_fixtures" / "mitbih"


class MitBihDatasetAdapter(BaseDatasetAdapter):
    """Adapter for official MIT-BIH Arrhythmia Database recordings (PhysioNet)."""

    def __init__(self, data_dir: Path | str | None = None) -> None:
        super().__init__(dataset_id="mitbih", data_dir=data_dir or DEFAULT_FIXTURES_DIR)
        self.metadata = get_dataset_info("mitbih") or {}

    def list_available_records(self) -> list[str]:
        if not self.data_dir or not self.data_dir.exists():
            return []
        records = set()
        # Look for wfdb files (.dat/.hea) or converted fixture CSVs
        for file in self.data_dir.glob("*.hea"):
            records.add(file.stem)
        for file in self.data_dir.glob("mitbih_*.csv"):
            records.add(file.stem)
        return sorted(list(records))

    def load_record(self, record_id: str) -> dict[str, Any]:
        """Load MIT-BIH record using WFDB if available, or fallback to converted CSV fixture."""
        if not self.data_dir:
            raise FileNotFoundError("MIT-BIH data directory is not configured.")

        # Check for WFDB files first
        hea_file = self.data_dir / f"{record_id}.hea"
        csv_file = self.data_dir / f"{record_id}.csv"
        if not csv_file.exists():
            # Try with prefix
            alt_csv = self.data_dir / f"mitbih_{record_id}.csv"
            if alt_csv.exists():
                csv_file = alt_csv

        if hea_file.exists():
            try:
                import wfdb
                record = wfdb.rdrecord(str(self.data_dir / record_id))
                ann = None
                try:
                    ann = wfdb.rdann(str(self.data_dir / record_id), "atr")
                except Exception:
                    pass

                signal = record.p_signal[:, 0] if record.p_signal is not None else np.array([])
                lead_name = record.sig_name[0] if record.sig_name else "MLII"
                fs = float(record.fs)
                timestamps = np.arange(len(signal)) / fs

                annotations_list = []
                if ann is not None:
                    for sample, symbol in zip(ann.sample, ann.symbol):
                        annotations_list.append({
                            "sample_index": int(sample),
                            "time_seconds": float(round(sample / fs, 3)),
                            "symbol": symbol,
                            "type": "Normal" if symbol in ["N", "·"] else "Ventricular" if symbol == "V" else "Supraventricular" if symbol == "A" else symbol,
                        })

                provenance = self.get_provenance(record_id)
                return {
                    "record_id": record_id,
                    "lead_name": lead_name,
                    "sampling_frequency_hz": fs,
                    "duration_seconds": float(round(len(signal) / fs, 2)),
                    "total_samples": len(signal),
                    "signal": signal,
                    "timestamps": timestamps,
                    "annotations": annotations_list,
                    "provenance": provenance.to_dict(),
                }
            except ImportError:
                pass

        if csv_file.exists():
            df = pd.read_csv(csv_file)
            cleaned_cols = {c: c.strip() for c in df.columns}
            df = df.rename(columns=cleaned_cols)

            sig_col = [c for c in ["MLII", "ECG", "lead_ii", "val", "signal"] if c in df.columns]
            lead_name = sig_col[0] if sig_col else df.select_dtypes(include=["number"]).columns[0]
            signal = df[lead_name].to_numpy(dtype=float)

            fs = 360.0
            if "Time" in df.columns:
                timestamps = df["Time"].to_numpy(dtype=float)
            else:
                timestamps = np.arange(len(signal)) / fs

            annotations_list = []
            if "Annotation" in df.columns:
                for idx, sym in enumerate(df["Annotation"]):
                    if pd.notna(sym) and str(sym).strip():
                        annotations_list.append({
                            "sample_index": idx,
                            "time_seconds": float(round(idx / fs, 3)),
                            "symbol": str(sym).strip(),
                            "type": "Normal" if str(sym).strip() in ["N", "·"] else "Ventricular" if str(sym).strip() == "V" else "Other",
                        })

            provenance = self.get_provenance(record_id)
            return {
                "record_id": record_id,
                "lead_name": lead_name,
                "sampling_frequency_hz": fs,
                "duration_seconds": float(round(len(signal) / fs, 2)),
                "total_samples": len(signal),
                "signal": signal,
                "timestamps": timestamps,
                "annotations": annotations_list,
                "provenance": provenance.to_dict(),
            }

        raise FileNotFoundError(f"MIT-BIH record {record_id} not found in {self.data_dir}")

    def get_provenance(self, record_id: str) -> ProvenanceMetadata:
        return make_provenance(
            provenance_type=ProvenanceType.OPEN_RESEARCH_DATA,
            source_dataset="PhysioNet MIT-BIH Arrhythmia Database v1.0.0",
            record_id=record_id,
            license_str=self.metadata.get("license", "Open Data Commons Attribution License v1.0"),
            dataset_url=self.metadata.get("source_url"),
            is_synthetic=False,
            is_clinical_evidence=True,
            units_map={"signal": "mV", "Time": "seconds"},
            limitations=self.metadata.get("known_limitations", []),
            attribution=self.metadata.get("attribution", ""),
        )
