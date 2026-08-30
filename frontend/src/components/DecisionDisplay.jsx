import React from "react";
import { Zap, ShieldCheck, AlertTriangle, Play, CheckCircle2, TrendingUp, Info, HelpCircle } from "lucide-react";
import { pitRadio } from "../utils/audioSynth";

export default function DecisionDisplay({ strategy, onPlayAudio }) {
  if (!strategy) {
    return (
      <div className="glass-panel" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
        Calculating optimal strategy matrix...
      </div>
    );
  }

  const {
    headline,
    overtake_probability_pct,
    expected_position_gain,
    energy_cost_verdict,
    rule_compliance,
    composite_score,
    explanation,
    scoring_breakdown,
    raw_agent_outputs,
  } = strategy;

  // Banner color determination
  const isDeploy = raw_agent_outputs?.energy?.recommended_action === "deploy";
  const isConserve = raw_agent_outputs?.energy?.recommended_action === "conserve";
  const isViolation = rule_compliance !== "verified";

  let bannerBg = "linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 100, 255, 0.1))";
  let bannerBorder = "var(--neon-cyan)";
  let actionTag = "HYBRID MANAGEMENT";

  if (isViolation) {
    bannerBg = "linear-gradient(135deg, rgba(255, 51, 102, 0.25), rgba(200, 0, 50, 0.15))";
    bannerBorder = "var(--neon-red)";
    actionTag = "RULE BREACH PREVENTED";
  } else if (isDeploy) {
    bannerBg = "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 200, 100, 0.1))";
    bannerBorder = "var(--neon-green)";
    actionTag = "DEPLOY OVERDRIVE";
  } else if (isConserve) {
    bannerBg = "linear-gradient(135deg, rgba(255, 184, 0, 0.2), rgba(200, 120, 0, 0.1))";
    bannerBorder = "var(--neon-amber)";
    actionTag = "LIFT & COAST CONSERVATION";
  }

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "20px", position: "relative", border: `1px solid ${bannerBorder}`, boxShadow: `0 0 30px ${isDeploy ? "rgba(0,255,136,0.15)" : isConserve ? "rgba(255,184,0,0.15)" : "rgba(0,240,255,0.15)"}` }}>
      {/* Top Tag & Sound Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderRadius: "4px",
            background: isViolation ? "var(--neon-red)" : isDeploy ? "var(--neon-green)" : isConserve ? "var(--neon-amber)" : "var(--neon-cyan)",
            color: "#000",
          }}>
            {actionTag}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Strategy Orchestrator Output • Window: <strong style={{ color: "#fff" }}>{raw_agent_outputs?.overtake?.best_window?.replace(/_/g, " ").toUpperCase()}</strong>
          </span>
        </div>

        {/* Audio synthesize button */}
        <button
          onClick={() => pitRadio.speak(headline + ". " + explanation)}
          className="btn-secondary"
          style={{ padding: "5px 12px", fontSize: "0.75rem", background: "rgba(0,0,0,0.4)" }}
          title="Play Pit Wall Radio Callout"
        >
          <Play size={13} fill="var(--neon-cyan)" color="var(--neon-cyan)" />
          Play Pit Radio Callout
        </button>
      </div>

      {/* Main Headline */}
      <h2 className="font-display" style={{ fontSize: "1.45rem", fontWeight: 800, color: "#fff", lineHeight: "1.3", marginBottom: "14px" }}>
        {headline}
      </h2>

      {/* Grid of Key Strategy Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        {/* Metric 1: Overtake Probability */}
        <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "4px" }}>
            <span>Overtake Prob</span>
            <TrendingUp size={14} color="var(--neon-green)" />
          </div>
          <div className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: overtake_probability_pct >= 60 ? "var(--neon-green)" : overtake_probability_pct >= 40 ? "var(--neon-amber)" : "var(--text-muted)" }}>
            {overtake_probability_pct.toFixed(1)}%
          </div>
          <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
            Target: +{expected_position_gain} Position
          </span>
        </div>

        {/* Metric 2: Recommended Deploy/Conserve % */}
        <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "4px" }}>
            <span>Energy Action</span>
            <Zap size={14} color={isDeploy ? "var(--neon-green)" : "var(--neon-amber)"} />
          </div>
          <div className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: isDeploy ? "var(--neon-green)" : isConserve ? "var(--neon-amber)" : "var(--neon-cyan)" }}>
            {raw_agent_outputs?.energy?.recommended_deploy_pct > 0 ? "+" : ""}{raw_agent_outputs?.energy?.recommended_deploy_pct}%
          </div>
          <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
            Cost: {energy_cost_verdict?.toUpperCase()}
          </span>
        </div>

        {/* Metric 3: Composite Strategic Score */}
        <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "4px" }}>
            <span>Composite Score</span>
            <Info size={14} color="var(--neon-cyan)" />
          </div>
          <div className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--neon-cyan)" }}>
            {composite_score.toFixed(2)}
          </div>
          <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
            Scale: 0.00 to 1.00 index
          </span>
        </div>

        {/* Metric 4: FIA Rules Verification */}
        <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "4px" }}>
            <span>FIA Compliance</span>
            <ShieldCheck size={14} color={rule_compliance === "verified" ? "var(--neon-green)" : "var(--neon-red)"} />
          </div>
          <div className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: rule_compliance === "verified" ? "var(--neon-green)" : "var(--neon-red)", marginTop: "4px" }}>
            {rule_compliance === "verified" ? "VERIFIED" : "BLOCKED"}
          </div>
          <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
            Max safe draw: {raw_agent_outputs?.rules?.max_safe_deploy_this_lap_kwh || 4.0} kWh
          </span>
        </div>
      </div>

      {/* Radio Engineer Explanation Box */}
      <div style={{ background: "rgba(0,0,0,0.45)", borderLeft: `3px solid ${bannerBorder}`, borderRadius: "0 8px 8px 0", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <span className="live-pulse" />
          <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--neon-cyan)" }}>
            PIT WALL RADIO TRANSCRIPT // GEMINI SYNTHESIS
          </span>
        </div>
        <p style={{ fontSize: "0.88rem", color: "#e2e8f0", lineHeight: "1.55" }}>
          "{explanation}"
        </p>
      </div>
    </div>
  );
}
