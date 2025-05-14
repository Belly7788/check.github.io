import { Link, Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    FaDownload,
    FaPlus,
    FaFileExcel,
    FaFilePdf,
    FaEllipsisV,
} from "react-icons/fa";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import { useTranslation } from "react-i18next";
import Spinner from "../../Component/spinner/spinner";
import Pagination from "../../Component/Pagination/Pagination"; // Import the Pagination component
import '../../BELLY/Component/Gallery/gallery_belly';

export default function ProductList({ darkMode }) {
    const { t } = useTranslation();

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const totalEntries = 937;
    const [entriesPerPage, setEntriesPerPage] = useState(25); // Make entriesPerPage a state
    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    // State for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // State for download dropdown
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);

    // State for row dropdown
    const [expandedRow, setExpandedRow] = useState(null);

    // State for active tab in dropdown
    const [activeTab, setActiveTab] = useState("photo");

    // State for sliders
    const [photoSlideIndex, setPhotoSlideIndex] = useState(0);
    const [videoSlideIndex, setVideoSlideIndex] = useState(0);

    // States for thumbnails and videos
    const [thumbnails, setThumbnails] = useState([]);
    const [videos, setVideos] = useState([]);
    const [thumbnailDragging, setThumbnailDragging] = useState(false);
    const [videoDragging, setVideoDragging] = useState(false);

    // Dummy data for sliders
    const photos = [
        "/images/c-programming-course.png",
        "/images/c-programming-course.png",
        "/images/c-programming-course.png",
        "/images/c-programming-course.png",
        "/images/c-programming-course.png",
    ];
    const videosData = ["/videos/video1.mp4", "/videos/video2.mp4"];

    // Slider navigation
    const nextPhotoSlide = () => {
        setPhotoSlideIndex((prev) => (prev + 1) % photos.length);
    };
    const prevPhotoSlide = () => {
        setPhotoSlideIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    const nextVideoSlide = () => {
        setVideoSlideIndex((prev) => (prev + 1) % videosData.length);
    };
    const prevVideoSlide = () => {
        setVideoSlideIndex((prev) => (prev - 1 + videosData.length) % videosData.length);
    };

    // Popup controls
    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => setIsPopupOpen(false);

    // Toggle download dropdown
    const toggleDownloadDropdown = () => setIsDownloadOpen(!isDownloadOpen);

    // Toggle row dropdown
    const toggleRowDropdown = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
        setActiveTab("photo");
        setPhotoSlideIndex(0);
        setVideoSlideIndex(0);
    };

    // State for action dropdown
    const [openActionDropdown, setOpenActionDropdown] = useState(null);

    // State for default product image
    const [defaultImage, setDefaultImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Helper function to format file name
    const formatFileName = (name) => {
        if (name.length > 10) {
            return `${name.substring(0, 10)}...${name.split('.').pop()}`;
        }
        return name;
    };

    // Helper function to format file size
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
    };

    // Handle default image file selection
    const handleImageChange = (file) => {
        if (file && file.type.startsWith("image/")) {
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = () => {
                setDefaultImage(reader.result);
                setIsLoading(false);
            };
            reader.onerror = () => {
                setIsLoading(false);
                console.error("Error reading file");
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle thumbnail file selection with progress
    const handleThumbnailChange = (files) => {
        const newThumbnails = Array.from(files).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            size: file.size,
            name: file.name,
            progress: 0,
            loading: true
        }));

        setThumbnails(prev => [...newThumbnails, ...prev]);

        newThumbnails.forEach((thumbnail, index) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setThumbnails(prev => {
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

    // Handle video file selection with progress and thumbnail generation
    const handleVideoChange = (files) => {
        const newVideos = Array.from(files).map(file => ({
            file,
            size: file.size,
            name: file.name,
            progress: 0,
            loading: true
        }));

        setVideos(prev => [...newVideos, ...prev]);

        newVideos.forEach((video, index) => {
            const videoElement = document.createElement('video');
            videoElement.src = URL.createObjectURL(video.file);
            videoElement.preload = "metadata";

            // Simulate progress bar
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setVideos(prev => {
                    const updated = [...prev];
                    updated[index].progress = progress;
                    if (progress >= 100) {
                        clearInterval(interval);
                    }
                    return updated;
                });
            }, 200);

            // Handle video metadata loading
            videoElement.onloadedmetadata = () => {
                videoElement.currentTime = 1; // Seek to 1 second
            };

            // Capture frame after seeking
            videoElement.onseeked = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    setVideos(prev => {
                        const updated = [...prev];
                        updated[index].preview = canvas.toDataURL('image/png');
                        updated[index].videoUrl = URL.createObjectURL(video.file);
                        updated[index].loading = false; // Stop spinner
                        return updated;
                    });
                } catch (error) {
                    console.error("Error generating thumbnail:", error);
                    setVideos(prev => {
                        const updated = [...prev];
                        updated[index].loading = false; // Stop spinner
                        updated[index].preview = "/images/fallback-video.png"; // Fallback image
                        return updated;
                    });
                }
            };

            // Handle errors
            videoElement.onerror = () => {
                console.error("Error loading video metadata");
                setVideos(prev => {
                    const updated = [...prev];
                    updated[index].loading = false; // Stop spinner
                    updated[index].preview = "/images/fallback-video.png"; // Fallback image
                    return updated;
                });
            };
        });
    };

    // Handle file input click for default image
    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleImageChange(file);
    };

    // Handle default image drop
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageChange(file);
    };

    // Handle thumbnail drop
    const handleThumbnailDrop = (e) => {
        e.preventDefault();
        setThumbnailDragging(false);
        const files = e.dataTransfer.files;
        handleThumbnailChange(files);
    };

    // Handle video drop
    const handleVideoDrop = (e) => {
        e.preventDefault();
        setVideoDragging(false);
        const files = e.dataTransfer.files;
        handleVideoChange(files);
    };

    // Remove thumbnail
    const removeThumbnail = (index) => {
        setThumbnails(prev => prev.filter((_, i) => i !== index));
    };

    // Remove video
    const removeVideo = (index) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
    };

    // Handle drag-over for default image
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Handle drag leave for default image
    const handleDragLeave = () => setIsDragging(false);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle entries per page change
    const handleEntriesPerPageChange = (e) => {
        const newEntriesPerPage = Number(e.target.value);
        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(1); // Reset to first page when entries per page changes
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
            if (!event.target.closest(".download-container")) {
                setIsDownloadOpen(false);
            }
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

    return (
        <>
            <Head title={t("list_products")} />

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
                            <div className="relative download-container">
                                <button
                                    onClick={toggleDownloadDropdown}
                                    className={`flex items-center text-sm px-4 py-2 rounded-lg transition ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                        "bg-[#f7b500] text-white hover:bg-[#ff8800]"
                                    )}`}
                                >
                                    <FaDownload className="mr-2" /> {t("download")}
                                </button>
                                {isDownloadOpen && (
                                    <div
                                        className={`absolute mt-1 w-48 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-200",
                                            "bg-white text-gray-900"
                                        )}`}
                                    >
                                        <div
                                            className={`px-4 py-2 text-sm font-semibold border-b ${getDarkModeClass(
                                                darkMode,
                                                "border-gray-700",
                                                "border-gray-200"
                                            )}`}
                                        >
                                            {t("export_as")}
                                        </div>
                                        <div className="py-1">
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                    darkMode,
                                                    "hover:bg-[#3A3A3A]",
                                                    "hover:bg-gray-100"
                                                )}`}
                                            >
                                                <FaFileExcel className="mr-2 text-green-500" />
                                                {t("excel")}
                                            </button>
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                    darkMode,
                                                    "hover:bg-[#3A3A3A]",
                                                    "hover:bg-gray-100"
                                                )}`}
                                            >
                                                <FaFilePdf className="mr-2 text-red-500" />
                                                {t("pdf")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                            {t("photo")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("code")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("name_kh")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("name_en")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("name_cn")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("declare")}
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            {t("hs_code")}
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
                                            <>
                                                <tr
                                                    key={itemIndex}
                                                    onClick={() => toggleRowDropdown(itemIndex)}
                                                    className={`border-b cursor-pointer ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                        "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                    )}`}
                                                >
                                                    <td className="p-3">
                                                        <img
                                                            data-kheng-chetra="belly-gallery-product-default"
                                                            data-caption=""
                                                            src="/images/c-programming-course.png"
                                                            className="w-12 h-12 object-cover rounded"
                                                            loading="lazy"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`p-[1px] pr-1 pl-1 rounded-md ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-gray-600",
                                                                "bg-[#e7e7ff] text-[#696cff]"
                                                            )}`}
                                                        >
                                                            ITEM{String(itemIndex + 1).padStart(3, "0")}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`p-[1px] pr-1 pl-1 rounded-md ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-gray-600",
                                                                "bg-[#e7ffe7] text-[#28a745]"
                                                            )}`}
                                                        >
                                                            ម៉ាស៊ីនត្រជាក់
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`p-[1px] pr-1 pl-1 rounded-md ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-gray-600",
                                                                "bg-orange-100 text-[#ff8800]"
                                                            )}`}
                                                        >
                                                            Java script
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`p-[1px] pr-1 pl-1 rounded-md ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-gray-600",
                                                                "bg-[#ffe7e7] text-[#ff6969]"
                                                            )}`}
                                                        >
                                                            空调
                                                        </span>
                                                    </td>
                                                    <td className="p-3">Yes</td>
                                                    <td className="p-3">8415.10</td>
                                                    <td className="p-3 w-20">
                                                        <div className="relative action-container">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenActionDropdown(
                                                                        openActionDropdown === itemIndex
                                                                            ? null
                                                                            : itemIndex
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
                                                                    className={`absolute right-6 w-40 rounded-lg shadow-lg z-20 ${getDarkModeClass(
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
                                                {expandedRow === itemIndex && (
                                                    <tr>
                                                        <td
                                                            colSpan="8"
                                                            className="p-0"
                                                        >
                                                            <div
                                                                className={`p-4 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-300",
                                                                    "bg-gray-100 text-gray-900"
                                                                )}`}
                                                            >
                                                                <div className="flex">
                                                                    <button
                                                                        onClick={() =>
                                                                            setActiveTab(
                                                                                "photo"
                                                                            )
                                                                        }
                                                                        className={`px-4 py-2 font-semibold ${
                                                                            activeTab ===
                                                                            "photo"
                                                                                ? "border-b-2 border-[#ff8800] text-[#ff8800]"
                                                                                : "text-gray-500 hover:text-[#ff8800]"
                                                                        }`}
                                                                    >
                                                                        {t("photos")}
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setActiveTab(
                                                                                "video"
                                                                            )
                                                                        }
                                                                        className={`px-4 py-2 font-semibold ${
                                                                            activeTab ===
                                                                            "video"
                                                                                ? "border-b-2 border-[#ff8800] text-[#ff8800]"
                                                                                : "text-gray-500 hover:text-[#ff8800]"
                                                                        }`}
                                                                    >
                                                                        {t("videos")}
                                                                    </button>
                                                                </div>
                                                                <div className="mt-4">
                                                                    {activeTab ===
                                                                        "photo" && (
                                                                        <div className="relative w-full">
                                                                            <div className="overflow-hidden">
                                                                                <div
                                                                                    className="flex transition-transform duration-300 ease-in-out"
                                                                                    style={{
                                                                                        transform: `translateX(-${
                                                                                            photoSlideIndex *
                                                                                            100
                                                                                        }%)`,
                                                                                    }}
                                                                                >
                                                                                    {photos.map(
                                                                                        (
                                                                                            photo,
                                                                                            idx
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    idx
                                                                                                }
                                                                                                className="min-w-full flex justify-center"
                                                                                            >
                                                                                                <img
                                                                                                    src={
                                                                                                        photo
                                                                                                    }
                                                                                                    data-kheng-chetra="belly-gallery-product-thumbnail"
                                                                                                    className="w-64 h-64 cursor-pointer object-cover rounded-lg"
                                                                                                />
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={
                                                                                    prevPhotoSlide
                                                                                }
                                                                                className={`absolute top-1/2 left-0 transform -translate-y-1/2 p-2 rounded-full ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                                                                    "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                                                )}`}
                                                                            >
                                                                                <svg
                                                                                    className="w-6 h-6"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M15 19l-7-7 7-7"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={
                                                                                    nextPhotoSlide
                                                                                }
                                                                                className={`absolute top-1/2 right-0 transform -translate-y-1/2 p-2 rounded-full ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                                                                    "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                                                )}`}
                                                                            >
                                                                                <svg
                                                                                    className="w-6 h-6"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M9 5l7 7-7 7"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                            <div className="flex justify-center mt-2 space-x-2">
                                                                                {photos.map(
                                                                                    (
                                                                                        _,
                                                                                        idx
                                                                                    ) => (
                                                                                        <span
                                                                                            key={
                                                                                                idx
                                                                                            }
                                                                                            className={`w-2 h-2 rounded-full ${
                                                                                                photoSlideIndex ===
                                                                                                idx
                                                                                                    ? "bg-[#ff8800]"
                                                                                                    : "bg-gray-400"
                                                                                            }`}
                                                                                        ></span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {activeTab ===
                                                                        "video" && (
                                                                        <div className="relative w-full">
                                                                            <div className="overflow-hidden">
                                                                                <div
                                                                                    className="flex transition-transform duration-300 ease-in-out"
                                                                                    style={{
                                                                                        transform: `translateX(-${
                                                                                            videoSlideIndex *
                                                                                            100
                                                                                        }%)`,
                                                                                    }}
                                                                                >
                                                                                    {videosData.map(
                                                                                        (
                                                                                            video,
                                                                                            idx
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    idx
                                                                                                }
                                                                                                className="min-w-full flex justify-center"
                                                                                            >
                                                                                                <video
                                                                                                    src={
                                                                                                        video
                                                                                                    }
                                                                                                    controls
                                                                                                    className="h-64 object-cover rounded-lg"
                                                                                                />
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={
                                                                                    prevVideoSlide
                                                                                }
                                                                                className={`absolute top-1/2 left-0 transform -translate-y-1/2 p-2 rounded-full ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                                                                    "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                                                )}`}
                                                                            >
                                                                                <svg
                                                                                    className="w-6 h-6"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M15 19l-7-7 7-7"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={
                                                                                    nextVideoSlide
                                                                                }
                                                                                className={`absolute top-1/2 right-0 transform -translate-y-1/2 p-2 rounded-full ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                                                                    "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                                                                )}`}
                                                                            >
                                                                                <svg
                                                                                    className="w-6 h-6"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M9 5l7 7-7 7"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                            <div className="flex justify-center mt-2 space-x-2">
                                                                                {videosData.map(
                                                                                    (
                                                                                        _,
                                                                                        idx
                                                                                    ) => (
                                                                                        <span
                                                                                            key={
                                                                                                idx
                                                                                            }
                                                                                            className={`w-2 h-2 rounded-full ${
                                                                                                videoSlideIndex ===
                                                                                                idx
                                                                                                    ? "bg-[#ff8800]"
                                                                                                    : "bg-gray-400"
                                                                                            }`}
                                                                                        ></span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
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

                {/* Popup for Adding New Product */}
                <div
                    id="add-new-popup"
                    className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
                        isPopupOpen
                            ? "bg-opacity-60 opacity-100 visible"
                            : "bg-opacity-0 opacity-0 invisible"
                    }`}
                >
                    <div
                        className={`rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${getDarkModeClass(
                            darkMode,
                            "bg-[#1A1A1A] text-gray-200",
                            "bg-white text-gray-900"
                        )} ${
                            isPopupOpen
                                ? "scale-100 translate-y-0 opacity-100"
                                : "scale-95 -translate-y-4 opacity-0"
                        } popup-content`}
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
                                {t("add_new_product")}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                            <form id="add-product-form" className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("default_product_image")}
                                        </label>
                                        <div
                                            id="default-image-dropzone"
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            className={`h-[180px] w-[180px] rounded-lg p-6 text-center cursor-pointer relative border border-dashed transition duration-200 ${
                                                isDragging
                                                    ? "border-orange-400 bg-orange-100/20"
                                                    : getDarkModeClass(
                                                        darkMode,
                                                        "border-gray-700 hover:border-orange-400",
                                                        "border-gray-300 hover:border-orange-400"
                                                    )
                                            }`}
                                            onClick={() =>
                                                document
                                                    .getElementById("default-image-input")
                                                    .click()
                                            }
                                        >
                                            {!defaultImage && !isLoading && (
                                                <div className="placeholder-content">
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
                                                        className={`text-sm ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-500",
                                                            "text-gray-500"
                                                        )}`}
                                                    >
                                                        {t("drag_drop_image")}
                                                    </p>
                                                </div>
                                            )}
                                            {isLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Spinner width="32px" height="32px" />
                                                </div>
                                            )}
                                            {defaultImage && !isLoading && (
                                                <div
                                                    id="default-image-preview"
                                                    className="absolute inset-0 flex items-center justify-center p-1"
                                                >
                                                    <img
                                                        src={defaultImage}
                                                        alt="Default Product Preview"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="default-image-input"
                                                onChange={handleFileInput}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-rows-2 gap-4">
                                        <div>
                                            <label
                                                className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("code_product")}
                                            </label>
                                            <input
                                                type="text"
                                                name="code"
                                                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("enter_product_code")}
                                            />
                                        </div>
                                        <div className="relative">
                                            <label
                                                className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("category")}
                                            </label>
                                            <div className="w-full">
                                                <input
                                                    type="text"
                                                    name="category"
                                                    style={{ cursor: "not-allowed" }}
                                                    className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                        "bg-white text-gray-900 border-gray-200"
                                                    )}`}
                                                    placeholder={t(
                                                        "search_category_placeholder"
                                                    )}
                                                    id="searchInput"
                                                    autoComplete="off"
                                                    disabled
                                                />
                                                <div
                                                    id="dropdownOptions"
                                                    className={`absolute z-10 w-full border rounded-lg mt-1 max-h-60 overflow-y-auto hidden shadow-lg ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                        "bg-white text-gray-900 border-gray-200"
                                                    )}`}
                                                >
                                                    <div
                                                        className={`py-2 px-4 ${getDarkModeClass(
                                                            darkMode,
                                                            "hover:bg-[#3A3A3A]",
                                                            "hover:bg-gray-100"
                                                        )} cursor-pointer`}
                                                    >
                                                        {t("no_data")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("name_kh")}
                                        </label>
                                        <input
                                            type="text"
                                            name="name_kh"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("name_kh_placeholder")}
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
                                            {t("name_en")}
                                        </label>
                                        <input
                                            type="text"
                                            name="name_en"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("name_en_placeholder")}
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
                                            {t("name_cn")}
                                        </label>
                                        <input
                                            type="text"
                                            name="name_cn"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("name_cn_placeholder")}
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
                                            {t("hs_code")}
                                        </label>
                                        <input
                                            type="text"
                                            name="hs_code"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("hs_code_placeholder")}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("declare")}
                                    </label>
                                    <textarea
                                        name="remark"
                                        className={`w-full custom-scrollbar border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                        rows="4"
                                        placeholder={t("declare_placeholder")}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
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
                                                setThumbnailDragging(true);
                                            }}
                                            onDragLeave={() => setThumbnailDragging(false)}
                                            className={`w-full rounded-lg p-6 text-center cursor-pointer border border-dashed transition duration-200 ${
                                                thumbnailDragging
                                                    ? "border-orange-400 bg-orange-100/20"
                                                    : getDarkModeClass(
                                                        darkMode,
                                                        "border-gray-700 hover:border-orange-400",
                                                        "border-gray-300 hover:border-orange-400"
                                                    )
                                            }`}
                                            onClick={() =>
                                                document.getElementById("thumbnail-input").click()
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
                                                className={`text-sm ${getDarkModeClass(
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
                                                id="thumbnail-input"
                                                onChange={(e) => handleThumbnailChange(e.target.files)}
                                            />
                                        </div>
                                        <div className="h-[300px] custom-scrollbar overflow-auto mt-3 p-2 ">
                                            <div id="thumbnail-preview" className=" space-y-2">
                                                {thumbnails.map((thumbnail, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center p-2 rounded-lg border ${getDarkModeClass(
                                                            darkMode,
                                                            "border-gray-700 bg-[#2D2D2D]",
                                                            "border-gray-200 bg-gray-100"
                                                        )}`}
                                                    >
                                                        <div className="relative w-12 h-12 mr-2">
                                                            {thumbnail.loading ? (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Spinner
                                                                        width="24px"
                                                                        height="24px"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <img
                                                                    src={thumbnail.preview}
                                                                    data-kheng-chetra="belly-gallery-thumbnails-drop"
                                                                    className="w-12 h-12 cursor-pointer object-cover rounded"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p
                                                                className={`text-sm ${getDarkModeClass(
                                                                    darkMode,
                                                                    "text-gray-300",
                                                                    "text-gray-700"
                                                                )}`}
                                                            >
                                                                {formatFileName(thumbnail.name)}
                                                            </p>
                                                            <p
                                                                className={`text-xs ${getDarkModeClass(
                                                                    darkMode,
                                                                    "text-gray-500",
                                                                    "text-gray-500"
                                                                )}`}
                                                            >
                                                                {formatFileSize(thumbnail.size)}
                                                            </p>
                                                            {thumbnail.loading && (
                                                                <div className="w-full h-1 bg-gray-200 rounded mt-1">
                                                                    <div
                                                                        className="h-1 bg-[#ff8800] rounded"
                                                                        style={{
                                                                            width: `${thumbnail.progress}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Thumbnail Remove Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault(); // Prevent any default behavior
                                                                removeThumbnail(index);
                                                            }}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <svg
                                                                className="w-5 h-5 text-gray-500"
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
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
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
                                            onDragLeave={() => setVideoDragging(false)}
                                            className={`w-full rounded-lg p-6 text-center cursor-pointer border border-dashed transition duration-200 ${
                                                videoDragging
                                                    ? "border-orange-400 bg-orange-100/20"
                                                    : getDarkModeClass(
                                                        darkMode,
                                                        "border-gray-700 hover:border-orange-400",
                                                        "border-gray-300 hover:border-orange-400"
                                                    )
                                            }`}
                                            onClick={() =>
                                                document.getElementById("video-input").click()
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
                                                className={`text-sm ${getDarkModeClass(
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
                                                onChange={(e) => handleVideoChange(e.target.files)}
                                            />
                                        </div>
                                        <div className="h-[300px] custom-scrollbar overflow-auto mt-3 p-2 ">
                                            <div id="video-preview" className="mt-3 space-y-2">
                                                {videos.map((video, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center p-2 rounded-lg border ${getDarkModeClass(
                                                            darkMode,
                                                            "border-gray-700 bg-[#2D2D2D]",
                                                            "border-gray-200 bg-gray-100"
                                                        )}`}
                                                    >
                                                        <div className="relative w-12 h-12 mr-2">
                                                            {video.loading ? (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Spinner
                                                                        width="24px"
                                                                        height="24px"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <img
                                                                    src={video.preview}
                                                                    alt={video.name}
                                                                    className="w-12 h-12 object-cover rounded cursor-pointer"
                                                                    onClick={() => {
                                                                        const videoElement =
                                                                            document.createElement("video");
                                                                        videoElement.src = video.videoUrl;
                                                                        videoElement.preload = "metadata";
                                                                        videoElement.onloadedmetadata = () => {
                                                                            videoElement
                                                                                .play()
                                                                                .then(() => {
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
                                                                                                }
                                                                                            );
                                                                                    } else {
                                                                                        console.error(
                                                                                            "Picture-in-Picture is not supported"
                                                                                        );
                                                                                    }
                                                                                })
                                                                                .catch((error) => {
                                                                                    console.error(
                                                                                        "Error playing video:",
                                                                                        error
                                                                                    );
                                                                                });
                                                                        };
                                                                        videoElement.onerror = () => {
                                                                            console.error(
                                                                                "Error loading video for PiP"
                                                                            );
                                                                        };
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p
                                                                className={`text-sm ${getDarkModeClass(
                                                                    darkMode,
                                                                    "text-gray-300",
                                                                    "text-gray-700"
                                                                )}`}
                                                            >
                                                                {formatFileName(video.name)}
                                                            </p>
                                                            <p
                                                                className={`text-xs ${getDarkModeClass(
                                                                    darkMode,
                                                                    "text-gray-500",
                                                                    "text-gray-500"
                                                                )}`}
                                                            >
                                                                {formatFileSize(video.size)}
                                                            </p>
                                                            {video.loading && (
                                                                <div className="w-full h-1 bg-gray-200 rounded mt-1">
                                                                    <div
                                                                        className="h-1 bg-[#ff8800] rounded"
                                                                        style={{
                                                                            width: `${video.progress}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Video Remove Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault(); // Prevent any default behavior
                                                                removeVideo(index);
                                                            }}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <svg
                                                                className="w-5 h-5 text-gray-500"
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
                                                ))}
                                            </div>
                                        </div>
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
                                    form="add-product-form"
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

ProductList.title = "product";
ProductList.subtitle = "list_products";
