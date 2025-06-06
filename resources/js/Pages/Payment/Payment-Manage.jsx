import { Link, Head, router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { GoArrowUp } from "react-icons/go";
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
import MuiStyleDatePicker from "../../BELLY/Component/DatePicker/DatePicker";
import { checkPermission } from '../../utils/permissionUtils';
import * as echarts from "echarts";
import DropdownInput from "../../Component/DropdownInput/DropdownInput";
import DatePopup from "./Component-Payment/DatePopup";
import TranPopup from "./Component-Payment/TranPopup";
import StatusPopup from "./Component-Payment/StatusPopup";
import SettingPopup from "./Component-Payment/SettingPopup";

export default function PaymentManage({ darkMode, payments, pagination, pieChartData, lineChartData, companies }) {
  const { t } = useTranslation();

  // State declarations
  const [data, setData] = useState(payments);
  const [paginationState, setPagination] = useState({
    currentPage: pagination.currentPage,
    perPage: pagination.perPage,
    total: pagination.total,
  });
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);
  const [entriesPerPage, setEntriesPerPage] = useState(pagination.perPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState('Code_Payment');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [openActionDropdown, setOpenActionDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [formData, setFormData] = useState({
    tran_type: 'Credit',
    tran_date: new Date().toISOString().split('T')[0],
    number: '',
    name: '',
    amount: '',
    open_balance: '',
    payment_method: '', // Add payment_method
    company_id: '', // Add company_id
    memo: '',
    status: 'Pending',
  });
  const [sortField, setSortField] = useState('tran_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [isDateAnimatingOut, setIsDateAnimatingOut] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dateHeaderRef = useRef(null);
  const [datePopupPosition, setDatePopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });
  const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false);
  const [isSettingAnimatingOut, setIsSettingAnimatingOut] = useState(false);
  const settingHeaderRef = useRef(null);
  const [settingPopupPosition, setSettingPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });
  const [isTranPopupOpen, setIsTranPopupOpen] = useState(false);
  const [isTranAnimatingOut, setIsTranAnimatingOut] = useState(false);
  const tranHeaderRef = useRef(null);
  const [tranPopupPosition, setTranPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });
  const [tranTypeFilters, setTranTypeFilters] = useState({
    pi: true,
    payment: true,
  });
  const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false);
  const [isStatusAnimatingOut, setIsStatusAnimatingOut] = useState(false);
  const statusHeaderRef = useRef(null);
  const [statusPopupPosition, setStatusPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });
    const [statusFilters, setStatusFilters] = useState({
    Completed: true,
    Pending: true,
    });

  const [isCompanyPopupOpen, setIsCompanyPopupOpen] = useState(false);
  const [isCompanyAnimatingOut, setIsCompanyAnimatingOut] = useState(false);
  const companyHeaderRef = useRef(null);
  const [companyPopupPosition, setCompanyPopupPosition] = useState({ top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' });
  const [companyFilters, setCompanyFilters] = useState({});

  const [tableSearchQuery, setTableSearchQuery] = useState('');

const getFilteredAndSortedPiData = () => {
  if (!tableSearchQuery.trim()) return piData;

  const lowerQuery = tableSearchQuery.toLowerCase();

  // Filter and sort
  return [...piData].sort((a, b) => {
    const aMatch =
      a.pi_number?.toLowerCase().includes(lowerQuery) ||
      a.pi_name?.toLowerCase().includes(lowerQuery) ||
      a.pi_name_cn?.toLowerCase().includes(lowerQuery);
    const bMatch =
      b.pi_number?.toLowerCase().includes(lowerQuery) ||
      b.pi_name?.toLowerCase().includes(lowerQuery) ||
      b.pi_name_cn?.toLowerCase().includes(lowerQuery);

    // If both match or both don't match, maintain original order
    if (aMatch === bMatch) return 0;
    // If a matches, it comes first
    if (aMatch) return -1;
    // If b matches, it comes first
    return 1;
  });
};

  // Add to your state declarations
const [checkedItems, setCheckedItems] = useState({});
const [selectAll, setSelectAll] = useState(false);
const [piData, setPiData] = useState([]);
// Add to existing state declarations
const [paymentAmounts, setPaymentAmounts] = useState({}); // Store payment amounts (manual or calculated)
const [isManualInput, setIsManualInput] = useState({}); // Track if payment is manually entered
const [discountInputs, setDiscountInputs] = useState({}); // Store discount input values
const [discountTypes, setDiscountTypes] = useState({}); // Store discount types ($ or %)
const [subtotal, setSubtotal] = useState(0); // Store subtotal
const [totalDiscount, setTotalDiscount] = useState(0); // Store total discount

// Handle individual checkbox change
const handleCheckboxChange = (piId) => {
  setCheckedItems((prev) => {
    const newCheckedItems = { ...prev, [piId]: !prev[piId] };
    const pi = piData.find((item) => item.id === piId);

    if (newCheckedItems[piId]) {
      // When checked, calculate payment based on payment_balance
      setPaymentAmounts((prev) => ({
        ...prev,
        [piId]: parseFloat(pi.open_balance || 0).toFixed(3), // Uses payment_balance from piData
      }));
      setIsManualInput((prev) => ({ ...prev, [piId]: false }));
      // Initialize discount to 0 and type to $
      setDiscountInputs((prev) => ({ ...prev, [piId]: "0" }));
      setDiscountTypes((prev) => ({ ...prev, [piId]: "$" }));
    } else {
      // When unchecked, remove from payment amounts and discounts
      setPaymentAmounts((prev) => {
        const { [piId]: _, ...rest } = prev;
        return rest;
      });
      setIsManualInput((prev) => {
        const { [piId]: _, ...rest } = prev;
        return rest;
      });
      setDiscountInputs((prev) => {
        const { [piId]: _, ...rest } = prev;
        return rest;
      });
      setDiscountTypes((prev) => {
        const { [piId]: _, ...rest } = prev;
        return rest;
      });
    }

    return newCheckedItems;
  });
};

// Handle select all checkbox
const handleSelectAllChange = () => {
  const newSelectAll = !selectAll;
  setSelectAll(newSelectAll);

  if (newSelectAll) {
    const allChecked = {};
    const newPaymentAmounts = {};
    const newIsManualInput = {};
    const newDiscountInputs = {};
    const newDiscountTypes = {};

    piData.forEach((pi) => {
      allChecked[pi.id] = true;
      newPaymentAmounts[pi.id] = parseFloat(pi.open_balance || 0).toFixed(3);
      newIsManualInput[pi.id] = false;
      newDiscountInputs[pi.id] = "0";
      newDiscountTypes[pi.id] = "$";
    });

    setCheckedItems(allChecked);
    setPaymentAmounts(newPaymentAmounts);
    setIsManualInput(newIsManualInput);
    setDiscountInputs(newDiscountInputs);
    setDiscountTypes(newDiscountTypes);
  } else {
    setCheckedItems({});
    setPaymentAmounts({});
    setIsManualInput({});
    setDiscountInputs({});
    setDiscountTypes({});
  }
};

// Helper function to format number to 3 decimal places
const formatToThreeDecimals = (value) => {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return "";
  return numericValue.toFixed(3);
};

// Handle payment input change (manual input)
const handlePaymentInputChange = (piId, value) => {
  // Sanitize input: allow numbers, one decimal point
  let sanitizedValue = value.replace(/[^0-9.]/g, "");
  // Ensure only one decimal point
  const decimalCount = sanitizedValue.split(".").length - 1;
  if (decimalCount > 1) {
    sanitizedValue = sanitizedValue.replace(/\.(?=.*\.)/g, "");
  }
  // Limit to 3 decimal places
  if (sanitizedValue.includes(".")) {
    const [integer, decimal] = sanitizedValue.split(".");
    if (decimal.length > 3) {
      sanitizedValue = `${integer}.${decimal.slice(0, 3)}`;
    }
  }

  const pi = piData.find((item) => item.id === Number(piId));
  const paymentBalance = parseFloat(pi?.open_balance || 0); // Uses payment_balance from piData

  // Restrict payment input to payment_balance
  let validValue = sanitizedValue;
  const numericValue = parseFloat(sanitizedValue);
  if (!isNaN(numericValue) && numericValue > paymentBalance) {
    validValue = paymentBalance.toFixed(3);
  }

  setPaymentAmounts((prev) => ({
    ...prev,
    [piId]: validValue,
  }));
  setIsManualInput((prev) => ({ ...prev, [piId]: true }));
};

// Update handleDiscountInputChange to use payment_balance
const handleDiscountInputChange = (piId, value) => {
  // Sanitize input: allow numbers, one decimal point
  let sanitizedValue = value.replace(/[^0-9.]/g, "");
  // Ensure only one decimal point
  const decimalCount = sanitizedValue.split(".").length - 1;
  if (decimalCount > 1) {
    sanitizedValue = sanitizedValue.replace(/\.(?=.*\.)/g, "");
  }
  // Limit to 3 decimal places
  if (sanitizedValue.includes(".")) {
    const [integer, decimal] = sanitizedValue.split(".");
    if (decimal.length > 3) {
      sanitizedValue = `${integer}.${decimal.slice(0, 3)}`;
    }
  }

  const pi = piData.find((item) => item.id === Number(piId));
  const paymentBalance = parseFloat(pi?.open_balance || 0); // Uses payment_balance from piData
  const discountType = discountTypes[piId] || "$";

  // Restrict discount input based on type
  let validValue = sanitizedValue;
  const numericValue = parseFloat(sanitizedValue);
  if (discountType === "$" && !isNaN(numericValue) && numericValue > paymentBalance) {
    validValue = paymentBalance.toFixed(3);
  } else if (discountType === "%" && !isNaN(numericValue) && numericValue > 100) {
    validValue = "100.000";
  }

  setDiscountInputs((prev) => ({
    ...prev,
    [piId]: validValue,
  }));

  // Only update payment amount if not manually edited
  if (!isManualInput[piId]) {
    const discountValue = parseFloat(validValue || 0);
    let paymentAmount = paymentBalance;

    if (discountType === "$") {
      paymentAmount = paymentBalance - discountValue;
    } else if (discountType === "%") {
      paymentAmount = paymentBalance - (paymentBalance * discountValue) / 100;
    }

    setPaymentAmounts((prev) => ({
      ...prev,
      [piId]: formatToThreeDecimals(paymentAmount),
    }));
  }
};

// Update handleDiscountTypeChange to use payment_balance
const handleDiscountTypeChange = (piId, value) => {
  setDiscountTypes((prev) => ({
    ...prev,
    [piId]: value,
  }));

  // Validate and adjust discount value based on new type
  const pi = piData.find((item) => item.id === Number(piId));
  const paymentBalance = parseFloat(pi?.open_balance || 0); // Uses payment_balance from piData
  const currentDiscount = parseFloat(discountInputs[piId] || 0);
  let validDiscount = currentDiscount;

  if (value === "$" && !isNaN(currentDiscount) && currentDiscount > paymentBalance) {
    validDiscount = paymentBalance;
    setDiscountInputs((prev) => ({
      ...prev,
      [piId]: paymentBalance.toFixed(3),
    }));
  } else if (value === "%" && !isNaN(currentDiscount) && currentDiscount > 100) {
    validDiscount = 100;
    setDiscountInputs((prev) => ({
      ...prev,
      [piId]: "100.000",
    }));
  } else {
    // Ensure current discount is formatted to 3 decimal places
    setDiscountInputs((prev) => ({
      ...prev,
      [piId]: formatToThreeDecimals(currentDiscount),
    }));
  }

  // Only update payment amount if not manually edited
  if (!isManualInput[piId]) {
    let paymentAmount = paymentBalance;

    if (value === "$") {
      paymentAmount = paymentBalance - validDiscount;
    } else if (value === "%") {
      paymentAmount = paymentBalance - (paymentBalance * validDiscount) / 100;
    }

    setPaymentAmounts((prev) => ({
      ...prev,
      [piId]: formatToThreeDecimals(paymentAmount),
    }));
  }
};

// Update useEffect for subtotal and totalDiscount to use payment_balance
useEffect(() => {
  // Calculate subtotal based on discount conditions
  const calculatedSubtotal = Object.keys(checkedItems).reduce((sum, piId) => {
    if (!checkedItems[piId]) return sum;
    const pi = piData.find((item) => item.id === Number(piId));
    const paymentBalance = parseFloat(pi?.open_balance || 0); // Uses payment_balance from piData
    const discountValue = parseFloat(discountInputs[piId] || 0);

    // If discount exists and is not 0, use payment_balance; otherwise, use payment amount
    if (discountValue > 0) {
      return sum + paymentBalance;
    } else {
      const paymentAmount = isManualInput[piId]
        ? parseFloat(paymentAmounts[piId] || 0)
        : paymentBalance;
      return sum + (isNaN(paymentAmount) ? paymentBalance : paymentAmount);
    }
  }, 0);

  // Calculate total discount
  const calculatedDiscount = Object.keys(discountInputs).reduce((sum, piId) => {
    const pi = piData.find((item) => item.id === Number(piId));
    const paymentBalance = parseFloat(pi?.open_balance || 0); // Uses payment_balance from piData
    const discountValue = parseFloat(discountInputs[piId] || 0);
    let discountAmount = 0;

    if (discountTypes[piId] === "$") {
      discountAmount = discountValue;
    } else if (discountTypes[piId] === "%") {
      discountAmount = (paymentBalance * discountValue) / 100;
    }

    return sum + (isNaN(discountAmount) ? 0 : discountAmount);
  }, 0);

  setSubtotal(calculatedSubtotal);
  setTotalDiscount(calculatedDiscount);

  // Update formData for grand_total and amount_paid
  const grandTotal = calculatedSubtotal - calculatedDiscount;
  setFormData((prev) => ({
    ...prev,
    amount: grandTotal.toFixed(3),
    open_balance: grandTotal.toFixed(3),
    discount: calculatedDiscount.toFixed(3),
  }));
}, [checkedItems, paymentAmounts, isManualInput, discountInputs, discountTypes, piData]);
// Calculate total of checked items
const calculateCheckedTotal = () => {
  return piData.reduce((total, pi) => {
    if (checkedItems[pi.id]) {
      return total + (Number(pi.open_balance) || 0);
    }
    return total;
  }, 0);
};

// Then you can use this in your form data:
useEffect(() => {
  if (Object.keys(checkedItems).length > 0) {
    const total = calculateCheckedTotal();
    setFormData(prev => ({
      ...prev,
      amount: total.toFixed(3),
      open_balance: total.toFixed(3)
    }));
  }
}, [checkedItems]);

  // State for drag-and-drop and file uploads for reference_payment
const [thumbnails, setThumbnails] = useState([]);
const [thumbnailDragging, setThumbnailDragging] = useState(false);


// Format file name for display
const formatFileName = (name) => {
  if (!name) return '';
  return name.length > 20 ? `${name.substring(0, 17)}...` : name;
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle file selection via input
const handleThumbnailChange = (files) => {
  const newThumbnails = Array.from(files).map((file) => ({
    id: Math.random().toString(36).substr(2, 9), // Unique ID for each file
    name: file.name,
    size: file.size,
    preview: URL.createObjectURL(file),
    isNew: true,
    loading: true,
    progress: 0,
    estimatedTime: 5, // Simulated upload time in seconds
  }));

  // ដាក់រូបថ្មីនៅខាងដើមបញ្ជី (លើគេ)
  setThumbnails((prev) => [...newThumbnails, ...prev]);

  // Simulate upload progress for each new file
  newThumbnails.forEach((thumbnail) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setThumbnails((prev) =>
        prev.map((t) =>
          t.id === thumbnail.id
            ? { ...t, progress, estimatedTime: Math.max(0, t.estimatedTime - 0.5) }
            : t
        )
      );
      if (progress >= 100) {
        clearInterval(interval);
        setThumbnails((prev) =>
          prev.map((t) => (t.id === thumbnail.id ? { ...t, loading: false } : t))
        );
      }
    }, 500); // Update progress every 500ms
  });
};

