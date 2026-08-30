"""
Overtake Agent — Module C
Deterministic mathematical estimation of overtake probability and optimal execution window.
Pure formula calculation bounded between 0% and 100%, incorporating gap decay, DRS proximity,
Attack Mode, tyre degradation, and available energy margin.
"""

import math
from typing import Dict
from backend.schemas.race_state import RaceState, OvertakeAgentOutput, OvertakeAgentRationale


class OvertakeAgent:
    def __init__(self):
        pass

    def evaluate(self, state: RaceState) -> OvertakeAgentOutput:
        """
        Calculates overtake probability deterministically:
        P_base = 86.0 * exp(-0.95 * gap_ahead_sec)
        P_final = clamp(P_base + DRS_bonus + AttackMode_bonus + Tyre_mod + Energy_mod, 2.0, 98.0)
        """
        gap = max(0.05, state.gap_ahead_sec)

        # 1. Base probability derived from gap closing physics
        base_prob = 86.0 * math.exp(-0.92 * gap)

        modifiers: Dict[str, float] = {}

        # 2. DRS assist modifier
        # DRS is active within 1.0s detection gap and upcoming zone
        drs_active = state.drs_zone_ahead_m <= 400 and gap <= 1.0
        if drs_active:
            if state.drs_zone_ahead_m <= 150:
                drs_bonus = 18.0
            else:
                drs_bonus = 12.0
            modifiers["drs_assist"] = drs_bonus
        else:
            drs_bonus = 0.0

        # 3. Attack Mode / High Power Mode
        if state.in_attack_mode_zone or (state.attack_mode_available and gap <= 0.8):
            attack_bonus = 16.0
            modifiers["attack_mode_boost"] = attack_bonus
        else:
            attack_bonus = 0.0

        # 4. Tyre compound & degradation delta
        tyre_mod = 0.0
        compound_bonus = {
            "soft": 6.0,
            "medium": 0.0,
            "hard": -4.0,
            "intermediate": -2.0,
            "wet": -5.0,
        }.get(state.tyre_compound, 0.0)
        tyre_mod += compound_bonus

        # Wear penalty
        if state.tyre_wear_pct > 70.0:
            wear_penalty = -((state.tyre_wear_pct - 70.0) * 0.4)
            tyre_mod += wear_penalty
            modifiers["tyre_wear_penalty"] = round(wear_penalty, 1)
        elif state.tyre_wear_pct < 35.0:
            tyre_mod += 5.0
            modifiers["tyre_freshness_grip"] = 5.0

        if compound_bonus != 0.0:
            modifiers["compound_delta"] = compound_bonus

        # 5. Energy reserve modifier
        energy_mod = 0.0
        if state.energy_pct > 30.0:
            energy_mod = 8.0
            modifiers["energy_surplus_boost"] = 8.0
        elif state.energy_pct < 12.0:
            energy_mod = -15.0
            modifiers["energy_deficit_penalty"] = -15.0

        # 6. Gap closing rate estimation
        closing_rate = 0.15  # nominal default sec/lap
        if state.recent_gaps_ahead and len(state.recent_gaps_ahead) >= 2:
            closing_rate = round(state.recent_gaps_ahead[-2] - state.recent_gaps_ahead[-1], 2)
            if closing_rate > 0.05:
                rate_bonus = min(12.0, closing_rate * 30.0)
                modifiers["gap_closing_momentum"] = round(rate_bonus, 1)
            elif closing_rate < -0.05:
                rate_penalty = max(-15.0, closing_rate * 25.0)
                modifiers["gap_widening_penalty"] = round(rate_penalty, 1)

        # Total combined probability
        total_prob = base_prob + drs_bonus + attack_bonus + tyre_mod + energy_mod
        if "gap_closing_momentum" in modifiers:
            total_prob += modifiers["gap_closing_momentum"]
        elif "gap_widening_penalty" in modifiers:
            total_prob += modifiers["gap_widening_penalty"]

        # Clamp between 2% and 98%
        success_prob = max(2.0, min(98.0, round(total_prob, 1)))

        # Determine best window
        if success_prob >= 68.0 and gap <= 0.65:
            best_window = "this_lap"
            overtake_rec = True
            pos_gain = 1
        elif success_prob >= 48.0 and (gap <= 1.2 or drs_active or state.in_attack_mode_zone):
            best_window = "next_2_laps"
            overtake_rec = True
            pos_gain = 1
        else:
            best_window = "not_advisable"
            overtake_rec = False
            pos_gain = 0

        return OvertakeAgentOutput(
            overtake_recommended=overtake_rec,
            success_probability_pct=success_prob,
            expected_position_gain=pos_gain,
            best_window=best_window,
            rationale_data=OvertakeAgentRationale(
                gap_closing_rate_sec_per_lap=closing_rate,
                drs_assist=drs_active,
                attack_mode_boost=bool(attack_bonus > 0),
                tyre_delta_advantage_pct=round(tyre_mod, 1),
                base_probability_pct=round(base_prob, 1),
                modifier_breakdown=modifiers,
            ),
        )
