import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Database,
  History as HistoryIcon,
  RotateCcw,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  Video,
} from "lucide-react";
import TrendCharts from "../components/TrendCharts.jsx";
import { analyzeTrends, compareLastReading, getHistory } from "../services/api.js";

export default function History() {
  const [trend, setTrend] = useState(null);
  const [history, setHistory] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [trendResult, historyResult, compareResult] = await Promise.all([
        analyzeTrends(),
        getHistory(25),
        compareLastReading(),
      ]);
      setTrend(trendResult);
      setHistory(historyResult.readings || []);
      setComparison(compareResult);
      setRefreshNotice("Database records refreshed.");
      setTimeout(() => setRefreshNotice(""), 3000);
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const riskDelta = comparison?.risk_delta ?? 0;
  const isImproved = riskDelta < 0;

  return (
    <div className="history-view">
      {/* Dynamic Refresh Notice */}
      {refreshNotice && (
        <div
          style={{
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
          <HistoryIcon size={16} />
          {refreshNotice}
        </div>
      )}

      {/* Top Split Row: Checkup Schedule & Risk Trajectory */}
      <div className="section-split-2col">
        {/* Card 1: Checkup Appointments Schedule */}
        <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card-header-row" style={{ marginBottom: "2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="diagnose-icon-circle blood">
                <Calendar size={17} />
              </div>
              <div>
                <h3 className="card-main-title" style={{ fontSize: "16px" }}>Checkup Schedule</h3>
                <span className="card-sub-date">Clinical Consultations Timeline</span>
              </div>
            </div>
            <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
              Next: 16 May
            </span>
          </div>

          <div className="appointment-list">
            <div className="appointment-item">
              <div className="appointment-left-col">
                <span className="appointment-type">Neurology / Autonomic Follow-up</span>
                <span className="appointment-doctor">Dr. Weber</span>
                <span className="appointment-time">10:30 am - 11:30 am · Room 402</span>
              </div>
              <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                In-Person Clinic
              </span>
            </div>

            <div className="appointment-item">
              <div className="appointment-left-col">
                <span className="appointment-type">Cardiovascular General Clinic</span>
                <span className="appointment-doctor">Dr. Kevin</span>
                <span className="appointment-time">11:00 am - 12:00 pm · Ambulatory Wing</span>
              </div>
              <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                In-Person Clinic
              </span>
            </div>

            <div className="appointment-item">
              <div className="appointment-left-col">
                <span className="appointment-type">Telehealth Remote Vitals Review</span>
                <span className="appointment-doctor">Dr. Kelly Carl</span>
                <span className="appointment-time">02:00 pm - 03:00 pm · Encrypted Telehealth</span>
              </div>
              <span className="badge" style={{ background: "#d1fae5", color: "#059669", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                Telehealth Video
              </span>
            </div>
          </div>
        </article>

        {/* Card 2: Longitudinal Risk Delta & Trajectory */}
        <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card-header-row" style={{ marginBottom: "2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="diagnose-icon-circle heart">
                {isImproved ? <TrendingDown size={17} /> : <TrendingUp size={17} />}
              </div>
              <div>
                <h3 className="card-main-title" style={{ fontSize: "16px" }}>Comparative Risk Delta</h3>
                <span className="card-sub-date">Change Compared to Previous Reading</span>
              </div>
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "800",
                color: riskDelta > 0 ? "#dc2626" : riskDelta < 0 ? "#16a34a" : "var(--color-primary)",
                background: riskDelta > 0 ? "#fee2e2" : riskDelta < 0 ? "#dcfce7" : "var(--color-primary-light)",
                padding: "4px 12px",
                borderRadius: "9999px",
              }}
            >
              {riskDelta > 0 ? `+${riskDelta}` : riskDelta}
            </div>
          </div>

          <div style={{ padding: "14px", background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-card)" }}>
            <strong style={{ fontSize: "13px", color: "var(--text-dark)", display: "block", marginBottom: "4px" }}>
              Clinical Trajectory Explanation:
            </strong>
            <p style={{ fontSize: "12px", color: "var(--text-body)", lineHeight: "1.5", margin: 0 }}>
              {comparison?.explanation || trend?.explanation || "Longitudinal trend baseline established from verified SQLite records."}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid var(--border-card)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Evaluated against previous session record
            </div>
            <button
              className="ghost-button"
              style={{ padding: "6px 14px", fontSize: "12px" }}
              onClick={loadData}
              disabled={loading}
              title="Refresh database records"
            >
              <RotateCcw size={13} />
              {loading ? "Refreshing..." : "Refresh Database"}
            </button>
          </div>
        </article>
      </div>

      {/* Full Width: Trend Charts */}
      <TrendCharts data={trend?.chart_data || []} />

      {/* Full Width: SQLite Longitudinal Health Memory Table */}
      <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="card-header-row" style={{ marginBottom: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="diagnose-icon-circle blood">
              <Database size={17} />
            </div>
            <div>
              <h3 className="card-main-title" style={{ fontSize: "16px" }}>SQLite Longitudinal Health Memory</h3>
              <span className="card-sub-date">Persisted Patient Evaluations Database</span>
            </div>
          </div>
          <span className="badge" style={{ background: "var(--bg-surface)", color: "var(--text-dark)", fontWeight: "700", fontSize: "12px", padding: "4px 12px", borderRadius: "9999px" }}>
            {history.length} Saved Records
          </span>
        </div>

        {history.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              background: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px dashed var(--border-subtle)",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            No patient evaluations persisted to SQLite yet. Perform an assessment on the <strong>Overview</strong> or <strong>Document</strong> tab and click <strong>Save to SQLite</strong> to record longitudinal health entries.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {history.map((item) => (
              <div
                key={item.id}
                className="history-row"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "14px",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Shield size={16} className="text-primary" />
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--text-dark)" }}>{item.risk_category}</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Source: {item.source_dataset || "Manual Entry"} · ID: #{item.id}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: item.final_risk_score > 60 ? "#dc2626" : item.final_risk_score > 30 ? "#d97706" : "#16a34a",
                      background: item.final_risk_score > 60 ? "#fee2e2" : item.final_risk_score > 30 ? "#fef3c7" : "#dcfce7",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                    }}
                  >
                    {item.final_risk_score} / 100
                  </span>
                  <small style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "140px", textAlign: "right" }}>
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
