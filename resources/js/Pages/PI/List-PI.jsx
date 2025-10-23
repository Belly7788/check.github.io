import React, { useEffect, useState, useRef } from 'react';
import { Link, Head, router, usePage } from "@inertiajs/react";
import { FaEllipsisV, FaFileExcel } from "react-icons/fa";
import { HiOutlineDuplicate } from "react-icons/hi";
import { GoArrowUp } from "react-icons/go";
import { CgMoreVerticalAlt } from "react-icons/cg";
import { useTranslation } from "react-i18next";
import Spinner from "../../Component/spinner/spinner";
import Pagination from "../../Component/Pagination/Pagination";
import '../../BELLY/Component/Gallery/gallery_belly';
import Bellypopover from '../../BELLY/Component/Popover/Popover';
import Clipboard from '../../BELLY/Component/Clipboard/Clipboard';
import NoDataComponent from "../../Component/Empty/NoDataComponent";
import TableLoading from "../../Component/Loading/TableLoading/TableLoading";
import TableLoadingFull from "../../Component/Loading/TableLoading/TableLoadingFull";
import MuiStyleDatePicker from "../../BELLY/Component/DatePicker/DatePicker";
import ProgressChart from '../../Component/Progress/Porgress-chart/Porgress-chart';
import ShimmerLoading from "../../Component/Loading/ShimmerLoading/ShimmerLoading";
import NoImageComponent from "../../Component/Empty/NotImage/NotImage";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showConfirmAlert } from "../../Component/Confirm-Alert/Confirm-Alert";
import DateFilterPopups from './Component-PI/DateFilterPopups';
import NumberFilterPopups from './Component-PI/NumberFilterPopups';
import ShipByFilterPopups from './Component-PI/ShipByFilterPopups';
import CompanyFilterPopups from './Component-PI/CompanyFilterPopups';
import DropdownInput from '../../Component/DropdownInput/DropdownInput';
import CustomRangeSlider from '../../Component/Input/CustomRangeSlider/CustomRangeSlider';
import SettingsPopup from './Component-PI/SettingsPopup';
import { checkPermission } from '../../utils/permissionUtils';

import axios from 'axios';

// Utility function for dark mode class
const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

