import React from 'react';
import { useTranslation } from 'react-i18next';
import MuiStyleDatePicker from '../../../BELLY/Component/DatePicker/DatePicker';

const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

export default function DatePopup({
  darkMode,
  isDatePopupOpen,
  isDateAnimatingOut,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  datePopupPosition,
  toggleDatePopup,
  applyFilters,
}) {
  const { t } = useTranslation();

  return (
    <>
      {isDatePopupOpen && (
        <div
          className={`fixed w-80 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
          } date-popup`}
          style={{
            top: `${datePopupPosition.top}px`,
            left: `${datePopupPosition.left}px`,
            transformOrigin: datePopupPosition.transformOrigin,
            animation: isDateAnimatingOut
              ? 'shrinkToPoint 0.2s ease-out forwards'
              : 'growFromPoint 0.2s ease-out forwards',
          }}
        >
          <div className="p-4">
            <h3 className="text-center font-semibold mb-4">{t('payment_manage.filter_by_date')}</h3>
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                    darkMode,
                    'text-gray-300',
                    'text-gray-700'
                  )}`}
                >
                  {t('payment_manage.start_date')}
                </label>
                <MuiStyleDatePicker
                  label={t('payment_manage.start_date')}
                  value={startDate}
                  onChange={(value) => setStartDate(value)}
                  darkMode={darkMode}
                  style={{
                    border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                    borderRadius: '0.375rem',
                    backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                    darkMode,
                    'text-gray-300',
                    'text-gray-700'
                  )}`}
                >
                  {t('payment_manage.end_date')}
                </label>
                <MuiStyleDatePicker
                  label={t('payment_manage.end_date')}
                  value={endDate}
                  onChange={(value) => setEndDate(value)}
                  darkMode={darkMode}
                  style={{
                    border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                    borderRadius: '0.375rem',
                    backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={() => {
                  applyFilters();
                  toggleDatePopup(new Event('click'));
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
                onClick={() => toggleDatePopup(new Event('click'))}
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
