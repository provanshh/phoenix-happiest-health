import React, { useEffect, useState } from "react";
import { Radio, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { connectDevice, disconnectDevice, getDeviceStreamStatus } from "../services/api.js";

export default function LiveSensorMonitor() {
  const [deviceStatus, setDeviceStatus] = useState({
    connection_state: "DISCONNECTED",
    device_name: null,
    last_received_timestamp: null,
    is_receiving: false,
    status_message: "No live sensor connection.",
  });
  const [loading, setLoading] = useState(false);

  async function refreshStatus() {
    try {
      const data = await getDeviceStreamStatus();
      setDeviceStatus(data);
    } catch {
      // Keep disconnected on network error
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  async function handleToggleConnect() {
    setLoading(true);
    try {
      if (deviceStatus.connection_state === "RECEIVING_DATA" || deviceStatus.connection_state === "CONNECTED") {
        const data = await disconnectDevice();
        setDeviceStatus(data);
      } else {
        const data = await connectDevice("CardioTwin BLE Optical Oximeter");
        setDeviceStatus(data);
      }
    } finally {
      setLoading(false);
    }
  }

  const isConnected = deviceStatus.connection_state === "RECEIVING_DATA" || deviceStatus.connection_state === "CONNECTED";

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <Radio size={17} className={isConnected ? "text-primary" : "text-muted"} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>Hardware Telemetry Stream Interface</h3>
            <span className="card-sub-date">Real-Time Sensor State Machine</span>
          </div>
        </div>
        <span
          className="badge"
          style={{
            fontSize: "11px",
            fontWeight: "800",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "9999px",
            background: isConnected ? "#dcfce7" : "#fee2e2",
            color: isConnected ? "#16a34a" : "#dc2626",
          }}
        >
          {deviceStatus.connection_state}
        </span>
      </div>

      <div style={{ padding: "14px", background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-card)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dark)" }}>
          {deviceStatus.status_message}
        </div>
        {deviceStatus.device_name && (
          <div style={{ fontSize: "12px", color: "var(--text-body)" }}>
            Connected Device: <strong>{deviceStatus.device_name}</strong>
          </div>
        )}
        {deviceStatus.last_received_timestamp && (
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Last Telemetry Packet: {new Date(deviceStatus.last_received_timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          className={isConnected ? "ghost-button" : "primary-button"}
          style={{ padding: "8px 18px", fontSize: "13px" }}
          onClick={handleToggleConnect}
          disabled={loading}
        >
          {isConnected ? (
            <>
              <WifiOff size={15} /> Disconnect Sensor Stream
            </>
          ) : (
            <>
              <Wifi size={15} /> Connect Test BLE Pulse Sensor
            </>
          )}
        </button>
        <button
          className="ghost-button"
          style={{ padding: "8px 14px", fontSize: "13px" }}
          onClick={refreshStatus}
          title="Refresh hardware status"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </article>
  );
}
