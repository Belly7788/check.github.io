import { Link, Head, usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    FaDownload,
    FaPlus,
    FaFileExcel,
    FaFilePdf,
    FaEllipsisV,
} from "react-icons/fa";
// import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import { useTranslation } from "react-i18next";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showConfirmAlert } from "../../Component/Confirm-Alert/Confirm-Alert";
import Spinner from "../../Component/spinner/spinner";
import Pagination from "../../Component/Pagination/Pagination";
import '../../BELLY/Component/Gallery/gallery_belly';
import Bellypopover from '../../BELLY/Component/Popover/Popover';
import Clipboard from '../../BELLY/Component/Clipboard/Clipboard';
import NoDataComponent from "../../Component/Empty/NoDataComponent";
import TableLoading from "../../Component/Loading/TableLoading/TableLoading";
import ShimmerLoading from "../../Component/Loading/ShimmerLoading/ShimmerLoading";
import NoImageComponent from "../../Component/Empty/NotImage/NotImage";
import { checkPermission } from '../../utils/permissionUtils';
import axios from 'axios';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProductList({ darkMode, products, pagination }) {
    const { t } = useTranslation();

    // State declarations (unchanged from your original code)
    const [currentPage, setCurrentPage] = useState(pagination.currentPage);
    const [entriesPerPage, setEntriesPerPage] = useState(pagination.perPage);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeTab, setActiveTab] = useState("photo");
    const [thumbnails, setThumbnails] = useState([]);
    const [videos, setVideos] = useState([]);
    const [thumbnailDragging, setThumbnailDragging] = useState(false);
    const [videoDragging, setVideoDragging] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [videosData, setVideosData] = useState([]);
    const [openActionDropdown, setOpenActionDropdown] = useState(null);
    const [defaultImage, setDefaultImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState({});
    const [loadedImages, setLoadedImages] = useState({});
    const [photosLoading, setPhotosLoading] = useState(false);
    const [videosLoading, setVideosLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [excelProgress, setExcelProgress] = useState(0);
    const [pdfProgress, setPdfProgress] = useState(0);
    const [formData, setFormData] = useState({
        product_code: '',
        name_kh: '',
        name_en: '',
        name_cn: '',
        declare: '',
        HS_code: '',
    });

    // Helper functions (unchanged from your original code)
    const formatFileName = (name) => {
        if (name.length > 10) {
            return `${name.substring(0, 10)}...${name.split('.').pop()}`;
        }
        return name;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
    };

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
                showErrorAlert({
                    title: t("error"),
                    message: t("failed_to_read_image"),
                    darkMode,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleThumbnailChange = (files) => {
        const currentThumbnailCount = thumbnails.length;
        const newFiles = Array.from(files);

        // Check if adding new files will exceed the limit
        if (currentThumbnailCount + newFiles.length > 50) {
            showErrorAlert({
                title: t("error"),
                message: t("max_image_limit_exceeded", { limit: 50 }),
                darkMode,
            });
            return;
        }

        const newThumbnails = newFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            size: file.size,
            name: file.name,
            progress: 0,
            loading: true,
            isNew: true,
            id: `${Date.now()}-${Math.random()}`
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

    const handleVideoChange = (files) => {
        const currentVideoCount = videos.length;
        const newFiles = Array.from(files);

        // Check if adding new files will exceed the limit
        if (currentVideoCount + newFiles.length > 50) {
            showErrorAlert({
                title: t("error"),
                message: t("max_video_limit_exceeded", { limit: 50 }),
                darkMode,
            });
            return;
        }

        const newVideos = newFiles.map(file => ({
            file,
            size: file.size,
            name: file.name,
            progress: 0,
            loading: true,
            isNew: true,
            id: `${Date.now()}-${Math.random()}`
        }));

        setVideos(prev => [...newVideos, ...prev]);

        newVideos.forEach((video, index) => {
            const videoElement = document.createElement('video');
            videoElement.src = URL.createObjectURL(video.file);
            videoElement.preload = "metadata";

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

            videoElement.onloadedmetadata = () => {
                videoElement.currentTime = 1;
            };

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
                        updated[index].loading = false;
                        return updated;
                    });
                } catch (error) {
                    console.error("Error generating thumbnail:", error);
                    setVideos(prev => {
                        const updated = [...prev];
                        updated[index].loading = false;
                        updated[index].preview = "/images/fallback-video.png";
                        return updated;
                    });
                }
            };

            videoElement.onerror = () => {
                console.error("Error loading video metadata");
                setVideos(prev => {
                    const updated = [...prev];
                    updated[index].loading = false;
                    updated[index].preview = "/images/fallback-video.png";
                    return updated;
                });
            };
        });
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleImageChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageChange(file);
    };

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

    const removeThumbnail = (index) => {
        setThumbnails(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = (index) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const openPopup = () => {
        setIsEditMode(false);
        setFormData({
            product_code: '',
            name_kh: '',
            name_en: '',
            name_cn: '',
            declare: '',
            HS_code: '',
        });
        setDefaultImage(null);
        setThumbnails([]);
        setVideos([]);
        setIsPopupOpen(true);
    };

    const openEditPopup = (product) => {
        setIsEditing(product.id);
        setIsEditMode(true);
        setCurrentProduct(product);
        setFormData({
            product_code: product.product_code || '',
            name_kh: product.name_kh || '',
            name_en: product.name_en || '',
            name_cn: product.name_cn || '',
            declare: product.declare || '',
            HS_code: product.HS_code || '',
        });
        setDefaultImage(product.image ? `/storage/${product.image}` : null);

        setThumbnails(product.images.map(img => ({
            id: img.id,
            preview: `/storage/${img.image}`,
            name: img.image.split('/').pop(),
            size: 0,
            progress: 100,
            loading: false,
            isNew: false,
            markedForDeletion: false
        })));

        const newVideos = product.videos.map(vid => ({
            id: vid.id,
            preview: null,
            name: vid.video.split('/').pop(),
            size: 0,
            progress: 100,
            loading: true,
            videoUrl: `/storage/${vid.video}`,
            isNew: false,
            markedForDeletion: false
        }));

        setVideos(newVideos);

        Promise.all(
            newVideos.map((video, index) => {
                return new Promise((resolve) => {
                    const videoElement = document.createElement('video');
                    videoElement.src = video.videoUrl;
                    videoElement.preload = 'metadata';

                    videoElement.onloadedmetadata = () => {
                        videoElement.currentTime = 1;
                    };

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
                                updated[index].loading = false;
                                return updated;
                            });
                            resolve();
                        } catch (error) {
                            console.error('Error generating thumbnail:', error);
                            setVideos(prev => {
                                const updated = [...prev];
                                updated[index].preview = '/images/fallback-video.png';
                                updated[index].loading = false;
                                return updated;
                            });
                            resolve();
                        }
                    };

                    videoElement.onerror = () => {
                        console.error('Error loading video metadata');
                        setVideos(prev => {
                            const updated = [...prev];
                            updated[index].preview = '/images/fallback-video.png';
                            updated[index].loading = false;
                            return updated;
                        });
                        resolve();
                    };
                });
            })
        ).then(() => {
            setIsEditing(null);
            setIsPopupOpen(true);
        });
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setCurrentProduct(null);
        setIsEditMode(false);
    };

    const toggleDownloadDropdown = () => setIsDownloadOpen(!isDownloadOpen);

    const toggleRowDropdown = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
        setActiveTab("photo");
        setCurrentPhotoIndex(0);
        setCurrentVideoIndex(0);
    };

    const create_product = 10;
    const update_product = 11;
    const view_product = 12;

    // no view list-product page
    useEffect(() => {
        checkPermission(view_product, (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                    buttons: [
                        {
                            onClick: () => {
                                router.visit('/');
                            },
                        },
                    ],
                });
            }
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const permissionId = isEditMode ? update_product : create_product;

        checkPermission(permissionId, (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }

            const textFields = [
                formData.product_code,
                formData.name_kh,
                formData.name_en,
                formData.name_cn,
                formData.declare,
                formData.HS_code,
            ].filter(field => field && field.trim() !== '');

            if (textFields.length === 0) {
                showErrorAlert({
                    title: t("error"),
                    message: t("please_enter_at_least_one_field"),
                    darkMode,
                });
                return;
            }

            setIsSubmitting(true);

            const form = new FormData();
            form.append('product_code', formData.product_code || '');
            form.append('name_kh', formData.name_kh || '');
            form.append('name_en', formData.name_en || '');
            form.append('name_cn', formData.name_cn || '');
            form.append('declare', formData.declare || '');
            form.append('HS_code', formData.HS_code || '');

            if (defaultImage && defaultImage.startsWith('data:')) {
                const file = dataURLtoFile(defaultImage, 'default_image.png');
                form.append('default_image', file);
            } else if (defaultImage && isEditMode) {
                form.append('existing_default_image', defaultImage.replace('/storage/', ''));
            }

            thumbnails.forEach((thumbnail, index) => {
                if (thumbnail.file && !thumbnail.markedForDeletion) {
                    form.append(`thumbnails[${index}]`, thumbnail.file);
                } else if (thumbnail.preview && isEditMode && !thumbnail.markedForDeletion) {
                    form.append(`existing_thumbnails[${index}]`, thumbnail.preview.replace('/storage/', ''));
                }
            });

            videos.forEach((video, index) => {
                if (video.file && !video.markedForDeletion) {
                    form.append(`videos[${index}]`, video.file);
                } else if (video.videoUrl && isEditMode && !video.markedForDeletion) {
                    form.append(`existing_videos[${index}]`, video.videoUrl.replace('/storage/', ''));
                }
            });

            if (isEditMode) {
                thumbnails.forEach((thumbnail, index) => {
                    if (thumbnail.markedForDeletion && !thumbnail.isNew) {
                        form.append(`deleted_thumbnails[${index}]`, thumbnail.id);
                    }
                });

                videos.forEach((video, index) => {
                    if (video.markedForDeletion && !video.isNew) {
                        form.append(`deleted_videos[${index}]`, video.id);
                    }
                });
            }

            const method = isEditMode ? 'post' : 'post';
            const url = isEditMode ? `/product/${currentProduct.id}` : '/product';

            if (isEditMode) {
                form.append('_method', 'PUT');
            }

            router.post(url, form, {
                forceFormData: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    closePopup();
                    showSuccessAlert({
                        title: t("success"),
                        message: isEditMode ? t("product_updated_successfully") : t("product_created_successfully"),
                        darkMode,
                        timeout: 3000,
                    });
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const errorMessage = t("the_product_code_has_already_been_taken");
                    showErrorAlert({
                        title: t("error"),
                        message: errorMessage,
                        darkMode,
                    });
                },
            });
        });
    };

    const delete_product = 13;
    const handleDelete = (id) => {
        // Check delete permission before showing confirmation
        checkPermission(delete_product, (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }

            showConfirmAlert({
                title: t("confirm_delete_title"),
                message: t("confirm_delete_product"),
                darkMode,
                isLoading: isDeleting === id,
                onConfirm: () => {
                    setIsDeleting(id);
                    router.delete(`/product/${id}`, {
                        onSuccess: () => {
                            setIsDeleting(null);
                            showSuccessAlert({
                                title: t("success"),
                                message: t("product_deleted_successfully"),
                                darkMode,
                                timeout: 3000,
                            });
                        },
                        onError: () => {
                            setIsDeleting(null);
                            showErrorAlert({
                                title: t("error"),
                                message: t("failed_to_delete_product"),
                                darkMode,
                            });
                        },
                        preserveScroll: true,
                    });
                },
            });
        });
    };

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setIsLoading(true);
            router.get('/product/productlist', {
                search: searchQuery,
                perPage: entriesPerPage,
                page: 1,
            }, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            });
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setIsLoading(true);
        router.get('/product/productlist', {
            search: searchQuery,
            perPage: entriesPerPage,
            page: page,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleEntriesPerPageChange = (e) => {
        const newEntriesPerPage = Number(e.target.value);
        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(1);
        setIsLoading(true);
        router.get('/product/productlist', {
            search: searchQuery,
            perPage: newEntriesPerPage,
            page: 1,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleNextPhoto = () => {
        setCurrentPhotoIndex((prevIndex) =>
            prevIndex === photos.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevPhoto = () => {
        setCurrentPhotoIndex((prevIndex) =>
            prevIndex === 0 ? photos.length - 1 : prevIndex - 1
        );
    };

    const handleNextVideo = () => {
        setCurrentVideoIndex((prevIndex) =>
            prevIndex === videosData.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevVideo = () => {
        setCurrentVideoIndex((prevIndex) =>
            prevIndex === 0 ? videosData.length - 1 : prevIndex - 1
        );
    };

    useEffect(() => {
        if (expandedRow !== null) {
            const product = products[expandedRow];
            if (activeTab === 'photo') {
                setPhotosLoading(true);
                axios.get(`/product/images/${product.id}`)
                    .then(response => {
                        setPhotos(response.data.map(img => `/storage/${img}`));
                        setCurrentPhotoIndex(0);
                        setPhotosLoading(false);
                    })
                    .catch(error => {
                        console.error('Error fetching images:', error);
                        showErrorAlert({
                            title: t("error"),
                            message: t("failed_to_fetch_images"),
                            darkMode,
                        });
                        setPhotosLoading(false);
                    });
            } else if (activeTab === 'video') {
                setVideosLoading(true);
                axios.get(`/product/videos/${product.id}`)
                    .then(response => {
                        setVideosData(response.data.map(vid => `/storage/${vid}`));
                        setCurrentVideoIndex(0);
                        setVideosLoading(false);
                    })
                    .catch(error => {
                        console.error('Error fetching videos:', error);
                        showErrorAlert({
                            title: t("error"),
                            message: t("failed_to_fetch_videos"),
                            darkMode,
                        });
                        setVideosLoading(false);
                    });
            }
        }
    }, [expandedRow, activeTab]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'Enter' && isPopupOpen) {
                handleSubmit(e);
            }
            if (e.key === 'Escape') {
                closePopup();
                setExpandedRow(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPopupOpen, formData, defaultImage, thumbnails, videos]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".download-container")) {
                setIsDownloadOpen(false);
            }
            if (!event.target.closest(".action-container")) {
                setOpenActionDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const excel = 14;
    const pdf = 15;

    const handleDownloadExcel = () => {
        checkPermission(excel, (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }

            // Existing Excel download logic
            (async () => {
                try {
                    setExcelProgress(10); // Start progress
                    const progressInterval = setInterval(() => {
                        setExcelProgress((prev) => {
                            if (prev >= 90) {
                                return prev;
                            }
                            return prev + 10;
                        });
                    }, 500);

                    const response = await axios.get('/products/all');
                    const allProducts = response.data;

                    setExcelProgress(30);

                    const data = allProducts.map((product, index) => ({
                        No: index + 1,
                        'CODE-PRODUCT': product.product_code || '',
                        'NAME-KH': product.name_kh || '',
                        'NAME-EN': product.name_en || '',
                        'NAME-CN': product.name_cn || '',
                        'HS-CODE': product.HS_code || '',
                    }));

                    setExcelProgress(50);

                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('Products');

                    worksheet.columns = [
                        { width: 6 },
                        { width: 18 },
                        { width: 25 },
                        { width: 25 },
                        { width: 25 },
                        { width: 18 },
                    ];

                    worksheet.mergeCells('A1:F1');
                    const titleCell = worksheet.getCell('A1');
                    titleCell.value = 'Product List';
                    titleCell.font = { bold: true, size: 16, name: 'Calibri', color: { argb: 'FF8800' } };
                    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F0FA' } };
                    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                    worksheet.getRow(1).height = 50;

                    for (let col = 1; col <= 6; col++) {
                        const cell = worksheet.getCell(1, col);
                        cell.border = {
                            top: { style: 'thin', color: { argb: '000000' } },
                            bottom: { style: 'thin', color: { argb: '000000' } },
                            left: { style: 'thin', color: { argb: '000000' } },
                            right: { style: 'thin', color: { argb: '000000' } },
                        };
                    }

                    worksheet.addRow(['No', 'CODE-PRODUCT', 'NAME-KH', 'NAME-EN', 'NAME-CN', 'HS-CODE']);
                    const headerRow = worksheet.getRow(2);
                    headerRow.font = { bold: true, size: 12, name: 'Calibri', color: { argb: 'FFFFFF' } };
                    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    headerRow.height = 50;

                    for (let col = 1; col <= 6; col++) {
                        const cell = headerRow.getCell(col);
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8800' } };
                        cell.border = {
                            top: { style: 'thin', color: { argb: '000000' } },
                            bottom: { style: 'thin', color: { argb: '000000' } },
                            left: { style: 'thin', color: { argb: '000000' } },
                            right: { style: 'thin', color: { argb: '000000' } },
                        };
                    }

                    data.forEach((item, index) => {
                        const row = worksheet.addRow([
                            item.No,
                            item['CODE-PRODUCT'],
                            item['NAME-KH'],
                            item['NAME-EN'],
                            item['NAME-CN'],
                            item['HS-CODE'],
                        ]);
                        row.font = { size: 11, name: 'Calibri', color: { argb: '000000' } };
                        row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        row.height = 50;

                        for (let col = 1; col <= 6; col++) {
                            const cell = row.getCell(col);
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: index % 2 === 0 ? 'F5F7FA' : 'FFFFFF' },
                            };
                            cell.border = {
                                top: { style: 'thin', color: { argb: '000000' } },
                                bottom: { style: 'thin', color: { argb: '000000' } },
                                left: { style: 'thin', color: { argb: '000000' } },
                                right: { style: 'thin', color: { argb: '000000' } },
                            };
                        }
                    });

                    setExcelProgress(80);

                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    const dateTime = `${year}${month}${day}_${hours}${minutes}${seconds}`;
                    const fileName = `Product_List_${dateTime}.xlsx`;

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    saveAs(blob, fileName);

                    setExcelProgress(100);
                    clearInterval(progressInterval);

                    showSuccessAlert({
                        title: t('success'),
                        message: t('excel_downloaded_successfully'),
                        darkMode,
                        timeout: 3000,
                    });

                    setTimeout(() => setExcelProgress(0), 1000);
                } catch (error) {
                    console.error('Error downloading Excel:', error);
                    setExcelProgress(0);
                    clearInterval(progressInterval);
                    showErrorAlert({
                        title: t('error'),
                        message: t('failed_to_download_excel'),
                        darkMode,
                    });
                }
            })();
        });
    };

    const handleDownloadPDF = () => {
        checkPermission(pdf, (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }

            // Existing PDF download logic
            (async () => {
                try {
                    setPdfProgress(10);
                    const progressInterval = setInterval(() => {
                        setPdfProgress((prev) => {
                            if (prev >= 90) {
                                return prev;
                            }
                            return prev + 10;
                        });
                    }, 500);

                    const response = await axios.get('/products/all');
                    const allProducts = response.data;

                    setPdfProgress(30);

                    const data = allProducts.map((product, index) => [
                        (index + 1).toString(),
                        product.product_code || '',
                        product.name_en || '',
                        product.HS_code || '',
                    ]);

                    setPdfProgress(50);

                    const doc = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4',
                    });

                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(255, 136, 0);
                    doc.text('Product List', 105, 20, { align: 'center' });

                    const headers = [['No', 'CODE-PRODUCT', 'NAME-EN', 'HS-CODE']];
                    const columnWidths = [15, 40, 85, 30];

                    autoTable(doc, {
                        startY: 30,
                        head: headers,
                        body: data,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [255, 136, 0],
                            textColor: [255, 255, 255],
                            fontSize: 10,
                            fontStyle: 'bold',
                            halign: 'center',
                            valign: 'middle',
                        },
                        bodyStyles: {
                            fontSize: 9,
                            textColor: [0, 0, 0],
                            halign: 'center',
                            valign: 'middle',
                        },
                        alternateRowStyles: {
                            fillColor: [245, 247, 250],
                        },
                        columnStyles: {
                            0: { cellWidth: columnWidths[0] },
                            1: { cellWidth: columnWidths[1] },
                            2: { cellWidth: columnWidths[2] },
                            3: { cellWidth: columnWidths[3] },
                        },
                        margin: { top: 30, left: 10, right: 10 },
                        didDrawCell: (data) => {
                            doc.setDrawColor(0, 0, 0);
                            doc.rect(
                                data.cell.x,
                                data.cell.y,
                                data.cell.width,
                                data.cell.height,
                                'S'
                            );
                        },
                    });

                    setPdfProgress(80);

                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    const dateTime = `${year}${month}${day}_${hours}${minutes}${seconds}`;
                    const fileName = `Product_List_${dateTime}.pdf`;

                    doc.save(fileName);

                    setPdfProgress(100);
                    clearInterval(progressInterval);

                    showSuccessAlert({
                        title: t('success'),
                        message: t('pdf_downloaded_successfully'),
                        darkMode,
                        timeout: 3000,
                    });

                    setTimeout(() => setPdfProgress(0), 1000);
                } catch (error) {
                    console.error('Error downloading PDF:', error);
                    setPdfProgress(0);
                    clearInterval(progressInterval);
                    showErrorAlert({
                        title: t('error'),
                        message: t('failed_to_download_pdf'),
                        darkMode,
                    });
                }
            })();
        });
    };

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
                                                id="DownloadExcel"
                                                onClick={handleDownloadExcel}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center relative ${getDarkModeClass(
                                                    darkMode,
                                                    "hover:bg-[#3A3A3A]",
                                                    "hover:bg-gray-100"
                                                )}`}
                                                disabled={excelProgress > 0 && excelProgress < 100}
                                            >
                                                <FaFileExcel className="mr-2 text-green-500" />
                                                {t("excel")}
                                                {excelProgress > 0 && excelProgress <= 100 && (
                                                    <div className="absolute bottom-0 left-0 h-1 bg-[#ff8800] transition-all duration-300" style={{ width: `${excelProgress}%` }}></div>
                                                )}
                                            </button>
                                            <button
                                                id="DownloadPDF"
                                                onClick={handleDownloadPDF}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center relative ${getDarkModeClass(
                                                    darkMode,
                                                    "hover:bg-[#3A3A3A]",
                                                    "hover:bg-gray-100"
                                                )}`}
                                                disabled={pdfProgress > 0 && pdfProgress < 100}
                                            >
                                                <FaFilePdf className="mr-2 text-red-500" />
                                                {t("pdf")}
                                                {pdfProgress > 0 && pdfProgress <= 100 && (
                                                    <div className="absolute bottom-0 left-0 h-1 bg-[#ff8800] transition-all duration-300" style={{ width: `${pdfProgress}%` }}></div>
                                                )}
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
                    {/* The rest of your JSX remains unchanged */}
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
                                {isLoading ? (
                                    <TableLoading darkMode={darkMode} rowCount={entriesPerPage} colCount={8} />
                                ) : (
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan="8">
                                                    <NoDataComponent darkMode={darkMode} />
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product, index) => (
                                                <>
                                                    <tr
                                                        key={product.id}
                                                        onClick={() => toggleRowDropdown(index)}
                                                        className={`border-b cursor-pointer ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                            "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                        )}`}
                                                    >
                                                        <td className="p-3">
                                                            {product.image ? (
                                                                <div className="relative w-12 h-12">
                                                                {!
                                                                    loadedImages[product.id]
                                                                        &&
                                                                    <ShimmerLoading
                                                                        darkMode={darkMode}
                                                                        width="3rem"
                                                                        height="3rem"
                                                                        borderRadius="0.25rem"
                                                                        rowCount={1}
                                                                        colCount={1}
                                                                    />
                                                                }

                                                                <img
                                                                    data-kheng-chetra={`belly-gallery-product-default-${product.id}`}
                                                                    src={`/storage/${product.image}`}
                                                                    className={`w-12 h-12 object-cover rounded absolute top-0 left-0 transition-opacity duration-300 ${loadedImages[product.id] ? 'opacity-100' : 'opacity-0'}`}
                                                                    loading="lazy"
                                                                    onLoad={() =>
                                                                    setLoadedImages(prev => ({ ...prev, [product.id]: true }))
                                                                    }
                                                                />
                                                                </div>
                                                            ) : (
                                                                <NoImageComponent
                                                                    darkMode={darkMode}
                                                                    width="3rem"
                                                                    height="3rem"
                                                                    borderRadius="0.25rem"
                                                                    fontSize="10px"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {product.product_code ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.product_code}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-Purple ${getDarkModeClass(
                                                                                darkMode,
                                                                                "label-Purple-darkmode",
                                                                                ""
                                                                            )}`}
                                                                            data-belly-caption={product.product_code}
                                                                        >
                                                                            {product.product_code.length > 15
                                                                                ? `${product.product_code.substring(0, 12)}...`
                                                                                : product.product_code}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {product.name_kh ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.name_kh}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-green ${getDarkModeClass(
                                                                                darkMode,
                                                                                "label-green-darkmode",
                                                                                ""
                                                                            )}`}
                                                                            data-belly-caption={product.name_kh}
                                                                        >
                                                                            {product.name_kh.length > 15
                                                                                ? `${product.name_kh.substring(0, 12)}...`
                                                                                : product.name_kh}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {product.name_en ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.name_en}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-orange ${getDarkModeClass(
                                                                                darkMode,
                                                                                "label-orange-darkmode",
                                                                                ""
                                                                            )}`}
                                                                            data-belly-caption={product.name_en}
                                                                        >
                                                                            {product.name_en.length > 15
                                                                                ? `${product.name_en.substring(0, 12)}...`
                                                                                : product.name_en}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {product.name_cn ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.name_cn}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-red ${getDarkModeClass(
                                                                                darkMode,
                                                                                "label-red-darkmode",
                                                                                ""
                                                                            )}`}
                                                                            data-belly-caption={product.name_cn}
                                                                        >
                                                                            {product.name_cn.length > 15
                                                                                ? `${product.name_cn.substring(0, 12)}...`
                                                                                : product.name_cn}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {product.declare ? (

                                                                <Bellypopover darkMode={darkMode}>
                                                                    <span
                                                                        className={`label-blue ${getDarkModeClass(
                                                                            darkMode,
                                                                            "label-blue-darkmode",
                                                                            ""
                                                                        )}`}
                                                                        data-belly-caption={product.declare}
                                                                    >
                                                                        {product.declare.length > 15
                                                                            ? `${product.declare.substring(0, 12)}...`
                                                                            : product.declare}
                                                                    </span>
                                                                </Bellypopover>

                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {product.HS_code ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.HS_code}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-pink ${getDarkModeClass(
                                                                                darkMode,
                                                                                "label-pink-darkmode",
                                                                                ""
                                                                            )}`}
                                                                            data-belly-caption={product.HS_code}
                                                                        >
                                                                            {product.HS_code.length > 15
                                                                                ? `${product.HS_code.substring(0, 12)}...`
                                                                                : product.HS_code}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td className="p-3 w-20">
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
                                                                        className={`absolute right-6 w-40 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                                                            darkMode,
                                                                            "bg-[#2D2D2D] text-gray-200",
                                                                            "bg-white text-gray-900"
                                                                        )}`}
                                                                    >
                                                                        <button
                                                                            onClick={() => openEditPopup(product)}
                                                                            disabled={isEditing === product.id}
                                                                            className={`w-full text-left hover:rounded px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                                                darkMode,
                                                                                "hover:bg-[#3A3A3A]",
                                                                                "hover:bg-gray-100"
                                                                            )} ${isEditing === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            {isEditing === product.id ? (
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
                                                                            onClick={() => handleDelete(product.id)}
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
                                                    {expandedRow === index && (
                                                        <tr key={`${product.id}-expanded`}>
                                                            <td colSpan="8" className="p-0">
                                                                <div
                                                                    className={`p-4 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-[#2D2D2D] text-gray-300",
                                                                        "bg-gray-100 text-gray-900"
                                                                    )}`}
                                                                >
                                                                    <div className="flex">
                                                                        <button
                                                                            onClick={() => setActiveTab("photo")}
                                                                            className={`px-4 py-2 font-semibold ${
                                                                                activeTab === "photo"
                                                                                    ? "border-b-2 border-[#ff8800] text-[#ff8800]"
                                                                                    : "text-gray-500 hover:text-[#ff8800]"
                                                                            }`}
                                                                        >
                                                                            {t("photos")}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setActiveTab("video")}
                                                                            className={`px-4 py-2 font-semibold ${
                                                                                activeTab === "video"
                                                                                    ? "border-b-2 border-[#ff8800] text-[#ff8800]"
                                                                                    : "text-gray-500 hover:text-[#ff8800]"
                                                                            }`}
                                                                        >
                                                                            {t("videos")}
                                                                        </button>
                                                                    </div>
                                                                    <div className="mt-6">
                                                                        {activeTab === "photo" && (
                                                                            <div className="relative w-full max-w-3xl mx-auto">
                                                                                {photosLoading ? (
                                                                                    <ShimmerLoading
                                                                                        darkMode={darkMode}
                                                                                        width="100%"
                                                                                        height="256px"
                                                                                        borderRadius="12px"
                                                                                        rowCount={1}
                                                                                        colCount={1}
                                                                                    />
                                                                                ) : photos.length > 0 ? (
                                                                                    <div className="relative p-5 overflow-hidden rounded-xl">
                                                                                        <div className="relative overflow-hidden rounded-xl">
                                                                                            <div
                                                                                                className="flex transition-transform duration-500 ease-in-out"
                                                                                                style={{ transform: `translateX(-${currentPhotoIndex * 100}%)` }}
                                                                                            >
                                                                                                {photos.map((photo, idx) => (
                                                                                                    <img
                                                                                                        key={`photo-${idx}`}
                                                                                                        src={photo}
                                                                                                        data-kheng-chetra={`belly-gallery-product-thumbnail-${product.id}`}
                                                                                                        className="w-full h-64 object-contain flex-shrink-0"
                                                                                                        loading="lazy"
                                                                                                    />
                                                                                                ))}
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={handlePrevPhoto}
                                                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-md transition-all duration-200 hover:scale-110 z-10"
                                                                                            >
                                                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                                                                </svg>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={handleNextPhoto}
                                                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-md transition-all duration-200 hover:scale-110 z-10"
                                                                                            >
                                                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1 ${getDarkModeClass(darkMode, 'bg-gray-800 bg-opacity-75', 'bg-white bg-opacity-75')} p-1 rounded-full shadow-md`}>
                                                                                            {photos.length <= 5 ? (
                                                                                                photos.map((_, idx) => (
                                                                                                    <button
                                                                                                        key={`dot-${idx}`}
                                                                                                        onClick={() => setCurrentPhotoIndex(idx)}
                                                                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            currentPhotoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                            currentPhotoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                        )}`}
                                                                                                    />
                                                                                                ))
                                                                                            ) : (
                                                                                                <>
                                                                                                    <button
                                                                                                        onClick={() => setCurrentPhotoIndex(0)}
                                                                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            currentPhotoIndex === 0 ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                            currentPhotoIndex === 0 ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                        )}`}
                                                                                                    />
                                                                                                    {Array.from({ length: photos.length }, (_, idx) => idx).slice(
                                                                                                        Math.max(1, currentPhotoIndex - 1),
                                                                                                        Math.min(photos.length - 1, currentPhotoIndex + 2)
                                                                                                    ).map(idx => (
                                                                                                        <button
                                                                                                            key={`dot-${idx}`}
                                                                                                            onClick={() => setCurrentPhotoIndex(idx)}
                                                                                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                                darkMode,
                                                                                                                currentPhotoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                                currentPhotoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                            )}`}
                                                                                                        />
                                                                                                    ))}
                                                                                                    <button
                                                                                                        onClick={() => setCurrentPhotoIndex(photos.length - 1)}
                                                                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            currentPhotoIndex === photos.length - 1 ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                            currentPhotoIndex === photos.length - 1 ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                        )}`}
                                                                                                    />
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <NoDataComponent darkMode={darkMode} />
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {activeTab === "video" && (
                                                                            <div className="relative w-full max-w-3xl mx-auto">
                                                                                {videosLoading ? (
                                                                                    <ShimmerLoading
                                                                                        darkMode={darkMode}
                                                                                        width="100%"
                                                                                        height="256px"
                                                                                        borderRadius="12px"
                                                                                        rowCount={1}
                                                                                        colCount={1}
                                                                                    />
                                                                                ) : videosData.length > 0 ? (
                                                                                    <div className="relative p-5 overflow-hidden rounded-xl">
                                                                                        <div className="relative overflow-hidden rounded-xl">
                                                                                            <div
                                                                                                className="flex transition-transform duration-500 ease-in-out"
                                                                                                style={{ transform: `translateX(-${currentVideoIndex * 100}%)` }}
                                                                                            >
                                                                                                {videosData.map((video, idx) => (
                                                                                                    <video
                                                                                                        key={`video-${idx}`}
                                                                                                        src={video}
                                                                                                        controls
                                                                                                        className="w-full h-64 object-contain flex-shrink-0"
                                                                                                        loading="lazy"
                                                                                                    />
                                                                                                ))}
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={handlePrevVideo}
                                                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-md transition-all duration-200 hover:scale-110 z-10"
                                                                                            >
                                                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                                                                </svg>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={handleNextVideo}
                                                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-md transition-all duration-200 hover:scale-110 z-10"
                                                                                            >
                                                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1 ${getDarkModeClass(darkMode, 'bg-gray-800 bg-opacity-75', 'bg-white bg-opacity-75')} p-1 rounded-full shadow-md`}>
                                                                                            {videosData.length <= 5 ? (
                                                                                                videosData.map((_, idx) => (
                                                                                                    <button
                                                                                                        key={`video-dot-${idx}`}
                                                                                                        onClick={() => setCurrentVideoIndex(idx)}
                                                                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            currentVideoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                            currentVideoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                        )}`}
                                                                                                    />
                                                                                                ))
                                                                                            ) : (
                                                                                                <>
                                                                                                    <button
                                                                                                        onClick={() => setCurrentVideoIndex(0)}
                                                                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            currentVideoIndex === 0 ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                            currentVideoIndex === 0 ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                        )}`}
                                                                                                    />
                                                                                                    {Array.from({ length: videosData.length }, (_, idx) => idx).slice(
                                                                                                        Math.max(1, currentVideoIndex - 1),
                                                                                                        Math.min(videosData.length - 1, currentVideoIndex + 2)
                                                                                                    ).map(idx => (
                                                                                                        <button
                                                                                                            key={`video-dot-${idx}`}
                                                                                                            onClick={() => setCurrentVideoIndex(idx)}
                                                                                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                                darkMode,
                                                                                                                currentVideoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                                currentVideoIndex === idx ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                            )}`}
                                                                                                        />
                                                                                                    ))}
                                                                                                    <button
                                                                                                        onClick={() => setCurrentVideoIndex(videosData.length - 1)}
                                                                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            currentVideoIndex === videosData.length - 1 ? 'bg-[#ff8800] scale-125' : 'bg-gray-600',
                                                                                                            currentVideoIndex === videosData.length - 1 ? 'bg-[#ff8800] scale-125' : 'bg-gray-400'
                                                                                                        )}`}
                                                                                                    />
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <NoDataComponent darkMode={darkMode} />
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))
                                        )}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                    <Pagination
                        darkMode={darkMode}
                        currentPage={currentPage}
                        totalEntries={pagination.total}
                        entriesPerPage={entriesPerPage}
                        onPageChange={handlePageChange}
                        onEntriesPerPageChange={handleEntriesPerPageChange}
                    />
                </div>
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
                                {isEditMode ? t("edit_product") : t("add_new_product")}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                            <form id="add-product-form" className="space-y-6" onSubmit={handleSubmit}>
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
                                                    <ShimmerLoading
                                                        darkMode={darkMode}
                                                        width="100%"
                                                        height="100%"
                                                        borderRadius="8px"
                                                        rowCount={1}
                                                        colCount={1}
                                                    />
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
                                                name="product_code"
                                                value={formData.product_code}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, product_code: e.target.value })
                                                }
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
                                            value={formData.name_kh}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name_kh: e.target.value })
                                            }
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
                                            value={formData.name_en}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name_en: e.target.value })
                                            }
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
                                            value={formData.name_cn}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name_cn: e.target.value })
                                            }
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
                                            name="HS_code"
                                            value={formData.HS_code}
                                            onChange={(e) =>
                                                setFormData({ ...formData, HS_code: e.target.value })
                                            }
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
                                        name="declare"
                                        value={formData.declare}
                                        onChange={(e) =>
                                            setFormData({ ...formData, declare: e.target.value })
                                        }
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
                                            className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                        >
                                            {t("list_pis.reference_images")}
                                        </label>
                                        <div
                                            onDrop={handleThumbnailDrop}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setThumbnailDragging(true);
                                            }}
                                            onDragLeave={() => setThumbnailDragging(false)}
                                            className={`w-full rounded-lg p-[1rem] text-center cursor-pointer border border-dashed transition duration-200 ${
                                                thumbnailDragging
                                                    ? "border-orange-400 bg-orange-100/20"
                                                    : getDarkModeClass(
                                                        darkMode,
                                                        "border-gray-700 hover:border-orange-400",
                                                        "border-gray-300 hover:border-orange-400"
                                                    )
                                            }`}
                                            onClick={() => document.getElementById("thumbnail-input-col4").click()}
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
                                                onChange={(e) => handleThumbnailChange(e.target.files)}
                                            />
                                        </div>
                                        <div className="h-[175px] custom-scrollbar overflow-auto mt-3 p-2">
                                            <div id="thumbnail-preview-col4" className="space-y-2">
                                                {thumbnails.map((thumbnail, index) => (
                                                    <div
                                                        key={`thumbnail-col4-${thumbnail.id || index}`}
                                                        className={`flex items-center p-1 rounded-lg border transition-all duration-200 ${
                                                            thumbnail.markedForDeletion && !thumbnail.isNew
                                                                ? 'opacity-50 border-red-500'
                                                                : getDarkModeClass(
                                                                    darkMode,
                                                                    'border-gray-700 bg-[#2D2D2D]',
                                                                    'border-gray-200 bg-gray-100'
                                                                )
                                                        }`}
                                                    >
                                                        <div className="relative w-10 h-10 mr-2 flex-shrink-0">
                                                            {thumbnail.loading ? (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Spinner
                                                                        width="22px"
                                                                        height="22px"
                                                                        color={darkMode ? "#ff8800" : "#ff8800"}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <img
                                                                    src={thumbnail.preview}
                                                                    className="w-10 h-10 cursor-pointer object-cover rounded"
                                                                    data-kheng-chetra={`reference-pidetail-${currentProduct?.id || 'new'}`}
                                                                    onLoad={() => {
                                                                        if (thumbnail.isNew) {
                                                                            setThumbnails(prev => prev.map(t =>
                                                                                t.id === thumbnail.id ? { ...t, loading: false } : t
                                                                            ));
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`truncate ${getDarkModeClass(darkMode, 'text-gray-300', 'text-gray-700')}`}>
                                                                {formatFileName(thumbnail.name)}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <p className={`text-xs ${getDarkModeClass(darkMode, 'text-gray-500', 'text-gray-500')}`}>
                                                                    {thumbnail.size ? formatFileSize(thumbnail.size) : ''}
                                                                </p>
                                                                {thumbnail.estimatedTime && (
                                                                    <p className={`text-xs ml-2 ${getDarkModeClass(darkMode, 'text-gray-400', 'text-gray-500')}`}>
                                                                        {thumbnail.estimatedTime}s remaining
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {thumbnail.loading && (
                                                                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-[#ff8800] rounded-full transition-all duration-300"
                                                                        style={{ width: `${thumbnail.progress}%` }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (thumbnail.isNew) {
                                                                    removeThumbnail(index);
                                                                } else {
                                                                    setThumbnails(prev => prev.map((t, i) =>
                                                                        i === index ? { ...t, markedForDeletion: !t.markedForDeletion } : t
                                                                    ));
                                                                }
                                                            }}
                                                            className={`p-1 rounded-full ml-2 ${getDarkModeClass(
                                                                darkMode,
                                                                'hover:bg-gray-600',
                                                                'hover:bg-gray-200'
                                                            )}`}
                                                            disabled={thumbnail.loading}
                                                            aria-label={thumbnail.markedForDeletion ? t('restore_image') : t('remove_image')}
                                                        >
                                                            {thumbnail.markedForDeletion && !thumbnail.isNew ? (
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
                                                                            ? getDarkModeClass(darkMode, 'text-gray-600', 'text-gray-400')
                                                                            : getDarkModeClass(darkMode, 'text-gray-400', 'text-gray-500')
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
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            className={`uppercase block font-medium mb-1 ${getDarkModeClass(
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
                                            className={`w-full rounded-lg p-[1rem] text-center cursor-pointer border border-dashed transition duration-200 ${
                                                videoDragging
                                                    ? "border-orange-400 bg-orange-100/20"
                                                    : getDarkModeClass(
                                                        darkMode,
                                                        "border-gray-700 hover:border-orange-400",
                                                        "border-gray-300 hover:border-orange-400"
                                                    )
                                            }`}
                                            onClick={() => document.getElementById("video-input").click()}
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
                                                onChange={(e) => handleVideoChange(e.target.files)}
                                            />
                                        </div>
                                        <div className="h-[175px] custom-scrollbar overflow-auto mt-3 p-2">
                                            <div id="video-preview" className="space-y-2">
                                                {videos.map((video, index) => (
                                                    <div
                                                        key={`video-preview-${video.id || index}`}
                                                        className={`flex items-center p-1 rounded-lg border transition-all duration-200 ${
                                                            video.markedForDeletion && !video.isNew
                                                                ? 'opacity-50 border-red-500'
                                                                : getDarkModeClass(
                                                                    darkMode,
                                                                    'border-gray-700 bg-[#2D2D2D]',
                                                                    'border-gray-200 bg-gray-100'
                                                                )
                                                        }`}
                                                    >
                                                        <div className="relative w-10 h-10 mr-2 flex-shrink-0">
                                                            {video.loading ? (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Spinner
                                                                        width="22px"
                                                                        height="22px"
                                                                        color={darkMode ? "#ff8800" : "#ff8800"}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <img
                                                                    src={video.preview}
                                                                    alt={video.name}
                                                                    className="w-10 h-10 object-cover rounded cursor-pointer"
                                                                    onClick={() => {
                                                                        const videoElement = document.createElement('video');
                                                                        videoElement.src = video.videoUrl;
                                                                        videoElement.preload = 'metadata';
                                                                        videoElement.onloadedmetadata = () => {
                                                                            videoElement
                                                                                .play()
                                                                                .then(() => {
                                                                                    if (videoElement.requestPictureInPicture) {
                                                                                        videoElement
                                                                                            .requestPictureInPicture()
                                                                                            .catch(error => {
                                                                                                console.error('Error entering PiP:', error);
                                                                                                showErrorAlert({
                                                                                                    title: t("error"),
                                                                                                    message: t("failed_to_enter_pip"),
                                                                                                    darkMode,
                                                                                                });
                                                                                            });
                                                                                    } else {
                                                                                        console.error('Picture-in-Picture is not supported');
                                                                                        showErrorAlert({
                                                                                            title: t("error"),
                                                                                            message: t("pip_not_supported"),
                                                                                            darkMode,
                                                                                        });
                                                                                    }
                                                                                })
                                                                                .catch(error => {
                                                                                    console.error('Error playing video:', error);
                                                                                    showErrorAlert({
                                                                                        title: t("error"),
                                                                                        message: t("failed_to_play_video"),
                                                                                        darkMode,
                                                                                    });
                                                                                });
                                                                        };
                                                                        videoElement.onerror = () => {
                                                                            console.error('Error loading video for PiP');
                                                                            showErrorAlert({
                                                                                title: t("error"),
                                                                                message: t("failed_to_load_video"),
                                                                                darkMode,
                                                                            });
                                                                        };
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`truncate ${getDarkModeClass(darkMode, 'text-gray-300', 'text-gray-700')}`}>
                                                                {formatFileName(video.name)}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <p className={`text-xs ${getDarkModeClass(darkMode, 'text-gray-500', 'text-gray-500')}`}>
                                                                    {video.size ? formatFileSize(video.size) : ''}
                                                                </p>
                                                                {video.estimatedTime && (
                                                                    <p className={`text-xs ml-2 ${getDarkModeClass(darkMode, 'text-gray-400', 'text-gray-500')}`}>
                                                                        {video.estimatedTime}s remaining
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {video.loading && (
                                                                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-[#ff8800] rounded-full transition-all duration-300"
                                                                        style={{ width: `${video.progress}%` }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (video.isNew) {
                                                                    removeVideo(index);
                                                                } else {
                                                                    setVideos(prev => prev.map((v, i) =>
                                                                        i === index ? { ...v, markedForDeletion: !v.markedForDeletion } : v
                                                                    ));
                                                                }
                                                            }}
                                                            className={`p-1 rounded-full ml-2 ${getDarkModeClass(
                                                                darkMode,
                                                                'hover:bg-gray-600',
                                                                'hover:bg-gray-200'
                                                            )}`}
                                                            disabled={video.loading}
                                                            aria-label={video.markedForDeletion ? t('restore_video') : t('remove_video')}
                                                        >
                                                            {video.markedForDeletion && !video.isNew ? (
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
                                                                            ? getDarkModeClass(darkMode, 'text-gray-600', 'text-gray-400')
                                                                            : getDarkModeClass(darkMode, 'text-gray-400', 'text-gray-500')
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
                                    disabled={isSubmitting}
                                    className={`border flex items-center justify-center ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <Spinner width="16px" height="16px" className="mr-2" />
                                    ) : (
                                        t("save")
                                    )}
                                    {isSubmitting ? t("saving") : ' (CTRL + ENTER)'}
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
