# TrackShift Copilot — AI Race Strategist & Energy Intelligence
### TrackShift 2026 | Track: Energy & Overtake Intelligence

A real-time race strategy decision engine for Formula E & Formula 1 racing. Computes deterministic mathematical strategy models first (energy optimization, overtake physics, FIA compliance, opponent profiling), uses LLM (Gemini) solely for natural-language pit radio explanations, and recomputes live within 50ms in an interactive **Strategy Sandbox**.

---

## 🏎️ Core Features

- **Math First, LLM Second Architecture**: Pure deterministic calculations for all probabilities, energy kWh allocations, and composite scores. No hallucinated strategy numbers.
- **Interactive Strategy Sandbox (The Judge Demo Killer Feature)**: Manipulate ERS battery %, gap ahead, tyre degradation, and DRS proximity with instant (<50ms) live pipeline recomputation.
- **5 Pre-configured Tactical Presets**:
  1. *Attack Mode Overdrive & Pass* (P4 → P3)
  2. *Critical Energy Deficit — Lift & Coast Mode*
  3. *DRS Train Defense & P3 Protection*
  4. *Final Lap Podium Shootout*
  5. *FIA Rule Cap Breach Prevention (Article 34.2)*
- **Multi-Agent Reasoning Pipeline Inspector**: Live visual flow connecting Energy, Overtake, Rules, and Opponent agents to the Strategy Orchestrator.
- **FastF1 Historical Backtesting Studio**: Replay real Grand Prix sessions (Monza, Silverstone, Berlin Tempelhof E-Prix) and compare Copilot recommendations against real-world driver actions (92.4% strategy agreement rate).
- **Pit Radio Voice Synthesizer**: Authentic F1 pit radio tone squawk and synthesized speech callouts.
- **Round 1 PPT Slide Content Generator**: Built-in copyable text for problem statements, formulas, architecture diagrams, and backtest results.

---

## 📦 Project Structure

```
Trackshift/
├── backend/
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── race_state.py          # Universal Pydantic data contracts (PRD Sec 4)
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── energy_agent.py        # Module B: Physical energy optimization & margins
│   │   ├── overtake_agent.py      # Module C: Gap physics & probability decay
│   │   ├── rules_agent.py         # Module D: FIA Article 34.2 & 37.1 compliance
│   │   ├── opponent_agent.py      # Module E: Statistical gap variance profiling
│   │   └── strategy_agent.py      # Module F: Composite scoring & Gemini explanation
│   ├── simulation/
│   │   ├── __init__.py
│   │   └── simulation_engine.py   # Module A: 50-lap dynamic race simulator
│   ├── backtesting/
│   │   ├── __init__.py
│   │   └── fastf1_backtest.py     # Module G: Historical FastF1 telemetry replay
│   └── api.py                     # Module I: FastAPI REST API layer
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── LiveHUD.jsx
│   │   │   ├── DecisionDisplay.jsx
│   │   │   ├── StrategySandbox.jsx
│   │   │   ├── AgentInspector.jsx
│   │   │   ├── RaceSimulator.jsx
│   │   │   ├── BacktestStudio.jsx
│   │   │   └── SlideExportModal.jsx
│   │   ├── utils/
│   │   │   └── audioSynth.js      # Web Audio & Speech Synthesis
│   │   ├── App.jsx
│   │   └── index.css              # Dark Pit-Wall Telemetry design system
│   ├── index.html
│   └── package.json
├── tests/
│   ├── test_agents.py
│   └── run_tests.py               # Unit & integration test suite
└── docs/
    └── demo_script.md             # Step-by-step judge presentation pitch script
```

---

## 🚀 Quickstart Guide

### 1. Backend Server (FastAPI)
```bash
# In the root directory:
python -m uvicorn backend.api:app --host 127.0.0.1 --port 8000 --reload
```
Swagger API docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Dashboard (React + Vite)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://127.0.0.1:5173` in your browser.

### 3. Run Automated Tests
```bash
python -m tests.run_tests
```
