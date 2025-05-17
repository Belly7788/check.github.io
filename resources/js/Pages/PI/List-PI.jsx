import React, { useEffect, useState, useRef } from 'react';
import { Link, Head, router } from "@inertiajs/react";
import { FaEllipsisV } from "react-icons/fa";
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
import MuiStyleDatePicker from "../../BELLY/Component/DatePicker/DatePicker";
import ProgressChart from '../../Component/Progress/Porgress-chart/Porgress-chart';

// Utility function for dark mode class
const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

// Dummy data for Purchase Invoices
const dummyPurchaseInvoices = [
    { id: 1, invoice_code: "INV001", supplier: "Supplier A", date: "2025-05-01", amount: 1000, ctn: 50, rating: "Company A", order: true, method: "Sea", t_number: "T123", r_number: "R456", arrival_date: "2025-05-10", remark: "Sample remark for INV0012" },
    { id: 2, invoice_code: "INV002", supplier: "Supplier B", date: "2025-05-02", amount: 1500, ctn: 30, rating: "Company B", order: false, method: "Air", t_number: "T124", r_number: "R457", arrival_date: "2025-05-12", remark: "" },
    { id: 3, invoice_code: "INV003", supplier: "Supplier C", date: "2025-05-03", amount: 800, ctn: 40, rating: "Company C", order: true, method: "Land", t_number: "T125", r_number: "R458", arrival_date: "2025-05-11", remark: "Urgent delivery required" },
    { id: 4, invoice_code: "INV004", supplier: "Supplier D", date: "2025-05-04", amount: 2000, ctn: 60, rating: "Company D", order: false, method: "Sea", t_number: "T126", r_number: "R459", arrival_date: "2025-05-15", remark: "" },
    { id: 5, invoice_code: "INV005", supplier: "Supplier E", date: "2025-05-05", amount: 1200, ctn: 25, rating: "Company E", order: true, method: "Air", t_number: "T127", r_number: "R460", arrival_date: "2025-05-13", remark: "Check quality before acceptance" },
];

const dummyProductData = {
  1: [
    {
      id: 1,
      photo: "../../../../images/c-programming-course.png",
      code: "PROD001",
      name: "Product A",
      ctn: 10,
      qty: 100,
      price: 20,
      total: 2000,
      note: "High priority",
      progress: 75,
      delivered: true,
    },
    {
      id: 2,
      photo: "../../../../images/c-programming-course.png",
      code: "PROD002",
      name: "Product B",
      ctn: 5,
      qty: 50,
      price: 30,
      total: 1500,
      note: "Check quality",
      progress: 50,
      delivered: false,
    },
  ],
  2: [
    {
      id: 3,
      photo: "../../../../images/c-programming-course.png",
      code: "PROD003",
      name: "Product C",
      ctn: 8,
      qty: 80,
      price: 25,
      total: 2000,
      note: "",
      progress: 100,
      delivered: true,
    },
  ],
  // Add more product data for other invoice IDs as needed
};

const dummyReferencePhotos = {
  1: [
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
    "../../../../images/c-programming-course.png",
  ],
  2: [
    "https://via.placeholder.com/150/00FF00",
    "https://via.placeholder.com/150/FFFF00",
  ],
  // Add more reference photos for other invoice IDs as needed
};

// List of available companies and shipping methods
const availableCompanies = ["Company A", "Company B", "Company C", "Company D", "Company E", "Company F", "Company G"];
const availableShipMethods = ["Sea", "Air", "Land", "Rail", "Express"];

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

