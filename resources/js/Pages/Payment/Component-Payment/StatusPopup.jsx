import React from 'react';
import { useTranslation } from 'react-i18next';

const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

export default function StatusPopup({
  darkMode,
  isStatusPopupOpen,
  isStatusAnimatingOut,
  statusFilters,
  setStatusFilters,
  statusPopupPosition,
  toggleStatusPopup,
  applyFilters,
}) {
  const { t } = useTranslation();

  return (
    <>
      {isStatusPopupOpen && (
        <div
          className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
          } status-popup`}
          style={{
            top: `${statusPopupPosition.top}px`,
            left: `${statusPopupPosition.left}px`,
            transformOrigin: statusPopupPosition.transformOrigin,
            animation: isStatusAnimatingOut
              ? 'shrinkToPoint 0.2s ease-out forwards'
              : 'growFromPoint 0.2s ease-out forwards',
          }}
        >
          <div className="p-4">
            <h3 className="text-center font-semibold mb-4">{t('payment_manage.filter_by_status')}</h3>
            <div className="space-y-3">
              {[
                { key: 'Completed', label: t('payment_manage.completed') },
                { key: 'Pending', label: t('payment_manage.pending') },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center space-x-3 text-sm cursor-pointer transition-colors duration-150 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                >
                  <input
                    type="checkbox"
                    checked={statusFilters[item.key]}
                    onChange={() => {
                      setStatusFilters((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }));
                    }}
                    className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={() => {
                  applyFilters();
                  toggleStatusPopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {t('payment_manage.apply')}
              </button>
              <button
                onClick={() => toggleStatusPopup(new Event('click'))}
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
