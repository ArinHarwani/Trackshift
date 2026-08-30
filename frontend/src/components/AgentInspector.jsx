import React, { useState } from "react";
import { ChevronDown, ChevronRight, Zap, Crosshair, ShieldCheck, ShieldAlert, UserCheck, Layers } from "lucide-react";

/**
 * Collapsible Multi-Agent Strategy Breakdown Accordion
 * Keeps the Hero Zone as the dominant visual focus while providing deep technical telemetry on demand.
 */
export default function AgentInspector({ rawAgentOutputs, scoringBreakdown, compositeScore }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!rawAgentOutputs) return null;

  const energy = rawAgentOutputs.energy;
  const overtake = rawAgentOutputs.overtake;
  const rules = rawAgentOutputs.rules;
  const opponent = rawAgentOutputs.opponent;

  return (
    <div className="pit-panel" style={{ marginTop: "16px" }}>
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          background: "var(--surface-panel-subtle)",
          border: "none",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          color: "var(--text-primary)",
          textAlign: "left",
          borderBottom: isOpen ? "1px solid var(--border-subtle)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isOpen ? <ChevronDown size={16} color="var(--purple-optimal)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
          <span className="font-display" style={{ fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.06em" }}>
            STRATEGY BREAKDOWN // MULTI-AGENT TELEMETRY PIPELINE
          </span>
        </div>

        {/* Mini Pill Summary */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.72rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Zap size={13} color="var(--green-compliant)" />
            <span className="font-mono">
              {energy?.recommended_deploy_pct > 0 ? "+" : ""}{energy?.recommended_deploy_pct}%
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Crosshair size={13} color="var(--green-compliant)" />
            <span className="font-mono">{overtake?.success_probability_pct?.toFixed(1)}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {rules?.compliant ? (
              <span style={{ color: "var(--green-compliant)", fontWeight: 700 }}>✓ COMPLIANT</span>
            ) : (
              <span style={{ color: "var(--red-violation)", fontWeight: 700 }}>⚠ BREACH</span>
            )}
          </div>
          <span style={{ color: "var(--text-dim)", fontSize: "0.68rem" }}>
            {isOpen ? "[CLICK TO COLLAPSE]" : "[CLICK TO INSPECT MATHEMATICAL PROOFS]"}
          </span>
        </div>
      </button>

      {/* Expanded Accordion Content */}
      {isOpen && (
        <div style={{ padding: "18px 20px" }}>
          {/* Sub-Agent 4-Column Technical Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "18px" }}>
            {/* 1. Energy Agent */}
            <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Zap size={14} color="var(--green-compliant)" />
                <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  ENERGY AGENT
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Target Rate:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{energy?.rationale_data?.target_kwh_per_lap?.toFixed(3)} kWh/lap</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Nominal Burn:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{energy?.rationale_data?.nominal_kwh_per_lap?.toFixed(3)} kWh/lap</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Delta Margin:</span>
                  <strong className="font-mono" style={{ color: "var(--green-compliant)" }}>
                    {energy?.rationale_data?.energy_margin_pct > 0 ? "+" : ""}{energy?.rationale_data?.energy_margin_pct?.toFixed(1)}%
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Reserve Headroom:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{energy?.laps_of_reserve_at_current_rate?.toFixed(1)} Laps</strong>
                </div>
              </div>
            </div>

            {/* 2. Overtake Agent */}
            <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Crosshair size={14} color="var(--green-compliant)" />
                <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  OVERTAKE AGENT
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Base Physics Prob:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{overtake?.rationale_data?.base_probability_pct?.toFixed(1)}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>DRS Boost Mod:</span>
                  <strong className="font-mono" style={{ color: overtake?.rationale_data?.drs_assist ? "var(--green-compliant)" : "var(--text-dim)" }}>
                    {overtake?.rationale_data?.drs_assist ? "+18.0%" : "INACTIVE"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Attack Mode Mod:</span>
                  <strong className="font-mono" style={{ color: overtake?.rationale_data?.attack_mode_boost ? "var(--purple-optimal)" : "var(--text-dim)" }}>
                    {overtake?.rationale_data?.attack_mode_boost ? "+16.0%" : "OFF"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tyre Grip Advantage:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>
                    {overtake?.rationale_data?.tyre_delta_advantage_pct > 0 ? "+" : ""}{overtake?.rationale_data?.tyre_delta_advantage_pct?.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. Rules Agent */}
            <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                {rules?.compliant ? <ShieldCheck size={14} color="var(--green-compliant)" /> : <ShieldAlert size={14} color="var(--red-violation)" />}
                <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  RULES COMPLIANCE
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Per-Lap Demo Limit:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{rules?.per_lap_limit_kwh?.toFixed(1)} kWh</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Allocation Remaining:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{rules?.energy_budget_remaining_kwh?.toFixed(1)} kWh</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Max Safe Single Draw:</span>
                  <strong className="font-mono" style={{ color: "var(--green-compliant)" }}>{rules?.max_safe_deploy_this_lap_kwh?.toFixed(2)} kWh</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Compliance Verdict:</span>
                  <strong style={{ color: rules?.compliant ? "var(--green-compliant)" : "var(--red-violation)" }}>
                    {rules?.compliant ? "100% CLEAR" : "BLOCKED"}
                  </strong>
                </div>
              </div>
            </div>

            {/* 4. Opponent Profiling */}
            <div style={{ background: "var(--surface-panel-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <UserCheck size={14} color="var(--purple-optimal)" />
                <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  OPPONENT BEHAVIOR
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Profile Classification:</span>
                  <strong className="font-display" style={{ color: "var(--purple-optimal)" }}>{opponent?.opponent_profile?.toUpperCase()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Profile Confidence:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{opponent?.profile_confidence_pct?.toFixed(1)}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Rolling Gap Variance:</span>
                  <strong className="font-mono" style={{ color: "#fff" }}>{opponent?.rationale_data?.gap_variance?.toFixed(4)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Exploit Window:</span>
                  <strong className="font-display" style={{ color: "var(--green-compliant)" }}>
                    {opponent?.vulnerability_window?.replace(/_/g, " ").toUpperCase()}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Composite Scoring Formula Breakdown */}
          {scoringBreakdown && (
            <div style={{ background: "#0A0C0F", border: "1px solid var(--border-subtle)", borderRadius: "3px", padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Layers size={13} color="var(--purple-optimal)" />
                <span className="font-display" style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                  COMPOSITE SCORING CALCULATION FORMULA
                </span>
                <span className="font-mono" style={{ fontSize: "0.72rem", color: "var(--purple-optimal)", marginLeft: "auto" }}>
                  FINAL SCORE = {compositeScore?.toFixed(2)}
                </span>
              </div>
              <p className="font-mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Score = (0.45 * {scoringBreakdown.overtake_contrib?.toFixed(3)}) + (0.25 * {scoringBreakdown.position_contrib?.toFixed(3)}) - (Risk Pen {scoringBreakdown.energy_risk_penalty?.toFixed(2)}) - (Rule Pen {scoringBreakdown.rules_violation_penalty?.toFixed(2)}) + (Opp Mod {scoringBreakdown.opponent_exploit_mod > 0 ? "+" : ""}{scoringBreakdown.opponent_exploit_mod?.toFixed(2)})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
