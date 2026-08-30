import React, { useState, useEffect } from "react";
import { Radio, CheckCircle, Clock, Zap, ArrowRight, Award, FileCode, Play } from "lucide-react";

export default function BacktestStudio({
  scenarios = [],
  selectedScenarioId,
  onSelectScenario,
  backtestReport,
  loading,
}) {
  const [selectedLapIndex, setSelectedLapIndex] = useState(0);

  // Default to first scenario if not loaded
  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const lapByLap = backtestReport?.lap_by_lap || [];
  const activeLapData = lapByLap[selectedLapIndex] || lapByLap[0];

  useEffect(() => {
    setSelectedLapIndex(0);
  }, [selectedScenarioId]);

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Radio size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
              FastF1 Historical Race Backtesting Studio <span style={{ color: "var(--neon-purple)", fontSize: "0.8rem" }}>// MODULE G</span>
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Validate deterministic copilot predictions against real historical Grand Prix telemetry
            </p>
          </div>
        </div>

        {/* FastF1 Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(181,95,230,0.15)", border: "1px solid rgba(181,95,230,0.4)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--neon-purple)", fontWeight: 700 }}>
          <FileCode size={14} />
          FastF1 Telemetry Engine
        </div>
      </div>

      {/* Scenario Selector Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`btn-preset ${isSelected ? "active" : ""}`}
              style={{
                borderColor: isSelected ? "var(--neon-purple)" : "var(--border-subtle)",
                background: isSelected ? "rgba(181, 95, 230, 0.15)" : "rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--neon-cyan)", fontWeight: 700, marginBottom: "4px" }}>
                {sc.circuit}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>
                {sc.title}
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                {sc.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Summary Performance Metrics */}
      {backtestReport && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <div style={{ background: "rgba(0,0,0,0.35)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Strategy Agreement</span>
            <div className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--neon-green)" }}>
              {backtestReport.summary_metrics.strategy_agreement_rate_pct}%
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Vs Historical Driver Actions</span>
          </div>

          <div style={{ background: "rgba(0,0,0,0.35)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Est. Time Delta Gained</span>
            <div className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--neon-cyan)" }}>
              {backtestReport.summary_metrics.estimated_time_delta_gained_sec.split(" ")[0]}
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Through Optimized Deployment</span>
          </div>

          <div style={{ background: "rgba(0,0,0,0.35)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Deploy Decisions</span>
            <div className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--neon-green)" }}>
              {backtestReport.summary_metrics.deploy_recommendations}
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Attack Mode & Overtakes</span>
          </div>

          <div style={{ background: "rgba(0,0,0,0.35)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Conserve Decisions</span>
            <div className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--neon-amber)" }}>
              {backtestReport.summary_metrics.conserve_recommendations}
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Lift & Coast Saves</span>
          </div>
        </div>
      )}

      {/* Interactive Lap Timeline Scrubber */}
      {lapByLap.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span className="font-display" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              REPLAY TIMELINE // SELECT LAP: <strong style={{ color: "var(--neon-purple)" }}>Lap {activeLapData?.lap}</strong>
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
              {lapByLap.length} Laps Available
            </span>
          </div>

          <input
            type="range"
            min="0"
            max={lapByLap.length - 1}
            value={selectedLapIndex}
            onChange={(e) => setSelectedLapIndex(parseInt(e.target.value))}
            style={{ marginBottom: "18px" }}
          />

          {/* Lap Comparison Card */}
          {activeLapData && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", background: "rgba(0,0,0,0.4)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(181,95,230,0.3)" }}>
              {/* Left: AI Copilot Call */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Zap size={16} color="var(--neon-cyan)" />
                  <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--neon-cyan)" }}>
                    AI Copilot Recommendation (Lap {activeLapData.lap})
                  </span>
                </div>

                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                  {activeLapData.recommendation?.headline}
                </div>

                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "10px" }}>
                  "{activeLapData.recommendation?.explanation}"
                </div>

                <div style={{ display: "flex", gap: "10px", fontSize: "0.72rem" }}>
                  <span style={{ background: "rgba(0,255,136,0.15)", color: "var(--neon-green)", padding: "3px 8px", borderRadius: "4px" }}>
                    Prob: {activeLapData.recommendation?.overtake_probability_pct}%
                  </span>
                  <span style={{ background: "rgba(0,240,255,0.15)", color: "var(--neon-cyan)", padding: "3px 8px", borderRadius: "4px" }}>
                    Score: {activeLapData.recommendation?.composite_score}
                  </span>
                </div>
              </div>

              {/* Right: Historical Real Race Driver Action */}
              <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Award size={16} color="var(--neon-amber)" />
                  <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--neon-amber)" }}>
                    Real Historical Action (Driver Telemetry)
                  </span>
                </div>

                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                  {activeLapData.historical_action}
                </div>

                <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Status: <strong>{activeLapData.model_agreement}</strong>
                </div>

                <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  Telemetry verified via FastF1 timing loops and sector GPS traces.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
