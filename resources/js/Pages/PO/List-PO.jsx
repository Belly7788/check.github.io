import { Link, Head, router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { GoArrowUp } from "react-icons/go";
import { PiLineVerticalThin } from "react-icons/pi";
import { CgMoreVerticalAlt } from "react-icons/cg";
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
import MuiStyleDatePicker from "../../BELLY/Component/DatePicker/DatePicker";
import { checkPermission } from '../../utils/permissionUtils';

export default function ListPO({ darkMode, purchaseOrders, filters }) {
    const { t } = useTranslation();

    // State declarations
    const [data, setData] = useState(purchaseOrders.data);
    const [pagination, setPagination] = useState({
        currentPage: purchaseOrders.current_page,
        perPage: purchaseOrders.per_page,
        total: purchaseOrders.total,
    });
    const [currentPage, setCurrentPage] = useState(pagination.currentPage);
    const [entriesPerPage, setEntriesPerPage] = useState(pagination.perPage);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [columnSearchQuery, setColumnSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPO, setCurrentPO] = useState(null);
    const [openActionDropdown, setOpenActionDropdown] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [loadedImages, setLoadedImages] = useState({});
    const [selectedPOs, setSelectedPOs] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        remark: '',
        rating: 0,
    });
    const [sortField, setSortField] = useState(filters.sort_field || null);
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');
    const [isRatingPopupOpen, setIsRatingPopupOpen] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    // Updated: Ensure checkedRatings is initialized with numbers and defaults to [1, 2, 3, 4, 5]
    const [checkedRatings, setCheckedRatings] = useState(
        Array.isArray(filters.rating) && filters.rating.length > 0
            ? filters.rating.map(Number)
            : [1, 2, 3, 4, 5]
    );
    const ratingHeaderRef = useRef(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

    // Date popup states
    const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
    const [isDateAnimatingOut, setIsDateAnimatingOut] = useState(false);
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const dateHeaderRef = useRef(null);
    const [datePopupPosition, setDatePopupPosition] = useState({ top: 0, left: 0 });

    // Order popup states
    const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
    const [isOrderAnimatingOut, setIsOrderAnimatingOut] = useState(false);
    const [checkedOrderStatuses, setCheckedOrderStatuses] = useState(
        filters.order_status ? filters.order_status.map(status => status ? 1 : 0) : [1, 0]
    );
    const orderHeaderRef = useRef(null);
    const [orderPopupPosition, setOrderPopupPosition] = useState({ top: 0, left: 0 });

    // Settings popup states
    const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false);
    const [isSettingAnimatingOut, setIsSettingAnimatingOut] = useState(false);
    const settingHeaderRef = useRef(null);
    const [settingPopupPosition, setSettingPopupPosition] = useState({ top: 0, left: 0 });

    // New state to track loading status for each PO's order checkbox
    const [checkboxLoading, setCheckboxLoading] = useState({});

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState({
        checkbox: true,
        no: true,
        photo: true,
        product_code: true,
        name: true,
        date: true,
        amount: true,
        remark: true,
        rating: true,
        order: true,
    });

    // Column widths
    const [columnWidths, setColumnWidths] = useState({
        checkbox: 20,
        no: 50,
        photo: 80,
        product_code: 120,
        name: 150,
        date: 120,
        amount: 100,
        remark: 200,
        rating: 120,
        order: 50,
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

    // Update pagination when purchaseOrders change
    useEffect(() => {
        setPagination({
            currentPage: purchaseOrders.current_page,
            perPage: purchaseOrders.per_page,
            total: purchaseOrders.total,
        });
        setData(purchaseOrders.data);
    }, [purchaseOrders]);

    // Updated: Debug initial filters.rating and checkedRatings
    useEffect(() => {
        console.log('Initial filters.rating:', filters.rating);
        console.log('Initial checkedRatings:', checkedRatings);
    }, []);

    // Apply filters and sorting
    const applyFilters = () => {
        console.log('Order Statuses:', checkedOrderStatuses);
        setIsLoading(true);
        router.get(
            '/po/list',
            {
                search: searchQuery,
                per_page: entriesPerPage,
                page: currentPage,
                sort_field: sortField,
                sort_direction: sortDirection,
                rating: checkedRatings,
                start_date: startDate,
                end_date: endDate,
                order_status: checkedOrderStatuses,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setData(page.props.purchaseOrders.data);
                    setPagination({
                        currentPage: page.props.purchaseOrders.current_page,
                        perPage: page.props.purchaseOrders.per_page,
                        total: page.props.purchaseOrders.total,
                    });
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                    showErrorAlert({
                        title: t("error"),
                        message: t("list_pos.failed_to_filter"),
                        darkMode,
                    });
                },
            }
        );
    };

    // Sort and helper functions
    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        setIsLoading(true);
        router.get(
            '/po/list',
            {
                search: searchQuery,
                per_page: entriesPerPage,
                page: currentPage,
                sort_field: field,
                sort_direction: newDirection,
                rating: checkedRatings,
                start_date: startDate,
                end_date: endDate,
                order_status: checkedOrderStatuses,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setData(page.props.purchaseOrders.data);
                    setPagination({
                        currentPage: page.props.purchaseOrders.current_page,
                        perPage: page.props.purchaseOrders.per_page,
                        total: page.props.purchaseOrders.total,
                    });
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                    showErrorAlert({
                        title: t("error"),
                        message: t("list_pos.failed_to_sort"),
                        darkMode,
                    });
                },
            }
        );
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderStars = (rating) => {
    // console.log('renderStars called with rating:', rating);
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
            <svg
                key={i}
                className={`w-5 h-5 ${i <= rating ? (darkMode ? 'text-[#facc15]' : 'text-black') : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            );
        }
        return stars;
    };

    const renderCheckboxStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`w-4 h-4 ${i <= rating ? (darkMode ? 'text-[#facc15]' : 'text-black') : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            );
        }
        return stars;
    };

    const handleStarClick = (rating) => {
        setFormData({ ...formData, rating });
    };

    // Handler for toggling settings popup
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
            if (settingHeaderRef.current) {
                const rect = settingHeaderRef.current.querySelector('.cursor-pointer').getBoundingClientRect();
                setSettingPopupPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + rect.width / 2 + window.scrollX,
                });
            }
            setIsSettingPopupOpen(true);
        }
    };

    // Handler for toggling column visibility
    const handleColumnVisibilityChange = (columnKey) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    };

    // Handler for resetting column visibility
    const handleResetColumns = () => {
        setVisibleColumns({
            checkbox: true,
            no: true,
            photo: true,
            code: true,
            name: true,
            date: true,
            amount: true,
            remark: true,
            rating: true,
            order: true,
        });
    };

    // Handlers for CRUD operations
    const openEditPopup = (po) => {
        setIsEditing(po.id);
        setIsEditMode(true);
        setCurrentPO(po);
        setFormData({
            amount: po.amount || '',
            remark: po.remark || '',
            rating: po.rating || 0,
        });
        setIsPopupOpen(true);
        setIsEditing(null);
    };

    const closePopup = () => {
        // Check if there are any changes in the form
        const hasChanges =
            formData.amount ||
            formData.remark ||
            formData.rating > 0;

        // Skip confirm alert if submission was successful
        if (isSubmittingSuccessfully) {
            setIsSubmittingSuccessfully(false); // Reset the flag
            setIsPopupOpen(false);
            setCurrentPO(null);
            setIsEditMode(false);
            setFormData({
                amount: '',
                remark: '',
                rating: 0,
            });
            return;
        }

        // If there are changes and not submitting successfully, show confirmation alert
        if (hasChanges) {
            showConfirmAlert({
                title: t("confirm_close_title"),
                message: t("confirm_close_popup"),
                darkMode,
                onConfirm: () => {
                    setIsPopupOpen(false);
                    setCurrentPO(null);
                    setIsEditMode(false);
                    setFormData({
                        amount: '',
                        remark: '',
                        rating: 0,
                    });
                },
                onCancel: () => {
                    // Do nothing, keep the popup open
                },
            });
        } else {
            // If no changes, close the popup directly
            setIsPopupOpen(false);
            setCurrentPO(null);
            setIsEditMode(false);
            setFormData({
                amount: '',
                remark: '',
                rating: 0,
            });
        }
    };


    const view_po = 18;
    useEffect(() => {
        checkPermission(view_po, (hasPermission) => {
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


    const update_po = 17;
    const [isSubmittingSuccessfully, setIsSubmittingSuccessfully] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        checkPermission(update_po, async (hasPermission) => {
            if (!hasPermission) {
                await showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }
            if (!formData.amount && !formData.remark && formData.rating === 0) {
                showErrorAlert({
                    title: t("error"),
                    message: t("list_pos.please_fill_at_least_one_field"),
                    darkMode,
                });
                return;
            }
            setIsSubmitting(true);

            router.put(`/po/${currentPO.id}`, formData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setIsSubmittingSuccessfully(true); // Set flag to true
                    setIsPopupOpen(false); // Close popup directly
                    setCurrentPO(null);
                    setIsEditMode(false);
                    setFormData({
                        amount: '',
                        remark: '',
                        rating: 0,
                    });
                    showSuccessAlert({
                        title: t("success"),
                        message: t("list_pos.po_updated_successfully"),
                        darkMode,
                        timeout: 3000,
                    });
                    setData((prev) =>
                        prev.map((po) =>
                            po.id === currentPO.id ? { ...po, ...formData } : po
                        )
                    );
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    showErrorAlert({
                        title: t("error"),
                        message: Object.values(errors).join(", ") || t("list_pos.failed_to_update"),
                        darkMode,
                    });
                },
                preserveScroll: true,
            });
        });
    };

    const delete_po = 19;
    const handleDelete = (id) => {
        checkPermission(delete_po, (hasPermission) => {
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
                message: t("list_pos.confirm_delete_po"),
                darkMode,
                isLoading: isDeleting === id,
                onConfirm: () => {
                    setIsDeleting(id);
                    router.delete(`/po/${id}`, {
                        onSuccess: () => {
                            setIsDeleting(null);
                            showSuccessAlert({
                                title: t("success"),
                                message: t("list_pos.po_deleted_successfully"),
                                darkMode,
                                timeout: 3000,
                            });
                            setData((prev) => prev.filter((po) => po.id !== id));
                        },
                        onError: () => {
                            setIsDeleting(null);
                            showErrorAlert({
                                title: t("error"),
                                message: t("list_pos.failed_to_delete"),
                                darkMode,
                            });
                        },
                        preserveScroll: true,
                    });
                },
            });
        });
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setIsLoading(true);
            router.get(
                '/po/list',
                {
                    search: searchQuery,
                    per_page: entriesPerPage,
                    page: currentPage,
                    sort_field: sortField,
                    sort_direction: sortDirection,
                    rating: checkedRatings,
                    start_date: startDate,
                    end_date: endDate,
                    order_status: checkedOrderStatuses,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setData(page.props.purchaseOrders.data);
                        setPagination({
                            currentPage: page.props.purchaseOrders.current_page,
                            perPage: page.props.purchaseOrders.per_page,
                            total: page.props.purchaseOrders.total,
                        });
                        setIsLoading(false);
                    },
                    onError: () => {
                        setIsLoading(false);
                        showErrorAlert({
                            title: t("error"),
                            message: t("list_pos.failed_to_search"),
                            darkMode,
                        });
                    },
                }
            );
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setIsLoading(true);
        router.get(
            '/po/list',
            {
                search: searchQuery,
                per_page: entriesPerPage,
                page,
                sort_field: sortField,
                sort_direction: sortDirection,
                rating: checkedRatings,
                start_date: startDate,
                end_date: endDate,
                order_status: checkedOrderStatuses,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setData(page.props.purchaseOrders.data);
                    setPagination({
                        currentPage: page.props.purchaseOrders.current_page,
                        perPage: page.props.purchaseOrders.per_page,
                        total: page.props.purchaseOrders.total,
                    });
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
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

        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(newPage);
        setIsLoading(true);
        router.get(
            '/po/list',
            {
                search: searchQuery,
                per_page: newEntriesPerPage,
                page: newPage,
                sort_field: sortField,
                sort_direction: sortDirection,
                rating: checkedRatings,
                start_date: startDate,
                end_date: endDate,
                order_status: checkedOrderStatuses,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setData(page.props.purchaseOrders.data);
                    setPagination({
                        currentPage: page.props.purchaseOrders.current_page,
                        perPage: page.props.purchaseOrders.per_page,
                        total: page.props.purchaseOrders.total,
                    });
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const toggleSelectPO = (id) => {
        setSelectedPOs((prev) =>
            prev.includes(id)
                ? prev.filter((poId) => poId !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedPOs.length === data.length) {
            setSelectedPOs([]);
        } else {
            setSelectedPOs(data.map((po) => po.id));
        }
    };

    const check_po = 20;
    const toggleOrderCheckbox = (id, currentOrder) => {
        checkPermission(check_po, (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }

            // Existing toggle order logic
            setCheckboxLoading((prev) => ({ ...prev, [id]: true })); // Set loading for this PO
            const newOrder = !currentOrder;

            router.post(`/po/${id}/toggle-order`, { order: newOrder }, {
                onSuccess: () => {
                    setData((prev) =>
                        prev.map((po) =>
                            po.id === id ? { ...po, order: newOrder } : po
                        )
                    );
                    showSuccessAlert({
                        title: t("success"),
                        message: t("list_pos.order_updated_successfully"),
                        darkMode,
                        timeout: 3000,
                    });
                    setCheckboxLoading((prev) => ({ ...prev, [id]: false })); // Clear loading
                },
                onError: () => {
                    showErrorAlert({
                        title: t("error"),
                        message: t("list_pos.failed_to_update_order"),
                        darkMode,
                    });
                    setCheckboxLoading((prev) => ({ ...prev, [id]: false })); // Clear loading
                },
                preserveScroll: true,
            });
        });
    };

    const toggleRatingPopup = (e) => {
        e.stopPropagation();
        if (isRatingPopupOpen) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsRatingPopupOpen(false);
                setIsAnimatingOut(false);
            }, 200);
        } else {
            if (ratingHeaderRef.current) {
                const rect = ratingHeaderRef.current.querySelector('.cursor-pointer').getBoundingClientRect();
                setPopupPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + rect.width / 2 + window.scrollX,
                });
            }
            setIsRatingPopupOpen(true);
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
            if (dateHeaderRef.current) {
                const rect = dateHeaderRef.current.querySelector('.cursor-pointer').getBoundingClientRect();
                setDatePopupPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + rect.width / 2 + window.scrollX,
                });
            }
            setIsDatePopupOpen(true);
        }
    };

    const toggleOrderPopup = (e) => {
        e.stopPropagation();
        if (isOrderPopupOpen) {
            setIsOrderAnimatingOut(true);
            setTimeout(() => {
                setIsOrderPopupOpen(false);
                setIsOrderAnimatingOut(false);
            }, 200);
        } else {
            if (orderHeaderRef.current) {
                const rect = orderHeaderRef.current.querySelector('.cursor-pointer').getBoundingClientRect();
                setOrderPopupPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + rect.width / 2 + window.scrollX,
                });
            }
            setIsOrderPopupOpen(true);
        }
    };

    const handleRatingCheckboxChange = (rating) => {
        setCheckedRatings((prev) =>
            prev.includes(rating)
                ? prev.filter((r) => r !== rating)
                : [...prev, rating]
        );
    };

    const handleOrderCheckboxChange = (status) => {
        setCheckedOrderStatuses((prev) =>
            prev.includes(status ? 1 : 0)
                ? prev.filter((s) => s !== (status ? 1 : 0))
                : [...prev, status ? 1 : 0]
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                ratingHeaderRef.current &&
                !ratingHeaderRef.current.contains(event.target) &&
                !event.target.closest(".rating-popup")
            ) {
                setIsAnimatingOut(true);
                setTimeout(() => {
                    setIsRatingPopupOpen(false);
                    setIsAnimatingOut(false);
                }, 200);
            }
            if (
                dateHeaderRef.current &&
                !dateHeaderRef.current.contains(event.target) &&
                !event.target.closest(".date-popup")
            ) {
                setIsDateAnimatingOut(true);
                setTimeout(() => {
                    setIsDatePopupOpen(false);
                    setIsDateAnimatingOut(false);
                }, 200);
            }
            if (
                orderHeaderRef.current &&
                !orderHeaderRef.current.contains(event.target) &&
                !event.target.closest(".order-popup")
            ) {
                setIsOrderAnimatingOut(true);
                setTimeout(() => {
                    setIsOrderPopupOpen(false);
                    setIsOrderAnimatingOut(false);
                }, 200);
            }
            if (
                settingHeaderRef.current &&
                !settingHeaderRef.current.contains(event.target) &&
                !event.target.closest(".setting-popup")
            ) {
                setIsSettingAnimatingOut(true);
                setTimeout(() => {
                    setIsSettingPopupOpen(false);
                    setIsSettingAnimatingOut(false);
                }, 200);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'Enter' && isPopupOpen) {
                handleSubmit(e);
            }
            if (e.key === 'Escape') {
                closePopup();
                if (isRatingPopupOpen) {
                    setIsAnimatingOut(true);
                    setTimeout(() => {
                        setIsRatingPopupOpen(false);
                        setIsAnimatingOut(false);
                    }, 200);
                }
                if (isDatePopupOpen) {
                    setIsDateAnimatingOut(true);
                    setTimeout(() => {
                        setIsDatePopupOpen(false);
                        setIsDateAnimatingOut(false);
                    }, 200);
                }
                if (isOrderPopupOpen) {
                    setIsOrderAnimatingOut(true);
                    setTimeout(() => {
                        setIsOrderPopupOpen(false);
                        setIsOrderAnimatingOut(false);
                    }, 200);
                }
                if (isSettingPopupOpen) {
                    setIsSettingAnimatingOut(true);
                    setTimeout(() => {
                        setIsSettingPopupOpen(false);
                        setIsSettingAnimatingOut(false);
                    }, 200);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPopupOpen, isRatingPopupOpen, isDatePopupOpen, isOrderPopupOpen, isSettingPopupOpen, formData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".action-container")) {
                setOpenActionDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const sortableColumns = [
        { key: 'product_code', label: t("code") },
        { key: 'name', label: t("list_pos.name") },
        { key: 'date', label: t("list_pos.date") },
        { key: 'amount', label: t("list_pos.amount") },
        { key: 'remark', label: t("list_pos.remark") },
        { key: 'rating', label: t("list_pos.rating") },
        { key: 'order', label: t("list_pos.order") },
    ];

    const allColumns = [
        { key: 'checkbox', label: t("list_pos.checkbox") },
        { key: 'no', label: t("no") },
        { key: 'photo', label: t("photo") },
        ...sortableColumns,
    ];

    return (
        <>
            <Head title={t("list_po")} />
            <style>
                {`
                    @keyframes growFromPoint {
                        from {
                            transform: scale(0);
                            opacity: 0;
                        }
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                    @keyframes shrinkToPoint {
                        from {
                            transform: scale(1);
                            opacity: 1;
                        }
                        to {
                            transform: scale(0);
                            opacity: 0;
                        }
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
                        <button
                            className={`border uppercase font-semibold py-2 px-3 rounded-lg transition duration-200 shadow-md flex items-center justify-center gap-2 ${getDarkModeClass(
                                darkMode,
                                "border-[#ff8800] text-[#ff8800] bg-[#2D2D2D] hover:bg-[#ff8800] hover:text-white",
                                "border-[#ff8800] text-[#ff8800] bg-white hover:bg-[#ff8800] hover:text-white"
                            )} ${selectedPOs.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={selectedPOs.length === 0}
                            onClick={() => {
                                if (selectedPOs.length > 0) {
                                // Construct the URL with selected po.id values
                                const idPos = selectedPOs.join('&');
                                const url = `/pi/create?id_pos=${idPos}`;
                                // Open the URL in a new tab
                                window.open(url, '_blank');
                                }
                            }}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                            {t("create_pi")}
                        </button>
                    </div>
                    <div className="relative overflow-x-auto rounded-lg text-sm h-[calc(100vh-14rem)] mx-auto custom-scrollbar">
                        <div className="w-full min-w-max">
                            <table className="w-full border-collapse" ref={tableRef}>
                                <thead>
                                    <tr
                                        className={`uppercase ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] border-b border-gray-700",
                                            "bg-[#ff8800]"
                                        )}`}
                                    >
                                        {visibleColumns.checkbox && (
                                            <th
                                                style={{ width: `${columnWidths.checkbox}px`, minWidth: `${columnWidths.checkbox}px`, maxWidth: `${columnWidths.checkbox}px` }}
                                                className={`p-3 pl-1 text-left sticky top-0 z-10 relative ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300",
                                                    "bg-[#ff8800] text-white"
                                                )}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPOs.length === data.length}
                                                    onChange={toggleSelectAll}
                                                    className="rounded"
                                                />
                                            </th>
                                        )}
                                        {visibleColumns.no && (
                                            <th
                                                style={{ width: `${columnWidths.no}px` }}
                                                className={`p-3 truncate text-left sticky top-0 z-10 relative ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300",
                                                    "bg-[#ff8800] text-white"
                                                )}`}
                                            >
                                                {t("no")}
                                                <PiLineVerticalThin
                                                    className={`absolute right-0 top-0 h-full w-8 cursor-col-resize ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-500 hover:text-blue-400",
                                                        "text-white hover:text-[#696cff]"
                                                    )} hover:scale-150 transition-transform duration-200`}
                                                    onMouseDown={(e) => handleResizeStart(e, 'no')}
                                                />
                                            </th>
                                        )}
                                        {visibleColumns.photo && (
                                            <th
                                                style={{ width: `${columnWidths.photo}px` }}
                                                className={`p-3 truncate text-left sticky top-0 z-10 relative ${getDarkModeClass(
                                                    darkMode,
                                                    "bg-[#2D2D2D] text-gray-300",
                                                    "bg-[#ff8800] text-white"
                                                )}`}
                                            >
                                                {t("photo")}
                                                <PiLineVerticalThin
                                                    className={`absolute right-0 top-0 h-full w-8 cursor-col-resize ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-500 hover:text-blue-400",
                                                        "text-white hover:text-[#696cff]"
                                                    )} hover:scale-150 transition-transform duration-200`}
                                                    onMouseDown={(e) => handleResizeStart(e, 'photo')}
                                                />
                                            </th>
                                        )}
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
                                                                ? ratingHeaderRef
                                                                : column.key === 'date'
                                                                ? dateHeaderRef
                                                                : column.key === 'order'
                                                                ? orderHeaderRef
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
                                                        {(column.key === 'rating' || column.key === 'date' || column.key === 'order') && (
                                                            <span
                                                                className={`ml-1 inline-flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${getDarkModeClass(
                                                                    darkMode,
                                                                    "hover:bg-[#3A3A3A] text-gray-300",
                                                                    "hover:bg-[#e07b00] text-white"
                                                                )}`}
                                                                onClick={
                                                                    column.key === 'rating'
                                                                        ? toggleRatingPopup
                                                                        : column.key === 'date'
                                                                        ? toggleDatePopup
                                                                        : toggleOrderPopup
                                                                }
                                                            >
                                                                <CgMoreVerticalAlt className="w-5 h-5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <PiLineVerticalThin
                                                        className={`absolute right-0 top-0 h-full w-8 cursor-col-resize ${getDarkModeClass(
                                                            darkMode,
                                                            "text-gray-500 hover:text-blue-400",
                                                            "text-white hover:text-[#696cff]"
                                                        )} hover:scale-150 transition-transform duration-200`}
                                                        onMouseDown={(e) => handleResizeStart(e, column.key)}
                                                    />
                                                </th>
                                            )
                                        ))}
                                        <th
                                            style={{ width: `${columnWidths.action}px`, minWidth: `${columnWidths.action}px`, maxWidth: `${columnWidths.action}px` }}
                                            className={`p-3 pr-0 pl-0 text-left sticky top-0 z-10 relative ${getDarkModeClass(
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
                                    <TableLoading darkMode={darkMode} rowCount={entriesPerPage} colCount={Object.keys(visibleColumns).filter(key => visibleColumns[key]).length + 1} />
                                ) : (
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr>
                                                <td colSpan={Object.keys(visibleColumns).filter(key => visibleColumns[key]).length + 1}>
                                                    <NoDataComponent darkMode={darkMode} />
                                                </td>
                                            </tr>
                                        ) : (
                                            data.map((po, index) => (
                                                <tr
                                                    key={po.id}
                                                    className={`border-b cursor-pointer ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                        "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                    )}`}
                                                >
                                                    {visibleColumns.checkbox && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.checkbox}px`,
                                                                minWidth: `${columnWidths.checkbox}px`,
                                                                maxWidth: `${columnWidths.checkbox}px`,
                                                            }}
                                                            className="p-3 pl-1"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPOs.includes(po.id)}
                                                                onChange={() => toggleSelectPO(po.id)}
                                                                className="rounded"
                                                            />
                                                        </td>
                                                    )}
                                                    {visibleColumns.no && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.no}px`,
                                                                minWidth: `${columnWidths.no}px`,
                                                                maxWidth: `${columnWidths.no}px`,
                                                            }}
                                                            className="p-3 truncate-text"
                                                        >
                                                            {(currentPage - 1) * entriesPerPage + index + 1}
                                                        </td>
                                                    )}
                                                    {visibleColumns.photo && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.photo}px`,
                                                                minWidth: `${columnWidths.photo}px`,
                                                                maxWidth: `${columnWidths.photo}px`,
                                                            }}
                                                            className="p-3"
                                                        >
                                                            {po.image ? (
                                                                <div className="relative w-12 h-12">
                                                                    {!loadedImages[po.id] && (
                                                                        <ShimmerLoading
                                                                            darkMode={darkMode}
                                                                            width="3rem"
                                                                            height="3rem"
                                                                            borderRadius="0.25rem"
                                                                            rowCount={1}
                                                                            colCount={1}
                                                                        />
                                                                    )}
                                                                    <img
                                                                        data-kheng-chetra={`belly-gallery-po-default-${po.id}`}
                                                                        src={`/storage/${po.image}`}
                                                                        className={`w-12 h-12 object-cover rounded absolute top-0 left-0 transition-opacity duration-300 ${
                                                                            loadedImages[po.id] ? 'opacity-100' : 'opacity-0'
                                                                        }`}
                                                                        loading="lazy"
                                                                        onLoad={() =>
                                                                            setLoadedImages((prev) => ({
                                                                                ...prev,
                                                                                [po.id]: true,
                                                                            }))
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
                                                    )}
                                                    {visibleColumns.product_code && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.product_code}px`,
                                                                minWidth: `${columnWidths.product_code}px`,
                                                                maxWidth: `${columnWidths.product_code}px`,
                                                            }}
                                                            className="p-3 truncate-text"
                                                        >
                                                            {po.product_code ? (
                                                                <Clipboard darkMode={darkMode} textToCopy={po.product_code}>
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-Purple ${darkMode ? 'label-Purple-darkmode' : ''}`}
                                                                            data-belly-caption={po.product_code}
                                                                        >
                                                                            {po.product_code && po.product_code.length > 15
                                                                                ? `${po.product_code.substring(0, 12)}...`
                                                                                : po.product_code || ""}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                    )}
                                                    {visibleColumns.name && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.name}px`,
                                                                minWidth: `${columnWidths.name}px`,
                                                                maxWidth: `${columnWidths.name}px`,
                                                            }}
                                                            className="p-3 truncate-text"
                                                        >
                                                            {po.name_en || po.name_cn || po.name_kh ? (
                                                                <Clipboard
                                                                    darkMode={darkMode}
                                                                    textToCopy={`${po.name_en || ''}, ${po.name_cn || ''}, ${po.name_kh || ''}`}
                                                                >
                                                                    <Bellypopover darkMode={darkMode}>
                                                                        <span
                                                                            className={`label-green ${getDarkModeClass(
                                                                                darkMode,
                                                                                "label-green-darkmode",
                                                                                ""
                                                                            )}`}
                                                                            data-belly-caption={`${po.name_en || ''}, ${po.name_cn || ''}, ${po.name_kh || ''}`}
                                                                        >
                                                                            {po.name_en && po.name_en.length > 15
                                                                                ? `${po.name_en.substring(0, 12)}...`
                                                                                : po.name_en
                                                                                ? po.name_en
                                                                                : po.name_cn && po.name_cn.length > 15
                                                                                ? `${po.name_cn.substring(0, 12)}...`
                                                                                : po.name_cn
                                                                                ? po.name_cn
                                                                                : po.name_kh && po.name_kh.length > 15
                                                                                ? `${po.name_kh.substring(0, 12)}...`
                                                                                : po.name_kh || ""}
                                                                        </span>
                                                                    </Bellypopover>
                                                                </Clipboard>
                                                            ) : ""}
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
                                                            {formatDate(po.date)}
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
                                                            {po.amount || ""}
                                                        </td>
                                                    )}
                                                    {visibleColumns.remark && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.remark}px`,
                                                                minWidth: `${columnWidths.remark}px`,
                                                                maxWidth: `${columnWidths.remark}px`,
                                                            }}
                                                            className="p-3 truncate-text"
                                                        >
                                                            {po.remark ? (
                                                                <Bellypopover darkMode={darkMode}>
                                                                    <span
                                                                        className={`label-pink ${getDarkModeClass(
                                                                            darkMode,
                                                                            "label-pink-darkmode",
                                                                            ""
                                                                        )}`}
                                                                        data-belly-caption={po.remark}
                                                                    >
                                                                        {po.remark && po.remark.length > 30
                                                                            ? `${po.remark.substring(0, 27)}...`
                                                                            : po.remark || ""}
                                                                    </span>
                                                                </Bellypopover>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                    )}
                                                    {visibleColumns.rating && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.rating}px`,
                                                                minWidth: `${columnWidths.rating}px`,
                                                                maxWidth: `${columnWidths.rating}px`,
                                                            }}
                                                            className="p-3"
                                                        >
                                                            <div className="flex">{renderStars(po.rating)}</div>
                                                        </td>
                                                    )}
                                                    {visibleColumns.order && (
                                                        <td
                                                            style={{
                                                                width: `${columnWidths.order}px`,
                                                                minWidth: `${columnWidths.order}px`,
                                                                maxWidth: `${columnWidths.order}px`,
                                                            }}
                                                            className="p-3"
                                                        >
                                                            <div className="flex flex-col items-start">
                                                                {checkboxLoading[po.id] ? (
                                                                    <Spinner
                                                                        width="16px"
                                                                        height="16px"
                                                                        className="mb-1"
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!po.order}
                                                                        onChange={() => toggleOrderCheckbox(po.id, po.order)}
                                                                        className={`custom-checkbox ${getDarkModeClass(
                                                                            darkMode,
                                                                            "custom-checkbox-border-darkmode",
                                                                            "custom-checkbox-border"
                                                                        )}`}
                                                                    />
                                                                )}
                                                                {po.date_auto_order && (
                                                                    <span className="text-xs mt-1 text-gray-500">
                                                                        {formatDate(po.date_auto_order)}
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                                    className={`absolute right-[3rem] w-40 rounded-lg shadow-lg z-20 ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-[#2D2D2D] text-gray-200",
                                                                        "bg-white text-gray-900"
                                                                    )}`}
                                                                >
                                                                    <button
                                                                        onClick={() => openEditPopup(po)}
                                                                        disabled={isEditing === po.id}
                                                                        className={`w-full text-left hover:rounded px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                                            darkMode,
                                                                            "hover:bg-[#3A3A3A]",
                                                                            "hover:bg-gray-100"
                                                                        )} ${
                                                                            isEditing === po.id
                                                                                ? 'opacity-50 cursor-not-allowed'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        {isEditing === po.id ? (
                                                                            <Spinner
                                                                                width="16px"
                                                                                height="16px"
                                                                                className="mr-2"
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
                                                                        onClick={() => handleDelete(po.id)}
                                                                        className={`w-full text-left px-4 hover:rounded  py-2 text-sm flex items-center ${getDarkModeClass(
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
                {isRatingPopupOpen && (
                    <div
                        className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } rating-popup`}
                        style={{
                            top: `${popupPosition.top + 10}px`,
                            left: `${popupPosition.left - 120}px`,
                            transformOrigin: 'center top',
                            animation: isAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3">
                            <h3 className="text-center font-semibold mb-3">{t("list_pos.filter_by_rating")}</h3>
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <label
                                    key={rating}
                                    className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                                        darkMode ? "text-gray-300" : "text-gray-700"
                                    } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checkedRatings.includes(rating)}
                                        onChange={() => handleRatingCheckboxChange(rating)}
                                        className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                                    />
                                    <span className="flex items-center">
                                        {t(`list_pos.${rating === 1 ? "star" : "stars"}`, { count: rating })}
                                        <span className="ml-2 flex space-x-0.5">{renderCheckboxStars(rating)}</span>
                                    </span>
                                </label>
                            ))}
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        toggleRatingPopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pos.apply")}
                                </button>
                                <button
                                    onClick={() => toggleRatingPopup(new Event('click'))}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {isDatePopupOpen && (
                    <div
                        className={`fixed w-80 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } date-popup`}
                        style={{
                            top: `${datePopupPosition.top + 10}px`,
                            left: `${datePopupPosition.left - 140}px`,
                            transformOrigin: 'center top',
                            animation: isDateAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-4">
                            <h3 className="text-center font-semibold mb-4">{t("list_pos.filter_by_date")}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("list_pos.start_date")}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t("list_pos.start_date")}
                                        value={startDate}
                                        onChange={(value) => setStartDate(value)}
                                        darkMode={darkMode}
                                        style={{
                                            border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                                            borderRadius: '0.375rem',
                                            backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                                        }}
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
                                        {t("list_pos.end_date")}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t("list_pos.end_date")}
                                        value={endDate}
                                        onChange={(value) => setEndDate(value)}
                                        darkMode={darkMode}
                                        style={{
                                            border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                                            borderRadius: '0.375rem',
                                            backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        toggleDatePopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pos.apply")}
                                </button>
                                <button
                                    onClick={() => toggleDatePopup(new Event('click'))}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {isOrderPopupOpen && (
                    <div
                        className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } order-popup`}
                        style={{
                            top: `${orderPopupPosition.top + 10}px`,
                            left: `${orderPopupPosition.left - 120}px`,
                            transformOrigin: 'center top',
                            animation: isOrderAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3">
                            <h3 className="text-center font-semibold mb-3">{t("list_pos.filter_by_order")}</h3>
                            {[{ value: 1, label: t("list_pos.ordered") }, { value: 0, label: t("list_pos.not_ordered") }].map((status) => (
                                <label
                                    key={status.value}
                                    className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                                        darkMode ? "text-gray-300" : "text-gray-700"
                                    } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checkedOrderStatuses.includes(status.value)}
                                        onChange={() => handleOrderCheckboxChange(status.value === 1)}
                                        className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                                    />
                                    <span>{status.label}</span>
                                </label>
                            ))}
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        toggleOrderPopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pos.apply")}
                                </button>
                                <button
                                    onClick={() => toggleOrderPopup(new Event('click'))}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {isSettingPopupOpen && (
                    <div
                        className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } setting-popup`}
                        style={{
                            top: `${settingPopupPosition.top + 10}px`,
                            left: `${settingPopupPosition.left - 220}px`,
                            transformOrigin: 'center top',
                            animation: isSettingAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3 flex flex-col max-h-96">
                            <h3 className="text-center font-semibold mb-3">{t("list_pos.column_settings")}</h3>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder={t("list_pos.search_columns")}
                                    value={columnSearchQuery}
                                    onChange={(e) => setColumnSearchQuery(e.target.value)}
                                    className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                        "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                                    )}`}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {allColumns
                                    .filter((column) =>
                                        column.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
                                    )
                                    .sort((a, b) => {
                                        const aMatch = a.label.toLowerCase().startsWith(columnSearchQuery.toLowerCase());
                                        const bMatch = b.label.toLowerCase().startsWith(columnSearchQuery.toLowerCase());
                                        if (aMatch && !bMatch) return -1;
                                        if (!aMatch && bMatch) return 1;
                                        return a.label.localeCompare(b.label);
                                    })
                                    .map((column) => (
                                        <label
                                            key={column.key}
                                            className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                                                darkMode ? "text-gray-300" : "text-gray-700"
                                            } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns[column.key]}
                                                onChange={() => handleColumnVisibilityChange(column.key)}
                                                className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                                            />
                                            <span>{column.label}</span>
                                        </label>
                                    ))}
                            </div>
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={handleResetColumns}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-semibold uppercase rounded-md transition-colors duration-150 border ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] bg-[#2D2D2D] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] bg-white hover:bg-[#ff8800] hover:text-white"
                                    )} shadow-md flex items-center justify-center gap-2`}
                                >
                                    {t("list_pos.reset")}
                                </button>
                                <button
                                    onClick={() => toggleSettingPopup(new Event('click'))}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div
                    id="edit-po-popup"
                    className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
                        isPopupOpen ? "bg-opacity-60 opacity-100 visible" : "bg-opacity-0 opacity-0 invisible"
                    }`}
                >
                    <div
                        className={`rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${getDarkModeClass(
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
                            className={`p-6 sticky top-0 z-10 rounded-t-xl ${getDarkModeClass(
                                darkMode,
                                "bg-[#1A1A1A]",
                                "bg-white"
                            )}`}
                        >
                            <h2
                                className={`uppercase text-2xl font-bold mb-4 flex items-center ${getDarkModeClass(
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
                                {t("list_pos.edit_purchase_order")}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
                            <form id="edit-po-form" className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label
                                        className={`uppercase block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("list_pos.amount")}
                                    </label>
                                   <input
                                        type="text"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow only numbers and a single decimal point (optional)
                                            if (/^\d*\.?\d*$/.test(value) || value === "") {
                                            setFormData({ ...formData, amount: value });
                                            }
                                        }}
                                        className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder={t("list_pos.enter_amount")}
                                    />
                                </div>
                                <div>
                                    <label
                                        className={`uppercase block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("list_pos.rating")}
                                    </label>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                onClick={() => handleStarClick(star)}
                                                className={`w-8 h-8 cursor-pointer ${
                                                    formData.rating >= star
                                                        ? darkMode
                                                            ? 'text-[#facc15]'
                                                            : 'text-black'
                                                        : 'text-gray-300'
                                                }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className={`uppercase block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("list_pos.remark")}
                                    </label>
                                    <textarea
                                        name="remark"
                                        value={formData.remark}
                                        onChange={(e) =>
                                            setFormData({ ...formData, remark: e.target.value })
                                        }
                                        className={`w-full custom-scrollbar border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                        rows="4"
                                        placeholder={t("list_pos.enter_remark")}
                                    />
                                </div>
                            </form>
                        </div>
                        <div
                            className={`rounded-b-xl p-6 pt-0 sticky bottom-0 z-10 ${getDarkModeClass(
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
                                    form="edit-po-form"
                                    disabled={isSubmitting}
                                    className={`border flex items-center justify-center ${getDarkModeClass(
                                        darkMode,
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                        "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md ${
                                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
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

ListPO.title = "po";
ListPO.subtitle = "list_po";
