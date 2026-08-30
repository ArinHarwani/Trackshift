import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import LiveHUD from "./components/LiveHUD";
import DecisionDisplay from "./components/DecisionDisplay";
import StrategySandbox from "./components/StrategySandbox";
import AgentInspector from "./components/AgentInspector";
import RaceSimulator from "./components/RaceSimulator";
import BacktestStudio from "./components/BacktestStudio";
import { pitRadio } from "./utils/audioSynth";

const API_BASE = "http://localhost:8000/api";

const DEFAULT_STATE = {
  lap_number: 24,
  laps_remaining: 6,
  energy_pct: 32.0,
  energy_used_this_lap_kwh: 0.0,
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
  recent_gaps_ahead: [0.65, 0.52, 0.44, 0.38],
  rival_driver_name: "Max Verstappen (P3)",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("sandbox"); // "sandbox" | "simulator" | "backtest"
  const [trackName, setTrackName] = useState("Monza E-Prix");
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Compute strategy whenever sandboxState changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/strategy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sandboxState),
      })
        .then((res) => res.json())
        .then((data) => setStrategyOutput(data))
        .catch((err) => console.error("Strategy fetch error:", err));
    }, 10); // 10ms debounce for ultra-responsive feel

    return () => clearTimeout(timer);
  }, [sandboxState]);

  // Simulation step handler
  const handleSimStep = useCallback(() => {
    fetch(`${API_BASE}/simulate/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        setSimState(data.state);
        setSimStrategy(data.strategy);
        setSimHistory((prev) => [...prev, data.state]);
      })
      .catch((err) => console.error("Sim step error:", err));
  }, []);

  // Simulation reset handler
  const handleSimReset = useCallback(() => {
    fetch(`${API_BASE}/simulate/reset`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setSimState(data.state);
        setSimStrategy(data.strategy);
        setSimHistory([data.state]);
      })
      .catch((err) => console.error("Sim reset error:", err));
  }, []);

  // Backtest scenario switch
  const handleSelectScenario = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    fetch(`${API_BASE}/backtest/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: scenarioId }),
    })
      .then((res) => res.json())
      .then((data) => setBacktestReport(data))
      .catch((err) => console.error("Backtest load error:", err));
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

  const activeDisplayState = activeTab === "simulator" ? simState : sandboxState;
  const activeDisplayStrategy = activeTab === "simulator" ? simStrategy || strategyOutput : strategyOutput;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trackName={trackName}
        setTrackName={setTrackName}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        ruleStatus={activeDisplayStrategy?.rule_compliance || "verified"}
      />

      {/* Main Pit-Wall Dashboard Body */}
      <main style={{ flex: 1, padding: "0 20px 30px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
        {/* Cockpit Gauges & Telemetry Bar */}
        <LiveHUD
          state={activeDisplayState}
          energyAgentOut={activeDisplayStrategy?.raw_agent_outputs?.energy}
          overtakeAgentOut={activeDisplayStrategy?.raw_agent_outputs?.overtake}
        />

        {/* Primary Strategy Orchestrator Callout */}
        <DecisionDisplay
          strategy={activeDisplayStrategy}
          onPlayAudio={() => {
            if (activeDisplayStrategy) {
              pitRadio.speak(activeDisplayStrategy.headline + ". " + activeDisplayStrategy.explanation);
            }
          }}
        />

        {/* Tab 1: Strategy Sandbox (Judges' Primary Playground) */}
        {activeTab === "sandbox" && (
          <>
            <StrategySandbox
              state={sandboxState}
              onChangeState={(newState) => {
                setActivePresetId(null);
                setSandboxState(newState);
              }}
              presets={presets}
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
              onReset={handleResetSandbox}
            />

            {/* Agent Deep-Dive Reasoning Inspector */}
            <AgentInspector rawOutputs={activeDisplayStrategy?.raw_agent_outputs} />
          </>
        )}

        {/* Tab 2: Live Telemetry Race Simulator */}
        {activeTab === "simulator" && (
          <>
            <RaceSimulator
              simState={simState}
              simStrategy={simStrategy}
              onStep={handleSimStep}
              onReset={handleSimReset}
              history={simHistory}
            />

            <AgentInspector rawOutputs={activeDisplayStrategy?.raw_agent_outputs} />
          </>
        )}

        {/* Tab 3: FastF1 Real Race Backtesting Studio */}
        {activeTab === "backtest" && (
          <BacktestStudio
            scenarios={scenarios}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={handleSelectScenario}
            backtestReport={backtestReport}
          />
        )}
      </main>
    </div>
  );
}
