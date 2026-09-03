import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import TimingTowerStrip from "./components/TimingTowerStrip";
import DecisionDisplay from "./components/DecisionDisplay";
import StrategySandbox from "./components/StrategySandbox";
import AgentInspector from "./components/AgentInspector";
import RaceSimulator from "./components/RaceSimulator";
import BacktestStudio from "./components/BacktestStudio";
import LandingGate from "./components/LandingGate";
import SimpleCockpit from "./components/SimpleCockpit";
import pitRadio from "./utils/audioSynth";

const API_BASE = "http://localhost:8000/api";

const DEFAULT_STATE = {
  lap_number: 24,
  laps_remaining: 6,
  energy_pct: 32.0,
  energy_used_this_lap_kwh: 1.04,
  max_energy_per_lap_kwh: 4.0,
  total_energy_budget_kwh: 52.0,
  total_energy_used_kwh: 38.5,
  gap_ahead_sec: 0.38,
  gap_behind_sec: 1.8,
  tyre_wear_pct: 54.0,
  tyre_compound: "soft",
  track_position: 4,
  in_attack_mode_zone: true,
  attack_mode_available: true,
  drs_zone_ahead_m: 120,
  sector: 2,
  recent_gaps_ahead: [0.65, 0.52, 0.44, 0.40, 0.38],
  rival_driver_name: "Max Verstappen",
};