// Handle file drop
const handleThumbnailDrop = (e) => {
  e.preventDefault();
  setThumbnailDragging(false);
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleThumbnailChange(files);
  }
};

// Remove or restore a thumbnail
const removeThumbnail = (index) => {
  setThumbnails((prev) => {
    const thumbnail = prev[index];
    if (thumbnail.isNew) {
      // For new images, remove them entirely from the array
      return prev.filter((_, i) => i !== index);
    } else {
      // For database images, toggle markedForDeletion
      return prev.map((t, i) =>
        i === index
          ? { ...t, markedForDeletion: !t.markedForDeletion }
          : t
      );
    }
  });
};

  // Initialize company filters
// Initialize company filters
useEffect(() => {
  const initialCompanyFilters = {};
  companies.forEach((company) => {
    // Preserve existing checked state if company already exists in filters
    initialCompanyFilters[company.id] = companyFilters[company.id] !== undefined
      ? companyFilters[company.id]
      : true;
  });
  setCompanyFilters(initialCompanyFilters);
}, [companies]);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    tran_type: true,
    tran_date: true,
    number: true,
    name: true,
    amount: true,
    open_balance: true,
    memo: true,
    status: true,
    company: true,
  });

  // Column widths
  const [columnWidths, setColumnWidths] = useState({
    tran_type: 100,
    tran_date: 120,
    number: 100,
    name: 150,
    amount: 100,
    open_balance: 120,
    memo: 200,
    status: 100,
    company: 150,
  });

  // Static options for DropdownInput
  const statusOptions = [
    { id: 1, name: t("payment_manage.all") },
    { id: 2, name: t("payment_manage.open") },
    { id: 3, name: t("payment_manage.close") },
  ];

  const [selectedStatus, setSelectedStatus] = useState(1);

  // Handler for dropdown change
