import React, { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import pitRadio from "../utils/audioSynth";

export default function SimpleCockpit({
  raceState,
  strategyOutput,
  onSwitchToExpert,
  presets = [],
  activePresetId,
  onSelectPreset,
  visitorName,
}) {
  // Animation state for "Run It"
  const [runState, setRunState] = useState("idle"); // "idle" | "running" | "completed"
  const [runProgress, setRunProgress] = useState(0); // 0 to 100
  const [showTooltip, setShowTooltip] = useState(false);

  // Verdict logic
  const isAttackRecommended =
    strategyOutput?.raw_agent_outputs?.overtake?.overtake_recommended &&
    strategyOutput?.rule_compliance === "verified";

  const isRuleBreached = strategyOutput?.rule_compliance === "breached";
  const isConserve =
    strategyOutput?.raw_agent_outputs?.energy?.recommended_action === "conserve";

  const isVerdictAttack = isAttackRecommended && !isRuleBreached && !isConserve;

  // AI Confidence percentage from composite score
  const confidencePct = Math.min(
    98,
    Math.max(45, Math.round(((strategyOutput?.composite_score ?? 0.5) + 0.3) * 75))
  );

  // Plain-language 1-sentence reason (no jargon, no kWh, no FIA citations)
  const getPlainReason = () => {
    if (isRuleBreached) {
      return "Power draw would exceed technical limits — hold position to avoid a penalty.";
    }
    if (isConserve || (raceState?.energy_pct ?? 50) < 18) {
      return "Battery power is too low to sustain a pass — saving power now protects you from losing positions later.";
    }
    if (isVerdictAttack) {
      if ((raceState?.gap_ahead_sec ?? 1.0) <= 0.4) {
        return "The gap is closing fast and there is enough power in reserve to make the move.";
      }
      return "Strong power reserve and optimal tyre grip make this the highest-probability moment to pass.";
    }
    if ((raceState?.gap_ahead_sec ?? 1.0) > 1.2) {
      return "The car ahead is too far to pass cleanly without burning through critical power reserve.";
    }
    return "Maintain rhythm and stay in the slipstream until the car ahead begins to struggle.";
  };

  // Reset animation when state changes
  useEffect(() => {
    setRunState("idle");
    setRunProgress(0);
  }, [activePresetId, raceState]);

  // "Run It" animation loop
  const handleRunIt = () => {
    if (runState === "running") return;
    setRunState("running");
    setRunProgress(0);

    try {
      pitRadio.playRadioBeep();
    } catch (e) {}

    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      if (current >= 100) {
        clearInterval(interval);
        setRunProgress(100);
        setRunState("completed");
        try {
          pitRadio.playRadioBeep();
        } catch (e) {}
      } else {
        setRunProgress(current);
      }
    }, 50); // ~1.25 seconds smooth run
  };

  const handleResetRun = () => {
    setRunState("idle");
    setRunProgress(0);
  };

  // Car positions on track strip (0% to 100%)
  const rivalDriver = raceState?.rival_driver_name || "Max Verstappen";
  const gapSec = raceState?.gap_ahead_sec ? raceState.gap_ahead_sec.toFixed(2) : "0.38";
  const powerReservePct = raceState?.energy_pct ? Math.round(raceState.energy_pct) : 32;

  // Track position calculations:
  // Rival starts around 65% across the track strip
  // Player car starts behind based on gap (e.g. 25% to 45%)
  const basePlayerX = Math.max(15, 62 - Math.min(40, (raceState?.gap_ahead_sec ?? 0.5) * 25));
  let animatedPlayerX = basePlayerX;
  let animatedPlayerY = 0; // vertical lane offset

  if (runState === "running" || runState === "completed") {
    if (isVerdictAttack) {
      // Moves from basePlayerX to 78% (passing rival at 62%)
      const travel = (78 - basePlayerX) * (runProgress / 100);
      animatedPlayerX = basePlayerX + travel;
      // Lane shift to inside during pass
      if (runProgress > 30 && runProgress < 85) {
        animatedPlayerY = -24;
      }
    } else {
      // Tries to surge but drops back
      const surge = 12 * Math.sin((runProgress / 100) * Math.PI);
      animatedPlayerX = basePlayerX + surge - (runProgress > 70 ? 6 : 0);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. Header Bar: Mode & Greeting + Expert Switch */}
      <div
        style={{
          background: "var(--surface-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "6px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            className="font-display"
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              background: "rgba(192, 76, 253, 0.12)",
              color: "var(--purple-optimal)",
              border: "1px solid rgba(192, 76, 253, 0.3)",
              padding: "3px 10px",
              borderRadius: "3px",
              letterSpacing: "0.06em",
            }}
          >
            SIMPLE VIEW
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Welcome, <strong style={{ color: "var(--text-primary)" }}>{visitorName || "Driver"}</strong>. Testing live decision moments.
          </span>
        </div>

        {/* Expert Mode Toggle */}
        <button
          onClick={onSwitchToExpert}
          className="font-display"
          style={{
            background: "transparent",
            color: "var(--purple-optimal)",
            border: "1px solid var(--purple-optimal)",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "0.78rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            letterSpacing: "0.05em",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--purple-optimal)";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--purple-optimal)";
          }}
        >
          <Sliders size={14} />
          <span>SHOW FULL TELEMETRY (EXPERT MODE)</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 2. Tactical Scenarios Selector (Intuitive 1-click test moments) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            className="font-display"
            style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 800, letterSpacing: "0.08em" }}
          >
            SELECT A RACE SCENARIO TO TEST:
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
            Click any scenario to watch the AI re-evaluate
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "10px",
          }}
        >
          {presets.slice(0, 4).map((p, idx) => {
            const isSelected = activePresetId === p.id;
            const labels = [
              { icon: "🚀", title: "Attack Window", desc: "0.35s behind // High battery" },
              { icon: "⚠️", title: "Power Crisis", desc: "1.45s behind // Low battery" },
              { icon: "🛡️", title: "Defend Position", desc: "Chaser right behind" },
              { icon: "⚡", title: "Final Lap Shootout", desc: "Last lap // All-out dump" },
            ];
            const meta = labels[idx] || { icon: "🏁", title: p.name, desc: p.description };

            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset && onSelectPreset(p)}
                style={{
                  background: isSelected ? "var(--surface-panel-hover)" : "var(--surface-panel)",
                  border: isSelected ? "2px solid var(--purple-optimal)" : "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "12px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  position: "relative",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 0 14px rgba(192, 76, 253, 0.2)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "1rem" }}>{meta.icon}</span>
                  <span className="font-display" style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                    {meta.title}
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  {meta.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ONE HERO INTERACTION: The Race Track Strip */}
      <div
        style={{
          background: "var(--surface-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Track Title & Gap Readout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              className="font-display"
              style={{ fontSize: "0.88rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "0.04em" }}
            >
              LIVE TRACK POSITION // TURN 4 STRAIGHTAWAY
            </span>
          </div>

          <div
            style={{
              background: "#0A0C0F",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              padding: "4px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>GAP TO RIVAL:</span>
            <span className="font-mono" style={{ fontSize: "1rem", fontWeight: 900, color: "var(--purple-optimal)" }}>
              {gapSec}s BEHIND
            </span>
          </div>
        </div>

        {/* The Animated Asphalt Track Strip */}
        <div
          style={{
            height: "120px",
            background: "#0A0C0F",
            borderRadius: "6px",
            border: "1px solid var(--border-subtle)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Top & Bottom Kerbs */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "repeating-linear-gradient(90deg, #FF3B3B 0, #FF3B3B 20px, #FFFFFF 20px, #FFFFFF 40px)",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "repeating-linear-gradient(90deg, #FF3B3B 0, #FF3B3B 20px, #FFFFFF 20px, #FFFFFF 40px)",
              opacity: 0.8,
            }}
          />

          {/* Center Dashed Lane Divider */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "2px",
              transform: "translateY(-50%)",
              backgroundImage: "linear-gradient(90deg, #363E4D 60%, transparent 60%)",
              backgroundSize: "32px 2px",
              animation: runState === "running" ? "moveRoad 0.3s linear infinite" : "none",
            }}
          />

          {/* CAR 1: Rival Car Ahead (Red / Dark) */}
          <div
            style={{
              position: "absolute",
              left: "62%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 3,
              transition: "left 0.4s ease-out",
            }}
          >
            {/* Tag badge */}
            <span
              className="font-display"
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#FF8F8F",
                background: "rgba(255, 59, 59, 0.18)",
                border: "1px solid rgba(255, 59, 59, 0.4)",
                padding: "2px 6px",
                borderRadius: "2px",
                marginBottom: "4px",
                whiteSpace: "nowrap",
              }}
            >
              {rivalDriver} (Ahead)
            </span>

            {/* Stylized Formula Car Icon */}
            <div
              style={{
                width: "60px",
                height: "26px",
                background: "linear-gradient(90deg, #8A1A1A, #E03535)",
                borderRadius: "4px 12px 12px 4px",
                border: "1px solid #FF5A5A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(224, 53, 53, 0.5)",
                position: "relative",
              }}
            >
              {/* Cockpit */}
              <div
                style={{
                  width: "16px",
                  height: "12px",
                  background: "#15181D",
                  borderRadius: "2px",
                  border: "1px solid #888",
                }}
              />
              {/* Front wing indicator */}
              <div
                style={{
                  position: "absolute",
                  right: "-4px",
                  width: "4px",
                  height: "22px",
                  background: "#FFFFFF",
                  borderRadius: "1px",
                }}
              />
            </div>
          </div>

          {/* CAR 2: Your Car Behind (Purple / Cyan) */}
          <div
            style={{
              position: "absolute",
              left: `${animatedPlayerX}%`,
              top: `calc(50% + ${animatedPlayerY}px)`,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 4,
              transition:
                runState === "running"
                  ? "left 0.05s linear, top 0.2s ease"
                  : "left 0.5s ease-out, top 0.3s ease",
            }}
          >
            {/* Tag badge */}
            <span
              className="font-display"
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#FFFFFF",
                background: "var(--purple-optimal)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "2px 6px",
                borderRadius: "2px",
                marginBottom: "4px",
                whiteSpace: "nowrap",
                boxShadow: "0 0 10px rgba(192, 76, 253, 0.5)",
              }}
            >
              YOU (P4)
            </span>

            {/* Stylized Formula Car Icon */}
            <div
              style={{
                width: "60px",
                height: "26px",
                background: isVerdictAttack
                  ? "linear-gradient(90deg, #7C2BB8, #C04CFD)"
                  : "linear-gradient(90deg, #4A5568, #718096)",
                borderRadius: "4px 12px 12px 4px",
                border: "1px solid #E08FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isVerdictAttack
                  ? "0 0 16px rgba(192, 76, 253, 0.7)"
                  : "0 2px 8px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              {/* Cockpit */}
              <div
                style={{
                  width: "16px",
                  height: "12px",
                  background: "#0A0C0F",
                  borderRadius: "2px",
                  border: "1px solid #C04CFD",
                }}
              />
              {/* Boost flame effect when running */}
              {runState === "running" && isVerdictAttack && (
                <div
                  style={{
                    position: "absolute",
                    left: "-14px",
                    width: "14px",
                    height: "10px",
                    background: "linear-gradient(270deg, #00D8FF, transparent)",
                    borderRadius: "4px",
                    boxShadow: "0 0 12px #00D8FF",
                  }}
                />
              )}
              {/* Front wing */}
              <div
                style={{
                  position: "absolute",
                  right: "-4px",
                  width: "4px",
                  height: "22px",
                  background: "#C04CFD",
                  borderRadius: "1px",
                }}
              />
            </div>
          </div>

          {/* Gap Indicator Arrow between Cars */}
          {runState === "idle" && (
            <div
              style={{
                position: "absolute",
                left: `${basePlayerX + 4}%`,
                width: `${Math.max(5, 58 - basePlayerX)}%`,
                top: "78%",
                height: "1px",
                borderBottom: "1px dashed #8B94A3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "0.68rem",
                  color: "#8B94A3",
                  background: "#0A0C0F",
                  padding: "0 4px",
                }}
              >
                ◀ {gapSec}s gap ▶
              </span>
            </div>
          )}
        </div>

        {/* 4. THE PAYOFF: Outcome Card Triggered by "Run It" */}
        {runState === "completed" && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px 20px",
              borderRadius: "6px",
              background: isVerdictAttack
                ? "rgba(57, 217, 138, 0.12)"
                : "rgba(255, 201, 60, 0.12)",
              border: `1px solid ${isVerdictAttack ? "var(--green-compliant)" : "var(--yellow-caution)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {isVerdictAttack ? (
                <CheckCircle2 size={28} color="var(--green-compliant)" strokeWidth={2.5} />
              ) : (
                <XCircle size={28} color="var(--yellow-caution)" strokeWidth={2.5} />
              )}
              <div>
                <div
                  className="font-display"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: isVerdictAttack ? "var(--green-compliant)" : "var(--yellow-caution)",
                  }}
                >
                  {isVerdictAttack ? "PASS SUCCESSFUL! P3 SECURED" : "PASS ABORTED / LINE DEFENDED"}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {isVerdictAttack
                    ? "Completed move into Turn 4 with +0.22s delta. AI surge timing gave maximum acceleration."
                    : "Car could not sustain pass without battery clipping. AI correctly recommended to HOLD."}
                </div>
              </div>
            </div>

            <button
              onClick={handleResetRun}
              className="font-display"
              style={{
                background: "var(--surface-panel)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "8px 16px",
                fontSize: "0.78rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RotateCcw size={14} />
              <span>REPLAY MOVE</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. ONE BIG UNAMBIGUOUS VERDICT BOX */}
      <div
        style={{
          background: "var(--surface-panel)",
          border: `2px solid ${isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)"}`,
          borderRadius: "8px",
          padding: "28px",
          textAlign: "center",
          position: "relative",
          boxShadow: isVerdictAttack
            ? "0 0 28px rgba(192, 76, 253, 0.25)"
            : "0 0 28px rgba(255, 201, 60, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <span
            className="font-display"
            style={{
              fontSize: "0.72rem",
              fontWeight: 900,
              color: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            ● REAL-TIME AI RACE VERDICT
          </span>
        </div>

        {/* Huge Unambiguous Verdict Text */}
        <div
          className="font-display"
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 900,
            color: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
            lineHeight: 1.1,
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          {isVerdictAttack ? "ATTACK NOW" : "HOLD POSITION"}
        </div>

        {/* One short plain-language reason underneath in a single sentence */}
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--text-primary)",
            maxWidth: "680px",
            margin: "0 auto 20px auto",
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          "{getPlainReason()}"
        </p>

        {/* AI Confidence Bar */}
        <div
          style={{
            maxWidth: "420px",
            margin: "0 auto 24px auto",
            background: "#0A0C0F",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "8px 14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>AI Strategic Confidence:</span>
            <span
              className="font-mono"
              style={{
                fontWeight: 900,
                color: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
              }}
            >
              {confidencePct}%
            </span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#1F242D", borderRadius: "3px", overflow: "hidden" }}>
            <div
              style={{
                width: `${confidencePct}%`,
                height: "100%",
                background: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
                borderRadius: "3px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* The Big "Run It" Action Button */}
        <button
          onClick={handleRunIt}
          disabled={runState === "running"}
          className="font-display"
          style={{
            background: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
            color: isVerdictAttack ? "#FFFFFF" : "#0A0C0F",
            border: "none",
            borderRadius: "6px",
            padding: "16px 36px",
            fontSize: "1.05rem",
            fontWeight: 900,
            cursor: runState === "running" ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            letterSpacing: "0.06em",
            boxShadow: isVerdictAttack
              ? "0 0 24px rgba(192, 76, 253, 0.45)"
              : "0 0 24px rgba(255, 201, 60, 0.3)",
            transition: "transform 0.15s, opacity 0.15s",
            opacity: runState === "running" ? 0.7 : 1.0,
          }}
          onMouseEnter={(e) => {
            if (runState !== "running") e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        >
          <Play size={20} fill={isVerdictAttack ? "#FFFFFF" : "#0A0C0F"} />
          <span>{runState === "running" ? "SIMULATING PASS..." : "RUN IT (TEST DECISION)"}</span>
        </button>
      </div>

      {/* 6. Three Plain-Language Status Pills (No jargon, tooltips for clarity) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        {/* Pill 1: Power Reserve */}
        <div
          style={{
            background: "var(--surface-panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              POWER RESERVE
            </div>
            <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
              {powerReservePct}%{" "}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: powerReservePct < 20 ? "var(--red-violation)" : "var(--green-compliant)",
                }}
              >
                ({powerReservePct < 20 ? "Critical" : "Healthy"})
              </span>
            </div>
          </div>
          <Zap size={22} color={powerReservePct < 20 ? "var(--red-violation)" : "var(--purple-optimal)"} />
        </div>

        {/* Pill 2: Gap to Car Ahead */}
        <div
          style={{
            background: "var(--surface-panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              GAP TO RIVAL
            </div>
            <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
              {gapSec}s{" "}
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--green-compliant)" }}>
                {parseFloat(gapSec) < 0.5 ? "(In Attack Range)" : "(Managing Gap)"}
              </span>
            </div>
          </div>
          <span style={{ fontSize: "1.3rem" }}>🏁</span>
        </div>

        {/* Pill 3: Attack Mode Tooltip */}
        <div
          style={{
            background: "var(--surface-panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            cursor: "pointer",
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              <span>ATTACK BOOST</span>
              <Info size={12} color="var(--text-dim)" />
            </div>
            <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--purple-optimal)" }}>
              {raceState?.in_attack_mode_zone ? "READY TO DEPLOY" : "AVAILABLE NEXT SECTOR"}
            </div>
          </div>

          <ShieldCheck size={22} color="var(--green-compliant)" />

          {/* Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#15181D",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "8px 12px",
                fontSize: "0.75rem",
                color: "var(--text-primary)",
                width: "220px",
                textAlign: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                zIndex: 10,
              }}
            >
              A temporary extra power boost allowed under race rules to make passes possible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
