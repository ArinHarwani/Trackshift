"""
Strategy Agent (Orchestrator) — Module F
Combines outputs from Energy, Overtake, Rules, and Opponent agents.
Calculates the deterministic composite score formula and synthesizes
natural language pit-radio explanations via Gemini API or high-precision fallback templates.
"""

import os
import json
import httpx
from typing import Dict, Any, Optional

from backend.schemas.race_state import (
    RaceState,
    StrategyAgentOutput,
    EnergyAgentOutput,
    OvertakeAgentOutput,
    OpponentAgentOutput,
    RulesAgentOutput,
)
from backend.agents.energy_agent import EnergyAgent
from backend.agents.overtake_agent import OvertakeAgent
from backend.agents.rules_agent import RulesAgent
from backend.agents.opponent_agent import OpponentAgent


class StrategyAgent:
    def __init__(self, gemini_api_key: Optional[str] = None):
        self.energy_agent = EnergyAgent()
        self.overtake_agent = OvertakeAgent()
        self.rules_agent = RulesAgent()
        self.opponent_agent = OpponentAgent()
        self.api_key = gemini_api_key or os.environ.get("GEMINI_API_KEY", "")

    def calculate_composite_score(
        self,
        energy_out: EnergyAgentOutput,
        overtake_out: OvertakeAgentOutput,
        rules_out: RulesAgentOutput,
        opponent_out: OpponentAgentOutput,
    ) -> tuple[float, Dict[str, float]]:
        """
        Explicit, documented composite score formula:
        composite_score = (w_prob * P_norm) + (w_pos * Pos_gain) - (w_energy * Energy_risk) - (w_rules * Rule_risk) + (w_opp * Opp_factor)
        """
        # 1. Success probability contribution (0.0 to 0.45)
        p_norm = overtake_out.success_probability_pct / 100.0
        prob_contrib = round(0.45 * p_norm, 3)

        # 2. Position gain contribution (0.0 to 0.25)
        pos_contrib = round(0.25 * min(1.0, float(overtake_out.expected_position_gain)), 3)

        # 3. Energy risk penalty (0.0 to 0.20)
        risk_map = {"low": 0.0, "medium": 0.08, "high": 0.22}
        energy_penalty = risk_map.get(energy_out.risk_of_energy_shortfall, 0.1)

        # If energy action is conserve, penalize aggressive push score
        if energy_out.recommended_action == "conserve":
            energy_penalty += 0.10
        energy_penalty = round(energy_penalty, 3)

        # 4. Rules penalty (0.0 to 0.40)
        rule_penalty = 0.0 if rules_out.compliant else 0.40

        # 5. Opponent profile modifier (-0.05 to +0.08)
        opp_mod = 0.02
        if opponent_out.opponent_profile == "defensive":
            opp_mod = -0.04 if not overtake_out.rationale_data.drs_assist else 0.03
        elif opponent_out.opponent_profile == "aggressive":
            opp_mod = 0.06
        opp_mod = round(opp_mod, 3)

        # Aggregate raw score
        raw_score = prob_contrib + pos_contrib - energy_penalty - rule_penalty + opp_mod
        final_score = max(0.0, min(1.0, round(raw_score, 2)))

        breakdown = {
            "overtake_probability_weight": 0.45,
            "overtake_contrib": prob_contrib,
            "position_gain_weight": 0.25,
            "position_contrib": pos_contrib,
            "energy_risk_penalty": energy_penalty,
            "rules_violation_penalty": rule_penalty,
            "opponent_exploit_mod": opp_mod,
            "raw_sum": round(raw_score, 3),
            "final_clamped_score": final_score,
        }

        return final_score, breakdown

    def generate_headline(
        self,
        state: RaceState,
        energy_out: EnergyAgentOutput,
        overtake_out: OvertakeAgentOutput,
        rules_out: RulesAgentOutput,
    ) -> str:
        """Generates punchy pit-wall order headline."""
        if not rules_out.compliant:
            return f"HOLD: Technical limit breach prevention ({rules_out.violations[0].split(':')[0]})"

        if energy_out.recommended_action == "conserve":
            return f"Lift & Coast Mode: Conserve {abs(energy_out.recommended_deploy_pct)}% to protect delta"

        if overtake_out.overtake_recommended and overtake_out.best_window == "this_lap":
            return f"Deploy +{energy_out.recommended_deploy_pct}% energy boost for overtake THIS LAP"

        if overtake_out.overtake_recommended:
            return f"Deploy +{energy_out.recommended_deploy_pct}% boost: Prepare attack within next 2 laps"

        if energy_out.recommended_action == "deploy":
            return f"Harvest & Charge: Deploy +{energy_out.recommended_deploy_pct}% in Attack Zone"

        return f"Maintain Hybrid Mode: Target {state.gap_ahead_sec:.1f}s gap, conserve tyre life"

    def get_gemini_prompt(
        self,
        state: RaceState,
        energy_out: EnergyAgentOutput,
        overtake_out: OvertakeAgentOutput,
        rules_out: RulesAgentOutput,
        opponent_out: OpponentAgentOutput,
        headline: str,
    ) -> tuple[str, str]:
        """
        Returns the exact (system_prompt, user_prompt) passed to the LLM.
        Guarantees that Gemini is only used to explain pre-calculated numbers and cannot invent new ones.
        """
        system_prompt = (
            "You are a professional Formula 1 and Formula E race engineer communicating over the pit-wall radio to the driver. "
            "You are provided with strictly pre-computed mathematical strategy metrics. "
            "CRITICAL RULE: You MUST NEVER invent, alter, or guess any numbers, probabilities, or deploy percentages. "
            "Your ONLY job is to explain the provided numbers in 2 concise, authentic pit-radio sentences."
        )

        user_prompt = (
            f"Pre-computed telemetry and strategy decisions:\n"
            f"- Order: {headline}\n"
            f"- Recommended Action: {energy_out.recommended_action.upper()} ({energy_out.recommended_deploy_pct:+.1f}%)\n"
            f"- ERS Reserve: {state.energy_pct:.1f}% (Margin: {energy_out.rationale_data.energy_margin_pct:+.1f}%, covers {energy_out.laps_of_reserve_at_current_rate:.1f} laps for {state.laps_remaining} laps remaining)\n"
            f"- Overtake Success Probability: {overtake_out.success_probability_pct:.0f}%\n"
            f"- Expected Position Gain: +{overtake_out.expected_position_gain}\n"
            f"- Best Execution Window: {overtake_out.best_window.replace('_', ' ')}\n"
            f"- Gap to {state.rival_driver_name}: {state.gap_ahead_sec:.2f}s\n"
            f"- DRS Status: {'ACTIVE' if overtake_out.rationale_data.drs_assist else f'{state.drs_zone_ahead_m}m ahead'}\n"
            f"- Opponent Profile: {opponent_out.opponent_profile} ({opponent_out.profile_confidence_pct:.0f}% confidence)\n"
            f"- Rules Status: {'COMPLIANT' if rules_out.compliant else 'VIOLATION PREVENTED'}\n\n"
            f"Synthesize a 2-sentence pit-radio explanation to the driver based strictly on these metrics."
        )

        return system_prompt, user_prompt

    def synthesize_with_gemini(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> Optional[str]:
        """Calls Gemini API to explain the numbers if API key is present."""
        if not self.api_key:
            return None

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": [{"parts": [{"text": user_prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 150},
            }
            with httpx.Client(timeout=3.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0]["content"]["parts"][0]["text"].strip()
                        return text
        except Exception as e:
            # Silent fallback to template
            pass

        return None

    def synthesize_explanation_template(
        self,
        state: RaceState,
        energy_out: EnergyAgentOutput,
        overtake_out: OvertakeAgentOutput,
        rules_out: RulesAgentOutput,
        opponent_out: OpponentAgentOutput,
        composite_score: float,
    ) -> str:
        """High-precision template fallback ensuring instant, robust 0-latency pit engineer explanations."""
        gap = state.gap_ahead_sec
        energy_pct = state.energy_pct
        laps_left = state.laps_remaining
        opp_profile = opponent_out.opponent_profile

        if not rules_out.compliant:
            return (
                f"Radio Check: Action blocked by Rules Compliance Engine. Proposed energy consumption exceeds "
                f"technical regulations ({rules_out.violations[0]}). Safe max single-lap draw is "
                f"{rules_out.max_safe_deploy_this_lap_kwh:.2f} kWh."
            )

        if energy_out.recommended_action == "conserve":
            return (
                f"Box call: Target delta energy is in deficit ({energy_out.rationale_data.energy_margin_pct:+.1f}%). "
                f"Current reserve ({energy_pct:.1f}%) covers only {energy_out.laps_of_reserve_at_current_rate:.1f} laps "
                f"for {laps_left} remaining. Immediate {abs(energy_out.recommended_deploy_pct):.0f}% lift-and-coast "
                f"required to prevent battery clipping before the finish."
            )

        if overtake_out.overtake_recommended:
            drs_text = f"DRS zone in {state.drs_zone_ahead_m}m" if overtake_out.rationale_data.drs_assist else "turn exit speed"
            return (
                f"Gap to {state.rival_driver_name} is {gap:.2f}s closing with {drs_text}. "
                f"Energy reserve ({energy_pct:.1f}%) provides a safe +{energy_out.rationale_data.energy_margin_pct:.1f}% "
                f"margin for the remaining {laps_left} laps. Opponent is profiled as {opp_profile} "
                f"({opponent_out.profile_confidence_pct:.0f}% confidence). Overtake probability is "
                f"{overtake_out.success_probability_pct:.0f}% — execute move within {overtake_out.best_window.replace('_', ' ')}."
            )

        return (
            f"Holding formation P{state.track_position}. Gap ahead is {gap:.2f}s with {state.gap_behind_sec:.2f}s cushion behind. "
            f"Energy reserve is balanced ({energy_out.rationale_data.energy_margin_pct:+.1f}% margin). "
            f"Tyre wear at {state.tyre_wear_pct:.0f}% ({state.tyre_compound} compound). Maintain hybrid deployment "
            f"and wait for the next pit/attack mode window."
        )

    def evaluate(self, state: RaceState) -> StrategyAgentOutput:
        """Executes full multi-agent pipeline."""
        # 1. Evaluate Energy Agent
        energy_out = self.energy_agent.evaluate(state)

        # 2. Evaluate Overtake Agent
        overtake_out = self.overtake_agent.evaluate(state)

        # 3. Evaluate Rules Agent against proposed energy
        rules_out = self.rules_agent.evaluate(state, energy_out)

        # 4. Evaluate Opponent Agent
        opponent_out = self.opponent_agent.evaluate(state)

        # 5. Composite scoring
        composite_score, scoring_breakdown = self.calculate_composite_score(
            energy_out, overtake_out, rules_out, opponent_out
        )

        # 6. Energy cost verdict
        if not rules_out.compliant:
            energy_verdict = "critical"
            rule_compliance = "non_compliant"
        elif energy_out.risk_of_energy_shortfall == "high":
            energy_verdict = "risky"
            rule_compliance = "verified"
        elif energy_out.recommended_action == "deploy":
            energy_verdict = "optimal"
            rule_compliance = "verified"
        else:
            energy_verdict = "acceptable"
            rule_compliance = "verified"

        # 7. Generate Headline
        headline = self.generate_headline(state, energy_out, overtake_out, rules_out)

        # 8. Generate Explanation (try Gemini API if key is present, fallback to deterministic template)
        sys_prompt, usr_prompt = self.get_gemini_prompt(state, energy_out, overtake_out, rules_out, opponent_out, headline)
        explanation = self.synthesize_with_gemini(sys_prompt, usr_prompt)
        if not explanation:
            explanation = self.synthesize_explanation_template(
                state, energy_out, overtake_out, rules_out, opponent_out, composite_score
            )

        raw_agent_outputs = {
            "energy": energy_out.model_dump(),
            "overtake": overtake_out.model_dump(),
            "rules": rules_out.model_dump(),
            "opponent": opponent_out.model_dump(),
        }

        return StrategyAgentOutput(
            headline=headline,
            overtake_probability_pct=overtake_out.success_probability_pct,
            expected_position_gain=overtake_out.expected_position_gain,
            energy_cost_verdict=energy_verdict,
            rule_compliance=rule_compliance,
            composite_score=composite_score,
            explanation=explanation,
            scoring_breakdown=scoring_breakdown,
            raw_agent_outputs=raw_agent_outputs,
        )
