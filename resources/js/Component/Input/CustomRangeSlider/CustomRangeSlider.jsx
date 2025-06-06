import React from 'react';
import { getDarkModeClass } from '../../../utils/darkModeUtils';

const CustomRangeSlider = ({ value, onChange, min = 0, max = 2, step = 1 }) => {
  // Calculate the percentage of the slider's value
  const percentage = ((value - min) / (max - min)) * 100;

  // Define the background gradient based on value
  const trackStyle = {
    background: `linear-gradient(to right, #ff8800 ${percentage}%, #d1d5db ${percentage}%)`,
  };

  return (
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        style={trackStyle} // Apply dynamic gradient
        className={`
          w-full h-2 rounded-lg appearance-none cursor-pointer
          ${getDarkModeClass(
            // Light mode styles
            'bg-gray-200 [&::-webkit-slider-thumb]:bg-[#ff8800] [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none',
            // Dark mode styles with glow effect
            'bg-gray-700 [&::-webkit-slider-thumb]:bg-[#ff8800] [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_8px_#ff8800] [&::-webkit-slider-thumb]:transition-shadow'
          )}
        `}
      />
    </div>
  );
};

export default CustomRangeSlider;
