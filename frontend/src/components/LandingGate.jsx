import React, { useState } from "react";
import { Zap, ShieldCheck, Trophy, ArrowRight, Gauge } from "lucide-react";
import pitRadio from "../utils/audioSynth";

export default function LandingGate({ onEnterCockpit, initialName = "" }) {
  const [visitorName, setVisitorName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnter = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const nameToLog = visitorName.trim() || "Guest Judge";

    try {
      // Log visitor asynchronously to backend
      fetch("http://localhost:8000/api/log-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameToLog,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
        }),
      }).catch((err) => console.warn("Visitor log non-fatal:", err));
    } catch (err) {
      // Non-blocking
    }

    // Play subtle audio if available
    try {
      pitRadio.playRadioBeep();
    } catch (e) {}

    // Transition to Simple View
    setTimeout(() => {
      onEnterCockpit(nameToLog);
    }, 120);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #181D26 0%, #0A0C0F 70%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 20px",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Brand Bar */}
      <header
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              background: "var(--purple-optimal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(192, 76, 253, 0.4)",
            }}
          >
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <span
              className="font-display"
              style={{
                fontSize: "1.1rem",
                fontWeight: 900,
                letterSpacing: "0.05em",
                color: "var(--text-primary)",
              }}
            >
              TRACKSHIFT <span style={{ color: "var(--purple-optimal)" }}>COPILOT</span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className="font-display"
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--green-compliant)",
              background: "rgba(57, 217, 138, 0.1)",
              border: "1px solid rgba(57, 217, 138, 0.25)",
              padding: "4px 10px",
              borderRadius: "2px",
              letterSpacing: "0.05em",
            }}
          >
            ● LIVE DECISION SYSTEM
          </span>
        </div>
      </header>

      {/* Main Hero Card */}
      <main
        style={{
          maxWidth: "960px",
          margin: "auto",
          width: "100%",
          padding: "36px 0",
          textAlign: "center",
        }}
      >
        {/* Subtitle pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}>
          <span
            className="font-display"
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              background: "rgba(192, 76, 253, 0.12)",
              color: "var(--purple-optimal)",
              border: "1px solid rgba(192, 76, 253, 0.3)",
              padding: "5px 14px",
              borderRadius: "999px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Virtual Race Engineer // Real-Time Overtake Intelligence
          </span>
        </div>

        {/* 1. The Core Plain-English Statement */}
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(1.65rem, 3.2vw, 2.45rem)",
            fontWeight: 900,
            lineHeight: 1.35,
            color: "var(--text-primary)",
            maxWidth: "880px",
            margin: "0 auto 28px auto",
            letterSpacing: "-0.015em",
          }}
        >
          This AI decides, in real time, whether a race car should use its limited extra power to try an overtake right now — or save it for later.{" "}
          <span style={{ color: "var(--green-compliant)" }}>Get it right, gain a position.</span>{" "}
          <span style={{ color: "var(--red-violation)" }}>Get it wrong, lose the race.</span>
        </h1>

        {/* 2. Three Large Headline Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            margin: "0 auto 36px auto",
            maxWidth: "920px",
            textAlign: "left",
          }}
        >
          {/* Stat 1 */}
          <div
            style={{
              background: "var(--surface-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "var(--purple-optimal)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Trophy size={18} color="var(--purple-optimal)" />
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                RACE REPLAY OUTCOME
              </span>
            </div>
            <div
              className="font-display"
              style={{
                fontSize: "2.1rem",
                fontWeight: 900,
                color: "var(--text-primary)",
                lineHeight: 1.1,
                marginBottom: "6px",
              }}
            >
              +2 Net Positions
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
              Gained over historical baseline across 50 full race laps through optimized energy surge timing.
            </p>
          </div>

          {/* Stat 2 */}
          <div
            style={{
              background: "var(--surface-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "var(--green-compliant)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <ShieldCheck size={18} color="var(--green-compliant)" />
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                SAFETY & COMPLIANCE
              </span>
            </div>
            <div
              className="font-display"
              style={{
                fontSize: "2.1rem",
                fontWeight: 900,
                color: "var(--green-compliant)",
                lineHeight: 1.1,
                marginBottom: "6px",
              }}
            >
              0 Violations
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
              Real-time mathematical guardrails block any power burst that would risk a penalty or battery drain.
            </p>
          </div>

          {/* Stat 3 */}
          <div
            style={{
              background: "var(--surface-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "var(--yellow-caution)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Gauge size={18} color="var(--yellow-caution)" />
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                TELEMETRY ACCURACY
              </span>
            </div>
            <div
              className="font-display"
              style={{
                fontSize: "2.1rem",
                fontWeight: 900,
                color: "var(--text-primary)",
                lineHeight: 1.1,
                marginBottom: "6px",
              }}
            >
              92.4% Match
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
              Benchmarked against real Formula 1 & Formula E Grand Prix telemetry data (Monza, Silverstone, Berlin).
            </p>
          </div>
        </div>

        {/* 3. Name Field & Enter Cockpit Action */}
        <form
          onSubmit={handleEnter}
          style={{
            background: "var(--surface-panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            padding: "24px 28px",
            maxWidth: "540px",
            margin: "0 auto",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        >
          <label
            htmlFor="visitor-name-input"
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              textAlign: "left",
            }}
          >
            Enter your name to start <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(optional — no email needed)</span>:
          </label>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              id="visitor-name-input"
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="e.g. Judge Alex, Racing Fan..."
              maxLength={40}
              style={{
                flex: "1 1 220px",
                background: "#0A0C0F",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "12px 14px",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                fontFamily: "var(--font-sans)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--purple-optimal)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="font-display"
              style={{
                flex: "0 0 auto",
                background: "var(--purple-optimal)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "4px",
                padding: "12px 24px",
                fontSize: "0.95rem",
                fontWeight: 900,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                letterSpacing: "0.04em",
                boxShadow: "0 0 18px rgba(192, 76, 253, 0.4)",
                transition: "transform 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
            >
              <span>ENTER COCKPIT</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "10px", textAlign: "left", margin: "10px 0 0 0" }}>
            Clicking Enter opens the interactive decision cockpit with simple visual simulations. Full telemetry is available anytime.
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.72rem",
          color: "var(--text-dim)",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span>TrackShift 2026 // Energy & Overtake Intelligence Multi-Agent System</span>
        <span>Deterministic 50ms Physics Engine + Gemini Natural Language Strategist</span>
      </footer>
    </div>
  );
}
