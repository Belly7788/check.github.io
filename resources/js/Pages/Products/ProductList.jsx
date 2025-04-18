import { Link, Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FaDownload, FaPlus, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { getDarkModeClass } from "../../utils/darkModeUtils";

export default function ProductList({ darkMode }) {
    // Initialize Fancybox when component mounts
    useEffect(() => {
        Fancybox.bind("[data-fancybox]", {
            groupAll: true,
        });

        return () => {
            Fancybox.destroy();
        };
    }, []);

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const totalEntries = 937;
    const entriesPerPage = 25;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    // State for popup visibility
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // State for download dropdown
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);

    // State for row dropdown (expanded row)
    const [expandedRow, setExpandedRow] = useState(null);

    // State for active tab in the dropdown
    const [activeTab, setActiveTab] = useState("photo");

    // State for photo and video sliders
    const [photoSlideIndex, setPhotoSlideIndex] = useState(0);
    const [videoSlideIndex, setVideoSlideIndex] = useState(0);

    // Dummy data for sliders (replace with real data as needed)
    const photos = [
        "/images/c-programming-course.png",
        "/images/photo2.jpg",
        "/images/photo3.jpg",
    ];
    const videos = [
        "/videos/video1.mp4",
        "/videos/video2.mp4",
    ];

    // Slider navigation functions
    const nextPhotoSlide = () => {
        setPhotoSlideIndex((prev) => (prev + 1) % photos.length);
    };
    const prevPhotoSlide = () => {
        setPhotoSlideIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    const nextVideoSlide = () => {
        setVideoSlideIndex((prev) => (prev + 1) % videos.length);
    };
    const prevVideoSlide = () => {
        setVideoSlideIndex((prev) => (prev - 1 + videos.length) % videos.length);
    };

    // Function to open popup
    const openPopup = () => {
        setIsPopupOpen(true);
    };

    // Function to close popup
    const closePopup = () => {
        setIsPopupOpen(false);
    };

    // Toggle download dropdown
    const toggleDownloadDropdown = () => {
        setIsDownloadOpen(!isDownloadOpen);
    };

    // Toggle row dropdown
    const toggleRowDropdown = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
        setActiveTab("photo"); // Default to "photo" when opening a new dropdown
        setPhotoSlideIndex(0); // Reset sliders when opening
        setVideoSlideIndex(0);
    };

    // Handle ESC key to close popup and click outside to close dropdown
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                closePopup();
                setExpandedRow(null); // Close dropdown on ESC
            }
        };

        const handleClickOutside = (event) => {
            if (!event.target.closest('.download-container')) {
                setIsDownloadOpen(false);
            }
        };

        window.addEventListener("keydown", handleEsc);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <Head title="ProductList"/>
            <div
                className={`w-full rounded-lg shadow-md ${getDarkModeClass(
                    darkMode,
                    "bg-[#1A1A1A] text-gray-200",
                    "bg-white text-gray-900"
                )}`}
                style={{ fontFamily: "'Battambang', 'Roboto', sans-serif" }}
            >
                {/* Main Content */}
                <div className="w-full mx-auto p-2">
                    {/* Search and Buttons */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-1/3">
                            <input
                                type="text"
                                placeholder="Search..."
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
                            {/* Download Button with Dropdown */}
                            <div className="relative download-container">
                                <button
                                    onClick={toggleDownloadDropdown}
                                    className={`flex items-center text-sm px-4 py-2 rounded-lg transition ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                        "bg-[#f7b500] text-white hover:bg-[#ff8800]"
                                    )}`}
                                >
                                    <FaDownload className="mr-2" /> Download
                                </button>
                                {isDownloadOpen && (
                                    <div
                                        className={`absolute mt-1 w-48 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-200",
                                            "bg-white text-gray-900"
                                        )}`}
                                    >
                                        <div className={`px-4 py-2 text-sm font-semibold border-b ${getDarkModeClass(
                                            darkMode,
                                            "border-gray-700",
                                            "border-gray-200"
                                        )}`}>
                                            Export As
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
                                                Excel
                                            </button>
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                    darkMode,
                                                    "hover:bg-[#3A3A3A]",
                                                    "hover:bg-gray-100"
                                                )}`}
                                            >
                                                <FaFilePdf className="mr-2 text-red-500" />
                                                PDF
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
                                <FaPlus className="mr-2" /> Add New
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
                                            Photo
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            Code
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            Name KH
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            Name EN
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            Name CN
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            Declare
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            HS-Code
                                        </th>
                                        <th
                                            className={`p-3 text-left sticky top-0 z-10 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            Action
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
                                                        <a
                                                            href="/images/c-programming-course.png"
                                                            data-fancybox="gallery-product-default"
                                                        >
                                                            <img
                                                                src="/images/c-programming-course.png"
                                                                alt={`Item ${itemIndex + 1}`}
                                                                className="w-12 h-12 object-cover rounded"
                                                                loading="lazy"
                                                            />
                                                        </a>
                                                    </td>
                                                    <td className="p-3">ITEM{String(itemIndex + 1).padStart(3, "0")}</td>
                                                    <td className="p-3">ម៉ាស៊ីនត្រជាក់</td>
                                                    <td className="p-3">Air Conditioner</td>
                                                    <td className="p-3">空调</td>
                                                    <td className="p-3">Yes</td>
                                                    <td className="p-3">8415.10</td>
                                                    <td className="p-3">
                                                        <button
                                                            className={`text-orange-400 hover:text-[#ff8800] font-semibold px-2 py-1 rounded transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:drop-shadow-[0_0_8px_rgba(255,136,0,0.8)]",
                                                                "hover:bg-orange-100"
                                                            )}`}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className={`text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:drop-shadow-[0_0_8px_rgba(185,28,28,0.8)]",
                                                                "hover:bg-red-100"
                                                            )}`}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                                {/* Dropdown Row with Sliders */}
                                                {expandedRow === itemIndex && (
                                                    <tr>
                                                        <td colSpan="8" className="p-0">
                                                            <div
                                                                className={`p-4 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-300",
                                                                    "bg-gray-100 text-gray-900"
                                                                )}`}
                                                            >
                                                                {/* Tabs */}
                                                                <div className="flex">
                                                                    <button
                                                                        onClick={() => setActiveTab("photo")}
                                                                        className={`px-4 py-2 font-semibold ${
                                                                            activeTab === "photo"
                                                                                ? "border-b-2 border-[#ff8800] text-[#ff8800]"
                                                                                : "text-gray-500 hover:text-[#ff8800]"
                                                                        }`}
                                                                    >
                                                                        Photos
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setActiveTab("video")}
                                                                        className={`px-4 py-2 font-semibold ${
                                                                            activeTab === "video"
                                                                                ? "border-b-2 border-[#ff8800] text-[#ff8800]"
                                                                                : "text-gray-500 hover:text-[#ff8800]"
                                                                        }`}
                                                                    >
                                                                        Videos
                                                                    </button>
                                                                </div>
                                                                {/* Tab Content */}
                                                                <div className="mt-4">
                                                                    {activeTab === "photo" && (
                                                                        <div className="relative w-full">
                                                                            {/* Photo Slider */}
                                                                            <div className="overflow-hidden">
                                                                                <div
                                                                                    className="flex transition-transform duration-300 ease-in-out"
                                                                                    style={{
                                                                                        transform: `translateX(-${photoSlideIndex * 100}%)`,
                                                                                    }}
                                                                                >
                                                                                    {photos.map((photo, idx) => (
                                                                                        <div
                                                                                            key={idx}
                                                                                            className="min-w-full flex justify-center"
                                                                                        >
                                                                                            <img
                                                                                                src={photo}
                                                                                                alt={`Product Photo ${idx + 1}`}
                                                                                                data-fancybox="gallery-product-thumbnail"
                                                                                                className="w-64 h-64 object-cover rounded-lg"
                                                                                            />
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            {/* Navigation Arrows */}
                                                                            <button
                                                                                onClick={prevPhotoSlide}
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
                                                                                onClick={nextPhotoSlide}
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
                                                                            {/* Dots */}
                                                                            <div className="flex justify-center mt-2 space-x-2">
                                                                                {photos.map((_, idx) => (
                                                                                    <span
                                                                                        key={idx}
                                                                                        className={`w-2 h-2 rounded-full ${
                                                                                            photoSlideIndex === idx
                                                                                                ? "bg-[#ff8800]"
                                                                                                : "bg-gray-400"
                                                                                        }`}
                                                                                    ></span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {activeTab === "video" && (
                                                                        <div className="relative w-full">
                                                                            {/* Video Slider */}
                                                                            <div className="overflow-hidden">
                                                                                <div
                                                                                    className="flex transition-transform duration-300 ease-in-out"
                                                                                    style={{
                                                                                        transform: `translateX(-${videoSlideIndex * 100}%)`,
                                                                                    }}
                                                                                >
                                                                                    {videos.map((video, idx) => (
                                                                                        <div
                                                                                            key={idx}
                                                                                            className="min-w-full flex justify-center"
                                                                                        >
                                                                                            <video
                                                                                                src={video}
                                                                                                controls
                                                                                                className="h-64 object-cover rounded-lg"
                                                                                            />
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            {/* Navigation Arrows */}
                                                                            <button
                                                                                onClick={prevVideoSlide}
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
                                                                                onClick={nextVideoSlide}
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
                                                                            {/* Dots */}
                                                                            <div className="flex justify-center mt-2 space-x-2">
                                                                                {videos.map((_, idx) => (
                                                                                    <span
                                                                                        key={idx}
                                                                                        className={`w-2 h-2 rounded-full ${
                                                                                            videoSlideIndex === idx
                                                                                                ? "bg-[#ff8800]"
                                                                                                : "bg-gray-400"
                                                                                        }`}
                                                                                    ></span>
                                                                                ))}
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
                                <option value="10">10/page</option>
                                <option value="25">25/page</option>
                                <option value="50">50/page</option>
                                <option value="100">100/page</option>
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
                                Go to
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
                                Page
                            </span>
                        </div>
                    </div>
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
                                Add New Product
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
                                            Default Product Image
                                        </label>
                                        <div
                                            id="default-image-dropzone"
                                            className={`h-[180px] w-[180px] rounded-lg p-6 text-center cursor-pointer relative border border-dashed ${getDarkModeClass(
                                                darkMode,
                                                "border-gray-700 hover:border-orange-400",
                                                "border-gray-300 hover:border-orange-400"
                                            )} transition duration-200`}
                                        >
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
                                                    Drag & drop an image here or click to browse
                                                </p>
                                            </div>
                                            <div
                                                id="default-image-preview"
                                                className="p-1 hidden absolute inset-0 flex items-center justify-center"
                                            ></div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="default-image-input"
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
                                                Code Product
                                            </label>
                                            <input
                                                type="text"
                                                name="code"
                                                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder="Enter product code"
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
                                                Category
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
                                                    placeholder="Search Category..."
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
                                                        No Data
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
                                            Name KH
                                        </label>
                                        <input
                                            type="text"
                                            name="name_kh"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder="Enter name in Khmer"
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
                                            Name EN
                                        </label>
                                        <input
                                            type="text"
                                            name="name_en"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder="Enter name in English"
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
                                            Name CN
                                        </label>
                                        <input
                                            type="text"
                                            name="name_cn"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder="Enter name in Chinese"
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
                                            HS-Code
                                        </label>
                                        <input
                                            type="text"
                                            name="hs_code"
                                            className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder="Enter HS-Code"
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
                                        Declare
                                    </label>
                                    <textarea
                                        name="remark"
                                        className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                        rows="4"
                                        placeholder="Enter Declare"
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
                                            Thumbnail Images (Multiple)
                                        </label>
                                        <div
                                            id="thumbnail-dropzone"
                                            className={`w-full rounded-lg p-6 text-center cursor-pointer border border-dashed ${getDarkModeClass(
                                                darkMode,
                                                "border-gray-700 hover:border-orange-400",
                                                "border-gray-300 hover:border-orange-400"
                                            )} transition duration-200`}
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
                                                Drag & drop images here or click to browse
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                id="thumbnail-input"
                                            />
                                        </div>
                                        <div
                                            id="thumbnail-preview"
                                            className="h-[100px] mt-3 space-y-2"
                                        ></div>
                                    </div>
                                    <div>
                                        <label
                                            className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            Videos (Multiple)
                                        </label>
                                        <div
                                            id="video-dropzone"
                                            className={`w-full rounded-lg p-6 text-center cursor-pointer border border-dashed ${getDarkModeClass(
                                                darkMode,
                                                "border-gray-700 hover:border-orange-400",
                                                "border-gray-300 hover:border-orange-400"
                                            )} transition duration-200`}
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
                                                Drag & drop videos here or click to browse
                                            </p>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                multiple
                                                className="hidden"
                                                id="video-input"
                                            />
                                        </div>
                                        <div
                                            id="video-preview"
                                            className="h-[100px] mt-3 space-y-2"
                                        ></div>
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
                                    Cancel (ESC)
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
                                    Save (CTRL + ENTER)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ProductList.title = "Product Management -> Product List";
 