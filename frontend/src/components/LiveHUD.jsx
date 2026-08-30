import React from "react";
import { BatteryCharging, Disc, Navigation, Gauge, ShieldAlert, Zap, Radio } from "lucide-react";

export default function LiveHUD({ state, energyAgentOut, overtakeAgentOut }) {
  if (!state) return null;

  const energyPct = state.energy_pct || 0;
  const tyreWear = state.tyre_wear_pct || 0;
  const gapAhead = state.gap_ahead_sec || 0;
  const gapBehind = state.gap_behind_sec || 0;

  // Energy color
  const energyColor =
    energyPct < 15 ? "var(--neon-red)" : energyPct < 30 ? "var(--neon-amber)" : "var(--neon-cyan)";

  // Tyre color
  const tyreColor =
    tyreWear > 75 ? "var(--neon-red)" : tyreWear > 50 ? "var(--neon-amber)" : "var(--neon-green)";

  // Compound visual config
  const compoundStyles = {
    soft: { bg: "#ff3366", label: "S", name: "SOFT" },
    medium: { bg: "#ffb800", label: "M", name: "MEDIUM" },
    hard: { bg: "#f0f4f8", label: "H", name: "HARD", text: "#000" },
    intermediate: { bg: "#00ff88", label: "I", name: "INTER", text: "#000" },
    wet: { bg: "#0088ff", label: "W", name: "WET" },
  }[state.tyre_compound] || { bg: "#ffb800", label: "M", name: "MEDIUM" };

  // Circular gauge calculations (r=54, circumference = 2 * pi * 54 = 339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (energyPct / 100) * circumference;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", margin: "16px 0" }}>
      {/* 1. Battery / Energy Reserve Gauge */}
      <div className="glass-panel" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", width: "128px", height: "128px", flexShrink: 0 }}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            {/* Background circle track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Value stroke */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={energyColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease",
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                filter: `drop-shadow(0 0 8px ${energyColor})`,
              }}
            />
          </svg>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>
              {energyPct.toFixed(1)}%
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              ENERGY
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <BatteryCharging size={16} color={energyColor} />
            <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
              ERS Battery Reserve
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            Total Budget: <strong style={{ color: "#fff" }}>{state.total_energy_budget_kwh} kWh</strong>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Used: <strong style={{ color: "var(--neon-amber)" }}>{state.total_energy_used_kwh} kWh</strong>
          </p>
          {energyAgentOut && (
            <div style={{
              marginTop: "8px",
              padding: "4px 8px",
              borderRadius: "4px",
              background: energyAgentOut.recommended_action === "deploy" ? "rgba(0,255,136,0.12)" : "rgba(255,184,0,0.12)",
              border: `1px solid ${energyAgentOut.recommended_action === "deploy" ? "rgba(0,255,136,0.3)" : "rgba(255,184,0,0.3)"}`,
              fontSize: "0.7rem",
              fontWeight: 700,
              color: energyAgentOut.recommended_action === "deploy" ? "var(--neon-green)" : "var(--neon-amber)",
            }}>
              Margin: {energyAgentOut.rationale_data?.energy_margin_pct > 0 ? "+" : ""}{energyAgentOut.rationale_data?.energy_margin_pct?.toFixed(1)}% ({energyAgentOut.laps_of_reserve_at_current_rate} laps)
            </div>
          )}
        </div>
      </div>

      {/* 2. Gap to Rivals Radar */}
      <div className="glass-panel" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Navigation size={16} color="var(--neon-cyan)" />
              <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                Rival Track Deltas
              </span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
              P{state.track_position} POSITION
            </span>
          </div>

          {/* Gap Ahead */}
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 12px", borderRadius: "8px", marginBottom: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Ahead: <strong style={{ color: "#fff" }}>{state.rival_driver_name || "Leader"}</strong>
              </span>
              <span className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: gapAhead <= 0.8 ? "var(--neon-green)" : "#fff" }}>
                +{gapAhead.toFixed(2)}s
              </span>
            </div>
            {/* Proximity visual bar */}
            <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginTop: "6px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.max(5, Math.min(100, (1 - (gapAhead / 3.0)) * 100))}%`,
                background: gapAhead <= 0.6 ? "var(--neon-green)" : "var(--neon-cyan)",
                boxShadow: gapAhead <= 0.6 ? "0 0 8px var(--neon-green)" : "none",
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* Gap Behind */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              Behind (P{state.track_position + 1}):
            </span>
            <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 600, color: gapBehind <= 0.6 ? "var(--neon-red)" : "var(--text-muted)" }}>
              +{gapBehind.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* DRS indicator status */}
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <div className={state.gap_ahead_sec <= 1.0 && state.drs_zone_ahead_m <= 300 ? "drs-badge-active" : ""} style={{
            flex: 1,
            textAlign: "center",
            padding: "4px 0",
            borderRadius: "6px",
            fontSize: "0.7rem",
            fontWeight: 700,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border-subtle)",
            color: state.gap_ahead_sec <= 1.0 && state.drs_zone_ahead_m <= 300 ? "var(--neon-green)" : "var(--text-dim)",
          }}>
            DRS {state.gap_ahead_sec <= 1.0 && state.drs_zone_ahead_m <= 300 ? "ENABLED (<1.0s)" : `${state.drs_zone_ahead_m}m`}
          </div>

          <div className={state.in_attack_mode_zone ? "attack-badge-active" : ""} style={{
            flex: 1,
            textAlign: "center",
            padding: "4px 0",
            borderRadius: "6px",
            fontSize: "0.7rem",
            fontWeight: 700,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border-subtle)",
            color: state.in_attack_mode_zone ? "#ff80ff" : "var(--text-dim)",
          }}>
            {state.in_attack_mode_zone ? "ATTACK MODE ACTIVE" : "ATTACK ZONE READY"}
          </div>
        </div>
      </div>

      {/* 3. Tyre Condition & Compound Monitor */}
      <div className="glass-panel" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Disc size={16} color="var(--neon-amber)" />
              <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                Tyre Degradation
              </span>
            </div>
            {/* Compound Icon */}
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: compoundStyles.bg,
              color: compoundStyles.text || "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.75rem",
              boxShadow: `0 0 8px ${compoundStyles.bg}`,
            }}>
              {compoundStyles.label}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {compoundStyles.name} Compound Wear:
            </span>
            <span className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: tyreColor }}>
              {tyreWear.toFixed(1)}%
            </span>
          </div>

          {/* Thermal wear bar */}
          <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
            <div style={{
              height: "100%",
              width: `${tyreWear}%`,
              background: `linear-gradient(90deg, var(--neon-green), ${tyreColor})`,
              boxShadow: `0 0 10px ${tyreColor}`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
          <span>Lap {state.lap_number} of {state.lap_number + state.laps_remaining}</span>
          <span>{state.laps_remaining} Laps Remaining</span>
          <span style={{ color: "var(--neon-cyan)" }}>Sector {state.sector}</span>
        </div>
      </div>
    </div>
  );
}
