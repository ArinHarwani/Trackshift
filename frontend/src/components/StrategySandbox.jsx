import React from "react";
import { Sliders, RotateCcw, Zap, Flag, Shield, Crosshair } from "lucide-react";
import OvertakeVisualizer from "./OvertakeVisualizer";

/**
 * Strategy Sandbox — Interactive Pit-Wall Telemetry Manipulator
 * Disciplined, technical controls for live stress-testing of deterministic agent responses.
 */
export default function StrategySandbox({
  state,
  strategyOutput,
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
    <div className="pit-panel" style={{ marginBottom: "20px" }}>
      {/* Header */}
      <div className="pit-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sliders size={16} color="var(--purple-optimal)" />
          <span className="font-display" style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-primary)" }}>
            STRATEGY SANDBOX // TELEMETRY MANIPULATOR
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            (LIVE 50ms DETERMINISTIC RECOMPUTATION)
          </span>
        </div>

        <button onClick={onReset} className="btn-f1" title="Reset all telemetry to nominal baseline">
          <RotateCcw size={13} />
          Reset Baseline
        </button>
      </div>

      <div className="pit-panel-body">
        {/* Tactical Scenario Presets Row */}
        <div style={{ marginBottom: "18px" }}>
          <div className="chevron-divider">TACTICAL SCENARIOS</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  style={{
                    background: isActive ? "var(--surface-panel-hover)" : "var(--surface-panel-subtle)",
                    border: `1px solid ${isActive ? "var(--purple-optimal)" : "var(--border-subtle)"}`,
                    borderRadius: "3px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span
                      className="font-display"
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        padding: "1px 5px",
                        borderRadius: "2px",
                        background: isActive ? "var(--purple-optimal)" : "rgba(255,255,255,0.06)",
                        color: isActive ? "#fff" : "var(--text-secondary)",
                      }}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: isActive ? "#fff" : "var(--text-primary)", marginBottom: "2px" }}>
                    {preset.name}
                  </div>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", lineHeight: "1.3" }}>
                    {preset.description.slice(0, 60)}...
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Overtake Visualizer & Engine Thermal Stress Gauge */}
        <OvertakeVisualizer
          state={state}
          strategyOutput={strategyOutput}
          onChangeState={onChangeState}
        />

        {/* Sliders Grid */}
        <div className="chevron-divider">TELEMETRY VARIABLES</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            background: "var(--surface-panel-subtle)",
            padding: "16px",
            borderRadius: "3px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* 1. ERS Battery Reserve % */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                ERS Battery SoC %:
              </span>
              <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: state.energy_pct < 20 ? "var(--red-violation)" : "var(--text-primary)" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)" }}>
              <span>2% (Critical)</span>
              <span>50% (Nominal)</span>
              <span>100% (Full)</span>
            </div>
          </div>

          {/* 2. Gap Ahead (s) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                Interval to Rival Ahead (s):
              </span>
              <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: state.gap_ahead_sec <= 0.6 ? "var(--green-compliant)" : "var(--text-primary)" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)" }}>
              <span>0.10s (Attack)</span>
              <span>1.00s (DRS)</span>
              <span>4.00s (Clean)</span>
            </div>
          </div>

          {/* 3. Laps Remaining */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                Laps Remaining:
              </span>
              <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)" }}>
              <span>1 (Last Lap)</span>
              <span>20 (Mid Stint)</span>
              <span>45 (Start)</span>
            </div>
          </div>

          {/* 4. Tyre Wear % */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                Tyre Wear %:
              </span>
              <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: state.tyre_wear_pct > 70 ? "var(--red-violation)" : state.tyre_wear_pct > 40 ? "var(--yellow-caution)" : "var(--text-primary)" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)" }}>
              <span>0% (New)</span>
              <span>50% (Worn)</span>
              <span>100% (Cliff)</span>
            </div>
          </div>

          {/* 5. DRS Detection Zone (m) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                DRS Detection Zone (m):
              </span>
              <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: state.drs_zone_ahead_m <= 150 ? "var(--green-compliant)" : "var(--text-primary)" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)" }}>
              <span>50m (Active)</span>
              <span>300m (Approaching)</span>
              <span>800m (Distant)</span>
            </div>
          </div>

          {/* 6. Current Lap Energy Consumption (kWh) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                Single-Lap Energy Draw (kWh):
              </span>
              <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: state.energy_used_this_lap_kwh > 3.2 ? "var(--red-violation)" : "var(--text-primary)" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)" }}>
              <span>0.0 kWh</span>
              <span>2.0 kWh</span>
              <span style={{ color: "var(--red-violation)" }}>4.5 kWh (Breach)</span>
            </div>
          </div>
        </div>

        {/* Tactical Toggles */}
        <div style={{ display: "flex", gap: "12px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Attack Mode Toggle */}
          <button
            onClick={() => handleSliderChange("in_attack_mode_zone", !state.in_attack_mode_zone)}
            className={`btn-f1 ${state.in_attack_mode_zone ? "btn-f1-purple" : ""}`}
          >
            <Zap size={13} />
            Attack Mode Zone: {state.in_attack_mode_zone ? "ACTIVE (+50kW)" : "OFF"}
          </button>

          {/* Tyre Compound Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              COMPOUND:
            </span>
            {["soft", "medium", "hard"].map((comp) => {
              const isSelected = state.tyre_compound === comp;
              return (
                <button
                  key={comp}
                  onClick={() => handleSliderChange("tyre_compound", comp)}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "2px",
                    border: `1px solid ${isSelected ? "#fff" : "var(--border-subtle)"}`,
                    background: isSelected ? "var(--surface-panel-hover)" : "transparent",
                    color: comp === "soft" ? "#FF3B3B" : comp === "medium" ? "#FFC93C" : "#F2F4F7",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {comp}
                </button>
              );
            })}
          </div>

          {/* Rival Driver Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
            <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              RIVAL:
            </span>
            <select
              value={state.rival_driver_name}
              onChange={(e) => handleSliderChange("rival_driver_name", e.target.value)}
              style={{
                background: "var(--surface-panel-subtle)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: "2px",
                outline: "none",
              }}
            >
              <option value="Max Verstappen">Max Verstappen (Defensive)</option>
              <option value="Max Verstappen (P1)">Max Verstappen P1 (Defensive)</option>
              <option value="Lando Norris">Lando Norris (Aggressive)</option>
              <option value="Charles Leclerc">Charles Leclerc (Balanced)</option>
              <option value="Lewis Hamilton">Lewis Hamilton (Adaptive)</option>
              <option value="George Russell">George Russell (Aggressive)</option>
              <option value="Mitch Evans (P2)">Mitch Evans (Formula E)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
