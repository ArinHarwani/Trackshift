import unittest
from tests.test_agents import (
    baseline_state,
    test_energy_agent_surplus,
    test_energy_agent_deficit,
    test_overtake_agent_high_probability,
    test_overtake_agent_large_gap,
    test_rules_agent_compliance,
    test_rules_agent_violation,
    test_opponent_agent_profiling,
    test_strategy_agent_orchestrator,
    test_simulation_engine,
    test_backtesting_engine,
)

class TestRaceStrategist(unittest.TestCase):
    def setUp(self):
        self.state = baseline_state()

    def test_all(self):
        test_energy_agent_surplus(self.state)
        test_energy_agent_deficit()
        test_overtake_agent_high_probability(self.state)
        test_overtake_agent_large_gap()
        test_rules_agent_compliance(self.state)
        test_rules_agent_violation()
        test_opponent_agent_profiling(self.state)
        test_strategy_agent_orchestrator(self.state)
        test_simulation_engine()
        test_backtesting_engine()
        print("ALL 10 UNIT AND INTEGRATION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    unittest.main()
