import React from "react";
import { Zap, Activity, Cpu, Database, Volume2, VolumeX } from "lucide-react";
import pitRadio from "../utils/audioSynth";

/**
 * Clean Pit-Wall Top Navigation Bar
 */
export default function Navbar({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
}) {
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    pitRadio.enabled = next;
    if (next) pitRadio.playRadioBeep();
  };

  return (
    <header
      style={{
        background: "var(--surface-panel)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      {/* Brand Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "2px",
            background: "var(--purple-optimal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="font-display" style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-primary)" }}>
              TRACKSHIFT <span style={{ color: "var(--purple-optimal)" }}>COPILOT</span>
            </span>
            <span
              className="font-display"
              style={{
                fontSize: "0.62rem",
                background: "rgba(255,255,255,0.06)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
                padding: "1px 6px",
                borderRadius: "2px",
                fontWeight: 700,
              }}
            >
              MULTI-AGENT DECISION ENGINE
            </span>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
            Deterministic Energy & Overtake Intelligence // Formula E & F1 Architecture
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--surface-panel-subtle)", padding: "3px", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`btn-f1 ${activeTab === "sandbox" ? "btn-f1-active" : ""}`}
          style={{
            borderBottom: activeTab === "sandbox" ? "2px solid var(--purple-optimal)" : "1px solid transparent",
          }}
        >
          <Cpu size={14} />
          Strategy Sandbox
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`btn-f1 ${activeTab === "simulator" ? "btn-f1-active" : ""}`}
          style={{
            borderBottom: activeTab === "simulator" ? "2px solid var(--purple-optimal)" : "1px solid transparent",
          }}
        >
          <Activity size={14} />
          Live Telemetry Simulator
        </button>

        <button
          onClick={() => setActiveTab("backtest")}
          className={`btn-f1 ${activeTab === "backtest" ? "btn-f1-active" : ""}`}
          style={{
            borderBottom: activeTab === "backtest" ? "2px solid var(--purple-optimal)" : "1px solid transparent",
          }}
        >
          <Database size={14} />
          FastF1 Backtesting
        </button>
      </nav>

      {/* Right Controls: Audio Pit Radio Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={handleToggleSound}
          className="btn-f1"
          style={{ fontSize: "0.72rem" }}
          title={soundEnabled ? "Pit Radio Audio Mute" : "Enable Pit Radio Audio Synthesizer"}
        >
          {soundEnabled ? <Volume2 size={14} color="var(--green-compliant)" /> : <VolumeX size={14} color="var(--text-dim)" />}
          <span className="font-display">RADIO AUDIO: {soundEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>
    </header>
  );
}
