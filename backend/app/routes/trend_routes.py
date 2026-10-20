"""Live simulation, trend analysis, anomaly detection, and device stream routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

from ..models.anomaly_model import detect_anomaly
from ..models.trend_model import (
    analyze_trends,
    get_device_stream_status,
    live_simulation,
    set_device_stream_status,
)
from ..utils.disclaimer import with_disclaimer
from .request_files import read_optional_upload


router = APIRouter(tags=["Trends and Sensors"])


class RecordsPayload(BaseModel):
    records: list[dict[str, Any]] | None = None
    current: dict[str, Any] | None = None


class DeviceConnectPayload(BaseModel):
    device_name: str = Field(default="CardioTwin Test BLE Pulse Oximeter")
    protocol: str = Field(default="BLE")


def _dump(model: BaseModel | None) -> dict[str, Any]:
    if not model:
        return {}
    return model.model_dump() if hasattr(model, "model_dump") else model.dict()


@router.get("/device/stream-status")
async def device_stream_status() -> dict[str, Any]:
    """Return genuine live sensor connection status (DISCONNECTED, CONNECTING, CONNECTED, etc.)."""
    return with_disclaimer(get_device_stream_status())


@router.post("/device/connect")
async def device_connect(payload: DeviceConnectPayload | None = None) -> dict[str, Any]:
    device_name = payload.device_name if payload else "CardioTwin Test BLE Pulse Oximeter"
    set_device_stream_status("CONNECTED", device_name=device_name)
    return with_disclaimer(set_device_stream_status("RECEIVING_DATA", device_name=device_name))


@router.post("/device/disconnect")
async def device_disconnect() -> dict[str, Any]:
    return with_disclaimer(set_device_stream_status("DISCONNECTED"))


@router.get("/live-simulation")
async def get_live_simulation() -> dict[str, Any]:
    """Explicitly simulated telemetry stream for UI testing only."""
    return with_disclaimer(live_simulation())


@router.post("/analyze-trends")
async def analyze_trend_route(request: Request) -> dict[str, Any]:
    content_type = request.headers.get("content-type", "").lower()
    if "application/json" in content_type:
        data = await request.json()
        return with_disclaimer(analyze_trends(records=data.get("records") or data.get("history")))
    raw, _ = await read_optional_upload(request)
    return with_disclaimer(analyze_trends(raw=raw))


@router.post("/detect-anomaly")
async def detect_anomaly_route(payload: RecordsPayload | None = None) -> dict[str, Any]:
    return with_disclaimer(detect_anomaly(_dump(payload)))
