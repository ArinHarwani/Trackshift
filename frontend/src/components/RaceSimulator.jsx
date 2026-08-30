import React, { useState, useEffect } from "react";
import { Play, Pause, SkipForward, RotateCcw, Activity, Gauge, TrendingDown, Flag } from "lucide-react";

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

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "20px" }}>
      {/* Header and Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, var(--neon-green), var(--neon-cyan))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Activity size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
              Live Telemetry Simulation Engine <span style={{ color: "var(--neon-green)", fontSize: "0.8rem" }}>// 50-LAP RACE</span>
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Step or auto-play through realistic multi-lap telemetry with live strategy recalculation
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary"
            style={{
              background: isPlaying ? "var(--neon-amber)" : "var(--neon-green)",
              color: "#000",
              borderColor: isPlaying ? "var(--neon-amber)" : "var(--neon-green)",
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? "Pause Sim" : "Auto Play"}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onStep();
            }}
            className="btn-secondary"
            title="Step 1 Lap"
          >
            <SkipForward size={15} />
            Step Lap (+1)
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            className="btn-secondary"
            title="Reset Simulation"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          {/* Speed selectors */}
          <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: "6px", padding: "2px", border: "1px solid var(--border-subtle)", marginLeft: "6px" }}>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                style={{
                  background: speedMultiplier === spd ? "var(--neon-cyan)" : "transparent",
                  color: speedMultiplier === spd ? "#000" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Telemetry Status Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Current Lap</span>
          <div className="font-mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>
            {simState.lap_number} <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>/ {simState.lap_number + simState.laps_remaining}</span>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Position</span>
          <div className="font-mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--neon-cyan)" }}>
            P{simState.track_position}
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Energy Reserve</span>
          <div className="font-mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: simState.energy_pct < 20 ? "var(--neon-red)" : "var(--neon-cyan)" }}>
            {simState.energy_pct.toFixed(1)}%
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Gap Ahead</span>
          <div className="font-mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: simState.gap_ahead_sec <= 0.6 ? "var(--neon-green)" : "#fff" }}>
            +{simState.gap_ahead_sec.toFixed(2)}s
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Tyre Degradation</span>
          <div className="font-mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--neon-amber)" }}>
            {simState.tyre_wear_pct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Visual Energy & Gap Progress Bars across Laps */}
      <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
          <span>Race Lap Progress</span>
          <span style={{ color: "var(--neon-cyan)" }}>{((simState.lap_number / (simState.lap_number + simState.laps_remaining)) * 100).toFixed(0)}% Completed</span>
        </div>
        <div style={{ height: "10px", background: "rgba(255,255,255,0.06)", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${(simState.lap_number / (simState.lap_number + simState.laps_remaining)) * 100}%`,
            background: "linear-gradient(90deg, var(--neon-cyan), var(--neon-green))",
            boxShadow: "0 0 10px var(--neon-green)",
            transition: "width 0.25s ease",
          }} />
        </div>
      </div>

      {/* History Log Table */}
      {history.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h4 className="font-display" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            Telemetry History (Last {Math.min(6, history.length)} Laps)
          </h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-dim)", textAlign: "left" }}>
                  <th style={{ padding: "6px 8px" }}>LAP</th>
                  <th style={{ padding: "6px 8px" }}>POS</th>
                  <th style={{ padding: "6px 8px" }}>ENERGY %</th>
                  <th style={{ padding: "6px 8px" }}>GAP AHEAD</th>
                  <th style={{ padding: "6px 8px" }}>TYRE WEAR</th>
                  <th style={{ padding: "6px 8px" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-6).reverse().map((h, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td className="font-mono" style={{ padding: "6px 8px", color: "#fff" }}>Lap {h.lap_number}</td>
                    <td className="font-mono" style={{ padding: "6px 8px", color: "var(--neon-cyan)" }}>P{h.track_position}</td>
                    <td className="font-mono" style={{ padding: "6px 8px", color: h.energy_pct < 20 ? "var(--neon-red)" : "#fff" }}>{h.energy_pct}%</td>
                    <td className="font-mono" style={{ padding: "6px 8px", color: h.gap_ahead_sec <= 0.6 ? "var(--neon-green)" : "#fff" }}>+{h.gap_ahead_sec}s</td>
                    <td className="font-mono" style={{ padding: "6px 8px", color: "var(--neon-amber)" }}>{h.tyre_wear_pct}%</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span style={{
                        fontSize: "0.65rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: h.in_attack_mode_zone ? "rgba(181,95,230,0.2)" : "rgba(0,240,255,0.1)",
                        color: h.in_attack_mode_zone ? "var(--neon-purple)" : "var(--neon-cyan)",
                        fontWeight: 700,
                      }}>
                        {h.in_attack_mode_zone ? "ATTACK MODE" : "HYBRID PACE"}
                      </span>
                    </td>
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
