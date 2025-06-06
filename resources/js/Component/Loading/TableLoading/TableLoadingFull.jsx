import React from 'react';
import { getDarkModeClass } from "../../../utils/darkModeUtils";
import './style.css';

const TableLoadingFull = ({ darkMode, rowCount = 5, colCount = 4 }) => {
  return (
    <table className="w-full">
      <thead>
        <tr
          className={`border-b ${getDarkModeClass(
            darkMode,
            "bg-[#1a1a1a] text-gray-300 border-gray-700",
            "bg-gray-50 text-gray-900 border-gray-200"
          )}`}
        >
          {Array.from({ length: colCount }).map((_, colIndex) => (
            <th key={`loading-header-${colIndex}`} className="p-3">
              <div
                className={`h-6 rounded ${getDarkModeClass(
                  darkMode,
                  "animate-shimmer-dark",
                  "animate-shimmer"
                )}`}
              ></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <tr
            key={`loading-row-${rowIndex}`}
            className={`border-b ${getDarkModeClass(
              darkMode,
              "bg-[#1a1a1a] text-gray-300 border-gray-700",
              "bg-gray-50 text-gray-900 border-gray-200"
            )}`}
          >
            {Array.from({ length: colCount }).map((_, colIndex) => (
              <td key={`loading-cell-${rowIndex}-${colIndex}`} className="p-3">
                <div
                  className={`h-6 rounded ${getDarkModeClass(
                    darkMode,
                    "animate-shimmer-dark",
                    "animate-shimmer"
                  )}`}
                ></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableLoadingFull;
