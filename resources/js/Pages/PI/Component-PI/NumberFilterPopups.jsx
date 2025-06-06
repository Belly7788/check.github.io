import React from 'react';
import { useTranslation } from 'react-i18next';

const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

export default function NumberFilterPopups({
  darkMode,
  isTNumberPopupOpen,
  isRNumberPopupOpen,
  isTNumberAnimatingOut,
  isRNumberAnimatingOut,
  tNumberSearch,
  rNumberSearch,
  tNumberPopupPosition,
  rNumberPopupPosition,
  setTNumberSearch,
  setRNumberSearch,
  toggleTNumberPopup,
  toggleRNumberPopup,
  applyFilters,
}) {
  const { t } = useTranslation();

  return (
    <>
      {isTNumberPopupOpen && (
        <div
          className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
          } t-number-popup`}
          style={{
            top: `${tNumberPopupPosition.top}px`,
            left: `${tNumberPopupPosition.left}px`,
            transformOrigin: tNumberPopupPosition.transformOrigin,
            animation: isTNumberAnimatingOut
              ? 'shrinkToPoint 0.2s ease-out forwards'
              : 'growFromPoint 0.2s ease-out forwards',
          }}
        >
          <div className="p-3 flex flex-col">
            <h3 className="text-center font-semibold mb-3">{t('list_pis.filter_by_t_number')}</h3>
            <input
              type="text"
              placeholder={t('list_pis.search_t_number')}
              value={tNumberSearch}
              onChange={(e) => setTNumberSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                  toggleTNumberPopup(new Event('click'));
                }
              }}
              className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
                darkMode,
                'bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700',
                'bg-white text-gray-700 placeholder-gray-400 border border-gray-300'
              )}`}
            />
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={() => {
                  applyFilters();
                  toggleTNumberPopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {t('list_pos.apply')}
              </button>
              <button
                onClick={() => {
                  setTNumberSearch('');
                  toggleTNumberPopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRNumberPopupOpen && (
        <div
          className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
          } r-number-popup`}
          style={{
            top: `${rNumberPopupPosition.top}px`,
            left: `${rNumberPopupPosition.left}px`,
            transformOrigin: rNumberPopupPosition.transformOrigin,
            animation: isRNumberAnimatingOut
              ? 'shrinkToPoint 0.2s ease-out forwards'
              : 'growFromPoint 0.2s ease-out forwards',
          }}
        >
          <div className="p-3 flex flex-col">
            <h3 className="text-center font-semibold mb-3">{t('list_pis.filter_by_r_number')}</h3>
            <input
              type="text"
              placeholder={t('list_pis.search_r_number')}
              value={rNumberSearch}
              onChange={(e) => setRNumberSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                  toggleRNumberPopup(new Event('click'));
                }
              }}
              className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
                darkMode,
                'bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700',
                'bg-white text-gray-700 placeholder-gray-400 border border-gray-300'
              )}`}
            />
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={() => {
                  applyFilters();
                  toggleRNumberPopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {t('list_pos.apply')}
              </button>
              <button
                onClick={() => {
                  setRNumberSearch('');
                  toggleRNumberPopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
