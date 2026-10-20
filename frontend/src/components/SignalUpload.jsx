import React from "react";
import { Upload, Activity, CheckCircle } from "lucide-react";

export default function SignalUpload({ file, onFileChange, result }) {
  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <Activity size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>PPG / ECG Waveform CSV</h3>
            <span className="card-sub-date">High-Frequency Telemetry Ingestion</span>
          </div>
        </div>
        <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
          {result?.reliability || "SciPy Ready"}
        </span>
      </div>

      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "20px 14px",
          background: "var(--bg-surface)",
          border: "2px dashed var(--border-subtle)",
          borderRadius: "16px",
          cursor: "pointer",
          transition: "var(--transition-smooth)",
        }}
      >
        <Upload size={22} className="text-primary" />
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dark)" }}>
          {file?.name || "Choose CSV or TXT Waveform"}
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Supports PhysioNet BIDMC PLETH format (125 Hz)
        </span>
        <input
          type="file"
          accept=".csv,.txt"
          style={{ display: "none" }}
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Signal Quality Score</span>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>
            {result?.quality_score ? `${result.quality_score} / 100` : "--"}
          </div>
        </div>
        <div style={{ padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Estimated Heart Rate</span>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#dc2626" }}>
            {result?.heart_rate_estimate ? `${result.heart_rate_estimate} bpm` : "-- bpm"}
          </div>
        </div>
      </div>
    </article>
  );
}
