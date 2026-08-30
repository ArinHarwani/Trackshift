"""
Diagnostics script to inspect the exact agent decisions across all laps in the backtest.
"""

from backend.backtesting.fastf1_backtest import BacktestingEngine
from backend.schemas.race_state import RaceState

engine = BacktestingEngine()

for sc_id in ["berlin_eprix_gen3", "monza_2023_battle"]:
    report = engine.run_backtest(sc_id)
    print(f"\n================ SCENARIO: {sc_id} ================")
    print("Summary Metrics:", report["summary_metrics"])
    actions = [lap["recommendation"]["raw_agent_outputs"]["energy"]["recommended_action"] for lap in report["lap_by_lap"]]
    from collections import Counter
    print("Energy Actions Count:", Counter(actions))
    for lap in report["lap_by_lap"][:15]:
        rec = lap["recommendation"]
        e = rec["raw_agent_outputs"]["energy"]
        print(f"Lap {lap['lap']:2d} | Energy%: {lap['state']['energy_pct']:5.1f}% | Margin: {e['rationale_data']['energy_margin_pct']:+5.1f}% | Action: {e['recommended_action']:8s} | Deploy%: {e['recommended_deploy_pct']:+5.1f}%")