// Handler for dropdown change
const handleStatusChange = (e) => {
  const newStatus = Number(e.target.value);
  setSelectedStatus(newStatus);
  setCurrentPage(1);

  const filterParams = {
    page: 1,
    perPage: entriesPerPage,
    search: searchQuery,
    searchField: selectedSearchField,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    tranType: Object.keys(tranTypeFilters).filter((key) => tranTypeFilters[key]).length < 2
      ? tranTypeFilters.pi ? '1' : '2'
      : undefined,
    status: Object.keys(statusFilters).filter((key) => statusFilters[key]).length === 1
      ? statusFilters.Completed ? '1' : '0,null'
      : undefined,
    companyIds: Object.keys(companyFilters).filter((key) => companyFilters[key]).length < companies.length
      ? Object.keys(companyFilters).filter((key) => companyFilters[key]).join(',')
      : undefined,
  };

  // Add openbalance filter based on selected status
  if (newStatus === 2) {
    // Open: openbalance not equal to 0 or null
    filterParams.openBalanceFilter = 'open';
  } else if (newStatus === 3) {
    // Close: openbalance equal to 0 or null
    filterParams.openBalanceFilter = 'close';
  } else {
    // All: no specific openbalance filter
    filterParams.openBalanceFilter = undefined;
  }

  // Send request to backend
  router.get('/payment', filterParams, { preserveState: true });
};

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

  // Utility function to calculate popup position
  const calculatePopupPosition = (ref, popupWidth) => {
    if (!ref.current) return { top: 0, left: 0, transformOrigin: 'center top', horizontal: 'right' };

    const rect = ref.current.querySelector('.cursor-pointer')?.getBoundingClientRect() || ref.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const spaceOnRight = viewportWidth - (rect.left + rect.width);
    const spaceOnLeft = rect.left;

    const horizontal = spaceOnRight >= popupWidth || spaceOnRight > spaceOnLeft ? 'right' : 'left';
    const leftPosition = horizontal === 'right'
      ? rect.left + rect.width / 2 - popupWidth / 2
      : rect.left + rect.width / 2 - popupWidth + 20;

    return {
      top: rect.bottom + window.scrollY + 10,
      left: Math.max(10, Math.min(leftPosition, viewportWidth - popupWidth - 10)),
      transformOrigin: horizontal === 'right' ? 'center top' : 'right top',
      horizontal,
    };
  };


  // Add to existing state declarations
// Update paymentMethodOptions to match backend values
  const [paymentMethodOptions] = useState([
    { id: 1, name: "Bank" },
    { id: 2, name: "Cash" },
  ]);
const [selectedCompany, setSelectedCompany] = useState(null);

const [generatedPaymentNumber, setGeneratedPaymentNumber] = useState('');
// Add to the component
const generatePaymentNumber = async () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  let unique = false;
  let newPaymentNumber = '';

  while (!unique) {
    const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase(); // Random 4 chars
    newPaymentNumber = `#eze${dateStr}${randomStr}`;

    // Check if the payment number already exists via an API call
    try {
      const response = await fetch(`/check-payment-number/${newPaymentNumber}`);
      const result = await response.json();
      if (!result.exists) {
        unique = true;
      }
    } catch (error) {
      console.error('Error checking payment number:', error);
      break;
    }
  }

  setGeneratedPaymentNumber(newPaymentNumber);
  setFormData((prev) => ({ ...prev, number: newPaymentNumber }));
};

// Call this when opening the add/edit popup
useEffect(() => {
  if (isPopupOpen && !isEditMode) {
    generatePaymentNumber();
  }
}, [isPopupOpen, isEditMode]);


// Add to the component
const fetchPiData = async (companyId) => {
  try {
    setIsLoading(true);
    const response = await fetch(`/fetch-pi/${companyId}`);
    const data = await response.json();
    setPiData(data);
  } catch (error) {
    console.error('Error fetching PI data:', error);
    showErrorAlert({
      title: t("error"),
      message: t("payment_manage.error_fetching_pi"),
      darkMode,
    });
  } finally {
    setIsLoading(false);
  }
};

// Update company selection handler
const handleCompanyChange = (e) => {
    const companyId = Number(e.target.value);
    const selected = companies.find((c) => c.id === companyId);
    setSelectedCompany(companyId);
    setFormData((prev) => ({ ...prev, company_id: companyId }));
    if (companyId) {
      fetchPiData(companyId);
    } else {
      setPiData([]);
    }
};

const handlePaymentMethodChange = (e) => {
    setFormData((prev) => ({ ...prev, payment_method: e.target.value }));
};


  // Apply filters
const applyFilters = () => {
  setIsLoading(true);

  const filterParams = {
    page: 1,
    perPage: entriesPerPage,
    search: searchQuery,
    searchField: selectedSearchField,
  };

  // Date filters
  if (startDate) {
    filterParams.startDate = startDate;
  }
  if (endDate) {
    filterParams.endDate = endDate;
  }

  // Tran type filters
  const activeTranTypes = Object.keys(tranTypeFilters).filter((key) => tranTypeFilters[key]);
  if (activeTranTypes.length > 0 && activeTranTypes.length < 2) {
    filterParams.tranType = activeTranTypes[0] === 'pi' ? '1' : '2';
  }

  // Status filters
  const activeStatuses = Object.keys(statusFilters).filter((key) => statusFilters[key]);
  if (activeStatuses.length === 1) {
    // If only one status is selected
    if (activeStatuses[0] === 'Completed') {
      filterParams.status = '1'; // Only Completed
    } else if (activeStatuses[0] === 'Pending') {
      filterParams.status = '0,null'; // Pending includes 0 and null
    }
  }
  // If both are selected, do not include status in filterParams to clear the filter

  // Company filters
  const activeCompanies = Object.keys(companyFilters).filter((key) => companyFilters[key]);
  if (activeCompanies.length > 0 && activeCompanies.length < companies.length) {
    filterParams.companyIds = activeCompanies.join(',');
  }

  // Send request to backend
  router.get('/payment', filterParams, { preserveState: true });
};

  // Update data and pagination when props change
  useEffect(() => {
    setData(payments);
    setPagination({
      currentPage: pagination.currentPage,
      perPage: pagination.perPage,
      total: pagination.total,
    });
    setIsLoading(false);
  }, [payments, pagination]);

  // Sort handler
const handleSort = (field) => {
  const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
  setSortField(field);
  setSortDirection(newDirection);
  router.get('/payment', {
    page: 1,
    perPage: entriesPerPage,
    sortField: field,
    sortDirection: newDirection,
    search: searchQuery,
    searchField: selectedSearchField,
    startDate,
    endDate,
    tranType: Object.keys(tranTypeFilters).filter((key) => tranTypeFilters[key]).length < 2
      ? tranTypeFilters.pi ? '1' : '2'
      : undefined,
    status: Object.keys(statusFilters).filter((key) => statusFilters[key]).length === 1
      ? statusFilters.Completed ? '1' : '0,null' // Map Completed to 1, Pending to 0 and null
      : undefined, // Clear status filter if both are selected
    companyIds: Object.keys(companyFilters).filter((key) => companyFilters[key]).length < companies.length
      ? Object.keys(companyFilters).filter((key) => companyFilters[key]).join(',')
      : undefined,
  }, { preserveState: true });
};

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Popup toggle handlers
  const toggleDatePopup = (e) => {
    e.stopPropagation();
    if (isDatePopupOpen) {
      setIsDateAnimatingOut(true);
      setTimeout(() => {
        setIsDatePopupOpen(false);
        setIsDateAnimatingOut(false);
      }, 200);
    } else {
      setDatePopupPosition(calculatePopupPosition(dateHeaderRef, 320));
      setIsDatePopupOpen(true);
    }
  };

  const toggleTranPopup = (e) => {
    e.stopPropagation();
    if (isTranPopupOpen) {
      setIsTranAnimatingOut(true);
      setTimeout(() => {
        setIsTranPopupOpen(false);
        setIsTranAnimatingOut(false);
      }, 200);
    } else {
      setTranPopupPosition(calculatePopupPosition(tranHeaderRef, 224));
      setIsTranPopupOpen(true);
    }
  };

  const toggleStatusPopup = (e) => {
    e.stopPropagation();
    if (isStatusPopupOpen) {
      setIsStatusAnimatingOut(true);
      setTimeout(() => {
        setIsStatusPopupOpen(false);
        setIsStatusAnimatingOut(false);
      }, 200);
    } else {
      setStatusPopupPosition(calculatePopupPosition(statusHeaderRef, 224));
      setIsStatusPopupOpen(true);
    }
  };

const toggleCompanyPopup = (e) => {
  e.stopPropagation();
  if (isCompanyPopupOpen) {
    setIsCompanyAnimatingOut(true);
    setTimeout(() => {
      setIsCompanyPopupOpen(false);
      setIsCompanyAnimatingOut(false);
      // Reset to original filter state when closing without applying
      const initialCompanyFilters = {};
      companies.forEach((company) => {
        initialCompanyFilters[company.id] = true;
      });
      setCompanyFilters(initialCompanyFilters);
    }, 200);
  } else {
    setCompanyPopupPosition(calculatePopupPosition(companyHeaderRef, 224));
    setIsCompanyPopupOpen(true);
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
      setSettingPopupPosition(calculatePopupPosition(settingHeaderRef, 224));
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
      tran_type: true,
      tran_date: true,
      number: true,
      name: true,
      amount: true,
      open_balance: true,
      memo: true,
      status: true,
      company: true,
    });
  };

  // Handlers for CRUD operations
  const openAddPopup = () => {
      setIsEditMode(false);
      setCurrentPayment(null);
      setFormData({
        tran_type: 'Credit',
        tran_date: new Date().toISOString().split('T')[0],
        number: `PAY${String(data.length + 1).padStart(3, '0')}`,
        name: '',
        amount: '',
        open_balance: '',
        memo: '',
        status: 'Pending',
      });
      setIsPopupOpen(true);
  };


// Add to state declarations
const [paymentAprove, setPaymentAprove] = useState(null);

