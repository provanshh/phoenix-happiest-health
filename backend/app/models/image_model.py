"""Medical report image OCR and indicator extraction."""

from __future__ import annotations

from io import BytesIO
from typing import Any

from ..data_ingestion.provenance import ProvenanceType, make_provenance
from ..services.feature_extraction import bp_stage, extract_numeric_indicators, score_band, warning
from ..utils.config import clamp
from ..utils.validators import percentage


def _ocr_image(raw: bytes | None) -> str:
    if not raw:
        return ""
    try:
        from PIL import Image
        import pytesseract

        image = Image.open(BytesIO(raw))
        return pytesseract.image_to_string(image).strip()
    except Exception:
        return ""


def _bytes_to_possible_text(raw: bytes | None) -> str:
    if not raw:
        return ""
    try:
        decoded = raw.decode("utf-8", errors="ignore")
    except Exception:
        return ""
    return decoded if any(token in decoded.lower() for token in ("bp", "ecg", "cholesterol", "glucose", "spo2", "troponin")) else ""


def analyze_medical_image(
    raw: bytes | None = None,
    filename: str | None = None,
    provenance: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Extract clinical values from medical report images via OCR. Rejects empty inputs without mock fallbacks."""
    if not raw:
        return {
            "available": False,
            "status": "no_image_provided",
            "error": "No medical report image was provided. Upload an image or report file.",
            "risk_score": 0.0,
            "confidence_score": 0.0,
            "ocr_text": "",
            "extracted_values": {},
            "image_feature_scores": {},
            "summary": "No report image provided.",
            "extracted_text": "",
            "report_summary": "No report image provided.",
            "image_risk_score": 0.0,
            "image_quality_note": "No image",
            "explanation": "No medical report image uploaded.",
            "warning_flags": [],
            "provenance": None,
        }

    ocr_text = _ocr_image(raw) or _bytes_to_possible_text(raw)
    if not ocr_text.strip():
        return {
            "available": False,
            "status": "no_text_extracted",
            "error": "OCR could not detect readable clinical text in the uploaded image. Check image resolution or install Tesseract OCR.",
            "risk_score": 0.0,
            "confidence_score": 0.0,
            "ocr_text": "",
            "extracted_values": {},
            "image_feature_scores": {},
            "summary": "Unreadable report image.",
            "extracted_text": "",
            "report_summary": "Unreadable report image.",
            "image_risk_score": 0.0,
            "image_quality_note": "OCR failed to detect readable text",
            "explanation": "No structured or readable text was found in the uploaded file.",
            "warning_flags": [
                warning("Unreadable Report Image", "medium", "OCR failed to detect clinical keywords or values from the uploaded image.")
            ],
            "provenance": None,
        }

    extracted = extract_numeric_indicators(ocr_text)
    scores = {
        "blood_pressure": 0.0,
        "oxygen": max(0.0, 95 - float(extracted.get("spo2", 98))) * 4.0,
        "lipids": max(0.0, float(extracted.get("ldl", 100)) - 120) * 0.22
        + max(0.0, float(extracted.get("cholesterol", 180)) - 200) * 0.12,
        "glucose": max(0.0, float(extracted.get("glucose", 95)) - 110) * 0.18,
        "troponin": 28.0 if float(extracted.get("troponin", 0)) > 0.04 else 0.0,
        "keyword_findings": 0.0,
    }

    if "systolic_bp" in extracted and "diastolic_bp" in extracted:
        scores["blood_pressure"] = max(0.0, extracted["systolic_bp"] - 120) * 0.45 + max(0.0, extracted["diastolic_bp"] - 80) * 0.6

    lowered = ocr_text.lower()
    for term in ("abnormal ecg", "arrhythmia", "borderline", "hypertrophy"):
        if term in lowered:
            scores["keyword_findings"] += 10
    for term in ("ischemia", "stemi", "myocardial infarction", "acute coronary"):
        if term in lowered:
            scores["keyword_findings"] += 22

    risk_score = clamp(sum(scores.values()))
    flags = []
    if "troponin" in extracted and extracted["troponin"] > 0.04:
        flags.append(warning("Elevated troponin in report", "high", "OCR detected troponin above the standard threshold. Requires clinical verification."))
    if "systolic_bp" in extracted and "diastolic_bp" in extracted:
        stage = bp_stage(extracted["systolic_bp"], extracted["diastolic_bp"])
        if "Hypertension" in stage or "crisis" in stage:
            flags.append(warning("Report BP finding", "medium", f"OCR detected BP in the {stage.lower()}."))
    if any(term in lowered for term in ("ischemia", "stemi", "myocardial infarction", "acute coronary")):
        flags.append(warning("Critical report keyword", "high", "OCR text contained an urgent cardiovascular term. Requires immediate clinical verification."))
    elif scores["keyword_findings"] > 0:
        flags.append(warning("Report keyword finding", "medium", "OCR text contained potentially relevant cardiovascular terms."))

    summary = (
        "OCR successfully extracted structured report values and cardiovascular terms."
        if extracted
        else "OCR detected text but no standard numeric vitals/lab values were matched."
    )

    prov = provenance or make_provenance(
        ProvenanceType.AUTHORIZED_PATIENT_DATA,
        "User Document OCR",
        filename or "uploaded_report",
        "User Provided",
        limitations=["OCR output is unverified machine text; must be confirmed against original document."],
    ).to_dict()

    return {
        "available": True,
        "status": "processed",
        "risk_score": percentage(risk_score),
        "risk_category": score_band(risk_score),
        "filename": filename or "report_document",
        "ocr_text": ocr_text[:2000],
        "extracted_values": extracted,
        "image_feature_scores": {name: round(value, 2) for name, value in scores.items()},
        "summary": summary,
        "extracted_text": ocr_text[:2000],
        "report_summary": summary,
        "image_risk_score": percentage(risk_score),
        "image_quality_note": "OCR text extracted successfully",
        "explanation": summary,
        "warning_flags": flags,
        "confidence_score": percentage(75 if extracted else 45),
        "provenance": prov,
    }
