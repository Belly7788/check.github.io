import { Link, Head } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { FaPlus, FaEllipsisV } from "react-icons/fa";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import { useTranslation } from "react-i18next";
import '../../BELLY/Component/Gallery/gallery_belly';

export default function UserManager({ darkMode }) {
    const { t } = useTranslation();

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const totalEntries = 100;
    const entriesPerPage = 25;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    // State for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // State for row dropdown
    const [expandedRow, setExpandedRow] = useState(null);

    // State for action dropdown
    const [openActionDropdown, setOpenActionDropdown] = useState(null);

    // State for form inputs
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [roleSearch, setRoleSearch] = useState("");
    const [branchDefaultSearch, setBranchDefaultSearch] = useState("");
    const [branchMultipleSearch, setBranchMultipleSearch] = useState("");
    const [companySearch, setCompanySearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedBranchDefault, setSelectedBranchDefault] = useState("");
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");

    // State for dropdown visibility
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isBranchDefaultDropdownOpen, setIsBranchDefaultDropdownOpen] = useState(false);
    const [isBranchMultipleDropdownOpen, setIsBranchMultipleDropdownOpen] = useState(false);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

    // Dummy data for dropdowns
    const roles = ["Admin", "Manager", "Staff", "Guest"];
    const branches = ["Branch A", "Branch B", "Branch C", "Branch D", "Branch E", "Branch F", "Branch G", "Branch H"];
    const companies = ["Company X", "Company Y", "Company Z"];

    // Refs for dropdown containers
    const roleRef = useRef(null);
    const branchDefaultRef = useRef(null);
    const branchMultipleRef = useRef(null);
    const companyRef = useRef(null);

    // Popup controls
    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => {
        setIsPopupOpen(false);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setSelectedRole("");
        setSelectedBranchDefault("");
        setSelectedBranches([]);
        setSelectedCompany("");
        setRoleSearch("");
        setBranchDefaultSearch("");
        setBranchMultipleSearch("");
        setCompanySearch("");
    };

    // Toggle row dropdown
    const toggleRowDropdown = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    // Handle dropdown visibility
    const toggleRoleDropdown = () => setIsRoleDropdownOpen(!isRoleDropdownOpen);
    const toggleBranchDefaultDropdown = () => setIsBranchDefaultDropdownOpen(!isBranchDefaultDropdownOpen);
    const toggleBranchMultipleDropdown = () => setIsBranchMultipleDropdownOpen(!isBranchMultipleDropdownOpen);
    const toggleCompanyDropdown = () => setIsCompanyDropdownOpen(!isCompanyDropdownOpen);

    // Filter and sort dropdown options
    const filteredRoles = roles
        .filter((role) => role.toLowerCase().includes(roleSearch.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    const filteredBranches = branches
        .filter((branch) => branch.toLowerCase().includes(branchDefaultSearch.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    const filteredMultipleBranches = branches
        .filter((branch) => branch.toLowerCase().includes(branchMultipleSearch.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    const filteredCompanies = companies
        .filter((company) => company.toLowerCase().includes(companySearch.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    // Handle branch multiple selection
    const handleBranchSelect = (branch) => {
        if (!selectedBranches.includes(branch)) {
            setSelectedBranches([...selectedBranches, branch]);
        } else {
            setSelectedBranches(selectedBranches.filter((b) => b !== branch));
        }
        setBranchMultipleSearch("");
    };

    // Remove selected branch
    const removeBranch = (branch) => {
        setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    };

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleRef.current && !roleRef.current.contains(event.target)) {
                setIsRoleDropdownOpen(false);
            }
            if (branchDefaultRef.current && !branchDefaultRef.current.contains(event.target)) {
                setIsBranchDefaultDropdownOpen(false);
            }
            if (branchMultipleRef.current && !branchMultipleRef.current.contains(event.target)) {
                setIsBranchMultipleDropdownOpen(false);
            }
            if (companyRef.current && !companyRef.current.contains(event.target)) {
                setIsCompanyDropdownOpen(false);
            }
            if (!event.target.closest(".action-container")) {
                setOpenActionDropdown(null);
            }
        };

        const handleEsc = (event) => {
            if (event.key === "Escape") {
                closePopup();
                setExpandedRow(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleEsc);
        };
    }, []);

    return (
        <>
            <Head title={t("user_manager")} />

            <div
                className={`w-full rounded-lg shadow-md ${getDarkModeClass(
                    darkMode,
                    "bg-[#1A1A1A] text-gray-200",
                    "bg-white text-gray-900"
                )}`}
                style={{ fontFamily: "'Battambang', 'Roboto', sans-serif" }}
            >
                <div className="w-full mx-auto p-2">
                    {/* Search and Buttons */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-1/3">
                            <input
                                type="text"
                                placeholder={t("search_placeholder")}
                                className={`w-full p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                    "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                                )}`}
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={openPopup}
                                className={`flex items-center text-sm px-4 py-2 rounded-lg transition ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                    "bg-[#ff8800] text-white hover:bg-[#f7b500]"
                                )}`}
                            >
                                <FaPlus className="mr-2" /> {t("add_new")}
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="relative overflow-x-auto rounded-lg text-sm h-[calc(100vh-14rem)] mx-auto custom-scrollbar">
                        <div className="w-full min-w-max">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr
                                        className={`${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] border-b border-gray-700",
                                            "bg-[#ff8800]"
                                        )}`}
                                    >
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("no")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("profile")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("username")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("role")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("action")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: entriesPerPage }).map((_, index) => {
                                        const itemIndex = (currentPage - 1) * entriesPerPage + index;
                                        if (itemIndex >= totalEntries) return null;
                                        return (
                                            <tr
                                                key={itemIndex}
                                                onClick={() => toggleRowDropdown(itemIndex)}
                                                className={`border-b cursor-pointer ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                    "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                )}`}
                                            >
                                                <td className="p-3">{itemIndex + 1}</td>
                                                <td className="p-3">
                                                    <img
                                                        src="/uoloads/profile_user/IMG_9071.JPG"
                                                        className="w-12 h-12 object-cover rounded-full"
                                                        loading="lazy"
                                                        data-kheng-chetra="belly-gallery-profile"
                                                    />
                                                </td>
                                                <td className="p-3">user{String(itemIndex + 1).padStart(3, "0")}</td>
                                                <td className="p-3">{roles[itemIndex % roles.length]}</td>
                                                <td className="p-3">
                                                    <div className="relative action-container">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenActionDropdown(
                                                                    openActionDropdown === itemIndex ? null : itemIndex
                                                                );
                                                            }}
                                                            className={`text-gray-500 hover:text-[#ff8800] p-2 rounded transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:drop-shadow-[0_0_8px_rgba(255,136,0,0.8)]",
                                                                "hover:bg-orange-100"
                                                            )}`}
                                                        >
                                                            <FaEllipsisV className="w-5 h-5" />
                                                        </button>
                                                        {openActionDropdown === itemIndex && (
                                                            <div
                                                                className={`absolute right-20 w-40 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-200",
                                                                    "bg-white text-gray-900"
                                                                )}`}
                                                            >
                                                                <button
                                                                    className={`w-full text-left hover:rounded px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                                        darkMode,
                                                                        "hover:bg-[#3A3A3A]",
                                                                        "hover:bg-gray-100"
                                                                    )}`}
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4 mr-2 text-orange-400"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                        />
                                                                    </svg>
                                                                    {t("edit")}
                                                                </button>
                                                                <button
                                                                    className={`w-full text-left px-4 hover:rounded py-2 text-sm flex items-center ${getDarkModeClass(
                                                                        darkMode,
                                                                        "hover:bg-[#3A3A3A]",
                                                                        "hover:bg-gray-100"
                                                                    )}`}
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4 mr-2 text-red-400"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H8V5a2 2 0 012-2z"
                                                                        />
                                                                    </svg>
                                                                    {t("delete")}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end items-center mt-4 space-x-2 text-sm">
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                                        onClick={() => setCurrentPage(1)}
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
                                        onClick={() => setCurrentPage(page + 1)}
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
                                        onClick={() => setCurrentPage(totalPages)}
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
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                                onChange={(e) => {
                                    const newEntriesPerPage = Number(e.target.value);
                                    console.log("Change entries per page:", newEntriesPerPage);
                                    setCurrentPage(1);
                                }}
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
                                defaultValue={currentPage}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        const page = Number(e.target.value);
                                        if (page >= 1 && page <= totalPages && !isNaN(page)) {
                                            setCurrentPage(page);
                                        }
                                    }
                                }}
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
                </div>

                {/* Popup for Adding New User */}
                <div
                    id="add-new-popup"
                    className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
                        isPopupOpen ? "bg-opacity-60 opacity-100 visible" : "bg-opacity-0 opacity-0 invisible"
                    }`}
                >
                    <div
                        className={`rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${getDarkModeClass(
                            darkMode,
                            "bg-[#1A1A1A] text-gray-200",
                            "bg-white text-gray-900"
                        )} ${isPopupOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 -translate-y-4 opacity-0"} popup-content`}
                    >
                        <div
                            className={`p-8 pb-0 sticky top-0 z-10 rounded-t-xl ${getDarkModeClass(
                                darkMode,
                                "bg-[#1A1A1A]",
                                "bg-white"
                            )}`}
                        >
                            <h2
                                className={`text-2xl font-bold mb-6 flex items-center ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-200",
                                    "text-gray-800"
                                )}`}
                            >
                                <svg
                                    className="w-6 h-6 mr-2 text-orange-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                {t("add_new_user")}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                            <form id="add-user-form" className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("username")}
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("enter_username")}
                                        />
                                    </div>
                                    <div className="relative" ref={roleRef}>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("role")}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={roleSearch || selectedRole}
                                                onChange={(e) => setRoleSearch(e.target.value)}
                                                onClick={toggleRoleDropdown}
                                                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("search_role_placeholder")}
                                            />
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
                                                    isRoleDropdownOpen ? "transform rotate-180" : ""
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                onClick={toggleRoleDropdown}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                        {isRoleDropdownOpen && (
                                            <div
                                                className={`absolute z-10 w-full border custom-scrollbar rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                            >
                                                {filteredRoles.length > 0 ? (
                                                    filteredRoles.map((role) => (
                                                        <div
                                                            key={role}
                                                            onClick={() => {
                                                                setSelectedRole(role);
                                                                setRoleSearch("");
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className={`py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:bg-[#3A3A3A]",
                                                                "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {role}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div
                                                        className={`py-2 px-4 ${getDarkModeClass(
                                                            darkMode,
                                                            "hover:bg-[#3A3A3A]",
                                                            "hover:bg-gray-100"
                                                        )} cursor-pointer`}
                                                    >
                                                        {t("no_data")}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative" ref={branchDefaultRef}>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("branch_default")}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={branchDefaultSearch || selectedBranchDefault}
                                                onChange={(e) => setBranchDefaultSearch(e.target.value)}
                                                onClick={toggleBranchDefaultDropdown}
                                                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("search_branch_default_placeholder")}
                                            />
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
                                                    isBranchDefaultDropdownOpen ? "transform rotate-180" : ""
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                onClick={toggleBranchDefaultDropdown}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                        {isBranchDefaultDropdownOpen && (
                                            <div
                                                className={`absolute z-10 w-full border rounded-lg mt-1 max-h-60 custom-scrollbar overflow-y-auto shadow-lg ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                            >
                                                {filteredBranches.length > 0 ? (
                                                    filteredBranches.map((branch) => (
                                                        <div
                                                            key={branch}
                                                            onClick={() => {
                                                                setSelectedBranchDefault(branch);
                                                                setBranchDefaultSearch("");
                                                                setIsBranchDefaultDropdownOpen(false);
                                                            }}
                                                            className={`py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:bg-[#3A3A3A]",
                                                                "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {branch}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div
                                                        className={`py-2 px-4 ${getDarkModeClass(
                                                            darkMode,
                                                            "hover:bg-[#3A3A3A]",
                                                            "hover:bg-gray-100"
                                                        )} cursor-pointer`}
                                                    >
                                                        {t("no_data")}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative" ref={branchMultipleRef}>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("branch_multiple")}
                                        </label>
                                        <div className="relative">
                                            <div
                                                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )} min-h-[44px] flex flex-wrap gap-2`}
                                                onClick={toggleBranchMultipleDropdown}
                                            >
                                                {selectedBranches.length > 0 ? (
                                                    selectedBranches.map((branch) => (
                                                        <div
                                                            key={branch}
                                                            className="flex items-center bg-[#ff8800]/20 text-[#ff8800] rounded px-2 py-1 text-sm"
                                                        >
                                                            {branch}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeBranch(branch);
                                                                }}
                                                                className="ml-2"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={branchMultipleSearch}
                                                        onChange={(e) => setBranchMultipleSearch(e.target.value)}
                                                        className={`w-full bg-transparent outline-none ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-300",
                                                            "text-gray-900"
                                                        )}`}
                                                        placeholder={t("search_branch_multiple_placeholder")}
                                                    />
                                                )}
                                            </div>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
                                                    isBranchMultipleDropdownOpen ? "transform rotate-180" : ""
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                onClick={toggleBranchMultipleDropdown}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                        {isBranchMultipleDropdownOpen && (
                                            <div
                                                className={`absolute z-10 w-full border rounded-lg mt-1 max-h-60 custom-scrollbar overflow-y-auto shadow-lg ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                            >
                                                {filteredMultipleBranches.length > 0 ? (
                                                    filteredMultipleBranches.map((branch) => (
                                                        <div
                                                            key={branch}
                                                            onClick={() => handleBranchSelect(branch)}
                                                            className={`flex items-center py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                selectedBranches.includes(branch)
                                                                    ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                                    : "hover:bg-[#3A3A3A]",
                                                                selectedBranches.includes(branch)
                                                                    ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                                    : "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {selectedBranches.includes(branch) && (
                                                                <svg
                                                                    className="w-4 h-4 mr-2"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            )}
                                                            {branch}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div
                                                        className={`py-2 px-4 ${getDarkModeClass(
                                                            darkMode,
                                                            "hover:bg-[#3A3A3A]",
                                                            "hover:bg-gray-100"
                                                        )} cursor-pointer`}
                                                    >
                                                        {t("no_data")}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("password")}
                                        </label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("enter_password")}
                                        />
                                    </div>
                                    <div className="relative" ref={companyRef}>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("company")}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={companySearch || selectedCompany}
                                                onChange={(e) => setCompanySearch(e.target.value)}
                                                onClick={toggleCompanyDropdown}
                                                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("search_company_placeholder")}
                                            />
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
                                                    isCompanyDropdownOpen ? "transform rotate-180" : ""
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                onClick={toggleCompanyDropdown}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                        {isCompanyDropdownOpen && (
                                            <div
                                                className={`absolute z-10 w-full border rounded-lg mt-1 max-h-60 custom-scrollbar overflow-y-auto shadow-lg ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                            >
                                                {filteredCompanies.length > 0 ? (
                                                    filteredCompanies.map((company) => (
                                                        <div
                                                            key={company}
                                                            onClick={() => {
                                                                setSelectedCompany(company);
                                                                setCompanySearch("");
                                                                setIsCompanyDropdownOpen(false);
                                                            }}
                                                            className={`py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:bg-[#3A3A3A]",
                                                                "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {company}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div
                                                        className={`py-2 px-4 ${getDarkModeClass(
                                                            darkMode,
                                                            "hover:bg-[#3A3A3A]",
                                                            "hover:bg-gray-100"
                                                        )} cursor-pointer`}
                                                    >
                                                        {t("no_data")}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>


                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("confirm_password")}
                                        </label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("confirm_password")}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={showPassword}
                                                onChange={() => setShowPassword(!showPassword)}
                                                className="mr-2"
                                            />
                                            <span
                                                className={`text-sm ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("show_password")}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div
                            className={`rounded-b-xl p-8 pt-0 sticky bottom-0 z-10 ${getDarkModeClass(
                                darkMode,
                                "bg-[#1A1A1A]",
                                "bg-white"
                            )}`}
                        >
                            <div className="flex justify-end items-center space-x-4">
                                <button
                                    type="button"
                                    id="cancel-btn"
                                    onClick={closePopup}
                                    className={`${getDarkModeClass(
                                        darkMode,
                                        "bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]",
                                        "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-sm`}
                                >
                                    {t("cancel")} (ESC)
                                </button>
                                <button
                                    type="submit"
                                    form="add-user-form"
                                    className={`border ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md`}
                                >
                                    {t("save")} (CTRL + ENTER)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

UserManager.title = "user";
UserManager.subtitle = "user_manager";
