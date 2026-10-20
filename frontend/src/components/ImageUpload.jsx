import React, { useEffect, useState } from "react";
import { ImageUp, FileText, CheckCircle } from "lucide-react";

export default function ImageUpload({ file, onFileChange, result }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <ImageUp size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>ECG Strip / Clinical Scan OCR</h3>
            <span className="card-sub-date">Computer Vision & Document OCR</span>
          </div>
        </div>
        <span className="badge" style={{ background: "var(--bg-surface)", color: "var(--text-muted)", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
          {result?.risk_category || "Optional Modality"}
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
        <ImageUp size={22} className="text-primary" />
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dark)" }}>
          {file?.name || "Upload ECG Strip or Clinical PDF/Image"}
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Supports PNG, JPG, WEBP, and PDF scans
        </span>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.pdf"
          style={{ display: "none" }}
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>

      {preview && (
        <div style={{ textAlign: "center", borderRadius: "12px", overflow: "hidden", maxHeight: "140px", border: "1px solid var(--border-card)" }}>
          <img src={preview} alt="Scan preview" style={{ maxWidth: "100%", maxHeight: "140px", objectFit: "contain" }} />
        </div>
      )}

      {result?.summary && (
        <div style={{ padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border-card)", fontSize: "12px", color: "var(--text-body)" }}>
          <strong>Extracted OCR Findings:</strong> {result.summary}
        </div>
      )}
    </article>
  );
}
