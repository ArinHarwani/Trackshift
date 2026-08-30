import React, { useState } from "react";
import { Battery, Crosshair, ShieldAlert, UserCheck, ChevronDown, ChevronUp, Cpu, ArrowRight } from "lucide-react";

export default function AgentInspector({ rawOutputs }) {
  const [expandedAgent, setExpandedAgent] = useState("all");

  if (!rawOutputs) return null;

  const { energy, overtake, rules, opponent } = rawOutputs;

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "20px" }}>
      {/* Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
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
            <Cpu size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
              Multi-Agent Reasoning Pipeline <span style={{ color: "var(--neon-green)", fontSize: "0.8rem" }}>// INSPECTOR</span>
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Inspect deterministic sub-agent computations, formulas, and confidence scores
            </p>
          </div>
        </div>

        {/* Pipeline Architecture Mini Flow */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.4)", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "0.7rem" }}>
          <span style={{ color: "var(--neon-cyan)", fontWeight: 700 }}>4 Agents</span>
          <ArrowRight size={12} color="var(--text-dim)" />
          <span style={{ color: "var(--neon-amber)", fontWeight: 700 }}>Math Core</span>
          <ArrowRight size={12} color="var(--text-dim)" />
          <span style={{ color: "var(--neon-green)", fontWeight: 700 }}>Composite Score</span>
          <ArrowRight size={12} color="var(--text-dim)" />
          <span style={{ color: "var(--neon-purple)", fontWeight: 700 }}>Gemini Synthesis</span>
        </div>
      </div>

      {/* 4 Agent Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "14px" }}>
        {/* 1. Energy Agent */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(0, 240, 255, 0.2)",
          borderRadius: "10px",
          padding: "16px",
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Battery size={16} color="var(--neon-cyan)" />
              <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--neon-cyan)" }}>
                Energy Agent
              </span>
            </div>
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "2px 6px",
              borderRadius: "4px",
              background: energy?.recommended_action === "deploy" ? "rgba(0,255,136,0.15)" : "rgba(255,184,0,0.15)",
              color: energy?.recommended_action === "deploy" ? "var(--neon-green)" : "var(--neon-amber)",
              textTransform: "uppercase",
            }}>
              {energy?.recommended_action}
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", spaceY: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Target kWh / Lap:</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{energy?.rationale_data?.target_kwh_per_lap?.toFixed(2)} kWh</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Nominal Baseline:</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{energy?.rationale_data?.nominal_kwh_per_lap?.toFixed(2)} kWh</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Energy Margin:</span>
              <strong className="font-mono" style={{ color: energy?.rationale_data?.energy_margin_pct >= 0 ? "var(--neon-green)" : "var(--neon-red)" }}>
                {energy?.rationale_data?.energy_margin_pct > 0 ? "+" : ""}{energy?.rationale_data?.energy_margin_pct?.toFixed(1)}%
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Reserve Laps:</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{energy?.laps_of_reserve_at_current_rate} laps</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shortfall Risk:</span>
              <strong style={{
                color: energy?.risk_of_energy_shortfall === "low" ? "var(--neon-green)" : energy?.risk_of_energy_shortfall === "medium" ? "var(--neon-amber)" : "var(--neon-red)",
                textTransform: "uppercase",
              }}>
                {energy?.risk_of_energy_shortfall}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", lineHeight: "1.3" }}>
            Formula: Target = E_usable / Laps_rem. Margin = (Target - Nominal) / Nominal.
          </p>
        </div>

        {/* 2. Overtake Agent */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(0, 255, 136, 0.2)",
          borderRadius: "10px",
          padding: "16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Crosshair size={16} color="var(--neon-green)" />
              <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--neon-green)" }}>
                Overtake Agent
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--neon-green)" }}>
              {overtake?.success_probability_pct?.toFixed(0)}%
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Base Prob (Gap):</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{overtake?.rationale_data?.base_probability_pct}%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>DRS Zone Assist:</span>
              <strong style={{ color: overtake?.rationale_data?.drs_assist ? "var(--neon-green)" : "var(--text-dim)" }}>
                {overtake?.rationale_data?.drs_assist ? "+18.0% (ACTIVE)" : "INACTIVE"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Attack Mode Boost:</span>
              <strong style={{ color: overtake?.rationale_data?.attack_mode_boost ? "var(--neon-purple)" : "var(--text-dim)" }}>
                {overtake?.rationale_data?.attack_mode_boost ? "+16.0% (ACTIVE)" : "OFF"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Tyre Grip Delta:</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{overtake?.rationale_data?.tyre_delta_advantage_pct > 0 ? "+" : ""}{overtake?.rationale_data?.tyre_delta_advantage_pct}%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Execution Window:</span>
              <strong style={{ color: "var(--neon-cyan)", textTransform: "uppercase" }}>{overtake?.best_window?.replace(/_/g, " ")}</strong>
            </div>
          </div>

          <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", lineHeight: "1.3" }}>
            Formula: P_base = 86 * exp(-0.92 * gap) + DRS_mod + Attack_mod + Tyre_mod.
          </p>
        </div>

        {/* 3. Rules Agent */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${rules?.compliant ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 51, 102, 0.4)"}`,
          borderRadius: "10px",
          padding: "16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldAlert size={16} color={rules?.compliant ? "var(--f1-gold)" : "var(--neon-red)"} />
              <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: rules?.compliant ? "var(--f1-gold)" : "var(--neon-red)" }}>
                Rules Agent
              </span>
            </div>
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "2px 6px",
              borderRadius: "4px",
              background: rules?.compliant ? "rgba(0,255,136,0.15)" : "rgba(255,51,102,0.25)",
              color: rules?.compliant ? "var(--neon-green)" : "var(--neon-red)",
            }}>
              {rules?.compliant ? "COMPLIANT" : "VIOLATION"}
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Per-Lap Limit (Art 34.2):</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{rules?.per_lap_limit_kwh?.toFixed(1)} kWh</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Total Usable Left:</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{rules?.energy_budget_remaining_kwh?.toFixed(1)} kWh</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Max Safe Deploy:</span>
              <strong className="font-mono" style={{ color: "var(--neon-green)" }}>{rules?.max_safe_deploy_this_lap_kwh?.toFixed(2)} kWh</strong>
            </div>
            <div style={{ marginTop: "6px" }}>
              {rules?.violations && rules.violations.length > 0 ? (
                <div style={{ fontSize: "0.68rem", color: "var(--neon-red)", background: "rgba(255,51,102,0.1)", padding: "4px 6px", borderRadius: "4px" }}>
                  {rules.violations[0].slice(0, 70)}...
                </div>
              ) : (
                <div style={{ fontSize: "0.68rem", color: "var(--neon-green)" }}>
                  ✓ Zero technical regulations breaches
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", lineHeight: "1.3" }}>
            Enforces Formula E / FIA sporting regulations on single-lap draw and allocations.
          </p>
        </div>

        {/* 4. Opponent Profiling Agent */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(181, 95, 230, 0.2)",
          borderRadius: "10px",
          padding: "16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserCheck size={16} color="var(--neon-purple)" />
              <span className="font-display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--neon-purple)" }}>
                Opponent Agent
              </span>
            </div>
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "2px 6px",
              borderRadius: "4px",
              background: "rgba(181,95,230,0.2)",
              color: "#ff80ff",
              textTransform: "uppercase",
            }}>
              {opponent?.opponent_profile}
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Profile Confidence:</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{opponent?.profile_confidence_pct}%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Sampled Laps:</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{opponent?.based_on_laps} Laps</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Gap Variance (σ²):</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{opponent?.signals?.avg_gap_variance}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Defended Laps (&lt;0.8s):</span>
              <strong className="font-mono" style={{ color: "#fff" }}>{opponent?.signals?.defended_position_last_n_laps}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Braking Consistency:</span>
              <strong className="font-mono" style={{ color: "var(--neon-cyan)" }}>{opponent?.signals?.braking_consistency_score}</strong>
            </div>
          </div>

          <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", lineHeight: "1.3" }}>
            Rule-based statistical classification over rolling gap variance (No fake ML).
          </p>
        </div>
      </div>
    </div>
  );
}
