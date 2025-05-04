import { Link, Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FaPlus, FaEllipsisV } from "react-icons/fa";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import { useTranslation } from "react-i18next";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showConfirmAlert } from "../../Component/Confirm-Alert/Confirm-Alert";
import Spinner from "../../Component/spinner/spinner";
import Pagination from "../../Component/Pagination/Pagination";
import Bellypopover from '../../BELLY/Component/Popover/Popover';
import Clipboard from '../../BELLY/Component/Clipboard/Clipboard';
import TableLoading from "../../Component/Loading/TableLoading/TableLoading";

export default function RoleManager({ darkMode, roles, filters, flash }) {
    const { t } = useTranslation();

    // State for pagination
    const [currentPage, setCurrentPage] = useState(roles.current_page || 1);
    const totalEntries = roles.total || 0;
    const [entriesPerPage, setEntriesPerPage] = useState(roles.per_page || 25);

    // State for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editRoleId, setEditRoleId] = useState(null);

    // State for form
    const [formData, setFormData] = useState({
        rolename: "",
        desc: "",
        permissionid: null,
    });

    // State for search
    const [searchQuery, setSearchQuery] = useState(filters.search || "");

    // State for row dropdown
    const [expandedRow, setExpandedRow] = useState(null);

    // State for action dropdown
    const [openActionDropdown, setOpenActionDropdown] = useState(null);

    // State for loading
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingRole, setIsFetchingRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // New loading state

    // Popup controls
    const openPopup = (edit = false, role = null) => {
        setIsEditMode(edit);
        if (edit && role) {
            setEditRoleId(role.id);
            setFormData({
                rolename: role.rolename,
                desc: role.desc || "",
                permissionid: role.permissionid || null,
            });
        } else {
            setEditRoleId(null);
            setFormData({ rolename: "", desc: "", permissionid: null });
        }
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setIsEditMode(false);
        setEditRoleId(null);
        setFormData({ rolename: "", desc: "", permissionid: null });
    };

    // Toggle row dropdown
    const toggleRowDropdown = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        const method = isEditMode ? "put" : "post";
        const url = isEditMode ? `/settings/role/${editRoleId}` : "/settings/role";

        router[method](url, formData, {
            onSuccess: () => {
                setIsSaving(false);
                closePopup();
                showSuccessAlert({
                    title: t("success"),
                    message: isEditMode ? t("role_updated_successfully") : t("role_created_successfully"),
                    darkMode,
                    timeout: 3000,
                });
            },
            onError: (errors) => {
                setIsSaving(false);
                const errorMessage = errors.rolename ? t("rolename_taken") : Object.values(errors).join(", ") || t("failed_to_save");
                showErrorAlert({
                    title: t("error"),
                    message: errorMessage,
                    darkMode,
                });
            },
            preserveScroll: true,
        });
    };

    const handleDelete = (roleId) => {
        showConfirmAlert({
            title: t("confirm_delete_title"),
            message: t("confirm_delete"),
            darkMode,
            onConfirm: () => {
                router.delete(`/settings/role/${roleId}`, {
                    onSuccess: () => {
                        showSuccessAlert({
                            title: t("success"),
                            message: t("role_deleted_successfully"),
                            darkMode,
                            timeout: 3000,
                        });
                    },
                    onError: () => {
                        showErrorAlert({
                            title: t("error"),
                            message: t("failed_to_delete"),
                            darkMode,
                        });
                    },
                    preserveScroll: true,
                });
            },
        });
    };

    // Handle search
    const handleSearch = (e) => {
        if (e.key === "Enter") {
            setIsLoading(true); // Show loading when searching
            router.get(
                "/settings/role/role-management",
                { search: searchQuery, per_page: entriesPerPage, page: 1 },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsLoading(false), // Hide loading after fetch
                }
            );
        }
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        setIsLoading(true); // Show loading when changing page
        router.get(
            "/settings/role/role-management",
            { search: searchQuery, per_page: entriesPerPage, page },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false), // Hide loading after fetch
            }
        );
    };

    // Handle entries per page change
    const handleEntriesPerPageChange = (e) => {
        const newEntriesPerPage = Number(e.target.value);
        const newTotalPages = Math.ceil(totalEntries / newEntriesPerPage);
        let newPage = currentPage;

        if (currentPage > newTotalPages) {
            newPage = newTotalPages || 1;
        }

        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(newPage);
        setIsLoading(true); // Show loading when changing entries per page
        router.get(
            "/settings/role/role-management",
            { search: searchQuery, per_page: newEntriesPerPage, page: newPage },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false), // Hide loading after fetch
            }
        );
    };

    // Fetch role data for edit
    const handleEditClick = (roleId) => {
        setIsFetchingRole(roleId);
        fetch(`/settings/role/${roleId}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setIsFetchingRole(null);
                openPopup(true, data);
            })
            .catch((error) => {
                setIsFetchingRole(null);
                // console.error('Error fetching role data:', error);
                showErrorAlert({
                    title: t("error"),
                    message: t("failed_to_fetch_role"),
                    darkMode,
                });
            });
    };

    // Handle ESC and click outside
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                closePopup();
                setExpandedRow(null);
            }
        };
        const handleClickOutside = (event) => {
            if (!event.target.closest(".action-container")) {
                setOpenActionDropdown(null);
            }
        };
        window.addEventListener("keydown", handleEsc);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleCtrlEnter = (event) => {
            if (event.ctrlKey && event.key === "Enter" && isPopupOpen && !isSaving) {
                event.preventDefault();
                // console.log("Ctrl + Enter pressed, attempting to click submit button");
                const submitButton = document.getElementById("submit-role-btn");
                if (submitButton) {
                    // console.log("Submit button found, triggering click");
                    submitButton.click();
                } else {
                    console.error("Submit button not found");
                }
            }
        };

        window.addEventListener("keydown", handleCtrlEnter);
        return () => {
            window.removeEventListener("keydown", handleCtrlEnter);
        };
    }, [isPopupOpen, isSaving]);

    return (
        <>
            <Head title={t("role_list")} />

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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearch}
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
                                onClick={() => openPopup(false)}
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
                                        className={` ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] border-b border-gray-700",
                                            "bg-[#ff8800]"
                                        )}`}
                                    >
                                        <th
                                            className={`w-28 p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
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
                                            {t("role_name")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("description")}
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
                                {isLoading ? (
                                    <TableLoading darkMode={darkMode} rowCount={entriesPerPage} colCount={4} />
                                ) : (
                                    <tbody>
                                        {roles.data.map((role, index) => (
                                            <tr
                                                key={role.id}
                                                onClick={() => toggleRowDropdown(index)}
                                                className={`border-b cursor-pointer ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#1a1a1a] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                    "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                )}`}
                                            >
                                                <td className="p-3">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                                                <td className="p-3">
                                                    <Bellypopover darkMode={darkMode}>
                                                        <Clipboard darkMode={darkMode} textToCopy={role.rolename}>
                                                            <span
                                                                className={`rounded-lg pr-1 pl-1 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-indigo-900/30 text-blue-700",
                                                                    "bg-indigo-100 text-blue-800"
                                                                )}`}
                                                                data-belly-caption={role.rolename}
                                                            >
                                                                {role.rolename.length > 20
                                                                    ? `${role.rolename.substring(0, 17)}...`
                                                                    : role.rolename}
                                                            </span>
                                                        </Clipboard>
                                                    </Bellypopover>
                                                </td>
                                                <td className="p-3">
                                                    {role.desc ? (
                                                        <Bellypopover darkMode={darkMode}>
                                                            <Clipboard darkMode={darkMode} textToCopy={role.desc}>
                                                                <span
                                                                    className={`rounded-[5px] pr-1 pl-1 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-rose-900/30 text-rose-200",
                                                                        "bg-rose-100 text-rose-800"
                                                                    )}`}
                                                                    data-belly-caption={role.desc}
                                                                >
                                                                    {role.desc.length > 20 ? `${role.desc.substring(0, 17)}...` : role.desc}
                                                                </span>
                                                            </Clipboard>
                                                        </Bellypopover>
                                                    ) : (
                                                        ""
                                                    )}
                                                </td>
                                                <td className="p-3 w-36">
                                                    <div className="relative action-container">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenActionDropdown(
                                                                    openActionDropdown === role.id ? null : role.id
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
                                                        {openActionDropdown === role.id && (
                                                            <div
                                                                className={`absolute w-40 right-20 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-200",
                                                                    "bg-white text-gray-900"
                                                                )}`}
                                                            >
                                                                <button
                                                                    onClick={() => handleEditClick(role.id)}
                                                                    disabled={isFetchingRole === role.id}
                                                                    className={`w-full text-left hover:rounded px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                                        darkMode,
                                                                        "hover:bg-[#3A3A3A]",
                                                                        "hover:bg-gray-100"
                                                                    )} ${isFetchingRole === role.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {isFetchingRole === role.id ? (
                                                                        <Spinner width="16px" height="16px" borderColor="#e5e7eb"  // ពណ៌ខៀវ
                                                                                    borderBgColor="#ff8800" // ពណ៌ប្រផេះ
                                                                                    borderWidth="3px"
                                                                        duration="0.8s" className="mr-2" />
                                                                    ) : (
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
                                                                                d="M11 5H6a2 2 0 000 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                    {t("edit")}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(role.id)}
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
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        darkMode={darkMode}
                        currentPage={currentPage}
                        totalEntries={totalEntries}
                        entriesPerPage={entriesPerPage}
                        onPageChange={handlePageChange}
                        onEntriesPerPageChange={handleEntriesPerPageChange}
                    />
                </div>

                {/* Popup for Adding/Editing Role */}
                <div
                    id="add-new-popup"
                    className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
                        isPopupOpen ? "bg-opacity-60 opacity-100 visible" : "bg-opacity-0 opacity-0 invisible"
                    }`}
                >
                    <div
                        className={`rounded-xl shadow-2xl w-full max-w-[35rem] max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${getDarkModeClass(
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
                                {isEditMode ? t("edit_role") : t("add_new_role")}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                            <form id="add-role-form" onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("role_name")}
                                    </label>
                                    <input
                                        type="text"
                                        name="rolename"
                                        value={formData.rolename}
                                        onChange={(e) => setFormData({ ...formData, rolename: e.target.value })}
                                        className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder={t("enter_role_name")}
                                    />
                                </div>
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("description")}
                                    </label>
                                    <textarea
                                        name="desc"
                                        value={formData.desc}
                                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                        className={`w-full h-[10rem] custom-scrollbar border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                        rows="4"
                                        placeholder={t("enter_description")}
                                    />
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
                                    id="submit-role-btn"
                                    form="add-role-form"
                                    disabled={isSaving}
                                    className={`border flex items-center justify-center ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? (
                                        <Spinner width="18px" height="18px" borderColor="#e5e7eb"  // ពណ៌ខៀវ
                                                borderBgColor="#ff8800" // ពណ៌ប្រផេះ
                                                borderWidth="3px"
                                            duration="0.8s" className="mr-2" />
                                    ) : (
                                        t("save")
                                    )}
                                    {isSaving ? '' : ' (CTRL + ENTER)'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

RoleManager.title = "role";
RoleManager.subtitle = "role_list";
