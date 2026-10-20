import React, { useState } from "react";
import { Database, ShieldCheck, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { loadDatasetRecord } from "../services/api.js";

export default function ResearchDatasetSelector({ onRecordLoaded, onClear }) {
  const [selectedRecord, setSelectedRecord] = useState("");
  const [loadedProvenance, setLoadedProvenance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PRESET_RECORDS = [
    { datasetId: "bidmc", recordId: "bidmc_01", label: "PhysioNet BIDMC PPG — Record 01 (125 Hz Waveform)", type: "OPEN_RESEARCH_DATA" },
    { datasetId: "mitbih", recordId: "mitbih_100", label: "PhysioNet MIT-BIH ECG — Record 100 (360 Hz Lead MLII)", type: "OPEN_RESEARCH_DATA" },
    { datasetId: "synthea", recordId: "synthea_normotensive", label: "Synthea EHR — Normotensive Adult (Synthetic Profile)", type: "SYNTHETIC_EHR" },
    { datasetId: "synthea", recordId: "synthea_hypertensive", label: "Synthea EHR — Hypertensive Diabetic Adult (Synthetic Profile)", type: "SYNTHETIC_EHR" },
  ];

  async function handleSelectPreset(presetKey) {
    setSelectedRecord(presetKey);
    if (!presetKey) {
      setLoadedProvenance(null);
      onClear?.();
      return;
    }
    const found = PRESET_RECORDS.find((p) => `${p.datasetId}:${p.recordId}` === presetKey);
    if (!found) return;

    setLoading(true);
    setError("");
    try {
      const data = await loadDatasetRecord(found.datasetId, found.recordId);
      setLoadedProvenance(data.provenance);
      onRecordLoaded?.(data, found.datasetId, found.recordId);
    } catch (err) {
      setError(err.message || "Failed to load research dataset record.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <Database size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>Research Dataset Catalog</h3>
            <span className="card-sub-date">Open PhysioNet & Synthea Records</span>
          </div>
        </div>
        <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
          Verified Provenance
        </span>
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
        Ingest genuine research physiological recordings (PPG / ECG) or structured Synthea electronic health records into the active twin session.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <select
          className="form-input"
          style={{ width: "100%", padding: "10px 14px", fontWeight: "600", fontSize: "13px", background: "var(--bg-surface)" }}
          value={selectedRecord}
          onChange={(e) => handleSelectPreset(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Select a Research Dataset Record to Ingest --</option>
          {PRESET_RECORDS.map((preset) => (
            <option key={`${preset.datasetId}:${preset.recordId}`} value={`${preset.datasetId}:${preset.recordId}`}>
              {preset.label}
            </option>
          ))}
        </select>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--color-primary)", fontWeight: "600" }}>
            <span className="status-dot-pulse" />
            Ingesting and validating telemetry record...
          </div>
        )}

        {error && (
          <div style={{ padding: "8px 12px", background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {loadedProvenance && (
          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: loadedProvenance.is_synthetic ? "#fff7ed" : "var(--color-primary-light)",
              border: `1px solid ${loadedProvenance.is_synthetic ? "#fed7aa" : "#bfdbfe"}`,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: loadedProvenance.is_synthetic ? "#c2410c" : "var(--color-primary)" }}>
                {loadedProvenance.is_synthetic ? <AlertTriangle size={15} /> : <ShieldCheck size={15} />}
                Provenance: {loadedProvenance.provenance_type}
              </strong>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>{loadedProvenance.license}</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-body)" }}>
              Source: <strong>{loadedProvenance.source_dataset}</strong> (Record: {loadedProvenance.record_id})
            </div>
            {loadedProvenance.is_synthetic && (
              <div style={{ fontSize: "11px", color: "#ea580c", fontWeight: "700" }}>
                SYNTHETIC EHR RECORD — Generated by Synthea engine; isolated from clinical diagnostic claims.
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
