"""Tabular patient/vitals route."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field, model_validator

from ..models.tabular_model import analyze_tabular
from ..utils.disclaimer import with_disclaimer


router = APIRouter(tags=["Tabular"])


class PatientPayload(BaseModel):
    age: float | None = Field(default=None)
    gender: str | None = Field(default=None)
    height: float | None = Field(default=None)
    weight: float | None = Field(default=None)
    heart_rate: float | None = Field(default=None)
    systolic_bp: float | None = Field(default=None)
    diastolic_bp: float | None = Field(default=None)
    spo2: float | None = Field(default=None)
    sleep_hours: float | None = Field(default=None)
    activity_level: str | None = Field(default="moderate")
    smoking_status: bool | str | None = Field(default=False)
    diabetes_history: bool | str | None = Field(default=False)
    hypertension_history: bool | str | None = Field(default=False)
    existing_risk_factors: list[str] | str | None = Field(default_factory=list)
    medication_status: str | None = Field(default="none")

    @model_validator(mode="before")
    @classmethod
    def clean_empty_strings(cls, values: Any) -> Any:
        if isinstance(values, dict):
            cleaned = {}
            for k, v in values.items():
                if v == "" or v is None:
                    cleaned[k] = None
                else:
                    cleaned[k] = v
            return cleaned
        return values


def _dump(model: BaseModel) -> dict[str, Any]:
    return model.model_dump() if hasattr(model, "model_dump") else model.dict()


@router.post("/analyze-tabular")
async def analyze_patient_tabular(payload: PatientPayload | None = None) -> dict:
    data = _dump(payload) if payload else _dump(PatientPayload())
    return with_disclaimer(analyze_tabular(data))
