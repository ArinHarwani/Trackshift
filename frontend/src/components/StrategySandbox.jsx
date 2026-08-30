import React from "react";
import { Sliders, Sparkles, AlertCircle, RefreshCw, Zap, Shield, Target } from "lucide-react";

export default function StrategySandbox({
  state,
  onChangeState,
  presets,
  onSelectPreset,
  activePresetId,
  onReset,
}) {
  if (!state) return null;

  const handleSliderChange = (key, value) => {
    onChangeState({ ...state, [key]: value });
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "20px" }}>
      {/* Sandbox Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Sliders size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
              Strategy Sandbox <span style={{ color: "var(--neon-cyan)", fontSize: "0.8rem" }}>// LIVE RECOMPUTATION</span>
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Manipulate telemetry variables to stress-test deterministic agent responses in real time
            </p>
          </div>
        </div>

        <button onClick={onReset} className="btn-secondary" style={{ fontSize: "0.75rem" }}>
          <RefreshCw size={14} />
          Reset Baseline
        </button>
      </div>

      {/* Preset Tactical Scenarios (Killer Demo Feature) */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <Sparkles size={14} color="var(--neon-amber)" />
          <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--neon-amber)" }}>
            TACTICAL SCENARIO PRESETS FOR JUDGES
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
          {presets.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`btn-preset ${isActive ? "active" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background: isActive ? "var(--neon-cyan)" : "rgba(255,255,255,0.1)",
                    color: isActive ? "#000" : "var(--text-muted)",
                  }}>
                    {preset.badge}
                  </span>
                  {isActive && <span className="live-pulse" />}
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isActive ? "#fff" : "var(--text-main)", marginBottom: "2px" }}>
                  {preset.name}
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", lineHeight: "1.3" }}>
                  {preset.description.slice(0, 75)}...
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", background: "rgba(0,0,0,0.25)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
        {/* 1. Energy Reserve % */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
              ERS Battery Reserve %:
            </span>
            <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: state.energy_pct < 20 ? "var(--neon-red)" : "var(--neon-cyan)" }}>
              {state.energy_pct.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            step="0.5"
            value={state.energy_pct}
            onChange={(e) => handleSliderChange("energy_pct", parseFloat(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "3px" }}>
            <span>Critical (2%)</span>
            <span>Nominal (50%)</span>
            <span>Full (100%)</span>
          </div>
        </div>

        {/* 2. Gap Ahead (seconds) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Gap Ahead to Rival (s):
            </span>
            <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: state.gap_ahead_sec <= 0.6 ? "var(--neon-green)" : "#fff" }}>
              {state.gap_ahead_sec.toFixed(2)}s
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="4.00"
            step="0.05"
            value={state.gap_ahead_sec}
            onChange={(e) => handleSliderChange("gap_ahead_sec", parseFloat(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "3px" }}>
            <span>Overtake Range (0.1s)</span>
            <span>DRS Zone (1.0s)</span>
            <span>Clean Air (4.0s)</span>
          </div>
        </div>

        {/* 3. Laps Remaining */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Laps Remaining:
            </span>
            <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
              {state.laps_remaining} Laps
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="45"
            step="1"
            value={state.laps_remaining}
            onChange={(e) => handleSliderChange("laps_remaining", parseInt(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "3px" }}>
            <span>Final Lap (1)</span>
            <span>Mid Race (20)</span>
            <span>Race Start (45)</span>
          </div>
        </div>

        {/* 4. Tyre Wear % */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Tyre Wear Degradation %:
            </span>
            <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: state.tyre_wear_pct > 70 ? "var(--neon-red)" : "var(--neon-amber)" }}>
              {state.tyre_wear_pct.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={state.tyre_wear_pct}
            onChange={(e) => handleSliderChange("tyre_wear_pct", parseFloat(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "3px" }}>
            <span>Fresh (0%)</span>
            <span>Working (50%)</span>
            <span>Cliff (100%)</span>
          </div>
        </div>

        {/* 5. DRS Proximity Slider */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
              DRS Detection Proximity (m):
            </span>
            <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: state.drs_zone_ahead_m <= 250 ? "var(--neon-green)" : "#fff" }}>
              {state.drs_zone_ahead_m}m
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="800"
            step="25"
            value={state.drs_zone_ahead_m}
            onChange={(e) => handleSliderChange("drs_zone_ahead_m", parseInt(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "3px" }}>
            <span>Zone Entry (50m)</span>
            <span>Detection (300m)</span>
            <span>Distant (800m)</span>
          </div>
        </div>

        {/* 6. Per-Lap Energy Consumed So Far (For Rule Limit Testing) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Current Lap Energy Draw (kWh):
            </span>
            <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: state.energy_used_this_lap_kwh > 3.2 ? "var(--neon-red)" : "#fff" }}>
              {state.energy_used_this_lap_kwh.toFixed(2)} / {state.max_energy_per_lap_kwh.toFixed(1)} kWh
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="4.5"
            step="0.05"
            value={state.energy_used_this_lap_kwh}
            onChange={(e) => handleSliderChange("energy_used_this_lap_kwh", parseFloat(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "3px" }}>
            <span>0.0 kWh</span>
            <span>2.0 kWh</span>
            <span style={{ color: "var(--neon-red)" }}>4.5 kWh (Breach)</span>
          </div>
        </div>
      </div>

      {/* Discrete Toggles & Selectors */}
      <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
        {/* Attack Mode Zone Active Toggle */}
        <button
          onClick={() => handleSliderChange("in_attack_mode_zone", !state.in_attack_mode_zone)}
          className={`btn-secondary ${state.in_attack_mode_zone ? "attack-badge-active" : ""}`}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            background: state.in_attack_mode_zone ? "rgba(181, 95, 230, 0.25)" : "rgba(255,255,255,0.05)",
            borderColor: state.in_attack_mode_zone ? "var(--neon-purple)" : "var(--border-subtle)",
            color: state.in_attack_mode_zone ? "#fff" : "var(--text-muted)",
          }}
        >
          <Zap size={15} color={state.in_attack_mode_zone ? "var(--neon-purple)" : "var(--text-dim)"} />
          Attack Mode Zone: <strong>{state.in_attack_mode_zone ? "ACTIVE (GEN3 BOOST)" : "OFF"}</strong>
        </button>

        {/* Tyre Compound Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "4px" }}>Compound:</span>
          {["soft", "medium", "hard"].map((comp) => (
            <button
              key={comp}
              onClick={() => handleSliderChange("tyre_compound", comp)}
              style={{
                background: state.tyre_compound === comp ? (comp === "soft" ? "#ff3366" : comp === "medium" ? "#ffb800" : "#fff") : "transparent",
                color: state.tyre_compound === comp ? "#000" : "var(--text-muted)",
                border: "none",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {comp}
            </button>
          ))}
        </div>

        {/* Sector Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "4px" }}>Sector:</span>
          {[1, 2, 3].map((sec) => (
            <button
              key={sec}
              onClick={() => handleSliderChange("sector", sec)}
              style={{
                background: state.sector === sec ? "var(--neon-cyan)" : "transparent",
                color: state.sector === sec ? "#000" : "var(--text-muted)",
                border: "none",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              S{sec}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
