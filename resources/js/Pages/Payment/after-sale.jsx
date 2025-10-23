import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaEllipsisV } from "react-icons/fa";
import Pagination from "../../Component/Pagination/Pagination";
import NoDataComponent from "../../Component/Empty/NoDataComponent";
import TableLoading from "../../Component/Loading/TableLoading/TableLoading";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showConfirmAlert } from "../../Component/Confirm-Alert/Confirm-Alert";
import NoImageComponent from "../../Component/Empty/NotImage/NotImage";
import { Link, usePage, router } from "@inertiajs/react";
import DropdownInput from "../../Component/DropdownInput/DropdownInput";
import MuiStyleDatePicker from "../../BELLY/Component/DatePicker/DatePicker";
import Spinner from "../../Component/spinner/spinner";
import RemarkPopup from "./RemarkPopup/RemarkPopup";

// Utility function for dark mode class
const getDarkModeClass = (darkMode, darkClass, lightClass) =>
    darkMode ? darkClass : lightClass;

// Format file name to truncate if too long
const formatFileName = (name) => {
    if (name.length > 10) {
        return `${name.substring(0, 10)}...${name.split(".").pop()}`;
    }
    return name;
};

// Format file size for display
const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(0) + " MB";
};

export default function AfterSale({
    data,
    pagination,
    darkMode,
    filters = {},
    dropdownOptions,
}) {
    const { t } = useTranslation();
    const { url } = usePage();

    // State management
    const [tableData, setTableData] = useState(data);
    const [paginationState, setPaginationState] = useState(pagination);
    const [currentPage, setCurrentPage] = useState(pagination.currentPage);
    const [entriesPerPage, setEntriesPerPage] = useState(pagination.perPage);
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCase, setCurrentCase] = useState(null);
    const [openActionDropdown, setOpenActionDropdown] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSearchField, setSelectedSearchField] = useState(
        filters.search_field || "CaseNumber"
    );
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [openRowDropdown, setOpenRowDropdown] = useState(null);
    const [activeTab, setActiveTab] = useState("photo");
    const [tabData, setTabData] = useState({});
    const [isDeleting, setIsDeleting] = useState(null);
    const [thumbnails, setThumbnails] = useState([]);
    const [videos, setVideos] = useState([]);
    const [thumbnailDragging, setThumbnailDragging] = useState(false);
    const [videoDragging, setVideoDragging] = useState(false);
    const thumbnailInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [tableRows, setTableRows] = useState([]);
    const [isRemarkPopupOpen, setIsRemarkPopupOpen] = useState(false);
    const [popupText, setPopupText] = useState("");
    const [originalText, setOriginalText] = useState("");
    const [currentRowIndex, setCurrentRowIndex] = useState(null);
    const [animationState, setAnimationState] = useState("closed");
    const [textareaPosition, setTextareaPosition] = useState({ x: 0, y: 0 });
    const textareaRefs = useRef([]);
    const [videoThumbnails, setVideoThumbnails] = useState({});

    // Status mapping
    const statusMap = {
        1: t("Submit"),
        2: t("Inreview"),
        3: t("Confirmed"),
        4: t("Success"),
    };

    const statusStyles = {
        1: "text-blue-500",
        2: "text-yellow-500",
        3: "text-green-500",
        4: "text-purple-500",
    };

    // Dropdown options from props
    const {
        companyOptions,
        problemTypeOptions,
        whoAffordOptions,
        compensaleMethodOptions,
    } = dropdownOptions || {};

    const columnWidths = {
        caseNumber: 120,
        problem_type: 150,
        company: 150,
        date: 120,
        remark: 200,
        status: 100,
        action: 80,
    };

    // Thumbnail generation function
    const generateThumbnail = (fileOrUrl, isFile = true) => {
        return new Promise((resolve, reject) => {
            const videoElement = document.createElement("video");
            videoElement.src = isFile
                ? URL.createObjectURL(fileOrUrl)
                : fileOrUrl;
            videoElement.preload = "metadata";
            videoElement.onloadedmetadata = () => {
                videoElement.currentTime = 1;
            };
            videoElement.onseeked = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(
                        videoElement,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    resolve(canvas.toDataURL("image/png"));
                } catch (error) {
                    reject(error);
                }
            };
            videoElement.onerror = (err) => {
                reject(err);
            };
        });
    };

    // Update tableData, pagination, and tableRows when props change
    useEffect(() => {
        setTableData(data);
        setPaginationState(pagination);
        setCurrentPage(pagination.currentPage);
        setEntriesPerPage(pagination.perPage);
        setSearchQuery(filters.search || "");
        setSelectedSearchField(filters.search_field || "CaseNumber");

        // Only update thumbnails and videos if currentCase is different or popup is closed
        if (currentCase && currentCase.details && isPopupOpen) {
            setTableRows(currentCase.details.payments || []);

            // Only update thumbnails if they haven't been set yet
            if (thumbnails.length === 0) {
                setThumbnails(
                    currentCase.details.photos?.map((photo, index) => ({
                        id: `${Date.now()}-${index}`,
                        preview: photo,
                        name: `image-${index + 1}.jpg`,
                        size: 0,
                        loading: false,
                        isNew: false,
                    })) || []
                );
            }

            // Only update videos if they haven't been set yet
            if (videos.length === 0) {
                const existingVideos =
                    currentCase.details.videos?.map((videoUrl, index) => ({
                        id: `${Date.now()}-${index}`,
                        preview: null,
                        videoUrl: videoUrl,
                        name: `video-${index + 1}.mp4`,
                        size: 0,
                        loading: true,
                        isNew: false,
                    })) || [];
                setVideos(existingVideos);

                existingVideos.forEach(async (video) => {
                    try {
                        const dataUrl = await generateThumbnail(
                            video.videoUrl,
                            false
                        );
                        setVideos((prev) =>
                            prev.map((v) =>
                                v.id === video.id
                                    ? { ...v, preview: dataUrl, loading: false }
                                    : v
                            )
                        );
                    } catch {
                        setVideos((prev) =>
                            prev.map((v) =>
                                v.id === video.id
                                    ? {
                                          ...v,
                                          preview: "/images/fallback-video.png",
                                          loading: false,
                                      }
                                    : v
                            )
                        );
                    }
                });
            }
        } else if (!isPopupOpen) {
            setTableRows([]);
            setThumbnails([]);
            setVideos([]);
        }
    }, [data, pagination, filters, currentCase, isPopupOpen]); // Added isPopupOpen dependency

    // Handle click outside to close action dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                openActionDropdown !== null &&
                !event.target.closest(".action-container") &&
                !event.target.closest(".relative.action-container > div")
            ) {
                setOpenActionDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [openActionDropdown]);

    // Handle search
    const handleSearch = (e) => {
        if (e.key === "Enter") {
            setIsLoading(true);
            fetchData({
                search: searchQuery,
                search_field: selectedSearchField,
                per_page: entriesPerPage,
                page: 1,
            });
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchData({
            search: searchQuery,
            search_field: selectedSearchField,
            per_page: entriesPerPage,
            page: page,
        });
    };

    // Handle entries per page change
    const handleEntriesPerPageChange = (e) => {
        const newEntriesPerPage = Number(e.target.value);
        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(1);
        fetchData({
            search: searchQuery,
            search_field: selectedSearchField,
            per_page: newEntriesPerPage,
            page: 1,
        });
    };

    // Fetch data using Inertia's router
    const fetchData = (params) => {
        router.get("/payment/after-sale", params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Format date to DD-MMM-YY
    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = d.toLocaleString("en-US", { month: "short" });
        const year = d.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`.toLowerCase();
    };

    // Open edit popup
    // Open edit popup
    const openEditPopup = async (caseItem) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/payment/after-sale/${caseItem.id}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch case data');
            }

            const caseData = await response.json();
            console.log("Fetched case data:", caseData);

            setCurrentCase(caseData);
            setIsEditMode(true);
            setIsPopupOpen(true);
            setTableRows(caseData.details.payments || []);
            setThumbnails(
                caseData.details.photos?.map((photo, index) => ({
                    id: `${Date.now()}-${index}`,
                    preview: photo,
                    name: `image-${index + 1}.jpg`,
                    size: 0,
                    loading: false,
                    isNew: false,
                })) || []
            );
            const existingVideos =
                caseData.details.videos?.map((videoUrl, index) => ({
                    id: `${Date.now()}-${index}`,
                    preview: null,
                    videoUrl: videoUrl,
                    name: `video-${index + 1}.mp4`,
                    size: 0,
                    loading: true,
                    isNew: false,
                })) || [];
            setVideos(existingVideos);

            existingVideos.forEach(async (video) => {
                try {
                    const dataUrl = await generateThumbnail(video.videoUrl, false);
                    setVideos((prev) =>
                        prev.map((v) =>
                            v.id === video.id
                                ? { ...v, preview: dataUrl, loading: false }
                                : v
                        )
                    );
                } catch {
                    setVideos((prev) =>
                        prev.map((v) =>
                            v.id === video.id
                                ? {
                                    ...v,
                                    preview: "/images/fallback-video.png",
                                    loading: false,
                                }
                                : v
                        )
                    );
                }
            });
        } catch (error) {
            console.error("Error fetching case data:", error);
            showErrorAlert({
                title: t("error"),
                message: t("failed_to_fetch_case_data"),
                darkMode: darkMode,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isPopupOpen) {
            console.log("Current Case:", currentCase);
            console.log("Table Rows:", tableRows);
        }
    }, [isPopupOpen, currentCase, tableRows]);

    // Close popup
    const closePopup = () => {
        setIsPopupOpen(false);
        setCurrentCase(null);
        setIsEditMode(false);
        setThumbnails([]);
        setVideos([]);
        setTableRows([]);
    };

    // Handle delete
    const handleDelete = (id) => {
        showConfirmAlert({
            title: t("confirm_delete_title"),
            message: t("confirm_delete_case"),
            darkMode: darkMode,
            onConfirm: () => {
                setIsDeleting(id);
                router.delete(`/payment/after-sale/${id}`, {
                    onSuccess: () => {
                        setIsDeleting(null);
                        showSuccessAlert({
                            title: t("success"),
                            message: t("case_deleted_successfully"),
                            darkMode: darkMode,
                            timeout: 3000,
                        });
                    },
                    onError: () => {
                        setIsDeleting(null);
                    },
                });
            },
        });
    };

    // Handle row click to show details
    const handleRowClick = (index, caseId) => {
        setOpenRowDropdown(openRowDropdown === index ? null : index);
        setActiveTab("photo");
        const selectedCase = tableData.find((item) => item.id === caseId);
        setTabData(
            selectedCase.details || { photos: [], videos: [], payments: [] }
        );
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Handle thumbnail change
    const handleThumbnailChange = (files) => {
        const currentThumbnailCount = thumbnails.length;
        const newFiles = Array.from(files);

        if (currentThumbnailCount + newFiles.length > 50) {
            showErrorAlert({
                title: t("error"),
                message: t("max_image_limit_exceeded", { limit: 50 }),
                darkMode,
            });
            return;
        }

        const newThumbnails = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            size: file.size,
            name: file.name,
            progress: 0,
            loading: true,
            isNew: true,
            id: `${Date.now()}-${Math.random()}`,
        }));

        setThumbnails((prev) => [...newThumbnails, ...prev]);

        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = null;
        }

        newThumbnails.forEach((thumbnail, index) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setThumbnails((prev) => {
                    const updated = [...prev];
                    updated[index].progress = progress;
                    if (progress >= 100) {
                        updated[index].loading = false;
                        clearInterval(interval);
                    }
                    return updated;
                });
            }, 200);
        });
    };

    // Handle video change
    const handleVideoChange = (files) => {
        const currentVideoCount = videos.length;
        const newFiles = Array.from(files);

        if (currentVideoCount + newFiles.length > 50) {
            showErrorAlert({
                title: t("error"),
                message: t("max_video_limit_exceeded", { limit: 50 }),
                darkMode,
            });
            return;
        }

        const newVideos = newFiles.map((file) => ({
            file,
            size: file.size,
            name: file.name,
            progress: 0,
            loading: true,
            isNew: true,
            id: `${Date.now()}-${Math.random()}`,
            preview: null,
            videoUrl: URL.createObjectURL(file),
        }));

        setVideos((prev) => [...newVideos, ...prev]);

        if (videoInputRef.current) {
            videoInputRef.current.value = null;
        }

        newVideos.forEach((video) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setVideos((prev) => {
                    const updated = [...prev];
                    const vid = updated.find((v) => v.id === video.id);
                    if (vid) vid.progress = progress;
                    if (progress >= 100) {
                        clearInterval(interval);
                    }
                    return updated;
                });
            }, 200);

            generateThumbnail(video.file, true)
                .then((dataUrl) => {
                    setVideos((prev) =>
                        prev.map((v) =>
                            v.id === video.id
                                ? { ...v, preview: dataUrl, loading: false }
                                : v
                        )
                    );
                })
                .catch(() => {
                    setVideos((prev) =>
                        prev.map((v) =>
                            v.id === video.id
                                ? {
                                      ...v,
                                      preview: "/images/fallback-video.png",
                                      loading: false,
                                  }
                                : v
                        )
                    );
                });
        });
    };

    // Handle thumbnail drop
    const handleThumbnailDrop = (e) => {
        e.preventDefault();
        setThumbnailDragging(false);
        const files = e.dataTransfer.files;

        const currentThumbnailCount = thumbnails.length;
        if (currentThumbnailCount + files.length > 50) {
            showErrorAlert({
                title: t("error"),
                message: t("max_image_limit_exceeded", { limit: 50 }),
                darkMode,
            });
            return;
        }

        handleThumbnailChange(files);
    };

    // Handle video drop
    const handleVideoDrop = (e) => {
        e.preventDefault();
        setVideoDragging(false);
        const files = e.dataTransfer.files;

        const currentVideoCount = videos.length;
        if (currentVideoCount + files.length > 50) {
            showErrorAlert({
                title: t("error"),
                message: t("max_video_limit_exceeded", { limit: 50 }),
                darkMode,
            });
            return;
        }

        handleVideoChange(files);
    };

    // Remove thumbnail
    const removeThumbnail = (index) => {
        setThumbnails((prev) => prev.filter((_, i) => i !== index));
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = null;
        }
    };

    // Remove video
    const removeVideo = (index) => {
        setVideos((prev) => prev.filter((_, i) => i !== index));
        if (videoInputRef.current) {
            videoInputRef.current.value = null;
        }
    };

    // Open remark popup
    const openRemarkPopup = (index, remark, event) => {
        const textarea = textareaRefs.current[index];
        if (textarea) {
            const rect = textarea.getBoundingClientRect();
            setTextareaPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }
        setCurrentRowIndex(index);
        setPopupText(remark);
        setOriginalText(remark);
        setAnimationState("opening");
        setIsRemarkPopupOpen(true);
    };

    // Handle popup text change
    const handlePopupTextChange = (value) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(value, "text/html");
        const plainText = doc.body.textContent || "";

        setPopupText(value);

        const updatedRows = [...tableRows];
        updatedRows[currentRowIndex] = {
            ...updatedRows[currentRowIndex],
            remark: plainText,
        };
        setTableRows(updatedRows);
    };

    // Confirm remark popup
    const confirmRemarkPopup = () => {
        setAnimationState("closing");
        setTimeout(() => {
            setIsRemarkPopupOpen(false);
            setAnimationState("closed");
        }, 300);
    };

    // Cancel remark popup
    const cancelRemarkPopup = () => {
        const updatedRows = [...tableRows];
        updatedRows[currentRowIndex] = {
            ...updatedRows[currentRowIndex],
            remark: originalText,
        };
        setTableRows(updatedRows);
        setAnimationState("closing");
        setTimeout(() => {
            setIsRemarkPopupOpen(false);
            setAnimationState("closed");
            setPopupText("");
            setCurrentRowIndex(null);
        }, 300);
    };

    // Handle table row updates
    const handleTableRowChange = (index, field, value) => {
        const updatedRows = [...tableRows];
        updatedRows[index] = {
            ...updatedRows[index],
            [field]: value,
            total:
                field === "qty_broken" || field === "unit_price"
                    ? (field === "qty_broken"
                          ? Number(value)
                          : Number(updatedRows[index].qty_broken)) *
                      (field === "unit_price"
                          ? Number(value)
                          : Number(updatedRows[index].unit_price))
                    : updatedRows[index].total,
        };
        setTableRows(updatedRows);
    };

    // Table columns
    const columns = [
        { key: "caseNumber", label: t("CaseNumber") },
        { key: "problem_type", label: t("problem type") },
        { key: "company", label: t("Company") },
        { key: "date", label: t("Date") },
        { key: "remark", label: t("Remark") },
        { key: "status", label: t("Status") },
    ];

    // Search field options
    const searchFieldOptions = [
        { key: "CaseNumber", label: t("Case Number") },
        { key: "Product", label: t("Product") },
        { key: "Pi_number", label: t("PI Number") },
    ];

    // Format name for display
    const formatName = (row) => {
        const names = [row.name_en, row.name_kh, row.name_cn]
            .filter((name) => name)
            .join(" / ");
        return names || "-";
    };

    // Popup style for remark
    const popupStyle = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 50,
        ...(animationState === "opening" || animationState === "open"
            ? { animation: "popupOpen 0.3s ease-out forwards" }
            : animationState === "closing"
            ? { animation: "popupClose 0.3s ease-in forwards" }
            : {
                  top: `${textareaPosition.y}px`,
                  left: `${textareaPosition.x}px`,
                  transform: "translate(-50%, -50%) scale(0)",
              }),
    };

    return (
        <div
            className={`w-full rounded-lg shadow-md ${getDarkModeClass(
                darkMode,
                "bg-[#1A1A1A] text-gray-200",
                "bg-white text-gray-900"
            )}`}
            style={{ fontFamily: "'Battambang', 'Roboto', sans-serif" }}
        >
            <style>
                {`
                    @keyframes popupOpen {
                        0% {
                            top: ${textareaPosition.y}px;
                            left: ${textareaPosition.x}px;
                            transform: translate(-50%, -50%) scale(0);
                            opacity: 0;
                        }
                        100% {
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) scale(1);
                            opacity: 1;
                        }
                    }
                    @keyframes popupClose {
                        0% {
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) scale(1);
                            opacity: 1;
                        }
                        100% {
                            top: ${textareaPosition.y}px;
                            left: ${textareaPosition.x}px;
                            transform: translate(-50%, -50%) scale(0);
                            opacity: 0;
                        }
                    }
                `}
            </style>
            <div className="w-full mx-auto p-2">
                {/* Search and Add New */}
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-[40%] flex items-center space-x-0">
                        <div className="relative w-[25%]">
                            <div
                                className={`w-full p-[0.69rem] truncate uppercase text-[12px] pl-4 pr-8 rounded-l-lg border-r-0 focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                    "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                                )}`}
                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                            >
                                {searchFieldOptions.find(
                                    (opt) => opt.key === selectedSearchField
                                )?.label || t("Case Number")}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
                                        isSelectOpen ? "rotate-180" : ""
                                    } ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-500"
                                    )}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                            {isSelectOpen && (
                                <div
                                    className={`absolute top-full left-0 w-full rounded-b-lg shadow-lg z-50 transition-all duration-200 ease-in-out transform ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-200 border border-gray-700",
                                        "bg-white text-gray-900 border border-gray-300"
                                    )}`}
                                >
                                    {searchFieldOptions.map((item) => (
                                        <div
                                            key={item.key}
                                            className={`px-4 py-2 text-[12px] truncate uppercase cursor-pointer transition-colors duration-150 ${getDarkModeClass(
                                                darkMode,
                                                "hover:bg-[#3A3A3A] text-gray-300",
                                                "hover:bg-gray-100 text-gray-700"
                                            )}`}
                                            onClick={() => {
                                                setSelectedSearchField(
                                                    item.key
                                                );
                                                setIsSelectOpen(false);
                                            }}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder={t(`Search ${selectedSearchField}`)}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearch}
                                className={`w-full p-2 pl-10 pr-4 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
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
                    </div>
                    <Link
                        href="/payment/create-after-sale"
                        className={`px-4 py-2 rounded-lg text-sm font-medium uppercase ${getDarkModeClass(
                            darkMode,
                            "bg-[#ff8800] text-white hover:bg-[#e07b00]",
                            "bg-[#ff8800] text-white hover:bg-[#e07b00]"
                        )}`}
                    >
                        {t("Add New")}
                    </Link>
                </div>

                {/* Table */}
                <div className="relative overflow-x-auto rounded-lg text-sm h-[calc(100vh-14rem)] mx-auto custom-scrollbar">
                    <div className="w-full min-w-max">
                        <table className="w-full border-collapse text-[12px]">
                            <thead>
                                <tr
                                    className={`uppercase ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] border-b border-gray-700",
                                        "bg-[#ff8800]"
                                    )}`}
                                >
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            style={{
                                                width: `${
                                                    columnWidths[column.key]
                                                }px`,
                                            }}
                                            className={`p-3 truncate text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                    <th
                                        style={{
                                            width: `${columnWidths.action}px`,
                                        }}
                                        className={`p-3 pr-0 pl-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300",
                                            "bg-[#ff8800] text-white"
                                        )}`}
                                    >
                                        {t("Action")}
                                    </th>
                                </tr>
                            </thead>
                            {isLoading ? (
                                <TableLoading
                                    darkMode={darkMode}
                                    rowCount={entriesPerPage}
                                    colCount={7}
                                />
                            ) : (
                                <tbody>
                                    {tableData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <NoDataComponent
                                                    darkMode={darkMode}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        tableData.map((caseItem, index) => (
                                            <React.Fragment key={caseItem.id}>
                                                <tr
                                                    onClick={() =>
                                                        handleRowClick(
                                                            index,
                                                            caseItem.id
                                                        )
                                                    }
                                                    className={`border-b cursor-pointer ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                        "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                    )}`}
                                                >
                                                    <td className="p-3 truncate-text">
                                                        {caseItem.caseNumber}
                                                    </td>
                                                    <td className="p-3 truncate-text">
                                                        {caseItem.caseName}
                                                    </td>
                                                    <td className="p-3 truncate-text">
                                                        {caseItem.company}
                                                    </td>
                                                    <td className="p-3 truncate-text">
                                                        {formatDate(
                                                            caseItem.date
                                                        )}
                                                    </td>
                                                    <td className="p-3 truncate-text">
                                                        {caseItem.remark}
                                                    </td>
                                                    <td
                                                        className={`p-3 truncate-text ${
                                                            statusStyles[
                                                                caseItem.status
                                                            ] || ""
                                                        }`}
                                                    >
                                                        {statusMap[
                                                            caseItem.status
                                                        ] || caseItem.status}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="relative action-container">
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setOpenActionDropdown(
                                                                        openActionDropdown ===
                                                                            index
                                                                            ? null
                                                                            : index
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
                                                            {openActionDropdown ===
                                                                index && (
                                                                <div
                                                                    className={`absolute right-[3rem] w-40 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-[#2D2D2D] text-gray-200",
                                                                        "bg-white text-gray-900"
                                                                    )}`}
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            openEditPopup(
                                                                                caseItem
                                                                            )
                                                                        }
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
                                                                        {t(
                                                                            "edit"
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                caseItem.id
                                                                            )
                                                                        }
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
                                                                        {t(
                                                                            "delete"
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {openRowDropdown === index && (
                                                    <tr
                                                        className={`border-b ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                            "bg-gray-100 text-gray-900 border-gray-200"
                                                        )}`}
                                                    >
                                                        <td
                                                            colSpan={7}
                                                            className="p-4"
                                                        >
                                                            <div className="flex border-gray-300 dark:border-gray-600">
                                                                <button
                                                                    onClick={() =>
                                                                        handleTabChange(
                                                                            "photo"
                                                                        )
                                                                    }
                                                                    className={`px-4 uppercase py-2 text-sm font-medium ${
                                                                        activeTab ===
                                                                        "photo"
                                                                            ? "border-b-2 border-orange-500 text-orange-500"
                                                                            : "text-gray-500 hover:text-orange-500"
                                                                    } ${getDarkModeClass(
                                                                        darkMode,
                                                                        "text-gray-300 hover:text-orange-400",
                                                                        "text-gray-700 hover:text-orange-600"
                                                                    )}`}
                                                                >
                                                                    {t("Photo")}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleTabChange(
                                                                            "video"
                                                                        )
                                                                    }
                                                                    className={`px-4 uppercase py-2 text-sm font-medium ${
                                                                        activeTab ===
                                                                        "video"
                                                                            ? "border-b-2 border-orange-500 text-orange-500"
                                                                            : "text-gray-500 hover:text-orange-500"
                                                                    } ${getDarkModeClass(
                                                                        darkMode,
                                                                        "text-gray-300 hover:text-orange-400",
                                                                        "text-gray-700 hover:text-orange-600"
                                                                    )}`}
                                                                >
                                                                    {t("Video")}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleTabChange(
                                                                            "payment"
                                                                        )
                                                                    }
                                                                    className={`px-4 uppercase py-2 text-sm font-medium ${
                                                                        activeTab ===
                                                                        "payment"
                                                                            ? "border-b-2 border-orange-500 text-orange-500"
                                                                            : "text-gray-500 hover:text-orange-500"
                                                                    } ${getDarkModeClass(
                                                                        darkMode,
                                                                        "text-gray-300 hover:text-orange-400",
                                                                        "text-gray-700 hover:text-orange-600"
                                                                    )}`}
                                                                >
                                                                    {t(
                                                                        "Payment"
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div
                                                                className={`mt-4 p-4 rounded-lg ${getDarkModeClass(
                                                                    darkMode,
                                                                    "dark:bg-gray-800",
                                                                    "bg-gray-50 shadow-md"
                                                                )}`}
                                                            >
                                                                {activeTab ===
                                                                    "photo" && (
                                                                    <div className="flex flex-wrap gap-2 p-2 justify-start items-center min-h-[100px]">
                                                                        {tabData.photos &&
                                                                        tabData
                                                                            .photos
                                                                            .length >
                                                                            0 ? (
                                                                            tabData.photos.map(
                                                                                (
                                                                                    photo,
                                                                                    idx
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className="relative w-32 h-32 group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                                                                    >
                                                                                        <img
                                                                                            src={
                                                                                                photo
                                                                                            }
                                                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                                            alt="Case photo"
                                                                                        />
                                                                                    </div>
                                                                                )
                                                                            )
                                                                        ) : (
                                                                            <div className="flex justify-center items-center w-full">
                                                                                <NoDataComponent
                                                                                    darkMode={
                                                                                        darkMode
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {activeTab ===
                                                                    "video" && (
                                                                    <div className="flex flex-wrap gap-2 p-2 justify-start items-center min-h-[100px]">
                                                                        {tabData.videos &&
                                                                        tabData
                                                                            .videos
                                                                            .length >
                                                                            0 ? (
                                                                            tabData.videos.map(
                                                                                (
                                                                                    videoUrl,
                                                                                    idx
                                                                                ) => {
                                                                                    let thumbnail =
                                                                                        videoThumbnails[
                                                                                            videoUrl
                                                                                        ] ||
                                                                                        "/images/fallback-video.png";
                                                                                    if (
                                                                                        !videoThumbnails[
                                                                                            videoUrl
                                                                                        ] &&
                                                                                        !videoThumbnails.hasOwnProperty(
                                                                                            videoUrl
                                                                                        )
                                                                                    ) {
                                                                                        generateThumbnail(
                                                                                            videoUrl,
                                                                                            false
                                                                                        )
                                                                                            .then(
                                                                                                (
                                                                                                    dataUrl
                                                                                                ) => {
                                                                                                    setVideoThumbnails(
                                                                                                        (
                                                                                                            prev
                                                                                                        ) => ({
                                                                                                            ...prev,
                                                                                                            [videoUrl]:
                                                                                                                dataUrl,
                                                                                                        })
                                                                                                    );
                                                                                                }
                                                                                            )
                                                                                            .catch(
                                                                                                () => {
                                                                                                    setVideoThumbnails(
                                                                                                        (
                                                                                                            prev
                                                                                                        ) => ({
                                                                                                            ...prev,
                                                                                                            [videoUrl]:
                                                                                                                "/images/fallback-video.png",
                                                                                                        })
                                                                                                    );
                                                                                                }
                                                                                            );
                                                                                    }
                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                idx
                                                                                            }
                                                                                            className="relative w-32 h-32 group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                                                                        >
                                                                                            <img
                                                                                                src={
                                                                                                    thumbnail
                                                                                                }
                                                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                                                alt="Video thumbnail"
                                                                                                onClick={() => {
                                                                                                    const videoElement =
                                                                                                        document.createElement(
                                                                                                            "video"
                                                                                                        );
                                                                                                    videoElement.src =
                                                                                                        videoUrl;
                                                                                                    videoElement.preload =
                                                                                                        "metadata";
                                                                                                    videoElement.onloadedmetadata =
                                                                                                        () => {
                                                                                                            videoElement
                                                                                                                .play()
                                                                                                                .then(
                                                                                                                    () => {
                                                                                                                        if (
                                                                                                                            videoElement.requestPictureInPicture
                                                                                                                        ) {
                                                                                                                            videoElement
                                                                                                                                .requestPictureInPicture()
                                                                                                                                .catch(
                                                                                                                                    (
                                                                                                                                        error
                                                                                                                                    ) => {
                                                                                                                                        console.error(
                                                                                                                                            "Error entering PiP:",
                                                                                                                                            error
                                                                                                                                        );
                                                                                                                                        showErrorAlert(
                                                                                                                                            {
                                                                                                                                                title: t(
                                                                                                                                                    "error"
                                                                                                                                                ),
                                                                                                                                                message:
                                                                                                                                                    t(
                                                                                                                                                        "failed_to_enter_pip"
                                                                                                                                                    ),
                                                                                                                                                darkMode,
                                                                                                                                            }
                                                                                                                                        );
                                                                                                                                    }
                                                                                                                                );
                                                                                                                        } else {
                                                                                                                            console.error(
                                                                                                                                "Picture-in-Picture is not supported"
                                                                                                                            );
                                                                                                                            showErrorAlert(
                                                                                                                                {
                                                                                                                                    title: t(
                                                                                                                                        "error"
                                                                                                                                    ),
                                                                                                                                    message:
                                                                                                                                        t(
                                                                                                                                            "pip_not_supported"
                                                                                                                                        ),
                                                                                                                                    darkMode,
                                                                                                                                }
                                                                                                                            );
                                                                                                                        }
                                                                                                                    }
                                                                                                                )
                                                                                                                .catch(
                                                                                                                    (
                                                                                                                        error
                                                                                                                    ) => {
                                                                                                                        console.error(
                                                                                                                            "Error playing video:",
                                                                                                                            error
                                                                                                                        );
                                                                                                                        showErrorAlert(
                                                                                                                            {
                                                                                                                                title: t(
                                                                                                                                    "error"
                                                                                                                                ),
                                                                                                                                message:
                                                                                                                                    t(
                                                                                                                                        "failed_to_play_video"
                                                                                                                                    ),
                                                                                                                                darkMode,
                                                                                                                            }
                                                                                                                        );
                                                                                                                    }
                                                                                                                );
                                                                                                        };
                                                                                                    videoElement.onerror =
                                                                                                        () => {
                                                                                                            console.error(
                                                                                                                "Error loading video for PiP"
                                                                                                            );
                                                                                                            showErrorAlert(
                                                                                                                {
                                                                                                                    title: t(
                                                                                                                        "error"
                                                                                                                    ),
                                                                                                                    message:
                                                                                                                        t(
                                                                                                                            "failed_to_load_video"
                                                                                                                        ),
                                                                                                                    darkMode,
                                                                                                                }
                                                                                                            );
                                                                                                        };
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                            )
                                                                        ) : (
                                                                            <div className="flex justify-center items-center w-full">
                                                                                <NoDataComponent
                                                                                    darkMode={
                                                                                        darkMode
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {activeTab ===
                                                                    "payment" && (
                                                                    <div className="space-y-4">
                                                                        {tabData.payments &&
                                                                        tabData
                                                                            .payments
                                                                            .length >
                                                                            0 ? (
                                                                            <div className="overflow-x-auto overflow-y-auto rounded-lg custom-scrollbar max-h-96">
                                                                                <table
                                                                                    className={`w-full border-collapse text-[10px] ${getDarkModeClass(
                                                                                        darkMode,
                                                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                                        "bg-white text-gray-900 border-gray-200"
                                                                                    )}`}
                                                                                >
                                                                                    <thead className="sticky top-0 z-10">
                                                                                        <tr
                                                                                            className={`uppercase ${getDarkModeClass(
                                                                                                darkMode,
                                                                                                "bg-[#3A3A3A] border-b border-gray-600",
                                                                                                "bg-[#ff8800] text-white"
                                                                                            )}`}
                                                                                        >
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Photo"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Pi_number"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Product_code"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Name"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Qty_Broken"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Unit_price"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Total"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Who_afford"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Method"
                                                                                                )}
                                                                                            </th>
                                                                                            <th className="p-3 text-left">
                                                                                                {t(
                                                                                                    "Remark"
                                                                                                )}
                                                                                            </th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {tabData.payments.map(
                                                                                            (
                                                                                                payment
                                                                                            ) => (
                                                                                                <tr
                                                                                                    key={
                                                                                                        payment.id
                                                                                                    }
                                                                                                    className={`border-b ${getDarkModeClass(
                                                                                                        darkMode,
                                                                                                        "border-gray-700",
                                                                                                        "border-gray-200"
                                                                                                    )}`}
                                                                                                >
                                                                                                    <td className="p-3">
                                                                                                        {payment.photo ? (
                                                                                                            <img
                                                                                                                src={
                                                                                                                    payment.photo
                                                                                                                }
                                                                                                                alt="Product photo"
                                                                                                                className="w-12 h-12 object-cover"
                                                                                                            />
                                                                                                        ) : (
                                                                                                            <div className="flex justify-center items-center w-full h-12">
                                                                                                                <NoImageComponent
                                                                                                                    darkMode={
                                                                                                                        darkMode
                                                                                                                    }
                                                                                                                />
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.pi_number
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.product_code
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.name
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.qty_broken
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.unit_price
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.total
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.who_afford
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.method
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        {
                                                                                                            payment.remark
                                                                                                        }
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex justify-center items-center w-full min-h-[100px]">
                                                                                <NoDataComponent
                                                                                    darkMode={
                                                                                        darkMode
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <Pagination
                    darkMode={darkMode}
                    currentPage={currentPage}
                    totalEntries={paginationState.total}
                    entriesPerPage={entriesPerPage}
                    onPageChange={handlePageChange}
                    onEntriesPerPageChange={handleEntriesPerPageChange}
                />

                {/* Edit Popup */}
                {isPopupOpen && (
                    <div
                        id="edit-case-popup"
                        className={`fixed inset-0 bg-gray-900 flex items-start justify-center z-50 transition-all duration-300 ease-in-out ${
                            isPopupOpen
                                ? "bg-opacity-80 opacity-100 visible"
                                : "bg-opacity-0 opacity-0 invisible"
                        }`}
                    >
                        <div
                            className={`shadow-2xl w-[100vw] h-[100vh] flex flex-col transform transition-all duration-300 ease-in-out ${getDarkModeClass(
                                darkMode,
                                "bg-[#1A1A1A] text-gray-200",
                                "bg-white text-gray-900"
                            )} ${
                                isPopupOpen
                                    ? "scale-100 translate-y-0 opacity-100"
                                    : "scale-95 -translate-y-4 opacity-0"
                            } popup-content`}
                        >
                            {/* Header */}
                            <div
                                className={`p-6 pt-4 pb-2 sticky top-0 z-10 rounded-t-xl ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#1A1A1A]",
                                    "bg-white"
                                )}`}
                            >
                                <h2
                                    className={`uppercase text-lg font-bold mb-1 flex items-center ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-200",
                                        "text-gray-800"
                                    )}`}
                                >
                                    <svg
                                        className="w-8 h-8 mr-3 text-orange-500"
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
                                    {t("Edit After-Sale Case")}
                                </h2>
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-sm overflow-y-auto p-6 pt-0 custom-scrollbar">
                                <form
                                    id="add-method-form"
                                    onSubmit={(e) => {
                                        e.preventDefault(); // Prevent default form submission
                                        handleSave();
                                    }}
                                   
                                >
                                    <div className="space-y-6">
                                        {/* Row 1: Updated layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <div>
                                                {/* CaseNumber Textbox */}
                                                <label
                                                    className={`uppercase block font-medium ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-300",
                                                        "text-gray-700"
                                                    )}`}
                                                >
                                                    {t("Case Number")}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="caseNumber"
                                                    value={
                                                        currentCase?.caseNumber ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setCurrentCase({
                                                            ...currentCase,
                                                            caseNumber:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder={t(
                                                        "Enter Case Number"
                                                    )}
                                                    className={`w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                        "bg-white text-gray-900 border-gray-200"
                                                    )}`}
                                                />

                                                {/* Problem Type and Company Dropdowns */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="w-full">
                                                        {/* Problem Type Dropdown */}
                                                        <label
                                                            className={`uppercase block font-medium ${getDarkModeClass(
                                                                darkMode,
                                                                "text-gray-300",
                                                                "text-gray-700"
                                                            )}`}
                                                        >
                                                            {t("Problem Type")}
                                                        </label>
                                                        <DropdownInput
                                                            name="problem_type"
                                                            value={
                                                                currentCase?.broblem_type_id ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setCurrentCase({
                                                                    ...currentCase,
                                                                    broblem_type_id:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            placeholder={t(
                                                                "Select Problem Type"
                                                            )}
                                                            options={
                                                                problemTypeOptions ||
                                                                []
                                                            }
                                                            darkMode={darkMode}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        {/* Company Dropdown */}
                                                        <label
                                                            className={`uppercase block font-medium ${getDarkModeClass(
                                                                darkMode,
                                                                "text-gray-300",
                                                                "text-gray-700"
                                                            )}`}
                                                        >
                                                            {t("Company")}
                                                        </label>
                                                        <DropdownInput
                                                            name="company"
                                                            value={
                                                                currentCase?.company_id ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setCurrentCase({
                                                                    ...currentCase,
                                                                    company_id:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            placeholder={t(
                                                                "Select Company"
                                                            )}
                                                            options={
                                                                companyOptions ||
                                                                []
                                                            }
                                                            darkMode={darkMode}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 mt-2 md:grid-cols-2 gap-4">
                                                    <div className="w-full">
                                                        {/* Date Picker */}
                                                        <label
                                                            className={`uppercase block font-medium ${getDarkModeClass(
                                                                darkMode,
                                                                "text-gray-300",
                                                                "text-gray-700"
                                                            )}`}
                                                        >
                                                            {t("Date")}
                                                        </label>
                                                        <div className="relative mb-2">
                                                            <MuiStyleDatePicker
                                                                value={
                                                                    currentCase?.date ||
                                                                    null
                                                                }
                                                                onChange={(
                                                                    newDate
                                                                ) =>
                                                                    setCurrentCase(
                                                                        {
                                                                            ...currentCase,
                                                                            date: newDate,
                                                                        }
                                                                    )
                                                                }
                                                                darkMode={
                                                                    darkMode
                                                                }
                                                                style={{
                                                                    border: `1px solid ${
                                                                        darkMode
                                                                            ? "#4A4A4A"
                                                                            : "#E0E0E0"
                                                                    }`,
                                                                    borderRadius:
                                                                        "0.375rem",
                                                                    backgroundColor:
                                                                        darkMode
                                                                            ? "#2D2D2D"
                                                                            : "#FFFFFF",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full">
                                                        {/* Total Textbox */}
                                                        <label
                                                            className={`uppercase block font-medium ${getDarkModeClass(
                                                                darkMode,
                                                                "text-gray-300",
                                                                "text-gray-700"
                                                            )}`}
                                                        >
                                                            {t("Total")}
                                                        </label>
                                                        <div className="relative mb-2">
                                                            <input
                                                                type="text"
                                                                name="total"
                                                                value={
                                                                    currentCase?.total ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setCurrentCase(
                                                                        {
                                                                            ...currentCase,
                                                                            total: e
                                                                                .target
                                                                                .value,
                                                                        }
                                                                    )
                                                                }
                                                                placeholder={t(
                                                                    "Enter Total"
                                                                )}
                                                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                    "bg-white text-gray-900 border-gray-200"
                                                                )}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Remark */}
                                                <label
                                                    className={`uppercase block font-medium ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-300",
                                                        "text-gray-700"
                                                    )}`}
                                                >
                                                    {t("Remark")}
                                                </label>
                                                <textarea
                                                    name="remark"
                                                    value={
                                                        currentCase?.remark ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setCurrentCase({
                                                            ...currentCase,
                                                            remark: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder={t(
                                                        "Enter Remark"
                                                    )}
                                                    className={`w-full border rounded-lg p-3 mb-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                        "bg-white text-gray-900 border-gray-200"
                                                    )}`}
                                                />
                                            </div>

                                            <div>
                                                {/* Thumbnail Images */}
                                                <label
                                                    className={`uppercase block font-medium ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-300",
                                                        "text-gray-700"
                                                    )}`}
                                                >
                                                    {t("thumbnail_images")}
                                                </label>
                                                <div
                                                    onDrop={handleThumbnailDrop}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setThumbnailDragging(
                                                            true
                                                        );
                                                    }}
                                                    onDragLeave={() =>
                                                        setThumbnailDragging(
                                                            false
                                                        )
                                                    }
                                                    className={`w-full rounded-lg p-[1rem] text-center cursor-pointer border border-dashed transition duration-200 ${
                                                        thumbnailDragging
                                                            ? "border-orange-400 bg-orange-100/20"
                                                            : getDarkModeClass(
                                                                  darkMode,
                                                                  "border-gray-700 hover:border-orange-400",
                                                                  "border-gray-300 hover:border-orange-400"
                                                              )
                                                    }`}
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "thumbnail-input-col4"
                                                            )
                                                            .click()
                                                    }
                                                >
                                                    <svg
                                                        className={`w-10 h-10 mx-auto mb-2 ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-500",
                                                            "text-gray-400"
                                                        )}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                                        />
                                                    </svg>
                                                    <p
                                                        className={` ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-500",
                                                            "text-gray-500"
                                                        )}`}
                                                    >
                                                        {t("drag_drop_images")}
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        id="thumbnail-input-col4"
                                                        ref={thumbnailInputRef}
                                                        onChange={(e) =>
                                                            handleThumbnailChange(
                                                                e.target.files
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="h-[220px] custom-scrollbar overflow-auto mt-3 p-2">
                                                    <div
                                                        id="thumbnail-preview-col4"
                                                        className="space-y-2"
                                                    >
                                                        {thumbnails.map(
                                                            (
                                                                thumbnail,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={`thumbnail-col4-${
                                                                        thumbnail.id ||
                                                                        index
                                                                    }`}
                                                                    className={`flex items-center p-1 rounded-lg border transition-all duration-200 ${
                                                                        thumbnail.markedForDeletion &&
                                                                        !thumbnail.isNew
                                                                            ? "opacity-50 border-red-500"
                                                                            : getDarkModeClass(
                                                                                  darkMode,
                                                                                  "border-gray-700 bg-[#2D2D2D]",
                                                                                  "border-gray-200 bg-gray-100"
                                                                              )
                                                                    }`}
                                                                >
                                                                    <div className="relative w-10 h-10 mr-2 flex-shrink-0">
                                                                        {thumbnail.loading ? (
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <Spinner
                                                                                    width="22px"
                                                                                    height="22px"
                                                                                    color={
                                                                                        darkMode
                                                                                            ? "#ff8800"
                                                                                            : "#ff8800"
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <img
                                                                                src={
                                                                                    thumbnail.preview
                                                                                }
                                                                                className="w-10 h-10 cursor-pointer object-cover rounded"
                                                                                onLoad={() => {
                                                                                    if (
                                                                                        thumbnail.isNew
                                                                                    ) {
                                                                                        setThumbnails(
                                                                                            (
                                                                                                prev
                                                                                            ) =>
                                                                                                prev.map(
                                                                                                    (
                                                                                                        t
                                                                                                    ) =>
                                                                                                        t.id ===
                                                                                                        thumbnail.id
                                                                                                            ? {
                                                                                                                  ...t,
                                                                                                                  loading: false,
                                                                                                              }
                                                                                                            : t
                                                                                                )
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p
                                                                            className={`truncate ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-300",
                                                                                "text-gray-700"
                                                                            )}`}
                                                                        >
                                                                            {formatFileName(
                                                                                thumbnail.name
                                                                            )}
                                                                        </p>
                                                                        <div className="flex justify-between items-center">
                                                                            <p
                                                                                className={`text-xs ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "text-gray-500",
                                                                                    "text-gray-500"
                                                                                )}`}
                                                                            >
                                                                                {thumbnail.size
                                                                                    ? formatFileSize(
                                                                                          thumbnail.size
                                                                                      )
                                                                                    : ""}
                                                                            </p>
                                                                            {thumbnail.estimatedTime && (
                                                                                <p
                                                                                    className={`text-xs ml-2 ${getDarkModeClass(
                                                                                        darkMode,
                                                                                        "text-gray-400",
                                                                                        "text-gray-500"
                                                                                    )}`}
                                                                                >
                                                                                    {
                                                                                        thumbnail.estimatedTime
                                                                                    }
                                                                                    s
                                                                                    remaining
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {thumbnail.loading && (
                                                                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-[#ff8800] rounded-full transition-all duration-300"
                                                                                    style={{
                                                                                        width: `${thumbnail.progress}%`,
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            if (
                                                                                thumbnail.isNew
                                                                            ) {
                                                                                removeThumbnail(
                                                                                    index
                                                                                );
                                                                            } else {
                                                                                setThumbnails(
                                                                                    (
                                                                                        prev
                                                                                    ) =>
                                                                                        prev.map(
                                                                                            (
                                                                                                t,
                                                                                                i
                                                                                            ) =>
                                                                                                i ===
                                                                                                index
                                                                                                    ? {
                                                                                                          ...t,
                                                                                                          markedForDeletion:
                                                                                                              !t.markedForDeletion,
                                                                                                      }
                                                                                                    : t
                                                                                        )
                                                                                );
                                                                            }
                                                                        }}
                                                                        className={`p-1 rounded-full ml-2 ${getDarkModeClass(
                                                                            darkMode,
                                                                            "hover:bg-gray-600",
                                                                            "hover:bg-gray-200"
                                                                        )}`}
                                                                        disabled={
                                                                            thumbnail.loading
                                                                        }
                                                                        aria-label={
                                                                            thumbnail.markedForDeletion
                                                                                ? t(
                                                                                      "restore_image"
                                                                                  )
                                                                                : t(
                                                                                      "remove_image"
                                                                                  )
                                                                        }
                                                                    >
                                                                        {thumbnail.markedForDeletion &&
                                                                        !thumbnail.isNew ? (
                                                                            <svg
                                                                                className="w-5 h-5 text-green-500"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M4 12h16M12 4v16"
                                                                                />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg
                                                                                className={`w-5 h-5 ${
                                                                                    thumbnail.loading
                                                                                        ? getDarkModeClass(
                                                                                              darkMode,
                                                                                              "text-gray-600",
                                                                                              "text-gray-400"
                                                                                          )
                                                                                        : getDarkModeClass(
                                                                                              darkMode,
                                                                                              "text-gray-400",
                                                                                              "text-gray-500"
                                                                                          )
                                                                                }`}
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
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                {/* Videos */}
                                                <label
                                                    className={`uppercase block font-medium ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-300",
                                                        "text-gray-700"
                                                    )}`}
                                                >
                                                    {t("videos_multiple")}
                                                </label>
                                                <div
                                                    onDrop={handleVideoDrop}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setVideoDragging(true);
                                                    }}
                                                    onDragLeave={() =>
                                                        setVideoDragging(false)
                                                    }
                                                    className={`w-full rounded-lg p-[1rem] text-center cursor-pointer border border-dashed transition duration-200 ${
                                                        videoDragging
                                                            ? "border-orange-400 bg-orange-100/20"
                                                            : getDarkModeClass(
                                                                  darkMode,
                                                                  "border-gray-700 hover:border-orange-400",
                                                                  "border-gray-300 hover:border-orange-400"
                                                              )
                                                    }`}
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "video-input"
                                                            )
                                                            .click()
                                                    }
                                                >
                                                    <svg
                                                        className={`w-10 h-10 mx-auto mb-2 ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-500",
                                                            "text-gray-400"
                                                        )}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M14.752 11.168l-3.197-2.2A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.2a1 1 0 000-1.664z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <p
                                                        className={` ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-500",
                                                            "text-gray-500"
                                                        )}`}
                                                    >
                                                        {t("drag_drop_videos")}
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        multiple
                                                        className="hidden"
                                                        id="video-input"
                                                        ref={videoInputRef}
                                                        onChange={(e) =>
                                                            handleVideoChange(
                                                                e.target.files
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="h-[220px] custom-scrollbar overflow-auto mt-3 p-2">
                                                    <div
                                                        id="video-preview"
                                                        className="space-y-2"
                                                    >
                                                        {videos.map(
                                                            (video, index) => (
                                                                <div
                                                                    key={`video-preview-${
                                                                        video.id ||
                                                                        index
                                                                    }`}
                                                                    className={`flex items-center p-1 rounded-lg border transition-all duration-200 ${
                                                                        video.markedForDeletion &&
                                                                        !video.isNew
                                                                            ? "opacity-50 border-red-500"
                                                                            : getDarkModeClass(
                                                                                  darkMode,
                                                                                  "border-gray-700 bg-[#2D2D2D]",
                                                                                  "border-gray-200 bg-gray-100"
                                                                              )
                                                                    }`}
                                                                >
                                                                    <div className="relative w-10 h-10 mr-2 flex-shrink-0">
                                                                        {video.loading ? (
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <Spinner
                                                                                    width="22px"
                                                                                    height="22px"
                                                                                    color={
                                                                                        darkMode
                                                                                            ? "#ff8800"
                                                                                            : "#ff8800"
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <img
                                                                                src={
                                                                                    video.preview ||
                                                                                    "/images/fallback-video.png"
                                                                                }
                                                                                alt={
                                                                                    video.name
                                                                                }
                                                                                className="w-10 h-10 object-cover rounded cursor-pointer"
                                                                                onClick={() => {
                                                                                    const videoElement =
                                                                                        document.createElement(
                                                                                            "video"
                                                                                        );
                                                                                    videoElement.src =
                                                                                        video.videoUrl;
                                                                                    videoElement.preload =
                                                                                        "metadata";
                                                                                    videoElement.onloadedmetadata =
                                                                                        () => {
                                                                                            videoElement
                                                                                                .play()
                                                                                                .then(
                                                                                                    () => {
                                                                                                        if (
                                                                                                            videoElement.requestPictureInPicture
                                                                                                        ) {
                                                                                                            videoElement
                                                                                                                .requestPictureInPicture()
                                                                                                                .catch(
                                                                                                                    (
                                                                                                                        error
                                                                                                                    ) => {
                                                                                                                        console.error(
                                                                                                                            "Error entering PiP:",
                                                                                                                            error
                                                                                                                        );
                                                                                                                        showErrorAlert(
                                                                                                                            {
                                                                                                                                title: t(
                                                                                                                                    "error"
                                                                                                                                ),
                                                                                                                                message:
                                                                                                                                    t(
                                                                                                                                        "failed_to_enter_pip"
                                                                                                                                    ),
                                                                                                                                darkMode,
                                                                                                                            }
                                                                                                                        );
                                                                                                                    }
                                                                                                                );
                                                                                                        } else {
                                                                                                            console.error(
                                                                                                                "Picture-in-Picture is not supported"
                                                                                                            );
                                                                                                            showErrorAlert(
                                                                                                                {
                                                                                                                    title: t(
                                                                                                                        "error"
                                                                                                                    ),
                                                                                                                    message:
                                                                                                                        t(
                                                                                                                            "pip_not_supported"
                                                                                                                        ),
                                                                                                                    darkMode,
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .catch(
                                                                                                    (
                                                                                                        error
                                                                                                    ) => {
                                                                                                        console.error(
                                                                                                            "Error playing video:",
                                                                                                            error
                                                                                                        );
                                                                                                        showErrorAlert(
                                                                                                            {
                                                                                                                title: t(
                                                                                                                    "error"
                                                                                                                ),
                                                                                                                message:
                                                                                                                    t(
                                                                                                                        "failed_to_play_video"
                                                                                                                    ),
                                                                                                                darkMode,
                                                                                                            }
                                                                                                        );
                                                                                                    }
                                                                                                );
                                                                                        };
                                                                                    videoElement.onerror =
                                                                                        () => {
                                                                                            console.error(
                                                                                                "Error loading video for PiP"
                                                                                            );
                                                                                            showErrorAlert(
                                                                                                {
                                                                                                    title: t(
                                                                                                        "error"
                                                                                                    ),
                                                                                                    message:
                                                                                                        t(
                                                                                                            "failed_to_load_video"
                                                                                                        ),
                                                                                                    darkMode,
                                                                                                }
                                                                                            );
                                                                                        };
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p
                                                                            className={`truncate ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-300",
                                                                                "text-gray-700"
                                                                            )}`}
                                                                        >
                                                                            {formatFileName(
                                                                                video.name
                                                                            )}
                                                                        </p>
                                                                        <div className="flex justify-between items-center">
                                                                            <p
                                                                                className={`text-xs ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "text-gray-500",
                                                                                    "text-gray-500"
                                                                                )}`}
                                                                            >
                                                                                {video.size
                                                                                    ? formatFileSize(
                                                                                          video.size
                                                                                      )
                                                                                    : ""}
                                                                            </p>
                                                                            {video.estimatedTime && (
                                                                                <p
                                                                                    className={`text-xs ml-2 ${getDarkModeClass(
                                                                                        darkMode,
                                                                                        "text-gray-400",
                                                                                        "text-gray-500"
                                                                                    )}`}
                                                                                >
                                                                                    {
                                                                                        video.estimatedTime
                                                                                    }
                                                                                    s
                                                                                    remaining
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {video.loading && (
                                                                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-[#ff8800] rounded-full transition-all duration-300"
                                                                                    style={{
                                                                                        width: `${video.progress}%`,
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            if (
                                                                                video.isNew
                                                                            ) {
                                                                                removeVideo(
                                                                                    index
                                                                                );
                                                                            } else {
                                                                                setVideos(
                                                                                    (
                                                                                        prev
                                                                                    ) =>
                                                                                        prev.map(
                                                                                            (
                                                                                                v,
                                                                                                i
                                                                                            ) =>
                                                                                                i ===
                                                                                                index
                                                                                                    ? {
                                                                                                          ...v,
                                                                                                          markedForDeletion:
                                                                                                              !v.markedForDeletion,
                                                                                                      }
                                                                                                    : v
                                                                                        )
                                                                                );
                                                                            }
                                                                        }}
                                                                        className={`p-1 rounded-full ml-2 ${getDarkModeClass(
                                                                            darkMode,
                                                                            "hover:bg-gray-600",
                                                                            "hover:bg-gray-200"
                                                                        )}`}
                                                                        disabled={
                                                                            video.loading
                                                                        }
                                                                        aria-label={
                                                                            video.markedForDeletion
                                                                                ? t(
                                                                                      "restore_video"
                                                                                  )
                                                                                : t(
                                                                                      "remove_video"
                                                                                  )
                                                                        }
                                                                    >
                                                                        {video.markedForDeletion &&
                                                                        !video.isNew ? (
                                                                            <svg
                                                                                className="w-5 h-5 text-green-500"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M4 12h16M12 4v16"
                                                                                />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg
                                                                                className={`w-5 h-5 ${
                                                                                    video.loading
                                                                                        ? getDarkModeClass(
                                                                                              darkMode,
                                                                                              "text-gray-600",
                                                                                              "text-gray-400"
                                                                                          )
                                                                                        : getDarkModeClass(
                                                                                              darkMode,
                                                                                              "text-gray-400",
                                                                                              "text-gray-500"
                                                                                          )
                                                                                }`}
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
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Table */}
                                        <div className="custom-scrollbar">
                                            <table className="text-sm w-full border-collapse">
                                                <thead>
                                                    <tr
                                                        className={`uppercase font-medium ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-gray-800 text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                    >
                                                        <th className="p-3 text-left">
                                                            {t("Photo")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Pi_number")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Code")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Name")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Who Afford")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Method")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Qty")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Price")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Total")}
                                                        </th>
                                                        <th className="p-3 text-left">
                                                            {t("Remark")}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableRows.map(
                                                        (row, index) => (
                                                            <tr
                                                                key={row.id}
                                                                className={`border-b ${getDarkModeClass(
                                                                    darkMode,
                                                                    "border-gray-700 hover:bg-gray-700",
                                                                    "border-gray-200 hover:bg-gray-50"
                                                                )}`}
                                                            >
                                                                <td className="p-3">
                                                                    {row.photo ? (
                                                                        <img
                                                                            src={
                                                                                row.photo
                                                                            }
                                                                            className="w-16 h-16 object-cover rounded"
                                                                            alt="Product photo"
                                                                        />
                                                                    ) : (
                                                                        <NoImageComponent
                                                                            darkMode={
                                                                                darkMode
                                                                            }
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="p-3">
                                                                    {
                                                                        row.pi_number
                                                                    }
                                                                </td>
                                                                <td className="p-3">
                                                                    {
                                                                        row.product_code
                                                                    }
                                                                </td>
                                                                <td className="p-3">
                                                                    {row.name}
                                                                </td>
                                                                <td className="p-3">
                                                                    
                                                                    <DropdownInput
                                                                        name={`who_afford_${index}`}
                                                                        value={
                                                                            row.who_afford_id ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleTableRowChange(
                                                                                index,
                                                                                "who_affort_id",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        options={
                                                                            whoAffordOptions ||
                                                                            []
                                                                        }
                                                                        darkMode={
                                                                            darkMode
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="p-3">
                                                                    <DropdownInput
                                                                        name={`method_${index}`}
                                                                        value={
                                                                            row.compensale_method_id ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleTableRowChange(
                                                                                index,
                                                                                "compensale_method_id",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        options={
                                                                            compensaleMethodOptions ||
                                                                            []
                                                                        }
                                                                        darkMode={
                                                                            darkMode
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="p-3">
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            row.qty_broken ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleTableRowChange(
                                                                                index,
                                                                                "qty_broken",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                            darkMode,
                                                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                            "bg-white text-gray-900 border-gray-200"
                                                                        )}`}
                                                                    />
                                                                </td>
                                                                <td className="p-3">
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            row.unit_price ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleTableRowChange(
                                                                                index,
                                                                                "unit_price",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                            darkMode,
                                                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                            "bg-white text-gray-900 border-gray-200"
                                                                        )}`}
                                                                    />
                                                                </td>
                                                                <td className="p-3">
                                                                    {row.total}
                                                                </td>
                                                                <td className="p-3">
                                                                    <textarea
                                                                        ref={(
                                                                            el
                                                                        ) =>
                                                                            (textareaRefs.current[
                                                                                index
                                                                            ] =
                                                                                el)
                                                                        }
                                                                        value={
                                                                            row.remark ||
                                                                            ""
                                                                        }
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            openRemarkPopup(
                                                                                index,
                                                                                row.remark,
                                                                                e
                                                                            )
                                                                        }
                                                                        readOnly
                                                                        className={`w-full border rounded-lg p-2 h-16 resize-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                            darkMode,
                                                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                            "bg-white text-gray-900 border-gray-200"
                                                                        )}`}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="flex  p-6 pb-1 pt-0 justify-end space-x-4 h-12">
                                <button
                                    onClick={closePopup}
                                    className={`px-4 py-2 rounded-lg uppercase ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]",
                                        "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    )}`}
                                >
                                    {t("Cancel")} (ESC)
                                </button>
                                <button
                                    id="submit-method-btn"
                                    form="add-method-form"
                                    className={`px-4 py-2 border rounded-lg uppercase ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )}`}
                                >
                                    {t("Save")} (CTRL + ENTER)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <RemarkPopup
                    isRemarkPopupOpen={isRemarkPopupOpen}
                    popupStyle={popupStyle}
                    popupText={popupText}
                    handlePopupTextChange={handlePopupTextChange}
                    cancelRemarkPopup={cancelRemarkPopup}
                    confirmRemarkPopup={confirmRemarkPopup}
                    darkMode={darkMode}
                />
            </div>
        </div>
    );
}

AfterSale.title = "payment_manages";
AfterSale.subtitle = "after_sale";