// Utility function to calculate popup position
const calculatePopupPosition = (triggerRef, popupWidth, popupHeight) => {
    if (!triggerRef.current) return { top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' };

    const triggerRect = triggerRef.current.querySelector('.cursor-pointer').getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceOnRight = viewportWidth - triggerRect.right;
    const spaceOnLeft = triggerRect.left;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    const horizontal = spaceOnRight >= popupWidth || spaceOnRight > spaceOnLeft ? 'right' : 'left';
    const vertical = spaceBelow >= popupHeight || spaceBelow > spaceAbove ? 'bottom' : 'top';

    let top, left;
    if (vertical === 'bottom') {
        top = triggerRect.bottom + window.scrollY + 10;
    } else {
        top = triggerRect.top + window.scrollY - popupHeight - 10;
    }

    if (horizontal === 'right') {
        left = triggerRect.left + triggerRect.width / 2 + window.scrollX - 20;
    } else {
        left = triggerRect.right + window.scrollX - popupWidth + 20;
    }

    const transformOriginX = horizontal === 'right' ? 'left top' : 'right top';
    const transformOrigin = vertical === 'bottom' ? transformOriginX : `bottom ${transformOriginX.split(' ')[0]}`;

    return { top, left, transformOrigin, horizontal };
};

export default function ListPI({ darkMode, purchaseInvoices, companies = [], shipments = [], methods = [], filters }) {
    const { t } = useTranslation();

    const [data, setData] = useState(purchaseInvoices.data);
    const [pagination, setPagination] = useState({
        currentPage: purchaseInvoices.current_page,
        perPage: purchaseInvoices.per_page,
        total: purchaseInvoices.total,
    });

    const [currentPage, setCurrentPage] = useState(pagination.currentPage);
    const [entriesPerPage, setEntriesPerPage] = useState(pagination.perPage);
    const [searchQuery, setSearchQuery] = useState('');
    const [columnSearchQuery, setColumnSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPI, setCurrentPI] = useState(null);
    const [openActionDropdown, setOpenActionDropdown] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPIs, setSelectedPIs] = useState([]);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [selectedSearchField, setSelectedSearchField] = useState("Invoice_Code_Name");
    const [formData, setFormData] = useState({
        pi_number: '',
        pi_name_en: '',
        pi_name_cn: '',
        date: '',
        ctn: '',
        tracking_number: '',
        shipment_id: '',
        shipping_method: '',
        arrival_date: '',
        company_id: '',
        receipt_number: '',
        total: '',
        discount: '',
        extra_charge: '',
        remark: '',
        thumbnails: [], // For thumbnail images
    });
    const [excelProgress, setExcelProgress] = useState(0);

    // Set default sort to 'id' descending
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');

    // Initialize all companies as checked by default
    const [checkedCompanies, setCheckedCompanies] = useState(companies.map(c => c.name));
    const companyHeaderRef = useRef(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });
    const [isCompanyPopupOpen, setIsCompanyPopupOpen] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // Date popup states (unchanged)
    const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
    const [isDateAnimatingOut, setIsDateAnimatingOut] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const dateHeaderRef = useRef(null);
    const [datePopupPosition, setDatePopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });

    // Arrival Date popup states (unchanged)
    const [isArrivalDatePopupOpen, setIsArrivalDatePopupOpen] = useState(false);
    const [isArrivalDateAnimatingOut, setIsArrivalDateAnimatingOut] = useState(false);
    const [startArrivalDate, setStartArrivalDate] = useState('');
    const [endArrivalDate, setEndArrivalDate] = useState('');
    const arrivalDateHeaderRef = useRef(null);
    const [arrivalDatePopupPosition, setArrivalDatePopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });

    // Ship By popup states
    const [isShipByPopupOpen, setIsShipByPopupOpen] = useState(false);
    const [isShipByAnimatingOut, setIsShipByAnimatingOut] = useState(false);
    // Initialize all methods and shipments as checked by default
    const [checkedMethods, setCheckedMethods] = useState(methods.map(m => m.name));
    const [checkedShipments, setCheckedShipments] = useState(shipments.map(s => s.name));
    const shipByHeaderRef = useRef(null);
    const [shipByPopupPosition, setShipByPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });


    // t_number popup states
    const [isTNumberPopupOpen, setIsTNumberPopupOpen] = useState(false);
    const [isTNumberAnimatingOut, setIsTNumberAnimatingOut] = useState(false);
    const [tNumberSearch, setTNumberSearch] = useState('');
    const tNumberHeaderRef = useRef(null);
    const [tNumberPopupPosition, setTNumberPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });

    // r_number popup states
    const [isRNumberPopupOpen, setIsRNumberPopupOpen] = useState(false);
    const [isRNumberAnimatingOut, setIsRNumberAnimatingOut] = useState(false);
    const [rNumberSearch, setRNumberSearch] = useState('');
    const rNumberHeaderRef = useRef(null);
    const [rNumberPopupPosition, setRNumberPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });

    // Settings popup states
    const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false);
    const [isSettingAnimatingOut, setIsSettingAnimatingOut] = useState(false);
    const settingHeaderRef = useRef(null);
    const [settingPopupPosition, setSettingPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });

    const [openRowDropdown, setOpenRowDropdown] = useState(null);
    const [activeTab, setActiveTab] = useState('product');

    // Add to state declarations
    const thumbnailInputRef = useRef(null); // Reference for Reference Images input
    const receiptProductsInputRef = useRef(null); // Reference for Receipt Products input
    const receiptPicturesInputRef = useRef(null); // Reference for Receipt Pictures input

    // Add to state declarations
    const [isLoadingdelivery, setIsLoadingdelivery] = useState(false);
    const [isLoadingUncheck, setIsLoadingUncheck] = useState(false);
    const [loadingDeliveryMap, setLoadingDeliveryMap] = useState({});
    const [isDeliveryPopupOpen, setIsDeliveryPopupOpen] = useState(false);
    const [currentProductIndex, setCurrentProductIndex] = useState(null);
    const [deliveryFormData, setDeliveryFormData] = useState({
        cargo_date: '',
        note_receipt: '',
        receipt_pictures: [],
        receipt_products: [],
        pi_id: '',
    });
    const [receiptPicturesDragging, setReceiptPicturesDragging] = useState(false);
    const [receiptProductsDragging, setReceiptProductsDragging] = useState(false);

    const handleReceiptPicturesChange = (files, type) => {
        const newImages = Array.from(files).map((file) => ({
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            preview: URL.createObjectURL(file),
            file: file,
            loading: true,
            progress: 0,
            isNew: true,
            markedForDeletion: false,
            uploadStartTime: Date.now(),
            estimatedTime: null,
        }));

        setDeliveryFormData((prev) => ({
            ...prev,
            [type]: [...newImages, ...prev[type]],
        }));

        newImages.forEach((image) => {
            const uploadInterval = setInterval(() => {
                setDeliveryFormData((prev) => {
                    const updatedImages = [...prev[type]];
                    const imgIndex = updatedImages.findIndex((t) => t.id === image.id);
                    if (imgIndex !== -1) {
                        const newProgress = Math.min(updatedImages[imgIndex].progress + 10, 100);
                        const elapsed = (Date.now() - updatedImages[imgIndex].uploadStartTime) / 1000;
                        const remaining = (100 - newProgress) * (elapsed / newProgress);

                        updatedImages[imgIndex] = {
                            ...updatedImages[imgIndex],
                            progress: newProgress,
                            estimatedTime: remaining > 0 ? Math.round(remaining) : null,
                        };

                        if (newProgress === 100) {
                            updatedImages[imgIndex].loading = false;
                        }
                    }
                    return { ...prev, [type]: updatedImages };
                });
            }, 300);

            return () => clearInterval(uploadInterval);
        });
    };

    const handleReceiptImageDrop = (e, type) => {
        e.preventDefault();
        if (type === 'receipt_pictures') {
            setReceiptPicturesDragging(false);
        } else {
            setReceiptProductsDragging(false);
        }
        const files = e.dataTransfer.files;
        handleReceiptPicturesChange(files, type);
    };

    // Updated removeReceiptImage function
    const removeReceiptImage = (index, type) => {
        setDeliveryFormData((prev) => {
            const image = prev[type][index];
            if (image.isNew) {
                return {
                    ...prev,
                    [type]: prev[type].filter((_, i) => i !== index),
                };
            } else {
                const updatedImages = [...prev[type]];
                updatedImages[index] = {
                    ...image,
                    markedForDeletion: !image.markedForDeletion,
                };
                return { ...prev, [type]: updatedImages };
            }
        });
        // Reset the appropriate input based on type
        if (type === 'receipt_products' && receiptProductsInputRef.current) {
            receiptProductsInputRef.current.value = null;
        } else if (type === 'receipt_pictures' && receiptPicturesInputRef.current) {
            receiptPicturesInputRef.current.value = null;
        }
    };

    const openDeliveryPopup = async (productId) => {
        try {
            // Set loading state for this specific product
            setLoadingDeliveryMap((prev) => ({
                ...prev,
                [productId]: true,
            }));
            const response = await axios.get(`/api/pi-detail/${productId}`);
            const piDetail = response.data.data;

            const formatImages = (imageString, type) => {
                if (!imageString) return [];
                return imageString.split(',').map((img) => ({
                    id: img,
                    name: img,
                    size: 0,
                    preview: `/storage/uploads/${type}/${img}`,
                    loading: false,
                    progress: 100,
                    isNew: false,
                    markedForDeletion: false,
                }));
            };

            setDeliveryFormData({
                pi_id: piDetail.pi_id || '',
                delivery: piDetail.delivery || '',
                cargo_date: piDetail.cargo_date || '',
                note_receipt: piDetail.note_receipt || '',
                receipt_pictures: formatImages(piDetail.receipt_picture, 'receipt_picture'),
                receipt_products: formatImages(piDetail.receipt_product, 'receipt_product'),
            });

            setCurrentProductIndex(productId);
            setIsDeliveryPopupOpen(true);
        } catch (error) {
            console.error('Error fetching delivery details:', error);
            showErrorAlert({
                title: t('error'),
                message: t('list_pis.delivery_details_fetch_failed'),
                darkMode: darkMode,
            });
        } finally {
            // Clear loading state for this specific product
            setLoadingDeliveryMap((prev) => ({
                ...prev,
                [productId]: false,
            }));
        }
    };

    const uncheck_tracking_pi = 26;
    const handleUncheck = async () => {
        checkPermission(uncheck_tracking_pi, async (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }
            try {
                setIsLoadingUncheck(true);

                const formData = new FormData();
                formData.append('delivery', '0');
                formData.append('cargo_date', '');
                formData.append('note_receipt', '');
                formData.append('receipt_pictures_to_keep', '[]');
                formData.append('receipt_products_to_keep', '[]');

                await axios.post(`/api/pi-detail/update/${currentProductIndex}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (deliveryFormData.pi_id) {
                    await refreshProductDetails(deliveryFormData.pi_id);
                }

                const queryParams = {
                    page: currentPage,
                    per_page: entriesPerPage,
                    search: searchQuery,
                    search_field: selectedSearchField,
                    sort_field: sortField || 'id',
                    sort_direction: sortDirection || 'desc',
                };

                if (checkedCompanies.length !== companies.length) {
                    queryParams.companies = checkedCompanies;
                }
                if (checkedMethods.length !== methods.length) {
                    queryParams.methods = checkedMethods;
                }
                if (checkedShipments.length !== shipments.length) {
                    queryParams.shipments = checkedShipments;
                }
                if (startDate) {
                    queryParams.start_date = startDate;
                }
                if (endDate) {
                    queryParams.end_date = endDate;
                }
                if (startArrivalDate) {
                    queryParams.start_arrival_date = startArrivalDate;
                }
                if (endArrivalDate) {
                    queryParams.end_arrival_date = endArrivalDate;
                }
                if (tNumberSearch) {
                    queryParams.t_number = tNumberSearch;
                }
                if (rNumberSearch) {
                    queryParams.r_number = rNumberSearch;
                }
                if (trackingStatuses.length !== 4) {
                    queryParams.tracking_statuses = trackingStatuses;
                }

                router.get(
                    '/pi/list',
                    queryParams,
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onSuccess: (page) => {
                            setData(page.props.purchaseInvoices.data);
                            setPagination({
                                currentPage: page.props.purchaseInvoices.current_page,
                                perPage: page.props.purchaseInvoices.per_page,
                                total: page.props.purchaseInvoices.total,
                            });
                        },
                        onError: (errors) => {
                            console.error('Error refreshing list:', errors);
                            showErrorAlert({
                                title: t('error'),
                                message: t('list_pis.list_refresh_failed'),
                                darkMode: darkMode,
                            });
                        },
                    }
                );

                showSuccessAlert({
                    title: t('success'),
                    message: t('list_pis.data_cleared_successfully'),
                    darkMode: darkMode,
                    timeout: 2000,
                });

                // Close popup without confirmation
                setIsDeliveryPopupOpen(false);
                setCurrentProductIndex(null);
                setDeliveryFormData({
                    cargo_date: '',
                    note_receipt: '',
                    receipt_pictures: [],
                    receipt_products: [],
                    pi_id: '',
                });
            } catch (error) {
                console.error('Error clearing delivery data:', error);
                showErrorAlert({
                    title: t('error'),
                    message: t('list_pis.data_clear_failed'),
                    darkMode: darkMode,
                });
            } finally {
                setIsLoadingUncheck(false);
            }
        });
    };


    const check_tracking_pi = 25;
    const handleDeliverySubmit = async (e) => {
        e.preventDefault();
        checkPermission(check_tracking_pi, async (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }
            setIsLoadingdelivery(true);

            try {
                if (!deliveryFormData.cargo_date) {
                    showErrorAlert({
                        title: t('error'),
                        message: t('list_pis.cargo_date_required'),
                        darkMode: darkMode,
                    });
                    return;
                }

                const formData = new FormData();
                formData.append('delivery', '1');
                formData.append('cargo_date', deliveryFormData.cargo_date);
                formData.append('note_receipt', deliveryFormData.note_receipt);

                const receiptPicturesToKeep = deliveryFormData.receipt_pictures
                    .filter(img => !img.markedForDeletion && !img.isNew)
                    .map(img => img.id);
                formData.append('receipt_pictures_to_keep', JSON.stringify(receiptPicturesToKeep));

                deliveryFormData.receipt_pictures
                    .filter(img => img.isNew && !img.markedForDeletion)
                    .forEach((file, index) => {
                        formData.append(`receipt_pictures[${index}]`, file.file);
                    });

                const receiptProductsToKeep = deliveryFormData.receipt_products
                    .filter(img => !img.markedForDeletion && !img.isNew)
                    .map(img => img.id);
                formData.append('receipt_products_to_keep', JSON.stringify(receiptProductsToKeep));

                deliveryFormData.receipt_products
                    .filter(img => img.isNew && !img.markedForDeletion)
                    .forEach((file, index) => {
                        formData.append(`receipt_products[${index}]`, file.file);
                    });

                await axios.post(`/api/pi-detail/update/${currentProductIndex}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (deliveryFormData.pi_id) {
                    await refreshProductDetails(deliveryFormData.pi_id);
                }

                const queryParams = {
                    page: currentPage,
                    per_page: entriesPerPage,
                    search: searchQuery,
                    search_field: selectedSearchField,
                    sort_field: sortField || 'id',
                    sort_direction: sortDirection || 'desc',
                };

                if (checkedCompanies.length !== companies.length) {
                    queryParams.companies = checkedCompanies;
                }
                if (checkedMethods.length !== methods.length) {
                    queryParams.methods = checkedMethods;
                }
                if (checkedShipments.length !== shipments.length) {
                    queryParams.shipments = checkedShipments;
                }
                if (startDate) {
                    queryParams.start_date = startDate;
                }
                if (endDate) {
                    queryParams.end_date = endDate;
                }
                if (startArrivalDate) {
                    queryParams.start_arrival_date = startArrivalDate;
                }
                if (endArrivalDate) {
                    queryParams.end_arrival_date = endArrivalDate;
                }
                if (tNumberSearch) {
                    queryParams.t_number = tNumberSearch;
                }
                if (rNumberSearch) {
                    queryParams.r_number = rNumberSearch;
                }
                if (trackingStatuses.length !== 4) {
                    queryParams.tracking_statuses = trackingStatuses;
                }

                router.get(
                    '/pi/list',
                    queryParams,
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onSuccess: (page) => {
                            setData(page.props.purchaseInvoices.data);
                            setPagination({
                                currentPage: page.props.purchaseInvoices.current_page,
                                perPage: page.props.purchaseInvoices.per_page,
                                total: page.props.purchaseInvoices.total,
                            });
                        },
                        onError: (errors) => {
                            console.error('Error refreshing list:', errors);
                            showErrorAlert({
                                title: t('error'),
                                message: t('list_pis.list_refresh_failed'),
                                darkMode: darkMode,
                            });
                        },
                    }
                );

                showSuccessAlert({
                    title: t('success'),
                    message: t('list_pis.delivery_updated_successfully'),
                    darkMode: darkMode,
                    timeout: 2000,
                });

                // Close popup without confirmation
                setIsDeliveryPopupOpen(false);
                setCurrentProductIndex(null);
                setDeliveryFormData({
                    cargo_date: '',
                    note_receipt: '',
                    receipt_pictures: [],
                    receipt_products: [],
                    pi_id: '',
                });
            } catch (error) {
                console.error('Error updating delivery:', error);
                showErrorAlert({
                    title: t('error'),
                    message: t('list_pis.delivery_update_failed'),
                    darkMode: darkMode,
                });
            } finally {
                setIsLoadingdelivery(false);
            }
        });
    };

    const refreshProductDetails = async (piId) => {
        try {
            const response = await axios.get(`/pi/${piId}/product-details`);
            setProductData(prev => ({
                ...prev,
                [piId]: response.data.productDetails
            }));
        } catch (error) {
            console.error('Error refreshing product details:', error);
            showErrorAlert({
                title: t('error'),
                message: t('list_pis.product_details_fetch_failed'),
                darkMode: darkMode,
            });
        }
    };

    const closeDeliveryPopup = () => {
        const hasChanges =
            deliveryFormData.cargo_date ||
            deliveryFormData.note_receipt ||
            deliveryFormData.receipt_pictures.length > 0 ||
            deliveryFormData.receipt_products.length > 0;

        if (hasChanges) {
            showConfirmAlert({
                title: t("confirm_close_title"),
                message: t("confirm_close_popup"),
                darkMode,
                onConfirm: () => {
                    setIsDeliveryPopupOpen(false);
                    setCurrentProductIndex(null);
                    setDeliveryFormData({
                        cargo_date: '',
                        note_receipt: '',
                        receipt_pictures: [],
                        receipt_products: [],
                        pi_id: '',
                    });
                },
                onCancel: () => {
                    // Do nothing, keep the popup open
                },
            });
        } else {
            setIsDeliveryPopupOpen(false);
            setCurrentProductIndex(null);
            setDeliveryFormData({
                cargo_date: '',
                note_receipt: '',
                receipt_pictures: [],
                receipt_products: [],
                pi_id: '',
            });
        }
    };




    // Add new states for tab data
    const [referencePhotos, setReferencePhotos] = useState({});
    const [productData, setProductData] = useState({});
    const [loadingTabData, setLoadingTabData] = useState(false);

    const [loadedImages, setLoadedImages] = useState({});

    const [isDeleting, setIsDeleting] = useState(null);

    const isValidInput = (value) => {
        return value === '' || /^[0-9+\-*/=.]*$/.test(value);
    };

    const evaluateExpression = (input) => {
        if (!input.startsWith('=')) return input; // Return unchanged if not an expression

        const expression = input.slice(1); // Remove the '='
        // Validate: Allow numbers, operators (+, -, *, /), parentheses, and decimals
        const isValid = /^[0-9+\-*/().\s]*$/.test(expression);
        if (!isValid) {
            throw new Error('Invalid expression');
        }

        try {
            const result = eval(expression); // Evaluate the expression
            if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
                throw new Error('Invalid result');
            }
            // Check if result is an integer
            if (Number.isInteger(result)) {
                return result.toString(); // Return integer as string without decimals
            }
            // Return decimal number with 3 decimal places
            return result.toFixed(3);
        } catch (error) {
            throw new Error('Error evaluating expression');
        }
    };

    const calculateCartonSum = (products) => {
        if (!products || !Array.isArray(products)) return '0';
        const sum = products.reduce((acc, product) => {
            const ctnValue = parseFloat(product.ctn) || 0;
            return acc + ctnValue;
        }, 0);
        return sum.toString(); // Return as string to match input field format
    };

    const [sumOfTotals, setSumOfTotals] = useState(0);

    const calculateTotals = (updatedProductData) => {
        const sum = updatedProductData[currentPI?.id]?.reduce((acc, product) => {
            const total = parseFloat(product.total) || 0;
            return acc + total;
        }, 0);
        setSumOfTotals(sum);
        const extraCharge = parseFloat(formData.extra_charge) || 0;
        const discount = parseFloat(formData.discount) || 0;
        setFormData((prev) => ({
            ...prev,
            total: (sum + extraCharge - discount).toFixed(3),
        }));
    };

    const [thumbnails, setThumbnails] = useState([]);
    const [thumbnailDragging, setThumbnailDragging] = useState(false);


    const handleThumbnailChange = (files) => {
        const newThumbnails = Array.from(files).map((file) => ({
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporary ID for new images
            name: file.name,
            size: file.size,
            preview: URL.createObjectURL(file),
            file: file,
            loading: true, // Start in loading state
            progress: 0, // Start at 0% progress
            isNew: true,
            markedForDeletion: false,
            uploadStartTime: Date.now(), // Track when upload started
            estimatedTime: null // Will be calculated during upload
        }));

        // Sort new thumbnails to the top
        setThumbnails((prev) => [...newThumbnails, ...prev]);

        // Simulate upload progress (replace with actual upload logic)
        newThumbnails.forEach((thumbnail, index) => {
            const uploadInterval = setInterval(() => {
            setThumbnails((prev) => {
                const updated = [...prev];
                const thumbIndex = updated.findIndex(t => t.id === thumbnail.id);
                if (thumbIndex !== -1) {
                // Calculate progress and estimated time
                const newProgress = Math.min(updated[thumbIndex].progress + 10, 100);
                const elapsed = (Date.now() - updated[thumbIndex].uploadStartTime) / 1000;
                const remaining = (100 - newProgress) * (elapsed / newProgress);

                updated[thumbIndex] = {
                    ...updated[thumbIndex],
                    progress: newProgress,
                    estimatedTime: remaining > 0 ? Math.round(remaining) : null
                };

                if (newProgress === 100) {
                    updated[thumbIndex].loading = false;
                }
                }
                return updated;
            });
            }, 300); // Update progress every 300ms

            // Clear interval when component unmounts
            return () => clearInterval(uploadInterval);
        });
    };


    const handleThumbnailDrop = (e) => {
        e.preventDefault();
        setThumbnailDragging(false);
        const files = e.dataTransfer.files;
        handleThumbnailChange(files);
    };

    // Updated removeThumbnail function
    const removeThumbnail = (index) => {
        setThumbnails((prev) => {
            const thumbnail = prev[index];
            if (thumbnail.isNew) {
                // For new images, remove completely
                return prev.filter((_, i) => i !== index);
            } else {
                // For existing images, toggle markedForDeletion
                const updatedThumbnails = [...prev];
                updatedThumbnails[index] = {
                    ...thumbnail,
                    markedForDeletion: !thumbnail.markedForDeletion,
                };
                return updatedThumbnails;
            }
        });
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = null; // Reset input value
        }
    };

    const formatFileName = (name) => {
        return name.length > 20 ? name.substring(0, 17) + "..." : name;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const [value, setValue] = React.useState(0);

    const excel_pi = 28;
    const downloadExcel = async (piId) => {
        checkPermission(excel_pi, async (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }
            const selectedPI = data.find((item) => item.id === piId);
            if (!selectedPI) {
                showErrorAlert({
                    title: t('error'),
                    message: t('list_pis.pi_not_found'),
                    darkMode: darkMode,
                });
                return;
            }

            setExcelProgress(0); // Reset progress
            try {
                // Start a fallback progress animation if no progress events are received
                let fallbackProgress = 0;
                const fallbackInterval = setInterval(() => {
                    fallbackProgress = Math.min(fallbackProgress + 5, 95); // Increment up to 95%
                    setExcelProgress((prev) => (prev === 0 ? fallbackProgress : prev));
                    console.log(`Fallback progress: ${fallbackProgress}%`); // Debug log
                }, 500); // Update every 500ms

                const response = await axios.get(`/pi/${piId}/download-excel`, {
                    responseType: 'blob',
                    onDownloadProgress: (progressEvent) => {
                        clearInterval(fallbackInterval); // Stop fallback when real progress starts
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setExcelProgress(percentCompleted);
                            console.log(`Download progress: ${percentCompleted}%`); // Debug log
                        } else {
                            // If total is unknown, keep fallback progress
                            console.log('Progress total unknown, using fallback');
                        }
                    },
                });

                clearInterval(fallbackInterval); // Ensure fallback stops on completion

                // Complete the progress bar
                setExcelProgress(100);
                console.log('Download completed, setting progress to 100%');

                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `PI of ${selectedPI.supplier || selectedPI.pi_name_cn} ${selectedPI.invoice_code}.xlsx`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showSuccessAlert({
                    title: t('success'),
                    message: t('list_pis.download_complete'),
                    darkMode: darkMode,
                    timeout: 2000,
                });
            } catch (error) {
                console.error('Download error:', error);
                showErrorAlert({
                    title: t('error'),
                    message: t('list_pis.download_failed'),
                    darkMode: darkMode,
                });
            } finally {
                setTimeout(() => {
                    setExcelProgress(0);
                    console.log('Progress reset to 0');
                }, 300); // Short delay to show 100% briefly
            }
        });
    };

    // Function to load reference photos
    const loadReferencePhotos = async (piId) => {
        setLoadingTabData(true);
        try {
            const response = await axios.get(`/pi/${piId}/reference-photos`);
            setReferencePhotos(prev => ({
                ...prev,
                [piId]: response.data.referencePhotos
            }));
        } catch (error) {
            console.error('Error loading reference photos:', error);
            showErrorAlert({
                title: t('error'),
                message: t('list_pis.reference_photos_fetch_failed'),
                darkMode: darkMode,
            });
        } finally {
            setLoadingTabData(false);
        }
    };

    // Function to load product details
    const loadProductDetails = async (piId) => {
        setLoadingTabData(true);
        try {
            const response = await axios.get(`/pi/${piId}/product-details`);
            setProductData(prev => ({
                ...prev,
                [piId]: response.data.productDetails
            }));
        } catch (error) {
            console.error('Error loading product details:', error);
            showErrorAlert({
                title: t('error'),
                message: t('list_pis.product_details_fetch_failed'),
                darkMode: darkMode,
            });
        } finally {
            setLoadingTabData(false);
        }
    };


    // Handle tab change
    const handleTabChange = (tab, piId) => {
        setActiveTab(tab);

        if (tab === 'reference') {
            loadReferencePhotos(piId);
        } else if (tab === 'product') {
            loadProductDetails(piId);
        }
    };


    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState({
        invoice_code: true,
        supplier: true,
        date: true,
        amount: true,
        ctn: true,
        rating: true,
        method: true,
        t_number: true,
        r_number: true,
        arrival_date: true,
    });

    // Column widths
    const [columnWidths, setColumnWidths] = useState({
        invoice_code: 120,
        supplier: 150,
        date: 120,
        amount: 100,
        ctn: 80,
        rating: 120,
        method: 100,
        t_number: 100,
        r_number: 100,
        arrival_date: 120,
        action: 80,
    });

    // Resizing states and handlers
    const [isResizing, setIsResizing] = useState(false);
    const [resizingColumn, setResizingColumn] = useState(null);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const tableRef = useRef(null);

    const handleResizeStart = (e, columnKey) => {
        setIsResizing(true);
        setResizingColumn(columnKey);
        setStartX(e.clientX);
        setStartWidth(columnWidths[columnKey]);
        document.body.style.userSelect = 'none';
    };


    const handleResize = (e) => {
        if (!isResizing) return;
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth >= 50) {
            setColumnWidths((prev) => ({
                ...prev,
                [resizingColumn]: newWidth,
            }));
        }
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        setResizingColumn(null);
        document.body.style.userSelect = '';
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', handleResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, resizingColumn, startX, startWidth]);

    // Inside ListPI component, add this useEffect hook
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the dropdown and its trigger button
            if (
                openActionDropdown !== null &&
                !event.target.closest('.action-container') &&
                !event.target.closest('.relative.action-container > div')
            ) {
                setOpenActionDropdown(null);
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openActionDropdown]);

    // In ListPI component, add to state declarations
    const [trackingStatuses, setTrackingStatuses] = useState([1, 2, 3, 4]);

    // Update helper functions
    const getTrackingClass = (status) => {
        switch(status) {
            case 1: return 'gray-tracking';   // Not out yet
            case 2: return 'orange-tracking'; // On Track
            case 3: return 'green-tracking';  // Delivered
            case 4: return 'red-tracking';    // Overdue
            default: return 'gray-tracking';
        }
    };

    const getTrackingTitle = (status) => {
        switch(status) {
            case 1: return t('list_pis.not_out_yet');
            case 2: return t('list_pis.on_track');
            case 3: return t('list_pis.delivered');
            case 4: return t('list_pis.overdue');
            default: return '';
        }
    };

        // Handle sort
    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        applyFilters();
    };

    // Apply filters and fetch data
    // In ListPI component, update applyFilters
    const applyFilters = (extraParams = {}) => {
        setIsLoading(true);
        const newPage = 1;
        setCurrentPage(newPage);

        // Build the query parameters dynamically
        const queryParams = {
            search: searchQuery,
            search_field: selectedSearchField,
            per_page: entriesPerPage,
            page: newPage,
            sort_field: sortField || 'id',
            sort_direction: sortDirection || 'desc',
        };

        // Only include companies filter if not all companies are checked
        if (checkedCompanies.length !== companies.length) {
            queryParams.companies = checkedCompanies;
        }

        // Only include methods filter if not all methods are checked
        if (checkedMethods.length !== methods.length) {
            queryParams.methods = checkedMethods;
        }

        // Only include shipments filter if not all shipments are checked
        if (checkedShipments.length !== shipments.length) {
            queryParams.shipments = checkedShipments;
        }

        // Only include date filters if they are not empty
        if (startDate) {
            queryParams.start_date = startDate;
        }
        if (endDate) {
            queryParams.end_date = endDate;
        }

        // Only include arrival date filters if they are not empty
        if (startArrivalDate) {
            queryParams.start_arrival_date = startArrivalDate;
        }
        if (endArrivalDate) {
            queryParams.end_arrival_date = endArrivalDate;
        }

        // Only include t_number filter if it is not empty
        if (tNumberSearch) {
            queryParams.t_number = tNumberSearch;
        }

        // Only include r_number filter if it is not empty
        if (rNumberSearch) {
            queryParams.r_number = rNumberSearch;
        }

        // Include tracking statuses only if not all are selected
        const currentTrackingStatuses = extraParams.trackingStatuses || trackingStatuses;
        if (currentTrackingStatuses.length !== 4) { // Check if not all 4 statuses selected
            queryParams.tracking_statuses = currentTrackingStatuses;
        }

        router.get(
            '/pi/list',
            queryParams,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    // Update trackingStatuses if provided in extraParams
                    if (extraParams.trackingStatuses) {
                        setTrackingStatuses(extraParams.trackingStatuses);
                    }
                },
            }
        );
    };

    // Format date to DD-MMM-YY
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = d.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`.toLowerCase();
    };

    // Toggle popup handlers
    const toggleCompanyPopup = (e) => {
        e.stopPropagation();
        if (isCompanyPopupOpen) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsCompanyPopupOpen(false);
                setIsAnimatingOut(false);
            }, 200);
        } else {
            const position = calculatePopupPosition(companyHeaderRef, 224, 300);
            setPopupPosition(position);
            setIsCompanyPopupOpen(true);
        }
    };

    const toggleDatePopup = (e) => {
        e.stopPropagation();
        if (isDatePopupOpen) {
            setIsDateAnimatingOut(true);
            setTimeout(() => {
                setIsDatePopupOpen(false);
                setIsDateAnimatingOut(false);
            }, 200);
        } else {
            const position = calculatePopupPosition(dateHeaderRef, 320, 300);
            setDatePopupPosition(position);
            setIsDatePopupOpen(true);
        }
    };

    const toggleArrivalDatePopup = (e) => {
        e.stopPropagation();
        if (isArrivalDatePopupOpen) {
            setIsArrivalDateAnimatingOut(true);
            setTimeout(() => {
                setIsArrivalDatePopupOpen(false);
                setIsArrivalDateAnimatingOut(false);
            }, 200);
        } else {
            const position = calculatePopupPosition(arrivalDateHeaderRef, 320, 300);
            setArrivalDatePopupPosition(position);
            setIsArrivalDatePopupOpen(true);
        }
    };

    const toggleShipByPopup = (e) => {
        e.stopPropagation();
        if (isShipByPopupOpen) {
            setIsShipByAnimatingOut(true);
            setTimeout(() => {
                setIsShipByPopupOpen(false);
                setIsShipByAnimatingOut(false);
            }, 200);
        } else {
            const position = calculatePopupPosition(shipByHeaderRef, 224, 300);
            setShipByPopupPosition(position);
            setIsShipByPopupOpen(true);
        }
    };

    const toggleTNumberPopup = (e) => {
        e.stopPropagation();
        if (isTNumberPopupOpen) {
            setIsTNumberAnimatingOut(true);
            setTimeout(() => {
                setIsTNumberPopupOpen(false);
                setIsTNumberAnimatingOut(false);
            }, 200);
        } else {
            const position = calculatePopupPosition(tNumberHeaderRef, 224, 150);
            setTNumberPopupPosition(position);
            setIsTNumberPopupOpen(true);
        }
    };

    const toggleRNumberPopup = (e) => {
        e.stopPropagation();
        if (isRNumberPopupOpen) {
            setIsRNumberAnimatingOut(true);
            setTimeout(() => {
                setIsRNumberPopupOpen(false);
                setIsRNumberAnimatingOut(false);
            }, 200);
        } else {
            const position = calculatePopupPosition(rNumberHeaderRef, 224, 150);
            setRNumberPopupPosition(position);
            setIsRNumberPopupOpen(true);
        }
    };

    const toggleSettingPopup = (e) => {
        e.stopPropagation();
        if (isSettingPopupOpen) {
            setIsSettingAnimatingOut(true);
            setTimeout(() => {
                setIsSettingPopupOpen(false);
                setIsSettingAnimatingOut(false);
                setColumnSearchQuery('');
            }, 200);
        } else {
            const position = calculatePopupPosition(settingHeaderRef, 224, 400);
            setSettingPopupPosition(position);
            setIsSettingPopupOpen(true);
        }
    };

    // Handle column visibility
    const handleColumnVisibilityChange = (columnKey) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    };

    // Reset column visibility
    const handleResetColumns = () => {
        setVisibleColumns({
            invoice_code: true,
            supplier: true,
            date: true,
            amount: true,
            ctn: true,
            rating: true,
            method: true,
            t_number: true,
            r_number: true,
            arrival_date: true,
        });
    };


    // Add to state declarations
    const [isSubmitting, setIsSubmitting] = useState(false);


    const view_pi = 24;
    useEffect(() => {
        checkPermission(view_pi, (hasPermission) => {
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

    const update_pi = 22;
    // Updated handleSubmit
    const handleSubmit = (e) => {
        e.preventDefault();

        checkPermission(update_pi, (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }
            setIsSubmitting(true);

            const form = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'thumbnails' && key !== 'products') {
                    form.append(key, value || '');
                }
            });

            if (productData[currentPI?.id]) {
                productData[currentPI.id].forEach((product, index) => {
                    form.append(`products[${index}][id]`, product.id || '');
                    form.append(`products[${index}][ctn]`, product.ctn || '0');
                    form.append(`products[${index}][qty]`, product.qty || '0');
                    form.append(`products[${index}][price]`, product.price || '0');
                    form.append(`products[${index}][progress]`, product.progress || '0');
                    form.append(`products[${index}][delivered]`, product.delivered ? '1' : '0');
                });
            }

            const existingPhotos = thumbnails
                .filter((thumbnail) => !thumbnail.isNew && !thumbnail.markedForDeletion)
                .map((thumbnail) => thumbnail.preview);
            form.append('existing_photos', JSON.stringify(existingPhotos));

            const photosToDelete = thumbnails
                .filter((thumbnail) => !thumbnail.isNew && thumbnail.markedForDeletion)
                .map((thumbnail) => thumbnail.preview);
            form.append('photos_to_delete', JSON.stringify(photosToDelete));

            thumbnails
                .filter((thumbnail) => thumbnail.isNew && thumbnail.file)
                .forEach((thumbnail, index) => {
                    form.append(`new_photos[${index}]`, thumbnail.file);
                });

            router.post(
                `/pi/${currentPI.id}/update`,
                form,
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setData((prevData) =>
                            prevData.map((pi) =>
                                pi.id === currentPI.id
                                    ? {
                                        ...pi,
                                        invoice_code: formData.pi_number,
                                        supplier: formData.pi_name_en,
                                        pi_name_cn: formData.pi_name_cn,
                                        date: formData.date,
                                        ctn: formData.ctn,
                                        t_number: formData.tracking_number,
                                        shipment_id: formData.shipment_id,
                                        name_method: methods.find((m) => m.id == formData.shipping_method)?.name,
                                        shipment_name: shipments.find((s) => s.id == formData.shipment_id)?.name,
                                        arrival_date: formData.arrival_date,
                                        rating: companies.find((c) => c.id == formData.company_id)?.name,
                                        r_number: formData.receipt_number,
                                        amount: parseFloat(formData.total) || 0,
                                        discount: parseFloat(formData.discount) || 0,
                                        extra_charge: parseFloat(formData.extra_charge) || 0,
                                        remark: formData.remark,
                                    }
                                    : pi
                            )
                        );

                        setProductData((prev) => ({
                            ...prev,
                            [currentPI.id]: productData[currentPI.id],
                        }));

                        setReferencePhotos((prev) => ({
                            ...prev,
                            [currentPI.id]: thumbnails
                                .filter((t) => !t.markedForDeletion)
                                .map((t) => ({
                                    id: t.id,
                                    image: t.preview,
                                })),
                        }));

                        showSuccessAlert({
                            title: t('success'),
                            message: t('list_pis.pi_updated_successfully'),
                            darkMode: darkMode,
                            timeout: 2000,
                        });

                        // Close popup without confirmation
                        setIsPopupOpen(false);
                        setCurrentPI(null);
                        setIsEditMode(false);
                        setFormData({
                            pi_number: '',
                            pi_name_en: '',
                            pi_name_cn: '',
                            date: '',
                            ctn: '',
                            tracking_number: '',
                            shipment_id: '',
                            shipping_method: '',
                            arrival_date: '',
                            company_id: '',
                            receipt_number: '',
                            total: '',
                            discount: '',
                            extra_charge: '',
                            remark: '',
                            thumbnails: [],
                        });
                        setThumbnails([]);
                        setProductData({});
                    },
                    onError: (errors) => {
                        console.error('Update error:', errors);
                        showErrorAlert({
                            title: t('error'),
                            message: errors.message || t('list_pis.pi_update_failed'),
                            darkMode: darkMode,
                        });
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                }
            );
        });
    };
    // Inside openEditPopup function
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [hasUpdatePiNumberPermission, setHasUpdatePiNumberPermission] = useState(false);
    const update_pi_number = 27;

    const [hasCheckboxChecked, setHasCheckboxChecked] = useState(false);
    const openEditPopup = async (pi) => {
        setIsEditLoading(true); // Start edit-specific loading
        setIsEditMode(true);
        setCurrentPI(pi);

        try {
            // Check update_pi_number permission
            const permissionResponse = await axios.post('/check-permission', { check_permission_id: update_pi_number });
            setHasUpdatePiNumberPermission(permissionResponse.data.hasPermission);

            const response = await axios.get(`/pi/${pi.id}/edit-data`);
            const { pi: piData, referencePhotos, productDetails, hasCheckboxChecked } = response.data;

            // Set the hasCheckboxChecked state
            setHasCheckboxChecked(hasCheckboxChecked);

            setReferencePhotos((prev) => ({
                ...prev,
                [pi.id]: referencePhotos,
            }));

            setProductData((prev) => ({
                ...prev,
                [pi.id]: productDetails,
            }));

            const shipment = shipments.find((s) => s.id === piData.shipment_id);
            const method = methods.find((m) => m.id === piData.shipping_method);
            const company = companies.find((c) => c.id === piData.company_id);

            const formattedThumbnails = referencePhotos.map((photo) => ({
                id: photo.id,
                name: photo.image.split('/').pop() || 'Reference Photo',
                size: 0,
                preview: photo.image.startsWith('/storage/') ? photo.image : `/storage/${photo.image}`,
                loading: false,
                progress: 100,
                isNew: false,
                markedForDeletion: false,
            }));

            // Calculate the initial sum of cartons from productDetails
            const initialCtnSum = calculateCartonSum(productDetails);

            setFormData({
                pi_number: piData.invoice_code || '',
                pi_name_en: piData.supplier || '',
                pi_name_cn: piData.pi_name_cn || '',
                date: piData.date || '',
                ctn: initialCtnSum, // Use calculated sum instead of piData.ctn
                tracking_number: piData.t_number || '',
                shipment_id: shipment ? shipment.id : '',
                shipping_method: method ? method.id : '',
                arrival_date: piData.arrival_date || '',
                company_id: company ? company.id : '',
                receipt_number: piData.r_number || '',
                total: piData.amount ? piData.amount.toFixed(3) : '0.000',
                discount: piData.discount ? piData.discount.toFixed(3) : '0.000',
                extra_charge: piData.extra_charge ? piData.extra_charge.toFixed(3) : '0.000',
                remark: piData.remark || '',
                thumbnails: formattedThumbnails,
            });

            setThumbnails(formattedThumbnails);
            setIsPopupOpen(true);
        } catch (error) {
            console.error('Error fetching data for edit popup:', error);
            showErrorAlert({
                title: t('error'),
                message: t('list_pis.data_fetch_failed'),
                darkMode: darkMode,
            });
        } finally {
            setIsEditLoading(false); // Stop edit-specific loading
        }
    };
const closePopup = () => {
    const hasChanges =
        formData.pi_number ||
        formData.pi_name_en ||
        formData.pi_name_cn ||
        formData.date ||
        formData.ctn ||
        formData.tracking_number ||
        formData.shipment_id ||
        formData.shipping_method ||
        formData.arrival_date ||
        formData.company_id ||
        formData.receipt_number ||
        formData.total ||
        formData.discount ||
        formData.extra_charge ||
        formData.remark ||
        thumbnails.length > 0 ||
        productData[currentPI?.id]?.some(product =>
            product.ctn || product.qty || product.price || product.total || product.progress
        );

    if (hasChanges) {
        showConfirmAlert({
            title: t("confirm_close_title"),
            message: t("confirm_close_popup"),
            darkMode,
            onConfirm: () => {
                setIsPopupOpen(false);
                setCurrentPI(null);
                setIsEditMode(false);
                setFormData({
                    pi_number: '',
                    pi_name_en: '',
                    pi_name_cn: '',
                    date: '',
                    ctn: '',
                    tracking_number: '',
                    shipment_id: '',
                    shipping_method: '',
                    arrival_date: '',
                    company_id: '',
                    receipt_number: '',
                    total: '',
                    discount: '',
                    extra_charge: '',
                    remark: '',
                    thumbnails: [],
                });
                setThumbnails([]);
                setProductData({});
            },
            onCancel: () => {
                // Do nothing, keep the popup open
            },
        });
    } else {
        setIsPopupOpen(false);
        setCurrentPI(null);
        setIsEditMode(false);
    }
};

    const delete_pi = 23;
    const handleDelete = (id) => {
        checkPermission(delete_pi, (hasPermission) => {
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
                message: t('list_pis.confirm_delete_pi'),
                darkMode: darkMode,
                onConfirm: () => {
                    setIsDeleting(id);
                    router.delete(`/pi/${id}`, {
                        preserveScroll: true,
                        onSuccess: () => {
                            // Update the data state by filtering out the deleted PI
                            setData((prevData) => prevData.filter((pi) => pi.id !== id));
                            // Update pagination total
                            setPagination((prev) => ({
                                ...prev,
                                total: prev.total - 1,
                            }));
                            setIsDeleting(null);
                            showSuccessAlert({
                                title: t('success'),
                                message: t('list_pis.pi_deleted_successfully'),
                                darkMode: darkMode,
                                timeout: 3000,
                            });
                        },
                        onError: () => {
                            setIsDeleting(null);
                            showErrorAlert({
                                title: t('error'),
                                message: t('list_pis.pi_delete_failed'),
                                darkMode: darkMode,
                            });
                        }
                    });
                },
            });
        });
    };



    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            applyFilters();
        }
    };

    const handleTNumberSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            applyFilters();
            // toggleTNumberPopup(new Event('click'));
        }
    };

    const handleRNumberSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            applyFilters();
            // toggleRNumberPopup(new Event('click'));
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        const queryParams = {
            page: page,
            per_page: entriesPerPage,
            search: searchQuery,
            search_field: selectedSearchField,
            sort_field: sortField || 'id',
            sort_direction: sortDirection || 'desc',
        };

        if (checkedCompanies.length !== companies.length) {
            queryParams.companies = checkedCompanies;
        }
        if (checkedMethods.length !== methods.length) {
            queryParams.methods = checkedMethods;
        }
        if (checkedShipments.length !== shipments.length) {
            queryParams.shipments = checkedShipments;
        }
        if (startDate) {
            queryParams.start_date = startDate;
        }
        if (endDate) {
            queryParams.end_date = endDate;
        }
        if (startArrivalDate) {
            queryParams.start_arrival_date = startArrivalDate;
        }
        if (endArrivalDate) {
            queryParams.end_arrival_date = endArrivalDate;
        }
        if (tNumberSearch) {
            queryParams.t_number = tNumberSearch;
        }
        if (rNumberSearch) {
            queryParams.r_number = rNumberSearch;
        }

        // Include tracking statuses if not all are selected
        if (trackingStatuses.length !== 4) {
            queryParams.tracking_statuses = trackingStatuses;
        }

        router.get(
            '/pi/list',
            queryParams,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setData(page.props.purchaseInvoices.data);
                    setPagination({
                        currentPage: page.props.purchaseInvoices.current_page,
                        perPage: page.props.purchaseInvoices.per_page,
                        total: page.props.purchaseInvoices.total,
                    });
                },
                onError: (errors) => {
                    console.error('Error fetching page:', errors);
                },
            }
        );
    };

    const handleEntriesPerPageChange = (e) => {
        const newEntriesPerPage = Number(e.target.value);
        const newTotalPages = Math.ceil(pagination.total / newEntriesPerPage);
        let newPage = currentPage;

        if (currentPage > newTotalPages) {
            newPage = newTotalPages || 1;
        }

        // Update state immediately
        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(newPage);

        // Build query parameters
        const queryParams = {
            search: searchQuery,
            search_field: selectedSearchField,
            per_page: newEntriesPerPage,
            page: newPage,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        // Include filters only if they are not default
        if (checkedCompanies.length !== companies.length) {
            queryParams.companies = checkedCompanies;
        }
        if (checkedMethods.length !== methods.length) {
            queryParams.methods = checkedMethods;
        }
        if (checkedShipments.length !== shipments.length) {
            queryParams.shipments = checkedShipments;
        }
        if (startDate) {
            queryParams.start_date = startDate;
        }
        if (endDate) {
            queryParams.end_date = endDate;
        }
        if (startArrivalDate) {
            queryParams.start_arrival_date = startArrivalDate;
        }
        if (endArrivalDate) {
            queryParams.end_arrival_date = endArrivalDate;
        }
        if (tNumberSearch) {
            queryParams.t_number = tNumberSearch;
        }
        if (rNumberSearch) {
            queryParams.r_number = rNumberSearch;
        }

        if (trackingStatuses.length !== 4) {
            queryParams.tracking_statuses = trackingStatuses;
        }

        // Update URL and fetch data
        router.get(
            '/pi/list',
            queryParams,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true, // Use replace to avoid adding to browser history
                onSuccess: (page) => {
                    setData(page.props.purchaseInvoices.data);
                    setPagination({
                        currentPage: page.props.purchaseInvoices.current_page,
                        perPage: page.props.purchaseInvoices.per_page,
                        total: page.props.purchaseInvoices.total,
                    });
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const handleCompanyCheckboxChange = (company) => {
        setCheckedCompanies((prev) =>
            prev.includes(company)
                ? prev.filter((c) => c !== company)
                : [...prev, company]
        );
    };

    const handleMethodCheckboxChange = (method) => {
        setCheckedMethods((prev) =>
            prev.includes(method)
                ? prev.filter((m) => m !== method)
                : [...prev, method]
        );
    };

    const handleShipmentCheckboxChange = (shipment) => {
        setCheckedShipments((prev) =>
            prev.includes(shipment)
                ? prev.filter((s) => s !== shipment)
                : [...prev, shipment]
        );
    };

    const handleRowClick = (index, piId) => {
        setOpenRowDropdown(openRowDropdown === index ? null : index);
        setActiveTab('product'); // Set Product tab as active
        loadProductDetails(piId); // Load product data immediately
    };


    // Event listeners for closing popups
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                companyHeaderRef.current &&
                !companyHeaderRef.current.contains(event.target) &&
                !event.target.closest(".company-popup")
            ) {
                setIsAnimatingOut(true);
                setTimeout(() => {
                    setIsCompanyPopupOpen(false);
                    setIsAnimatingOut(false);
                }, 200);
            }
            // Add similar logic for other popups
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Add useEffect for key handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isPopupOpen) {
                if (e.key === 'Enter' && e.ctrlKey) {
                    // Allow newlines in textarea
                    if (e.target.tagName.toLowerCase() !== 'textarea') {
                        e.preventDefault();
                    }
                    const form = document.getElementById('edit-pi-form');
                    if (form && !isSubmitting) {
                        form.requestSubmit();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closePopup();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isPopupOpen, isSubmitting]);



    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isDeliveryPopupOpen) {
                if (e.key === 'Enter' && e.ctrlKey) {
                    if (e.target.tagName.toLowerCase() !== 'textarea') {
                        e.preventDefault();
                    }
                    const form = document.getElementById('delivery-form');
                    if (form && !isLoadingdelivery) {
                        form.requestSubmit();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeDeliveryPopup();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isDeliveryPopupOpen, isLoadingdelivery]);



    useEffect(() => {
        if (currentPI?.id && productData[currentPI.id]) {
            calculateTotals(productData);
        }
    }, [productData, formData.extra_charge, formData.discount, currentPI?.id]);

    useEffect(() => {
        if (currentPI?.id && productData[currentPI.id] && !hasCheckboxChecked) {
            const newProductData = { ...productData };
            let sum = 0;

            // Calculate total for each product
            newProductData[currentPI.id] = newProductData[currentPI.id].map(product => {
                const qty = parseFloat(product.qty) || 0;
                const price = parseFloat(product.price) || 0;
                const total = (qty * price).toFixed(3);
                sum += parseFloat(total) || 0;
                return { ...product, total };
            });

            // Update productData with new totals
            setProductData(newProductData);

            // Update sumOfTotals and formData.total
            setSumOfTotals(sum);
            const extraCharge = parseFloat(formData.extra_charge) || 0;
            const discount = parseFloat(formData.discount) || 0;
            setFormData(prev => ({
                ...prev,
                total: (sum + extraCharge - discount).toFixed(3),
            }));
        }
    }, [productData[currentPI?.id], hasCheckboxChecked, formData.extra_charge, formData.discount, currentPI?.id]);

    useEffect(() => {
        setData(purchaseInvoices.data);
        setPagination({
            currentPage: purchaseInvoices.current_page,
            perPage: purchaseInvoices.per_page,
            total: purchaseInvoices.total,
        });
    }, [purchaseInvoices]); // This will update when props change



    const sortableColumns = [
        { key: 'invoice_code', label: t("list_pis.invoice_code") },
        { key: 'supplier', label: t("list_pis.name") },
        { key: 'date', label: t("list_pis.date") },
        { key: 'amount', label: t("list_pis.total") },
        { key: 'ctn', label: t("list_pis.ctn") },
        { key: 'rating', label: t("company") },
        { key: 'method', label: t("list_pis.ship_by") },
        { key: 't_number', label: t("list_pis.t_number") },
        { key: 'r_number', label: t("list_pis.r_number") },
        { key: 'arrival_date', label: t("list_pis.ar_date") },
    ];

    const allColumns = sortableColumns;

    const handleDuplicate = () => {
        if (currentPI?.id) {
            const url = `/pi/create?id_pi=${currentPI.id}`;
            window.open(url, '_blank');
        } else {
            showErrorAlert({
                title: t('error'),
                message: t('list_pis.no_pi_selected'),
                darkMode: darkMode,
            });
        }
    };

    // Render the table and other UI components (same as your original JSX)
    return (
        <>
            <Head title={t("list_pi")} />
            <style>
                {`
                    @keyframes growFromPoint {
                        from { transform: scale(0); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes shrinkToPoint {
                        from { transform: scale(1); opacity: 1; }
                        to { transform: scale(0); opacity: 0; }
                    }
                `}
            </style>
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
                                    {selectedSearchField === "Invoice_Code_Name"
                                        ? t("list_pis.invoice_code_name")
                                        : t("product")}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${isSelectOpen ? 'rotate-180' : ''} ${getDarkModeClass(
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
                                        {[
                                            { key: "Invoice_Code_Name", label: t("list_pis.invoice_code_name") },
                                            { key: "Product", label: t("product") },
                                        ].map((item) => (
                                            <div
                                                key={item.key}
                                                className={`px-4 py-2 text-[12px] truncate uppercase cursor-pointer transition-colors duration-150 ${getDarkModeClass(
                                                    darkMode,
                                                    "hover:bg-[#3A3A3A] text-gray-300",
                                                    "hover:bg-gray-100 text-gray-700"
                                                )}`}
                                                onClick={() => {
                                                    setSelectedSearchField(item.key);
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
                                    placeholder={
                                        selectedSearchField === "Invoice_Code_Name"
                                            ? t("list_pis.search_invoice_code_name")
                                            : t("list_pis.search_product")
                                    }
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
                    </div>
                    <div className="relative overflow-x-auto rounded-lg text-sm h-[calc(100vh-14rem)] mx-auto custom-scrollbar">
                        <div className="w-full min-w-max">
                            <table className="w-full border-collapse text-[12px]" ref={tableRef}>
                                <thead>
                                    <tr
                                        className={`uppercase ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] border-b border-gray-700",
                                            "bg-[#ff8800]"
                                        )}`}
                                    >
                                        {sortableColumns.map((column) => (
                                            visibleColumns[column.key] && (
                                                <th
                                                    key={column.key}
                                                    style={{ width: `${columnWidths[column.key]}px` }}
                                                    onClick={() => handleSort(column.key)}
                                                    className={`p-3 truncate text-left sticky top-0 z-10 cursor-pointer relative ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#2D2D2D] text-gray-300",
                                                        "bg-[#ff8800] text-white"
                                                    )}`}
                                                >
                                                    <div
                                                        className="flex items-center"
                                                        ref={
                                                            column.key === 'rating'
                                                                ? companyHeaderRef
                                                                : column.key === 'date'
                                                                ? dateHeaderRef
                                                                : column.key === 'method'
                                                                ? shipByHeaderRef
                                                                : column.key === 'arrival_date'
                                                                ? arrivalDateHeaderRef
                                                                : column.key === 't_number'
                                                                ? tNumberHeaderRef
                                                                : column.key === 'r_number'
                                                                ? rNumberHeaderRef
                                                                : null
                                                        }
                                                    >
                                                        {column.label}
                                                        <span
                                                            className={`ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full ${getDarkModeClass(
                                                                darkMode,
                                                                "hover:bg-[#3A3A3A]",
                                                                "hover:bg-[#e07b00]"
                                                            )}`}
                                                        >
                                                            <GoArrowUp
                                                                className={`w-4 h-4 transition-transform duration-200 ${
                                                                    sortField === column.key
                                                                        ? sortDirection === 'asc'
                                                                            ? 'rotate-0'
                                                                            : 'rotate-180'
                                                                        : 'opacity-50'
                                                                }`}
                                                            />
                                                        </span>
                                                        {(column.key === 'rating' || column.key === 'date' || column.key === 'method' || column.key === 'arrival_date' || column.key === 't_number' || column.key === 'r_number') && (
                                                            <span
                                                                className={`ml-1 inline-flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${getDarkModeClass(
                                                                    darkMode,
                                                                    "hover:bg-[#3A3A3A] text-gray-300",
                                                                    "hover:bg-[#e07b00] text-white"
                                                                )}`}
                                                                onClick={
                                                                    column.key === 'rating'
                                                                        ? toggleCompanyPopup
                                                                        : column.key === 'date'
                                                                        ? toggleDatePopup
                                                                        : column.key === 'method'
                                                                        ? toggleShipByPopup
                                                                        : column.key === 'arrival_date'
                                                                        ? toggleArrivalDatePopup
                                                                        : column.key === 't_number'
                                                                        ? toggleTNumberPopup
                                                                        : toggleRNumberPopup
                                                                }
                                                            >
                                                                <CgMoreVerticalAlt className="w-5 h-5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`absolute right-0 top-2.5 h-8 w-[2px] cursor-col-resize ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-gray-500 hover:bg-blue-400",
                                                            "bg-white hover:bg-[#696cff]"
                                                        )} hover:scale-x-150 transition-transform duration-200`}
                                                        onMouseDown={(e) => handleResizeStart(e, column.key)}
                                                    />
                                                </th>
                                            )
                                        ))}
                                        <th
                                            style={{ width: `${columnWidths.action}px`, minWidth: `${columnWidths.action}px`, maxWidth: `${columnWidths.action}px` }}
                                            className={`p-3 pr-0 pl-3 text-left sticky top-0 z-10 relative ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300",
                                                "bg-[#ff8800] text-white"
                                            )}`}
                                        >
                                            <div className="flex items-center" ref={settingHeaderRef}>
                                                {t("action")}
                                                <span
                                                    className={`ml-1 inline-flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${getDarkModeClass(
                                                        darkMode,
                                                        "hover:bg-[#3A3A3A] text-gray-300",
                                                        "hover:bg-[#e07b00] text-white"
                                                    )}`}
                                                    onClick={toggleSettingPopup}
                                                >
                                                    <CgMoreVerticalAlt className="w-5 h-5" />
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                {isLoading ? (
                                    <TableLoading darkMode={darkMode} rowCount={entriesPerPage} colCount={11} />
                                ) : (
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr>
                                                <td colSpan={Object.keys(visibleColumns).filter((key) => visibleColumns[key]).length + 1}>
                                                    <NoDataComponent darkMode={darkMode} />
                                                </td>
                                            </tr>
                                        ) : (
                                            data.map((pi, index) => (
                                                <React.Fragment key={pi.id}>
                                                    <tr
                                                        onClick={() => handleRowClick(index, pi.id)}
                                                        className={`border-b cursor-pointer ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                            "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                        )}`}
                                                    >
                                                        {visibleColumns.invoice_code && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.invoice_code}px`,
                                                                    minWidth: `${columnWidths.invoice_code}px`,
                                                                    maxWidth: `${columnWidths.invoice_code}px`,
                                                                }}
                                                                className="p-3 truncate-text"
                                                            >
                                                                {pi.invoice_code ? (
                                                                    <Clipboard darkMode={darkMode} textToCopy={pi.invoice_code}>
                                                                        <Bellypopover darkMode={darkMode}>
                                                                            <span
                                                                                className={`label-Purple ${darkMode ? "label-Purple-darkmode" : ""}`}
                                                                                data-belly-caption={pi.invoice_code}
                                                                            >
                                                                                {pi.invoice_code && pi.invoice_code.length > 15
                                                                                    ? `${pi.invoice_code.substring(0, 12)}...`
                                                                                    : pi.invoice_code || ""}
                                                                            </span>
                                                                        </Bellypopover>
                                                                    </Clipboard>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleColumns.supplier && (
                                                       <td
                                                            style={{
                                                                width: `${columnWidths.supplier || 150}px`,
                                                                minWidth: `${columnWidths.supplier || 150}px`,
                                                                maxWidth: `${columnWidths.supplier || 150}px`,
                                                            }}
                                                            className="p-1 pr-3 pl-3 flex flex-col items-start gap-1"
                                                        >
                                                            {pi.pi_name_cn ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={pi.pi_name_cn}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-green ${darkMode ? "label-green-darkmode" : ""} inline-block w-auto`}
                                                                            data-belly-caption={pi.pi_name_cn}
                                                                        >
                                                                            {pi.pi_name_cn.length > 20 ? `${pi.pi_name_cn.substring(0, 17)}...` : pi.pi_name_cn}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                            {pi.supplier ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={pi.supplier}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-pink ${darkMode ? "label-pink-darkmode" : ""} inline-block w-auto`}
                                                                            data-belly-caption={pi.supplier}
                                                                        >
                                                                            {pi.supplier.length > 20 ? `${pi.supplier.substring(0, 17)}...` : pi.supplier}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        )}
                                                        {visibleColumns.date && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.date}px`,
                                                                    minWidth: `${columnWidths.date}px`,
                                                                    maxWidth: `${columnWidths.date}px`,
                                                                }}
                                                                className="p-3 truncate-text"
                                                            >
                                                                {formatDate(pi.date)}
                                                            </td>
                                                        )}
                                                        {visibleColumns.amount && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.amount}px`,
                                                                    minWidth: `${columnWidths.amount}px`,
                                                                    maxWidth: `${columnWidths.amount}px`,
                                                                }}
                                                                className="p-3 truncate-text"
                                                            >
                                                                {pi.amount.toFixed(3)} $
                                                            </td>
                                                        )}
                                                        {visibleColumns.ctn && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.ctn}px`,
                                                                    minWidth: `${columnWidths.ctn}px`,
                                                                    maxWidth: `${columnWidths.ctn}px`,
                                                                }}
                                                                className="p-3 truncate-text"
                                                            >
                                                                {pi.ctn || ""}
                                                            </td>
                                                        )}
                                                        {visibleColumns.rating && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.rating}px`,
                                                                    minWidth: `${columnWidths.rating}px`,
                                                                    maxWidth: `${columnWidths.rating}px`,
                                                                }}
                                                                className="p-3 truncate-text"
                                                            >
                                                                {pi.rating ? (
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-pink ${getDarkModeClass(darkMode, "label-pink-darkmode", "")}`}
                                                                            data-belly-caption={pi.rating}
                                                                        >
                                                                            {pi.rating && pi.rating.length > 15
                                                                            ? `${pi.rating.substring(0, 12)}...`
                                                                            : pi.rating || ""}
                                                                        </span>
                                                                    </Bellypopover>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleColumns.method && (
                                                            <td
                                                                style={{
                                                                width: `${columnWidths.method || 150}px`,
                                                                minWidth: `${columnWidths.method || 150}px`,
                                                                maxWidth: `${columnWidths.method || 150}px`,
                                                                }}
                                                                className="p-1 pr-3 pl-3 flex flex-col items-start gap-1"
                                                            >
                                                                {pi.shipment_name ? (
                                                                    <span
                                                                        className={`label-Purple ${darkMode ? "label-Purple-darkmode" : ""} inline-block w-auto`}
                                                                        data-belly-caption={pi.shipment_name}
                                                                    >
                                                                        {pi.shipment_name}
                                                                    </span>
                                                                ) : (
                                                                ""
                                                                )}

                                                                {pi.name_method ? (
                                                                    <span
                                                                        className={`label-green ${getDarkModeClass(darkMode, "label-green-darkmode", "")} inline-block w-auto`}
                                                                        data-belly-caption={pi.name_method}
                                                                    >
                                                                        {pi.name_method}
                                                                    </span>
                                                                ) : (
                                                                ""
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleColumns.t_number && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.t_number}px`,
                                                                    minWidth: `${columnWidths.t_number}px`,
                                                                    maxWidth: `${columnWidths.t_number}px`,
                                                                }}
                                                                className="p-3 truncate-text"
                                                            >
                                                                {pi.t_number ? (
                                                                    <Clipboard darkMode={darkMode} textToCopy={pi.t_number}>
                                                                        <Bellypopover darkMode={darkMode}>
                                                                            <span
                                                                                className={`label-blue ${darkMode ? "label-blue-darkmode" : ""}`}
                                                                                data-belly-caption={pi.t_number}
                                                                            >
                                                                                {pi.t_number && pi.t_number.length > 15
                                                                                    ? `${pi.t_number.substring(0, 12)}...`
                                                                                    : pi.t_number || ""}
                                                                            </span>
                                                                        </Bellypopover>
                                                                    </Clipboard>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleColumns.r_number && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.r_number}px`,
                                                                    minWidth: `${columnWidths.r_number}px`,
                                                                    maxWidth: `${columnWidths.r_number}px`,
                                                                }}
                                                                className="p-3 truncate-text"
                                                            >
                                                                {pi.r_number ? (
                                                                    <Clipboard darkMode={darkMode} textToCopy={pi.r_number}>
                                                                        <Bellypopover darkMode={darkMode}>
                                                                            <span
                                                                                className={`label-orange ${darkMode ? "label-orange-darkmode" : ""}`}
                                                                                data-belly-caption={pi.r_number}
                                                                            >
                                                                                {pi.r_number && pi.r_number.length > 15
                                                                                    ? `${pi.r_number.substring(0, 12)}...`
                                                                                    : pi.r_number || ""}
                                                                            </span>
                                                                        </Bellypopover>
                                                                    </Clipboard>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleColumns.arrival_date && (
                                                            <td
                                                                style={{
                                                                    width: `${columnWidths.arrival_date}px`,
                                                                    minWidth: `${columnWidths.arrival_date}px`,
                                                                    maxWidth: `${columnWidths.arrival_date}px`,
                                                                }}
                                                                className="p-3 truncate-text flex gap-2 items-center justify-end"
                                                            >
                                                                <div className="h-full flex items-center justify-center">
                                                                    <span>{formatDate(pi.arrival_date)}</span>
                                                                </div>
                                                                {pi.tracking_status && (
                                                                    <div className="h-full flex items-center justify-center">
                                                                        <div
                                                                            title={getTrackingTitle(pi.tracking_status)}
                                                                            className={`${getTrackingClass(pi.tracking_status)} w-4 h-4 rounded-full`}
                                                                        ></div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.action}px`,
                                                                minWidth: `${columnWidths.action}px`,
                                                                maxWidth: `${columnWidths.action}px`,
                                                            }}
                                                            className="p-3 w-20"
                                                        >
                                                            <div className="relative action-container">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenActionDropdown(openActionDropdown === index ? null : index);
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
                                                                        className={`absolute right-[3rem] w-40 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                                                            darkMode,
                                                                            "bg-[#2D2D2D] text-gray-200",
                                                                            "bg-white text-gray-900"
                                                                        )}`}
                                                                    >
                                                                        <button
                                                                            onClick={() => openEditPopup(pi)}
                                                                            className={`w-full text-left hover:rounded px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                                                darkMode,
                                                                                "hover:bg-[#3A3A3A]",
                                                                                "hover:bg-gray-100"
                                                                            )} ${isEditLoading === pi.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                            disabled={isEditLoading && currentPI?.id === pi.id} // Disable button during edit loading for this PI
                                                                        >
                                                                            {isEditLoading && currentPI?.id === pi.id ? (
                                                                                    <Spinner
                                                                                        width="16px"
                                                                                        height="16px"
                                                                                        color={darkMode ? "#ff8800" : "#ff8800"}
                                                                                    />
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
                                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-6.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                            {t("edit")}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => downloadExcel(pi.id)}
                                                                            className={`w-full text-left uppercase hover:rounded px-4 py-2 text-sm flex items-center relative ${getDarkModeClass(
                                                                                darkMode,
                                                                                "hover:bg-[#3A3A3A] text-gray-200",
                                                                                "hover:bg-gray-100 text-gray-900"
                                                                            )} transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
                                                                            disabled={excelProgress > 0 && excelProgress < 100}
                                                                            aria-label={excelProgress > 0 && excelProgress < 100 ? t("list_pis.downloading") : t("excel")}
                                                                            aria-busy={excelProgress > 0 && excelProgress < 100}
                                                                        >
                                                                            <FaFileExcel className="mr-2 text-green-500" />
                                                                            <span>{excelProgress > 0 && excelProgress < 100 ? t("list_pis.downloading") : t("excel")}</span>
                                                                            {excelProgress > 0 && excelProgress <= 100 && (
                                                                                <div className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden bg-gray-300 dark:bg-gray-700 rounded-b">
                                                                                    <div
                                                                                        className="h-full bg-[#ff8800] transition-all duration-300"
                                                                                        style={{ width: `${excelProgress}%` }}
                                                                                        role="progressbar"
                                                                                        aria-valuenow={excelProgress}
                                                                                        aria-valuemin="0"
                                                                                        aria-valuemax="100"
                                                                                    ></div>
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(pi.id)}
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
                                                    {openRowDropdown === index && (
                                                        <>
                                                            <tr
                                                                className={`border-b ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                    "bg-gray-100 text-gray-900 border-gray-200"
                                                                )}`}
                                                            >
                                                                <td
                                                                    colSpan={Object.keys(visibleColumns).filter((key) => visibleColumns[key]).length + 1}
                                                                    className="p-4"
                                                                >
                                                                    <div className="flex border-gray-300 dark:border-gray-600">
                                                                        {/* Product Tab (Position 1) */}
                                                                        <button
                                                                            onClick={() => handleTabChange("product", pi.id)}
                                                                            className={`px-4 uppercase py-2 text-sm font-medium ${
                                                                                activeTab === "product"
                                                                                    ? "border-b-2 border-orange-500 text-orange-500"
                                                                                    : "text-gray-500 hover:text-orange-500"
                                                                            } ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-300 hover:text-orange-400",
                                                                                "text-gray-700 hover:text-orange-600"
                                                                            )}`}
                                                                        >
                                                                            {t("list_pis.product")}
                                                                        </button>
                                                                        {/* Reference Tab (Position 2) */}
                                                                        <button
                                                                            onClick={() => handleTabChange("reference", pi.id)}
                                                                            className={`px-4 uppercase py-2 text-sm font-medium ${
                                                                                activeTab === "reference"
                                                                                    ? "border-b-2 border-orange-500 text-orange-500"
                                                                                    : "text-gray-500 hover:text-orange-500"
                                                                            } ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-300 hover:text-orange-400",
                                                                                "text-gray-700 hover:text-orange-600"
                                                                            )}`}
                                                                        >
                                                                            {t("list_pis.reference")}
                                                                        </button>
                                                                        {/* Remark Tab (Position 3) */}
                                                                        <button
                                                                            onClick={() => setActiveTab("remark")}
                                                                            className={`px-4 uppercase py-2 text-sm font-medium ${
                                                                                activeTab === "remark"
                                                                                    ? "border-b-2 border-orange-500 text-orange-500"
                                                                                    : "text-gray-500 hover:text-orange-500"
                                                                            } ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-300 hover:text-orange-400",
                                                                                "text-gray-700 hover:text-orange-600"
                                                                            )}`}
                                                                        >
                                                                            {t("list_pis.remark")}
                                                                        </button>
                                                                    </div>
                                                                    <div
                                                                        className={`mt-4 p-4 rounded-lg ${getDarkModeClass(
                                                                            darkMode,
                                                                            "dark:bg-gray-800",
                                                                            "bg-gray-50 shadow-md"
                                                                        )}`}
                                                                    >
                                                                        {activeTab === "remark" && (
                                                                            <div className="space-y-4 text-sm">
                                                                                {loadingTabData ? (
                                                                                    <ShimmerLoading
                                                                                        darkMode={darkMode}
                                                                                        width="100%"
                                                                                        height="20px"
                                                                                        borderRadius="4px"
                                                                                        rowCount={3}
                                                                                        colCount={1}
                                                                                    />
                                                                                ) : pi.remark ? (
                                                                                    pi.remark
                                                                                ) : (
                                                                                    <NoDataComponent darkMode={darkMode} />
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {activeTab === "reference" && (
                                                                            <div className="flex flex-wrap gap-2 p-2">
                                                                                {loadingTabData ? (
                                                                                    <ShimmerLoading
                                                                                        darkMode={darkMode}
                                                                                        width="8rem"
                                                                                        height="8rem"
                                                                                        borderRadius="8px"
                                                                                        rowCount={1}
                                                                                        colCount={5}
                                                                                    />
                                                                                ) : referencePhotos[pi.id] && referencePhotos[pi.id].length > 0 ? (
                                                                                    <div className="flex flex-wrap gap-2 p-2">
                                                                                        {referencePhotos[pi.id].map((photo, idx) => (
                                                                                            <div key={idx} className="relative w-32 h-32 group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                                                                                <img data-kheng-chetra={`reference-pi-${pi.id}`} src={`/storage/${photo}`} loading="lazy" className="w-full cursor-pointer h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="w-full">
                                                                                        <NoDataComponent darkMode={darkMode} />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {activeTab === "product" && (
                                                                            <div className="space-y-4">
                                                                                {loadingTabData ? (
                                                                                <TableLoadingFull darkMode={darkMode} rowCount={4} colCount={10} />
                                                                                ) : productData[pi.id] && productData[pi.id].length > 0 ? (
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
                                                                                        <th className="p-3 text-left">{t("list_pis.photo")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.code")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.name")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.ctn")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.qty")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.price")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.total")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.note")}</th>
                                                                                        <th className="p-3 text-center">{t("list_pis.progress")}</th>
                                                                                        <th className="p-3 text-left">{t("list_pis.delivered")}</th>
                                                                                        <th className="p-3 text-left"></th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="overflow-y-auto">
                                                                                        {productData[pi.id].map((product, index) => (
                                                                                        <tr
                                                                                            key={product.id}
                                                                                            className={`border-b ${getDarkModeClass(
                                                                                            darkMode,
                                                                                            "border-gray-700 hover:bg-[#3A3A3A]",
                                                                                            "border-gray-200 hover:bg-gray-100"
                                                                                            )}`}
                                                                                        >
                                                                                            <td className="p-3">
                                                                                            {product.photo ? (
                                                                                                <div className="relative w-12 h-12">
                                                                                                {!loadedImages[product.id] && (
                                                                                                    <ShimmerLoading
                                                                                                    darkMode={darkMode}
                                                                                                    width="3rem"
                                                                                                    height="3rem"
                                                                                                    borderRadius="0.375rem"
                                                                                                    rowCount={1}
                                                                                                    colCount={1}
                                                                                                    />
                                                                                                )}
                                                                                                <img
                                                                                                    data-kheng-chetra={`product-pidetail-${pi.id}`}
                                                                                                    src={`/storage/${product.photo}`}
                                                                                                    alt={product.name}
                                                                                                    className={`w-12 h-12 cursor-pointer object-cover rounded-md absolute top-0 left-0 transition-opacity duration-300 ${
                                                                                                    loadedImages[product.id] ? "opacity-100" : "opacity-0"
                                                                                                    }`}
                                                                                                    loading="lazy"
                                                                                                    onLoad={() =>
                                                                                                    setLoadedImages((prev) => ({
                                                                                                        ...prev,
                                                                                                        [product.id]: true,
                                                                                                    }))
                                                                                                    }
                                                                                                />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <NoImageComponent
                                                                                                darkMode={darkMode}
                                                                                                width="3rem"
                                                                                                height="3rem"
                                                                                                borderRadius="0.375rem"
                                                                                                fontSize="10px"
                                                                                                />
                                                                                            )}
                                                                                            </td>
                                                                                            <td className="p-3">
                                                                                                {product.code ? (
                                                                                                    <Clipboard darkMode={darkMode} textToCopy={product.code}>
                                                                                                        <Bellypopover darkMode={darkMode}>
                                                                                                        <span
                                                                                                            className={`label-Purple ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            "label-Purple-darkmode",
                                                                                                            ""
                                                                                                            )}`}
                                                                                                            data-belly-caption={product.code}
                                                                                                        >
                                                                                                            {product.code && product.code.length > 15
                                                                                                            ? `${product.code.substring(0, 12)}...`
                                                                                                            : product.code || ""}
                                                                                                        </span>

                                                                                                        </Bellypopover>
                                                                                                    </Clipboard>
                                                                                                ) : (
                                                                                                    ""
                                                                                                )}
                                                                                            </td>
                                                                                            <td
                                                                                                className="p-1 pr-3 pl-3 flex flex-col items-start gap-1"
                                                                                                >
                                                                                                {product.name_en ? (
                                                                                                    <Clipboard darkMode={darkMode} textToCopy={product.name_en}>
                                                                                                    <Bellypopover darkMode={darkMode}>
                                                                                                        <span
                                                                                                        className={`label-green ${darkMode ? "label-green-darkmode" : ""} inline-block w-auto`}
                                                                                                        data-belly-caption={product.name_en}
                                                                                                        >
                                                                                                        {product.name_en.length > 20 ? `${product.name_en.substring(0, 17)}...` : product.name_en}
                                                                                                        </span>
                                                                                                    </Bellypopover>
                                                                                                    </Clipboard>
                                                                                                ) : (
                                                                                                    ""
                                                                                                )}
                                                                                                {product.name_kh ? (
                                                                                                    <Clipboard darkMode={darkMode} textToCopy={product.name_kh}>
                                                                                                    <Bellypopover darkMode={darkMode}>
                                                                                                        <span
                                                                                                        className={`label-pink ${darkMode ? "label-pink-darkmode" : ""} inline-block w-auto`}
                                                                                                        data-belly-caption={product.name_kh}
                                                                                                        >
                                                                                                        {product.name_kh.length > 20 ? `${product.name_kh.substring(0, 17)}...` : product.name_kh}
                                                                                                        </span>
                                                                                                    </Bellypopover>
                                                                                                    </Clipboard>
                                                                                                ) : (
                                                                                                    ""
                                                                                                )}
                                                                                                {product.name_cn ? (
                                                                                                    <Clipboard darkMode={darkMode} textToCopy={product.name_cn}>
                                                                                                        <Bellypopover darkMode={darkMode}>
                                                                                                            <span
                                                                                                            className={`label-blue ${darkMode ? "label-blue-darkmode" : ""} inline-block w-auto`}
                                                                                                            data-belly-caption={product.name_cn}
                                                                                                            >
                                                                                                            {product.name_cn.length > 20 ? `${product.name_cn.substring(0, 17)}...` : product.name_cn}
                                                                                                            </span>
                                                                                                        </Bellypopover>
                                                                                                    </Clipboard>
                                                                                                ) : (
                                                                                                    ""
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="p-3">{product.ctn}</td>
                                                                                            <td className="p-3">{product.qty}</td>
                                                                                            <td className="p-3">${Number(product.price).toFixed(3)}</td>
                                                                                            <td className="p-3">${Number(product.total).toFixed(3)}</td>
                                                                                            <td className="p-3 max-w-xs">
                                                                                            {product.note ? (
                                                                                                <Clipboard darkMode={darkMode} textToCopy={product.note}>
                                                                                                    <Bellypopover darkMode={darkMode}>
                                                                                                        <span
                                                                                                            className={`label-red ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            "label-red-darkmode",
                                                                                                            ""
                                                                                                            )}`}
                                                                                                            data-belly-caption={product.note}
                                                                                                        >
                                                                                                            {product.note && product.note.length > 15
                                                                                                            ? `${product.note.substring(0, 12)}...`
                                                                                                            : product.note || ""}
                                                                                                        </span>
                                                                                                    </Bellypopover>
                                                                                                </Clipboard>
                                                                                            ) : (
                                                                                                ""
                                                                                            )}
                                                                                            </td>
                                                                                            <td className="p-3">
                                                                                            <ProgressChart
                                                                                                darkMode={darkMode}
                                                                                                percentage={
                                                                                                product.progress === 1
                                                                                                    ? 50
                                                                                                    : product.progress === 2
                                                                                                    ? 100
                                                                                                    : 0
                                                                                                }
                                                                                                size={50}
                                                                                                fontSize={12}
                                                                                            />
                                                                                            </td>
                                                                                            <td className="p-3">
                                                                                                <div className="flex flex-col items-start">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        disabled
                                                                                                        checked={product.delivered} // Bind checkbox to delivered boolean
                                                                                                        onChange={(e) => {
                                                                                                            const newProductData = { ...productData };
                                                                                                            newProductData[currentPI.id][index].delivered = e.target.checked;
                                                                                                            setProductData(newProductData);
                                                                                                        }}
                                                                                                        className={`custom-checkbox ${getDarkModeClass(
                                                                                                            darkMode,
                                                                                                            "custom-checkbox-border-darkmode",
                                                                                                            "custom-checkbox-border"
                                                                                                        )}`}
                                                                                                    />
                                                                                                    <span className="text-xs mt-1 text-gray-500">
                                                                                                        {product.delivered && product.cargo_date
                                                                                                            ? formatDate(product.cargo_date) // Display cargo_date if delivered is true
                                                                                                            : ""}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className="p-3">
                                                                                                <button
                                                                                                    onClick={() => openDeliveryPopup(product.id)}
                                                                                                    className={`p-2 rounded-full ${getDarkModeClass(
                                                                                                        darkMode,
                                                                                                        "hover:bg-gray-900 text-gray-300",
                                                                                                        "hover:bg-gray-200 text-gray-700"
                                                                                                    )}`}
                                                                                                    title={t("list_pis.edit_delivery")}
                                                                                                    disabled={loadingDeliveryMap[product.id]}
                                                                                                >
                                                                                                    {loadingDeliveryMap[product.id] ? (
                                                                                                        <Spinner
                                                                                                            width="16px"
                                                                                                            height="16px"
                                                                                                            color={darkMode ? "#ff8800" : "#ff8800"}
                                                                                                        />
                                                                                                    ) : (
                                                                                                        <svg
                                                                                                            className="w-4 h-4 text-orange-400"
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
                                                                                                </button>
                                                                                            </td>
                                                                                        </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                    </table>
                                                                                </div>
                                                                                ) : (
                                                                                <NoDataComponent darkMode={darkMode} />
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {/* Extra Charge, Discount, Net Total Rows */}
                                                            <tr
                                                                className={`border-b transition-colors duration-200 ${
                                                                    darkMode
                                                                        ? 'bg-transparent text-gray-200 border-gray-800'
                                                                        : 'bg-gray-100 text-gray-900 border-gray-200'
                                                                }`}
                                                            >
                                                                <td
                                                                    colSpan={8}
                                                                    className={`p-2 text-right font-medium ${
                                                                        darkMode
                                                                            ? 'bg-transparent border-2 border-[#F7B500] text-[#F7B500] ring-1 ring-[#F7B500]/30 shadow-[0_0_8px_rgba(247,181,0,0.3)]'
                                                                            : 'bg-[#F7B500] text-gray-900'
                                                                    }`}
                                                                >
                                                                    <span className="text-sm">{t('list_pis.extra_charge')}</span>
                                                                </td>
                                                                <td colSpan={4} className="p-2 text-left">
                                                                    <span className="text-sm font-semibold">{pi.extra_charge ? `${pi.extra_charge.toFixed(3)} $` : '0.000 $'}</span>
                                                                </td>
                                                            </tr>
                                                            <tr
                                                                className={`border-b transition-colors duration-200 ${
                                                                    darkMode
                                                                        ? 'bg-transparent text-gray-200 border-gray-800'
                                                                        : 'bg-gray-100 text-gray-900 border-gray-200'
                                                                }`}
                                                            >
                                                                <td
                                                                    colSpan={8}
                                                                    className={`p-2 text-right font-medium ${
                                                                        darkMode
                                                                            ? 'bg-transparent border-2 border-[#ffaa00] text-[#ffaa00] ring-1 ring-[#ffaa00]/30 shadow-[0_0_8px_rgba(255,170,0,0.3)]'
                                                                            : 'bg-[#ffaa00] text-gray-900'
                                                                    }`}
                                                                >
                                                                    <span className="text-sm">{t('list_pis.discount')}</span>
                                                                </td>
                                                                <td colSpan={4} className="p-2 text-left">
                                                                    <span className="text-sm font-semibold">{pi.discount ? `${pi.discount.toFixed(3)} $` : '0.000 $'}</span>
                                                                </td>
                                                            </tr>
                                                            <tr
                                                                className={`border-b transition-colors duration-200 ${
                                                                    darkMode
                                                                        ? 'bg-transparent text-gray-200 border-gray-800'
                                                                        : 'bg-gray-100 text-gray-900 border-gray-200'
                                                                }`}
                                                            >
                                                                <td
                                                                    colSpan={8}
                                                                    className={`p-2 text-right font-medium ${
                                                                        darkMode
                                                                            ? 'bg-transparent border-2 border-[#ff8800] text-[#ff8800] ring-1 ring-[#ff8800]/30 shadow-[0_0_8px_rgba(255,136,0,0.3)]'
                                                                            : 'bg-[#ff8800] text-gray-900'
                                                                    }`}
                                                                >
                                                                    <span className="text-sm">{t('list_pis.net_total')}</span>
                                                                </td>
                                                                <td colSpan={4} className="p-2 text-left">
                                                                    <span className="text-sm font-semibold">{pi.amount.toFixed(3)} $</span>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )}
                                                </React.Fragment>
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


                <DateFilterPopups
                    darkMode={darkMode}
                    isDatePopupOpen={isDatePopupOpen}
                    isArrivalDatePopupOpen={isArrivalDatePopupOpen}
                    isDateAnimatingOut={isDateAnimatingOut}
                    isArrivalDateAnimatingOut={isArrivalDateAnimatingOut}
                    startDate={startDate}
                    endDate={endDate}
                    startArrivalDate={startArrivalDate}
                    endArrivalDate={endArrivalDate}
                    datePopupPosition={datePopupPosition}
                    arrivalDatePopupPosition={arrivalDatePopupPosition}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setStartArrivalDate={setStartArrivalDate}
                    setEndArrivalDate={setEndArrivalDate}
                    toggleDatePopup={toggleDatePopup}
                    toggleArrivalDatePopup={toggleArrivalDatePopup}
                    applyFilters={applyFilters}
                />

                <CompanyFilterPopups
                    darkMode={darkMode}
                    isCompanyPopupOpen={isCompanyPopupOpen}
                    isAnimatingOut={isAnimatingOut}
                    checkedCompanies={checkedCompanies}
                    companies={companies}
                    popupPosition={popupPosition}
                    handleCompanyCheckboxChange={handleCompanyCheckboxChange}
                    toggleCompanyPopup={toggleCompanyPopup}
                    applyFilters={applyFilters}
                />

                <ShipByFilterPopups
                    darkMode={darkMode}
                    isShipByPopupOpen={isShipByPopupOpen}
                    isShipByAnimatingOut={isShipByAnimatingOut}
                    checkedMethods={checkedMethods}
                    checkedShipments={checkedShipments}
                    methods={methods}
                    shipments={shipments}
                    shipByPopupPosition={shipByPopupPosition}
                    setCheckedMethods={setCheckedMethods}
                    setCheckedShipments={setCheckedShipments}
                    toggleShipByPopup={toggleShipByPopup}
                    applyFilters={applyFilters}
                />

                <NumberFilterPopups
                    darkMode={darkMode}
                    isTNumberPopupOpen={isTNumberPopupOpen}
                    isRNumberPopupOpen={isRNumberPopupOpen}
                    isTNumberAnimatingOut={isTNumberAnimatingOut}
                    isRNumberAnimatingOut={isRNumberAnimatingOut}
                    tNumberSearch={tNumberSearch}
                    rNumberSearch={rNumberSearch}
                    tNumberPopupPosition={tNumberPopupPosition}
                    rNumberPopupPosition={rNumberPopupPosition}
                    setTNumberSearch={setTNumberSearch}
                    setRNumberSearch={setRNumberSearch}
                    toggleTNumberPopup={toggleTNumberPopup}
                    toggleRNumberPopup={toggleRNumberPopup}
                    applyFilters={applyFilters}
                />

                <SettingsPopup
                    darkMode={darkMode}
                    isSettingPopupOpen={isSettingPopupOpen}
                    isSettingAnimatingOut={isSettingAnimatingOut}
                    settingPopupPosition={settingPopupPosition}
                    columnSearchQuery={columnSearchQuery}
                    setColumnSearchQuery={setColumnSearchQuery}
                    visibleColumns={visibleColumns}
                    allColumns={allColumns}
                    handleColumnVisibilityChange={handleColumnVisibilityChange}
                    handleResetColumns={handleResetColumns}
                    toggleSettingPopup={toggleSettingPopup}
                />
                {isDeliveryPopupOpen && (
                    <div
                        id="delivery-popup"
                        className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
                        isDeliveryPopupOpen ? "bg-opacity-60 opacity-100 visible" : "bg-opacity-0 opacity-0 invisible"
                        }`}
                    >
                        <div
                        className={`rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${
                            isDeliveryPopupOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 -translate-y-4 opacity-0"
                        } ${getDarkModeClass(darkMode, "bg-gray-900 text-gray-200", "bg-white text-gray-900")}`}
                        >
                        {/* Header */}
                        <div
                            className={`p-6 sticky top-0 z-10 rounded-t-2xl ${getDarkModeClass(
                            darkMode,
                            "bg-gray-900",
                            "bg-white"
                            )}`}
                        >
                            <h2
                            className={`uppercase text-sm font-bold flex items-center ${getDarkModeClass(
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
                                d="M9 17V7m0 10h6m-6 0H3m12 0h6m-9-6h6m-6 0H3m9 4h6M3 7h6m6 0h6M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"
                                />
                            </svg>
                            {t("list_pis.edit_delivery")}
                            </h2>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 p-6 pt-0 overflow-y-auto custom-scrollbar">
                            <form id="delivery-form" className="space-y-8" onSubmit={handleDeliverySubmit}>
                                <input type="hidden" className='text-black' value={deliveryFormData.pi_id} name="" id="" />
                                <input type="hidden" className='text-black' name="delivery" id="delivery" value={deliveryFormData.delivery} />
                            {/* Row 1: DatePicker and Textarea */}
                            <div className="space-y-6">
                                {/* Sub-row 1: DatePicker */}
                                <div>
                                <label
                                    className={`uppercase block text-xs font-medium mb-2 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                    )}`}
                                >
                                    {t("list_pis.cargo_date")}
                                </label>
                                <MuiStyleDatePicker
                                    value={deliveryFormData.cargo_date}
                                    onChange={(value) => setDeliveryFormData({ ...deliveryFormData, cargo_date: value })}
                                    darkMode={darkMode}
                                    style={{
                                    border: `1px solid ${darkMode ? "#4A4A4A" : "#E0E0E0"}`,
                                    borderRadius: "0.5rem",
                                    backgroundColor: darkMode ? "#2D2D2D" : "#FFFFFF",
                                    }}
                                />
                                </div>

                                {/* Sub-row 2: Textarea */}
                                <div>
                                <label
                                    className={`uppercase block text-xs font-medium mb-2 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                    )}`}
                                >
                                    {t("list_pis.note_receipt")}
                                </label>
                                <textarea
                                    name="note_receipt"
                                    value={deliveryFormData.note_receipt}
                                    onChange={(e) => setDeliveryFormData({ ...deliveryFormData, note_receipt: e.target.value })}
                                    className={`w-full custom-scrollbar border h-40 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                    placeholder={t("list_pis.note_receipt")}
                                />
                                </div>
                            </div>

                            {/* Row 2: Two Columns for receipt_products and receipt_pictures */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Column 1: receipt_products */}
                                <div>
                                <label
                                    className={`uppercase block text-xs font-medium mb-2 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                    )}`}
                                >
                                    {t("list_pis.receipt_products")}
                                </label>
                                <div
                                    onDrop={(e) => handleReceiptImageDrop(e, "receipt_products")}
                                    onDragOver={(e) => {
                                    e.preventDefault();
                                    setReceiptProductsDragging(true);
                                    }}
                                    onDragLeave={() => setReceiptProductsDragging(false)}
                                    className={`w-full rounded-lg p-6 text-center cursor-pointer border-2 border-dashed transition duration-200 ${
                                    receiptProductsDragging
                                        ? "border-orange-400 bg-orange-100/20"
                                        : getDarkModeClass(
                                            darkMode,
                                            "border-gray-700 hover:border-orange-400",
                                            "border-gray-300 hover:border-orange-400"
                                        )
                                    }`}
                                    onClick={() => document.getElementById("receipt-products-input").click()}
                                >
                                    <svg
                                    className={`w-10 h-10 mx-auto mb-3 ${getDarkModeClass(
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
                                    id="receipt-products-input"
                                    ref={receiptProductsInputRef} // Add ref
                                    onChange={(e) => handleReceiptPicturesChange(e.target.files, "receipt_products")}
                                    />
                                </div>
                                <div className="h-52 overflow-y-auto custom-scrollbar mt-4 p-2">
                                    <div className="space-y-2">
                                    {deliveryFormData.receipt_products.map((image, index) => (
                                        <div
                                        key={`receipt-product-${image.id}`}
                                        className={`flex items-center p-2 rounded-lg border transition-all duration-200 ${
                                            image.markedForDeletion
                                            ? "opacity-50 border-red-500"
                                            : getDarkModeClass(
                                                darkMode,
                                                "border-gray-700 bg-gray-800",
                                                "border-gray-200 bg-gray-50"
                                                )
                                        }`}
                                        >
                                        <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                                            {image.loading ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Spinner width="22px" height="22px" color={darkMode ? "#ff8800" : "#ff8800"} />
                                            </div>
                                            ) : (
                                            <img
                                                src={image.preview}
                                                className="w-10 h-10 object-cover rounded"
                                                data-kheng-chetra={`receipt-product`}
                                                onLoad={() => {
                                                if (image.isNew) {
                                                    setDeliveryFormData((prev) => {
                                                    const updated = [...prev.receipt_products];
                                                    updated[index] = { ...updated[index], loading: false };
                                                    return { ...prev, receipt_products: updated };
                                                    });
                                                }
                                                }}
                                            />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                            className={`truncate text-sm ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                            >
                                            {formatFileName(image.name)}
                                            </p>
                                            <div className="flex justify-between items-center text-xs">
                                            <p
                                                className={`${getDarkModeClass(
                                                darkMode,
                                                "text-gray-500",
                                                "text-gray-500"
                                                )}`}
                                            >
                                                {image.size ? formatFileSize(image.size) : ""}
                                            </p>
                                            {image.estimatedTime && (
                                                <p
                                                className={`${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-400",
                                                    "text-gray-500"
                                                )}`}
                                                >
                                                {image.estimatedTime}s remaining
                                                </p>
                                            )}
                                            </div>
                                            {image.loading && (
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                <div
                                                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                                                style={{ width: `${image.progress}%` }}
                                                />
                                            </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeReceiptImage(index, "receipt_products");
                                            }}
                                            className={`p-1 rounded-full ml-2 ${getDarkModeClass(
                                            darkMode,
                                            "hover:bg-gray-600",
                                            "hover:bg-gray-200"
                                            )}`}
                                            disabled={image.loading}
                                            aria-label={image.markedForDeletion ? "Restore image" : "Remove image"}
                                        >
                                            {image.markedForDeletion ? (
                                            <svg
                                                className="w-5 h-5 text-green-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M12 4v16" />
                                            </svg>
                                            ) : (
                                            <svg
                                                className={`w-5 h-5 ${image.loading ? "text-gray-400" : "text-gray-500"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            )}
                                        </button>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                                </div>

                                {/* Column 2: receipt_pictures */}
                                <div>
                                <label
                                    className={`uppercase block text-xs font-medium mb-2 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                    )}`}
                                >
                                    {t("list_pis.receipt_pictures")}
                                </label>
                                <div
                                    onDrop={(e) => handleReceiptImageDrop(e, "receipt_pictures")}
                                    onDragOver={(e) => {
                                    e.preventDefault();
                                    setReceiptPicturesDragging(true);
                                    }}
                                    onDragLeave={() => setReceiptPicturesDragging(false)}
                                    className={`w-full rounded-lg p-6 text-center cursor-pointer border-2 border-dashed transition duration-200 ${
                                    receiptPicturesDragging
                                        ? "border-orange-400 bg-orange-100/20"
                                        : getDarkModeClass(
                                            darkMode,
                                            "border-gray-700 hover:border-orange-400",
                                            "border-gray-300 hover:border-orange-400"
                                        )
                                    }`}
                                    onClick={() => document.getElementById("receipt-pictures-input").click()}
                                >
                                    <svg
                                    className={`w-10 h-10 mx-auto mb-3 ${getDarkModeClass(
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
                                    id="receipt-pictures-input"
                                    ref={receiptPicturesInputRef} // Add ref
                                    onChange={(e) => handleReceiptPicturesChange(e.target.files, "receipt_pictures")}
                                    />
                                </div>
                                <div className="h-52 overflow-y-auto custom-scrollbar mt-4 p-2">
                                    <div className="space-y-2">
                                    {deliveryFormData.receipt_pictures.map((image, index) => (
                                        <div
                                        key={`receipt-picture-${image.id}`}
                                        className={`flex items-center p-2 rounded-lg border transition-all duration-200 ${
                                            image.markedForDeletion
                                            ? "opacity-50 border-red-500"
                                            : getDarkModeClass(
                                                darkMode,
                                                "border-gray-700 bg-gray-800",
                                                "border-gray-200 bg-gray-50"
                                                )
                                        }`}
                                        >
                                        <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                                            {image.loading ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Spinner width="22px" height="22px" color={darkMode ? "#ff8800" : "#ff8800"} />
                                            </div>
                                            ) : (
                                            <img
                                                src={image.preview}
                                                className="w-10 h-10 object-cover rounded"
                                                data-kheng-chetra={`receipt-picture`}
                                                onLoad={() => {
                                                if (image.isNew) {
                                                    setDeliveryFormData((prev) => {
                                                    const updated = [...prev.receipt_pictures];
                                                    updated[index] = { ...updated[index], loading: false };
                                                    return { ...prev, receipt_pictures: updated };
                                                    });
                                                }
                                                }}
                                            />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                            className={`truncate text-sm ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                            )}`}
                                            >
                                            {formatFileName(image.name)}
                                            </p>
                                            <div className="flex justify-between items-center text-xs">
                                            <p
                                                className={`${getDarkModeClass(
                                                darkMode,
                                                "text-gray-500",
                                                "text-gray-500"
                                                )}`}
                                            >
                                                {image.size ? formatFileSize(image.size) : ""}
                                            </p>
                                            {image.estimatedTime && (
                                                <p
                                                className={`${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-400",
                                                    "text-gray-500"
                                                )}`}
                                                >
                                                {image.estimatedTime}s remaining
                                                </p>
                                            )}
                                            </div>
                                            {image.loading && (
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                <div
                                                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                                                style={{ width: `${image.progress}%` }}
                                                />
                                            </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeReceiptImage(index, "receipt_pictures");
                                            }}
                                            className={`p-1 rounded-full ml-2 ${getDarkModeClass(
                                            darkMode,
                                            "hover:bg-gray-600",
                                            "hover:bg-gray-200"
                                            )}`}
                                            disabled={image.loading}
                                            aria-label={image.markedForDeletion ? "Restore image" : "Remove image"}
                                        >
                                            {image.markedForDeletion ? (
                                            <svg
                                                className="w-5 h-5 text-green-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M12 4v16" />
                                            </svg>
                                            ) : (
                                            <svg
                                                className={`w-5 h-5 ${image.loading ? "text-gray-400" : "text-gray-500"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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

                        {/* Footer */}
                        <div
                            className={`rounded-b-2xl p-6 flex justify-end items-center space-x-4 sticky bottom-0 z-10 ${getDarkModeClass(
                            darkMode,
                            "bg-gray-900",
                            "bg-white"
                            )}`}
                        >

                            {(deliveryFormData.delivery === '1' || deliveryFormData.delivery === 1) && (
                                <button
                                    type="button"
                                    onClick={handleUncheck}
                                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition duration-200 shadow-md flex items-center justify-center`}
                                    disabled={isLoadingUncheck} // Use isLoadingUncheck
                                >
                                    {isLoadingUncheck ? ( // Use isLoadingUncheck
                                        <Spinner
                                            width="16px"
                                            height="16px"
                                            color={darkMode ? "#ff8800" : "#ff8800"}
                                        />
                                    ) : (
                                        t("list_pis.uncheck")
                                    )}
                                    {isLoadingUncheck ? t("proccessing") : ''}
                                </button>
                            )}

                            <button
                            type="button"
                            onClick={closeDeliveryPopup}
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition duration-200 ${getDarkModeClass(
                                darkMode,
                                "bg-gray-700 text-gray-300 hover:bg-gray-600",
                                "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}`}
                            >
                            {t("cancel")} (ESC)
                            </button>
                            <button
                                type="submit"
                                form="delivery-form"
                                className={`px-6 py-2.5 rounded-lg font-semibold text-sm border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition duration-200 shadow-md flex items-center justify-center`}
                                disabled={isLoadingdelivery}
                            >
                                {isLoadingdelivery ? (
                                    <Spinner
                                        width="16px"
                                        height="16px"
                                        color={darkMode ? "#ffffff" : "#ff8800"}
                                    />
                                ) : (
                                    `${t("save")}`
                                )}
                                {isLoadingdelivery ? t("saving") : ' (CTRL + ENTER)'}
                            </button>
                        </div>
                        </div>
                    </div>
                )}
                {isPopupOpen && (
                    <div
                        id="edit-pi-popup"
                        className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
                        isPopupOpen ? "bg-opacity-60 opacity-100 visible" : "bg-opacity-0 opacity-0 invisible"
                        }`}
                    >
                        <div
                            className={` shadow-2xl w-full h-full flex flex-col transform transition-all duration-300 ease-in-out ${getDarkModeClass(
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
                            className={`p-6 pt-1 pb-1 sticky top-0 z-10 rounded-t-xl ${getDarkModeClass(
                            darkMode,
                            "bg-[#1A1A1A]",
                            "bg-white"
                            )}`}
                        >
                            <h2
                                className={`uppercase text-sm font-bold mb-1 flex items-center ${getDarkModeClass(
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                {t("list_pis.edit_purchase_invoice")}
                            </h2>
                        </div>
                        <div className="flex-1 text-[11px] overflow-y-auto p-6 pt-0 custom-scrollbar">
                                <form id="edit-pi-form" className="space-y-6"
                                    onSubmit={handleSubmit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.ctrlKey && e.target.tagName.toLowerCase() !== 'textarea') {
                                        e.preventDefault(); // Prevent form submission on Enter (unless Ctrl+Enter or in textarea)
                                        }
                                    }}
                                    >
                                    {/* Row 1: 4-column layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <input type="hidden" value={currentPI?.id || ''} name="id" id="id" className='text-black'/>
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.pi_number")}
                                            </label>
                                            <input
                                                type="text"
                                                name="pi_number"
                                                value={formData.pi_number}
                                                onChange={(e) => {
                                                    if (hasUpdatePiNumberPermission) {
                                                        setFormData({ ...formData, pi_number: e.target.value });
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (!hasUpdatePiNumberPermission) {
                                                        e.preventDefault(); // Prevent key input
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    if (!hasUpdatePiNumberPermission) {
                                                        e.preventDefault(); // Prevent pasting
                                                    }
                                                }}
                                                readOnly={!hasUpdatePiNumberPermission}
                                                className={`w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("list_pis.pi_number")}
                                            />
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.pi_name_en")}
                                            </label>
                                            <input
                                                type="text"
                                                name="pi_name_en"
                                                value={formData.pi_name_en}
                                                onChange={(e) => setFormData({ ...formData, pi_name_en: e.target.value })}
                                                className={`w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("list_pis.enter_pi_name_en")}
                                            />
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.pi_name_cn")}
                                            </label>
                                            <input
                                                type="text"
                                                name="pi_name_cn"
                                                value={formData.pi_name_cn}
                                                onChange={(e) => setFormData({ ...formData, pi_name_cn: e.target.value })}
                                                className={`w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("list_pis.enter_pi_name_cn")}
                                            />
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.date")}
                                            </label>
                                            <MuiStyleDatePicker
                                                value={formData.date}
                                                onChange={(value) => setFormData({ ...formData, date: value })}
                                                darkMode={darkMode}
                                                style={{
                                                    border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                                                    borderRadius: '0.375rem',
                                                    backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                                                }}
                                            />
                                            <label
                                                className={`uppercase block font-medium mt-2 mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.ctn")}
                                            </label>
                                            <input
                                                type="text"
                                                name="ctn"
                                                value={formData.ctn}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (isValidInput(value)) {
                                                        setFormData({ ...formData, ctn: value });
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && formData.ctn.startsWith('=')) {
                                                        e.preventDefault();
                                                        try {
                                                            const result = evaluateExpression(formData.ctn);
                                                            setFormData({ ...formData, ctn: result });
                                                        } catch (error) {

                                                        }
                                                    }
                                                }}
                                                className={`w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("list_pis.enter_ctn")}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.receipt_number")}
                                            </label>
                                            <input
                                                type="text"
                                                name="receipt_number"
                                                value={formData.receipt_number}
                                                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                                                className={`w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("list_pis.receipt_number")}
                                            />
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.shipment_by")}
                                            </label>
                                            <DropdownInput
                                                name="shipment_by"
                                                value={formData.shipment_id}
                                                onChange={(e) => setFormData({ ...formData, shipment_id: e.target.value })}
                                                placeholder={t('list_pis.enter_shipment_by')}
                                                options={shipments.map(s => ({ id: s.id, name: s.name }))} // Pass id and name
                                                darkMode={darkMode}
                                            />
                                            <label
                                                className={`uppercase block font-medium mb-1 mt-2 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.shipping_method")}
                                            </label>
                                            <DropdownInput
                                                name="shipping_method"
                                                value={formData.shipping_method}
                                                onChange={(e) => setFormData({ ...formData, shipping_method: e.target.value })}
                                                placeholder={t('list_pis.shipping_method')}
                                                options={methods.map(m => ({ id: m.id, name: m.name }))} // Pass id and name
                                                darkMode={darkMode}
                                            />
                                            <label
                                                className={`uppercase block font-medium mb-1 mt-2 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.arrival_date")}
                                            </label>
                                            <MuiStyleDatePicker
                                                value={formData.arrival_date}
                                                onChange={(value) => setFormData({ ...formData, arrival_date: value })}
                                                darkMode={darkMode}
                                                style={{
                                                    border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                                                    borderRadius: '0.375rem',
                                                    backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                                                }}
                                            />
                                            <label
                                                className={`uppercase block font-medium mt-2 mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.company")}
                                                {formData.arrival_date}
                                            </label>
                                            <DropdownInput
                                                name="company"
                                                value={formData.company_id}
                                                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                                placeholder={t('list_pis.enter_company')}
                                                options={companies.map(c => ({ id: c.id, name: c.name }))} // Pass id and name
                                                darkMode={darkMode}
                                            />
                                        </div>

                                        <div>

                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.tracking_number")}
                                            </label>
                                            <input
                                                type="text"
                                                name="tracking_number"
                                                value={formData.tracking_number}
                                                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                                                className={`w-full border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("list_pis.tracking_number")}
                                            />
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.total")}
                                            </label>
                                            <div className="relative mb-2">
                                                <input
                                                    type="text"
                                                    name="total"
                                                    value={formData.total}
                                                    readOnly
                                                    className={`w-full border rounded-lg pr-6 p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                        "bg-white text-gray-900 border-gray-200"
                                                    )}`}
                                                    placeholder={t("list_pis.total")}
                                                />
                                                <span
                                                    className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-400",
                                                        "text-gray-500"
                                                    )}`}
                                                >
                                                    $
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="w-full">
                                                    <label
                                                        className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-300",
                                                            "text-gray-700"
                                                        )}`}
                                                    >
                                                        {t("list_pis.discount")}
                                                    </label>
                                                    <div className="relative mb-2">
                                                        <input
                                                            type="text"
                                                            name="discount"
                                                            value={formData.discount}
                                                            readOnly={hasCheckboxChecked} // Set readOnly based on hasCheckboxChecked
                                                            onChange={(e) => {
                                                                if (!hasCheckboxChecked) {
                                                                    const value = e.target.value;
                                                                    if (isValidInput(value)) {
                                                                        setFormData({ ...formData, discount: value });
                                                                    }
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (!hasCheckboxChecked && e.key === 'Enter' && formData.discount.startsWith('=')) {
                                                                    e.preventDefault();
                                                                    try {
                                                                        const result = evaluateExpression(formData.discount);
                                                                        setFormData({ ...formData, discount: result });
                                                                    } catch (error) {

                                                                    }
                                                                }
                                                            }}
                                                            className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                            )} ${hasCheckboxChecked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            placeholder={t("list_pis.discount")}
                                                        />
                                                        <span
                                                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getDarkModeClass(
                                                                darkMode,
                                                                "text-gray-400",
                                                                "text-gray-500"
                                                            )}`}
                                                        >
                                                            $
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full">
                                                    <label
                                                        className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-300",
                                                            "text-gray-700"
                                                        )}`}
                                                    >
                                                        {t("list_pis.extracharge")}
                                                    </label>
                                                    <div className="relative mb-2">
                                                        <input
                                                            type="text"
                                                            name="extra_charge"
                                                            value={formData.extra_charge}
                                                            readOnly={hasCheckboxChecked} // Set readOnly based on hasCheckboxChecked
                                                            onChange={(e) => {
                                                                if (!hasCheckboxChecked) {
                                                                    const value = e.target.value;
                                                                    if (isValidInput(value)) {
                                                                        setFormData({ ...formData, extra_charge: value });
                                                                    }
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (!hasCheckboxChecked && e.key === 'Enter' && formData.extra_charge.startsWith('=')) {
                                                                    e.preventDefault();
                                                                    try {
                                                                        const result = evaluateExpression(formData.extra_charge);
                                                                        setFormData({ ...formData, extra_charge: result });
                                                                    } catch (error) {
                                                                        showErrorAlert({
                                                                            title: t('error'),
                                                                            message: t('list_pis.invalid_expression'),
                                                                            darkMode: darkMode,
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                            className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                            )} ${hasCheckboxChecked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            placeholder={t("list_pis.extracharge")}
                                                        />
                                                        <span
                                                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getDarkModeClass(
                                                                darkMode,
                                                                "text-gray-400",
                                                                "text-gray-500"
                                                            )}`}
                                                        >
                                                            $
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-300",
                                                    "text-gray-700"
                                                )}`}
                                            >
                                                {t("list_pis.remark")}
                                            </label>
                                            <textarea
                                                name="remark"
                                                value={formData.remark}
                                                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                                className={`w-full h-[31%] border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                    "bg-white text-gray-900 border-gray-200"
                                                )}`}
                                                placeholder={t("list_pis.remark")}
                                            />
                                        </div>

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
                                                    ref={thumbnailInputRef} // Add ref
                                                    onChange={(e) => handleThumbnailChange(e.target.files)}
                                                />
                                            </div>
                                            <div className="h-[175px] custom-scrollbar overflow-auto mt-3 p-2">
                                            <div id="thumbnail-preview-col4" className="space-y-2">
                                                {thumbnails.map((thumbnail, index) => (
                                                <div
                                                    key={`thumbnail-col4-${thumbnail.id}`}
                                                    className={`flex items-center p-1 rounded-lg border transition-all duration-200 ${
                                                    thumbnail.markedForDeletion
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
                                                        data-kheng-chetra={`reference-pidetail-${currentPI.id}`}
                                                        onLoad={() => {
                                                            // Mark as loaded if this is a new image
                                                            if (thumbnail.isNew) {
                                                            setThumbnails(prev => prev.map(t =>
                                                                t.id === thumbnail.id ? {...t, loading: false} : t
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
                                                        removeThumbnail(index);
                                                    }}
                                                    className={`p-1 rounded-full ml-2 ${
                                                        getDarkModeClass(
                                                        darkMode,
                                                        'hover:bg-gray-600',
                                                        'hover:bg-gray-200'
                                                        )
                                                    }`}
                                                    disabled={thumbnail.loading}
                                                    aria-label={thumbnail.markedForDeletion ? 'Restore image' : 'Remove image'}
                                                    >
                                                    {thumbnail.markedForDeletion ? (
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
                                    </div>

                                    {/* Row 2: Table */}
                                    <div className="overflow-x-auto">
                                        <table className="text-[10px] w-full border-collapse">
                                            <thead>
                                                <tr
                                                    className={`uppercase font-medium ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-gray-800 text-gray-300",
                                                        "bg-[#ff8800] text-white"
                                                    )}`}
                                                >
                                                    <th className="p-3 text-left">{t("list_pis.photo")}</th>
                                                    <th className="p-3 text-left">{t("list_pis.code")}</th>
                                                    <th className="p-3 text-left">{t("list_pis.name")}</th>
                                                    <th className="p-3 text-left">{t("list_pis.ctn")}</th>
                                                    <th className="p-3 text-left">{t("list_pis.qty")}</th>
                                                    <th className="p-3 text-left">{t("list_pis.price")}</th>
                                                    <th className="p-3 text-left">{t("list_pis.total")}</th>
                                                    <th className="p-3 text-left">{t("list_pis.progress")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productData[currentPI?.id]?.map((product, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b ${getDarkModeClass(
                                                            darkMode,
                                                            "border-gray-700 hover:bg-gray-700",
                                                            "border-gray-200 hover:bg-gray-50"
                                                        )}`}
                                                    >
                                                        <td className="p-3">
                                                            {product.photo ? (
                                                                <img
                                                                    src={`/storage/${product.photo}`}
                                                                    className="w-12 h-12 object-cover cursor-pointer rounded"
                                                                    data-kheng-chetra={`product-pidetail-${currentPI.id}`}
                                                                />
                                                            ) : (
                                                                <NoImageComponent
                                                                    darkMode={darkMode}
                                                                    width="3rem"
                                                                    height="3rem"
                                                                    borderRadius="0.375rem"
                                                                    fontSize="10px"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {product.code ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.code}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-Purple ${getDarkModeClass(
                                                                                darkMode,
                                                                                "label-Purple-darkmode",
                                                                                ""
                                                                            )}`}
                                                                            data-belly-caption={product.code}
                                                                        >
                                                                            {product.code && product.code.length > 15
                                                                                ? `${product.code.substring(0, 12)}...`
                                                                                : product.code || ""}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td
                                                            className="p-1 pr-3 pl-3 flex flex-col items-start gap-1"
                                                            >
                                                            {product.name_en ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.name_en}>
                                                                <Bellypopover darkMode={darkMode}>
                                                                    <span
                                                                    className={`label-green ${darkMode ? "label-green-darkmode" : ""} inline-block w-auto`}
                                                                    data-belly-caption={product.name_en}
                                                                    >
                                                                    {product.name_en.length > 15 ? `${product.name_en.substring(0, 12)}...` : product.name_en}
                                                                    </span>
                                                                </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                            {product.name_kh ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.name_kh}>
                                                                <Bellypopover darkMode={darkMode}>
                                                                    <span
                                                                    className={`label-pink ${darkMode ? "label-pink-darkmode" : ""} inline-block w-auto`}
                                                                    data-belly-caption={product.name_kh}
                                                                    >
                                                                    {product.name_kh.length > 15 ? `${product.name_kh.substring(0, 12)}...` : product.name_kh}
                                                                    </span>
                                                                </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                            {product.name_cn ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={product.name_cn}>
                                                                <Bellypopover darkMode={darkMode}>
                                                                    <span
                                                                    className={`label-blue ${darkMode ? "label-blue-darkmode" : ""} inline-block w-auto`}
                                                                    data-belly-caption={product.name_cn}
                                                                    >
                                                                    {product.name_cn.length > 15 ? `${product.name_cn.substring(0, 12)}...` : product.name_cn}
                                                                    </span>
                                                                </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={product.ctn}
                                                                readOnly={hasCheckboxChecked} // Set readOnly based on hasCheckboxChecked
                                                                onChange={(e) => {
                                                                    if (!hasCheckboxChecked) {
                                                                        const value = e.target.value;
                                                                        if (isValidInput(value)) {
                                                                            const newProductData = { ...productData };
                                                                            newProductData[currentPI.id][index].ctn = value;
                                                                            setProductData(newProductData);
                                                                            // Update formData.ctn with the new sum
                                                                            const newSum = calculateCartonSum(newProductData[currentPI.id]);
                                                                            setFormData((prev) => ({ ...prev, ctn: newSum }));
                                                                        }
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (!hasCheckboxChecked && e.key === 'Enter' && product.ctn.startsWith('=')) {
                                                                        e.preventDefault();
                                                                        try {
                                                                            const result = evaluateExpression(product.ctn);
                                                                            const newProductData = { ...productData };
                                                                            newProductData[currentPI.id][index].ctn = result;
                                                                            setProductData(newProductData);
                                                                            // Update formData.ctn with the new sum
                                                                            const newSum = calculateCartonSum(newProductData[currentPI.id]);
                                                                            setFormData((prev) => ({ ...prev, ctn: newSum }));
                                                                        } catch (error) {
                                                                            showErrorAlert({
                                                                                title: t('error'),
                                                                                message: t('list_pis.invalid_expression'),
                                                                                darkMode: darkMode,
                                                                            });
                                                                        }
                                                                    }
                                                                }}
                                                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                    "bg-white text-gray-900 border-gray-200"
                                                                )} ${hasCheckboxChecked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={product.qty}
                                                                readOnly={hasCheckboxChecked} // Set readOnly based on hasCheckboxChecked
                                                                onChange={(e) => {
                                                                    if (!hasCheckboxChecked) {
                                                                        const value = e.target.value;
                                                                        if (isValidInput(value)) {
                                                                            const newProductData = { ...productData };
                                                                            newProductData[currentPI.id][index].qty = value;
                                                                            const qty = parseFloat(value) || 0;
                                                                            const price =
                                                                                parseFloat(newProductData[currentPI.id][index].price) ||
                                                                                0;
                                                                            newProductData[currentPI.id][index].total = (
                                                                                qty * price
                                                                            ).toFixed(3);
                                                                            setProductData(newProductData);
                                                                            calculateTotals(newProductData);
                                                                        }
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (!hasCheckboxChecked && e.key === 'Enter' && product.qty.startsWith('=')) {
                                                                        e.preventDefault();
                                                                        try {
                                                                            const result = evaluateExpression(product.qty);
                                                                            const newProductData = { ...productData };
                                                                            newProductData[currentPI.id][index].qty = result;
                                                                            const qty = parseFloat(result) || 0;
                                                                            const price = parseFloat(newProductData[currentPI.id][index].price) || 0;
                                                                            newProductData[currentPI.id][index].total = (qty * price).toFixed(3);
                                                                            setProductData(newProductData);
                                                                            calculateTotals(newProductData);
                                                                        } catch (error) {
                                                                            showErrorAlert({
                                                                                title: t('error'),
                                                                                message: t('list_pis.invalid_expression'),
                                                                                darkMode: darkMode,
                                                                            });
                                                                        }
                                                                    }
                                                                }}
                                                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                    "bg-white text-gray-900 border-gray-200"
                                                                )} ${hasCheckboxChecked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={product.price}
                                                                    readOnly={hasCheckboxChecked} // Set readOnly based on hasCheckboxChecked
                                                                    onChange={(e) => {
                                                                        if (!hasCheckboxChecked) {
                                                                            const value = e.target.value;
                                                                            if (isValidInput(value)) {
                                                                                const newProductData = { ...productData };
                                                                                newProductData[currentPI.id][index].price = value;
                                                                                const price = parseFloat(value) || 0;
                                                                                const qty =
                                                                                    parseFloat(
                                                                                        newProductData[currentPI.id][index].qty
                                                                                    ) || 0;
                                                                                newProductData[currentPI.id][index].total = (
                                                                                    qty * price
                                                                                ).toFixed(3);
                                                                                setProductData(newProductData);
                                                                                calculateTotals(newProductData);
                                                                            }
                                                                        }
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (!hasCheckboxChecked && e.key === 'Enter' && product.price.startsWith('=')) {
                                                                            e.preventDefault();
                                                                            try {
                                                                                const result = evaluateExpression(product.price);
                                                                                const newProductData = { ...productData };
                                                                                newProductData[currentPI.id][index].price = result;
                                                                                const price = parseFloat(result) || 0;
                                                                                const qty = parseFloat(newProductData[currentPI.id][index].qty) || 0;
                                                                                newProductData[currentPI.id][index].total = (qty * price).toFixed(3);
                                                                                setProductData(newProductData);
                                                                                calculateTotals(newProductData);
                                                                            } catch (error) {
                                                                                showErrorAlert({
                                                                                    title: t('error'),
                                                                                    message: t('list_pis.invalid_expression'),
                                                                                    darkMode: darkMode,
                                                                                });
                                                                            }
                                                                        }
                                                                    }}
                                                                    className={`w-full border rounded-lg pr-6 p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                        "bg-white text-gray-900 border-gray-200"
                                                                    )} ${hasCheckboxChecked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                                />
                                                                <span
                                                                    className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "text-gray-400",
                                                                        "text-gray-500"
                                                                    )}`}
                                                                >
                                                                    $
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={product.total}
                                                                    readOnly={hasCheckboxChecked} // Set readOnly based on hasCheckboxChecked
                                                                    onChange={(e) => {
                                                                        if (!hasCheckboxChecked) {
                                                                            const value = e.target.value;
                                                                            if (isValidInput(value)) {
                                                                                const newProductData = { ...productData };
                                                                                newProductData[currentPI.id][index].total = value;
                                                                                const total = parseFloat(value) || 0;
                                                                                const qty =
                                                                                    parseFloat(
                                                                                        newProductData[currentPI.id][index].qty
                                                                                    ) || 0;
                                                                                if (qty > 0) {
                                                                                    newProductData[currentPI.id][index].price = (
                                                                                        total / qty
                                                                                    ).toFixed(3);
                                                                                }
                                                                                setProductData(newProductData);
                                                                                calculateTotals(newProductData);
                                                                            }
                                                                        }
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (!hasCheckboxChecked && e.key === 'Enter' && product.total.startsWith('=')) {
                                                                            e.preventDefault();
                                                                            try {
                                                                                const result = evaluateExpression(product.total);
                                                                                const newProductData = { ...productData };
                                                                                newProductData[currentPI.id][index].total = result;
                                                                                const total = parseFloat(result) || 0;
                                                                                const qty = parseFloat(newProductData[currentPI.id][index].qty) || 0;
                                                                                if (qty > 0) {
                                                                                    newProductData[currentPI.id][index].price = (total / qty).toFixed(3);
                                                                                }
                                                                                setProductData(newProductData);
                                                                                calculateTotals(newProductData);
                                                                            } catch (error) {
                                                                                showErrorAlert({
                                                                                    title: t('error'),
                                                                                    message: t('list_pis.invalid_expression'),
                                                                                    darkMode: darkMode,
                                                                                });
                                                                            }
                                                                        }
                                                                    }}
                                                                    className={`w-full border rounded-lg pr-6 p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                        "bg-white text-gray-900 border-gray-200"
                                                                    )} ${hasCheckboxChecked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                                />
                                                                <span
                                                                    className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "text-gray-400",
                                                                        "text-gray-500"
                                                                    )}`}
                                                                >
                                                                    $
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <CustomRangeSlider
                                                                value={product.progress}
                                                                darkMode={darkMode}
                                                                onChange={(e) => {
                                                                    const newProductData = { ...productData };
                                                                    newProductData[currentPI.id][index].progress =
                                                                        e.target.value;
                                                                    setProductData(newProductData);
                                                                }}
                                                                max={2}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </form>
                        </div>
                        <div
                            className={`rounded-b-xl p-6 pb-1 pt-0 flex justify-end items-center space-x-4 sticky bottom-0 z-10 ${getDarkModeClass(
                                darkMode,
                                "bg-[#1A1A1A]",
                                "bg-white"
                            )}`}
                        >
                            <div className="flex justify-start items-center w-[50%]">
                                <button
                                    type="button"
                                    id='duplicate'
                                    onClick={handleDuplicate}
                                    className={`border flex items-center justify-center ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md`}
                                >
                                    {t("list_pis.duplicate")}
                                    <HiOutlineDuplicate />
                                </button>
                            </div>
                            <div className="flex justify-end items-center w-[50%] space-x-4">
                                <button
                                    type="button"
                                    id="cancel-btn"
                                    onClick={closePopup}
                                    className={`${getDarkModeClass(
                                        darkMode,
                                        "bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]",
                                        "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 sombra-sm`}
                                >
                                    {t("cancel")} (ESC)
                                </button>
                                <button
                                    type="submit"
                                    form="edit-pi-form"
                                    disabled={isSubmitting}
                                    className={`border flex items-center justify-center ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <Spinner width="16px" height="16px" className="mr-2" color={darkMode ? "#ffffff" : "#ffffff"} />
                                    ) : (
                                        t("save")
                                    )}
                                    {isSubmitting ? t("saving") : ' (CTRL + ENTER)'}
                                </button>
                            </div>
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ListPI.title = "pi";
ListPI.subtitle = "list_pi";
