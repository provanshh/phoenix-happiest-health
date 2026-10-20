import React from "react";
import { Activity } from "lucide-react";

function buildPath(data, key, width, height, padding) {
  if (!data || !data.length) return "";
  const xs = data.map((point) => point.time);
  const ys = data.map((point) => point[key]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const xSpan = maxX - minX || 1;
  const ySpan = maxY - minY || 1;
  return data
    .map((point, index) => {
      const x = padding + ((point.time - minX) / xSpan) * (width - padding * 2);
      const y = height - padding - ((point[key] - minY) / ySpan) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function SignalChart({ data = [], peaks = [] }) {
  const width = 720;
  const height = 240;
  const rawPath = buildPath(data, "raw", width, height, 24);
  const cleanPath = buildPath(data, "cleaned", width, height, 24);

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <Activity size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>SciPy Physiological Waveform Inspector</h3>
            <span className="card-sub-date">Butterworth Bandpass Filtered & Peak Annotated</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", fontWeight: "700" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0066FF" }}>
            <span style={{ width: "10px", height: "3px", background: "#0066FF", borderRadius: "2px" }} /> Cleaned Signal
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#94a3b8" }}>
            <span style={{ width: "10px", height: "3px", background: "#94a3b8", borderRadius: "2px" }} /> Raw Sensor
          </span>
          <span className="badge" style={{ background: "var(--bg-surface)", color: "var(--text-dark)", padding: "3px 8px", borderRadius: "9999px" }}>
            {data.length ? `${data.length} Samples` : "0 Samples"}
          </span>
        </div>
      </div>

      <div style={{ borderRadius: "16px", overflow: "hidden", background: "#090d16", padding: "8px", boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Subtle grid lines */}
          <line x1="24" y1="60" x2={width - 24} y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="24" y1="120" x2={width - 24} y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="24" y1="180" x2={width - 24} y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Raw waveform line */}
          {rawPath && (
            <path
              d={rawPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
          )}

          {/* Cleaned SciPy bandpass waveform */}
          {cleanPath ? (
            <path
              d={cleanPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.4))"
            />
          ) : (
            <text x={width / 2} y={height / 2} fill="#64748b" textAnchor="middle" fontSize="13" fontFamily="inherit">
              No physiological waveform loaded. Upload a CSV or select PhysioNet BIDMC on Document tab.
            </text>
          )}
        </svg>
      </div>
    </article>
  );
}
