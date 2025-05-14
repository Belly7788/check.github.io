import { Link, Head, router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { FaPlus, FaEllipsisV } from "react-icons/fa";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import { useTranslation } from "react-i18next";
import Pagination from "../../Component/Pagination/Pagination";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showConfirmAlert } from "../../Component/Confirm-Alert/Confirm-Alert";
import Spinner from "../../Component/spinner/spinner";
import '../../BELLY/Component/Gallery/gallery_belly';
import TableLoading from "../../Component/Loading/TableLoading/TableLoading";

export default function UserManager({ darkMode, users, pagination, roles, branches, companies, search }) {
    const { t } = useTranslation();

    // State for pagination
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [entriesPerPage, setEntriesPerPage] = useState(pagination.per_page);
    const totalEntries = pagination.total;
    const totalPages = pagination.last_page;

    // State for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // State for row dropdown
    const [expandedRow, setExpandedRow] = useState(null);

    // State for action dropdown
    const [openActionDropdown, setOpenActionDropdown] = useState(null);

    const [isLoading, setIsLoading] = useState(false); // New loading state

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
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [desc, setDesc] = useState("");
    const [image, setImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState(search || "");

    // State for dropdown visibility
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isBranchDefaultDropdownOpen, setIsBranchDefaultDropdownOpen] = useState(false);
    const [isBranchMultipleDropdownOpen, setIsBranchMultipleDropdownOpen] = useState(false);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

    // State for loading
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState({});
    const [isEditing, setIsEditing] = useState({});

    // Refs for dropdown containers
    const roleRef = useRef(null);
    const branchDefaultRef = useRef(null);
    const branchMultipleRef = useRef(null);
    const companyRef = useRef(null);
    const searchInputRef = useRef(null);
    const saveButtonRef = useRef(null);

    // Popup controls
    const openPopup = (user = null) => {
        setEditingUser(user);
        if (user) {
            setUsername(user.username || "");
            setSelectedRole(user.role_id || "");
            setSelectedBranchDefault(user.branch_id || "");
            setSelectedBranches(
                user.branch_id_multiple && Array.isArray(user.branch_id_multiple)
                    ? user.branch_id_multiple.map(id => parseInt(id))
                    : []
            );
            setSelectedCompanies(
                user.company_id_multiple && Array.isArray(user.company_id_multiple)
                    ? user.company_id_multiple.map(id => parseInt(id))
                    : []
            );
            setDesc(user.desc || "");
            setImage(user.image || null);
        } else {
            resetForm();
        }
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setEditingUser(null);
        resetForm();
    };

    const resetForm = () => {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setSelectedRole("");
        setSelectedBranchDefault("");
        setSelectedBranches([]);
        setSelectedCompanies([]);
        setDesc("");
        setImage(null);
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
        .filter((role) => role.name.toLowerCase().includes(roleSearch.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const filteredBranches = branches
        .filter((branch) => branch.name.toLowerCase().includes(branchDefaultSearch.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const filteredMultipleBranches = branches
        .filter((branch) => branch.name.toLowerCase().includes(branchMultipleSearch.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const filteredCompanies = companies
        .filter((company) => company.name.toLowerCase().includes(companySearch.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Handle branch multiple selection
    const handleBranchSelect = (branchId) => {
        branchId = parseInt(branchId);
        if (!selectedBranches.includes(branchId)) {
            setSelectedBranches([...selectedBranches, branchId]);
        } else {
            setSelectedBranches(selectedBranches.filter((b) => b !== branchId));
        }
        setBranchMultipleSearch("");
    };

    // Handle company multiple selection
    const handleCompanySelect = (companyId) => {
        companyId = parseInt(companyId);
        if (!selectedCompanies.includes(companyId)) {
            setSelectedCompanies([...selectedCompanies, companyId]);
        } else {
            setSelectedCompanies(selectedCompanies.filter((c) => c !== companyId));
        }
        setCompanySearch("");
    };

    // Remove selected branch
    const removeBranch = (branchId) => {
        branchId = parseInt(branchId);
        setSelectedBranches(selectedBranches.filter((b) => b !== branchId));
    };

    // Remove selected company
    const removeCompany = (companyId) => {
        companyId = parseInt(companyId);
        setSelectedCompanies(selectedCompanies.filter((c) => c !== companyId));
    };

    // Handle form submission with validation
    const handleSubmit = (e) => {
        e.preventDefault();

        // Password length validation
        if (!editingUser && password.length < 8) {
            showErrorAlert({
                title: t("error"),
                message: t("password_too_short"),
                darkMode,
            });
            return;
        }

        // Password confirmation validation
        if (!editingUser && password !== confirmPassword) {
            showErrorAlert({
                title: t("error"),
                message: t("passwords_do_not_match"),
                darkMode,
            });
            return;
        }

        setIsSaving(true);
        const data = {
            username,
            password,
            password_confirmation: confirmPassword,
            role_id: selectedRole,
            branch_id: selectedBranchDefault || null,
            branch_id_multiple: selectedBranches,
            company_id_multiple: selectedCompanies,
            desc: desc || null,
            image,
        };

        const request = editingUser
            ? router.put(`/settings/user/user-management/${editingUser.id}`, data, {
                  onSuccess: () => {
                      setIsSaving(false);
                      closePopup();
                      showSuccessAlert({
                          title: t("success"),
                          message: t("user_updated_success"),
                          darkMode,
                      });
                  },
                  onError: (errors) => {
                      setIsSaving(false);
                      let errorMessage = t("user_update_failed");
                      if (errors.username) {
                          errorMessage = t("username_exists");
                      } else if (errors.password) {
                          errorMessage = t("password_too_short");
                      } else if (errors.role_id) {
                          errorMessage = t("role_required");
                      }
                      showErrorAlert({
                          title: t("error"),
                          message: errorMessage,
                          darkMode,
                      });
                  },
              })
            : router.post('/settings/user/user-management', data, {
                  onSuccess: () => {
                      setIsSaving(false);
                      closePopup();
                      showSuccessAlert({
                          title: t("success"),
                          message: t("user_created_success"),
                          darkMode,
                      });
                  },
                  onError: (errors) => {
                      setIsSaving(false);
                      let errorMessage = t("user_create_failed");
                      if (errors.username) {
                          errorMessage = t("username_exists");
                      } else if (errors.password) {
                          errorMessage = t("password_too_short");
                      } else if (errors.role_id) {
                          errorMessage = t("role_required");
                      }
                      showErrorAlert({
                          title: t("error"),
                          message: errorMessage,
                          darkMode,
                      });
                  },
              });
    };

    // Handle delete with confirmation
    const handleDelete = (id) => {
        showConfirmAlert({
            title: t("confirm_delete_title"),
            message: t("confirm_delete_message"),
            darkMode,
            isLoading: isDeleting[id],
            onConfirm: () => {
                setIsDeleting((prev) => ({ ...prev, [id]: true }));
                router.put(`/settings/user/user-management/${id}/status`, {}, {
                    onSuccess: () => {
                        setIsDeleting((prev) => ({ ...prev, [id]: false }));
                        setOpenActionDropdown(null);
                        showSuccessAlert({
                            title: t("success"),
                            message: t("user_deleted_success"),
                            darkMode,
                        });
                    },
                    onError: (errors) => {
                        setIsDeleting((prev) => ({ ...prev, [id]: false }));
                        showErrorAlert({
                            title: t("error"),
                            message: errors.message || t("user_delete_failed"),
                            darkMode,
                        });
                    },
                });
            },
        });
    };

    // Handle edit button click with spinner
    const handleEditClick = (user, index) => {
        setIsEditing((prev) => ({ ...prev, [index]: true }));
        setTimeout(() => {
            openPopup(user);
            setIsEditing((prev) => ({ ...prev, [index]: false }));
        }, 500);
    };

    // Handle search
    const handleSearch = () => {
        setIsLoading(true); // Show loading when searching
        router.get(
            '/settings/user/user-management',
            { search: searchTerm, page: 1, per_page: entriesPerPage },
            {
                preserveState: true,
                // replace: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false), // Hide loading after fetch
            }
        );
    };

    // Handle Enter key for search
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle entries per page change
    const handleEntriesPerPageChange = (e) => {
        const newEntriesPerPage = Number(e.target.value);
        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(1);
        setIsLoading(true); // Show loading when searching
        router.get(
            '/settings/user/user-management',
            { page: 1, per_page: newEntriesPerPage, search: searchTerm },
            {
                preserveState: true,
                // replace: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false), // Hide loading after fetch
            }
        );
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        setIsLoading(true); // Show loading when searching
        router.get(
            '/settings/user/user-management',
            { page, per_page: entriesPerPage, search: searchTerm },
            {
                preserveState: true,
                // replace: true
                preserveScroll: true,
                onFinish: () => setIsLoading(false), // Hide loading after fetch
            }
        );
    };

    // Handle Ctrl + Enter for form submission
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'Enter' && isPopupOpen) {
                saveButtonRef.current?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPopupOpen]);

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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                ref={searchInputRef}
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
                                onClick={() => openPopup()}
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
                                            {t("role_name")}
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
                                        <TableLoading darkMode={darkMode} rowCount={entriesPerPage} colCount={5} />
                                    ) : (
                                        <tbody>
                                            {users.map((user, index) => (
                                                <tr
                                                    key={user.id}
                                                    onClick={() => toggleRowDropdown(index)}
                                                    className={`border-b cursor-pointer ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                        "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                    )}`}
                                                >
                                                    <td className="p-3 w-28">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                                                    <td className="p-3">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                                            {user.image ? (
                                                                <img
                                                                    src={user.image}
                                                                    alt="User profile"
                                                                    className="w-full h-full object-cover"
                                                                    loading="lazy"
                                                                    data-kheng-chetra="belly-gallery-profile"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`w-full h-full flex items-center justify-center text-white font-semibold text-lg ${
                                                                        darkMode ? "bg-gray-600" : "bg-orange-500"
                                                                    }`}
                                                                >
                                                                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`label-pink ${getDarkModeClass(
                                                            darkMode,
                                                                "label-pink-darkmode",
                                                                ""
                                                            )}`}
                                                        >
                                                            {user.username}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{user.role?.rolename || ''}</td>
                                                    <td className="p-3 w-36">
                                                        <div className="relative action-container">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenActionDropdown(
                                                                        openActionDropdown === index ? null : index
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
                                                            {openActionDropdown === index && (
                                                                <div
                                                                    className={`absolute right-24 w-40 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-[#2D2D2D] text-gray-200",
                                                                        "bg-white text-gray-900"
                                                                    )}`}
                                                                >
                                                                    <button
                                                                        onClick={() => handleEditClick(user, index)}
                                                                        className={`w-full text-left hover:rounded px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                                            darkMode,
                                                                            "hover:bg-[#3A3A3A]",
                                                                            "hover:bg-gray-100"
                                                                        )}`}
                                                                        disabled={isEditing[index]}
                                                                    >
                                                                        {isEditing[index] ? (
                                                                            <Spinner width="16px" height="16px" className="mr-2" />
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
                                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                                />
                                                                            </svg>
                                                                        )}
                                                                        {t("edit")}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(user.id)}
                                                                        className={`w-full text-left px-4 hover:rounded py-2 text-sm flex items-center ${getDarkModeClass(
                                                                            darkMode,
                                                                            "hover:bg-[#3A3A3A]",
                                                                            "hover:bg-gray-100"
                                                                        )}`}
                                                                        disabled={isDeleting[user.id]}
                                                                    >
                                                                        {isDeleting[user.id] ? (
                                                                            <Spinner width="16px" height="16px" className="mr-2" />
                                                                        ) : (
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
                                                                        )}
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

                    {/* Pagination Component */}
                    <Pagination
                        darkMode={darkMode}
                        currentPage={currentPage}
                        totalEntries={totalEntries}
                        entriesPerPage={entriesPerPage}
                        onPageChange={handlePageChange}
                        onEntriesPerPageChange={handleEntriesPerPageChange}
                    />
                </div>

                {/* Popup for Adding/Editing User */}
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
                                {editingUser ? t("edit_user") : t("add_new_user")}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                            <form id="add-user-form" onSubmit={handleSubmit} className="space-y-6">
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
                                            required
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
                                            {t("role_name")}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={
                                                    roleSearch ||
                                                    (selectedRole
                                                        ? roles.find((r) => r.id === selectedRole)?.name
                                                        : "")
                                                }
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
                                                            key={role.id}
                                                            onClick={() => {
                                                                setSelectedRole(role.id);
                                                                setRoleSearch("");
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className={`py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:bg-[#3A3A3A]",
                                                                "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {role.name}
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
                                                value={
                                                    branchDefaultSearch ||
                                                    (selectedBranchDefault
                                                        ? branches.find((b) => b.id === selectedBranchDefault)?.name
                                                        : "")
                                                }
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
                                                            key={branch.id}
                                                            onClick={() => {
                                                                setSelectedBranchDefault(branch.id);
                                                                setBranchDefaultSearch("");
                                                                setIsBranchDefaultDropdownOpen(false);
                                                            }}
                                                            className={`py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:bg-[#3A3A3A]",
                                                                "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {branch.name}
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
                                                    selectedBranches.map((branchId) => {
                                                        const branch = branches.find((b) => b.id === branchId);
                                                        return (
                                                            <div
                                                                key={branchId}
                                                                className="flex items-center bg-[#ff8800]/20 text-[#ff8800] rounded px-2 py-1 text-sm"
                                                            >
                                                                {branch?.name || `Branch ${branchId}`}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeBranch(branchId);
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
                                                        );
                                                    })
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
                                                            key={branch.id}
                                                            onClick={() => handleBranchSelect(branch.id)}
                                                            className={`flex items-center py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                selectedBranches.includes(branch.id)
                                                                    ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                                    : "hover:bg-[#3A3A3A]",
                                                                selectedBranches.includes(branch.id)
                                                                    ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                                    : "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {selectedBranches.includes(branch.id) && (
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
                                                            {branch.name}
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
                                            required={!editingUser}
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
                                            {t("companies")}
                                        </label>
                                        <div className="relative">
                                            <div
                                                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )} min-h-[44px] flex flex-wrap gap-2`}
                                                onClick={toggleCompanyDropdown}
                                            >
                                                {selectedCompanies.length > 0 ? (
                                                    selectedCompanies.map((companyId) => {
                                                        const company = companies.find((c) => c.id === companyId);
                                                        return (
                                                            <div
                                                                key={companyId}
                                                                className="flex items-center bg-[#ff8800]/20 text-[#ff8800] rounded px-2 py-1 text-sm"
                                                            >
                                                                {company?.name || `Company ${companyId}`}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeCompany(companyId);
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
                                                        );
                                                    })
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={companySearch}
                                                        onChange={(e) => setCompanySearch(e.target.value)}
                                                        className={`w-full bg-transparent outline-none ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-300",
                                                            "text-gray-900"
                                                        )}`}
                                                        placeholder={t("search_company_multiple_placeholder")}
                                                    />
                                                )}
                                            </div>
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
                                                            key={company.id}
                                                            onClick={() => handleCompanySelect(company.id)}
                                                            className={`flex items-center py-2 px-4 ${getDarkModeClass(
                                                                darkMode,
                                                                selectedCompanies.includes(company.id)
                                                                    ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                                    : "hover:bg-[#3A3A3A]",
                                                                selectedCompanies.includes(company.id)
                                                                    ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                                    : "hover:bg-gray-100"
                                                            )} cursor-pointer`}
                                                        >
                                                            {selectedCompanies.includes(company.id) && (
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
                                                            {company.name}
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
                                            placeholder={t("enter_confirm_password")}
                                            required={!editingUser}
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
                                    <div className="col-span-2">
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
                                            value={desc}
                                            onChange={(e) => setDesc(e.target.value)}
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("enter_description")}
                                            rows="4"
                                        />
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
                                    id="save-btn"
                                    type="submit"
                                    form="add-user-form"
                                    ref={saveButtonRef}
                                    disabled={isSaving}
                                    className={`border flex items-center justify-center ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md ${
                                        isSaving ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {isSaving ? (
                                        <Spinner width="16px" height="16px" className="mr-2" />
                                    ) : (
                                        t("save")
                                    )}
                                    {isSaving ? t("saving") : ' (CTRL + ENTER)'}
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
