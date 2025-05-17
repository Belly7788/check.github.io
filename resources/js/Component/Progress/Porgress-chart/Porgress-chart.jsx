import React from 'react';
import { getDarkModeClass } from "../../../utils/darkModeUtils";
const ProgressChart = ({
    darkMode,
    percentage = 100,
    size = 128, // Default width and height in pixels
    fontSize = 24 // Default font size in pixels
}) => {
  // Calculate inner circle size (75% of outer size to maintain proportion)
  const innerSize = size * 0.75;
  // Adjust glow effect based on size
  const glowSize = size * 0.117; // Scaled from 15px for 128px default

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring with glowing effect */}
      <div
        className="rounded-full flex items-center justify-center shadow-lg"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `conic-gradient(#ff8800 ${percentage * 3.6}deg, #e5e7eb ${percentage * 3.6}deg)`,
          boxShadow: `0 0 ${glowSize}px ${glowSize / 3}px rgba(255, 136, 0, 0.5)`, // Dynamic glow
        }}
      >
        {/* Inner white circle */}
        <div
          className={` rounded-full flex items-center justify-center ${getDarkModeClass(
            darkMode,
            "bg-[#2D2D2D]",
            "bg-white"
          )}`}
          style={{
            width: `${innerSize}px`,
            height: `${innerSize}px`,
          }}
        >
          <span
            className={`font-bold  ${getDarkModeClass(
                darkMode,
                "text-white",
                "text-gray-800"
            )}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
