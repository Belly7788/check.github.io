import React from 'react';
import { getDarkModeClass } from "../../../utils/darkModeUtils";
import './style.css';

const ShimmerLoading = ({
  darkMode,
  rowCount = 1,
  colCount = 1,
  width = '100%',
  height = '24px',
  borderRadius = '4px'
}) => {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
      {Array.from({ length: rowCount * colCount }).map((_, index) => (
        <div
          key={`shimmer-${index}`}
          className={`h-[${height}] rounded-[${borderRadius}] ${getDarkModeClass(
            darkMode,
            "animate-shimmer-dark",
            "animate-shimmer"
          )}`}
          style={{ width, height, borderRadius }}
        ></div>
      ))}
    </div>
  );
};

export default ShimmerLoading;
