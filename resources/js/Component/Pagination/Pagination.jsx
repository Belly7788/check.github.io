import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDarkModeClass } from "../../utils/darkModeUtils";

export default function Pagination({
    darkMode,
    currentPage,
    totalEntries,
    entriesPerPage,
    onPageChange,
    onEntriesPerPageChange,
}) {
    const { t } = useTranslation();
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const [inputPage, setInputPage] = useState(currentPage);

    // Sync inputPage with currentPage when currentPage changes
    useEffect(() => {
        setInputPage(currentPage);
    }, [currentPage]);

    // Handle page navigation
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    // Handle input change for "go to page"
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setInputPage(value);
        }
    };

    // Handle "go to page" on Enter key
    const handleInputKeyPress = (e) => {
        if (e.key === "Enter") {
            const page = Number(inputPage);
            if (page >= 1 && page <= totalPages && !isNaN(page)) {
                handlePageChange(page);
            } else {
                setInputPage(currentPage); // Reset to current page if invalid
            }
        }
    };

    return (
        <div className="flex justify-end items-center mt-4 space-x-2 text-sm">
            <div className="flex items-center space-x-1">
                <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`${getDarkModeClass(
                        darkMode,
                        "text-gray-400 hover:text-[#ff8800]",
                        "text-gray-500 hover:text-[#ff8800]"
                    )} px-2 py-1 disabled:opacity-50`}
                >
                    {"<"}
                </button>
                {currentPage > 3 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className={`${getDarkModeClass(
                                darkMode,
                                "text-gray-400 hover:bg-[#3A3A3A]",
                                "text-gray-700 hover:bg-gray-200"
                            )} px-2 py-1 rounded`}
                        >
                            1
                        </button>
                        {currentPage > 4 && (
                            <span
                                className={`${getDarkModeClass(
                                    darkMode,
                                    "text-gray-500",
                                    "text-gray-500"
                                )} px-2 py-1`}
                            >
                                ...
                            </span>
                        )}
                    </>
                )}
                {[...Array(totalPages).keys()]
                    .filter(
                        (page) =>
                            page + 1 >= Math.max(1, currentPage - 2) &&
                            page + 1 <= Math.min(totalPages, currentPage + 2)
                    )
                    .map((page) => (
                        <button
                            key={page + 1}
                            onClick={() => handlePageChange(page + 1)}
                            className={`px-2 py-1 rounded ${getDarkModeClass(
                                darkMode,
                                currentPage === page + 1
                                    ? "bg-[#ff8800] text-white"
                                    : "text-gray-400 hover:bg-[#3A3A3A]",
                                currentPage === page + 1
                                    ? "bg-[#ff8800] text-white"
                                    : "text-gray-700 hover:bg-gray-200"
                            )}`}
                        >
                            {page + 1}
                        </button>
                    ))}
                {currentPage < totalPages - 2 && (
                    <>
                        {currentPage < totalPages - 3 && (
                            <span
                                className={`${getDarkModeClass(
                                    darkMode,
                                    "text-gray-500",
                                    "text-gray-500"
                                )} px-2 py-1`}
                            >
                                ...
                            </span>
                        )}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`${getDarkModeClass(
                                darkMode,
                                "text-gray-400 hover:bg-[#3A3A3A]",
                                "text-gray-700 hover:bg-gray-200"
                            )} px-2 py-1 rounded`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`${getDarkModeClass(
                        darkMode,
                        "text-gray-400 hover:text-[#ff8800]",
                        "text-gray-500 hover:text-[#ff8800]"
                    )} px-2 py-1 disabled:opacity-50`}
                >
                    {">"}
                </button>
            </div>
            <div className="flex items-center space-x-1">
                <select
                    value={entriesPerPage}
                    onChange={onEntriesPerPageChange}
                    className={`${getDarkModeClass(
                        darkMode,
                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                        "bg-white text-gray-700 border-gray-300"
                    )} border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#ff8800]`}
                >
                    <option value="10">10/ {t("page")}</option>
                    <option value="25">25/ {t("page")}</option>
                    <option value="50">50/ {t("page")}</option>
                    <option value="100">100/ {t("page")}</option>
                </select>
            </div>
            <div className="flex items-center space-x-1">
                <span
                    className={`${getDarkModeClass(
                        darkMode,
                        "text-gray-400",
                        "text-gray-700"
                    )}`}
                >
                    {t("go_to")}
                </span>
                <input
                    type="text"
                    value={inputPage}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    className={`${getDarkModeClass(
                        darkMode,
                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                        "bg-white text-gray-700 border-gray-300"
                    )} w-12 p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-[#ff8800]`}
                    min="1"
                    max={totalPages}
                />
                <span
                    className={`${getDarkModeClass(
                        darkMode,
                        "text-gray-400",
                        "text-gray-700"
                    )}`}
                >
                    {t("page")}
                </span>
            </div>
        </div>
    );
}
