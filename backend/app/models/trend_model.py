"""Time-series health trend analysis and device connection management."""

from __future__ import annotations

from io import BytesIO
from typing import Any

import numpy as np
import pandas as pd

from ..utils.disclaimer import DISCLAIMER
from ..utils.validators import as_float


# Device streaming connection state (in-memory simulator/state machine)
_DEVICE_STATE = {
    "connection_state": "DISCONNECTED",
    "device_name": None,
    "last_received_timestamp": None,
    "is_receiving": False,
    "status_message": "No live sensor connection.",
    "supported_protocols": ["BLE (Bluetooth Low Energy)", "WebSocket", "Serial / COM"],
}


def get_device_stream_status() -> dict[str, Any]:
    return dict(_DEVICE_STATE)


def set_device_stream_status(state: str, device_name: str | None = None, message: str | None = None) -> dict[str, Any]:
    global _DEVICE_STATE
    valid_states = {"DISCONNECTED", "CONNECTING", "CONNECTED", "RECEIVING_DATA", "STALE_DATA", "ERROR"}
    if state not in valid_states:
        raise ValueError(f"Invalid connection state: {state}. Must be one of {valid_states}")

    _DEVICE_STATE["connection_state"] = state
    _DEVICE_STATE["device_name"] = device_name or _DEVICE_STATE["device_name"]
    _DEVICE_STATE["is_receiving"] = (state == "RECEIVING_DATA")
    if message:
        _DEVICE_STATE["status_message"] = message
    elif state == "DISCONNECTED":
        _DEVICE_STATE["status_message"] = "No live sensor connection."
    elif state == "CONNECTING":
        _DEVICE_STATE["status_message"] = f"Attempting connection to {device_name or 'sensor'}..."
    elif state == "CONNECTED":
        _DEVICE_STATE["status_message"] = f"Connected to {device_name or 'device'}. Waiting for telemetry stream..."
    elif state == "RECEIVING_DATA":
        _DEVICE_STATE["status_message"] = f"Receiving live telemetry from {device_name or 'device'}."
        _DEVICE_STATE["last_received_timestamp"] = pd.Timestamp.utcnow().isoformat()
    elif state == "STALE_DATA":
        _DEVICE_STATE["status_message"] = "Telemetry stream paused or delayed (stale data)."
    elif state == "ERROR":
        _DEVICE_STATE["status_message"] = "Sensor communication error."

    return dict(_DEVICE_STATE)


def _load_history(raw: bytes | None, records: list[dict[str, Any]] | None) -> pd.DataFrame | None:
    if records and len(records) > 0:
        return pd.DataFrame(records)
    if raw:
        return pd.read_csv(BytesIO(raw))
    return None


def _direction(values: pd.Series) -> str:
    clean = pd.to_numeric(values, errors="coerce").dropna()
    if len(clean) < 2:
        return "insufficient_data"
    x = np.arange(len(clean))
    slope = float(np.polyfit(x, clean.to_numpy(dtype=float), 1)[0])
    tolerance = max(abs(float(clean.mean())) * 0.01, 0.5)
    if slope > tolerance:
        return "increasing"
    if slope < -tolerance:
        return "decreasing"
    return "stable"


def analyze_trends(raw: bytes | None = None, records: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    dataframe = _load_history(raw, records)

    if dataframe is None or dataframe.empty or len(dataframe) < 2:
        return {
            "status": "no_data",
            "available": False,
            "message": "No historical readings available.",
            "trend_direction": {},
            "risk_change_percentage": 0.0,
            "abnormal_trend_flags": [],
            "chart_data": [],
            "explanation": "At least 2 historical readings are required to calculate trends.",
            "disclaimer": DISCLAIMER,
        }

    metric_map = {
        "systolic_bp": "bp_trend",
        "heart_rate": "heart_rate_trend",
        "spo2": "spo2_trend",
        "sleep_hours": "sleep_trend",
        "risk_score": "risk_score_trend",
        "signal_quality": "signal_quality_trend",
    }
    trends = {label: _direction(dataframe[column]) for column, label in metric_map.items() if column in dataframe}
    flags = []
    if trends.get("bp_trend") == "increasing":
        flags.append("Blood pressure trend is increasing.")
    if trends.get("spo2_trend") == "decreasing":
        flags.append("SpO2 trend is decreasing.")
    if trends.get("risk_score_trend") == "increasing":
        flags.append("Calculated risk indicator is increasing across recent readings.")
    if trends.get("sleep_trend") == "decreasing":
        flags.append("Reported sleep duration is decreasing.")

    risk_change = 0.0
    if "risk_score" in dataframe and len(dataframe["risk_score"].dropna()) >= 2:
        first = as_float(dataframe["risk_score"].dropna().iloc[0], 0)
        last = as_float(dataframe["risk_score"].dropna().iloc[-1], 0)
        risk_change = 0 if first == 0 else (last - first) / first * 100

    explanation = (
        "Blood pressure or risk is trending upward across saved readings. Sleep and heart rate may be contributing."
        if flags
        else "Recent saved readings appear broadly stable based on available history."
    )
    return {
        "status": "processed",
        "available": True,
        "trend_direction": trends,
        "risk_change_percentage": round(risk_change, 2),
        "abnormal_trend_flags": flags,
        "chart_data": dataframe.fillna("").to_dict(orient="records"),
        "explanation": explanation,
        "disclaimer": DISCLAIMER,
    }


def live_simulation() -> dict[str, Any]:
    """Simulated telemetry stream for UI demonstration only."""
    import math
    import time

    now = time.time()
    heart_rate = 84 + 8 * math.sin(now / 12)
    spo2 = 96 + 1.5 * math.sin(now / 18)
    signal_quality = 86 + 6 * math.sin(now / 15)
    systolic = 120 + (heart_rate - 80) * 0.45
    diastolic = 78 + (heart_rate - 80) * 0.18
    risk_level = "Mild" if systolic < 130 and heart_rate < 96 else "Moderate"
    return {
        "status": "SIMULATED_STREAM",
        "provenance_type": "SIMULATED_SENSOR_STREAM",
        "is_simulated": True,
        "heart_rate": round(heart_rate),
        "spo2": round(spo2, 1),
        "ppg_signal_quality": round(signal_quality, 1),
        "estimated_bp": {"systolic": round(systolic), "diastolic": round(diastolic)},
        "risk_level": risk_level,
        "timestamp": pd.Timestamp.utcnow().isoformat(),
        "warning": "Simulated waveform stream for UI testing only. NOT live patient telemetry.",
        "disclaimer": DISCLAIMER,
    }