export default function App() {
  // Experience mode: "gate" (First screen seen) | "simple" (Default cockpit) | "expert" (Full telemetry)
  const [viewMode, setViewMode] = useState("gate");
  const [visitorName, setVisitorName] = useState(() => {
    try {
      return localStorage.getItem("trackshift_visitor_name") || "";
    } catch {
      return "";
    }
  });

  const [activeTab, setActiveTab] = useState("sandbox"); // "sandbox" | "simulator" | "backtest" in Expert Mode
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sandbox state
  const [sandboxState, setSandboxState] = useState(DEFAULT_STATE);
  const [strategyOutput, setStrategyOutput] = useState(null);
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState("undercut_attack");

  // Simulation state
  const [simState, setSimState] = useState(DEFAULT_STATE);
  const [simStrategy, setSimStrategy] = useState(null);
  const [simHistory, setSimHistory] = useState([]);

  // Backtest state
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState("berlin_eprix_gen3");
  const [backtestReport, setBacktestReport] = useState(null);

  // Load presets & scenarios on initial mount
  useEffect(() => {
    fetch(`${API_BASE}/presets`)
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
        if (data.length > 0) {
          setActivePresetId(data[0].id);
          setSandboxState(data[0].state);
        }
      })
      .catch((err) => console.warn("Using local presets fallback", err));

    fetch(`${API_BASE}/backtest/scenarios`)
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data.scenarios || []);
      })
      .catch((err) => console.warn("Using local scenarios fallback", err));

    // Fetch initial backtest report
    fetch(`${API_BASE}/backtest/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: "berlin_eprix_gen3" }),
    })
      .then((res) => res.json())
      .then((data) => setBacktestReport(data))
      .catch((err) => console.warn("Backtest report fetch error:", err));
  }, []);

  // Compute strategy whenever sandboxState changes (triggers 5 Red Lights sequence)
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/strategy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sandboxState),
      })
        .then((res) => res.json())
        .then((data) => {
          setStrategyOutput(data);
          // Keep lights on briefly for authentic 5-red-lights sequence
          setTimeout(() => setIsCalculating(false), 240);
        })
        .catch((err) => {
          console.error("Strategy fetch error:", err);
          setIsCalculating(false);
        });
    }, 30); // Debounce for responsive typing/sliding

    return () => clearTimeout(timer);
  }, [sandboxState]);

  // Simulation step handler
  const handleSimStep = useCallback(() => {
    setIsCalculating(true);
    fetch(`${API_BASE}/simulate/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        setSimState(data.state);
        setSimStrategy(data.strategy);
        setSimHistory((prev) => [...prev, { lap: data.state.lap_number, state: data.state, strategy: data.strategy }]);
        setTimeout(() => setIsCalculating(false), 200);
      })
      .catch((err) => {
        console.error("Sim step error:", err);
        setIsCalculating(false);
      });
  }, []);

  // Simulation reset handler
  const handleSimReset = useCallback(() => {
    fetch(`${API_BASE}/simulate/reset`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setSimState(data.state);
        setSimStrategy(data.strategy);
        setSimHistory([{ lap: data.state.lap_number, state: data.state, strategy: data.strategy }]);
      })
      .catch((err) => console.error("Sim reset error:", err));
  }, []);

  // Backtest scenario switch
  const handleSelectScenario = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    setIsCalculating(true);
    fetch(`${API_BASE}/backtest/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: scenarioId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setBacktestReport(data);
        setTimeout(() => setIsCalculating(false), 250);
      })
      .catch((err) => {
        console.error("Backtest load error:", err);
        setIsCalculating(false);
      });
  };

  // Preset selector
  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setSandboxState(preset.state);
    if (soundEnabled) {
      pitRadio.playRadioBeep();
    }
  };

  const handleResetSandbox = () => {
    setActivePresetId("undercut_attack");
    setSandboxState(DEFAULT_STATE);
  };

  // Handle entering cockpit from Landing / Gate screen
  const handleEnterCockpit = (name) => {
    setVisitorName(name);
    try {
      localStorage.setItem("trackshift_visitor_name", name);
    } catch {}
    setViewMode("simple");
  };

  const activeDisplayState = activeTab === "simulator" ? simState : sandboxState;
  const activeDisplayStrategy = activeTab === "simulator" ? simStrategy || strategyOutput : strategyOutput;

  // 1. GATE / LANDING SCREEN (First thing anyone sees)
  if (viewMode === "gate") {
    return (
      <LandingGate
        onEnterCockpit={handleEnterCockpit}
        initialName={visitorName}
      />
    );
  }

  // 2. COCKPIT (Simple View or Expert Mode)
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-asphalt)" }}>
      {/* 1. Persistent Dense F1 Timing Tower Ribbon */}
      <TimingTowerStrip raceState={activeDisplayState} isCalculating={isCalculating} />

      {/* 2. Top Pit-Wall Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onGoToGate={() => setViewMode("gate")}
      />

      {/* 3. Main Body */}
      <main style={{ flex: 1, padding: "20px 24px 40px", maxWidth: "1500px", margin: "0 auto", width: "100%" }}>
        {/* SIMPLE VIEW (Default Experience after entering) */}
        {viewMode === "simple" && (
          <SimpleCockpit
            raceState={sandboxState}
            strategyOutput={strategyOutput}
            onSwitchToExpert={() => setViewMode("expert")}
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            visitorName={visitorName}
          />
        )}

        {/* EXPERT MODE (Reveals the existing complete 3-tab dashboard) */}
        {viewMode === "expert" && (
          <>
            {/* Tab 1: Strategy Sandbox (Primary Pit-Wall Dashboard) */}
            {activeTab === "sandbox" && (
              <>
                {/* Hero Zone: ONE dominant asymmetric 60/40 recommendation panel */}
                <DecisionDisplay
                  strategyOutput={strategyOutput}
                  raceState={sandboxState}
                />

                {/* Interactive Telemetry Manipulator */}
                <StrategySandbox
                  state={sandboxState}
                  strategyOutput={strategyOutput}
                  onChangeState={(newState) => {
                    setActivePresetId(null);
                    setSandboxState(newState);
                  }}
                  presets={presets}
                  onSelectPreset={handleSelectPreset}
                  activePresetId={activePresetId}
                  onReset={handleResetSandbox}
                />

                {/* Collapsible Strategy Breakdown Accordion */}
                <AgentInspector
                  rawAgentOutputs={strategyOutput?.raw_agent_outputs}
                  scoringBreakdown={strategyOutput?.scoring_breakdown}
                  compositeScore={strategyOutput?.composite_score}
                />
              </>
            )}

            {/* Tab 2: Live Telemetry Race Simulator */}
            {activeTab === "simulator" && (
              <>
                <DecisionDisplay
                  strategyOutput={simStrategy || strategyOutput}
                  raceState={simState}
                />

                <RaceSimulator
                  simState={simState}
                  simStrategy={simStrategy}
                  onStep={handleSimStep}
                  onReset={handleSimReset}
                  history={simHistory}
                />

                <AgentInspector
                  rawAgentOutputs={(simStrategy || strategyOutput)?.raw_agent_outputs}
                  scoringBreakdown={(simStrategy || strategyOutput)?.scoring_breakdown}
                  compositeScore={(simStrategy || strategyOutput)?.composite_score}
                />
              </>
            )}

            {/* Tab 3: FastF1 Real Race Backtesting Studio */}
            {activeTab === "backtest" && (
              <BacktestStudio
                scenarios={scenarios}
                selectedScenarioId={selectedScenarioId}
                onSelectScenario={handleSelectScenario}
                backtestReport={backtestReport}
                loading={isCalculating}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