// Update openEditPopup
const openEditPopup = async (payment) => {
  setIsEditing(payment.id);
  setIsEditMode(true);
  setCurrentPayment(payment);

  try {
    const response = await fetch(`/payment/fetch/payment/${payment.id}`);
    const paymentData = await response.json();

    setPaymentAprove(paymentData.aprove);

    setFormData({
      tran_type: paymentData.tran_type || 'Credit',
      tran_date: paymentData.date || new Date().toISOString().split('T')[0],
      number: paymentData.payment_number || '',
      name: paymentData.name || '',
      amount: paymentData.amount || '',
      open_balance: paymentData.open_balance || '',
      memo: paymentData.memo || '',
      status: paymentData.aprove === '1' || paymentData.aprove === 1 ? 'Completed' : 'Pending',
      company_id: paymentData.company_id || '',
      payment_method: paymentData.payment_method || '',
    });

    setSelectedCompany(paymentData.company_id);

    setPiData(
      paymentData.payment_details.map((detail) => ({
        id: detail.pi_id,
        date: detail.date,
        pi_number: detail.pi_number,
        pi_name: detail.pi_name,
        pi_name_cn: detail.pi_name_cn,
        grand_total: parseFloat(detail.grand_total || 0),
        open_balance: parseFloat(detail.payment_balance || 0),
      }))
    );

    if (paymentData.reference_payments && paymentData.reference_payments.length > 0) {
      const newThumbnails = paymentData.reference_payments.map((ref) => ({
        id: ref.id,
        name: ref.image,
        size: 0,
        preview: `/storage/uploads/payment/${ref.image}`,
        isNew: false,
        loading: false,
        markedForDeletion: false,
      }));
      setThumbnails(newThumbnails);
    }

    const newCheckedItems = {};
    const newPaymentAmounts = {};
    const newIsManualInput = {};
    const newDiscountInputs = {};
    const newDiscountTypes = {};

    paymentData.payment_details.forEach((detail) => {
      if (detail.checkbox === 1) {
        newCheckedItems[detail.pi_id] = true;
        newPaymentAmounts[detail.pi_id] = parseFloat(detail.payment || 0).toFixed(3);
        newIsManualInput[detail.pi_id] = detail.payment !== detail.payment_balance;
        newDiscountInputs[detail.pi_id] = parseFloat(detail.discount_payment || 0).toFixed(3);
        newDiscountTypes[detail.pi_id] = detail.status_discount || '$';
      }
    });

    setCheckedItems(newCheckedItems);
    setPaymentAmounts(newPaymentAmounts);
    setIsManualInput(newIsManualInput);
    setDiscountInputs(newDiscountInputs);
    setDiscountTypes(newDiscountTypes);

    setIsPopupOpen(true);
  } catch (error) {
    console.error('Error fetching payment data:', error);
    showErrorAlert({
      title: t('error'),
      message: t('payment_manage.error_fetching_payment'),
      darkMode,
    });
  } finally {
    setIsEditing(null);
  }
};

