"""Official research dataset registry and metadata catalog.

Maintains formal attribution, licensing, official URLs, schemas, and known limitations
for all research datasets supported by CardioTwin AI.
"""

from __future__ import annotations

from typing import Any
from .provenance import ProvenanceType


DATASET_CATALOG: dict[str, dict[str, Any]] = {
    "bidmc": {
        "dataset_id": "bidmc",
        "name": "BIDMC PPG and Respiration Dataset",
        "version": "1.0.0",
        "source_url": "https://physionet.org/content/bidmc/1.0.0/",
        "direct_download_url": "https://physionet.org/content/bidmc/1.0.0/bidmc_csv/",
        "license": "Open Data Commons Public Domain Dedication and License v1.0 (PDDL)",
        "provenance_type": ProvenanceType.OPEN_RESEARCH_DATA,
        "is_synthetic": False,
        "is_clinical_evidence": True,
        "sampling_frequency_hz": 125.0,
        "signals_channels": ["PLETH", "RESP", "ECG II"],
        "numerics_channels": ["HR", "PULSE", "SPO2", "RESP"],
        "supported_use_cases": [
            "PPG waveform filtering and baseline removal",
            "Peak detection and inter-beat interval validation",
            "Signal quality index (SQI) evaluation",
            "Heart rate and pulse estimation benchmark",
        ],
        "known_limitations": [
            "Acquired from hospital ICU patients; not representative of healthy ambulatory populations",
            "Does not contain prospective cardiovascular event outcomes",
            "Cannot validate long-term cardiovascular risk forecasts",
        ],
        "attribution": "Pimentel MA, Johnson AE, Charlton PH, et al. Toward a Robust Estimation of Respiratory Rate From Pulse Oximeters. IEEE TBME 2017.",
        "status": "AVAILABLE",
    },
    "mitbih": {
        "dataset_id": "mitbih",
        "name": "MIT-BIH Arrhythmia Database",
        "version": "1.0.0",
        "source_url": "https://physionet.org/content/mitdb/1.0.0/",
        "license": "Open Data Commons Attribution License v1.0",
        "provenance_type": ProvenanceType.OPEN_RESEARCH_DATA,
        "is_synthetic": False,
        "is_clinical_evidence": True,
        "sampling_frequency_hz": 360.0,
        "signals_channels": ["MLII", "V1", "V2", "V4", "V5"],
        "annotation_labels": ["N (Normal)", "V (Premature Ventricular Contraction)", "A (Atrial Premature)", "L (Left Bundle Branch Block)", "R (Right Bundle Branch Block)"],
        "supported_use_cases": [
            "ECG beat segmentation and morphology feature extraction",
            "Supervised arrhythmia rhythm and ectopic beat classification",
            "Confusion matrix and sensitivity/specificity evaluation against gold-standard labels",
        ],
        "known_limitations": [
            "Recorded via dual-channel ECG holter, not photoplethysmography (PPG)",
            "Does not validate PPG risk scoring algorithms",
            "Rhythm classification is not an acute myocardial infarction prediction",
        ],
        "attribution": "Moody GB, Mark RG. The impact of the MIT-BIH Arrhythmia Database. IEEE Eng in Med and Biol 2001.",
        "status": "AVAILABLE",
    },
    "synthea": {
        "dataset_id": "synthea",
        "name": "Synthea Synthetic Electronic Health Records",
        "version": "3.0.0",
        "source_url": "https://synthetichealth.github.io/downloads.html",
        "license": "Apache License 2.0",
        "provenance_type": ProvenanceType.SYNTHETIC_EHR,
        "is_synthetic": True,
        "is_clinical_evidence": False,
        "supported_resources": ["Patients", "Observations", "Conditions", "Encounters", "Medications"],
        "supported_use_cases": [
            "Structured EHR schema validation and normalization testing",
            "Tabular risk scoring pipeline integration without handling sensitive PHI",
            "Longitudinal clinic visit trajectory testing",
        ],
        "known_limitations": [
            "COMPLETELY SYNTHETIC: Records are statistically modeled simulations, not real human patients",
            "Must never be represented or marketed as real clinical evidence",
            "Cannot establish real-world predictive validity",
        ],
        "attribution": "Walonoski J, et al. Synthea: An approach, method, and software mechanism for generating synthetic electronic health records. J Am Med Inform Assoc 2018.",
        "status": "AVAILABLE",
    },
    "ohiot1dm": {
        "dataset_id": "ohiot1dm",
        "name": "OhioT1DM Continuous Glucose Monitoring Dataset",
        "version": "2020",
        "source_url": "https://webpages.charlotte.edu/rbunescu/ohiot1dm.html",
        "license": "Restricted Research Data Use Agreement (DUA)",
        "provenance_type": ProvenanceType.OPEN_RESEARCH_DATA,
        "is_synthetic": False,
        "is_clinical_evidence": True,
        "sampling_frequency_hz": "Periodic (5-minute CGM intervals)",
        "supported_use_cases": [
            "Continuous glucose monitoring time-series forecasting",
            "Hypoglycemic event prediction at 30-120 minute horizons",
        ],
        "known_limitations": [
            "Requires direct DUA signature from Ohio University / researchers",
            "Type 1 Diabetes population only; not cardiovascular focused",
            "Must not be conflated with cardiovascular risk scoring",
        ],
        "attribution": "Marling C, Bunescu R. The OhioT1DM Dataset for Blood Glucose Level Prediction. CEUR Workshop Proceedings 2020.",
        "status": "RESTRICTED_ACCESS_SPECIFICATION_ONLY",
    },
}


def get_dataset_info(dataset_id: str) -> dict[str, Any] | None:
    return DATASET_CATALOG.get(dataset_id.lower().strip())


def list_datasets() -> list[dict[str, Any]]:
    return list(DATASET_CATALOG.values())
