import React, { useEffect, useState } from "react";

/**
 * Signature Element — 5 Red Lights F1 Starting Gantry Sequence
 * Used during live recomputation instead of a generic spinner.
 */
export default function F1Lights({ isCalculating }) {
  const [litCount, setLitCount] = useState(0);

  useEffect(() => {
    let timer1, timer2, timer3, timer4, timer5, timerOff;

    if (isCalculating) {
      setLitCount(1);
      timer1 = setTimeout(() => setLitCount(2), 60);
      timer2 = setTimeout(() => setLitCount(3), 120);
      timer3 = setTimeout(() => setLitCount(4), 180);
      timer4 = setTimeout(() => setLitCount(5), 240);
      timerOff = setTimeout(() => setLitCount(0), 380);
    } else {
      setLitCount(0);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timerOff);
    };
  }, [isCalculating]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "#080A0D",
        border: "1px solid #232832",
        padding: "4px 8px",
        borderRadius: "3px",
      }}
      title={isCalculating ? "Telemetry Recomputing (5 Red Lights Sequence)" : "Pipeline Synced"}
    >
      <span
        className="font-display"
        style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          color: isCalculating ? "#FF3B3B" : "#8B94A3",
          letterSpacing: "0.08em",
          marginRight: "4px",
        }}
      >
        {isCalculating ? "RECOMPUTING" : "COPILOT READY"}
      </span>

      {/* 5 Gantry Light Pods */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((index) => {
          const isLit = litCount >= index;
          return (
            <div
              key={index}
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: isLit ? "#FF3B3B" : "#1C2128",
                boxShadow: isLit ? "0 0 8px #FF3B3B, inset 0 0 2px #fff" : "none",
                border: `1px solid ${isLit ? "#FF3B3B" : "#2E3642"}`,
                transition: "background 0.05s ease, box-shadow 0.05s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
