import React from "react";
import {
  Zap,
  Activity,
  Cpu,
  Database,
  Volume2,
  VolumeX,
  Sliders,
  ChevronLeft,
  Home,
  Layers,
} from "lucide-react";
import pitRadio from "../utils/audioSynth";

/**
 * Responsive Navigation Bar supporting both Simple View and Full Telemetry (Expert Mode)
 */
export default function Navbar({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  viewMode = "simple",
  setViewMode,
  onGoToGate,
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
      {/* Left: Brand Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "4px",
            background: "var(--purple-optimal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(192, 76, 253, 0.4)",
          }}
        >
          <Zap size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              className="font-display"
              style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-primary)" }}
            >
              TRACKSHIFT <span style={{ color: "var(--purple-optimal)" }}>COPILOT</span>
            </span>
            <span
              className="font-display"
              style={{
                fontSize: "0.62rem",
                background: viewMode === "expert" ? "rgba(192, 76, 253, 0.15)" : "rgba(255,255,255,0.06)",
                color: viewMode === "expert" ? "var(--purple-optimal)" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
                padding: "2px 8px",
                borderRadius: "2px",
                fontWeight: 800,
                letterSpacing: "0.06em",
              }}
            >
              {viewMode === "expert" ? "EXPERT MODE // FULL TELEMETRY" : "SIMPLE COCKPIT"}
            </span>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: 0 }}>
            {viewMode === "expert"
              ? "Deterministic Multi-Agent Engine // Formula E & F1 Architecture"
              : "Real-Time AI Overtake & Energy Intelligence"}
          </p>
        </div>
      </div>

      {/* Center: Tabs in Expert Mode OR View Switcher in Simple Mode */}
      {viewMode === "expert" ? (
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--surface-panel-subtle)",
            padding: "3px",
            borderRadius: "4px",
            border: "1px solid var(--border-subtle)",
          }}
        >
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
      ) : (
        /* In Simple View: Clean indicator button to access expert tools */
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setViewMode("expert")}
            className="font-display"
            style={{
              background: "var(--surface-panel-subtle)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              padding: "6px 14px",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--purple-optimal)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
          >
            <Sliders size={13} color="var(--purple-optimal)" />
            <span>Show Full Telemetry (Expert Mode)</span>
          </button>
        </div>
      )}

      {/* Right Controls: Simple / Expert toggle & Audio & Overview */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Toggle between Simple View and Expert Mode */}
        {viewMode === "expert" && (
          <button
            onClick={() => setViewMode("simple")}
            className="font-display"
            style={{
              background: "rgba(192, 76, 253, 0.12)",
              color: "var(--purple-optimal)",
              border: "1px solid rgba(192, 76, 253, 0.3)",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "0.74rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ChevronLeft size={14} />
            <span>Return to Simple View</span>
          </button>
        )}

        {/* Audio Pit Radio Toggle */}
        <button
          onClick={handleToggleSound}
          className="btn-f1"
          style={{ fontSize: "0.72rem" }}
          title={soundEnabled ? "Pit Radio Audio Mute" : "Enable Pit Radio Audio Synthesizer"}
        >
          {soundEnabled ? <Volume2 size={14} color="var(--green-compliant)" /> : <VolumeX size={14} color="var(--text-dim)" />}
          <span className="font-display">AUDIO: {soundEnabled ? "ON" : "OFF"}</span>
        </button>

        {/* Back to Overview / Landing Gate */}
        {onGoToGate && (
          <button
            onClick={onGoToGate}
            className="btn-f1"
            style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}
            title="Return to Welcome & Stats Overview"
          >
            <Home size={13} />
            <span>Overview</span>
          </button>
        )}
      </div>
    </header>
  );
}
