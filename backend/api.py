"""
FastAPI Backend API — Module I
Exposes the AI Race Strategist Copilot multi-agent decision engine,
interactive Strategy Sandbox recomputation endpoints, simulation runner,
and FastF1 historical backtesting engine.
"""

import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.schemas.race_state import (
    RaceState,
    StrategyAgentOutput,
)
from backend.agents.strategy_agent import StrategyAgent
from backend.simulation.simulation_engine import SimulationEngine
from backend.backtesting.fastf1_backtest import BacktestingEngine

app = FastAPI(
    title="AI Race Strategist Copilot API",
    description="Deterministic Multi-Agent Pit-Wall Decision Engine for Formula E & F1",
    version="1.0.0",
)

# Enable CORS for React frontend (Vite default: http://localhost:5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global singleton instances
strategy_agent = StrategyAgent()
simulation_engine = SimulationEngine()
backtesting_engine = BacktestingEngine()


class InitSimRequest(BaseModel):
    track_name: str = "Monza E-Prix"
    total_laps: int = 50
    starting_pos: int = 5


class StepSimRequest(BaseModel):
    deploy_override_pct: Optional[float] = None


class OverrideStateRequest(BaseModel):
    state_overrides: Dict[str, Any]


class BacktestRunRequest(BaseModel):
    scenario_id: Optional[str] = "berlin_eprix_gen3"
    race: Optional[str] = None


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Race Strategist Copilot",
        "version": "1.0.0",
        "llm_provider": "Gemini 2.5 (High) / Zero-latency Template Engine",
        "math_engine": "Deterministic Multi-Agent Core",
    }


@app.post("/api/strategy", response_model=StrategyAgentOutput)
def evaluate_strategy(state: RaceState):
    """
    Main real-time pit wall decision endpoint:
    Accepts arbitrary RaceState and returns StrategyAgentOutput in < 50ms.
    """
    try:
        recommendation = strategy_agent.evaluate(state)
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Strategy calculation error: {str(e)}")


@app.post("/api/simulate/init")
def init_simulation(req: InitSimRequest):
    """Initializes a new race simulation."""
    simulation_engine.reset(
        track_name=req.track_name,
        total_laps=req.total_laps,
        starting_pos=req.starting_pos,
    )
    current_state = simulation_engine.get_current_state()
    strategy = strategy_agent.evaluate(current_state)
    return {
        "track_name": simulation_engine.track_name,
        "state": current_state.model_dump(),
        "strategy": strategy.model_dump(),
    }


@app.post("/api/simulate/step")
def step_simulation(req: StepSimRequest = StepSimRequest()):
    """Advances simulation by 1 lap and computes updated strategy."""
    state = simulation_engine.step(deploy_override_pct=req.deploy_override_pct)
    strategy = strategy_agent.evaluate(state)
    return {
        "state": state.model_dump(),
        "strategy": strategy.model_dump(),
    }


@app.post("/api/simulate/reset")
def reset_simulation():
    """Resets simulation back to Lap 1."""
    simulation_engine.reset()
    state = simulation_engine.get_current_state()
    strategy = strategy_agent.evaluate(state)
    return {
        "state": state.model_dump(),
        "strategy": strategy.model_dump(),
    }


@app.post("/api/simulate/override")
def override_simulation_state(req: OverrideStateRequest):
    """Applies direct parameter overrides for the Strategy Sandbox."""
    state = simulation_engine.override_state(req.state_overrides)
    strategy = strategy_agent.evaluate(state)
    return {
        "state": state.model_dump(),
        "strategy": strategy.model_dump(),
    }


@app.get("/api/simulate/state")
def get_simulation_state():
    """Returns current active simulation state."""
    state = simulation_engine.get_current_state()
    strategy = strategy_agent.evaluate(state)
    return {
        "state": state.model_dump(),
        "strategy": strategy.model_dump(),
    }


@app.get("/api/backtest/scenarios")
def list_backtest_scenarios():
    """Lists available historical race replay scenarios."""
    return {"scenarios": backtesting_engine.get_available_scenarios()}


