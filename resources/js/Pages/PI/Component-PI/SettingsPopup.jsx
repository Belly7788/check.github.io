import React from 'react';
import { useTranslation } from 'react-i18next';

const getDarkModeClass = (darkMode, darkClass, lightClass) => (darkMode ? darkClass : lightClass);

const SettingsPopup = ({
  darkMode,
  isSettingPopupOpen,
  isSettingAnimatingOut,
  settingPopupPosition,
  columnSearchQuery,
  setColumnSearchQuery,
  visibleColumns,
  allColumns,
  handleColumnVisibilityChange,
  handleResetColumns,
  toggleSettingPopup,
}) => {
  const { t } = useTranslation();

  if (!isSettingPopupOpen) return null;

  return (
    <div
      className={`fixed w-60 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
        darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
      } setting-popup`}
      style={{
        top: `${settingPopupPosition.top}px`,
        left: `${settingPopupPosition.left - 30}px`,
        transformOrigin: settingPopupPosition.transformOrigin,
        animation: isSettingAnimatingOut
          ? 'shrinkToPoint 0.2s ease-out forwards'
          : 'growFromPoint 0.2s ease-out forwards',
      }}
    >
      <div className="p-3 flex flex-col max-h-96">
        <h3 className="text-center font-semibold mb-3">{t('list_pis.column_settings')}</h3>
        <div className="mb-3">
          <input
            type="text"
            placeholder={t('list_pis.search_columns')}
            value={columnSearchQuery}
            onChange={(e) => setColumnSearchQuery(e.target.value)}
            className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
              darkMode,
              'bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700',
              'bg-white text-gray-700 placeholder-gray-400 border border-gray-300'
            )}`}
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {allColumns
            .filter((column) => column.label.toLowerCase().includes(columnSearchQuery.toLowerCase()))
            .sort((a, b) => {
              const aMatch = a.label.toLowerCase().startsWith(columnSearchQuery.toLowerCase());
              const bMatch = b.label.toLowerCase().startsWith(columnSearchQuery.toLowerCase());
              if (aMatch && !bMatch) return -1;
              if (!aMatch && bMatch) return 1;
              return a.label.localeCompare(b.label);
            })
            .map((column) => (
              <label
                key={column.key}
                className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
              >
                <input
                  type="checkbox"
                  checked={visibleColumns[column.key]}
                  onChange={() => handleColumnVisibilityChange(column.key)}
                  className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                />
                <span>{column.label}</span>
              </label>
            ))}
        </div>
        <div className="mt-4 flex justify-between space-x-2">
          <button
            onClick={handleResetColumns}
            className={`flex-1 text-center px-4 py-2 text-sm font-semibold uppercase rounded-md transition-colors duration-150 border ${getDarkModeClass(
              darkMode,
              'border-[#ff8800] text-[#ff8800] bg-[#2D2D2D] hover:bg-[#ff8800] hover:text-white',
              'border-[#ff8800] text-[#ff8800] bg-white hover:bg-[#ff8800] hover:text-white'
            )} shadow-md flex items-center justify-center gap-2`}
          >
            {t('list_pis.reset')}
          </button>
          <button
            onClick={() => toggleSettingPopup(new Event('click'))}
            className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;
