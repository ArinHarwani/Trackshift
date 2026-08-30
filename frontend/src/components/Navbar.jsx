import React from "react";
import { Radio, Activity, Zap, Cpu, Volume2, VolumeX, ShieldCheck } from "lucide-react";
import { pitRadio } from "../utils/audioSynth";

export default function Navbar({
  activeTab,
  setActiveTab,
  trackName,
  setTrackName,
  soundEnabled,
  setSoundEnabled,
  ruleStatus,
}) {
  const tracks = [
    { id: "monza", name: "Autodromo Nazionale Monza" },
    { id: "silverstone", name: "Silverstone Circuit" },
    { id: "berlin", name: "Berlin Tempelhof E-Prix" },
    { id: "monaco", name: "Circuit de Monaco" },
  ];

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    pitRadio.enabled = next;
    if (next) pitRadio.playRadioBeep();
  };

  return (
    <header className="glass-panel" style={{ margin: "16px 20px 0", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", zIndex: 100 }}>
      {/* Brand Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #00f0ff, #b55fe6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 16px rgba(0, 240, 255, 0.4)",
        }}>
          <Zap size={22} color="#07090e" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="font-display" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.08em", color: "#fff" }}>
              TRACKSHIFT <span style={{ color: "var(--neon-cyan)" }}>COPILOT</span>
            </span>
            <span style={{
              fontSize: "0.65rem",
              background: "rgba(0, 240, 255, 0.15)",
              color: "var(--neon-cyan)",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: 700,
            }}>
              MULTI-AGENT DECISION ENGINE
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Deterministic Energy & Overtake Intelligence • Math-First Formula Architecture
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.35)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`btn-secondary ${activeTab === "sandbox" ? "glass-panel-active" : ""}`}
          style={{
            background: activeTab === "sandbox" ? "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,100,255,0.2))" : "transparent",
            color: activeTab === "sandbox" ? "var(--neon-cyan)" : "var(--text-muted)",
            borderColor: activeTab === "sandbox" ? "var(--neon-cyan)" : "transparent",
          }}
        >
          <Cpu size={16} />
          Strategy Sandbox
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`btn-secondary ${activeTab === "simulator" ? "glass-panel-active" : ""}`}
          style={{
            background: activeTab === "simulator" ? "linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,200,100,0.2))" : "transparent",
            color: activeTab === "simulator" ? "var(--neon-green)" : "var(--text-muted)",
            borderColor: activeTab === "simulator" ? "var(--neon-green)" : "transparent",
          }}
        >
          <Activity size={16} />
          Live Telemetry Simulator
        </button>

        <button
          onClick={() => setActiveTab("backtest")}
          className={`btn-secondary ${activeTab === "backtest" ? "glass-panel-active" : ""}`}
          style={{
            background: activeTab === "backtest" ? "linear-gradient(135deg, rgba(181,95,230,0.2), rgba(100,50,200,0.2))" : "transparent",
            color: activeTab === "backtest" ? "var(--neon-purple)" : "var(--text-muted)",
            borderColor: activeTab === "backtest" ? "var(--neon-purple)" : "transparent",
          }}
        >
          <Radio size={16} />
          FastF1 Backtesting
        </button>
      </nav>

      {/* Right Controls: Track selector, Sound toggle, FIA status */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* FIA Rule verification badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: ruleStatus === "verified" ? "rgba(0,255,136,0.1)" : "rgba(255,51,102,0.15)",
          border: `1px solid ${ruleStatus === "verified" ? "rgba(0,255,136,0.4)" : "rgba(255,51,102,0.6)"}`,
          padding: "5px 10px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: ruleStatus === "verified" ? "var(--neon-green)" : "var(--neon-red)",
        }}>
          <ShieldCheck size={14} />
          <span>{ruleStatus === "verified" ? "FIA COMPLIANT" : "RULE BREACH"}</span>
        </div>

        {/* Pit Radio Audio Toggle */}
        <button
          onClick={handleToggleSound}
          title={soundEnabled ? "Pit Radio Audio On (Click to Mute)" : "Pit Radio Audio Muted"}
          className="btn-secondary"
          style={{
            padding: "8px 10px",
            color: soundEnabled ? "var(--neon-amber)" : "var(--text-dim)",
            borderColor: soundEnabled ? "rgba(255,184,0,0.4)" : "var(--border-subtle)",
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </header>
  );
}
