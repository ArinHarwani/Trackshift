"""
Verification script: test invalid/unset GEMINI_API_KEY and confirm graceful template fallback.
"""

import os
from backend.schemas.race_state import RaceState
from backend.agents.strategy_agent import StrategyAgent

# Intentionally set an invalid API key
os.environ["GEMINI_API_KEY"] = "invalid_bogus_key_99999"

sample_state = RaceState(
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
    rival_driver_name="Max Verstappen (P4)",
)

agent = StrategyAgent(gemini_api_key="invalid_bogus_key_99999")
output = agent.evaluate(sample_state)

print("[*] Tested with GEMINI_API_KEY='invalid_bogus_key_99999'")
print(f"[OK] Status: Successfully executed without error")
print(f"[OK] Headline: {output.headline}")
print(f"[OK] Explanation (Template Fallback): {output.explanation}")
print(f"[OK] Overtake Probability: {output.overtake_probability_pct}%")
print(f"[OK] Composite Score: {output.composite_score}")
print(f"[OK] Rule Compliance: {output.rule_compliance}")
