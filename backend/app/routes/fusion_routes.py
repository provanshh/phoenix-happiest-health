"""Multimodal late-fusion route with strict data provenance."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..models.fusion_model import calculate_multimodal_risk
from ..models.tabular_model import analyze_tabular
from ..utils.disclaimer import with_disclaimer


router = APIRouter(tags=["Fusion"])


class FusionPayload(BaseModel):
    signal_result: dict[str, Any] | None = None
    tabular_result: dict[str, Any] | None = None
    text_result: dict[str, Any] | None = None
    image_result: dict[str, Any] | None = None
    patient: dict[str, Any] | None = Field(default=None)


def _dump(model: BaseModel) -> dict[str, Any]:
    return model.model_dump() if hasattr(model, "model_dump") else model.dict()


@router.post("/multimodal-risk")
async def multimodal_risk(payload: FusionPayload | None = None) -> dict:
    data = _dump(payload) if payload else {}
    signal_result = data.get("signal_result")
    patient = data.get("patient")
    tabular_result = data.get("tabular_result")
    if tabular_result is None and patient:
        tabular_result = analyze_tabular(patient)
    text_result = data.get("text_result")
    image_result = data.get("image_result")

    return with_disclaimer(calculate_multimodal_risk(signal_result, tabular_result, text_result, image_result, patient))
