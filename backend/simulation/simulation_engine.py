"""
Simulation Engine — Module A
Generates a realistic, physics-grounded stream of RaceState telemetry over time.
Models non-linear tyre wear, battery regen on braking zones, fluctuating rival gaps,
attack mode cycles, and DRS detection zones.
"""

import math
import random
from typing import List, Dict, Any, Optional
from backend.schemas.race_state import RaceState


class SimulationEngine:
    def __init__(self, track_name: str = "Monza E-Prix", total_laps: int = 50, starting_pos: int = 5):
        self.track_name = track_name
        self.total_laps = total_laps
        self.starting_pos = starting_pos
        self.reset()

    def reset(self, track_name: Optional[str] = None, total_laps: Optional[int] = None, starting_pos: Optional[int] = None):
        """Resets simulation to Lap 1."""
        if track_name:
            self.track_name = track_name
        if total_laps:
            self.total_laps = total_laps
        if starting_pos:
            self.starting_pos = starting_pos

        self.current_lap = 1
        self.energy_pct = 100.0
        self.total_energy_budget_kwh = 52.0
        self.total_energy_used_kwh = 0.0
        self.max_energy_per_lap_kwh = 4.0
        self.energy_used_this_lap_kwh = 0.0

        self.track_position = self.starting_pos
        self.gap_ahead_sec = 1.45
        self.gap_behind_sec = 2.10
        self.tyre_wear_pct = 0.0
        self.tyre_compound = "medium"

        self.in_attack_mode_zone = False
        self.attack_mode_available = True
        self.attack_mode_active_laps = 0
        self.drs_zone_ahead_m = 350
        self.sector = 1

        self.recent_gaps: List[float] = [1.60, 1.55, 1.50, 1.48, 1.45]
        self.lap_history: List[Dict[str, Any]] = []

    def get_current_state(self) -> RaceState:
        """Returns the current RaceState snapshot."""
        laps_remaining = max(0, self.total_laps - self.current_lap)
        return RaceState(
            lap_number=self.current_lap,
            laps_remaining=laps_remaining,
            energy_pct=round(self.energy_pct, 1),
            energy_used_this_lap_kwh=round(self.energy_used_this_lap_kwh, 2),
            max_energy_per_lap_kwh=self.max_energy_per_lap_kwh,
            total_energy_budget_kwh=self.total_energy_budget_kwh,
            total_energy_used_kwh=round(self.total_energy_used_kwh, 2),
            gap_ahead_sec=round(max(0.05, self.gap_ahead_sec), 2),
            gap_behind_sec=round(max(0.1, self.gap_behind_sec), 2),
            tyre_wear_pct=round(min(100.0, max(0.0, self.tyre_wear_pct)), 1),
            tyre_compound=self.tyre_compound,
            track_position=self.track_position,
            in_attack_mode_zone=self.in_attack_mode_zone,
            attack_mode_available=self.attack_mode_available,
            drs_zone_ahead_m=self.drs_zone_ahead_m,
            sector=self.sector,
            recent_gaps_ahead=self.recent_gaps[-5:],
            track_temp_c=34.5,
            rival_driver_name="P" + str(max(1, self.track_position - 1)) + " Car",
        )

    def step(self, deploy_override_pct: Optional[float] = None) -> RaceState:
        """
        Advances the simulation by 1 lap.
        Calculates physical energy consumption, regen, tyre degradation, and gap changes.
        """
        if self.current_lap >= self.total_laps:
            return self.get_current_state()

        # 1. Energy consumption calculation
        nominal_lap_kwh = self.total_energy_budget_kwh / self.total_laps
        deploy_pct = deploy_override_pct if deploy_override_pct is not None else 0.0

        # High deployment draws more kWh; lift & coast draws less
        lap_draw_kwh = nominal_lap_kwh * (1.0 + (deploy_pct / 100.0))
        # Regen on heavy braking zones (Formula E ~15-25% energy recovered)
        regen_kwh = lap_draw_kwh * 0.20
        net_lap_kwh = max(0.2, lap_draw_kwh - regen_kwh)

        self.energy_used_this_lap_kwh = net_lap_kwh
        self.total_energy_used_kwh = min(self.total_energy_budget_kwh, self.total_energy_used_kwh + net_lap_kwh)

        pct_spent_this_lap = (net_lap_kwh / self.total_energy_budget_kwh) * 100.0
        self.energy_pct = max(0.0, self.energy_pct - pct_spent_this_lap)

        # 2. Tyre Wear calculation (Non-linear thermal wear)
        compound_rates = {"soft": 2.4, "medium": 1.7, "hard": 1.1, "intermediate": 1.9, "wet": 2.2}
        base_rate = compound_rates.get(self.tyre_compound, 1.7)
        # Aggressive deploy increases tyre slip and thermal wear
        push_factor = 1.0 + max(-0.2, (deploy_pct / 100.0) * 0.5)
        # Degradation accelerates as tyre gets older
        wear_increment = base_rate * push_factor * (1.0 + (self.tyre_wear_pct / 120.0))
        self.tyre_wear_pct = min(100.0, self.tyre_wear_pct + wear_increment)

        # 3. Gap ahead dynamics
        # If we deploy energy, we close gap to car ahead
        pace_delta = (deploy_pct / 100.0) * 0.40
        # If opponent tyre is worn or we are in DRS, gap closes faster
        drs_bonus = 0.15 if (self.gap_ahead_sec <= 1.0 and self.drs_zone_ahead_m <= 300) else 0.0
        random_flux = random.uniform(-0.08, 0.08)

        new_gap_ahead = max(0.15, self.gap_ahead_sec - pace_delta - drs_bonus + random_flux)

        # Overtake condition in simulation
        if new_gap_ahead <= 0.20 and deploy_pct >= 10.0 and self.track_position > 1:
            self.track_position -= 1
            # After overtaking, new car ahead is ~1.8s away
            new_gap_ahead = 1.80
            self.gap_behind_sec = 0.40
        else:
            self.gap_behind_sec = max(0.2, self.gap_behind_sec + (pace_delta * 0.5) - random_flux)

        self.gap_ahead_sec = new_gap_ahead
        self.recent_gaps.append(round(new_gap_ahead, 2))
        if len(self.recent_gaps) > 10:
            self.recent_gaps.pop(0)

        # 4. DRS & Sector rotation
        self.sector = (self.sector % 3) + 1
        self.drs_zone_ahead_m = 150 if self.sector == 2 else 450
        self.in_attack_mode_zone = (self.sector == 3 and self.current_lap % 7 == 0)

        # 5. Advance lap
        self.current_lap += 1

        state = self.get_current_state()
        self.lap_history.append(state.model_dump())
        return state

    def generate_full_race(self, total_laps: int = 50) -> List[Dict[str, Any]]:
        """Generates an entire 50-lap telemetry dataset in < 0.05 seconds."""
        self.reset(total_laps=total_laps)
        history = [self.get_current_state().model_dump()]
        for _ in range(total_laps - 1):
            state = self.step()
            history.append(state.model_dump())
        return history

    def override_state(self, overrides: Dict[str, Any]) -> RaceState:
        """Directly overrides internal state for Strategy Sandbox exploration."""
        if "lap_number" in overrides:
            self.current_lap = int(overrides["lap_number"])
        if "energy_pct" in overrides:
            self.energy_pct = float(overrides["energy_pct"])
        if "gap_ahead_sec" in overrides:
            self.gap_ahead_sec = float(overrides["gap_ahead_sec"])
            self.recent_gaps[-1] = self.gap_ahead_sec
        if "gap_behind_sec" in overrides:
            self.gap_behind_sec = float(overrides["gap_behind_sec"])
        if "tyre_wear_pct" in overrides:
            self.tyre_wear_pct = float(overrides["tyre_wear_pct"])
        if "tyre_compound" in overrides:
            self.tyre_compound = overrides["tyre_compound"]
        if "track_position" in overrides:
            self.track_position = int(overrides["track_position"])
        if "in_attack_mode_zone" in overrides:
            self.in_attack_mode_zone = bool(overrides["in_attack_mode_zone"])
        if "attack_mode_available" in overrides:
            self.attack_mode_available = bool(overrides["attack_mode_available"])
        if "drs_zone_ahead_m" in overrides:
            self.drs_zone_ahead_m = int(overrides["drs_zone_ahead_m"])
        if "sector" in overrides:
            self.sector = int(overrides["sector"])
        if "total_laps" in overrides:
            self.total_laps = int(overrides["total_laps"])

        return self.get_current_state()
