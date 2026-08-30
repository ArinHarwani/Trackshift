"""
Rules Agent — Module D
FIA and Formula E Technical & Sporting Regulations compliance engine.
Ensures zero regulatory violations regarding per-lap energy limits and total allocation quotas.
"""

from typing import List
from backend.schemas.race_state import RaceState, RulesAgentOutput, EnergyAgentOutput


class RulesAgent:
    def __init__(self):
        pass

    def evaluate(self, state: RaceState, energy_output: EnergyAgentOutput = None) -> RulesAgentOutput:
        """
        Validates proposed strategy and race telemetry against regulatory caps:
        - Per-lap cap: max_energy_per_lap_kwh (e.g. 4.0 kWh)
        - Total race budget: total_energy_budget_kwh (e.g. 52.0 kWh)
        """
        violations: List[str] = []

        total_budget = state.total_energy_budget_kwh
        total_used = state.total_energy_used_kwh
        per_lap_limit = state.max_energy_per_lap_kwh
        this_lap_used = state.energy_used_this_lap_kwh

        # Usable remaining total kWh
        budget_remaining_kwh = max(0.0, round(total_budget - total_used, 2))

        # Calculate proposed single-lap kWh consumption if energy agent output provided
        nominal_lap_kwh = total_budget / max(1, state.lap_number + state.laps_remaining)
        deploy_pct = energy_output.recommended_deploy_pct if energy_output else 0.0
        proposed_lap_draw_kwh = nominal_lap_kwh * (1.0 + (deploy_pct / 100.0))

        # Check 1: Single lap limit breach (Demo limit: max_energy_per_lap_kwh)
        if (this_lap_used + proposed_lap_draw_kwh) > per_lap_limit:
            excess = (this_lap_used + proposed_lap_draw_kwh) - per_lap_limit
            violations.append(
                f"PER-LAP ENERGY CAP (Demo Limit {per_lap_limit:.1f} kWh): Proposed draw of {proposed_lap_draw_kwh + this_lap_used:.2f} kWh "
                f"exceeds the max per-lap threshold (excess: +{excess:.2f} kWh). "
                f"Risk of time penalty or power throttle."
            )

        # Check 2: Total budget exhaustion breach (Demo limit: total_energy_budget_kwh)
        if proposed_lap_draw_kwh > budget_remaining_kwh:
            shortage = proposed_lap_draw_kwh - budget_remaining_kwh
            violations.append(
                f"TOTAL ALLOCATION OVERDRAW (Demo Limit {total_budget:.1f} kWh): Projected usage exceeds remaining allocation "
                f"({budget_remaining_kwh:.2f} kWh remaining, requested {proposed_lap_draw_kwh:.2f} kWh). "
                f"Immediate power cutoff risk."
            )

        # Max safe deploy calculation
        remaining_in_lap = max(0.0, per_lap_limit - this_lap_used)
        max_safe_deploy = round(min(remaining_in_lap, budget_remaining_kwh), 2)

        compliant = len(violations) == 0

        return RulesAgentOutput(
            compliant=compliant,
            violations=violations,
            energy_budget_remaining_kwh=budget_remaining_kwh,
            max_safe_deploy_this_lap_kwh=max_safe_deploy,
            per_lap_limit_kwh=per_lap_limit,
        )
