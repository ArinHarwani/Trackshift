import React from "react";
import { Play, Volume2, ShieldCheck, AlertTriangle, Zap, Crosshair, ArrowUpRight } from "lucide-react";
import pitRadio from "../utils/audioSynth";

/**
 * Hero Zone — Asymmetric 60/40 Pit-Wall Recommendation Panel
 * Left ~60%: Dominant Strategy Order & Pit Radio Callout
 * Right ~40%: Stacked Overtake Probability & Energy Deployment Readouts
 */
export default function DecisionDisplay({ strategyOutput, raceState }) {
  if (!strategyOutput) {
    return (
      <div className="pit-panel" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
        <p className="font-display">Telemetry Standby — Awaiting Race State Pipeline</p>
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
    raw_agent_outputs,
  } = strategyOutput;

  const energyAction = raw_agent_outputs?.energy?.recommended_action || "hybrid";
  const isDeploy = energyAction === "deploy";
  const isConserve = energyAction === "conserve";
  const isOptimal = composite_score >= 0.65;
  const isCompliant = rule_compliance === "verified";

  const energyMargin = raw_agent_outputs?.energy?.rationale_data?.energy_margin_pct ?? 0;
  const deployPct = raw_agent_outputs?.energy?.recommended_deploy_pct ?? 0;

  return (
    <div className="pit-panel" style={{ marginBottom: "20px" }}>
      {/* Top Kerb Accent Strip */}
      <div className="kerb-stripes" />

      {/* Asymmetric 60/40 Hero Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 0.95fr)",
          gap: "24px",
          padding: "24px",
        }}
      >
        {/* LEFT 60%: Dominant Strategy Command & Pit Radio */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Optimal / Tactical Signal Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span
                className="font-display"
                style={{
                  background: isOptimal ? "var(--purple-optimal)" : isConserve ? "var(--yellow-caution)" : "var(--surface-panel-hover)",
                  color: isOptimal ? "#fff" : isConserve ? "#0A0C0F" : "var(--text-primary)",
                  fontWeight: 900,
                  fontSize: "0.7rem",
                  padding: "3px 8px",
                  borderRadius: "2px",
                  letterSpacing: "0.08em",
                }}
              >
                {isOptimal ? "PURPLE // OPTIMAL CALL" : isConserve ? "CAUTION // CONSERVATION" : "BALANCED STRATEGY"}
              </span>

              <span
                className="font-mono"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                }}
              >
                SCORE: {composite_score.toFixed(2)}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
                <ShieldCheck size={14} color={isCompliant ? "var(--green-compliant)" : "var(--red-violation)"} />
                <span
                  className="font-display"
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: isCompliant ? "var(--green-compliant)" : "var(--red-violation)",
                  }}
                >
                  {isCompliant ? "FIA COMPLIANT" : "TECHNICAL BREACH"}
                </span>
              </div>
            </div>

            {/* Main Dominant Headline */}
            <h1
              className="font-display"
              style={{
                fontSize: "1.75rem",
                fontWeight: 900,
                color: "var(--text-primary)",
                lineHeight: "1.2",
                marginBottom: "14px",
                letterSpacing: "-0.01em",
              }}
            >
              {headline}
            </h1>

            {/* Pit Radio Voice Callout Box */}
            <div
              style={{
                background: "var(--surface-panel-subtle)",
                borderLeft: `3px solid ${isOptimal ? "var(--purple-optimal)" : "var(--green-compliant)"}`,
                padding: "12px 14px",
                borderRadius: "0 4px 4px 0",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Volume2 size={13} color="var(--text-secondary)" />
                <span className="font-display" style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  PIT WALL RADIO // CH-1
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--text-primary)",
                  lineHeight: "1.45",
                  fontStyle: "italic",
                }}
              >
                "{explanation}"
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "8px" }}>
            <button
              onClick={() => pitRadio.speak(`${headline}. ${explanation}`)}
              className="btn-f1 btn-f1-purple"
              title="Transmit speech over pit wall audio"
            >
              <Play size={13} fill="#fff" />
              Transmit Pit Radio Callout
            </button>

            <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem" }}>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Target Gain: </span>
                <strong className="font-mono" style={{ color: "var(--green-compliant)" }}>
                  +{expected_position_gain} POS
                </strong>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Attack Window: </span>
                <strong className="font-display" style={{ color: "var(--text-primary)" }}>
                  {raw_agent_outputs?.overtake?.best_window?.replace(/_/g, " ") || "NEXT LAP"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 40%: Stacked Overtake & Energy Telemetry Gauges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Gauge 1: Overtake Success Probability */}
          <div
            style={{
              background: "var(--surface-panel-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "3px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Crosshair size={15} color="var(--green-compliant)" />
                <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  OVERTAKE PROBABILITY
                </span>
              </div>
              <span className="font-display" style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                GAP: {raceState?.gap_ahead_sec?.toFixed(2)}s
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
              <span
                className="font-mono"
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: overtake_probability_pct >= 60 ? "var(--green-compliant)" : overtake_probability_pct >= 35 ? "var(--yellow-caution)" : "var(--text-secondary)",
                }}
              >
                {overtake_probability_pct.toFixed(1)}%
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                vs {raceState?.rival_driver_name || "Rival"}
              </span>
            </div>

            {/* Probability Progress Bar */}
            <div style={{ height: "4px", background: "#232832", borderRadius: "2px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, overtake_probability_pct))}%`,
                  height: "100%",
                  background: overtake_probability_pct >= 60 ? "var(--green-compliant)" : overtake_probability_pct >= 35 ? "var(--yellow-caution)" : "var(--text-secondary)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Gauge 2: Energy Deployment & Target Margin */}
          <div
            style={{
              background: "var(--surface-panel-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "3px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={15} color={isDeploy ? "var(--green-compliant)" : isConserve ? "var(--yellow-caution)" : "var(--purple-optimal)"} />
                <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  ENERGY DEPLOYMENT RATE
                </span>
              </div>
              <span
                className="font-display"
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: isDeploy ? "var(--green-compliant)" : isConserve ? "var(--yellow-caution)" : "var(--purple-optimal)",
                  background: "rgba(255,255,255,0.05)",
                  padding: "1px 5px",
                  borderRadius: "2px",
                }}
              >
                {energyAction.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
              <span
                className="font-mono"
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: deployPct > 0 ? "var(--green-compliant)" : deployPct < 0 ? "var(--yellow-caution)" : "var(--text-primary)",
                }}
              >
                {deployPct > 0 ? `+${deployPct.toFixed(1)}` : deployPct.toFixed(1)}%
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Target Delta Margin:{" "}
                <strong className="font-mono" style={{ color: energyMargin >= 0 ? "var(--green-compliant)" : "var(--yellow-caution)" }}>
                  {energyMargin >= 0 ? "+" : ""}{energyMargin.toFixed(1)}%
                </strong>
              </span>
            </div>

            {/* Target kWh per lap */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-dim)" }}>
              <span>Target: {raw_agent_outputs?.energy?.rationale_data?.target_kwh_per_lap?.toFixed(2)} kWh/lap</span>
              <span>Reserve: {raw_agent_outputs?.energy?.laps_of_reserve_at_current_rate?.toFixed(1)} Laps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