@app.post("/api/backtest/run")
def run_backtest(req: BacktestRunRequest):
    """Executes full historical race backtest."""
    try:
        report = backtesting_engine.run_backtest(scenario_id=req.scenario_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest execution failed: {str(e)}")


@app.post("/api/backtest/compare-baselines")
@app.post("/backtest/compare-baselines")
def compare_baselines(req: BacktestRunRequest = BacktestRunRequest()):
    """
    Executes 3-way head-to-head baseline comparison:
    TrackShift Copilot vs Always Conserve vs Always Attack on historical FastF1 session data.
    """
    try:
        target = req.race or req.scenario_id or "monza"
        comparison_report = backtesting_engine.run_baseline_comparison(scenario_id=target)
        return comparison_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Baseline comparison failed: {str(e)}")


@app.get("/api/backtest/baselines-summary")
def get_all_baselines_summary():
    """
    Returns 3-way head-to-head scorecard across all 3 historical backtests:
    Monza (F1), Silverstone (F1), Berlin Tempelhof (Formula E Gen3) + combined cross-circuit averages.
    """
    try:
        summary_report = backtesting_engine.run_all_scenarios_comparison()
        return summary_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Baselines summary failed: {str(e)}")


@app.get("/api/presets")
def get_sandbox_presets():
    """Pre-configured tactical scenarios for quick judge demonstration."""
    return [
        {
            "id": "undercut_attack",
            "name": "Scenario 1: Attack Mode Overdrive & Pass",
            "badge": "ATTACK WINDOW",
            "description": "Gap is 0.35s with DRS active and healthy +18% energy reserve. Overtake probability peaks at 82%.",
            "state": {
                "lap_number": 24,
                "laps_remaining": 6,
                "energy_pct": 32.0,
                "energy_used_this_lap_kwh": 0.0,
                "max_energy_per_lap_kwh": 4.0,
                "total_energy_budget_kwh": 52.0,
                "total_energy_used_kwh": 38.5,
                "gap_ahead_sec": 0.35,
                "gap_behind_sec": 1.8,
                "tyre_wear_pct": 52.0,
                "tyre_compound": "soft",
                "track_position": 4,
                "in_attack_mode_zone": True,
                "attack_mode_available": True,
                "drs_zone_ahead_m": 120,
                "sector": 2,
                "recent_gaps_ahead": [0.65, 0.52, 0.44, 0.38, 0.35],
                "rival_driver_name": "Max Verstappen",
            },
        },
        {
            "id": "energy_crisis_lift_coast",
            "name": "Scenario 2: Critical Energy Deficit — Lift & Coast",
            "badge": "ENERGY CRISIS",
            "description": "Remaining energy (14%) cannot cover 10 remaining laps without mandatory 16% lift-and-coast.",
            "state": {
                "lap_number": 35,
                "laps_remaining": 10,
                "energy_pct": 14.0,
                "energy_used_this_lap_kwh": 0.0,
                "max_energy_per_lap_kwh": 4.0,
                "total_energy_budget_kwh": 52.0,
                "total_energy_used_kwh": 44.5,
                "gap_ahead_sec": 1.45,
                "gap_behind_sec": 2.8,
                "tyre_wear_pct": 74.0,
                "tyre_compound": "hard",
                "track_position": 3,
                "in_attack_mode_zone": False,
                "attack_mode_available": False,
                "drs_zone_ahead_m": 600,
                "sector": 1,
                "recent_gaps_ahead": [1.2, 1.3, 1.35, 1.4, 1.45],
                "rival_driver_name": "Charles Leclerc",
            },
        },
        {
            "id": "drs_train_defense",
            "name": "Scenario 3: DRS Train & P3 Defense",
            "badge": "DEFENSE MODE",
            "description": "Chaser is 0.4s behind while car ahead is 0.8s. Balanced tactical deployment to prevent being passed.",
            "state": {
                "lap_number": 18,
                "laps_remaining": 22,
                "energy_pct": 58.0,
                "energy_used_this_lap_kwh": 0.0,
                "max_energy_per_lap_kwh": 4.0,
                "total_energy_budget_kwh": 52.0,
                "total_energy_used_kwh": 21.0,
                "gap_ahead_sec": 0.85,
                "gap_behind_sec": 0.42,
                "tyre_wear_pct": 38.0,
                "tyre_compound": "medium",
                "track_position": 3,
                "in_attack_mode_zone": False,
                "attack_mode_available": True,
                "drs_zone_ahead_m": 250,
                "sector": 2,
                "recent_gaps_ahead": [0.88, 0.86, 0.85, 0.85, 0.85],
                "rival_driver_name": "Lando Norris",
            },
        },
        {
            "id": "final_lap_podium_shootout",
            "name": "Scenario 4: Final Lap Podium Shootout",
            "badge": "FINAL LAP",
            "description": "Lap 49/50 with 1 lap remaining. Max dump of all remaining kWh reserve into the final sector.",
            "state": {
                "lap_number": 49,
                "laps_remaining": 1,
                "energy_pct": 6.5,
                "energy_used_this_lap_kwh": 0.0,
                "max_energy_per_lap_kwh": 4.0,
                "total_energy_budget_kwh": 52.0,
                "total_energy_used_kwh": 48.6,
                "gap_ahead_sec": 0.28,
                "gap_behind_sec": 3.2,
                "tyre_wear_pct": 82.0,
                "tyre_compound": "soft",
                "track_position": 2,
                "in_attack_mode_zone": True,
                "attack_mode_available": True,
                "drs_zone_ahead_m": 80,
                "sector": 3,
                "recent_gaps_ahead": [0.55, 0.48, 0.39, 0.32, 0.28],
                "rival_driver_name": "Lewis Hamilton",
            },
        },
        {
            "id": "fia_rule_violation_prevention",
            "name": "Scenario 5: FIA Energy Cap Breach Prevention",
            "badge": "RULE ENFORCEMENT",
            "description": "Car has already consumed 3.7 kWh this lap. Any deploy > 0.3 kWh will breach Article 34.2.",
            "state": {
                "lap_number": 30,
                "laps_remaining": 15,
                "energy_pct": 28.0,
                "energy_used_this_lap_kwh": 3.75,
                "max_energy_per_lap_kwh": 4.0,
                "total_energy_budget_kwh": 52.0,
                "total_energy_used_kwh": 40.0,
                "gap_ahead_sec": 0.30,
                "gap_behind_sec": 2.0,
                "tyre_wear_pct": 60.0,
                "tyre_compound": "medium",
                "track_position": 5,
                "in_attack_mode_zone": False,
                "attack_mode_available": True,
                "drs_zone_ahead_m": 150,
                "sector": 3,
                "recent_gaps_ahead": [0.45, 0.40, 0.35, 0.32, 0.30],
                "rival_driver_name": "George Russell",
            },
        },
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=True)
