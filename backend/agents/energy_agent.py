"""
Energy Agent — Module B
Deterministic mathematical optimization of battery/energy deployment and conservation.
Ensures zero hallucination, strict compliance with physical reserve limits, and explainable formulas.
"""

from backend.schemas.race_state import RaceState, EnergyAgentOutput, EnergyAgentRationale


class EnergyAgent:
    def __init__(self):
        pass

    def evaluate(self, state: RaceState) -> EnergyAgentOutput:
        """
        Calculates energy strategy deterministically from RaceState:
        - target_kwh_per_lap = usable_energy_kwh / max(1, laps_remaining)
        - nominal_kwh_per_lap = baseline consumption required to finish
        - energy_margin_pct = ((target - nominal) / nominal) * 100
        """
        laps_left = max(1, state.laps_remaining)
        total_laps = max(1, state.lap_number + state.laps_remaining)

        # Usable remaining energy in kWh based on current energy_pct and total budget
        usable_energy_kwh = state.total_energy_budget_kwh * (state.energy_pct / 100.0)

        # Baseline nominal consumption required per lap across full race
        nominal_kwh_per_lap = state.total_energy_budget_kwh / total_laps

        # Available target rate per remaining lap
        target_kwh_per_lap = usable_energy_kwh / laps_left

        # Energy margin in percentage (+ surplus, - deficit)
        energy_margin_pct = ((target_kwh_per_lap - nominal_kwh_per_lap) / nominal_kwh_per_lap) * 100.0

        # Laps of reserve at nominal baseline burn rate
        laps_of_reserve = usable_energy_kwh / max(0.05, nominal_kwh_per_lap)

        # Determine shortfall risk
        if laps_of_reserve < laps_left * 0.88 or state.energy_pct < (laps_left * (100.0 / total_laps) * 0.85):
            risk = "high"
        elif laps_of_reserve < laps_left * 1.05:
            risk = "medium"
        else:
            risk = "low"

        # Determine action & deploy %
        if risk == "high" or energy_margin_pct < -2.5:
            recommended_action = "conserve"
            # Lift and coast severity
            deploy_pct = max(-25.0, round(-6.0 + (energy_margin_pct * 0.7), 1))
            reason_code = "energy_deficit_requires_lift_and_coast"
            details = (
                f"Energy deficit of {abs(energy_margin_pct):.1f}% vs target. "
                f"Laps of reserve ({laps_of_reserve:.1f}) is below remaining laps ({laps_left}). "
                f"Mandatory lift-and-coast recommended to preserve delta."
            )
        elif (energy_margin_pct >= 3.0 and (state.gap_ahead_sec <= 1.2 or state.in_attack_mode_zone or laps_left <= 4)) or (energy_margin_pct >= 15.0):
            recommended_action = "deploy"
            # Deploy boost calculation
            base_boost = 12.0 + min(15.0, energy_margin_pct * 0.35)
            if state.in_attack_mode_zone:
                base_boost += 6.0
            if laps_left <= 3:
                base_boost += 4.0
            deploy_pct = min(30.0, round(base_boost, 1))
            reason_code = "sufficient_reserve_for_attack"
            details = (
                f"Energy surplus of +{energy_margin_pct:.1f}% provides safe headroom. "
                f"Reserve covers {laps_of_reserve:.1f} laps for {laps_left} remaining laps. "
                f"Deployment boost of +{deploy_pct}% recommended."
            )
        else:
            recommended_action = "hybrid"
            deploy_pct = round(max(2.0, min(8.0, 4.0 + (energy_margin_pct * 0.15))), 1)
            reason_code = "balanced_energy_management"
            details = (
                f"Energy reserve is balanced ({energy_margin_pct:+.1f}% margin). "
                f"Maintain steady power curve with moderate tactical deployment (+{deploy_pct}%)."
            )

        # Projected energy after executing this lap
        lap_energy_fraction = 100.0 / total_laps
        lap_draw_pct = lap_energy_fraction * (1.0 + (deploy_pct / 100.0))
        remaining_after_action = max(0.0, round(state.energy_pct - lap_draw_pct, 1))

        return EnergyAgentOutput(
            recommended_action=recommended_action,
            recommended_deploy_pct=deploy_pct,
            energy_remaining_after_action_pct=remaining_after_action,
            laps_of_reserve_at_current_rate=round(laps_of_reserve, 1),
            risk_of_energy_shortfall=risk,
            rationale_data=EnergyAgentRationale(
                reason_code=reason_code,
                target_kwh_per_lap=round(target_kwh_per_lap, 3),
                nominal_kwh_per_lap=round(nominal_kwh_per_lap, 3),
                energy_margin_pct=round(energy_margin_pct, 1),
                details=details,
            ),
        )
