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

    // NEW LOGIC: 1=Not out yet, 2=On Track, 3=Delivered, 4=Overdue
    const [trackingStatuses, setTrackingStatuses] = useState({
        notOutYet: true,   // Status 1
        onTrack: true,     // Status 2
        delivered: true,   // Status 3
        overdue: true,     // Status 4
    });

    const handleTrackingStatusChange = (status) => {
        setTrackingStatuses((prev) => ({
            ...prev,
            [status]: !prev[status],
        }));
    };

    const handleApplyFilters = () => {
        const statusArray = [];
        if (trackingStatuses.notOutYet) statusArray.push(1);
        if (trackingStatuses.onTrack) statusArray.push(2);
        if (trackingStatuses.delivered) statusArray.push(3);
        if (trackingStatuses.overdue) statusArray.push(4);

        applyFilters({
            trackingStatuses: statusArray,
        });
        toggleArrivalDatePopup(new Event('click'));
    };

    const handleReset = () => {
        setStartArrivalDate('');
        setEndArrivalDate('');
        setTrackingStatuses({
            notOutYet: true,
            onTrack: true,
            delivered: true,
            overdue: true,
        });
        applyFilters({
            trackingStatuses: [1, 2, 3, 4],
        });
        toggleArrivalDatePopup(new Event('click'));
    };

    return (
        <>
            {/* Date Popup */}
            {isDatePopupOpen && (
                <div
                    className={`fixed w-80 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform text-[12px] ${
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
                        <h3 className="text-center font-semibold mb-4">{t('list_pis.filter_by_date')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label
                                    className={`block font-medium mb-1 ${getDarkModeClass(
                                        darkMode,
                                        'text-gray-300',
                                        'text-gray-700'
                                    )}`}
                                >
                                    {t('list_pis.start_date')}
                                </label>
                                <MuiStyleDatePicker
                                    label={t('list_pis.start_date')}
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
                                    {t('list_pis.end_date')}
                                </label>
                                <MuiStyleDatePicker
                                    label={t('list_pis.end_date')}
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
                                {t('list_pis.apply')}
                            </button>
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    applyFilters();
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

            {/* Arrival Date Popup with Tracking Status */}
            {isArrivalDatePopupOpen && (
                <div
                    className={`fixed w-[32rem] rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform text-[12px] ${
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
                                        {t('list_pis.start_date')}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t('list_pis.start_date')}
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
                                        {t('list_pis.end_date')}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t('list_pis.end_date')}
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
                            <div className="flex-1 space-y-3">
                                <label className={`block font-medium mb-2 ${getDarkModeClass(darkMode, 'text-gray-300', 'text-gray-700')}`}>
                                    {t('list_pis.tracking_status')}
                                </label>
                                {[
                                    { key: 'overdue', label: t('list_pis.overdue'), class: 'red-tracking', value: 4 },
                                    { key: 'delivered', label: t('list_pis.delivered'), class: 'green-tracking', value: 3 },
                                    { key: 'onTrack', label: t('list_pis.on_track'), class: 'orange-tracking', value: 2 },
                                    { key: 'notOutYet', label: t('list_pis.not_out_yet'), class: 'gray-tracking', value: 1 },
                                ].map((status) => (
                                    <label key={status.key} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={trackingStatuses[status.key]}
                                            onChange={() => handleTrackingStatusChange(status.key)}
                                            className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 cursor-pointer"
                                        />
                                        <div className={`${status.class} w-3 h-3 rounded-full`} />
                                        <span className={`text-sm ${getDarkModeClass(darkMode, 'text-gray-300', 'text-gray-700')}`}>
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
                                {t('list_pis.apply')}
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