// Update closePopup
    const closePopup = () => {
        setIsPopupOpen(false);
        setCurrentPayment(null);
        setIsEditMode(false);
        setFormData({
            tran_type: 'Credit',
            tran_date: new Date().toISOString().split('T')[0],
            number: '',
            name: '',
            amount: '',
            open_balance: '',
            payment_method: '',
            company_id: '',
            memo: '',
            status: 'Pending',
        });
        setThumbnails([]);
        setCheckedItems({});
        setPaymentAmounts({});
        setIsManualInput({});
        setDiscountInputs({});
        setDiscountTypes({});
        setSelectedCompany(null);
        setPiData([]);
        setTableSearchQuery('');
        setSubtotal(0);
        setTotalDiscount(0);
        setGeneratedPaymentNumber('');
        setPaymentAprove(null);
    };

    const [hasSavePermission, setHasSavePermission] = useState(false);
    const [hasConfirmPermission, setHasConfirmPermission] = useState(false);
    const [hasApprovePermission, setHasApprovePermission] = useState(false); // New state for approve_payment

    const show_button_save_payment= 59;
    const show_button_confirm_payment= 60;

    const view_payment = 56;
    useEffect(() => {
        checkPermission(view_payment, (hasPermission) => {
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

        checkPermission(show_button_save_payment, (hasPermission) => {
            setHasSavePermission(hasPermission);
        });

        checkPermission(show_button_confirm_payment, (hasPermission) => {
            setHasConfirmPermission(hasPermission);
        });

        checkPermission(approve_payment, (hasPermission) => { // New permission check
            setHasApprovePermission(hasPermission);
        });

    }, []);

    const update_payment = 55;
    const create_payment = 54;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Determine which permission to check based on isEditMode
        const permissionId = isEditMode ? update_payment : create_payment;

        // Check permission before proceeding
        checkPermission(permissionId, async (hasPermission) => {
            if (!hasPermission) {
                showErrorAlert({
                    title: t("error"),
                    message: t("you_do_not_have_permission"),
                    darkMode,
                });
                return;
            }

            // Validate required fields
            if (!formData.company_id || !formData.payment_method) {
                showErrorAlert({
                    title: t("error"),
                    message: t("payment_manage.company_payment_method_required"),
                    darkMode,
                });
                return;
            }

            // Prepare payment details for all PI rows
            const paymentDetails = piData.map((pi) => {
                const isChecked = checkedItems[pi.id] || false;
                return {
                    pi_id: pi.id,
                    checkbox: isChecked ? 1 : null,
                    payment_balance: parseFloat(pi.open_balance || 0),
                    discount_payment: isChecked ? parseFloat(discountInputs[pi.id] || 0) : null,
                    status_discount: isChecked ? (discountTypes[pi.id] || "$") : null,
                    payment: isChecked ? parseFloat(paymentAmounts[pi.id] || 0) : null,
                };
            });

            if (paymentDetails.length === 0) {
                showErrorAlert({
                    title: t("error"),
                    message: t("payment_manage.no_pi_available"),
                    darkMode,
                });
                return;
            }

            setIsSubmitting(true);

            // Prepare form data for submission
            const submitData = new FormData();
            submitData.append('date', formData.tran_date);
            submitData.append('company_id', formData.company_id);
            submitData.append('payment_method', formData.payment_method);
            submitData.append('payment_number', formData.number || generatedPaymentNumber);
            submitData.append('memo', formData.memo || '');
            submitData.append('status', formData.status === 'Completed' ? '1' : '0');

            // Append payment details
            paymentDetails.forEach((detail, index) => {
                submitData.append(`payment_details[${index}][pi_id]`, detail.pi_id);
                submitData.append(`payment_details[${index}][checkbox]`, detail.checkbox ?? '');
                submitData.append(`payment_details[${index}][payment_balance]`, detail.payment_balance);
                if (detail.checkbox) {
                    submitData.append(`payment_details[${index}][discount_payment]`, detail.discount_payment ?? 0);
                    submitData.append(`payment_details[${index}][status_discount]`, detail.status_discount);
                    submitData.append(`payment_details[${index}][payment]`, detail.payment);
                }
            });

            // Append reference payment images
            const imagePromises = thumbnails
                .filter((thumbnail) => !thumbnail.markedForDeletion && thumbnail.isNew)
                .map(async (thumbnail, index) => {
                    const response = await fetch(thumbnail.preview);
                    const blob = await response.blob();
                    const file = new File([blob], thumbnail.name, { type: blob.type });
                    submitData.append(`reference_payments[${index}]`, file);
                });

            // Append IDs of images marked for deletion
            const deletedImages = thumbnails
                .filter((thumbnail) => thumbnail.markedForDeletion && !thumbnail.isNew)
                .map((thumbnail) => thumbnail.id);
            submitData.append('deleted_images', JSON.stringify(deletedImages));

            // Wait for all image processing to complete
            await Promise.all(imagePromises);

            // Determine the route and method
            const route = isEditMode ? `/payment/update/${currentPayment.id}` : '/payment/create';
            const method = isEditMode ? 'post' : 'post';

            // Submit form data using Inertia
            router[method](route, submitData, {
                onSuccess: () => {
                    showSuccessAlert({
                        title: t("success"),
                        message: isEditMode
                            ? t("payment_manage.payment_updated_successfully")
                            : t("payment_manage.payment_created_successfully"),
                        darkMode,
                        timeout: 3000,
                    });
                    closePopup(); // This will clear all popup data
                },
                onError: (errors) => {
                    showErrorAlert({
                        title: t("error"),
                        message: errors.error || (isEditMode
                            ? t("payment_manage.error_updating_payment")
                            : t("payment_manage.error_creating_payment")),
                        darkMode,
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        });
    };


    const [isConfirming, setIsConfirming] = useState(false);

    const approve_payment = 57;

    const handleConfirm = async (e) => {
    e.preventDefault();

    // Check permission before proceeding
    checkPermission(approve_payment, async (hasPermission) => {
        if (!hasPermission) {
        showErrorAlert({
            title: t("error"),
            message: t("you_do_not_have_permission"),
            darkMode,
        });
        return;
        }

        // Validate if status is Completed
        if (formData.status !== 'Completed') {
        showErrorAlert({
            title: t("error"),
            message: t("payment_manage.status_must_be_completed"),
            darkMode,
        });
        return;
        }

        // Validate if in edit mode and payment ID exists
        if (!isEditMode || !currentPayment?.id) {
        showErrorAlert({
            title: t("error"),
            message: t("payment_manage.invalid_payment"),
            darkMode,
        });
        return;
        }

        setIsConfirming(true);

        try {
        // Send request to approve endpoint
        await router.post(`/payment/approve/${currentPayment.id}`, {}, {
            onSuccess: () => {
            showSuccessAlert({
                title: t("success"),
                message: t("payment_manage.payment_approved_successfully"),
                darkMode,
                timeout: 3000,
            });
            closePopup(); // This will clear all popup data
            },
            onError: (errors) => {
            showErrorAlert({
                title: t("error"),
                message: errors.error || t("payment_manage.error_approving_payment"),
                darkMode,
            });
            },
            onFinish: () => {
            setIsConfirming(false);
            },
        });
        } catch (error) {
        showErrorAlert({
            title: t("error"),
            message: t("payment_manage.error_approving_payment"),
            darkMode,
        });
        setIsConfirming(false);
        }
    });
    };

    const delete_payment = 58;

    const handleDelete = (id) => {
    checkPermission(delete_payment, (hasPermission) => {
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
        message: t("payment_manage.confirm_delete_payment"),
        darkMode,
        isLoading: isDeleting === id,
        onConfirm: () => {
            setIsDeleting(id);
            router.delete(`/payment/delete/${id}`, {
            onSuccess: () => {
                // Update local state to remove the deleted payment
                setData((prev) => prev.filter((payment) => payment.id !== id));
                setPagination((prev) => ({
                ...prev,
                total: prev.total - 1,
                }));
                showSuccessAlert({
                title: t("success"),
                message: t("payment_manage.payment_deleted_successfully"),
                darkMode,
                timeout: 3000,
                });
            },
            onError: (errors) => {
                showErrorAlert({
                title: t("error"),
                message: errors.error || t("payment_manage.error_deleting_payment"),
                darkMode,
                });
            },
            onFinish: () => {
                setIsDeleting(null);
            },
            });
        },
        onCancel: () => {
            // Optional: Handle cancel action if needed
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

const handlePageChange = (page) => {
  setCurrentPage(page);
  router.get('/payment', {
    page,
    perPage: entriesPerPage,
    search: searchQuery,
    searchField: selectedSearchField,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    tranType: Object.keys(tranTypeFilters).filter((key) => tranTypeFilters[key]).length < 2
      ? tranTypeFilters.pi ? '1' : '2'
      : undefined,
    status: Object.keys(statusFilters).filter((key) => statusFilters[key]).length === 1
      ? statusFilters.Completed ? '1' : '0,null'
      : undefined,
    companyIds: Object.keys(companyFilters).filter((key) => companyFilters[key]).length < companies.length
      ? Object.keys(companyFilters).filter((key) => companyFilters[key]).join(',')
      : undefined,
    openBalanceFilter: selectedStatus === 2 ? 'open' : selectedStatus === 3 ? 'close' : undefined,
  }, { preserveState: true });
};

const handleEntriesPerPageChange = (e) => {
  const newEntriesPerPage = Number(e.target.value);
  setEntriesPerPage(newEntriesPerPage);
  setCurrentPage(1);
  router.get('/payment', {
    page: 1,
    perPage: newEntriesPerPage,
    search: searchQuery,
    searchField: selectedSearchField,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    tranType: Object.keys(tranTypeFilters).filter((key) => tranTypeFilters[key]).length < 2
      ? tranTypeFilters.pi ? '1' : '2'
      : undefined,
    status: Object.keys(statusFilters).filter((key) => statusFilters[key]).length === 1
      ? statusFilters.Completed ? '1' : '0,null'
      : undefined,
    companyIds: Object.keys(companyFilters).filter((key) => companyFilters[key]).length < companies.length
      ? Object.keys(companyFilters).filter((key) => companyFilters[key]).join(',')
      : undefined,
    openBalanceFilter: selectedStatus === 2 ? 'open' : selectedStatus === 3 ? 'close' : undefined,
  }, { preserveState: true });
};

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
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
        tranHeaderRef.current &&
        !tranHeaderRef.current.contains(event.target) &&
        !event.target.closest(".tran-popup")
      ) {
        setIsTranAnimatingOut(true);
        setTimeout(() => {
          setIsTranPopupOpen(false);
          setIsTranAnimatingOut(false);
        }, 200);
      }
      if (
        statusHeaderRef.current &&
        !statusHeaderRef.current.contains(event.target) &&
        !event.target.closest(".status-popup")
      ) {
        setIsStatusAnimatingOut(true);
        setTimeout(() => {
          setIsStatusPopupOpen(false);
          setIsStatusAnimatingOut(false);
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
      if (
        companyHeaderRef.current &&
        !companyHeaderRef.current.contains(event.target) &&
        !event.target.closest(".company-popup")
      ) {
        setIsCompanyAnimatingOut(true);
        setTimeout(() => {
          setIsCompanyPopupOpen(false);
          setIsCompanyAnimatingOut(false);
        }, 200);
      }
      if (
        !event.target.closest(".search-select") &&
        !event.target.closest(".search-dropdown")
      ) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Click outside handler for action dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-container")) {
        setOpenActionDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keydown handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && isPopupOpen) {
        handleSubmit(e);
      }
      if (e.key === 'Escape') {
        closePopup();
        if (isDatePopupOpen) {
          setIsDateAnimatingOut(true);
          setTimeout(() => {
            setIsDatePopupOpen(false);
            setIsDateAnimatingOut(false);
          }, 200);
        }
        if (isTranPopupOpen) {
          setIsTranAnimatingOut(true);
          setTimeout(() => {
            setIsTranPopupOpen(false);
            setIsTranAnimatingOut(false);
          }, 200);
        }
        if (isStatusPopupOpen) {
          setIsStatusAnimatingOut(true);
          setTimeout(() => {
            setIsStatusPopupOpen(false);
            setIsStatusAnimatingOut(false);
          }, 200);
        }
        if (isSettingPopupOpen) {
          setIsSettingAnimatingOut(true);
          setTimeout(() => {
            setIsSettingPopupOpen(false);
            setIsSettingAnimatingOut(false);
          }, 200);
        }
        if (isCompanyPopupOpen) {
          setIsCompanyAnimatingOut(true);
          setTimeout(() => {
            setIsCompanyPopupOpen(false);
            setIsCompanyAnimatingOut(false);
          }, 200);
        }
        setIsSelectOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPopupOpen, isDatePopupOpen, isTranPopupOpen, isStatusPopupOpen, isSettingPopupOpen, isCompanyPopupOpen, formData]);

  // ECharts for Pie Chart
  useEffect(() => {
    const chartDom = document.getElementById("pieChart");
    const myChart = echarts.init(chartDom, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });

    const getTotal = (selected) => {
      const total = pieChartData
        .filter(item => selected[item.name])
        .reduce((sum, item) => sum + item.value, 0);
      return `$${total.toFixed(3)}`;
    };

    const defaultSelected = {};
    pieChartData.forEach(item => defaultSelected[item.name] = true);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const seriesName = t('payment_manage.open_balance_by_company');
          const name = params.name;
          const value = params.value.toFixed(3);
          return `${seriesName}<br />${name}: $${value}`;
        }
      },
      legend: {
        orient: 'vertical',
        right: '0',
        top: 'center',
        icon: 'circle',
        textStyle: {
          fontSize: 14,
          color: darkMode ? '#fff' : '#374151',
        },
      },
      series: [
        {
          name: t('payment_manage.open_balance_by_company'),
          type: 'pie',
          radius: ['55%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          padAngle: 1,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: `{total|${getTotal(defaultSelected)}}`,
            rich: {
              total: {
                fontSize: 18,
                fontWeight: 'bold',
                color: darkMode ? '#fff' : '#374151',
              },
            },
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: { show: false },
          data: pieChartData,
        },
      ],
    };

    myChart.setOption(option);

    myChart.on('legendselectchanged', (e) => {
      const selected = e.selected;
      const total = getTotal(selected);
      option.series[0].label.formatter = `{total|${total}}`;
      myChart.setOption(option);
    });

    const handleResize = () => myChart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, [darkMode, t, pieChartData]);

  // ECharts for Line Chart
  useEffect(() => {
    const chartDom = document.getElementById('LineRace');
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });

    const years = [...new Set(
      lineChartData.flatMap(company => Object.keys(company.data))
    )].sort();

    const data = lineChartData.reduce((acc, company) => {
      const companyData = years.map(year => company.data[year] || 0);
      acc[company.company_name] = companyData;
      return acc;
    }, {});

    const stringToColor = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const r = (hash & 0xFF0000) >> 16;
      const g = (hash & 0x00FF00) >> 8;
      const b = hash & 0x0000FF;
      const adjust = (color) => Math.min(255, Math.max(100, color));
      return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
    };

    const formatNumber = (value) => {
      if (!value) return '$0.000';
      const parts = value.toFixed(3).split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `$${integerPart}.${parts[1]}`;
    };

    const option = {
      title: {
        text: t('payment_manage.company_annual_expenses'),
        left: 'center',
        textStyle: {
          color: darkMode ? '#fff' : '#000',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const year = params[0].name;
          let result = `${t('payment_manage.company_annual_expenses')}<br />Year: ${year}<br />`;
          params.forEach(param => {
            result += `${param.seriesName}: ${formatNumber(param.value)}<br />`;
          });
          return result;
        },
      },
      legend: {
        data: lineChartData.map(company => company.company_name),
        top: 'bottom',
        textStyle: {
          color: darkMode ? '#fff' : '#000',
        },
      },
      xAxis: {
        type: 'category',
        data: years,
        axisLabel: {
          color: darkMode ? '#fff' : '#000',
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: darkMode ? '#fff' : '#000',
          formatter: function (value) {
            return formatNumber(value);
          },
        },
      },
      series: lineChartData.map(company => ({
        name: company.company_name,
        type: 'line',
        data: years.map(year => company.data[year] || 0),
        smooth: true,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: stringToColor(company.company_name),
        },
      })),
    };

    myChart.setOption(option);

    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [darkMode, t, lineChartData]);

  const sortableColumns = [
    { key: 'tran_type', label: t("payment_manage.tran_type") },
    { key: 'tran_date', label: t("payment_manage.tran_date") },
    { key: 'number', label: t("payment_manage.number") },
    { key: 'name', label: t("payment_manage.name") },
    { key: 'company', label: t("company") },
    { key: 'amount', label: t("payment_manage.amount") },
    { key: 'open_balance', label: t("payment_manage.open_balance") },
    { key: 'memo', label: t("payment_manage.memo") },
    { key: 'status', label: t("payment_manage.status") },
  ];

  const allColumns = sortableColumns;

  return (
    <>
      <Head title={t("payment_manage.title")} />
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
                        <div className="relative w-[40%] flex items-center space-x-0">
                        <div className="relative w-[25%] search-select">
                            <div
                            className={`w-full p-[0.69rem] truncate uppercase text-[12px] pl-4 pr-8 rounded-l-lg border-r-0 focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${getDarkModeClass(
                                darkMode,
                                "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                            )}`}
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            >
                            {selectedSearchField === "Code_Payment"
                                ? t("payment_manage.code_payment")
                                : selectedSearchField === "PI_Number"
                                ? t("payment_manage.pi_number")
                                : t("payment_manage.pi_name")}
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
                                className={`absolute top-full left-0 w-full rounded-b-lg shadow-lg z-50 transition-all duration-200 ease-in-out transform search-dropdown ${getDarkModeClass(
                                darkMode,
                                "bg-[#2D2D2D] text-gray-200 border border-gray-700",
                                "bg-white text-gray-900 border border-gray-300"
                                )}`}
                            >
                                {[
                                { key: "Code_Payment", label: t("payment_manage.code_payment") },
                                { key: "PI_Number", label: t("payment_manage.pi_number") },
                                { key: "PI_Name", label: t("payment_manage.pi_name") },
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
                                selectedSearchField === "Code_Payment"
                                ? t("payment_manage.search_code_payment")
                                : selectedSearchField === "PI_Number"
                                ? t("payment_manage.search_pi_number")
                                : t("payment_manage.search_pi_name")
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
                    <div className="flex w-full gap-2">
                        <div id="LineRace" className="w-[70%] mb-1"></div>
                        <div id="pieChart" className="w-[30%] h-[18rem] mb-1"></div>
                    </div>
                    <div className="flex w-full mb-2">
                        <div className="w-[90%]">
                        <button
                            onClick={openAddPopup}
                            className={`flex items-center text-sm px-4 py-2 rounded-lg transition ${getDarkModeClass(
                                darkMode,
                                "bg-[#3A3A3A] text-gray-200 hover:bg-[#4A4A4A]",
                                "bg-[#ff8800] text-white hover:bg-[#f7b500]"
                            )}`}
                        >
                            <svg
                            className="w-5 h-5 mr-2"
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
                            {t("payment_manage.add_payment")}
                        </button>
                        </div>
                        <div className="w-[10%]">
                        <DropdownInput
                            name="statusFilter"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            options={statusOptions}
                            darkMode={darkMode}
                            className="w-full"
                        />
                        </div>
                    </div>
                    <div className="relative overflow-x-auto rounded-lg text-sm h-[calc(100vh-14rem)] mx-auto custom-scrollbar">
                        <div className="w-full min-w-max">
                        <table className="w-full text-[10px] border-collapse" ref={tableRef}>
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
                                        column.key === 'tran_type' ? tranHeaderRef :
                                        column.key === 'tran_date' ? dateHeaderRef :
                                        column.key === 'status' ? statusHeaderRef :
                                        column.key === 'company' ? companyHeaderRef : null
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
                                        {(column.key === 'tran_type' || column.key === 'tran_date' || column.key === 'status' || column.key === 'company') && (
                                        <span
                                            className={`ml-1 inline-flex items-center justify-center w-7 h-7 rounded-full cursor-pointer ${getDarkModeClass(
                                            darkMode,
                                            "hover:bg-[#3A3A3A] text-gray-300",
                                            "hover:bg-[#e07b00] text-white"
                                            )}`}
                                            onClick={
                                            column.key === 'tran_type' ? toggleTranPopup :
                                            column.key === 'tran_date' ? toggleDatePopup :
                                            column.key === 'status' ? toggleStatusPopup :
                                            toggleCompanyPopup
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
                                style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}
                                className={`p-3 pr-0 pl-0 text-left sticky top-0 z-10 relative ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300",
                                    "bg-[#ff8800] text-white"
                                )}`}
                                >
                                <div className="flex pl-2 items-center" ref={settingHeaderRef}>
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
                                        data.map((payment, index) => {
                                        // Determine if the row is a PI record with openbalance = 0 or null
                                        const isPiWithZeroOrNullBalance =
                                            payment.tran_type === '1' &&
                                            (payment.open_balance == null || parseFloat(payment.open_balance) === 0);

                                        return (
                                            <tr
                                            key={payment.id}
                                            className={`border-b cursor-pointer ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                            )} ${isPiWithZeroOrNullBalance ? 'text-color-blue' : ''}`}
                                            >
                                            {visibleColumns.tran_type && (
                                                <td
                                                style={{
                                                    width: `${columnWidths.tran_type}px`,
                                                    minWidth: `${columnWidths.tran_type}px`,
                                                    maxWidth: `${columnWidths.tran_type}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {payment.tran_type === '1' ? t("purchase_invoice") : t("payment_manage.payment")}
                                                </td>
                                            )}
                                            {visibleColumns.tran_date && (
                                                <td
                                                style={{
                                                    width: `${columnWidths.tran_date}px`,
                                                    minWidth: `${columnWidths.tran_date}px`,
                                                    maxWidth: `${columnWidths.tran_date}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {formatDate(payment.tran_date)}
                                                </td>
                                            )}
                                            {visibleColumns.number && (
                                                <td
                                                style={{
                                                    width: `${columnWidths.number}px`,
                                                    minWidth: `${columnWidths.number}px`,
                                                    maxWidth: `${columnWidths.number}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {payment.number ? (
                                                    <Clipboard darkMode={darkMode} textToCopy={payment.number}>
                                                    <Bellypopover darkMode={darkMode}>
                                                        <span
                                                        className={isPiWithZeroOrNullBalance ? '' : `label-Purple ${darkMode ? 'label-Purple-darkmode' : ''}`}
                                                        data-belly-caption={payment.number}
                                                        >
                                                        {payment.number && payment.number.length > 15
                                                            ? `${payment.number.substring(0, 12)}...`
                                                            : payment.number || ""}
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
                                                {payment.name ? (
                                                    <Clipboard darkMode={darkMode} textToCopy={payment.name}>
                                                    <Bellypopover darkMode={darkMode}>
                                                        <span
                                                        className={isPiWithZeroOrNullBalance ? '' : `label-green ${getDarkModeClass(
                                                            darkMode,
                                                            "label-green-darkmode",
                                                            ""
                                                        )}`}
                                                        data-belly-caption={payment.name}
                                                        >
                                                        {payment.name && payment.name.length > 15
                                                            ? `${payment.name.substring(0, 12)}...`
                                                            : payment.name || ""}
                                                        </span>
                                                    </Bellypopover>
                                                    </Clipboard>
                                                ) : ""}
                                                </td>
                                            )}
                                            {visibleColumns.company && (
                                                <td
                                                style={{
                                                    width: `${columnWidths.company}px`,
                                                    minWidth: `${columnWidths.company}px`,
                                                    maxWidth: `${columnWidths.company}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {payment.company_name || "N/A"}
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
                                                {payment.amount ? `$${payment.amount.toFixed(3)}` : "$0"}
                                                </td>
                                            )}
                                            {visibleColumns.open_balance && (
                                                <td
                                                style={{
                                                    width: `${columnWidths.open_balance}px`,
                                                    minWidth: `${columnWidths.open_balance}px`,
                                                    maxWidth: `${columnWidths.open_balance}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {payment.open_balance ? `$${payment.open_balance.toFixed(3)}` : "$0"}
                                                </td>
                                            )}
                                            {visibleColumns.memo && (
                                                <td
                                                style={{
                                                    width: `${columnWidths.memo}px`,
                                                    minWidth: `${columnWidths.memo}px`,
                                                    maxWidth: `${columnWidths.memo}px`,
                                                }}
                                                className="p-3 truncate-text"
                                                >
                                                {payment.memo ? (
                                                    <Bellypopover darkMode={darkMode}>
                                                    <span
                                                        className={isPiWithZeroOrNullBalance ? '' : `label-pink ${getDarkModeClass(
                                                        darkMode,
                                                        "label-pink-darkmode",
                                                        ""
                                                        )}`}
                                                        data-belly-caption={payment.memo}
                                                    >
                                                        {payment.memo && payment.memo.length > 30
                                                        ? `${payment.memo.substring(0, 27)}...`
                                                        : payment.memo || ""}
                                                    </span>
                                                    </Bellypopover>
                                                ) : (
                                                    ""
                                                )}
                                                </td>
                                            )}
                                            {visibleColumns.status && (
                                                <td
                                                    style={{
                                                        width: `${columnWidths.status}px`,
                                                        minWidth: `${columnWidths.status}px`,
                                                        maxWidth: `${columnWidths.status}px`,
                                                    }}
                                                    className="p-3 truncate-text"
                                                >
                                                    {payment.tran_type !== '1' ? (
                                                        <>
                                                            <span
                                                                className={
                                                                    payment.aprove == '1' || payment.aprove === 1
                                                                        ? `label-green ${getDarkModeClass(darkMode, 'label-green-darkmode', '')}`
                                                                        : `label-orange ${getDarkModeClass(darkMode, 'label-orange-darkmode', '')}`
                                                                }
                                                            >
                                                                {payment.aprove == '1' || payment.aprove === 1 ? t('completed') : t('pending')}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        ""
                                                    )}
                                                </td>
                                            )}
                                            <td
                                                style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}
                                                className="p-3"
                                            >
                                                {payment.tran_type !== '1' && (
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
                                                        onClick={() => openEditPopup(payment)}
                                                        disabled={isEditing === payment.id}
                                                        className={`w-full text-left hover:rounded px-4 py-2 text-sm flex items-center ${getDarkModeClass(
                                                            darkMode,
                                                            "hover:bg-[#3A3A3A]",
                                                            "hover:bg-gray-100"
                                                        )} ${
                                                            isEditing === payment.id
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : ''
                                                        }`}
                                                        >
                                                        {isEditing === payment.id ? (
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
                                                        onClick={() => handleDelete(payment.id)}
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
                                                )}
                                            </td>
                                            </tr>
                                        );
                                        })
                                    )}
                                </tbody>
                            )}
                        </table>
                        </div>
                    </div>
                    <Pagination
                        darkMode={darkMode}
                        currentPage={currentPage}
                        totalEntries={paginationState.total}
                        entriesPerPage={entriesPerPage}
                        onPageChange={handlePageChange}
                        onEntriesPerPageChange={handleEntriesPerPageChange}
                    />
                    </div>
                    {/* Date Popup */}
                    <DatePopup
                        darkMode={darkMode}
                        isDatePopupOpen={isDatePopupOpen}
                        isDateAnimatingOut={isDateAnimatingOut}
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        datePopupPosition={datePopupPosition}
                        toggleDatePopup={toggleDatePopup}
                        applyFilters={applyFilters}
                    />
                    {/* Tran Type Popup */}
                    <TranPopup
                        darkMode={darkMode}
                        isTranPopupOpen={isTranPopupOpen}
                        isTranAnimatingOut={isTranAnimatingOut}
                        tranTypeFilters={tranTypeFilters}
                        setTranTypeFilters={setTranTypeFilters}
                        tranPopupPosition={tranPopupPosition}
                        toggleTranPopup={toggleTranPopup}
                        applyFilters={applyFilters}
                    />
                    {/* Status Popup */}
                    <StatusPopup
                        darkMode={darkMode}
                        isStatusPopupOpen={isStatusPopupOpen}
                        isStatusAnimatingOut={isStatusAnimatingOut}
                        statusFilters={statusFilters}
                        setStatusFilters={setStatusFilters}
                        statusPopupPosition={statusPopupPosition}
                        toggleStatusPopup={toggleStatusPopup}
                        applyFilters={applyFilters}
                    />
                    {/* Company Popup */}
                    {isCompanyPopupOpen && (
                        <div
                            className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
                            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                            } company-popup`}
                            style={{
                            top: `${companyPopupPosition.top}px`,
                            left: `${companyPopupPosition.left}px`,
                            transformOrigin: companyPopupPosition.transformOrigin,
                            animation: isCompanyAnimatingOut
                                ? 'shrinkToPoint 0.2s ease-out forwards'
                                : 'growFromPoint 0.2s ease-out forwards',
                            }}
                        >
                            <div className="p-4">
                            <h3 className="text-center font-semibold mb-4">{t("payment_manage.filter_by_company")}</h3>
                            <div className="space-y-3">
                                {companies.map((company) => (
                                <label
                                    key={company.id}
                                    className={`flex items-center space-x-3 text-sm cursor-pointer transition-colors duration-150 ${
                                    darkMode ? "text-gray-300" : "text-gray-700"
                                    } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                                >
                                    <input
                                    type="checkbox"
                                    checked={companyFilters[company.id] || false}
                                    onChange={() => {
                                        setCompanyFilters((prev) => ({
                                        ...prev,
                                        [company.id]: !prev[company.id],
                                        }));
                                    }}
                                    className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                                    />
                                    <span>{company.company_name}</span>
                                </label>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between space-x-2">
                                <button
                                onClick={() => {
                                        applyFilters();
                                        // Close popup after applying
                                        setIsCompanyAnimatingOut(true);
                                        setTimeout(() => {
                                        setIsCompanyPopupOpen(false);
                                        setIsCompanyAnimatingOut(false);
                                        }, 200);
                                    }}
                                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                    darkMode
                                    ? "bg-orange-600 text-white hover:bg-orange-700"
                                    : "bg-orange-500 text-white hover:bg-orange-600"
                                }`}
                                >
                                {t("payment_manage.apply")}
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
                    {/* Setting Popup */}
                    <SettingPopup
                        darkMode={darkMode}
                        isSettingPopupOpen={isSettingPopupOpen}
                        isSettingAnimatingOut={isSettingAnimatingOut}
                        columnSearchQuery={columnSearchQuery}
                        setColumnSearchQuery={setColumnSearchQuery}
                        visibleColumns={visibleColumns}
                        handleColumnVisibilityChange={handleColumnVisibilityChange}
                        handleResetColumns={handleResetColumns}
                        settingPopupPosition={settingPopupPosition}
                        toggleSettingPopup={toggleSettingPopup}
                        allColumns={allColumns}
                    />
                <div
                    id="payment-popup"
                    className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
                        isPopupOpen ? "bg-opacity-60 opacity-100 visible" : "bg-opacity-0 opacity-0 invisible"
                    }`}
                    >
                    <div
                        className={`shadow-2xl w-full h-full flex flex-col transform transition-all duration-300 ease-in-out ${getDarkModeClass(
                        darkMode,
                        "bg-[#1A1A1A] text-gray-200",
                        "bg-white text-gray-900"
                        )} ${
                        isPopupOpen
                            ? "scale-100 translate-y-0 opacity-100"
                            : "scale-95 -translate-y-4 opacity-0"
                        } popup-content`}
                    >
                        <form id="payment-form" onSubmit={handleSubmit} encType="multipart/form-data" className="custom-scrollbar overflow-y-auto">
                            {/* Header */}
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
                                    d={isEditMode
                                        ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-6.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        : "M12 4v16m8-8H4"}
                                    />
                                </svg>
                                {isEditMode ? t("payment_manage.edit_payment") : t("payment_manage.add_payment")}
                                </h2>
                            </div>

                            {/* Main Content with Two Rows */}
                            <div className="flex-1 text-[10px] overflow-y-auto p-6 pt-0 custom-scrollbar">
                                <div className="space-y-6">
                                    {/* Row 1: 4-Column Layout with Textbox and Label */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="flex flex-col">
                                        <label
                                            className={`mb-1 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.date")}
                                        </label>
                                        <MuiStyleDatePicker
                                            value={formData.tran_date}
                                            onChange={(newValue) => setFormData({ ...formData, tran_date: newValue })}
                                            darkMode={darkMode}
                                            style={{
                                            border: `1px solid ${darkMode ? '#4A4A4A' : '#E0E0E0'}`,
                                            borderRadius: '0.375rem',
                                            backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                                            }}
                                        />
                                        <label
                                            className={`mb-1 mt-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.amount_paid")}
                                        </label>
                                        <div className="relative">
                                            <input
                                            type="text"
                                            readOnly
                                            value={(subtotal - totalDiscount).toFixed(3)}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
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
                                        <label
                                            className={`mt-3 mb-1 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.payment_method")}
                                        </label>
                                        <DropdownInput
                                            name="paymentMethod"
                                            value={formData.payment_method || 0}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                            options={paymentMethodOptions}
                                            darkMode={darkMode}
                                            className="w-full"
                                        />
                                        <label
                                            className={`mt-3 mb-1 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("company")}
                                        </label>
                                        <DropdownInput
                                            name="company"
                                            value={selectedCompany || 0}
                                            onChange={handleCompanyChange}
                                            options={[
                                            ...companies.map((company) => ({
                                                id: company.id,
                                                name: company.company_name,
                                            })),
                                            ]}
                                            darkMode={darkMode}
                                            className="w-full"
                                        />
                                        </div>
                                        <div className="flex flex-col">
                                        <label
                                            className={`mb-1 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.number")}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.number || generatedPaymentNumber}
                                            readOnly
                                            className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                        />
                                        <label
                                            className={`mb-1 mt-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.memo")}
                                        </label>
                                        <textarea
                                            className={`w-full h-[10rem] border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                            )}`}
                                            placeholder={t("payment_manage.enter_memo")}
                                            value={formData.memo}
                                            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                                        />
                                        </div>
                                        <div className="flex flex-col">
                                        <label
                                            className={`mb-1 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.subtotal")}
                                        </label>
                                        <div className="relative">
                                            <input
                                            type="text"
                                            readOnly
                                            value={subtotal.toFixed(3)}
                                            className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
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
                                        <label
                                            className={`mb-1 mt-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.discount")}
                                        </label>
                                        <div className="relative">
                                            <input
                                            type="text"
                                            readOnly
                                            value={totalDiscount.toFixed(3)}
                                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                            className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
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
                                        <label
                                            className={`mb-1 mt-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-300",
                                            "text-gray-700"
                                            )}`}
                                        >
                                            {t("payment_manage.grand_total")}
                                        </label>
                                        <div className="relative">
                                            <input
                                            readOnly
                                            type="text"
                                            value={(subtotal - totalDiscount).toFixed(3)}
                                            className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                darkMode,
                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                "bg-white text-gray-900 border-gray-200"
                                            )}`}
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
                                        <div className="flex mt-3">
                                            <label className="relative w-[50%] inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.status === 'Completed'} // Checkbox is checked if status is 'Completed'
                                                    disabled={!hasApprovePermission}
                                                    onChange={(e) =>
                                                        setFormData({
                                                        ...formData,
                                                        status: e.target.checked ? 'Completed' : 'Pending',
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div
                                                className={`${getDarkModeClass(
                                                    darkMode,
                                                    'w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-orange-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-400 transition duration-200',
                                                    'w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-400 transition duration-200'
                                                )}`}
                                                ></div>
                                                <div
                                                className={`${getDarkModeClass(
                                                    darkMode,
                                                    'absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition duration-200',
                                                    'absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition duration-200'
                                                )}`}
                                                ></div>
                                            </label>
                                            <div className="items-center flex w-[50%] justify-end">
                                                <span
                                                className={`${formData.status === 'Completed' ? 'label-green' : 'label-orange'} ${getDarkModeClass(
                                                    darkMode,
                                                    formData.status === 'Completed' ? 'label-green-darkmode' : 'label-orange-darkmode'
                                                )}`}
                                                >
                                                {formData.status === 'Completed' ? t('completed') : t('pending')}
                                                </span>
                                            </div>
                                        </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <label
                                                className={`uppercase block font-medium mb-1 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-700"
                                                )}`}
                                            >
                                                {t("payment_manage.reference_payment")}
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
                                                            data-kheng-chetra={`reference-payment-${currentPayment?.id || 'new'}`}
                                                            onLoad={() => {
                                                            if (thumbnail.isNew) {
                                                                setThumbnails((prev) =>
                                                                prev.map((t) =>
                                                                    t.id === thumbnail.id ? { ...t, loading: false } : t
                                                                )
                                                                );
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

                                    {/* Row 2: Search Textbox and Table */}
                                    <div className="space-y-4">
                                        <div className="relative w-1/3">
                                        <input
                                            type="text"
                                            placeholder={t("search_placeholder")}
                                            value={tableSearchQuery}
                                            onChange={(e) => setTableSearchQuery(e.target.value)}
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

                                        {/* Enhanced Table with Scroll and Improved Design */}
                                        <div className="overflow-auto max-h-[300px] custom-scrollbar">
                                            <table
                                                className={`w-full border-collapse rounded-lg shadow-md ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-300",
                                                "text-gray-900"
                                                )}`}
                                            >
                                                <thead>
                                                    <tr
                                                        className={`sticky top-0 z-10 ${getDarkModeClass(
                                                        darkMode,
                                                        "bg-[#2D2D2D] text-gray-300",
                                                        "bg-[#ff8800] text-white"
                                                        )}`}
                                                    >
                                                        <th
                                                        className={`p-3 text-left font-semibold rounded-tl-lg sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4"
                                                            checked={selectAll}
                                                            onChange={handleSelectAllChange}
                                                        />
                                                        </th>
                                                        <th
                                                        className={`p-3 text-left font-semibold sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.tran_type")}
                                                        </th>
                                                        <th
                                                        className={`p-3 text-left font-semibold sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.tran_date")}
                                                        </th>
                                                        <th
                                                        className={`p-3 text-left font-semibold sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.number")}
                                                        </th>
                                                        <th
                                                        className={`p-3 text-left font-semibold sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.name")}
                                                        </th>
                                                        <th
                                                        className={`p-3 text-right font-semibold sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.grand_total")} ($)
                                                        </th>
                                                        <th
                                                        className={`p-3 text-right font-semibold sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.open_balance")} ($)
                                                        </th>
                                                        <th
                                                        className={`p-3 text-right font-semibold sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.discount")}
                                                        </th>
                                                        <th
                                                        className={`p-3 text-right font-semibold rounded-tr-lg sticky top-0 ${getDarkModeClass(
                                                            darkMode,
                                                            "bg-[#2D2D2D] text-gray-300",
                                                            "bg-[#ff8800] text-white"
                                                        )}`}
                                                        >
                                                        {t("payment_manage.payment")} ($)
                                                        </th>
                                                    </tr>
                                                </thead>
                                                {isLoading ? (
                                                    <TableLoading
                                                        darkMode={darkMode}
                                                        rowCount={5} // Adjust the number of rows as needed for the loading skeleton
                                                        colCount={9} // Matches the number of columns in the table
                                                    />
                                                ) : (
                                                <tbody>
                                                    {getFilteredAndSortedPiData().length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} className="p-3 text-center">
                                                        <NoDataComponent
                                                            darkMode={darkMode}
                                                            width={200}
                                                            height={200}
                                                            fontSize={16}
                                                        />
                                                        </td>
                                                    </tr>
                                                    ) : (
                                                    getFilteredAndSortedPiData().map((pi) => (
                                                        <tr
                                                        key={pi.id}
                                                        className={`border-t ${getDarkModeClass(
                                                            darkMode,
                                                            "border-gray-700 hover:bg-[#3A3A3A]",
                                                            "border-gray-200 hover:bg-orange-50"
                                                        )}`}
                                                        >
                                                        <td className="p-3">
                                                            <input
                                                            type="checkbox"
                                                            className="w-4 h-4"
                                                            checked={checkedItems[pi.id] || false}
                                                            onChange={() => handleCheckboxChange(pi.id)}
                                                            />
                                                        </td>
                                                        <td className="p-3">{t("purchase_invoice")}</td>
                                                        <td className="p-3">{pi.date}</td>
                                                        <td className="p-3">{pi.pi_number}</td>
                                                        <td className="p-3">
                                                            <Bellypopover darkMode={darkMode}>
                                                            <span
                                                                className={`label-green ${getDarkModeClass(darkMode, "label-green-darkmode", "")}`}
                                                                data-belly-caption={`${pi.pi_name} / ${pi.pi_name_cn || "N/A"}`}
                                                            >
                                                                {pi.pi_name && pi.pi_name.length > 12
                                                                ? `${pi.pi_name.substring(0, 9)}... / ${pi.pi_name_cn ? pi.pi_name_cn.substring(0, 9) + "..." : "N/A"}`
                                                                : `${pi.pi_name} / ${pi.pi_name_cn || "N/A"}`}
                                                            </span>
                                                            </Bellypopover>
                                                        </td>
                                                        <td className="p-3 text-right">{pi.grand_total.toFixed(3)} $</td>
                                                        <td className="p-3">
                                                            <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={pi.open_balance.toFixed(3)} // Displays payment_balance
                                                                readOnly
                                                                className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                                )}`}
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
                                                            <div
                                                            className={`flex items-center rounded-lg outline-1 -outline-offset-1 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-orange-600 ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                            )}`}
                                                            >
                                                            <input
                                                                type="text"
                                                                value={discountInputs[pi.id] || ""}
                                                                onChange={(e) => handleDiscountInputChange(pi.id, e.target.value)}
                                                                disabled={!checkedItems[pi.id]}
                                                                max={discountTypes[pi.id] === "$" ? pi.open_balance : 100} // Uses payment_balance
                                                                className={`w-full rounded-l-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                                )} ${!checkedItems[pi.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                                                            />
                                                            <select
                                                                value={discountTypes[pi.id] || "$"}
                                                                onChange={(e) => handleDiscountTypeChange(pi.id, e.target.value)}
                                                                disabled={!checkedItems[pi.id]}
                                                                className={`rounded-r-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                                )} ${!checkedItems[pi.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                                                            >
                                                                <option value="$">$</option>
                                                                <option value="%">%</option>
                                                            </select>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={paymentAmounts[pi.id] || ""}
                                                                onChange={(e) => handlePaymentInputChange(pi.id, e.target.value)}
                                                                disabled={!checkedItems[pi.id]}
                                                                max={pi.open_balance} // Uses payment_balance
                                                                className={`w-full border rounded-lg p-2 pr-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                                                                darkMode,
                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                                                "bg-white text-gray-900 border-gray-200"
                                                                )} ${!checkedItems[pi.id] ? "opacity-50 cursor-not-allowed" : ""}`}
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
                                                        </tr>
                                                    ))
                                                    )}
                                                </tbody>
                                                )}
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
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
                                    {(!isEditMode || (isEditMode && paymentAprove !== '1' && paymentAprove !== 1)) && hasSavePermission && (
                                        <button
                                            type="submit"
                                            form="payment-form"
                                            disabled={isSubmitting}
                                            className={`border flex items-center justify-center ${getDarkModeClass(
                                            darkMode,
                                            "border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600] hover:text-white",
                                            "border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600] hover:text-white"
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
                                    )}
                                    {(!isEditMode || (isEditMode && paymentAprove !== '1' && paymentAprove !== 1)) && hasConfirmPermission && (
                                        <button
                                            type="button"
                                            id="confirm-status"
                                            onClick={handleConfirm}
                                            disabled={isConfirming}
                                            className={`border flex items-center justify-center ${getDarkModeClass(
                                            darkMode,
                                            "border-[#ff6600] text-[#ff8800] hover:bg-[#ff6600] hover:text-white",
                                            "border-[#ff6600] text-[#ff8800] hover:bg-[#ff6600] hover:text-white"
                                            )} font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md ${
                                            isConfirming ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {isConfirming ? (
                                            <Spinner width="16px" height="16px" className="mr-2" />
                                            ) : (
                                            t("confirm")
                                            )}
                                            {isConfirming ? t("saving") : ''}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

PaymentManage.title = "payment_manage.title";
PaymentManage.subtitle = "payment_manage.list_payment";
