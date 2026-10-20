"""API routes for official research datasets, metadata catalog, and ML model inference."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..data_ingestion import (
    BidmcDatasetAdapter,
    MitBihDatasetAdapter,
    SyntheaDatasetAdapter,
    OhioT1DMDatasetAdapter,
    get_dataset_info,
    list_datasets,
)
from ..utils.disclaimer import with_disclaimer


router = APIRouter(prefix="/datasets", tags=["Research Datasets"])

_ADAPTERS = {
    "bidmc": BidmcDatasetAdapter(),
    "mitbih": MitBihDatasetAdapter(),
    "synthea": SyntheaDatasetAdapter(),
    "ohiot1dm": OhioT1DMDatasetAdapter(),
}

ROOT_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = ROOT_DIR / "models" / "mitbih_arrhythmia_model.joblib"
EVAL_PATH = ROOT_DIR / "models" / "mitbih_arrhythmia_evaluation.json"


class EcgPredictionPayload(BaseModel):
    record_id: str | None = None
    signal: list[float] | None = None
    fs: float = Field(default=360.0)


@router.get("")
async def get_datasets_catalog() -> dict[str, Any]:
    """Retrieve the official catalog of supported research datasets with licensing and limitations."""
    return with_disclaimer({"datasets": list_datasets()})


@router.get("/{dataset_id}")
async def get_dataset_details(dataset_id: str) -> dict[str, Any]:
    info = get_dataset_info(dataset_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found in registry.")
    return with_disclaimer(info)


@router.get("/{dataset_id}/records")
async def list_dataset_records(dataset_id: str) -> dict[str, Any]:
    adapter = _ADAPTERS.get(dataset_id.lower().strip())
    if not adapter:
        raise HTTPException(status_code=404, detail=f"No ingestion adapter for '{dataset_id}'.")
    records = adapter.list_available_records()
    return with_disclaimer({
        "dataset_id": dataset_id,
        "available_records": records,
        "count": len(records),
    })


@router.get("/{dataset_id}/load/{record_id}")
async def load_dataset_record(dataset_id: str, record_id: str) -> dict[str, Any]:
    adapter = _ADAPTERS.get(dataset_id.lower().strip())
    if not adapter:
        raise HTTPException(status_code=404, detail=f"No ingestion adapter for '{dataset_id}'.")
    try:
        loaded = adapter.load_record(record_id)
        if "signal" in loaded and hasattr(loaded["signal"], "tolist"):
            loaded["signal"] = loaded["signal"].tolist()
        if "timestamps" in loaded and hasattr(loaded["timestamps"], "tolist"):
            loaded["timestamps"] = loaded["timestamps"].tolist()
        return with_disclaimer(loaded)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to ingest record: {exc}") from exc


def extract_beat_features(signal: np.ndarray, beat_idx: int, prev_idx: int | None, next_idx: int | None, fs: float = 360.0) -> list[float]:
    pre_rr = (beat_idx - prev_idx) / fs if prev_idx is not None else 0.8
    post_rr = (next_idx - beat_idx) / fs if next_idx is not None else 0.8
    local_ratio = pre_rr / (post_rr + 1e-6)

    w_start = max(0, beat_idx - 25)
    w_end = min(len(signal), beat_idx + 40)
    qrs_segment = signal[w_start:w_end]

    peak_amp = float(signal[beat_idx])
    qrs_ptp = float(np.ptp(qrs_segment)) if len(qrs_segment) > 0 else 0.0
    qrs_energy = float(np.sum(qrs_segment ** 2)) if len(qrs_segment) > 0 else 0.0
    qrs_variance = float(np.var(qrs_segment)) if len(qrs_segment) > 0 else 0.0

    return [pre_rr, post_rr, local_ratio, peak_amp, qrs_ptp, qrs_energy, qrs_variance]


@router.post("/predict/ecg-arrhythmia")
async def predict_ecg_arrhythmia(payload: EcgPredictionPayload) -> dict[str, Any]:
    """Run inference using the trained MIT-BIH Arrhythmia Random Forest Model."""
    if not MODEL_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail="Trained arrhythmia model not found. Run scripts/train_mitbih_arrhythmia.py first.",
        )

    # Load signal from record_id or direct payload
    raw_signal = payload.signal
    fs = payload.fs
    provenance = None

    if payload.record_id:
        adapter = _ADAPTERS["mitbih"]
        try:
            rec = adapter.load_record(payload.record_id)
            raw_signal = rec["signal"].tolist() if hasattr(rec["signal"], "tolist") else list(rec["signal"])
            fs = rec["sampling_frequency_hz"]
            provenance = rec["provenance"]
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Could not load record '{payload.record_id}': {exc}")

    if not raw_signal or len(raw_signal) < 100:
        raise HTTPException(status_code=400, detail="Insufficient ECG signal samples provided (minimum 100 samples required).")

    sig = np.array(raw_signal, dtype=float)

    # Simple peak detection for R-peaks
    try:
        from scipy.signal import find_peaks
        distance = max(1, int(fs * 0.4))
        prominence = max(0.1, float(np.std(sig)) * 0.4)
        peaks, _ = find_peaks(sig, distance=distance, prominence=prominence)
    except Exception:
        peaks = np.array([])

    if len(peaks) == 0:
        return with_disclaimer({
            "status": "no_peaks_detected",
            "message": "Could not identify distinct QRS complexes in the provided ECG segment.",
            "detected_beats": 0,
            "beat_predictions": [],
        })

    clf = joblib.load(MODEL_PATH)
    eval_metrics = json.loads(EVAL_PATH.read_text(encoding="utf-8")) if EVAL_PATH.exists() else {}

    features = []
    beat_times = []
    for i, peak_idx in enumerate(peaks):
        prev_idx = peaks[i - 1] if i > 0 else None
        next_idx = peaks[i + 1] if i < len(peaks) - 1 else None
        f = extract_beat_features(sig, int(peak_idx), prev_idx, next_idx, fs=fs)
        features.append(f)
        beat_times.append(float(round(peak_idx / fs, 3)))

    preds = clf.predict(np.array(features))

    beat_results = []
    counts = {"N": 0, "V": 0, "S": 0, "Other": 0}
    for time_s, pred in zip(beat_times, preds):
        label_name = "Normal Sinus" if pred == "N" else "Ventricular Ectopic (PVC)" if pred == "V" else "Supraventricular"
        counts[pred if pred in counts else "Other"] += 1
        beat_results.append({
            "time_seconds": time_s,
            "beat_class": pred,
            "description": label_name,
        })

    total_beats = len(beat_results)
    ectopic_burden = round(((total_beats - counts.get("N", 0)) / total_beats * 100.0), 1) if total_beats > 0 else 0.0

    return with_disclaimer({
        "status": "processed",
        "model_name": "MIT-BIH Arrhythmia Random Forest Classifier",
        "model_version": "1.0.0",
        "total_beats_analyzed": total_beats,
        "beat_counts": counts,
        "ectopic_burden_percent": ectopic_burden,
        "beat_predictions": beat_results[:60],  # Return up to 60 beats for UI
        "benchmark_metrics": eval_metrics.get("metrics", {}),
        "system_status": "RESEARCH_BENCHMARK_MODEL",
        "clinical_notice": "Experimental research model. Beat classification indicates morphology; NOT a clinical diagnosis.",
        "provenance": provenance,
    })
