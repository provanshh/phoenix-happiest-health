import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, User, Bot } from "lucide-react";
import { chatWithTwin } from "../services/api.js";

export default function HealthChatbot({ context }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your Multimodal Health Twin Assistant. Ask me anything about the active clinical evaluation, risk factors, or physiological waveforms.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const SUGGESTED_PROMPTS = [
    "What physiological factors are driving this risk score?",
    "Explain the blood pressure and arterial status.",
    "Are there any arrhythmia or ECG irregularities?",
  ];

  async function handleSend(queryText) {
    const q = (queryText || question).trim();
    if (!q) return;

    const userMsg = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await chatWithTwin(q, context);
      const assistantMsg = {
        role: "assistant",
        text: response.answer || "Clinical assessment completed for this query.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.message || "Unable to retrieve clinical answer." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="overview-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card-header-row" style={{ marginBottom: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="diagnose-icon-circle blood">
            <MessageSquare size={17} />
          </div>
          <div>
            <h3 className="card-main-title" style={{ fontSize: "16px" }}>Clinical Health Twin Assistant</h3>
            <span className="card-sub-date">Context-Grounded Conversational Intelligence</span>
          </div>
        </div>
        <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "700", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
          Active Session Grounded
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            className="treatment-pill"
            style={{ fontSize: "11px", padding: "5px 12px", cursor: "pointer", border: "1px solid #bfdbfe" }}
            onClick={() => handleSend(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        style={{
          maxHeight: "260px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "14px",
          background: "var(--bg-surface)",
          borderRadius: "16px",
          border: "1px solid var(--border-card)",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: "14px",
              fontSize: "13px",
              lineHeight: "1.4",
              background: msg.role === "user" ? "var(--color-primary)" : "#ffffff",
              color: msg.role === "user" ? "#ffffff" : "var(--text-dark)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              border: msg.role === "user" ? "none" : "1px solid var(--border-card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "11px", fontWeight: "700", opacity: 0.85 }}>
              {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
              <span>{msg.role === "user" ? "You" : "CardioTwin AI"}</span>
            </div>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
            Synthesizing clinical response...
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: "flex", gap: "10px" }}
      >
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, background: "var(--bg-surface)", fontSize: "13px" }}
          placeholder="Ask a question about the active patient's cardiovascular assessment..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="primary-button"
          disabled={loading || !question.trim()}
          title="Send query"
        >
          <Send size={15} /> Send
        </button>
      </form>
    </article>
  );
}
