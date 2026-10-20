import React from "react";
import { FileText, Mic, Sparkles } from "lucide-react";
import VoiceSymptomInput from "./VoiceSymptomInput.jsx";

export default function SymptomInput({ notes, onChange, result }) {
  function update(name, value) {
    onChange({ ...notes, [name]: value });
  }

  function appendTranscript(transcript) {
    const trimmed = transcript.trim();
    if (!trimmed) return;
    const current = notes.symptoms?.trim() || "";
    update("symptoms", current ? `${current}, ${trimmed}` : trimmed);
  }

  const matchedSymptoms = result?.matched_symptoms || [];

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <FileText size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>Clinical Symptoms & Lifestyle Notes</h3>
            <span className="card-sub-date">Biomedical NLP Analysis</span>
          </div>
        </div>
        <VoiceSymptomInput onTranscript={appendTranscript} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dark)" }}>
          Patient Symptoms (comma-separated)
        </label>
        <textarea
          className="form-input"
          style={{ background: "var(--bg-surface)", fontSize: "13px", minHeight: "72px", resize: "vertical" }}
          placeholder="e.g. Chest tightness, Palpitations, Shortness of breath, Mild dizziness"
          value={notes.symptoms || ""}
          onChange={(e) => update("symptoms", e.target.value)}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dark)" }}>
          Lifestyle & Physical Activity Context
        </label>
        <textarea
          className="form-input"
          style={{ background: "var(--bg-surface)", fontSize: "13px", minHeight: "64px", resize: "vertical" }}
          placeholder="e.g. Reports high work-related stress, reduced sleep over the past 5 days"
          value={notes.lifestyle_notes || ""}
          onChange={(e) => update("lifestyle_notes", e.target.value)}
        />
      </div>

      {matchedSymptoms.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--color-primary)", textTransform: "uppercase" }}>
            Extracted Clinical Entities ({matchedSymptoms.length})
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {matchedSymptoms.map((sym, idx) => (
              <span
                key={idx}
                style={{
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {sym}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
