import React from "react";
import { User, Activity, Heart, Droplet, Moon, Shield } from "lucide-react";

const FIELD_CONFIGS = [
  { name: "age", label: "Age (years)", type: "number", placeholder: "e.g. 45" },
  { name: "gender", label: "Gender", type: "select", options: ["Female", "Male", "Other", "Prefer not to say"] },
  { name: "height", label: "Height (cm)", type: "number", placeholder: "e.g. 175" },
  { name: "weight", label: "Weight (kg)", type: "number", placeholder: "e.g. 72" },
  { name: "heart_rate", label: "Resting Heart Rate (bpm)", type: "number", placeholder: "e.g. 72" },
  { name: "systolic_bp", label: "Systolic BP (mmHg)", type: "number", placeholder: "e.g. 120" },
  { name: "diastolic_bp", label: "Diastolic BP (mmHg)", type: "number", placeholder: "e.g. 80" },
  { name: "spo2", label: "Oxygen Saturation (SpO2 %)", type: "number", placeholder: "e.g. 98" },
  { name: "sleep_hours", label: "Sleep Duration (hours)", type: "number", placeholder: "e.g. 7.5" },
  { name: "activity_level", label: "Physical Activity", type: "select", options: ["low", "moderate", "high"] },
];

export default function PatientForm({ patient, onChange }) {
  function updateField(name, value) {
    onChange({ ...patient, [name]: value });
  }

  function updateCheckbox(name, checked) {
    onChange({ ...patient, [name]: checked });
  }

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <User size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>Patient Demographics & Vitals</h3>
            <span className="card-sub-date">Tabular Clinical Predictors</span>
          </div>
        </div>
        <span className="badge" style={{ background: "var(--bg-surface)", color: "var(--text-muted)", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
          Structured Features
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        {FIELD_CONFIGS.map((field) => (
          <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dark)" }}>
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                className="form-input"
                style={{ background: "var(--bg-surface)", fontSize: "13px" }}
                value={patient[field.name] ?? (field.name === "activity_level" ? "moderate" : "Female")}
                onChange={(e) => updateField(field.name, e.target.value)}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="form-input"
                style={{ background: "var(--bg-surface)", fontSize: "13px" }}
                placeholder={field.placeholder}
                value={patient[field.name] ?? ""}
                onChange={(e) => updateField(field.name, e.target.value === "" ? "" : Number(e.target.value))}
              />
            )}
          </div>
        ))}
      </div>

      {/* Comorbidity & Clinical Risk Toggles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "12px 14px", background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-card)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          <input
            type="checkbox"
            style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
            checked={Boolean(patient.smoking_status)}
            onChange={(e) => updateCheckbox("smoking_status", e.target.checked)}
          />
          Tobacco Use
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          <input
            type="checkbox"
            style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
            checked={Boolean(patient.diabetes_history)}
            onChange={(e) => updateCheckbox("diabetes_history", e.target.checked)}
          />
          Type 2 Diabetes
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          <input
            type="checkbox"
            style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
            checked={Boolean(patient.hypertension_history)}
            onChange={(e) => updateCheckbox("hypertension_history", e.target.checked)}
          />
          Chronic Hypertension
        </label>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dark)" }}>
          Existing Risk Factors & Comorbidities
        </label>
        <input
          type="text"
          className="form-input"
          style={{ background: "var(--bg-surface)", fontSize: "13px" }}
          placeholder="e.g. Family history of CAD, hyperlipidemia, sleep apnea"
          value={patient.existing_risk_factors || ""}
          onChange={(e) => updateField("existing_risk_factors", e.target.value)}
        />
      </div>
    </article>
  );
}
