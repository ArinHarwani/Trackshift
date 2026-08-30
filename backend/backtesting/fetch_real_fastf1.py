"""
Script to test real network fetch from FastF1 API and print the first 20 rows of raw telemetry data.
"""

import os
import fastf1
import pandas as pd

# Set up FastF1 cache directory
cache_dir = os.path.join(os.path.dirname(__file__), ".fastf1_cache")
os.makedirs(cache_dir, exist_ok=True)
fastf1.Cache.enable_cache(cache_dir)

print(f"[*] FastF1 cache enabled at: {cache_dir}")
print("[*] Fetching real session data for: 2023 Italian Grand Prix (Monza) Race...")

try:
    session = fastf1.get_session(2023, "Monza", "R")
    session.load(laps=True, telemetry=False, weather=False, messages=False)

    print(f"[OK] Successfully loaded session: {session.event['EventName']} ({session.event.year})")
    
    # Extract laps for Carlos Sainz (SAI) who started on Pole and defended against Verstappen (VER)
    sai_laps = session.laps.pick_drivers("SAI")
    ver_laps = session.laps.pick_drivers("VER")

    print(f"[OK] Total Sainz Laps: {len(sai_laps)} | Total Verstappen Laps: {len(ver_laps)}")

    # Columns of interest in FastF1 raw DataFrame
    cols = ["LapNumber", "LapTime", "Sector1Time", "Sector2Time", "Sector3Time", "Compound", "TyreLife", "FreshTyre", "Stint", "IsAccurate"]
    preview_df = sai_laps[cols].head(20).copy()

    # Format LapTime to string for clean display
    preview_df["LapTime_s"] = preview_df["LapTime"].dt.total_seconds()
    preview_df["Sector1_s"] = preview_df["Sector1Time"].dt.total_seconds()
    preview_df["Sector2_s"] = preview_df["Sector2Time"].dt.total_seconds()
    preview_df["Sector3_s"] = preview_df["Sector3Time"].dt.total_seconds()

    display_cols = ["LapNumber", "LapTime_s", "Sector1_s", "Sector2_s", "Sector3_s", "Compound", "TyreLife", "Stint"]
    print("\n--- FIRST 20 ROWS OF RAW FASTF1 SESSION DATA (SAINZ, 2023 MONZA GP) ---")
    print(preview_df[display_cols].to_string(index=False))

except Exception as e:
    print(f"[!] FastF1 Live Fetch Error: {e}")
