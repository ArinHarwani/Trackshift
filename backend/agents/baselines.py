"""
Baseline Strategies for Benchmarking & Falsifiable Proof
Implements naive reference baselines:
1. always_conserve_strategy: Zero voluntary deploy, minimal power draw, no overtakes.
2. always_attack_strategy: Max energy deploy every lap, aggressive overtakes on all gaps <= 2.0s.
"""

import math
from typing import Dict, Any
from backend.schemas.race_state import RaceState


def is_formula_e_series(state: RaceState) -> bool:
    """Detects Formula E vs Formula 1 rules context."""
    if state.in_attack_mode_zone or state.attack_mode_available:
        return True
    if hasattr(state, "rival_driver_name") and any(fe_driver in (state.rival_driver_name or "") for fe_driver in ["Mitch Evans", "Cassidy", "Wehrlein", "Dennis"]):
        return True
    return False


def always_conserve_strategy(state: RaceState) -> Dict[str, Any]:
    """
    Naive baseline: 'Always Conserve'
    Never voluntarily deploys energy; draws the minimum conservative baseline;
    never recommends an overtake attempt regardless of gap or DRS/Attack Mode.
    """
    is_fe = is_formula_e_series(state)
    deploy_pct = -22.0 if is_fe else -18.0
    nominal_kwh = state.total_energy_budget_kwh / max(1, state.lap_number + state.laps_remaining)
    expected_kwh = nominal_kwh * (0.80 + (deploy_pct / 100.0) * 0.12)

    return {
        "strategy_name": "always_conserve",
        "recommended_action": "conserve",
        "recommended_deploy_pct": deploy_pct,
        "overtake_recommended": False,
        "overtake_probability_pct": 0.0,
        "expected_kwh_draw": round(expected_kwh, 3),
        "series_type": "Formula E Gen3" if is_fe else "Formula 1",
        "rationale": "Passive conservative baseline: Zero voluntary boost deployment, 0 overtake attempts.",
    }


def always_attack_strategy(state: RaceState) -> Dict[str, Any]:
    """
    Naive baseline: 'Always Attack'
    Deploys maximum energy allowed every single lap;
    recommends an overtake attempt whenever gap_ahead_sec <= 2.0s,
    regardless of remaining battery reserve or rule limits.
    """
    is_fe = is_formula_e_series(state)
    deploy_pct = 50.0
    nominal_kwh = state.total_energy_budget_kwh / max(1, state.lap_number + state.laps_remaining)
    
    # Formula E has extra Attack Mode activation draw
    attack_mode_boost = 1.20 if (is_fe and state.in_attack_mode_zone) else 1.0
    expected_kwh = nominal_kwh * (1.10 + (deploy_pct / 100.0) * 0.40) * attack_mode_boost

    # Attempts overtake on any gap <= 2.0s
    overtake_recommended = state.gap_ahead_sec <= 2.0
    
    # Raw probability formula
    p_base = 86.0 * math.exp(-0.92 * max(0.1, state.gap_ahead_sec))
    modifiers = 12.0
    if not is_fe and state.drs_zone_ahead_m > 0 and state.gap_ahead_sec <= 1.0:
        modifiers += 10.0
    if is_fe and state.in_attack_mode_zone:
        modifiers += 15.0
    modifiers -= (state.tyre_wear_pct * 0.25)
    
    prob = max(5.0, min(95.0, round(p_base + modifiers, 1)))

    return {
        "strategy_name": "always_attack",
        "recommended_action": "deploy",
        "recommended_deploy_pct": deploy_pct,
        "overtake_recommended": overtake_recommended,
        "overtake_probability_pct": prob if overtake_recommended else 0.0,
        "expected_kwh_draw": round(expected_kwh, 3),
        "series_type": "Formula E Gen3" if is_fe else "Formula 1",
        "rationale": "Aggressive baseline: Maximum deploy (+50%) and overtake attempts on all gaps <= 2.0s.",
    }