export default function ListPI({ darkMode = false }) {
    const { t } = useTranslation();

    // State declarations
    const [data, setData] = useState(dummyPurchaseInvoices);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 5,
        total: dummyPurchaseInvoices.length,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [columnSearchQuery, setColumnSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPI, setCurrentPI] = useState(null);
    const [openActionDropdown, setOpenActionDropdown] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPIs, setSelectedPIs] = useState([]);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [selectedSearchField, setSelectedSearchField] = useState("Pi_Number");
    const [formData, setFormData] = useState({
        amount: '',
        rating: '',
    });
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [checkedCompanies, setCheckedCompanies] = useState(availableCompanies);
    const companyHeaderRef = useRef(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });
    const [isCompanyPopupOpen, setIsCompanyPopupOpen] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // Date popup states
    const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
    const [isDateAnimatingOut, setIsDateAnimatingOut] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const dateHeaderRef = useRef(null);
    const [datePopupPosition, setDatePopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });

    // Arrival Date popup states
    const [isArrivalDatePopupOpen, setIsArrivalDatePopupOpen] = useState(false);
    const [isArrivalDateAnimatingOut, setIsArrivalDateAnimatingOut] = useState(false);
    const [startArrivalDate, setStartArrivalDate] = useState('');
    const [endArrivalDate, setEndArrivalDate] = useState('');
    const arrivalDateHeaderRef = useRef(null);
    const [arrivalDatePopupPosition, setArrivalDatePopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });

    // Ship By popup states
    const [isShipByPopupOpen, setIsShipByPopupOpen] = useState(false);
    const [isShipByAnimatingOut, setIsShipByAnimatingOut] = useState(false);
    const [checkedShipMethods, setCheckedShipMethods] = useState(availableShipMethods);
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
    const [activeTab, setActiveTab] = useState('remark'); // State for active tab

    const handleRowClick = (index) => {
        setOpenRowDropdown(openRowDropdown === index ? null : index);
        setActiveTab('remark'); // Reset to remark tab when opening
    };


    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState({
        invoice_code: true,
        supplier: true,
        date: true,
        amount: true,
        ctn: true,
        rating: true,
        order: true,
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
        order: 100,
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

    // Client-side filtering and sorting
    const applyFilters = () => {
        setIsLoading(true);
        let filteredData = [...dummyPurchaseInvoices];

        // Search filter
        if (searchQuery) {
            filteredData = filteredData.filter((pi) =>
                pi.invoice_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pi.supplier.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Company filter
        if (checkedCompanies.length > 0) {
            filteredData = filteredData.filter((pi) => checkedCompanies.includes(pi.rating));
        }

        // Date filter
        if (startDate || endDate) {
            filteredData = filteredData.filter((pi) => {
                const piDate = new Date(pi.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                return (!start || piDate >= start) && (!end || piDate <= end);
            });
        }

        // Arrival Date filter
        if (startArrivalDate || endArrivalDate) {
            filteredData = filteredData.filter((pi) => {
                const piArrivalDate = new Date(pi.arrival_date);
                const start = startArrivalDate ? new Date(startArrivalDate) : null;
                const end = endArrivalDate ? new Date(endArrivalDate) : null;
                return (!start || piArrivalDate >= start) && (!end || piArrivalDate <= end);
            });
        }

        // Ship By filter
        if (checkedShipMethods.length > 0) {
            filteredData = filteredData.filter((pi) => checkedShipMethods.includes(pi.method));
        }

        // t_number filter
        if (tNumberSearch) {
            filteredData = filteredData.filter((pi) =>
                pi.t_number.toLowerCase().includes(tNumberSearch.toLowerCase())
            );
        }

        // r_number filter
        if (rNumberSearch) {
            filteredData = filteredData.filter((pi) =>
                pi.r_number.toLowerCase().includes(rNumberSearch.toLowerCase())
            );
        }

        // Sorting
        if (sortField) {
            filteredData.sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];
                if (typeof aValue === 'string') {
                    return sortDirection === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            });
        }

        // Pagination
        const startIndex = (currentPage - 1) * entriesPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

        setData(paginatedData);
        setPagination((prev) => ({
            ...prev,
            total: filteredData.length,
            currentPage: Math.min(currentPage, Math.max(1, Math.ceil(filteredData.length / entriesPerPage))),
        }));
        setTimeout(() => setIsLoading(false), 500); // Simulate loading
    };

    // Handle sort
    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        applyFilters();
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

    // Toggle popup handlers with auto-positioning
    const toggleCompanyPopup = (e) => {
        e.stopPropagation();
        if (isCompanyPopupOpen) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsCompanyPopupOpen(false);
                setIsAnimatingOut(false);
            }, 200);
        } else {
            const position = calculatePopupPosition(companyHeaderRef, 224, 300); // Adjusted height for scroll
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
            const position = calculatePopupPosition(shipByHeaderRef, 224, 300); // Adjusted height for scroll
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
            order: true,
            method: true,
            t_number: true,
            r_number: true,
            arrival_date: true,
        });
    };

    // CRUD operations (simulated)
    const openEditPopup = (pi) => {
        setIsEditMode(true);
        setCurrentPI(pi);
        setFormData({
            amount: pi.amount || '',
            rating: pi.rating || '',
        });
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setCurrentPI(null);
        setIsEditMode(false);
        setFormData({ amount: '', rating: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount && !formData.rating) {
            alert(t("list_pis.please_fill_at_least_one_field"));
            return;
        }

        setData((prev) =>
            prev.map((pi) =>
                pi.id === currentPI.id ? { ...pi, ...formData } : pi
            )
        );
        closePopup();
        alert(t("list_pis.pi_updated_successfully"));
    };

    const handleDelete = (id) => {
        if (window.confirm(t("list_pis.confirm_delete_pi"))) {
            setData((prev) => prev.filter((pi) => pi.id !== id));
            alert(t("list_pis.pi_deleted_successfully"));
        }
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
        }
    };

    const handleRNumberSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            applyFilters();
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        applyFilters();
    };

    const handleEntriesPerPageChange = (e) => {
        const newEntriesPerPage = Number(e.target.value);
        const newTotalPages = Math.ceil(pagination.total / newEntriesPerPage);
        const newPage = currentPage > newTotalPages ? newTotalPages || 1 : currentPage;
        setEntriesPerPage(newEntriesPerPage);
        setCurrentPage(newPage);
        applyFilters();
    };

    const handleCompanyCheckboxChange = (company) => {
        setCheckedCompanies((prev) =>
            prev.includes(company)
                ? prev.filter((c) => c !== company)
                : [...prev, company]
        );
    };

    const handleShipMethodCheckboxChange = (method) => {
        setCheckedShipMethods((prev) =>
            prev.includes(method)
                ? prev.filter((m) => m !== method)
                : [...prev, method]
        );
    };

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
                arrivalDateHeaderRef.current &&
                !arrivalDateHeaderRef.current.contains(event.target) &&
                !event.target.closest(".arrival-date-popup")
            ) {
                setIsArrivalDateAnimatingOut(true);
                setTimeout(() => {
                    setIsArrivalDatePopupOpen(false);
                    setIsArrivalDateAnimatingOut(false);
                }, 200);
            }
            if (
                shipByHeaderRef.current &&
                !shipByHeaderRef.current.contains(event.target) &&
                !event.target.closest(".ship-by-popup")
            ) {
                setIsShipByAnimatingOut(true);
                setTimeout(() => {
                    setIsShipByPopupOpen(false);
                    setIsShipByAnimatingOut(false);
                }, 200);
            }
            if (
                tNumberHeaderRef.current &&
                !tNumberHeaderRef.current.contains(event.target) &&
                !event.target.closest(".t-number-popup")
            ) {
                setIsTNumberAnimatingOut(true);
                setTimeout(() => {
                    setIsTNumberPopupOpen(false);
                    setIsTNumberAnimatingOut(false);
                }, 200);
            }
            if (
                rNumberHeaderRef.current &&
                !rNumberHeaderRef.current.contains(event.target) &&
                !event.target.closest(".r-number-popup")
            ) {
                setIsRNumberAnimatingOut(true);
                setTimeout(() => {
                    setIsRNumberPopupOpen(false);
                    setIsRNumberAnimatingOut(false);
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
                if (isCompanyPopupOpen) {
                    setIsAnimatingOut(true);
                    setTimeout(() => {
                        setIsCompanyPopupOpen(false);
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
                if (isArrivalDatePopupOpen) {
                    setIsArrivalDateAnimatingOut(true);
                    setTimeout(() => {
                        setIsArrivalDatePopupOpen(false);
                        setIsArrivalDateAnimatingOut(false);
                    }, 200);
                }
                if (isShipByPopupOpen) {
                    setIsShipByAnimatingOut(true);
                    setTimeout(() => {
                        setIsShipByPopupOpen(false);
                        setIsShipByAnimatingOut(false);
                    }, 200);
                }
                if (isTNumberPopupOpen) {
                    setIsTNumberAnimatingOut(true);
                    setTimeout(() => {
                        setIsTNumberPopupOpen(false);
                        setIsTNumberAnimatingOut(false);
                    }, 200);
                }
                if (isRNumberPopupOpen) {
                    setIsRNumberAnimatingOut(true);
                    setTimeout(() => {
                        setIsRNumberPopupOpen(false);
                        setIsRNumberAnimatingOut(false);
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
    }, [isPopupOpen, isCompanyPopupOpen, isDatePopupOpen, isArrivalDatePopupOpen, isShipByPopupOpen, isTNumberPopupOpen, isRNumberPopupOpen, isSettingPopupOpen, formData]);

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
        { key: 'invoice_code', label: t("invoice_code") },
        { key: 'supplier', label: t("name") },
        { key: 'date', label: t("date") },
        { key: 'amount', label: t("total") },
        { key: 'ctn', label: t("ctn") },
        { key: 'rating', label: t("company") },
        { key: 'method', label: t("ship_by") },
        { key: 't_number', label: t("t_number") },
        { key: 'r_number', label: t("r_number") },
        { key: 'arrival_date', label: t("ar_date") },
    ];

    const allColumns = sortableColumns;

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
                            {/* Select Dropdown */}
                            <div className="relative w-[25%]">
                                <div
                                    className={`w-full p-2 pl-4 pr-8 rounded-l-lg border-r-0 focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                    "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                                    )}`}
                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                >
                                    {selectedSearchField === "Pi_Number"
                                    ? t("pi_number")
                                    : selectedSearchField === "Name"
                                    ? t("name")
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
                                    { key: "Pi_Number", label: t("pi_number") },
                                    { key: "Name", label: t("name") },
                                    { key: "Product", label: t("product") },
                                ].map((item) => (
                                    <div
                                    key={item.key}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${getDarkModeClass(
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
                            {/* Search Input */}
                            <div className="relative  flex-1">
                                <input
                                    type="text"
                                    placeholder={
                                    selectedSearchField === "Pi_Number"
                                        ? t("search_pi_number")
                                        : selectedSearchField === "Name"
                                        ? t("search_name")
                                        : t("search_product")
                                    }
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleSearch}
                                    className={`w-full  p-2 pl-10 pr-4 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
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
                            <table className="w-full border-collapse text-[10px]" ref={tableRef}>
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
                                            onClick={() => handleRowClick(index)}
                                            className={`border-b cursor-pointer ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                            )}`}
                                            >
                                            {/* Existing table cells for invoice_code, supplier, etc. */}
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
                                                    width: `${columnWidths.supplier}px`,
                                                    minWidth: `${columnWidths.supplier}px`,
                                                    maxWidth: `${columnWidths.supplier}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {pi.supplier ? (
                                                    <Clipboard darkMode={darkMode} textToCopy={pi.supplier}>
                                                    <Bellypopover darkMode={darkMode}>
                                                        <span
                                                        className={`label-green ${getDarkModeClass(darkMode, "label-green-darkmode", "")}`}
                                                        data-belly-caption={pi.supplier}
                                                        >
                                                        {pi.supplier && pi.supplier.length > 15
                                                            ? `${pi.supplier.substring(0, 12)}...`
                                                            : pi.supplier || ""}
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
                                                {pi.amount || ""}
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
                                                {pi.rating || ""}
                                                </td>
                                            )}
                                            {visibleColumns.method && (
                                                <td
                                                style={{
                                                    width: `${columnWidths.method}px`,
                                                    minWidth: `${columnWidths.method}px`,
                                                    maxWidth: `${columnWidths.method}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {pi.method || ""}
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
                                                        className={`label-yellow ${darkMode ? "label-yellow-darkmode" : ""}`}
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
                                                className="p-3 truncate-text"
                                                >
                                                {formatDate(pi.arrival_date)}
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
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-6.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                            </svg>
                                                            {t("edit")}
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
                                                    <button
                                                        onClick={() => setActiveTab("remark")}
                                                        className={`px-4 py-2 text-sm font-medium ${
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
                                                    <button
                                                        onClick={() => setActiveTab("reference")}
                                                        className={`px-4 py-2 text-sm font-medium ${
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
                                                    <button
                                                        onClick={() => setActiveTab("product")}
                                                        className={`px-4 py-2 text-sm font-medium ${
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
                                                        {pi.remark || t("list_pis.no_remark")}
                                                        </div>
                                                    )}
                                                    {activeTab === "reference" && (
                                                        <div className="space-y-4">
                                                        {dummyReferencePhotos[pi.id] && dummyReferencePhotos[pi.id].length > 0 ? (
                                                            <div className="flex flex-wrap gap-2 p-2">
                                                            {dummyReferencePhotos[pi.id].map((photo, idx) => (
                                                                <div
                                                                key={idx}
                                                                className="relative w-32 h-32 group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                                                >
                                                                <img
                                                                    src={photo}
                                                                    alt={`Reference ${idx + 1}`}
                                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                                <div
                                                                    className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${getDarkModeClass(
                                                                    darkMode,
                                                                    "text-gray-200",
                                                                    "text-white"
                                                                    )}`}
                                                                >
                                                                    <button
                                                                    onClick={() => window.open(photo, "_blank")}
                                                                    className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-200"
                                                                    >
                                                                    {t("view")}
                                                                    </button>
                                                                </div>
                                                                </div>
                                                            ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            {t("list_pis.no_reference_data")}
                                                            </p>
                                                        )}
                                                        </div>
                                                    )}
                                                    {activeTab === "product" && (
                                                        <div className="space-y-4">
                                                        {dummyProductData[pi.id] && dummyProductData[pi.id].length > 0 ? (
                                                            <div className="overflow-x-auto rounded-lg custom-scrollbar">
                                                            <table
                                                                className={`w-full border-collapse text-sm ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                                )}`}
                                                            >
                                                                <thead>
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
                                                                    <th className="p-3 text-left">{t("list_pis.progress")}</th>
                                                                    <th className="p-3 text-left">{t("list_pis.delivered")}</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {dummyProductData[pi.id].map((product) => (
                                                                    <tr
                                                                    key={product.id}
                                                                    className={`border-b ${getDarkModeClass(
                                                                        darkMode,
                                                                        "border-gray-700 hover:bg-[#3A3A3A]",
                                                                        "border-gray-200 hover:bg-gray-100"
                                                                    )}`}
                                                                    >
                                                                    <td className="p-3">
                                                                        <img
                                                                        src={product.photo}
                                                                        alt={product.name}
                                                                        className="w-12 h-12 object-cover rounded-md"
                                                                        />
                                                                    </td>
                                                                    <td className="p-3">{product.code}</td>
                                                                    <td className="p-3">{product.name}</td>
                                                                    <td className="p-3">{product.ctn}</td>
                                                                    <td className="p-3">{product.qty}</td>
                                                                    <td className="p-3">${product.price.toFixed(2)}</td>
                                                                    <td className="p-3">${product.total.toFixed(2)}</td>
                                                                    <td className="p-3 truncate max-w-xs">{product.note || "-"}</td>
                                                                    <td className="p-3">
                                                                        <ProgressChart darkMode={darkMode} percentage={product.progress} size={50} fontSize={12} />
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="flex flex-col items-start">
                                                                        <input
                                                                            type="checkbox"
                                                                            className={`custom-checkbox ${getDarkModeClass(
                                                                            darkMode,
                                                                            "custom-checkbox-border-darkmode",
                                                                            "custom-checkbox-border"
                                                                            )}`}
                                                                        />
                                                                        <span className="text-xs mt-1 text-gray-500">
                                                                            May 15, 2025
                                                                        </span>
                                                                        </div>
                                                                    </td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </table>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            {t("list_pis.no_product_data")}
                                                            </p>
                                                        )}
                                                        </div>
                                                    )}
                                                    </div>
                                                </td>
                                                </tr>
                                                {/* Added new tr with td colspan 8 and "hello world" text */}
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
                                                        <span className="text-sm">Extra Charge</span>
                                                    </td>
                                                    <td colSpan={4} className="p-2 text-left">
                                                        <span className="text-sm font-semibold">50.000$</span>
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
                                                        <span className="text-sm">Discount</span>
                                                    </td>
                                                    <td colSpan={4} className="p-2 text-left">
                                                        <span className="text-sm font-semibold">50.000$</span>
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
                                                        <span className="text-sm">Net Total</span>
                                                    </td>
                                                    <td colSpan={4} className="p-2 text-left">
                                                        <span className="text-sm font-semibold">50.000$</span>
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
                {isCompanyPopupOpen && (
                    <div
                        className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } company-popup`}
                        style={{
                            top: `${popupPosition.top}px`,
                            left: `${popupPosition.left}px`,
                            transformOrigin: popupPosition.transformOrigin,
                            animation: isAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3 flex flex-col max-h-96">
                            <h3 className="text-center font-semibold mb-3">{t("list_pis.filter_by_company")}</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {availableCompanies.map((company) => (
                                    <label
                                        key={company}
                                        className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                                            darkMode ? "text-gray-300" : "text-gray-700"
                                        } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checkedCompanies.includes(company)}
                                            onChange={() => handleCompanyCheckboxChange(company)}
                                            className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                                        />
                                        <span>{company}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        toggleCompanyPopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pis.apply")}
                                </button>
                                <button
                                    onClick={() => toggleCompanyPopup(new Event('click'))}
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
                        className={`fixed w-70 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } date-popup`}
                        style={{
                            top: `${datePopupPosition.top}px`,
                            left: `${datePopupPosition.left}px`,
                            transformOrigin: datePopupPosition.transformOrigin,
                            animation: isDateAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-4">
                            <h3 className="text-center font-semibold mb-4">{t("list_pis.filter_by_date")}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("list_pis.start_date")}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t("list_pis.start_date")}
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
                                        {t("list_pis.end_date")}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t("list_pis.end_date")}
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
                                    {t("list_pis.apply")}
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
                {isArrivalDatePopupOpen && (
                    <div
                        className={`fixed w-80 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } arrival-date-popup`}
                        style={{
                            top: `${arrivalDatePopupPosition.top}px`,
                            left: `${arrivalDatePopupPosition.left}px`,
                            transformOrigin: arrivalDatePopupPosition.transformOrigin,
                            animation: isArrivalDateAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-4">
                            <h3 className="text-center font-semibold mb-4">{t("list_pis.filter_by_arrival_date")}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("list_pis.start_arrival_date")}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t("list_pis.start_arrival_date")}
                                        value={startArrivalDate}
                                        onChange={(value) => setStartArrivalDate(value)}
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
                                        {t("list_pis.end_arrival_date")}
                                    </label>
                                    <MuiStyleDatePicker
                                        label={t("list_pis.end_arrival_date")}
                                        value={endArrivalDate}
                                        onChange={(value) => setEndArrivalDate(value)}
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
                                        toggleArrivalDatePopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pis.apply")}
                                </button>
                                <button
                                    onClick={() => toggleArrivalDatePopup(new Event('click'))}
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
                {isShipByPopupOpen && (
                    <div
                        className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } ship-by-popup`}
                        style={{
                            top: `${shipByPopupPosition.top}px`,
                            left: `${shipByPopupPosition.left}px`,
                            transformOrigin: shipByPopupPosition.transformOrigin,
                            animation: isShipByAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3 flex flex-col max-h-96">
                            <h3 className="text-center font-semibold mb-3">{t("list_pis.filter_by_ship_by")}</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {availableShipMethods.map((method) => (
                                    <label
                                        key={method}
                                        className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                                            darkMode ? "text-gray-300" : "text-gray-700"
                                        } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checkedShipMethods.includes(method)}
                                            onChange={() => handleShipMethodCheckboxChange(method)}
                                            className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                                        />
                                        <span>{method}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        toggleShipByPopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pis.apply")}
                                </button>
                                <button
                                    onClick={() => toggleShipByPopup(new Event('click'))}
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
                {isTNumberPopupOpen && (
                    <div
                        className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } t-number-popup`}
                        style={{
                            top: `${tNumberPopupPosition.top}px`,
                            left: `${tNumberPopupPosition.left}px`,
                            transformOrigin: tNumberPopupPosition.transformOrigin,
                            animation: isTNumberAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3 flex flex-col">
                            <h3 className="text-center font-semibold mb-3">{t("list_pis.filter_by_t_number")}</h3>
                            <input
                                type="text"
                                placeholder={t("list_pis.search_t_number")}
                                value={tNumberSearch}
                                onChange={(e) => setTNumberSearch(e.target.value)}
                                onKeyPress={handleTNumberSearch}
                                className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                    "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                                )}`}
                            />
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        toggleTNumberPopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pis.apply")}
                                </button>
                                <button
                                    onClick={() => toggleTNumberPopup(new Event('click'))}
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
                {isRNumberPopupOpen && (
                    <div
                        className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } r-number-popup`}
                        style={{
                            top: `${rNumberPopupPosition.top}px`,
                            left: `${rNumberPopupPosition.left}px`,
                            transformOrigin: rNumberPopupPosition.transformOrigin,
                            animation: isRNumberAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3 flex flex-col">
                            <h3 className="text-center font-semibold mb-3">{t("list_pis.filter_by_r_number")}</h3>
                            <input
                                type="text"
                                placeholder={t("list_pis.search_r_number")}
                                value={rNumberSearch}
                                onChange={(e) => setRNumberSearch(e.target.value)}
                                onKeyPress={handleRNumberSearch}
                                className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                    "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                                )}`}
                            />
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                    onClick={() => {
                                        applyFilters();
                                        toggleRNumberPopup(new Event('click'));
                                    }}
                                    className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        darkMode
                                            ? "bg-orange-600 text-white hover:bg-orange-700"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {t("list_pis.apply")}
                                </button>
                                <button
                                    onClick={() => toggleRNumberPopup(new Event('click'))}
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
                        className={`fixed w-60 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                        } setting-popup`}
                        style={{
                            top: `${settingPopupPosition.top}px`,
                            left: `${settingPopupPosition.left - 30}px`,
                            transformOrigin: settingPopupPosition.transformOrigin,
                            animation: isSettingAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                        }}
                    >
                        <div className="p-3 flex flex-col max-h-96">
                            <h3 className="text-center font-semibold mb-3">{t("list_pis.column_settings")}</h3>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder={t("list_pis.search_columns")}
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
                                    {t("list_pis.reset")}
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
                    id="edit-pi-popup"
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
                                {t("list_pis.edit_purchase_invoice")}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
                            <form id="edit-pi-form" className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label
                                        className={`uppercase block text-sm font-medium mb-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("list_pis.total")}
                                    </label>
                                    <input
                                        type="text"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*\.?\d*$/.test(value) || value === "") {
                                                setFormData({ ...formData, amount: value });
                                            }
                                        }}
                                        className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder={t("list_pis.enter_amount")}
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
                                        {t("list_pis.company")}
                                    </label>
                                    <select
                                        name="rating"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                        className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                    >
                                        <option value="">{t("list_pis.select_company")}</option>
                                        {availableCompanies.map((company) => (
                                            <option key={company} value={company}>
                                                {company}
                                            </option>
                                        ))}
                                    </select>
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
                                    )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 sombra-sm`}
                                >
                                    {t("cancel")} (ESC)
                                </button>
                                <button
                                    type="submit"
                                    form="edit-pi-form"
                                    className={`border flex items-center justify-center ${getDarkModeClass(
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

ListPI.title = "pi";
ListPI.subtitle = "list_pi";
