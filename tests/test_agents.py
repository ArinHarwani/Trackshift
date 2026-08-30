"""
Unit and integration test suite for AI Race Strategist Copilot modules.
"""


from backend.schemas.race_state import RaceState
from backend.agents.energy_agent import EnergyAgent
from backend.agents.overtake_agent import OvertakeAgent
from backend.agents.rules_agent import RulesAgent
from backend.agents.opponent_agent import OpponentAgent
from backend.agents.strategy_agent import StrategyAgent
from backend.simulation.simulation_engine import SimulationEngine
from backend.backtesting.fastf1_backtest import BacktestingEngine


def baseline_state():
    return RaceState(
        lap_number=24,
        laps_remaining=6,
        energy_pct=32.0,
        energy_used_this_lap_kwh=0.0,
        max_energy_per_lap_kwh=4.0,
        total_energy_budget_kwh=52.0,
        total_energy_used_kwh=38.5,
        gap_ahead_sec=0.4,
        gap_behind_sec=1.8,
        tyre_wear_pct=58.0,
        tyre_compound="medium",
        track_position=5,
        in_attack_mode_zone=True,
        attack_mode_available=True,
        drs_zone_ahead_m=200,
        sector=2,
        recent_gaps_ahead=[0.7, 0.6, 0.52, 0.45, 0.40],
    )


def test_energy_agent_surplus(baseline_state):
    agent = EnergyAgent()
    out = agent.evaluate(baseline_state)
    assert out.recommended_action == "deploy"
    assert out.recommended_deploy_pct > 0.0
    assert out.risk_of_energy_shortfall == "low"
    assert out.energy_remaining_after_action_pct < baseline_state.energy_pct


def test_energy_agent_deficit():
    agent = EnergyAgent()
    deficit_state = RaceState(
        lap_number=20,
        laps_remaining=20,
        energy_pct=15.0,  # only 15% for 20 laps = severe deficit
        energy_used_this_lap_kwh=0.0,
        max_energy_per_lap_kwh=4.0,
        total_energy_budget_kwh=52.0,
        total_energy_used_kwh=40.0,
        gap_ahead_sec=1.5,
        gap_behind_sec=2.0,
        tyre_wear_pct=60.0,
        tyre_compound="medium",
        track_position=6,
        in_attack_mode_zone=False,
        attack_mode_available=False,
        drs_zone_ahead_m=500,
        sector=1,
    )
    out = agent.evaluate(deficit_state)
    assert out.recommended_action == "conserve"
    assert out.recommended_deploy_pct < 0.0
    assert out.risk_of_energy_shortfall in ["high", "medium"]


def test_overtake_agent_high_probability(baseline_state):
    agent = OvertakeAgent()
    out = agent.evaluate(baseline_state)
    assert out.overtake_recommended is True
    assert out.success_probability_pct >= 60.0
    assert out.expected_position_gain == 1
    assert out.best_window in ["this_lap", "next_2_laps"]


def test_overtake_agent_large_gap():
    agent = OvertakeAgent()
    large_gap_state = RaceState(
        lap_number=10,
        laps_remaining=30,
        energy_pct=80.0,
        energy_used_this_lap_kwh=0.0,
        max_energy_per_lap_kwh=4.0,
        total_energy_budget_kwh=52.0,
        total_energy_used_kwh=10.0,
        gap_ahead_sec=4.5,  # 4.5 seconds behind
        gap_behind_sec=3.0,
        tyre_wear_pct=20.0,
        tyre_compound="medium",
        track_position=4,
        in_attack_mode_zone=False,
        attack_mode_available=True,
        drs_zone_ahead_m=600,
        sector=1,
    )
    out = agent.evaluate(large_gap_state)
    assert out.overtake_recommended is False
    assert out.success_probability_pct < 30.0
    assert out.best_window == "not_advisable"


def test_rules_agent_compliance(baseline_state):
    agent = RulesAgent()
    out = agent.evaluate(baseline_state)
    assert out.compliant is True
    assert len(out.violations) == 0
    assert out.max_safe_deploy_this_lap_kwh > 0.0


def test_rules_agent_violation():
    agent = RulesAgent()
    breach_state = RaceState(
        lap_number=24,
        laps_remaining=6,
        energy_pct=32.0,
        energy_used_this_lap_kwh=3.85,  # Already used 3.85 of 4.0 kWh limit
        max_energy_per_lap_kwh=4.0,
        total_energy_budget_kwh=52.0,
        total_energy_used_kwh=38.5,
        gap_ahead_sec=0.4,
        gap_behind_sec=1.8,
        tyre_wear_pct=58.0,
        tyre_compound="medium",
        track_position=5,
        in_attack_mode_zone=True,
        attack_mode_available=True,
        drs_zone_ahead_m=200,
        sector=2,
    )
    energy_agent = EnergyAgent()
    energy_out = energy_agent.evaluate(breach_state)
    out = agent.evaluate(breach_state, energy_out)
    assert out.compliant is False
    assert len(out.violations) > 0


def test_opponent_agent_profiling(baseline_state):
    agent = OpponentAgent()
    out = agent.evaluate(baseline_state)
    assert out.opponent_profile in ["defensive", "aggressive", "balanced"]
    assert 0.0 <= out.profile_confidence_pct <= 100.0


def test_strategy_agent_orchestrator(baseline_state):
    agent = StrategyAgent()
    out = agent.evaluate(baseline_state)
    assert out.headline != ""
    assert out.explanation != ""
    assert 0.0 <= out.composite_score <= 1.0
    assert "energy" in out.raw_agent_outputs
    assert "overtake" in out.raw_agent_outputs
    assert "rules" in out.raw_agent_outputs
    assert "opponent" in out.raw_agent_outputs


def test_simulation_engine():
    sim = SimulationEngine(total_laps=10)
    init_state = sim.get_current_state()
    assert init_state.lap_number == 1

    next_state = sim.step(deploy_override_pct=15.0)
    assert next_state.lap_number == 2
    assert next_state.energy_pct < 100.0
    assert next_state.tyre_wear_pct > 0.0


def test_backtesting_engine():
    engine = BacktestingEngine()
    scenarios = engine.get_available_scenarios()
    assert len(scenarios) >= 3

    report = engine.run_backtest("berlin_eprix_gen3")
    assert report["total_laps_analyzed"] > 0
    assert "summary_metrics" in report
    assert len(report["lap_by_lap"]) > 0
