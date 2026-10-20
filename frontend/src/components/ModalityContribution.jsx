import React from "react";
import { Sliders, PieChart } from "lucide-react";

const LABELS = {
  signal: { label: "Physiological Waveforms", color: "#38bdf8" },
  tabular: { label: "Structured Patient Vitals", color: "#0066FF" },
  text: { label: "Symptoms & Clinical NLP", color: "#8b5cf6" },
  image: { label: "Report OCR & Imaging", color: "#f59e0b" },
};

export default function ModalityContribution({ contributions = {} }) {
  const entries = Object.entries(contributions);

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <Sliders size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>Explainable AI (XAI) Modality Weights</h3>
            <span className="card-sub-date">Late-Fusion Feature Attribution</span>
          </div>
        </div>
        <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
          Interpretable
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {entries.length === 0 ? (
          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "14px", color: "var(--text-muted)", fontSize: "12px", textAlign: "center" }}>
            Awaiting multimodal assessment execution to compute modality attribution weights.
          </div>
        ) : (
          entries.map(([name, item]) => {
            const config = LABELS[name] || { label: name, color: "var(--color-primary)" };
            const pct = Math.round(item.influence_percent || 0);

            return (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <span style={{ fontWeight: "700", color: "var(--text-dark)" }}>{config.label}</span>
                  <span style={{ fontWeight: "800", color: config.color }}>{pct}% influence</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-surface)", borderRadius: "9999px", overflow: "hidden", border: "1px solid var(--border-card)" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: config.color,
                      borderRadius: "9999px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                  <span>Raw Score: {item.risk_score} / 100</span>
                  <span>Modality Weight: {(item.weight * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
