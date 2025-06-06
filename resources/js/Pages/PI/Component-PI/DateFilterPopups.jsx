import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MuiStyleDatePicker from '../../../BELLY/Component/DatePicker/DatePicker';

const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

export default function DateFilterPopups({
  darkMode,
  isDatePopupOpen,
  isArrivalDatePopupOpen,
  isDateAnimatingOut,
  isArrivalDateAnimatingOut,
  startDate,
  endDate,
  startArrivalDate,
  endArrivalDate,
  datePopupPosition,
  arrivalDatePopupPosition,
  setStartDate,
  setEndDate,
  setStartArrivalDate,
  setEndArrivalDate,
  toggleDatePopup,
  toggleArrivalDatePopup,
  applyFilters,
}) {
  const { t } = useTranslation();

  // State for tracking status checkboxes (all checked by default)
  const [trackingStatuses, setTrackingStatuses] = useState({
    overdue: true,
    delivered: true,
    onTrack: true,
    missingInfo: true,
  });

  // Update tracking statuses in parent component when changed
  const handleTrackingStatusChange = (status) => {
    setTrackingStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  // Apply filters with tracking statuses
  const handleApplyFilters = () => {
    applyFilters({
      trackingStatuses: Object.keys(trackingStatuses).filter((key) => trackingStatuses[key]),
    });
    toggleArrivalDatePopup(new Event('click'));
  };

  // Reset tracking statuses and dates
  const handleReset = () => {
    setStartArrivalDate('');
    setEndArrivalDate('');
    setTrackingStatuses({
      overdue: true,
      delivered: true,
      onTrack: true,
      missingInfo: true,
    });
    toggleArrivalDatePopup(new Event('click'));
  };

  return (
    <>
      {isDatePopupOpen && (
        <div
          className={`fixed w-80 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform text-[10px] ${
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
            <h3 className="text-center font-semibold mb-4">{t('list_pos.filter_by_date')}</h3>
            <div className="space-y-4">
              <div>
                <label
                  className={`block font-medium mb-1 ${getDarkModeClass(
                    darkMode,
                    'text-gray-300',
                    'text-gray-700'
                  )}`}
                >
                  {t('list_pos.start_date')}
                </label>
                <MuiStyleDatePicker
                  label={t('list_pos.start_date')}
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
                  className={`block font-medium mb-1 ${getDarkModeClass(
                    darkMode,
                    'text-gray-300',
                    'text-gray-700'
                  )}`}
                >
                  {t('list_pos.end_date')}
                </label>
                <MuiStyleDatePicker
                  label={t('list_pos.end_date')}
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
                className={`flex-1 text-center px-4 py-2 font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {t('list_pos.apply')}
              </button>
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  toggleDatePopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 font-medium rounded-md transition-colors duration-150 ${
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

      {isArrivalDatePopupOpen && (
        <div
          className={`fixed w-96 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform text-[10px] ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
          } arrival-date-popup`}
          style={{
            top: `${arrivalDatePopupPosition.top}px`,
            left: `${arrivalDatePopupPosition.left}px`,
            transformOrigin: arrivalDatePopupPosition.transformOrigin,
            animation: isArrivalDateAnimatingOut
              ? 'shrinkToPoint 0.2s ease-out forwards'
              : 'growFromPoint 0.2s ease-out forwards',
          }}
        >
          <div className="p-4">
            <h3 className="text-center font-semibold mb-4">{t('list_pis.filter_by_arrival_date')}</h3>
            <div className="flex space-x-4">
              {/* Column 1: Date Pickers */}
              <div className="flex-1 space-y-4">
                <div>
                  <label
                    className={`block font-medium mb-1 ${getDarkModeClass(
                      darkMode,
                      'text-gray-300',
                      'text-gray-700'
                    )}`}
                  >
                    {t('list_pos.start_date')}
                  </label>
                  <MuiStyleDatePicker
                    label={t('list_pos.start_date')}
                    value={startArrivalDate}
                    onChange={(value) => setStartArrivalDate(value)}
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
                    className={`block font-medium mb-1 ${getDarkModeClass(
                      darkMode,
                      'text-gray-300',
                      'text-gray-700'
                    )}`}
                  >
                    {t('list_pos.end_date')}
                  </label>
                  <MuiStyleDatePicker
                    label={t('list_pos.end_date')}
                    value={endArrivalDate}
                    onChange={(value) => setEndArrivalDate(value)}
                    darkMode={darkMode}
                    style={{
                      border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                      borderRadius: '0.375rem',
                      backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                    }}
                  />
                </div>
              </div>
              {/* Column 2: Tracking Status Checkboxes */}
              <div className="flex-1 space-y-2">
                <label className={`block font-medium mb-1 ${getDarkModeClass(darkMode, 'text-gray-300', 'text-gray-700')}`}>
                  {t('list_pis.tracking_status')}
                </label>
                {[
                  { key: 'overdue', label: t('list_pis.overdue'), class: 'red-tracking' },
                  { key: 'delivered', label: t('list_pis.delivered'), class: 'green-tracking' },
                  { key: 'onTrack', label: t('list_pis.on_track'), class: 'orange-tracking' },
                  { key: 'missingInfo', label: t('list_pis.missing_info'), class: 'gray-tracking' },
                ].map((status) => (
                  <label key={status.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={trackingStatuses[status.key]}
                      onChange={() => handleTrackingStatusChange(status.key)}
                      className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                    />
                    <div className={`${status.class} w-3 h-3 rounded-full`} />
                    <span className={getDarkModeClass(darkMode, 'text-gray-300', 'text-gray-700')}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={handleApplyFilters}
                className={`flex-1 text-center px-4 py-2 font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {t('list_pos.apply')}
              </button>
              <button
                onClick={handleReset}
                className={`flex-1 text-center px-4 py-2 font-medium rounded-md transition-colors duration-150 ${
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
