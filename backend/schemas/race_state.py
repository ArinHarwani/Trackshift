from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field


class RaceState(BaseModel):
    """Universal race state object representing real-time telemetry and track situation."""
    lap_number: int = Field(..., description="Current lap number (1-indexed)")
    laps_remaining: int = Field(..., description="Laps left to finish")
    energy_pct: float = Field(..., ge=0.0, le=100.0, description="Usable battery/energy remaining in %")
    energy_used_this_lap_kwh: float = Field(0.0, ge=0.0, description="Energy consumed in current lap in kWh")
    max_energy_per_lap_kwh: float = Field(4.0, gt=0.0, description="FIA regulated maximum deployable kWh per lap")
    total_energy_budget_kwh: float = Field(52.0, gt=0.0, description="Total race energy allocation in kWh")
    total_energy_used_kwh: float = Field(38.5, ge=0.0, description="Cumulative kWh used so far in race")
    gap_ahead_sec: float = Field(..., ge=0.0, description="Gap to car immediately ahead in seconds")
    gap_behind_sec: float = Field(..., ge=0.0, description="Gap to car immediately behind in seconds")
    tyre_wear_pct: float = Field(..., ge=0.0, le=100.0, description="Current tyre degradation in % (100 = bald)")
    tyre_compound: Literal["soft", "medium", "hard", "wet", "intermediate"] = Field("medium", description="Active tyre compound")
    track_position: int = Field(..., ge=1, description="Current position in race (1 = P1)")
    in_attack_mode_zone: bool = Field(False, description="Car currently in Attack Mode / High Power activation zone")
    attack_mode_available: bool = Field(True, description="Whether Attack Mode activations remain")
    drs_zone_ahead_m: int = Field(200, ge=0, description="Distance in meters to next DRS detection/activation")
    sector: int = Field(2, ge=1, le=3, description="Current track sector (1, 2, or 3)")
    # Optional history for opponent profiling
    recent_gaps_ahead: Optional[List[float]] = Field(default=None, description="History of gap_ahead over last N laps")
    track_temp_c: Optional[float] = Field(32.0, description="Track temperature in Celsius")
    rival_driver_name: Optional[str] = Field("Rival Car", description="Name of car ahead")


class EnergyAgentRationale(BaseModel):
    reason_code: str
    target_kwh_per_lap: float
    nominal_kwh_per_lap: float
    energy_margin_pct: float
    details: str


class EnergyAgentOutput(BaseModel):
    recommended_action: Literal["deploy", "conserve", "hybrid"] = Field(..., description="Core energy recommendation")
    recommended_deploy_pct: float = Field(..., description="Recommended deployment percentage (+boost or -conserve)")
    energy_remaining_after_action_pct: float = Field(..., description="Projected energy % after executing action this lap")
    laps_of_reserve_at_current_rate: float = Field(..., description="How many laps current energy lasts at baseline pace")
    risk_of_energy_shortfall: Literal["low", "medium", "high"] = Field(..., description="Risk of running out before checkered flag")
    rationale_data: EnergyAgentRationale


class OvertakeAgentRationale(BaseModel):
    gap_closing_rate_sec_per_lap: float
    drs_assist: bool
    attack_mode_boost: bool
    tyre_delta_advantage_pct: float
    base_probability_pct: float
    modifier_breakdown: Dict[str, float]


class OvertakeAgentOutput(BaseModel):
    overtake_recommended: bool = Field(..., description="Whether to attempt an overtake right now")
    success_probability_pct: float = Field(..., ge=0.0, le=100.0, description="Calculated probability of successful pass (0-100%)")
    expected_position_gain: int = Field(..., ge=0, description="Expected positions gained (typically 1)")
    best_window: Literal["this_lap", "next_2_laps", "not_advisable"] = Field(..., description="Optimal window for executing the move")
    rationale_data: OvertakeAgentRationale


class OpponentSignals(BaseModel):
    avg_gap_variance: float
    defended_position_last_n_laps: int
    lap_delta_std_dev: float
    braking_consistency_score: float


class OpponentAgentOutput(BaseModel):
    opponent_profile: Literal["defensive", "aggressive", "balanced"] = Field(..., description="Classification of rival behavior")
    profile_confidence_pct: float = Field(..., ge=0.0, le=100.0, description="Confidence in rule-based profile")
    based_on_laps: int = Field(..., description="Number of observed laps used for profiling")
    signals: OpponentSignals


class RulesAgentOutput(BaseModel):
    compliant: bool = Field(..., description="Whether the proposed strategy respects FIA / Formula E regulations")
    violations: List[str] = Field(default_factory=list, description="List of technical/sporting regulations violated")
    energy_budget_remaining_kwh: float = Field(..., description="Total usable kWh remaining in race allocation")
    max_safe_deploy_this_lap_kwh: float = Field(..., description="Maximum permissible energy draw this single lap")
    per_lap_limit_kwh: float = Field(4.0, description="Regulatory maximum per lap")


class StrategyAgentOutput(BaseModel):
    headline: str = Field(..., description="Crisp one-liner pit wall order (e.g. 'Deploy 18% energy boost within next 2 laps')")
    overtake_probability_pct: float = Field(..., ge=0.0, le=100.0, description="Overtake success probability")
    expected_position_gain: int = Field(..., ge=0, description="Projected position gain")
    energy_cost_verdict: Literal["acceptable", "risky", "critical", "optimal"] = Field(..., description="Strategic cost of energy")
    rule_compliance: Literal["verified", "violation_prevented", "non_compliant"] = Field(..., description="Rules compliance check status")
    composite_score: float = Field(..., description="Deterministic strategy index score (-1.0 to 1.0 or 0 to 1.0)")
    explanation: str = Field(..., description="Plain-language pit radio explanation of why this call was made")
    scoring_breakdown: Dict[str, float] = Field(default_factory=dict, description="Explicit weights and component scores")
    raw_agent_outputs: Dict[str, Any] = Field(..., description="Individual outputs from Energy, Overtake, Rules, and Opponent agents")
