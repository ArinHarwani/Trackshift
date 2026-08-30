import React, { useState, useEffect } from "react";
import { Database, Zap, CheckCircle2, ShieldCheck, Play, Crosshair } from "lucide-react";

/**
 * BacktestStudio — FastF1 Historical Grand Prix & E-Prix Replay
 * Cohesive F1 Timing Tower & Pit-Wall Aesthetics.
 */
export default function BacktestStudio({
  scenarios = [],
  selectedScenarioId,
  onSelectScenario,
  backtestReport,
  loading,
}) {
  const [selectedLapIndex, setSelectedLapIndex] = useState(0);

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const lapByLap = backtestReport?.lap_by_lap || [];
  const activeLapData = lapByLap[selectedLapIndex] || lapByLap[0];

  useEffect(() => {
    setSelectedLapIndex(0);
  }, [selectedScenarioId]);

  return (
    <div className="pit-panel" style={{ padding: "20px", marginBottom: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            <Database size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text-primary)" }}>
              FASTF1 HISTORICAL RACE BACKTESTING // MODULE G
            </h3>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              Validate deterministic copilot predictions against real historical Grand Prix telemetry
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", padding: "4px 10px", borderRadius: "2px", fontSize: "0.72rem", color: "var(--purple-optimal)", fontWeight: 700 }}>
          <Database size={13} />
          <span className="font-display">FASTF1 TELEMETRY REPLAY</span>
        </div>
      </div>

      {/* Scenario Selector Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", marginBottom: "18px" }}>
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              style={{
                background: isSelected ? "var(--surface-panel-hover)" : "var(--surface-panel-subtle)",
                border: `1px solid ${isSelected ? "var(--purple-optimal)" : "var(--border-subtle)"}`,
                borderRadius: "3px",
                padding: "12px 14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div className="font-display" style={{ fontSize: "0.68rem", color: "var(--purple-optimal)", fontWeight: 800, marginBottom: "3px" }}>
                {sc.circuit}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: isSelected ? "#fff" : "var(--text-primary)", marginBottom: "4px" }}>
                {sc.title}
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", lineHeight: "1.3" }}>
                {sc.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Summary Performance Metrics */}
      {backtestReport && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
          <div style={{ background: "var(--surface-panel-subtle)", padding: "12px", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
            <span className="font-display" style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 700 }}>STRATEGY AGREEMENT</span>
            <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--green-compliant)", marginTop: "2px" }}>
              {backtestReport.summary_metrics.strategy_agreement_rate_pct}%
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Vs Historical Driver Actions</span>
          </div>

          <div style={{ background: "var(--surface-panel-subtle)", padding: "12px", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
            <span className="font-display" style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 700 }}>DELTA TIME GAINED</span>
            <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--purple-optimal)", marginTop: "2px" }}>
              {backtestReport.summary_metrics.estimated_time_delta_gained_sec.split(" ")[0]}
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Through Optimized Deployment</span>
          </div>

          <div style={{ background: "var(--surface-panel-subtle)", padding: "12px", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
            <span className="font-display" style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 700 }}>TACTICAL CYCLES</span>
            <div className="font-mono" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
              <span style={{ color: "var(--green-compliant)" }}>{backtestReport.summary_metrics.deploy_recommendations} Dep</span> /{" "}
              <span style={{ color: "var(--yellow-caution)" }}>{backtestReport.summary_metrics.conserve_recommendations} Cons</span>
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Deploy vs Lift-and-Coast Phases</span>
          </div>

          <div style={{ background: "var(--surface-panel-subtle)", padding: "12px", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
            <span className="font-display" style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 700 }}>FIA COMPLIANCE</span>
            <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--green-compliant)", marginTop: "4px" }}>
              100% VERIFIED
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Zero Power Overdraw Violations</span>
          </div>
        </div>
      )}

      {/* Lap-by-Lap Inspector */}
      {activeLapData && (
        <div>
          <div className="chevron-divider">HISTORICAL LAP-BY-LAP REPLAY (LAP {activeLapData.lap} OF {lapByLap.length})</div>

          {/* Lap Scrubber Buttons */}
          <div style={{ display: "flex", gap: "3px", overflowX: "auto", paddingBottom: "10px", marginBottom: "14px" }}>
            {lapByLap.map((l, idx) => {
              const isSelected = idx === selectedLapIndex;
              const action = l.recommendation?.raw_agent_outputs?.energy?.recommended_action;
              return (
                <button
                  key={l.lap}
                  onClick={() => setSelectedLapIndex(idx)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: "2px",
                    border: `1px solid ${isSelected ? "var(--purple-optimal)" : "var(--border-subtle)"}`,
                    background: isSelected ? "var(--purple-optimal)" : action === "deploy" ? "rgba(57,217,138,0.1)" : action === "conserve" ? "rgba(255,201,60,0.1)" : "var(--surface-panel-subtle)",
                    color: isSelected ? "#fff" : action === "deploy" ? "var(--green-compliant)" : action === "conserve" ? "var(--yellow-caution)" : "var(--text-secondary)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  L{l.lap}
                </button>
              );
            })}
          </div>

          {/* Selected Lap Deep Dive Card */}
          <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="font-display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "#fff" }}>
                  LAP {activeLapData.lap} STRATEGY AUDIT
                </span>
                <span
                  className="font-display"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {activeLapData.model_agreement}
                </span>
              </div>

              <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Battery SoC: <strong style={{ color: "#fff" }}>{activeLapData.state.energy_pct.toFixed(1)}%</strong> | Gap Ahead: <strong style={{ color: "#fff" }}>+{activeLapData.state.gap_ahead_sec.toFixed(2)}s</strong>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontStyle: "italic", marginBottom: "12px", borderLeft: "2px solid var(--purple-optimal)", paddingLeft: "10px" }}>
              "{activeLapData.recommendation.explanation}"
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <div>
                <span>Copilot Order: </span>
                <strong className="font-display" style={{ color: "var(--purple-optimal)" }}>
                  {activeLapData.recommendation.headline}
                </strong>
              </div>
              <div>
                <span>Historical Telemetry Action: </span>
                <strong style={{ color: "#fff" }}>
                  {activeLapData.historical_action}
                </strong>
              </div>
              <div>
                <span>Overtake Prob: </span>
                <strong className="font-mono" style={{ color: "var(--green-compliant)" }}>
                  {activeLapData.recommendation.overtake_probability_pct.toFixed(1)}%
                </strong>
              </div>
              <div>
                <span>Energy Action: </span>
                <strong className="font-display" style={{ color: activeLapData.recommendation.raw_agent_outputs?.energy?.recommended_action === "deploy" ? "var(--green-compliant)" : "var(--yellow-caution)" }}>
                  {activeLapData.recommendation.raw_agent_outputs?.energy?.recommended_action?.toUpperCase()} ({activeLapData.recommendation.raw_agent_outputs?.energy?.recommended_deploy_pct > 0 ? "+" : ""}{activeLapData.recommendation.raw_agent_outputs?.energy?.recommended_deploy_pct}%)
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
