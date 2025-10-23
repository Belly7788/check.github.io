import React from 'react';
import { useTranslation } from 'react-i18next';

const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

const RemarkPopup = ({ isRemarkPopupOpen, popupStyle, popupText, handlePopupTextChange, cancelRemarkPopup, confirmRemarkPopup, darkMode }) => {
    const { t } = useTranslation();

    return (
        <>
            {isRemarkPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div
                        style={popupStyle}
                        className={`rounded-lg p-0 w-[800px] max-h-[90vh] flex flex-col ${getDarkModeClass(
                            darkMode,
                            "bg-[#2D2D2D] border border-gray-700",
                            "bg-white border border-gray-200"
                        )}`}
                    >
                        <h3
                            className={`text-lg font-semibold p-4 ${getDarkModeClass(
                                darkMode,
                                "text-gray-200 border-b border-gray-700",
                                "text-gray-900 border-b border-gray-200"
                            )}`}
                        >
                            {t("Edit Remark")}
                        </h3>
                        <div className="p-4 flex-1 overflow-auto">
                            <textarea
                                value={popupText}
                                onChange={(e) => handlePopupTextChange(e.target.value)}
                                placeholder={t("Enter Remark")}
                                className={`w-full h-48 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#3A3A3A] text-gray-300 border-gray-600",
                                    "bg-gray-50 text-gray-900 border-gray-300"
                                )}`}
                            />
                        </div>
                        <div
                            className={`p-4 flex justify-end space-x-4 border-t ${getDarkModeClass(
                                darkMode,
                                "border-gray-700",
                                "border-gray-200"
                            )}`}
                        >
                            <button
                                onClick={cancelRemarkPopup}
                                className={`px-4 py-2 rounded-lg text-sm font-medium uppercase ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]",
                                    "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )} transition duration-200`}
                            >
                                {t("Cancel")}
                            </button>
                            <button
                                onClick={confirmRemarkPopup}
                                className={`px-4 py-2 rounded-lg text-sm font-medium uppercase ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#ff8800] text-white hover:bg-[#e07b00]",
                                    "bg-[#ff8800] text-white hover:bg-[#e07b00]"
                                )} transition duration-200`}
                            >
                                {t("Confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RemarkPopup;