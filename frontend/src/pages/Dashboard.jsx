import React, { useState } from "react";
import {
  Activity,
  Calendar,
  Database,
  Download,
  Droplet,
  FileText,
  Heart,
  MessageSquare,
  Play,
  Radio,
  RotateCcw,
  Save,
  Shield,
  Stethoscope,
  X,
  Zap,
} from "lucide-react";
import DigitalTwinVisual from "../components/DigitalTwinVisual.jsx";

const PRESET_RESEARCH_DATASETS = [
  { id: "", label: "Manual Data Entry (Direct Inputs)" },
  { id: "bidmc:bidmc_01", datasetId: "bidmc", recordId: "bidmc_01", label: "PhysioNet BIDMC PPG — Record 01 (125 Hz Waveform)" },
  { id: "mitbih:mitbih_100", datasetId: "mitbih", recordId: "mitbih_100", label: "PhysioNet MIT-BIH ECG — Record 100 (360 Hz Arrhythmia)" },
  { id: "synthea:synthea_normotensive", datasetId: "synthea", recordId: "synthea_normotensive", label: "Synthea EHR — Normotensive Adult (Synthetic Profile)" },
  { id: "synthea:synthea_hypertensive", datasetId: "synthea", recordId: "synthea_hypertensive", label: "Synthea EHR — Hypertensive Diabetic Adult (Synthetic Profile)" },
];

