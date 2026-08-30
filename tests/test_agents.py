"""
Unit and integration test suite for AI Race Strategist Copilot modules.
Runs individual test cases with granular timing and verification assertions.
"""

import time
import unittest
from backend.schemas.race_state import RaceState
from backend.agents.energy_agent import EnergyAgent
from backend.agents.overtake_agent import OvertakeAgent
from backend.agents.rules_agent import RulesAgent
from backend.agents.opponent_agent import OpponentAgent
from backend.agents.strategy_agent import StrategyAgent
from backend.simulation.simulation_engine import SimulationEngine
from backend.backtesting.fastf1_backtest import BacktestingEngine


class TestTrackShiftCopilot(unittest.TestCase):
    def setUp(self):
        self.startTime = time.time()
        self.baseline_state = RaceState(
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

    def tearDown(self):
        t = time.time() - self.startTime
        print(f" [Time: {t*1000:.2f}ms]", end="")

    def test_01_energy_agent_surplus_and_bounds(self):
        """Test Energy Agent with energy surplus: recommends deploy, verifies energy remaining bounds."""
        agent = EnergyAgent()
        out = agent.evaluate(self.baseline_state)
        self.assertEqual(out.recommended_action, "deploy")
        self.assertGreater(out.recommended_deploy_pct, 0.0)
        self.assertEqual(out.risk_of_energy_shortfall, "low")
        self.assertLess(out.energy_remaining_after_action_pct, self.baseline_state.energy_pct)
        self.assertGreaterEqual(out.energy_remaining_after_action_pct, 0.0)

    def test_02_energy_agent_deficit_and_lift_coast(self):
        """Test Energy Agent with severe deficit: forces lift-and-coast conservation."""
        agent = EnergyAgent()
        deficit_state = RaceState(
            lap_number=20,
            laps_remaining=20,
            energy_pct=15.0,  # 15% energy for 20 laps = deficit
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
        self.assertEqual(out.recommended_action, "conserve")
        self.assertLess(out.recommended_deploy_pct, 0.0)
        self.assertIn(out.risk_of_energy_shortfall, ["high", "medium"])
        self.assertGreaterEqual(out.energy_remaining_after_action_pct, 0.0)

    def test_03_energy_agent_determinism(self):
        """Test Energy Agent determinism: identical inputs produce strictly identical outputs."""
        agent = EnergyAgent()
        out1 = agent.evaluate(self.baseline_state)
        out2 = agent.evaluate(self.baseline_state)
        self.assertEqual(out1.model_dump(), out2.model_dump())

    def test_04_overtake_agent_close_gap_high_prob(self):
        """Test Overtake Agent with 0.4s gap + DRS: high probability, positive gain."""
        agent = OvertakeAgent()
        out = agent.evaluate(self.baseline_state)
        self.assertTrue(out.overtake_recommended)
        self.assertGreaterEqual(out.success_probability_pct, 60.0)
        self.assertLessEqual(out.success_probability_pct, 100.0)
        self.assertEqual(out.expected_position_gain, 1)
        self.assertIn(out.best_window, ["this_lap", "next_2_laps"])

    def test_05_overtake_agent_large_gap_clamping(self):
        """Test Overtake Agent with 5.0s gap: clamps sensibly, rejects overtake."""
        agent = OvertakeAgent()
        large_gap_state = RaceState(
            lap_number=10,
            laps_remaining=30,
            energy_pct=80.0,
            energy_used_this_lap_kwh=0.0,
            max_energy_per_lap_kwh=4.0,
            total_energy_budget_kwh=52.0,
            total_energy_used_kwh=10.0,
            gap_ahead_sec=5.0,  # 5.0s clean air gap
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
        self.assertFalse(out.overtake_recommended)
        self.assertLess(out.success_probability_pct, 25.0)
        self.assertGreaterEqual(out.success_probability_pct, 0.0)
        self.assertEqual(out.best_window, "not_advisable")

    def test_06_rules_agent_compliance_and_headroom(self):
        """Test Rules Agent: compliant under standard draw, returns positive safe deploy headroom."""
        agent = RulesAgent()
        out = agent.evaluate(self.baseline_state)
        self.assertTrue(out.compliant)
        self.assertEqual(len(out.violations), 0)
        self.assertGreater(out.max_safe_deploy_this_lap_kwh, 0.0)

    def test_07_rules_agent_detects_lap_cap_violation(self):
        """Test Rules Agent: detects when lap draw would exceed the regulated per-lap cap."""
        agent = RulesAgent()
        breach_state = RaceState(
            lap_number=24,
            laps_remaining=6,
            energy_pct=32.0,
            energy_used_this_lap_kwh=3.85,  # 3.85 used out of 4.0 cap
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
        self.assertFalse(out.compliant)
        self.assertGreater(len(out.violations), 0)

    def test_08_opponent_agent_defensive_vs_aggressive(self):
        """Test Opponent Agent: correctly classifies defensive vs aggressive from gap sequences."""
        agent = OpponentAgent()
        # Defensive: low variance, consistent gap
        defensive_state = RaceState(
            lap_number=15,
            laps_remaining=15,
            energy_pct=50.0,
            energy_used_this_lap_kwh=0.0,
            max_energy_per_lap_kwh=4.0,
            total_energy_budget_kwh=52.0,
            total_energy_used_kwh=26.0,
            gap_ahead_sec=0.42,
            gap_behind_sec=2.0,
            tyre_wear_pct=40.0,
            tyre_compound="medium",
            track_position=3,
            in_attack_mode_zone=False,
            attack_mode_available=True,
            drs_zone_ahead_m=300,
            sector=1,
            recent_gaps_ahead=[0.44, 0.43, 0.42, 0.42, 0.42],  # Very low variance, tight holding
        )
        out_def = agent.evaluate(defensive_state)
        self.assertEqual(out_def.opponent_profile, "defensive")
        self.assertGreaterEqual(out_def.profile_confidence_pct, 70.0)

        # Aggressive: high variance, erratic deployment spikes
        aggressive_state = RaceState(
            lap_number=15,
            laps_remaining=15,
            energy_pct=50.0,
            energy_used_this_lap_kwh=0.0,
            max_energy_per_lap_kwh=4.0,
            total_energy_budget_kwh=52.0,
            total_energy_used_kwh=26.0,
            gap_ahead_sec=0.85,
            gap_behind_sec=2.0,
            tyre_wear_pct=40.0,
            tyre_compound="medium",
            track_position=3,
            in_attack_mode_zone=False,
            attack_mode_available=True,
            drs_zone_ahead_m=300,
            sector=1,
            recent_gaps_ahead=[1.40, 0.60, 1.25, 0.45, 0.85],  # Erratic swings > 0.4s
        )
        out_agg = agent.evaluate(aggressive_state)
        self.assertEqual(out_agg.opponent_profile, "aggressive")

    def test_09_strategy_orchestrator_composite_score(self):
        """Test Strategy Agent: orchestrates all 4 agents and computes composite score bounded 0 to 1."""
        agent = StrategyAgent()
        out = agent.evaluate(self.baseline_state)
        self.assertIsNotNone(out.headline)
        self.assertIsNotNone(out.explanation)
        self.assertGreaterEqual(out.composite_score, 0.0)
        self.assertLessEqual(out.composite_score, 1.0)
        self.assertIn("energy", out.raw_agent_outputs)
        self.assertIn("overtake", out.raw_agent_outputs)
        self.assertIn("rules", out.raw_agent_outputs)
        self.assertIn("opponent", out.raw_agent_outputs)

    def test_10_simulation_engine_physical_consistency(self):
        """Test Simulation Engine: energy decreases, tyre wear increases monotonically, no negative values."""
        sim = SimulationEngine(total_laps=10)
        prev_state = sim.get_current_state()
        for _ in range(5):
            curr_state = sim.step(deploy_override_pct=10.0)
            self.assertLessEqual(curr_state.energy_pct, prev_state.energy_pct)
            self.assertGreaterEqual(curr_state.energy_pct, 0.0)
            self.assertGreaterEqual(curr_state.tyre_wear_pct, prev_state.tyre_wear_pct)
            self.assertLessEqual(curr_state.tyre_wear_pct, 100.0)
            prev_state = curr_state

    def test_11_baseline_comparison_monza(self):
        """Test Baseline Comparison on Monza: Copilot outperforms Always-Conserve and Always-Attack."""
        engine = BacktestingEngine()
        comparison = engine.run_baseline_comparison("monza")
        
        # Verify top-level spec keys
        self.assertEqual(comparison["race"], "monza")
        self.assertIn("strategies", comparison)
        self.assertIn("ai_system", comparison["strategies"])
        self.assertIn("always_conserve", comparison["strategies"])
        self.assertIn("always_attack", comparison["strategies"])

        ai = comparison["strategies"]["ai_system"]
        conserve = comparison["strategies"]["always_conserve"]
        attack = comparison["strategies"]["always_attack"]

        # Copilot gains position and has 0 rule violations
        self.assertEqual(ai["violations"], 0)
        self.assertGreaterEqual(ai["position_delta"], 0)
        self.assertGreater(ai["energy_remaining_pct"], 3)

        # Conserve gains 0 positions and leaves high unused energy
        self.assertEqual(conserve["violations"], 0)
        self.assertEqual(conserve["attempts"], 0)
        self.assertGreater(conserve["energy_remaining_pct"], ai["energy_remaining_pct"])

        # Attack accumulates rule violations and finishes worse or depleted
        self.assertGreater(attack["violations"], 0)
        self.assertLess(attack["energy_remaining_pct"], ai["energy_remaining_pct"])

    def test_12_all_baselines_summary_cross_circuit(self):
        """Test 3-Circuit Baseline Summary across Monza, Silverstone, and Berlin."""
        engine = BacktestingEngine()
        summary = engine.run_all_scenarios_comparison()
        
        self.assertEqual(len(summary["per_circuit_reports"]), 3)
        cross = summary["cross_circuit_summary"]
        
        # Copilot has 0 total violations across all 3 races
        self.assertEqual(cross["copilot"]["total_rule_violations"], 0)
        # Copilot average net delta is higher than both naive baselines
        self.assertGreater(cross["copilot"]["avg_net_position_delta"], cross["always_conserve"]["avg_net_position_delta"])
        self.assertGreater(cross["copilot"]["avg_net_position_delta"], cross["always_attack"]["avg_net_position_delta"])

    def test_13_baseline_functions_berlin_formula_e(self):
        """Test baseline strategy functions on Berlin Formula E state."""
        from backend.agents.baselines import always_conserve_strategy, always_attack_strategy
        state_fe = RaceState(
            lap_number=10,
            laps_remaining=30,
            energy_pct=75.0,
            energy_used_this_lap_kwh=1.0,
            max_energy_per_lap_kwh=4.0,
            total_energy_budget_kwh=52.0,
            total_energy_used_kwh=12.0,
            gap_ahead_sec=0.45,
            gap_behind_sec=1.5,
            tyre_wear_pct=25.0,
            tyre_compound="medium",
            track_position=3,
            in_attack_mode_zone=True,
            attack_mode_available=True,
            drs_zone_ahead_m=0,
            sector=2,
            recent_gaps_ahead=[0.6, 0.5, 0.45],
            rival_driver_name="Mitch Evans (P2)",
        )
        conserve_out = always_conserve_strategy(state_fe)
        self.assertEqual(conserve_out["recommended_action"], "conserve")
        self.assertFalse(conserve_out["overtake_recommended"])
        self.assertEqual(conserve_out["series_type"], "Formula E Gen3")

        attack_out = always_attack_strategy(state_fe)
        self.assertEqual(attack_out["recommended_action"], "deploy")
        self.assertTrue(attack_out["overtake_recommended"])
        self.assertEqual(attack_out["series_type"], "Formula E Gen3")
        self.assertGreater(attack_out["expected_kwh_draw"], conserve_out["expected_kwh_draw"])


if __name__ == "__main__":
    unittest.main(verbosity=2)

