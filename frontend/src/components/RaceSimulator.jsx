import React, { useState, useEffect } from "react";
import { Play, Pause, SkipForward, RotateCcw, Activity, Gauge, TrendingDown, Flag, Zap, Crosshair } from "lucide-react";

/**
 * RaceSimulator — 50-Lap Live Telemetry Simulation Engine
 * Cohesive F1 Pit-Wall styling with tabular timing telemetry and playback controls.
 */
export default function RaceSimulator({
  simState,
  simStrategy,
  onStep,
  onReset,
  history = [],
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Auto-play interval
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      const delay = Math.max(250, 1000 / speedMultiplier);
      interval = setInterval(() => {
        onStep();
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, onStep]);

  // Pause if race reaches final lap
  useEffect(() => {
    if (simState && simState.laps_remaining <= 0) {
      setIsPlaying(false);
    }
  }, [simState]);

  if (!simState) return null;

  const totalLaps = simState.lap_number + simState.laps_remaining;
  const progressPct = ((simState.lap_number / totalLaps) * 100).toFixed(0);

  return (
    <div className="pit-panel" style={{ padding: "20px", marginBottom: "20px" }}>
      {/* Header & Playback Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
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
            <Activity size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text-primary)" }}>
              LIVE TELEMETRY SIMULATOR // 50-LAP ENGINE
            </h3>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              Step or auto-play through dynamic race degradation with live strategy recalculation
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-f1 btn-f1-purple"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="#fff" />}
            {isPlaying ? "Pause Sim" : "Auto Play"}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onStep();
            }}
            className="btn-f1"
            title="Step 1 Lap Forward"
          >
            <SkipForward size={14} />
            Step Lap (+1)
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            className="btn-f1"
            title="Reset Simulation"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          {/* Speed Selectors */}
          <div style={{ display: "flex", gap: "3px", marginLeft: "4px", background: "var(--surface-panel-subtle)", padding: "2px", borderRadius: "2px", border: "1px solid var(--border-subtle)" }}>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "3px 7px",
                  borderRadius: "2px",
                  border: "none",
                  background: speedMultiplier === spd ? "var(--surface-panel-hover)" : "transparent",
                  color: speedMultiplier === spd ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Race Progress Bar */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
          <span className="font-display">RACE DISTANCE PROGRESS</span>
          <span className="font-mono">
            LAP {simState.lap_number} / {totalLaps} ({progressPct}%)
          </span>
        </div>
        <div style={{ height: "4px", background: "#232832", borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "var(--purple-optimal)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Telemetry Strip Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        {/* Metric 1: Track Position */}
        <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "2px" }}>
            TRACK POSITION
          </div>
          <div className="font-display" style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>
            P{simState.track_position}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
            Defending vs {simState.rival_driver_name}
          </div>
        </div>

        {/* Metric 2: Battery SoC */}
        <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "2px" }}>
            BATTERY SOC %
          </div>
          <div className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: simState.energy_pct < 20 ? "var(--red-violation)" : "var(--green-compliant)" }}>
            {simState.energy_pct.toFixed(1)}%
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
            FIA Cap: {simState.total_energy_budget_kwh} kWh
          </div>
        </div>

        {/* Metric 3: Gap Ahead */}
        <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "2px" }}>
            GAP AHEAD (s)
          </div>
          <div className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: simState.gap_ahead_sec <= 0.6 ? "var(--green-compliant)" : "#fff" }}>
            +{simState.gap_ahead_sec.toFixed(2)}s
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
            DRS Detection: {simState.drs_zone_ahead_m}m
          </div>
        </div>

        {/* Metric 4: Tyre Wear */}
        <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "2px" }}>
            TYRE WEAR ({simState.tyre_compound.toUpperCase()})
          </div>
          <div className="font-mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: simState.tyre_wear_pct > 70 ? "var(--red-violation)" : simState.tyre_wear_pct > 40 ? "var(--yellow-caution)" : "var(--text-primary)" }}>
            {simState.tyre_wear_pct.toFixed(0)}%
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
            Grip Life Remaining
          </div>
        </div>
      </div>

      {/* Historical Telemetry Log */}
      {history.length > 0 && (
        <div>
          <div className="chevron-divider">SIMULATION TELEMETRY LOG (LAST {history.length} LAPS)</div>
          <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border-subtle)", borderRadius: "3px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
              <thead>
                <tr style={{ background: "var(--surface-panel-subtle)", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-display)" }}>LAP</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-display)" }}>POS</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-display)" }}>ENERGY %</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-display)" }}>GAP AHEAD</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-display)" }}>TYRE WEAR</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-display)" }}>ACTION</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-display)" }}>OVERTAKE PROB</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td className="font-mono" style={{ padding: "6px 12px" }}>#{entry.lap}</td>
                    <td className="font-display" style={{ padding: "6px 12px", fontWeight: 700 }}>P{entry.state.track_position}</td>
                    <td className="font-mono" style={{ padding: "6px 12px" }}>{entry.state.energy_pct.toFixed(1)}%</td>
                    <td className="font-mono" style={{ padding: "6px 12px" }}>+{entry.state.gap_ahead_sec.toFixed(2)}s</td>
                    <td className="font-mono" style={{ padding: "6px 12px" }}>{entry.state.tyre_wear_pct.toFixed(0)}%</td>
                    <td className="font-display" style={{ padding: "6px 12px", fontWeight: 700, color: entry.strategy?.raw_agent_outputs?.energy?.recommended_action === "deploy" ? "var(--green-compliant)" : entry.strategy?.raw_agent_outputs?.energy?.recommended_action === "conserve" ? "var(--yellow-caution)" : "#fff" }}>
                      {entry.strategy?.raw_agent_outputs?.energy?.recommended_action?.toUpperCase()}
                    </td>
                    <td className="font-mono" style={{ padding: "6px 12px" }}>{entry.strategy?.overtake_probability_pct?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
