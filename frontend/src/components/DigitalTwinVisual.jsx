import React, { useState } from "react";
import { Activity, AlertCircle, Heart, Plus, Trash2, X, Zap } from "lucide-react";

export default function DigitalTwinVisual({
  patient,
  signalResult,
  provenance,
  complaints = [],
  onAddComplaint,
  onRemoveComplaint,
}) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Compute live or dataset-derived physiological values
  const hr = signalResult?.metrics?.heart_rate_bpm ?? (patient?.heart_rate ? `${patient.heart_rate} bpm` : "--");
  const bp = patient?.systolic_bp && patient?.diastolic_bp
    ? `${patient.systolic_bp}/${patient.diastolic_bp} mmHg`
    : "-- mmHg";
  const spo2 = patient?.spo2 ? `${patient.spo2}%` : "--%";
  const hrvStatus = signalResult?.metrics?.hrv_sdnn_ms 
    ? `${Math.round(signalResult.metrics.hrv_sdnn_ms)} ms` 
    : (patient?.heart_rate ? "Normal Sinus" : "Awaiting Data");

  const hotspots = [
    {
      id: "trigeminal",
      label: "Trigeminal Autonomic",
      subLabel: "Sinus Rhythm & SA Node",
      value: hr,
      x: 185,
      y: 95,
      lineX1: 185,
      lineY1: 95,
      lineX2: 80,
      lineY2: 50,
      side: "left",
      details: "Monitors cardiac autonomic regulation, sinoatrial firing rate, and cranial autonomic reflexes. Responds to vagal tone and stress modulation.",
    },
    {
      id: "hypothalamus",
      label: "Posterior Hypothalamus",
      subLabel: "Autonomic Tone / HRV",
      value: hrvStatus,
      x: 215,
      y: 135,
      lineX1: 215,
      lineY1: 135,
      lineX2: 320,
      lineY2: 85,
      side: "right",
      details: "Central coordinator of sympathetic and parasympathetic balance. Regulates baroreceptor reflexes and autonomic chronotropic output.",
    },
    {
      id: "trigeminovascular",
      label: "Trigeminovascular System",
      subLabel: "Vascular Tone / Blood Pressure",
      value: bp,
      x: 175,
      y: 195,
      lineX1: 175,
      lineY1: 195,
      lineX2: 70,
      lineY2: 240,
      side: "left",
      details: "Oversees microvascular tone, systemic arterial compliance, and pulsatile cardiac pressure gradients.",
    },
    {
      id: "reflex",
      label: "Autonomic Reflex",
      subLabel: "SpO2 & Microcirculation",
      value: spo2,
      x: 225,
      y: 255,
      lineX1: 225,
      lineY1: 255,
      lineX2: 325,
      lineY2: 280,
      side: "right",
      details: "Evaluates peripheral capillary oxygenation, vasomotor reactivity, and peripheral perfusion index from PPG optical waveforms.",
    },
  ];

  return (
    <div className="digital-twin-container">
      {/* Visual Canvas Area */}
      <div className="digital-twin-canvas-wrap">
        <svg
          viewBox="0 0 400 360"
          className="digital-twin-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="twin-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="bodyGradient" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#0066FF" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0.01" />
            </radialGradient>

            <linearGradient id="arteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0099FF" />
              <stop offset="50%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="cardiacGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background subtle anatomical mesh rings */}
          <ellipse cx="200" cy="180" rx="140" ry="150" fill="none" stroke="#0066FF" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="200" cy="180" rx="110" ry="120" fill="none" stroke="#0066FF" strokeOpacity="0.08" strokeWidth="1" />

          {/* Torso Silhouette Outline */}
          <path
            d="M 200,45 
               C 185,45 174,55 174,70 
               C 174,80 180,88 186,94 
               C 168,102 145,116 138,135 
               C 130,155 130,195 135,230 
               C 138,255 142,285 145,330 
               L 255,330 
               C 258,285 262,255 265,230 
               C 270,195 270,155 262,135 
               C 255,116 232,102 214,94 
               C 220,88 226,80 226,70 
               C 226,55 215,45 200,45 Z"
            fill="url(#bodyGradient)"
            stroke="#0066FF"
            strokeWidth="1.8"
            strokeOpacity="0.35"
            filter="url(#twin-glow)"
          />

          {/* Spinal & Autonomic cord */}
          <path
            d="M 200,75 L 200,310"
            stroke="#0066FF"
            strokeWidth="2"
            strokeOpacity="0.4"
            strokeDasharray="3 3"
          />

          {/* Aorta Arch and Great Vessels */}
          <path
            d="M 196,170 C 196,140 216,140 216,160 C 216,175 190,190 195,225"
            fill="none"
            stroke="url(#arteryGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#twin-glow)"
          />

          {/* Pulmonary & Carotid Arteries */}
          <path
            d="M 196,145 C 190,120 185,100 185,85"
            fill="none"
            stroke="#0099FF"
            strokeWidth="2"
            strokeOpacity="0.7"
          />
          <path
            d="M 204,145 C 210,120 215,100 215,85"
            fill="none"
            stroke="#0099FF"
            strokeWidth="2"
            strokeOpacity="0.7"
          />

          {/* Rib cage translucent vectors */}
          <path d="M 160,135 C 180,145 220,145 240,135" fill="none" stroke="#0066FF" strokeWidth="1.2" strokeOpacity="0.2" />
          <path d="M 152,155 C 180,170 220,170 248,155" fill="none" stroke="#0066FF" strokeWidth="1.2" strokeOpacity="0.2" />
          <path d="M 148,180 C 180,198 220,198 252,180" fill="none" stroke="#0066FF" strokeWidth="1.2" strokeOpacity="0.2" />
          <path d="M 148,208 C 180,225 220,225 252,208" fill="none" stroke="#0066FF" strokeWidth="1.2" strokeOpacity="0.2" />
          <path d="M 152,238 C 180,252 220,252 248,238" fill="none" stroke="#0066FF" strokeWidth="1.2" strokeOpacity="0.15" />

          {/* Heart Organ Luminescent Glow */}
          <circle cx="198" cy="178" r="24" fill="url(#cardiacGlow)" filter="url(#node-glow)" opacity="0.4" />
          
          {/* Animated Heart Pulsing Core */}
          <g className="twin-heart-pulse">
            <circle cx="198" cy="178" r="14" fill="#0066FF" opacity="0.6" filter="url(#node-glow)" />
            <circle cx="198" cy="178" r="7" fill="#ffffff" opacity="0.9" />
          </g>

          {/* DNA Double-Helix Accent */}
          <g opacity="0.35">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={`helix-${i}`}>
                <circle cx={145 + Math.sin(i * 1.2) * 6} cy={240 + i * 14} r="2" fill="#0066FF" />
                <circle cx={155 - Math.sin(i * 1.2) * 6} cy={240 + i * 14} r="2" fill="#38bdf8" />
                <line
                  x1={145 + Math.sin(i * 1.2) * 6}
                  y1={240 + i * 14}
                  x2={155 - Math.sin(i * 1.2) * 6}
                  y2={240 + i * 14}
                  stroke="#0066FF"
                  strokeWidth="0.8"
                />
              </g>
            ))}
          </g>

          {/* Interactive Hotspots & Callout Lines */}
          {hotspots.map((spot) => {
            const isSelected = selectedNode?.id === spot.id;
            return (
              <g
                key={spot.id}
                className="twin-hotspot-group"
                onClick={() => setSelectedNode(isSelected ? null : spot)}
                style={{ cursor: "pointer" }}
              >
                <polyline
                  points={`${spot.lineX1},${spot.lineY1} ${spot.lineX2},${spot.lineY2} ${spot.side === "left" ? spot.lineX2 - 20 : spot.lineX2 + 20},${spot.lineY2}`}
                  fill="none"
                  stroke={isSelected ? "#0066FF" : "#94a3b8"}
                  strokeWidth={isSelected ? "1.8" : "1.2"}
                  strokeDasharray={isSelected ? "none" : "2 2"}
                />

                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r="9"
                  className="twin-pulse-ring"
                  fill="none"
                  stroke="#0066FF"
                  strokeWidth="2"
                  opacity="0.8"
                />

                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r="4.5"
                  fill={isSelected ? "#ffffff" : "#0066FF"}
                  stroke="#0066FF"
                  strokeWidth="2.5"
                  filter="url(#twin-glow)"
                />

                <foreignObject
                  x={spot.side === "left" ? 10 : 235}
                  y={spot.y - 20}
                  width="155"
                  height="44"
                >
                  <div
                    className={`twin-callout-pill ${isSelected ? "selected" : ""}`}
                    title={spot.details}
                  >
                    <div className="twin-callout-header">
                      <span className="twin-callout-label">{spot.label}</span>
                    </div>
                    <div className="twin-callout-val">{spot.value}</div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Selected Hotspot Clinical Insight Popover */}
        {selectedNode && (
          <div className="twin-node-detail-card animate-fade-in">
            <div className="twin-detail-top">
              <div className="twin-detail-title-wrap">
                <Zap size={14} className="text-primary" />
                <h4>{selectedNode.label}</h4>
              </div>
              <button
                className="twin-detail-close"
                onClick={() => setSelectedNode(null)}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
            <p className="twin-detail-desc">{selectedNode.details}</p>
            <div className="twin-detail-stats">
              <div className="stat-item">
                <span className="stat-label">Measured Value:</span>
                <span className="stat-value">{selectedNode.value}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pathway:</span>
                <span className="stat-value">{selectedNode.subLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Centerpiece Bottom: Dynamic Complaints Section */}
      <div className="twin-complaints-section" data-tour="complaints-section">
        <div className="twin-section-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 className="section-title">Complaints</h3>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "2px 8px", borderRadius: "9999px" }}>
              {complaints.length} active
            </span>
          </div>
          <button
            className="circular-add-btn"
            onClick={onAddComplaint}
            title="Add Symptom or Complaint to Active Patient Record"
            aria-label="Add Symptom or Complaint"
          >
            <Plus size={16} />
          </button>
        </div>

        {complaints.length === 0 ? (
          <div
            style={{
              padding: "16px",
              background: "var(--bg-surface)",
              borderRadius: "16px",
              textAlign: "center",
              fontSize: "12px",
              color: "var(--text-muted)",
              border: "1px dashed var(--border-subtle)",
            }}
          >
            No active symptoms recorded. Click the <strong>+</strong> button to document patient symptoms.
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map((item, index) => (
              <div className="complaint-card" key={index}>
                <div className="complaint-icon-wrap headache">
                  <Activity size={18} />
                </div>
                <div className="complaint-content" style={{ flex: 1, minWidth: 0 }}>
                  <div className="complaint-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                  <div className="complaint-sub">{item.sub || "Reported symptom"}</div>
                  <div className="complaint-tag">{item.tag || "Active"}</div>
                </div>
                {onRemoveComplaint && (
                  <button
                    onClick={() => onRemoveComplaint(index)}
                    title="Remove symptom from record"
                    style={{
                      color: "var(--text-muted)",
                      padding: "4px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
