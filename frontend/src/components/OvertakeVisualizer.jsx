import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, AlertTriangle, Flame, Gauge, CheckCircle2, XCircle } from "lucide-react";
import pitRadio from "../utils/audioSynth";

/**
 * Continuous color interpolation for Car A's engine heat zone:
 * 0–40%  → Cool Blue rgb(56, 189, 248) to Amber rgb(255, 201, 60)
 * 40–75% → Amber rgb(255, 201, 60) to Red rgb(255, 59, 59)
 * 75–100% → Red rgb(255, 59, 59) to Deep Red rgb(153, 27, 27)
 */
function getEngineHeatColor(energyPct) {
  const e = Math.min(Math.max(energyPct, 0), 100);

  let r, g, b;
  if (e <= 40) {
    const t = e / 40;
    r = Math.round(56 + t * (255 - 56));
    g = Math.round(189 + t * (201 - 189));
    b = Math.round(248 + t * (60 - 248));
  } else if (e <= 75) {
    const t = (e - 40) / 35;
    r = 255;
    g = Math.round(201 + t * (59 - 201));
    b = Math.round(60 + t * (59 - 60));
  } else {
    const t = (e - 75) / 25;
    r = Math.round(255 + t * (153 - 255));
    g = Math.round(59 + t * (27 - 59));
    b = Math.round(59 + t * (27 - 59));
  }

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Simplified recognizable F1 silhouette SVG component.
 * Features tapered nose, front & rear wing bars, exposed wheels at sidepods, cockpit halo,
 * and a distinct independent engine heat zone.
 */
function F1CarSilhouette({
  driverLabel,
  positionLabel,
  bodyColor,
  heatColor,
  isAttacker,
  isOverdrive,
}) {
  return (
    <g className="f1-car-group">
      {/* Dynamic thermal exhaust pulse for Car A above 85% energy */}
      {isAttacker && isOverdrive && (
        <ellipse
          cx="2"
          cy="13"
          rx="10"
          ry="6"
          fill={heatColor}
          opacity="0.8"
          filter="url(#overdriveGlow)"
          className="thermal-pulse"
        />
      )}

      {/* 4 Exposed Wheels (Top-down sidepod positions) */}
      {/* Front Left */}
      <rect x="48" y="-1" width="13" height="6" rx="1.5" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
      {/* Front Right */}
      <rect x="48" y="21" width="13" height="6" rx="1.5" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
      {/* Rear Left */}
      <rect x="10" y="-2" width="15" height="7" rx="1.5" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
      {/* Rear Right */}
      <rect x="10" y="21" width="15" height="7" rx="1.5" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />

      {/* Front Wing Assembly (Bar + Endplates) */}
      <rect x="62" y="1" width="4" height="24" rx="1" fill="#E2E8F0" />
      <rect x="61" y="0" width="6" height="2" rx="0.5" fill="#94A3B8" />
      <rect x="61" y="24" width="6" height="2" rx="0.5" fill="#94A3B8" />

      {/* Rear Wing Assembly (Bar + Endplates) */}
      <rect x="3" y="2" width="5" height="22" rx="1" fill="#E2E8F0" />
      <rect x="1" y="1" width="8" height="2.5" rx="0.5" fill="#94A3B8" />
      <rect x="1" y="22.5" width="8" height="2.5" rx="0.5" fill="#94A3B8" />

      {/* Main Car Chassis / Monocoque (Flat schematic fill) */}
      <path
        d="M 8 13 L 14 7 L 34 6 L 54 9 L 66 13 L 54 17 L 34 20 L 14 19 Z"
        fill={bodyColor}
        stroke="#0F172A"
        strokeWidth="1"
      />

      {/* DISTINCT ENGINE HEAT ZONE (Diffuser / Engine Cover Area) */}
      <path
        d="M 12 8 L 30 7.5 L 30 18.5 L 12 18 Z"
        fill={heatColor}
        opacity={isAttacker ? "0.95" : "0.75"}
      />

      {/* Cockpit Opening & Driver Halo Hoop */}
      <ellipse cx="37" cy="13" rx="7" ry="4.5" fill="#0A0C0F" />
      {/* Driver Helmet */}
      <circle cx="36" cy="13" r="2.8" fill={isAttacker ? "#C04CFD" : "#FB923C"} />
      {/* Halo Forward Pillar */}
      <line x1="37" y1="13" x2="44" y2="13" stroke="#CBD5E1" strokeWidth="1.2" />

      {/* Car Label Badge */}
      <text
        x="34"
        y="-6"
        fill={isAttacker ? "#C04CFD" : "#FB923C"}
        fontSize="8"
        fontFamily="var(--font-display)"
        fontWeight="800"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        {driverLabel} ({positionLabel})
      </text>
    </g>
  );
}

/**
 * Overtake Visualizer & Engine Heat Gauge Component
 * Full-width edge-to-edge track rendering inside the tile.
 */
export default function OvertakeVisualizer({
  state,
  strategyOutput,
  onChangeState,
}) {
  if (!state) return null;

  const rawAgents = strategyOutput?.raw_agent_outputs;
  const overtakeOutput = rawAgents?.overtake;
  const energyOutput = rawAgents?.energy;
  const rulesOutput = rawAgents?.rules;

  // Real backend calculations (Deterministic outputs)
  const successProb = overtakeOutput?.success_probability_pct ?? strategyOutput?.overtake_probability_pct ?? 0;
  const expectedGain = overtakeOutput?.expected_position_gain ?? strategyOutput?.expected_position_gain ?? 0;
  const isCompliant = rulesOutput?.compliant ?? (strategyOutput?.rule_compliance === "verified");
  const autoDeployPct = energyOutput?.recommended_deploy_pct ?? 25;

  // Judge-controllable inputs
  const [energyDeployPct, setEnergyDeployPct] = useState(autoDeployPct);
  const [manualEnergyOverride, setManualEnergyOverride] = useState(false);

  // Sync auto deploy when not manually overridden by judge
  useEffect(() => {
    if (!manualEnergyOverride) {
      setEnergyDeployPct(Math.round(autoDeployPct));
    }
  }, [autoDeployPct, manualEnergyOverride]);

  // Derived continuous heat colors
  // Car A: Live continuous interpolation driven by energyDeployPct slider (0-100)
  const carAHeatColor = getEngineHeatColor(energyDeployPct);
  const isOverdrive = energyDeployPct >= 85;

  // Car B: Fixed neutral/cool baseline color (#475569) creating clear visual contrast
  const carBHeatColor = "#475569";

  // Widescreen Track coordinates setup:
  // SVG Track width: 1000px (100% full width inside tile)
  // Main Lane: y = 58
  // Overtake Lane: y = 26
  // Defender (Car B) is fixed near the braking apex at x = 760
  const CAR_B_X = 760;
  const MAIN_LANE_Y = 58;
  const OVERTAKE_LANE_Y = 26;

  // Calculate Car A starting X position proportional to gap_ahead_sec (0.0s to 3.0s):
  // 0.0s -> 690px (right behind Car B)
  // 1.5s -> 400px (midfield)
  // 3.0s -> 100px (back of straight)
  const calculateCarAX = (gapSec) => {
    const clampedGap = Math.min(Math.max(gapSec, 0.0), 3.0);
    return CAR_B_X - 70 - (clampedGap / 3.0) * 590;
  };

  // Animation State Management
  // 'idle' | 'running' | 'completed'
  const [animState, setAnimState] = useState("idle");
  const [animOutcome, setAnimOutcome] = useState(null); // 'success' | 'failed'
  const [simRoll, setSimRoll] = useState(null);

  // Car positions for smooth SVG translation
  const [carAPos, setCarAPos] = useState({ x: calculateCarAX(state.gap_ahead_sec), y: MAIN_LANE_Y });
  const [carBPos, setCarBPos] = useState({ x: CAR_B_X, y: MAIN_LANE_Y });

  // Live update Car A position when gap slider moves (instant, smooth CSS transition)
  useEffect(() => {
    if (animState === "idle") {
      setCarAPos({ x: calculateCarAX(state.gap_ahead_sec), y: MAIN_LANE_Y });
      setCarBPos({ x: CAR_B_X, y: MAIN_LANE_Y });
    }
  }, [state.gap_ahead_sec, animState]);

  const animTimers = useRef([]);

  const clearAllTimers = () => {
    animTimers.current.forEach((t) => clearTimeout(t));
    animTimers.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Trigger Two-Stage Overtake Animation
  const handleRunOvertake = () => {
    if (animState === "running") return;
    clearAllTimers();

    // 1. Probabilistic roll against true backend success probability
    const roll = Math.random() * 100;
    const isSuccess = roll <= successProb;
    setSimRoll(roll);
    setAnimOutcome(isSuccess ? "success" : "failed");
    setAnimState("running");

    try {
      pitRadio.playRadioBeep();
    } catch (_) {}

    // STAGE 1 (~0.9s): Car A accelerates and shifts into the adjacent overtake lane alongside Car B
    setCarAPos({ x: CAR_B_X - 15, y: OVERTAKE_LANE_Y });

    // STAGE 2 (~0.9s): Branch by outcome
    const stage2Timer = setTimeout(() => {
      if (isSuccess) {
        // Success: Car A powers ahead of Car B and merges back into the main lane ahead
        setCarAPos({ x: CAR_B_X + 90, y: MAIN_LANE_Y });
        setCarBPos({ x: CAR_B_X - 30, y: MAIN_LANE_Y });
      } else {
        // Failure: Car B defends the inside line; Car A cannot make it stick and falls back behind
        setCarAPos({ x: CAR_B_X - 75, y: MAIN_LANE_Y });
        setCarBPos({ x: CAR_B_X + 15, y: MAIN_LANE_Y });
      }
    }, 950);

    // Hold resolution & display numeric overlay
    const completeTimer = setTimeout(() => {
      setAnimState("completed");
    }, 1900);

    animTimers.current = [stage2Timer, completeTimer];
  };

  const handleResetTrack = () => {
    clearAllTimers();
    setAnimState("idle");
    setAnimOutcome(null);
    setSimRoll(null);
    setCarAPos({ x: calculateCarAX(state.gap_ahead_sec), y: MAIN_LANE_Y });
    setCarBPos({ x: CAR_B_X, y: MAIN_LANE_Y });
  };

  return (
    <div
      style={{
        background: "var(--surface-panel-subtle)",
        border: `1px solid ${!isCompliant ? "var(--red-violation)" : "var(--border-subtle)"}`,
        borderRadius: "4px",
        padding: "16px",
        marginBottom: "18px",
        position: "relative",
      }}
    >
      {/* 1. Independent Rule Violation Warning Indicator */}
      {!isCompliant && (
        <div
          style={{
            background: "rgba(255, 59, 59, 0.15)",
            borderBottom: "1px solid var(--red-violation)",
            margin: "-16px -16px 14px -16px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--red-violation)",
          }}
        >
          <AlertTriangle size={15} />
          <span className="font-display" style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em" }}>
            FIA REGULATION BREACH ALERT // PROPOSED ENERGY ALLOCATION EXCEEDS ARTICLE 34.2 CAP
          </span>
        </div>
      )}

      {/* Header with Title & Action Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Flame size={17} color={carAHeatColor} />
          <span className="font-display" style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-primary)" }}>
            OVERTAKE VISUALIZER & ENGINE HEAT GAUGE
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "0.68rem",
              background: "rgba(255, 255, 255, 0.06)",
              padding: "2px 6px",
              borderRadius: "2px",
              color: "var(--text-secondary)",
            }}
          >
            MODULE H // LIVE SVG PHYSICS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {animState !== "idle" && (
            <button
              onClick={handleResetTrack}
              className="btn-f1"
              style={{ padding: "5px 9px", fontSize: "0.7rem" }}
              title="Reset car positions to current gap"
            >
              <RotateCcw size={12} />
              Reset Track
            </button>
          )}

          <button
            onClick={handleRunOvertake}
            disabled={animState === "running"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: animState === "running" ? "var(--surface-panel-hover)" : "var(--purple-optimal)",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              padding: "6px 14px",
              fontFamily: "var(--font-display)",
              fontSize: "0.78rem",
              fontWeight: 800,
              cursor: animState === "running" ? "not-allowed" : "pointer",
              boxShadow: animState === "running" ? "none" : "0 0 12px rgba(192, 76, 253, 0.4)",
              transition: "all 0.2s ease",
            }}
          >
            <Play size={13} fill="currentColor" />
            {animState === "running" ? "SIMULATING PASS..." : "RUN OVERTAKE ATTEMPT"}
          </button>
        </div>
      </div>

      {/* Track SVG Canvas — Full width tile container */}
      <div
        style={{
          background: "#080A0D",
          borderRadius: "4px",
          border: "1px solid var(--border-subtle)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.6)",
        }}
      >
        {/* HUD Info Badges on Track */}
        <div style={{ position: "absolute", top: "8px", left: "12px", display: "flex", alignItems: "center", gap: "10px", zIndex: 5 }}>
          <span className="font-display" style={{ fontSize: "0.68rem", color: "var(--text-dim)", fontWeight: 700 }}>
            SECTOR 2 MAIN STRAIGHT // DRS ZONE
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "0.65rem",
              color: state.gap_ahead_sec <= 1.0 ? "var(--green-compliant)" : "var(--text-dim)",
              background: "rgba(0,0,0,0.4)",
              padding: "1px 6px",
              borderRadius: "2px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            DRS {state.gap_ahead_sec <= 1.0 ? "AVAILABLE (≤1.0s)" : "INACTIVE (>1.0s)"}
          </span>
        </div>

        {/* Real-time Numeric Result Overlay after resolution */}
        {animState === "completed" && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "12px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: animOutcome === "success" ? "rgba(57, 217, 138, 0.15)" : "rgba(255, 201, 60, 0.15)",
              border: `1px solid ${animOutcome === "success" ? "var(--green-compliant)" : "var(--yellow-caution)"}`,
              borderRadius: "3px",
              padding: "5px 12px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            {animOutcome === "success" ? (
              <CheckCircle2 size={14} color="var(--green-compliant)" />
            ) : (
              <XCircle size={14} color="var(--yellow-caution)" />
            )}
            <span
              className="font-display"
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: animOutcome === "success" ? "var(--green-compliant)" : "var(--yellow-caution)",
              }}
            >
              {animOutcome === "success" ? "OVERTAKE SUCCESSFUL" : "ATTEMPT DEFENDED BY RIVAL"}
            </span>
            <span className="font-mono" style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
              [Sim Roll: {simRoll?.toFixed(1)}% vs Prob: {successProb.toFixed(1)}%]
            </span>
          </div>
        )}

        <svg
          viewBox="0 0 1000 125"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "140px", display: "block" }}
        >
          <defs>
            <filter id="overdriveGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Top Kerb (Red/White motorsport stripes spanning full 1000px) */}
          <g>
            {Array.from({ length: 50 }).map((_, i) => (
              <rect
                key={`top-kerb-${i}`}
                x={i * 20}
                y={6}
                width={20}
                height={4}
                fill={i % 2 === 0 ? "#FF3B3B" : "#F2F4F7"}
              />
            ))}
          </g>

          {/* Main Asphalt Strip spanning 100% full width */}
          <rect x="0" y="10" width="1000" height="100" fill="#13171E" />

          {/* DRS Zone Highlight Band */}
          <rect x="480" y="10" width="340" height="100" fill="rgba(57, 217, 138, 0.05)" />
          <line x1="480" y1="10" x2="480" y2="110" stroke="var(--green-compliant)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <text x="486" y="22" fill="var(--green-compliant)" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">
            DRS ZONE DETECTION
          </text>

          {/* Visible Dashed Lane Divider (Separating Main Lane and Overtake Lane) */}
          <line
            x1="0"
            y1="56"
            x2="820"
            y2="56"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="1.5"
            strokeDasharray="14 12"
          />

          {/* Corner / Braking Apex Marker at track's far edge */}
          <path d="M 820 10 L 1000 10 L 1000 110 L 820 110 Z" fill="rgba(255, 59, 59, 0.07)" />
          <line x1="820" y1="10" x2="820" y2="110" stroke="var(--red-violation)" strokeWidth="2" strokeDasharray="4 4" opacity="0.7" />
          <text x="826" y="22" fill="var(--red-violation)" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">
            BRAKING ZONE // APEX
          </text>

          {/* Bottom Kerb spanning full 1000px */}
          <g>
            {Array.from({ length: 50 }).map((_, i) => (
              <rect
                key={`bot-kerb-${i}`}
                x={i * 20}
                y={110}
                width={20}
                height={4}
                fill={i % 2 === 0 ? "#FF3B3B" : "#F2F4F7"}
              />
            ))}
          </g>

          {/* Visual Gap Line & Distance Indicator (Idle State) */}
          {animState === "idle" && (
            <g>
              <line
                x1={carAPos.x + 68}
                y1="94"
                x2={carBPos.x}
                y2="94"
                stroke="var(--purple-optimal)"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <circle cx={carAPos.x + 68} cy="94" r="2.5" fill="var(--purple-optimal)" />
              <circle cx={carBPos.x} cy="94" r="2.5" fill="var(--purple-optimal)" />
              <rect
                x={(carAPos.x + 68 + carBPos.x) / 2 - 28}
                y="85"
                width="56"
                height="16"
                fill="#0D1015"
                stroke="var(--purple-optimal)"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={(carAPos.x + 68 + carBPos.x) / 2}
                y="96"
                fill="#F2F4F7"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                textAnchor="middle"
              >
                +{state.gap_ahead_sec.toFixed(2)}s
              </text>
            </g>
          )}

          {/* =========================================================
              CAR B (DEFENDER, RIVAL) — Fixed near corner end in main lane
              ========================================================= */}
          <g
            transform={`translate(${carBPos.x}, ${carBPos.y})`}
            style={{
              transition: animState === "running" ? "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            }}
          >
            <F1CarSilhouette
              driverLabel={state.rival_driver_name ? state.rival_driver_name.split(" ")[0].toUpperCase() : "RIVAL"}
              positionLabel="P3"
              bodyColor="#334155"
              heatColor={carBHeatColor}
              isAttacker={false}
              isOverdrive={false}
            />
          </g>

          {/* =========================================================
              CAR A (ATTACKER, JUDGE'S CAR) — Smooth real-time translation
              ========================================================= */}
          <g
            transform={`translate(${carAPos.x}, ${carAPos.y})`}
            style={{
              transition: animState === "running"
                ? "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)"
                : "transform 0.15s ease-out",
            }}
          >
            <F1CarSilhouette
              driverLabel="COPILOT"
              positionLabel="P4"
              bodyColor="#1E1B4B"
              heatColor={carAHeatColor}
              isAttacker={true}
              isOverdrive={isOverdrive}
            />
          </g>
        </svg>
      </div>

      {/* 2 Judge-Controllable Inputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "14px",
          background: "#0D1015",
          padding: "14px",
          borderRadius: "4px",
          border: "1px solid var(--border-subtle)",
          marginTop: "12px",
        }}
      >
        {/* Input 1: Distance to Car Ahead (gap_ahead_sec: 0.0s to 3.0s, step 0.1) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Gauge size={14} color="var(--purple-optimal)" />
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                DISTANCE TO CAR AHEAD:
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 800, color: state.gap_ahead_sec <= 0.6 ? "var(--green-compliant)" : "var(--text-primary)" }}>
              {state.gap_ahead_sec.toFixed(1)}s ({Math.round(state.gap_ahead_sec * 50)}m eq.)
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            value={state.gap_ahead_sec}
            onChange={(e) => onChangeState({ ...state, gap_ahead_sec: parseFloat(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--purple-optimal)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "2px" }}>
            <span>0.0s (Touching)</span>
            <span>1.0s (DRS Window)</span>
            <span>3.0s (Clean Air)</span>
          </div>
        </div>

        {/* Input 2: Engine Energy Committed (energy_deploy_pct: 0 to 100%, step 1) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Flame size={14} color={carAHeatColor} />
              <span className="font-display" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                ENGINE ENERGY COMMITTED:
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 800, color: carAHeatColor }}>
                {energyDeployPct}%
              </span>
              <button
                onClick={() => {
                  if (manualEnergyOverride) {
                    setManualEnergyOverride(false);
                    setEnergyDeployPct(Math.round(autoDeployPct));
                  } else {
                    setManualEnergyOverride(true);
                  }
                }}
                style={{
                  background: manualEnergyOverride ? "var(--purple-optimal)" : "transparent",
                  border: "1px solid var(--border-subtle)",
                  color: manualEnergyOverride ? "#fff" : "var(--text-dim)",
                  fontSize: "0.6rem",
                  padding: "1px 5px",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
                title="Toggle manual judge override vs Agent recommended deploy %"
              >
                {manualEnergyOverride ? "MANUAL" : "AUTO"}
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={energyDeployPct}
            onChange={(e) => {
              setManualEnergyOverride(true);
              setEnergyDeployPct(parseInt(e.target.value));
            }}
            style={{ width: "100%", accentColor: carAHeatColor }}
          />

          {/* Thermal stress readout */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.65rem", marginTop: "4px" }}>
            <span style={{ color: carAHeatColor, fontWeight: 700 }}>
              {energyDeployPct <= 40 ? "COOL / REGEN ACTIVE" : energyDeployPct <= 75 ? "ELEVATED THERMAL LOAD" : "MAX THERMAL STRESS"}
            </span>
            <span className="font-mono" style={{ color: "var(--text-dim)" }}>
              {isOverdrive ? "OVERDRIVE PULSE ACTIVE (>85%)" : "MGU-K NOMINAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Numeric Real Agent Mathematical Outputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px",
          background: "rgba(255, 255, 255, 0.02)",
          padding: "10px 14px",
          borderRadius: "3px",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          marginTop: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Overtake Probability (Math)
          </div>
          <div className="font-mono" style={{ fontSize: "1.05rem", fontWeight: 800, color: successProb >= 65 ? "var(--green-compliant)" : successProb >= 40 ? "var(--yellow-caution)" : "var(--red-violation)" }}>
            {successProb.toFixed(1)}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Expected Position Gain
          </div>
          <div className="font-mono" style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--purple-optimal)" }}>
            +{expectedGain} POS (P{state.track_position} → P{Math.max(1, state.track_position - expectedGain)})
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Optimal Pass Window
          </div>
          <div className="font-mono" style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {overtakeOutput?.best_window === "this_lap" ? "THIS LAP" : overtakeOutput?.best_window === "next_2_laps" ? "NEXT 2 LAPS" : "CONSERVE"}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            FIA Rule Compliance
          </div>
          <div className="font-display" style={{ fontSize: "0.95rem", fontWeight: 800, color: isCompliant ? "var(--green-compliant)" : "var(--red-violation)" }}>
            {isCompliant ? "✓ ARTICLE 34.2 PASS" : "⚠ ALLOCATION BREACH"}
          </div>
        </div>
      </div>

      {/* Explanatory Note for Judges */}
      <div style={{ marginTop: "10px", fontSize: "0.65rem", color: "var(--text-dim)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
        <span>* Car A engine heat is smoothly interpolated from energy % (Car B fixed at baseline).</span>
        <span>Simulated outcome is probabilistically resolved against true P_base = 86 × exp(-0.92 × gap).</span>
      </div>
    </div>
  );
}
