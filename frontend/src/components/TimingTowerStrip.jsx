import React from "react";
import F1Lights from "./F1Lights";
import { Zap, ShieldCheck, Flag } from "lucide-react";

/**
 * Dense Persistent F1 Timing Tower Strip
 * Mirrors real F1 / Formula E broadcast telemetry lower-third ribbon.
 */
export default function TimingTowerStrip({ raceState, isCalculating }) {
  if (!raceState) return null;

  const totalLaps = raceState.lap_number + raceState.laps_remaining;
  const usableKwhLeft = Math.max(0, raceState.total_energy_budget_kwh - raceState.total_energy_used_kwh);
  const isHealthySoc = raceState.energy_pct >= 25.0;

  return (
    <div className="timing-tower-strip">
      {/* Left: Position & Lap */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Track Position */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            className="font-display"
            style={{
              background: "#F2F4F7",
              color: "#0A0C0F",
              fontWeight: 900,
              fontSize: "0.75rem",
              padding: "1px 6px",
              borderRadius: "2px",
            }}
          >
            P{raceState.track_position}
          </span>
          <span className="font-display" style={{ fontWeight: 700, color: "#F2F4F7", fontSize: "0.8rem" }}>
            CAR 55
          </span>
        </div>

        {/* Lap Counter */}
        <div className="timing-cell">
          <span className="timing-cell-label">LAP</span>
          <span className="timing-cell-val font-mono">
            {raceState.lap_number}/{totalLaps}
          </span>
        </div>

        {/* Gap Ahead */}
        <div className="timing-cell">
          <span className="timing-cell-label">INTERVAL AHEAD ({raceState.rival_driver_name?.split(" ")[0] || "LEADER"})</span>
          <span
            className="timing-cell-val font-mono"
            style={{ color: raceState.gap_ahead_sec <= 1.0 ? "var(--green-compliant)" : "#F2F4F7" }}
          >
            +{raceState.gap_ahead_sec.toFixed(2)}s
          </span>
        </div>

        {/* Gap Behind */}
        <div className="timing-cell">
          <span className="timing-cell-label">GAP BEHIND</span>
          <span className="timing-cell-val font-mono">
            +{raceState.gap_behind_sec.toFixed(2)}s
          </span>
        </div>

        {/* DRS / Attack Mode Zone Indicator */}
        <div className="timing-cell">
          <span className="timing-cell-label">TACTICAL ZONE</span>
          {raceState.in_attack_mode_zone ? (
            <span
              className="font-display"
              style={{
                fontSize: "0.68rem",
                fontWeight: 900,
                color: "#fff",
                background: "var(--purple-optimal)",
                padding: "1px 5px",
                borderRadius: "2px",
              }}
            >
              ATTACK MODE ACTIVE
            </span>
          ) : raceState.drs_zone_ahead_m <= 150 ? (
            <span
              className="font-display"
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#0A0C0F",
                background: "var(--green-compliant)",
                padding: "1px 5px",
                borderRadius: "2px",
              }}
            >
              DRS READY ({raceState.drs_zone_ahead_m}m)
            </span>
          ) : (
            <span className="timing-cell-val font-mono" style={{ color: "var(--text-dim)" }}>
              DRS in {raceState.drs_zone_ahead_m}m
            </span>
          )}
        </div>
      </div>

      {/* Right: Energy SoC & FIA Budget & 5 Red Lights */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Battery SoC */}
        <div className="timing-cell">
          <span className="timing-cell-label">BATTERY SOC</span>
          <span
            className="timing-cell-val font-mono"
            style={{
              color: isHealthySoc ? "var(--green-compliant)" : "var(--red-violation)",
            }}
          >
            {raceState.energy_pct.toFixed(1)}%
          </span>
        </div>

        {/* FIA Usable kWh Left */}
        <div className="timing-cell">
          <span className="timing-cell-label">FIA USABLE</span>
          <span className="timing-cell-val font-mono" style={{ color: "#F2F4F7" }}>
            {usableKwhLeft.toFixed(1)} kWh
          </span>
        </div>

        {/* 5 Red Lights Calculation Indicator */}
        <F1Lights isCalculating={isCalculating} />
      </div>
    </div>
  );
}
