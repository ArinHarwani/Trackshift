import React, { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  ChevronRight,
  Info,
  Sliders,
  Gauge,
  Activity,
  Crosshair,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import pitRadio from "../utils/audioSynth";

/**
 * High-Precision Vector SVG F1 / Formula E Car Silhouette
 * Replaces crude placeholder divs with a scaled top-down aerodynamic silhouette.
 */
function VectorRaceCar({
  driverName = "CAR 55",
  position = "P4",
  bodyColor = "#A855F7",
  accentColor = "#C084FC",
  isAttacker = false,
  isOverdrive = false,
  tyreColor = "#EF4444", // Soft = Red, Medium = Yellow, Hard = White
  drsOpen = false,
}) {
  return (
    <svg
      width="92"
      height="46"
      viewBox="0 0 92 46"
      style={{ overflow: "visible", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}
    >
      <defs>
        {/* Glow for overdrive */}
        <filter id={`carGlow-${isAttacker ? "att" : "def"}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Overdrive thermal exhaust wake */}
      {isAttacker && isOverdrive && (
        <ellipse
          cx="4"
          cy="23"
          rx="14"
          ry="7"
          fill="#06B6D4"
          opacity="0.85"
          filter={`url(#carGlow-${isAttacker ? "att" : "def"})`}
          className="thermal-pulse"
        />
      )}

      {/* 4 Exposed Racing Wheels with Tyre Compound Band */}
      {/* Front Left */}
      <rect x="66" y="2" width="16" height="8" rx="2" fill="#111827" stroke="#374151" strokeWidth="0.8" />
      <line x1="68" y1="6" x2="80" y2="6" stroke={tyreColor} strokeWidth="1.5" />

      {/* Front Right */}
      <rect x="66" y="36" width="16" height="8" rx="2" fill="#111827" stroke="#374151" strokeWidth="0.8" />
      <line x1="68" y1="40" x2="80" y2="40" stroke={tyreColor} strokeWidth="1.5" />

      {/* Rear Left */}
      <rect x="14" y="0" width="18" height="9" rx="2" fill="#111827" stroke="#374151" strokeWidth="0.8" />
      <line x1="16" y1="4.5" x2="30" y2="4.5" stroke={tyreColor} strokeWidth="1.5" />

      {/* Rear Right */}
      <rect x="14" y="37" width="18" height="9" rx="2" fill="#111827" stroke="#374151" strokeWidth="0.8" />
      <line x1="16" y1="41.5" x2="30" y2="41.5" stroke={tyreColor} strokeWidth="1.5" />

      {/* Suspension Wishbones */}
      <line x1="74" y1="10" x2="68" y2="18" stroke="#64748B" strokeWidth="1.2" />
      <line x1="74" y1="36" x2="68" y2="28" stroke="#64748B" strokeWidth="1.2" />
      <line x1="23" y1="9" x2="32" y2="18" stroke="#64748B" strokeWidth="1.2" />
      <line x1="23" y1="37" x2="32" y2="28" stroke="#64748B" strokeWidth="1.2" />

      {/* Front Wing Assembly */}
      <path d="M 84 6 L 89 12 L 89 34 L 84 40 L 82 40 L 86 23 L 82 6 Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.5" />
      {/* Front Wing Endplates */}
      <rect x="83" y="4" width="7" height="3" rx="0.5" fill="#94A3B8" />
      <rect x="83" y="39" width="7" height="3" rx="0.5" fill="#94A3B8" />

      {/* Main Monocoque / Aerodynamic Chassis */}
      <path
        d="M 10 23 L 18 14 L 38 12 L 64 16 L 85 23 L 64 30 L 38 34 L 18 32 Z"
        fill={bodyColor}
        stroke="#0F172A"
        strokeWidth="1.2"
      />

      {/* Sidepod Air Intakes */}
      <path d="M 40 13 L 56 16 L 40 20 Z" fill="#0B0E14" opacity="0.75" />
      <path d="M 40 33 L 56 30 L 40 26 Z" fill="#0B0E14" opacity="0.75" />

      {/* Engine Cover Spine */}
      <line x1="16" y1="23" x2="52" y2="23" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />

      {/* Cockpit Opening */}
      <ellipse cx="50" cy="23" rx="9" ry="5.5" fill="#080A0D" stroke="#334155" strokeWidth="0.8" />
      {/* Driver Helmet */}
      <circle cx="48" cy="23" r="3.5" fill={isAttacker ? "#F8FAFC" : "#F59E0B"} stroke="#0F172A" strokeWidth="0.8" />
      {/* Halo Protection Hoop */}
      <path d="M 48 19.5 L 56 23 L 48 26.5" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Rear Wing Assembly */}
      <rect x="4" y="7" width="7" height="32" rx="1.5" fill={drsOpen ? "#10B981" : "#E2E8F0"} stroke="#0F172A" strokeWidth="0.8" />
      {/* Rear Wing Endplates */}
      <rect x="2" y="5" width="10" height="3" rx="0.5" fill="#64748B" />
      <rect x="2" y="38" width="10" height="3" rx="0.5" fill="#64748B" />

      {/* DRS Active Indicator Light on Wing */}
      {drsOpen && (
        <line x1="5" y1="12" x2="5" y2="34" stroke="#10B981" strokeWidth="2" strokeDasharray="3 2" />
      )}
    </svg>
  );
}

export default function SimpleCockpit({
  raceState,
  strategyOutput,
  onSwitchToExpert,
  presets = [],
  activePresetId,
  onSelectPreset,
  visitorName,
}) {
  // Animation state for "Simulate Tactical Maneuver"
  const [runState, setRunState] = useState("idle"); // "idle" | "running" | "completed"
  const [runProgress, setRunProgress] = useState(0); // 0 to 100
  const [showTooltip, setShowTooltip] = useState(false);

  // Verdict logic from deterministic multi-agent outputs
  const isAttackRecommended =
    strategyOutput?.raw_agent_outputs?.overtake?.overtake_recommended &&
    strategyOutput?.rule_compliance === "verified";

  const isRuleBreached = strategyOutput?.rule_compliance === "breached";
  const isConserve =
    strategyOutput?.raw_agent_outputs?.energy?.recommended_action === "conserve";

  const isVerdictAttack = isAttackRecommended && !isRuleBreached && !isConserve;

  // AI Strategic Confidence percentage
  const confidencePct = Math.min(
    98,
    Math.max(45, Math.round(((strategyOutput?.composite_score ?? 0.5) + 0.3) * 75))
  );

  // Precise, plain-language race engineering rationale
  const getTacticalRationale = () => {
    if (isRuleBreached) {
      return "Current single-lap energy draw would exceed FIA technical limits. Mandatory hold advised to avoid a post-race 5-second penalty.";
    }
    if (isConserve || (raceState?.energy_pct ?? 50) < 18) {
      return "High-voltage battery buffer is below recovery threshold. Harvesting energy now protects track position against late-race undercuts.";
    }
    if (isVerdictAttack) {
      if ((raceState?.gap_ahead_sec ?? 1.0) <= 0.4) {
        return "Interval inside aerodynamic slipstream envelope with 32% energy surplus. Optimal high-voltage deployment into Turn 4 braking zone.";
      }
      return "Favorable tyre grip differential and energy reserve create peak overtake probability. Deploy ERS boost through Sector 2.";
    }
    if ((raceState?.gap_ahead_sec ?? 1.0) > 1.2) {
      return "Interval to lead car is beyond DRS detection threshold. Maintain thermal pace to avoid unproductive battery de-rating.";
    }
    return "Hold delta within slipstream buffer; conserve powertrain reserve until rival tyre degradation opens high-probability pass window.";
  };

  // Reset animation when scenario changes
  useEffect(() => {
    setRunState("idle");
    setRunProgress(0);
  }, [activePresetId, raceState]);

  // Maneuver animation loop
  const handleSimulateManeuver = () => {
    if (runState === "running") return;
    setRunState("running");
    setRunProgress(0);

    try {
      pitRadio.playRadioBeep();
    } catch (e) {}

    let current = 0;
    const interval = setInterval(() => {
      current += 3.5;
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
    }, 45); // ~1.3s smooth technical simulation
  };

  const handleResetManeuver = () => {
    setRunState("idle");
    setRunProgress(0);
  };

  // Telemetry variables
  const rivalDriver = raceState?.rival_driver_name || "Max Verstappen";
  const gapSec = raceState?.gap_ahead_sec ? raceState.gap_ahead_sec.toFixed(2) : "0.38";
  const powerReservePct = raceState?.energy_pct ? Math.round(raceState.energy_pct) : 32;
  const inDrs = (raceState?.drs_zone_ahead_m ?? 200) <= 150 || (raceState?.gap_ahead_sec ?? 1) <= 1.0;

  // Track position calculations (0% to 100%)
  const basePlayerX = Math.max(16, 62 - Math.min(38, (raceState?.gap_ahead_sec ?? 0.5) * 26));
  let animatedPlayerX = basePlayerX;
  let animatedPlayerY = 0;

  if (runState === "running" || runState === "completed") {
    if (isVerdictAttack) {
      // Attacks and completes pass from basePlayerX to 78%
      const travel = (78 - basePlayerX) * (runProgress / 100);
      animatedPlayerX = basePlayerX + travel;
      if (runProgress > 25 && runProgress < 80) {
        animatedPlayerY = -28; // Inside apex lane shift
      }
    } else {
      // Surges slightly then holds safe line
      const surge = 10 * Math.sin((runProgress / 100) * Math.PI);
      animatedPlayerX = basePlayerX + surge - (runProgress > 65 ? 5 : 0);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* 1. TOP HEADER & TELEMETRY WORKSPACE TOGGLE */}
      <div
        style={{
          background: "var(--surface-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px",
          padding: "12px 20px",
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
              background: "rgba(168, 85, 247, 0.12)",
              color: "var(--purple-optimal)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              padding: "3px 10px",
              borderRadius: "2px",
              letterSpacing: "0.06em",
            }}
          >
            PIT-WALL DIRECTIVE CONSOLE
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Observer Call-Sign: <strong style={{ color: "var(--text-primary)" }}>{visitorName || "Trackside Engineer"}</strong>
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "0.72rem",
              color: "var(--green-compliant)",
              background: "rgba(16, 185, 129, 0.1)",
              padding: "2px 8px",
              borderRadius: "2px",
            }}
          >
            ● TELEMETRY STREAM NOMINAL
          </span>
        </div>

        {/* Expert Telemetry Toggle */}
        <button
          onClick={onSwitchToExpert}
          className="font-display"
          style={{
            background: "var(--surface-panel-card)",
            color: "var(--purple-optimal)",
            border: "1px solid var(--purple-optimal)",
            borderRadius: "3px",
            padding: "8px 16px",
            fontSize: "0.76rem",
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
            e.currentTarget.style.background = "var(--surface-panel-card)";
            e.currentTarget.style.color = "var(--purple-optimal)";
          }}
        >
          <Sliders size={14} />
          <span>EXPAND FULL TELEMETRY SUITE (EXPERT MODE)</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 2. TACTICAL SCENARIO SELECTOR (Clean Engineering Codename Chips) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              className="font-display"
              style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 800, letterSpacing: "0.08em" }}
            >
              SELECT TACTICAL RACE SCENARIO:
            </span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
            Select scenario to evaluate live multi-agent strategy synthesis
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "10px",
          }}
        >
          {presets.slice(0, 4).map((p, idx) => {
            const isSelected = activePresetId === p.id;
            const scenarioData = [
              {
                code: "TAC-01",
                title: "Attack Window",
                badge: "DRS OPTIMAL",
                badgeColor: "var(--purple-optimal)",
                delta: "0.38s behind",
                soc: "32% SoC",
                desc: "Closing inside slipstream; full ERS surge authorized",
                icon: Crosshair,
              },
              {
                code: "TAC-02",
                title: "Energy Deficit",
                badge: "CONSERVE",
                badgeColor: "var(--yellow-caution)",
                delta: "1.45s behind",
                soc: "14% SoC",
                desc: "Battery de-rate risk; mandatory lift & coast directive",
                icon: Activity,
              },
              {
                code: "TAC-03",
                title: "Undercut Defense",
                badge: "LINE DEFENSE",
                badgeColor: "var(--cyan-telemetry)",
                delta: "0.28s rear",
                soc: "28% SoC",
                desc: "Defending inside apex against aggressive chaser",
                icon: ShieldAlert,
              },
              {
                code: "TAC-04",
                title: "Final Lap Pursuit",
                badge: "MAX DEPLOY",
                badgeColor: "var(--green-compliant)",
                delta: "0.45s behind",
                soc: "100% Discharge",
                desc: "Final race lap; zero regulatory reserve conservation required",
                icon: Zap,
              },
            ];

            const meta = scenarioData[idx] || {
              code: `TAC-0${idx + 1}`,
              title: p.name,
              badge: "SIMULATED",
              badgeColor: "var(--purple-optimal)",
              delta: "0.50s",
              soc: "50%",
              desc: p.description,
              icon: Crosshair,
            };

            const IconComponent = meta.icon;

            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset && onSelectPreset(p)}
                style={{
                  background: isSelected ? "var(--surface-panel-hover)" : "var(--surface-panel)",
                  border: isSelected ? "1px solid var(--purple-optimal)" : "1px solid var(--border-subtle)",
                  borderRadius: "4px",
                  padding: "12px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  position: "relative",
                  transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isSelected ? "0 0 14px var(--purple-glow)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <IconComponent size={14} color={meta.badgeColor} />
                    <span className="font-mono" style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-dim)" }}>
                      {meta.code}
                    </span>
                    <span className="font-display" style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                      {meta.title}
                    </span>
                  </div>
                  <span
                    className="font-display"
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: meta.badgeColor,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border-subtle)",
                      padding: "1px 6px",
                      borderRadius: "2px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {meta.badge}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  <span className="font-mono">{meta.delta}</span>
                  <span>•</span>
                  <span className="font-mono">{meta.soc}</span>
                </div>

                <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", lineHeight: 1.35 }}>
                  {meta.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. HERO INTERACTIVE TELEMETRY TRACK & VECTOR RACING CARS */}
      <div
        style={{
          background: "var(--surface-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px",
          padding: "20px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Track Header Ribbon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              className="font-display"
              style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "0.05em" }}
            >
              LIVE TRACK TELEMETRY // TURN 4 ACCELERATION CORRIDOR
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: "0.68rem",
                color: "var(--text-secondary)",
                background: "var(--surface-panel-subtle)",
                border: "1px solid var(--border-subtle)",
                padding: "2px 8px",
                borderRadius: "2px",
              }}
            >
              DRS ZONE 2 • ACTIVATION LINE
            </span>
          </div>

          <div
            style={{
              background: "#080A0D",
              border: "1px solid var(--border-subtle)",
              borderRadius: "3px",
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>INTERVAL:</span>
              <span className="font-mono" style={{ fontSize: "0.92rem", fontWeight: 900, color: "var(--purple-optimal)" }}>
                +{gapSec}s
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>DELTA DISTANCE:</span>
              <span className="font-mono" style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {(parseFloat(gapSec) * 58).toFixed(1)}m
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Vector SVG Track Visualization */}
        <div
          style={{
            height: "140px",
            background: "#080A0D",
            borderRadius: "4px",
            border: "1px solid var(--border-subtle)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 4px 16px rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Top & Bottom FIA Asphalt Kerbing */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "5px",
              background: "repeating-linear-gradient(90deg, #EF4444 0, #EF4444 24px, #F8FAFC 24px, #F8FAFC 48px)",
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "5px",
              background: "repeating-linear-gradient(90deg, #EF4444 0, #EF4444 24px, #F8FAFC 24px, #F8FAFC 48px)",
              opacity: 0.85,
            }}
          />

          {/* DRS Zone Activation Green Boundary Line */}
          <div
            style={{
              position: "absolute",
              left: "48%",
              top: 0,
              bottom: 0,
              width: "2px",
              background: "dashed var(--green-compliant)",
              borderLeft: "2px dashed var(--green-compliant)",
              opacity: 0.5,
              zIndex: 1,
            }}
          >
            <span
              className="font-mono"
              style={{
                position: "absolute",
                top: "8px",
                left: "6px",
                fontSize: "0.58rem",
                color: "var(--green-compliant)",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              DRS ZONE DETECTION
            </span>
          </div>

          {/* Center Asphalt Dashed Racing Lane Line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "2px",
              transform: "translateY(-50%)",
              backgroundImage: "linear-gradient(90deg, #2A3342 60%, transparent 60%)",
              backgroundSize: "32px 2px",
              animation: runState === "running" ? "moveRoad 0.3s linear infinite" : "none",
            }}
          />

          {/* Aerodynamic Slipstream Vector Lines Trailing Behind Rival */}
          <svg
            style={{
              position: "absolute",
              left: `${Math.max(10, basePlayerX)}%`,
              width: `${Math.max(10, 64 - basePlayerX)}%`,
              top: "35%",
              height: "40px",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <line x1="100%" y1="14" x2="0%" y2="14" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" className="slipstream-vector" />
            <line x1="100%" y1="20" x2="0%" y2="20" stroke="rgba(6, 182, 212, 0.7)" strokeWidth="1.8" className="slipstream-vector" />
            <line x1="100%" y1="26" x2="0%" y2="26" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" className="slipstream-vector" />
          </svg>

          {/* CAR 1: Lead Rival Car (Red Bull / Ferrari Dark Livery) */}
          <div
            style={{
              position: "absolute",
              left: "64%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 3,
              transition: "left 0.4s ease-out",
            }}
          >
            {/* Telemetry Tag Badge */}
            <span
              className="font-mono"
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: "#FCA5A5",
                background: "rgba(239, 68, 68, 0.18)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                padding: "2px 6px",
                borderRadius: "2px",
                marginBottom: "3px",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
              }}
            >
              {rivalDriver} (P3)
            </span>

            {/* Vector SVG Silhouette */}
            <VectorRaceCar
              driverName={rivalDriver}
              position="P3"
              bodyColor="#991B1B"
              accentColor="#EF4444"
              isAttacker={false}
              isOverdrive={false}
              tyreColor="#F59E0B" // Medium compound
              drsOpen={false}
            />
          </div>

          {/* CAR 2: User Attacking Car (TrackShift Purple Livery) */}
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
                  ? "left 0.05s linear, top 0.22s ease"
                  : "left 0.45s ease-out, top 0.3s ease",
            }}
          >
            {/* Telemetry Tag Badge */}
            <span
              className="font-mono"
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: "#FFFFFF",
                background: isVerdictAttack ? "var(--purple-optimal)" : "#475569",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "2px 6px",
                borderRadius: "2px",
                marginBottom: "3px",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
                boxShadow: isVerdictAttack ? "0 0 10px var(--purple-glow)" : "none",
              }}
            >
              YOU (P4) • CAR 55
            </span>

            {/* Vector SVG Silhouette */}
            <VectorRaceCar
              driverName="CAR 55"
              position="P4"
              bodyColor={isVerdictAttack ? "#7C3AED" : "#334155"}
              accentColor={isVerdictAttack ? "#C084FC" : "#64748B"}
              isAttacker={true}
              isOverdrive={runState === "running" && isVerdictAttack}
              tyreColor="#EF4444" // Soft compound
              drsOpen={inDrs}
            />
          </div>

          {/* Distance Indicator Ribbon between Cars */}
          {runState === "idle" && (
            <div
              style={{
                position: "absolute",
                left: `${basePlayerX + 6}%`,
                width: `${Math.max(4, 57 - basePlayerX)}%`,
                top: "80%",
                height: "1px",
                borderBottom: "1px dashed #64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-secondary)",
                  background: "#080A0D",
                  padding: "0 6px",
                }}
              >
                ◀ Δ {gapSec}s • {(parseFloat(gapSec) * 58).toFixed(0)}m ▶
              </span>
            </div>
          )}
        </div>

        {/* 4. POST-SIMULATION TACTICAL OUTCOME DEBRIEF */}
        {runState === "completed" && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px 20px",
              borderRadius: "4px",
              background: isVerdictAttack
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(245, 158, 11, 0.1)",
              border: `1px solid ${isVerdictAttack ? "var(--green-compliant)" : "var(--yellow-caution)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              animation: "fadeIn 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {isVerdictAttack ? (
                <CheckCircle2 size={26} color="var(--green-compliant)" strokeWidth={2.5} />
              ) : (
                <AlertTriangle size={26} color="var(--yellow-caution)" strokeWidth={2.5} />
              )}
              <div>
                <div
                  className="font-display"
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    color: isVerdictAttack ? "var(--green-compliant)" : "var(--yellow-caution)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isVerdictAttack ? "OVERTAKE EXECUTED // P3 SECURED INTO APEX" : "TACTICAL HOLD VERIFIED // ENERGY MARGIN PRESERVED"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {isVerdictAttack
                    ? "Optimal high-voltage discharge delivered +0.22s delta at Turn 4 entry. Regulation 14.2 verified compliant (3.12 kWh draw)."
                    : "Power de-rate prevented. Conserving energy behind slipstream defended baseline track position without battery penalty."}
                </div>
              </div>
            </div>

            <button
              onClick={handleResetManeuver}
              className="btn-f1"
              style={{ fontSize: "0.75rem", padding: "8px 16px" }}
            >
              <RotateCcw size={13} />
              <span>RE-SIMULATE MANEUVER</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. BROADCAST-GRADE TACTICAL VERDICT CARD */}
      <div
        style={{
          background: "var(--surface-panel)",
          border: `1px solid ${isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)"}`,
          borderRadius: "4px",
          padding: "26px 32px",
          textAlign: "center",
          position: "relative",
          boxShadow: isVerdictAttack
            ? "0 4px 24px var(--purple-glow)"
            : "0 4px 24px var(--yellow-glow)",
        }}
      >
        {/* Directive Priority Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <span
            className="font-display"
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              color: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
              letterSpacing: "0.1em",
            }}
          >
            ● STRATEGY DIRECTIVE // PRIORITY 1 EXECUTION
          </span>
        </div>

        {/* Clear Unambiguous Verdict Text */}
        <div
          className="font-display"
          style={{
            fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
            fontWeight: 900,
            color: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
            lineHeight: 1.15,
            marginBottom: "12px",
            letterSpacing: "-0.01em",
          }}
        >
          {isVerdictAttack ? "DEPLOY TACTICAL OVERTAKE" : "MAINTAIN POSITION // HARVEST ENERGY"}
        </div>

        {/* Concise Plain-Language Reason */}
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--text-primary)",
            maxWidth: "760px",
            margin: "0 auto 22px auto",
            lineHeight: 1.55,
            fontWeight: 500,
          }}
        >
          "{getTacticalRationale()}"
        </p>

        {/* Tactical Telemetry Metrics Row */}
        <div
          style={{
            maxWidth: "540px",
            margin: "0 auto 24px auto",
            background: "#080A0D",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
            padding: "10px 16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              CONFIDENCE INDEX
            </div>
            <div className="font-mono" style={{ fontSize: "1.1rem", fontWeight: 900, color: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)" }}>
              {confidencePct}%
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-subtle)", borderRight: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              PROJECTED DELTA
            </div>
            <div className="font-mono" style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--green-compliant)" }}>
              {isVerdictAttack ? "+1 Position" : "+0 Net Def"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              POWERTRAIN ACTION
            </div>
            <div className="font-display" style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {isVerdictAttack ? "MODE 8 (DEPLOY)" : "MODE 2 (HARVEST)"}
            </div>
          </div>
        </div>

        {/* Big Action Button: Simulate Tactical Maneuver */}
        <button
          onClick={handleSimulateManeuver}
          disabled={runState === "running"}
          className="font-display"
          style={{
            background: isVerdictAttack ? "var(--purple-optimal)" : "var(--yellow-caution)",
            color: isVerdictAttack ? "#FFFFFF" : "#080A0D",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            padding: "14px 34px",
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: runState === "running" ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            letterSpacing: "0.06em",
            boxShadow: isVerdictAttack
              ? "0 0 20px var(--purple-glow)"
              : "0 0 20px var(--yellow-glow)",
            transition: "all 0.15s ease",
            opacity: runState === "running" ? 0.7 : 1.0,
          }}
          onMouseEnter={(e) => {
            if (runState !== "running") e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <Play size={18} fill={isVerdictAttack ? "#FFFFFF" : "#080A0D"} />
          <span>{runState === "running" ? "SIMULATING TRAJECTORY & DELTA..." : "SIMULATE TACTICAL MANEUVER"}</span>
        </button>
      </div>

      {/* 6. THREE TELEMETRY STATUS PILLS (High Authority, Zero Emojis) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "12px",
        }}
      >
        {/* Pill 1: Battery SoC */}
        <div
          style={{
            background: "var(--surface-panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              HIGH-VOLTAGE BATTERY RESERVE
            </div>
            <div className="font-mono" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              {powerReservePct}%{" "}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: powerReservePct < 20 ? "var(--red-violation)" : "var(--green-compliant)",
                }}
              >
                ({powerReservePct < 20 ? "Critical Threshold" : "Healthy Buffer"})
              </span>
            </div>
          </div>
          <Zap size={22} color={powerReservePct < 20 ? "var(--red-violation)" : "var(--purple-optimal)"} />
        </div>

        {/* Pill 2: Interval Delta */}
        <div
          style={{
            background: "var(--surface-panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              INTERVAL TO LEAD CAR
            </div>
            <div className="font-mono" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              +{gapSec}s{" "}
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--green-compliant)" }}>
                {parseFloat(gapSec) < 0.6 ? "(Slipstream Window)" : "(Managing Delta)"}
              </span>
            </div>
          </div>
          <Gauge size={22} color="var(--green-compliant)" />
        </div>

        {/* Pill 3: Regulatory Compliance */}
        <div
          style={{
            background: "var(--surface-panel)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
              <span>FIA REGULATION STATUS</span>
              <Info size={12} color="var(--text-dim)" />
            </div>
            <div className="font-display" style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--green-compliant)" }}>
              {isRuleBreached ? "REGULATORY BREACH" : "VERIFIED COMPLIANT"}
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
                background: "#14181F",
                border: "1px solid var(--border-subtle)",
                borderRadius: "3px",
                padding: "8px 12px",
                fontSize: "0.74rem",
                color: "var(--text-primary)",
                width: "250px",
                textAlign: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
                zIndex: 10,
              }}
            >
              Continuous algorithmic verification against FIA Gen3 / F1 single-lap 4.0 kWh energy limit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