export default function Dashboard({
  patient,
  setPatient,
  notes,
  setNotes,
  signalFile,
  results,
  activeProvenance,
  onRunAnalysis,
  onSaveReading,
  onReset,
  loading,
  error,
  onSwitchTab,
  onRecordLoaded,
  onDownloadReport,
}) {
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [newSymptomName, setNewSymptomName] = useState("");
  const [newSymptomSeverity, setNewSymptomSeverity] = useState("Mild");
  const [selectedDatasetKey, setSelectedDatasetKey] = useState("");
  const [statusNotification, setStatusNotification] = useState("");

  // Parse complaints dynamically from notes.symptoms
  const complaints = React.useMemo(() => {
    if (!notes.symptoms || !notes.symptoms.trim()) {
      return [];
    }
    return notes.symptoms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((item, idx) => {
        const parts = item.match(/^(.+?)\s*\((.*?)\)$/);
        return {
          id: idx,
          title: parts ? parts[1].trim() : item,
          sub: parts ? `Severity: ${parts[2]}` : "Reported symptom",
          tag: parts ? `${parts[2]} · Documented` : "Active Complaint",
        };
      });
  }, [notes.symptoms]);

  function handleAddComplaintSubmit(e) {
    e.preventDefault();
    if (!newSymptomName.trim()) return;
    const formatted = `${newSymptomName.trim()} (${newSymptomSeverity})`;
    const updated = notes.symptoms && notes.symptoms.trim()
      ? `${notes.symptoms.trim()}, ${formatted}`
      : formatted;
    setNotes({ ...notes, symptoms: updated });
    setNewSymptomName("");
    setNewSymptomSeverity("Mild");
    setShowComplaintModal(false);
    triggerNotice(`Added symptom: ${formatted}`);
  }

  function handleRemoveComplaint(indexToRemove) {
    const remaining = complaints
      .filter((_, idx) => idx !== indexToRemove)
      .map((c) => (c.sub.startsWith("Severity:") ? `${c.title} (${c.sub.replace("Severity:", "").trim()})` : c.title))
      .join(", ");
    setNotes({ ...notes, symptoms: remaining });
    triggerNotice("Symptom removed from session.");
  }

  async function handleDatasetSelectChange(e) {
    const val = e.target.value;
    setSelectedDatasetKey(val);
    if (!val) {
      onReset();
      triggerNotice("Cleared dataset. Switched to manual entry.");
      return;
    }
    const preset = PRESET_RESEARCH_DATASETS.find((p) => p.id === val);
    if (preset && onRecordLoaded) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/datasets/${preset.datasetId}/load/${preset.recordId}`);
        if (!res.ok) throw new Error("Failed to load dataset record.");
        const data = await res.json();
        onRecordLoaded(data, preset.datasetId, preset.recordId);
        triggerNotice(`Loaded verified record: ${preset.recordId.toUpperCase()}`);
      } catch (err) {
        triggerNotice(`Error: ${err.message}`);
      }
    }
  }

  function triggerNotice(msg) {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(""), 3500);
  }

  // Derived vitals for display cards
  const systolic = patient?.systolic_bp || 110;
  const diastolic = patient?.diastolic_bp || 70;
  const heartRate = results?.signal?.metrics?.heart_rate_bpm
    ? Math.round(results.signal.metrics.heart_rate_bpm)
    : patient?.heart_rate || 72;

  // Active treatments / medications
  const treatmentPills = React.useMemo(() => {
    const list = [];
    if (patient?.medication_status && patient.medication_status !== "none") {
      list.push(patient.medication_status.toUpperCase().replace("_", " "));
    }
    if (results?.recommendations?.lifestyle_modifications?.length) {
      list.push(results.recommendations.lifestyle_modifications[0]);
    }
    if (list.length === 0) {
      return ["High Oxygen Levels", "Physical Therapy", "Hydration Therapy"];
    }
    return list;
  }, [patient?.medication_status, results?.recommendations]);

  return (
    <div className="dashboard-overview-grid">
      {/* Dynamic Status / Notification Banner */}
      {statusNotification && (
        <div
          style={{
            gridColumn: "1 / -1",
            background: "var(--color-primary-light)",
            border: "1px solid #bfdbfe",
            color: "var(--color-primary)",
            padding: "8px 16px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Zap size={16} />
          {statusNotification}
        </div>
      )}

      {error && (
        <div
          style={{
            gridColumn: "1 / -1",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            padding: "8px 16px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {error}
        </div>
      )}

      {/* ===================================================================
          COLUMN 1: MY LAST VISIT & LAST DIAGNOSE
          =================================================================== */}
      <section className="col-card-section" aria-label="Recent visits and diagnoses">
        {/* Card: My Last Visit */}
        <article className="overview-card visit-card">
          <div className="card-header-row">
            <div>
              <h2 className="card-main-title">My Last Visit</h2>
              <span className="card-sub-date">14 May 2024</span>
            </div>
          </div>

          <div className="visit-doctor-subcard">
            <div className="doctor-profile-row">
              <div className="doctor-avatar-circle" title="Dr. Weber">
                <Stethoscope size={22} />
              </div>
              <div className="doctor-name-col">
                <span className="doctor-name">Dr. Weber</span>
                <span className="doctor-specialty-pill">Neurologist Specialist</span>
              </div>
            </div>

            <div className="visit-time-status-row">
              <span>10:30 am - 11:30 am</span>
              <div className="status-indicator-pill">
                <span className="status-dot-pulse" />
                <span>Scheduled</span>
              </div>
            </div>
          </div>
        </article>

        {/* Card: Last Diagnose */}
        <article className="overview-card diagnose-card">
          <div className="card-header-row">
            <div>
              <h2 className="card-main-title">Last Diagnose</h2>
              <span className="card-sub-date">Real-time parameters</span>
            </div>
          </div>

          {/* Blood Status Sub-card */}
          <div className="diagnose-subcard">
            <div className="diagnose-subcard-header">
              <div className="diagnose-title-wrap">
                <div className="diagnose-icon-circle blood">
                  <Droplet size={16} />
                </div>
                <span className="diagnose-subcard-title">Blood status</span>
              </div>
              <span className="diagnose-value-pill">
                {systolic}/{diastolic}
              </span>
            </div>

            <svg viewBox="0 0 240 36" className="diagnose-waveform-svg" preserveAspectRatio="none">
              <path
                d="M 0,20 L 40,20 L 55,20 L 65,8 L 75,30 L 85,14 L 95,22 L 105,20 L 150,20 L 165,8 L 175,30 L 185,14 L 195,22 L 240,20"
                fill="none"
                stroke="#0066FF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heart Rate Sub-card */}
          <div className="diagnose-subcard">
            <div className="diagnose-subcard-header">
              <div className="diagnose-title-wrap">
                <div className="diagnose-icon-circle heart">
                  <Heart size={16} />
                </div>
                <span className="diagnose-subcard-title">Heart rate</span>
              </div>
              <span className="diagnose-value-pill" style={{ background: "#fee2e2", color: "#dc2626" }}>
                {heartRate} bpm
              </span>
            </div>

            <svg viewBox="0 0 240 36" className="diagnose-waveform-svg" preserveAspectRatio="none">
              <path
                d="M 0,18 L 30,18 L 45,18 L 52,24 L 60,4 L 68,32 L 74,12 L 80,20 L 120,18 L 135,18 L 142,24 L 150,4 L 158,32 L 164,12 L 170,20 L 240,18"
                fill="none"
                stroke="#0066FF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </article>

        {/* Provenance & Hardware Telemetry Badge */}
        <article className="overview-card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Radio size={16} className="text-primary" />
              <span style={{ fontSize: "12px", fontWeight: "700" }}>Data Provenance</span>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                background: activeProvenance ? "var(--color-primary-light)" : "var(--bg-surface-subtle)",
                color: activeProvenance ? "var(--color-primary)" : "var(--text-muted)",
                padding: "3px 10px",
                borderRadius: "9999px",
              }}
            >
              {activeProvenance?.provenance_type || "MANUAL ENTRY"}
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
            {activeProvenance?.source_dataset
              ? `Source: ${activeProvenance.source_dataset.toUpperCase()} verified record.`
              : "Direct clinician parameters input into state."}
          </p>
        </article>
      </section>

      {/* ===================================================================
          COLUMN 2: MY HEALTH OVERVIEW & DIGITAL TWIN
          =================================================================== */}
      <section className="center-column-wrap" aria-label="Digital twin visualization and complaints">
        {/* Header row with functional dataset selector */}
        <div className="overview-center-header" style={{ flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 className="overview-main-heading">My Health Overview</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              <Calendar size={13} />
              <span>Clinical Horizon: May 2024</span>
            </div>
          </div>

          {/* Quick Dataset Selector Dropdown */}
          <div data-tour="dataset-selector" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Database size={15} className="text-primary" />
            <select
              className="form-input"
              style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "600", borderRadius: "9999px", maxWidth: "260px" }}
              value={selectedDatasetKey}
              onChange={handleDatasetSelectChange}
              title="Select a research dataset record to populate active twin telemetry"
            >
              {PRESET_RESEARCH_DATASETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Digital Twin 3D Translucent Centerpiece */}
        <div data-tour="digital-twin">
          <DigitalTwinVisual
            patient={patient}
            signalResult={results?.signal}
            provenance={activeProvenance}
            complaints={complaints}
            onAddComplaint={() => setShowComplaintModal(true)}
            onRemoveComplaint={handleRemoveComplaint}
          />
        </div>

        {/* Primary Multimodal Action Bar */}
        <div className="assessment-bar" data-tour="assessment-bar">
          <div className="assessment-info">
            <h4>Multimodal AI Assessment</h4>
            <p>
              {results?.fusion
                ? `Assessed Risk: ${results.fusion.final_risk_score}/100 (${results.fusion.risk_category})`
                : "Evaluate physiological signals, vitals, symptoms, and medical history."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn-run-assessment"
              onClick={onRunAnalysis}
              disabled={loading}
              title="Run multimodal risk evaluation"
            >
              <Play size={16} />
              {loading ? "Evaluating..." : "Run Assessment"}
            </button>
            <button
              className="ghost-button"
              onClick={onSaveReading}
              disabled={!results?.fusion || loading}
              title="Save reading to SQLite health memory"
              style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", borderColor: "rgba(255,255,255,0.3)" }}
            >
              <Save size={15} />
              Save
            </button>
            <button
              className="ghost-button"
              onClick={onReset}
              disabled={loading}
              title="Clear all session data"
              style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", borderColor: "rgba(255,255,255,0.3)", padding: "10px 14px" }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Results Quick Summary (if assessment has been run) */}
        {results?.fusion && (
          <article className="overview-card" style={{ background: "linear-gradient(135deg, #f0f7ff, #ffffff)", border: "1px solid #bfdbfe" }}>
            <div className="card-header-row" style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={18} className="text-primary" />
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0 }}>
                  Clinical Index: {results.fusion.final_risk_score} / 100 ({results.fusion.risk_category})
                </h3>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="primary-button"
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                  onClick={onDownloadReport}
                  title="Download verified clinical PDF report"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  className="ghost-button"
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                  onClick={() => onSwitchTab?.("laboratory")}
                  title="Inspect waveform peaks, arrhythmia model, and XAI contributions"
                >
                  <Activity size={14} /> View Signals
                </button>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-body)", lineHeight: "1.5" }}>
              {results.fusion.doctor_summary?.summary_statement || "Clinical assessment synthesized across active modalities."}
            </p>
          </article>
        )}
      </section>

      {/* ===================================================================
          COLUMN 3: TREATMENT, CHECKUP SCHEDULE & MY MEDICINE
          =================================================================== */}
      <section className="col-card-section" data-tour="right-column" aria-label="Treatment, checkup schedule and medicine">
        {/* Treatment Section */}
        <article className="overview-card">
          <div className="card-header-row">
            <h2 className="card-main-title">Treatment</h2>
          </div>
          <div className="treatment-pills-row">
            {treatmentPills.map((t, idx) => (
              <span className="treatment-pill" key={idx}>
                {t}
              </span>
            ))}
          </div>
        </article>

        {/* Checkup Schedule Section */}
        <article className="overview-card">
          <div className="card-header-row">
            <h2 className="card-main-title">Checkup Schedule</h2>
          </div>

          {/* Calendar Day Callout Box */}
          <div className="checkup-calendar-card">
            <div className="calendar-date-box">
              <span className="cal-number">16</span>
              <span className="cal-month">May</span>
            </div>
            <span className="cal-badge">Next checkup</span>
          </div>

          {/* Appointment Items */}
          <div className="appointment-list">
            <div className="appointment-item">
              <div className="appointment-left-col">
                <span className="appointment-type">Clinic Visit</span>
                <span className="appointment-doctor">Dr. Kevin</span>
                <span className="appointment-time">11:00 am - 12:00 pm</span>
              </div>
              <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                In-Person Clinic
              </span>
            </div>

            <div className="appointment-item">
              <div className="appointment-left-col">
                <span className="appointment-type">Video Consultant</span>
                <span className="appointment-doctor">Dr. Kelly Carl</span>
                <span className="appointment-time">02:00 pm - 03:00 pm</span>
              </div>
              <span className="badge" style={{ background: "#d1fae5", color: "#059669", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                Telehealth Video
              </span>
            </div>
          </div>
        </article>

        {/* My Medicine Section */}
        <article className="overview-card">
          <div className="card-header-row">
            <h2 className="card-main-title">My Medicine</h2>
          </div>

          <div className="medicine-list">
            <div className="medicine-item">
              <div className="medicine-icon-box" title="Verapamil Bottle">
                💊
              </div>
              <div className="medicine-info-col">
                <div className="medicine-name-row">
                  <span className="medicine-name">Verapamil</span>
                  <span className="medicine-dosage">250 mg</span>
                </div>
                <span className="medicine-instruction">Take 1 pill after meal</span>
              </div>
            </div>

            <div className="medicine-item">
              <div className="medicine-icon-box" title="Prednisone Capsule">
                🧴
              </div>
              <div className="medicine-info-col">
                <div className="medicine-name-row">
                  <span className="medicine-name">Prednisone</span>
                  <span className="medicine-dosage">250 mg</span>
                </div>
                <span className="medicine-instruction">Take 2 pills morning</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* ===================================================================
          MODAL: ADD COMPLAINT (WRITES TO NOTES.SYMPTOMS FOR NLP MODEL)
          =================================================================== */}
      {showComplaintModal && (
        <div className="modal-overlay" onClick={() => setShowComplaintModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Document Patient Symptom / Complaint</h3>
              <button className="modal-close-btn" onClick={() => setShowComplaintModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddComplaintSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label>Symptom Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chest tightness, Palpitations, Headache, Dizziness"
                  value={newSymptomName}
                  onChange={(e) => setNewSymptomName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Severity Level</label>
                <select
                  className="form-input"
                  value={newSymptomSeverity}
                  onChange={(e) => setNewSymptomSeverity(e.target.value)}
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="ghost-button" onClick={() => setShowComplaintModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add Symptom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
