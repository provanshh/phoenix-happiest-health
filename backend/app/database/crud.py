"""CRUD helpers for health memory, patient isolation, and audit events."""

from __future__ import annotations

import json
from typing import Any

from ..utils.validators import as_float
from .db import get_connection, init_db


def record_audit_event(
    event_type: str,
    details: str,
    patient_id: str | None = None,
    user_role: str = "clinician",
    record_id: str | None = None,
    provenance_type: str | None = None,
) -> int:
    init_db()
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO audit_events (
                event_type, user_role, patient_id, record_id, provenance_type, details
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (event_type, user_role, patient_id, record_id, provenance_type, details),
        )
        connection.commit()
        return int(cursor.lastrowid or 0)


def save_reading(payload: dict[str, Any]) -> dict[str, Any]:
    init_db()
    patient = payload.get("patient") or payload.get("tabular_result", {}).get("vitals_summary", {})
    fusion = payload.get("fusion_result") or payload
    signal = payload.get("signal_result") or {}
    patient_id = str(payload.get("patient_id") or patient.get("patient_id") or "patient_default")
    prov = payload.get("provenance") or {}
    provenance_type = prov.get("provenance_type") or "AUTHORIZED_PATIENT_DATA"
    source_dataset = prov.get("source_dataset") or "manual_entry"

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO readings (
                patient_id, provenance_type, source_dataset, final_risk_score, risk_category,
                systolic_bp, diastolic_bp, heart_rate, spo2, sleep_hours, signal_quality, payload_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                provenance_type,
                source_dataset,
                as_float(fusion.get("final_risk_score", fusion.get("risk_score")), 0),
                str(fusion.get("risk_category", "Unknown")),
                as_float(patient.get("systolic_bp"), 0),
                as_float(patient.get("diastolic_bp"), 0),
                as_float(patient.get("heart_rate"), 0),
                as_float(patient.get("spo2"), 0),
                as_float(patient.get("sleep_hours"), 0),
                as_float(signal.get("quality_score", signal.get("signal_quality")), 0),
                json.dumps(payload),
            ),
        )
        connection.commit()
        reading_id = cursor.lastrowid

    record_audit_event(
        event_type="READING_SAVED",
        details=f"Saved reading {reading_id} for patient {patient_id}. Score: {fusion.get('final_risk_score')}",
        patient_id=patient_id,
        record_id=str(reading_id),
        provenance_type=provenance_type,
    )
    return {"id": reading_id, "saved": True, "patient_id": patient_id}


def list_readings(patient_id: str | None = None, limit: int = 25) -> list[dict[str, Any]]:
    init_db()
    with get_connection() as connection:
        if patient_id:
            rows = connection.execute(
                "SELECT * FROM readings WHERE patient_id = ? ORDER BY id DESC LIMIT ?",
                (patient_id, limit),
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT * FROM readings ORDER BY id DESC LIMIT ?",
                (limit,),
            ).fetchall()
    result = []
    for row in rows:
        item = dict(row)
        item["payload"] = json.loads(item.pop("payload_json"))
        result.append(item)
    return result


def compare_last_reading(patient_id: str | None = None) -> dict[str, Any]:
    readings = list_readings(patient_id=patient_id, limit=2)
    if len(readings) < 2:
        return {
            "previous_reading": None,
            "current_reading": readings[0] if readings else None,
            "changes": {},
            "risk_delta": 0,
            "explanation": "At least 2 saved historical readings are required for longitudinal comparison.",
        }
    current, previous = readings[0], readings[1]
    changes = {}
    for metric in ["final_risk_score", "systolic_bp", "diastolic_bp", "heart_rate", "spo2", "sleep_hours", "signal_quality"]:
        curr_val = as_float(current.get(metric), 0)
        prev_val = as_float(previous.get(metric), 0)
        delta = curr_val - prev_val
        changes[metric] = {
            "current": curr_val,
            "previous": prev_val,
            "delta": round(delta, 2),
            "trend": "up" if delta > 0.5 else "down" if delta < -0.5 else "stable",
        }
    risk_delta = changes["final_risk_score"]["delta"]
    explanation = (
        f"Cardiovascular risk changed by {risk_delta:+.1f} points compared to previous record."
        if abs(risk_delta) > 1
        else "Risk score is stable compared to previous record."
    )
    return {
        "current_reading": current,
        "previous_reading": previous,
        "changes": changes,
        "risk_delta": risk_delta,
        "explanation": explanation,
    }
