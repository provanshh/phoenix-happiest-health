import React from "react";
import { Activity, CheckCircle, AlertTriangle, Play } from "lucide-react";

export default function ArrhythmiaClassifierCard({ result, onRunPrediction, loading }) {
  if (!result) {
    return (
      <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div className="card-header-row" style={{ marginBottom: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="diagnose-icon-circle heart">
              <Activity size={17} />
            </div>
            <div>
              <h3 className="card-main-title" style={{ fontSize: "16px" }}>MIT-BIH Arrhythmia Machine Learning Model</h3>
              <span className="card-sub-date">Supervised Beat Classifier (AAMI Standards)</span>
            </div>
          </div>
          <span className="badge" style={{ background: "#fef3c7", color: "#d97706", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
            Trained ML Model
          </span>
        </div>

        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
          Random Forest classifier trained on official PhysioNet MIT-BIH recordings. Evaluates morphological beat deviations and ventricular ectopic burden.
        </p>

        <button
          className="primary-button"
          style={{ width: "fit-content" }}
          onClick={onRunPrediction}
          disabled={loading}
          title="Run MIT-BIH Random Forest classifier on lead MLII ECG"
        >
          <Play size={15} />
          {loading ? "Classifying ECG Beats..." : "Evaluate Current ECG Beats"}
        </button>
      </article>
    );
  }

  const { total_beats_analyzed, beat_counts, ectopic_burden_percent, benchmark_metrics, clinical_notice } = result;

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle heart">
            <Activity size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>MIT-BIH Arrhythmia ML Model</h3>
            <span className="card-sub-date">Evaluation Results</span>
          </div>
        </div>
        <button
          className="ghost-button"
          style={{ padding: "5px 12px", fontSize: "12px" }}
          onClick={onRunPrediction}
          disabled={loading}
        >
          {loading ? "Re-evaluating..." : "Re-run Model"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px" }}>
        <div style={{ padding: "12px", background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-card)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Total Beats</span>
          <strong style={{ fontSize: "20px", color: "var(--text-dark)", lineHeight: "1" }}>{total_beats_analyzed}</strong>
        </div>
        <div style={{ padding: "12px", background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-card)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Normal (N)</span>
          <strong style={{ fontSize: "20px", color: "#16a34a", lineHeight: "1" }}>{beat_counts?.N || 0}</strong>
        </div>
        <div style={{ padding: "12px", background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-card)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Ventricular (V/PVC)</span>
          <strong style={{ fontSize: "20px", color: (beat_counts?.V || 0) > 0 ? "#dc2626" : "var(--text-dark)", lineHeight: "1" }}>
            {beat_counts?.V || 0}
          </strong>
        </div>
        <div style={{ padding: "12px", background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-card)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>Ectopic Burden</span>
          <strong style={{ fontSize: "20px", color: "var(--color-primary)", lineHeight: "1" }}>{ectopic_burden_percent}%</strong>
        </div>
      </div>

      {benchmark_metrics && (
        <div style={{ fontSize: "11px", color: "var(--text-muted)", padding: "8px 12px", background: "var(--bg-surface)", borderRadius: "10px" }}>
          <strong>Held-out Test Performance:</strong> Accuracy {((benchmark_metrics.accuracy || 0) * 100).toFixed(1)}% | Weighted F1: {(benchmark_metrics.weighted_f1 || 0).toFixed(3)}
        </div>
      )}

      {clinical_notice && (
        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
          {clinical_notice}
        </p>
      )}
    </article>
  );
}
