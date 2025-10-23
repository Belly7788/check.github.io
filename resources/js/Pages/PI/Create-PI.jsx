import { Link, Head, useForm, router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { FaEllipsisV, FaGripVertical } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import MuiStyleDatePicker from "../../BELLY/Component/DatePicker/DatePicker";
import "../../BELLY/Component/Gallery/gallery_belly";
import NoImageComponent from "../../Component/Empty/NotImage/NotImage";
import NoDataComponent from "../../Component/Empty/NoDataComponent";
import Bellypopover from '../../BELLY/Component/Popover/Popover';
import Clipboard from '../../BELLY/Component/Clipboard/Clipboard';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import ShimmerLoading from "../../Component/Loading/ShimmerLoading/ShimmerLoading";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import Spinner from "../../Component/spinner/spinner";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ProductInvoiceForm({ darkMode, auth, preSelectedProducts = [], idPos = [], piData = null }) {
    const { t } = useTranslation();
    const [productSearch, setProductSearch] = useState("");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [companySearch, setCompanySearch] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [piNumber, setPiNumber] = useState("");
    const [piNumberError, setPiNumberError] = useState("");
    const [openConfirmDropdown, setOpenConfirmDropdown] = useState(null);
    const companyDropdownRef = useRef(null);
    const productDropdownRef = useRef(null);
    const today = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupText, setPopupText] = useState("");
    const [originalText, setOriginalText] = useState("");
    const [currentRowIndex, setCurrentRowIndex] = useState(null);
    const [animationState, setAnimationState] = useState("closed");
    const [textareaPosition, setTextareaPosition] = useState({ x: 0, y: 0 });
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const textareaRefs = useRef([]);
    const [imageLoadingStates, setImageLoadingStates] = useState({});

    // Form data
    const { data, setData, post, processing, errors, reset } = useForm({
        pi_number: "",
        date: today,
        pi_name: piData?.pi_name || "",
        pi_name_cn: piData?.pi_name_cn || "",
        company_id: piData?.company_id || "",
        discount: piData?.discount || "",
        extra_charge: piData?.extra_charge || "",
        openbalance: piData?.openbalance || "",
        products: preSelectedProducts,
        id_pos: idPos,
    });

    // Initialize company search and selected company if piData exists
    useEffect(() => {
        if (piData && piData.company_id && piData.company_name) {
            setSelectedCompany({
                id: piData.company_id,
                name: piData.company_name,
            });
            setCompanySearch(piData.company_name);
            setData("company_id", piData.company_id);
        } else {
            setIsLoadingCompanies(true);
            axios.get('/companies/search')
                .then((response) => {
                    const companies = response.data;
                    setCompanies(companies);
                    setFilteredCompanies(companies);
                    if (companies.length > 0) {
                        const defaultCompany = companies.reduce((min, company) =>
                            company.id < min.id ? company : min
                        );
                        setSelectedCompany(defaultCompany);
                        setCompanySearch(defaultCompany.name);
                        setData("company_id", defaultCompany.id);
                    }
                })
                .catch(() => {
                    setCompanies([]);
                    setFilteredCompanies([]);
                })
                .finally(() => {
                    setIsLoadingCompanies(false);
                });
        }
    }, [piData]);

    // Custom style for date picker
    const customStyle = {
        width: "100%",
        padding: "4px",
        borderRadius: "0.375rem",
        borderBottom: "1px solid",
        outline: "none",
        textAlign: "right",
        backgroundColor: darkMode ? "#2D2D2D" : "#FFFFFF",
        color: darkMode ? "#D1D5DB" : "#111827",
        borderColor: darkMode ? "#4B5563" : "#D1D5DB",
    };

    // Validate input for numeric and allowed operators
    const isValidInput = (value) => {
        return value === '' || /^[0-9+\-*/=.]*$/.test(value);
    };

    // Helper function to check if a value is numeric or an expression
    const isNumeric = (value) => {
        if (value === "" || value === null || value === undefined) return true;
        if (typeof value === "string" && value.startsWith("=")) return true;
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    // Handle keydown for evaluating expressions
    const handleKeyDown = (event, value, setter) => {
        if (event.key === 'Enter') {
            try {
                if (value.startsWith('=')) {
                    const expression = value.slice(1).trim();
                    if (expression === '') return;
                    // eslint-disable-next-line
                    const result = eval(expression);
                    setter(`${result}`);
                }
            } catch (error) {
                return;
            }
        }
    };

    // Handle product search input change
    const handleProductSearchChange = (value) => {
        setProductSearch(value);
    };

    // Preload image and manage loading state
    const preloadImage = (productId, imageUrl) => {
        if (!imageUrl || !productId) {
            setImageLoadingStates(prev => ({
                ...prev,
                [productId]: false,
            }));
            return;
        }

        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
            setImageLoadingStates(prev => ({
                ...prev,
                [productId]: false,
            }));
        };

        img.onerror = () => {
            setImageLoadingStates(prev => ({
                ...prev,
                [productId]: false,
            }));
        };

        setTimeout(() => {
            setImageLoadingStates(prev => ({
                ...prev,
                [productId]: false,
            }));
        }, 5000);
    };

    // Real-time product search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (productSearch) {
                setIsLoadingProducts(true);
                axios.get('/products/search', { params: { query: encodeURIComponent(productSearch) } })
                    .then((response) => {
                        setProducts(response.data);
                        setIsProductDropdownOpen(true);
                        const newImageLoadingStates = {};
                        response.data.forEach(product => {
                            if (product.image && product.id) {
                                newImageLoadingStates[product.id] = true;
                                preloadImage(product.id, product.image);
                            } else {
                                newImageLoadingStates[product.id] = false;
                            }
                        });
                        setImageLoadingStates(newImageLoadingStates);
                    })
                    .catch((error) => {
                        console.error("Error fetching products:", error);
                        setProducts([]);
                        setIsProductDropdownOpen(true);
                        setImageLoadingStates({});
                    })
                    .finally(() => {
                        setIsLoadingProducts(false);
                    });
            } else {
                setProducts([]);
                setIsProductDropdownOpen(false);
                setImageLoadingStates({});
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [productSearch]);

    // Fetch companies when dropdown is opened
    useEffect(() => {
        if (isCompanyDropdownOpen) {
            setIsLoadingCompanies(true);
            axios.get('/companies/search')
                .then((response) => {
                    setCompanies(response.data);
                    setFilteredCompanies(response.data);
                })
                .catch(() => {
                    setCompanies([]);
                    setFilteredCompanies([]);
                })
                .finally(() => {
                    setIsLoadingCompanies(false);
                });
        }
    }, [isCompanyDropdownOpen]);

    // Filter companies based on companySearch
    useEffect(() => {
        if (companySearch) {
            const filtered = companies.filter((company) =>
                company.name.toLowerCase().includes(companySearch.toLowerCase())
            );
            setFilteredCompanies(filtered);
        } else {
            setFilteredCompanies(companies);
        }
    }, [companySearch, companies]);

    // Validate PI number
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (piNumber) {
                axios.get('/pi-number/validate', { params: { pi_number: piNumber } })
                    .then((response) => {
                        if (response.data.exists) {
                            setPiNumberError(t("create_invoice.pi_number_exists"));
                        } else {
                            setPiNumberError("");
                            setData("pi_number", piNumber);
                        }
                    })
                    .catch(() => {
                        setPiNumberError(t("create_invoice.error_validating_pi_number"));
                    });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [piNumber]);

    // Handle clicks outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                companyDropdownRef.current &&
                !companyDropdownRef.current.contains(event.target)
            ) {
                setIsCompanyDropdownOpen(false);
                if (selectedCompany) {
                    setCompanySearch(selectedCompany.name);
                }
            }
            if (
                productDropdownRef.current &&
                !productDropdownRef.current.contains(event.target)
            ) {
                setIsProductDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedCompany]);

    // Calculate totals
    useEffect(() => {
        const newTotalCtn = data.products.reduce((sum, item) => sum + (Number(item.ctn) || 0), 0);
        const newTotalQty = data.products.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const newTotalSubTotal = data.products.reduce(
            (sum, item) => sum + (Number(item.subTotal) || 0),
            0
        );

        let discountValue = data.discount;
        let extraChargeValue = data.extra_charge;

        if (typeof discountValue === "string" && discountValue.startsWith("=")) {
            try {
                // eslint-disable-next-line
                discountValue = eval(discountValue.slice(1).trim());
            } catch (error) {
                discountValue = 0;
            }
        }
        if (typeof extraChargeValue === "string" && extraChargeValue.startsWith("=")) {
            try {
                // eslint-disable-next-line
                extraChargeValue = eval(extraChargeValue.slice(1).trim());
            } catch (error) {
                extraChargeValue = 0;
            }
        }

        setData((prev) => ({
            ...prev,
            openbalance: (newTotalSubTotal - Number(discountValue || 0) + Number(extraChargeValue || 0)).toFixed(3),
        }));
    }, [data.products, data.discount, data.extra_charge]);

    // Initialize products with pre-selected products or PI products
    useEffect(() => {
        if (preSelectedProducts.length > 0) {
            setData('products', preSelectedProducts);
            const newImageLoadingStates = {};
            preSelectedProducts.forEach(product => {
                if (product.photo && product.product_id) {
                    newImageLoadingStates[product.product_id] = true;
                    preloadImage(product.product_id, product.photo);
                } else {
                    newImageLoadingStates[product.product_id] = false;
                }
            });
            setImageLoadingStates(newImageLoadingStates);
        }
    }, [preSelectedProducts]);

    // Handle product selection
    const handleProductSelect = (product) => {
        const existingProductIndex = data.products.findIndex(
            (item) => item.product_id === product.id
        );

        if (existingProductIndex !== -1) {
            const updatedProducts = [...data.products];
            updatedProducts[existingProductIndex] = {
                ...updatedProducts[existingProductIndex],
                amount: Number(updatedProducts[existingProductIndex].amount) + 1,
                subTotal: (
                    (Number(updatedProducts[existingProductIndex].amount) + 1) *
                    Number(updatedProducts[existingProductIndex].unit_price)
                ).toFixed(3),
            };
            setData("products", updatedProducts);
        } else {
            const newProduct = {
                product_id: product.id,
                code: product.product_code,
                namekh: product.name_kh,
                nameen: product.name_en,
                namecn: product.name_cn,
                photo: product.image,
                ctn: 0,
                amount: 1,
                unit_price: 0,
                subTotal: 0,
                note: "",
                po_detail_ids: [],
            };
            setData("products", [...data.products, newProduct]);
        }

        setProductSearch("");
        setIsProductDropdownOpen(false);
    };

    // Handle company selection
    const handleCompanySelect = (company) => {
        setSelectedCompany(company);
        setCompanySearch(company.name);
        setData("company_id", company.id);
        setIsCompanyDropdownOpen(false);
    };

    // Toggle company dropdown
    const toggleCompanyDropdown = () => {
        if (!isCompanyDropdownOpen) {
            setCompanySearch("");
            setData("company_id", "");
            setSelectedCompany(null);
        } else if (selectedCompany) {
            setCompanySearch(selectedCompany.name);
        }
        setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
    };

    // Handle table input changes
    const handleTableInputChange = (index, field, value) => {
        if (['ctn', 'amount', 'unit_price', 'subTotal'].includes(field) && !isValidInput(value)) {
            return; // Prevent updating if input is invalid
        }

        const updatedProducts = [...data.products];
        updatedProducts[index] = { ...updatedProducts[index], [field]: value };

        if (field === "amount" || field === "unit_price") {
            const amount = Number(updatedProducts[index].amount) || 0;
            const unitPrice = Number(updatedProducts[index].unit_price) || 0;
            if (!isNaN(amount) && !isNaN(unitPrice)) {
                updatedProducts[index].subTotal = (amount * unitPrice).toFixed(3); // Always round to 3 decimal places
            }
        } else if (field === "subTotal") {
            const amount = Number(updatedProducts[index].amount) || 0;
            const subTotal = Number(value) || 0;
            if (amount > 0 && !isNaN(subTotal)) {
                updatedProducts[index].unit_price = (subTotal / amount).toFixed(3); // Update unit_price if subTotal is changed
            }
        }

        setData("products", updatedProducts);
    };

    useEffect(() => {
        const updatedProducts = data.products.map((product) => {
            const amount = Number(product.amount) || 0;
            const unitPrice = Number(product.unit_price) || 0;
            const subTotal = !isNaN(amount) && !isNaN(unitPrice) ? (amount * unitPrice).toFixed(3) : product.subTotal;
            return {
                ...product,
                subTotal,
            };
        });
        setData("products", updatedProducts);
    }, [preSelectedProducts]); // Run when preSelectedProducts changes

    // Handle discount and extra charge changes
    const handleDiscountChange = (e) => {
        const value = e.target.value;
        if (isValidInput(value)) {
            setData('discount', value);
        }
    };

    const handleExtraChargeChange = (e) => {
        const value = e.target.value;
        if (isValidInput(value)) {
            setData('extra_charge', value);
        }
    };

    // Open popup for textarea
    const openPopup = (index, note, event) => {
        const textarea = textareaRefs.current[index];
        if (textarea) {
            const rect = textarea.getBoundingClientRect();
            setTextareaPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }
        setCurrentRowIndex(index);
        setPopupText(note);
        setOriginalText(note);
        setAnimationState("opening");
        setIsPopupOpen(true);
    };

    // Handle popup text change
    const handlePopupTextChange = (value) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(value, 'text/html');
        const plainText = doc.body.textContent || "";

        setPopupText(value);

        const updatedProducts = [...data.products];
        updatedProducts[currentRowIndex] = {
            ...updatedProducts[currentRowIndex],
            note: plainText,
        };
        setData("products", updatedProducts);
    };

    // Confirm popup
    const confirmPopup = () => {
        setAnimationState("closing");
        setTimeout(() => {
            setIsPopupOpen(false);
            setAnimationState("closed");
        }, 300);
    };

    // Cancel popup
    const cancelPopup = () => {
        const updatedProducts = [...data.products];
        updatedProducts[currentRowIndex] = {
            ...updatedProducts[currentRowIndex],
            note: originalText,
        };
        setData("products", updatedProducts);
        setAnimationState("closing");
        setTimeout(() => {
            setIsPopupOpen(false);
            setAnimationState("closed");
            setPopupText("");
            setCurrentRowIndex(null);
        }, 300);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (piNumberError) {
            await showErrorAlert({
                title: t("error"),
                message: piNumberError,
                darkMode,
            });
            return;
        }

        let finalDiscount = data.discount;
        let finalExtraCharge = data.extra_charge;

        if (typeof finalDiscount === "string" && finalDiscount.startsWith("=")) {
            try {
                // eslint-disable-next-line
                finalDiscount = eval(finalDiscount.slice(1).trim());
                if (isNaN(finalDiscount) || !isFinite(finalDiscount)) {
                    throw new Error("Invalid discount expression");
                }
                setData("discount", finalDiscount.toString());
            } catch (error) {
                await showErrorAlert({
                    title: t("error"),
                    message: t("create_invoice.invalid_discount_expression"),
                    darkMode,
                });
                return;
            }
        }

        if (typeof finalExtraCharge === "string" && finalExtraCharge.startsWith("=")) {
            try {
                // eslint-disable-next-line
                finalExtraCharge = eval(finalExtraCharge.slice(1).trim());
                if (isNaN(finalExtraCharge) || !isFinite(finalExtraCharge)) {
                    throw new Error("Invalid extra charge expression");
                }
                setData("extra_charge", finalExtraCharge.toString());
            } catch (error) {
                await showErrorAlert({
                    title: t("error"),
                    message: t("create_invoice.invalid_extra_charge_expression"),
                    darkMode,
                });
                return;
            }
        }

        if (!isNumeric(finalDiscount) || !isNumeric(finalExtraCharge)) {
            await showErrorAlert({
                title: t("error"),
                message: t("create_invoice.discount_or_extra_charge_invalid"),
                darkMode,
            });
            return;
        }

        post('/pi/store', {
            onSuccess: async () => {
                await showSuccessAlert({
                    title: t("success"),
                    message: t("create_invoice.pi_created_successfully"),
                    darkMode,
                });
                reset();
                setData({
                    pi_number: "",
                    date: today,
                    pi_name: "",
                    pi_name_cn: "",
                    company_id: "",
                    discount: 0,
                    extra_charge: 0,
                    openbalance: 0,
                    products: [],
                    id_pos: [],
                });
                setPiNumber("");
                setSelectedCompany(null);
                setCompanySearch("");
                setProductSearch("");
                setProducts([]);
                setIsProductDropdownOpen(false);
                router.visit('/pi/create', { replace: true });
            },
            onError: async (errors) => {
                let errorMessage = t("create_invoice.error_creating_pi");
                if (errors.pi_number) {
                    errorMessage = t("create_invoice.pi_number_exists");
                } else if (errors.company_id) {
                    errorMessage = t("create_invoice.company_required");
                } else if (errors.products) {
                    errorMessage = t("create_invoice.products_required");
                } else if (errors.id_pos) {
                    errorMessage = t("create_invoice.invalid_id_pos");
                } else {
                    errorMessage = Object.values(errors).join(", ");
                }
                await showErrorAlert({
                    title: t("error"),
                    message: errorMessage,
                    darkMode,
                });
            },
        });
    };

    // Add global keydown event listener for Ctrl + Enter
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check if the active element is a textarea
            if (e.target.tagName.toLowerCase() === 'textarea') {
                return; // Allow default Enter behavior in textarea
            }
            if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                handleSubmit(e);
            } else if (e.key === "Enter") {
                e.preventDefault();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleSubmit]);

    // Handle product removal
    const handleRemoveProduct = (index) => {
        setData("products", data.products.filter((_, i) => i !== index));
        setOpenConfirmDropdown(null);
    };

    // Handle drag end to reorder products
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedProducts = [...data.products];
        const [movedProduct] = reorderedProducts.splice(result.source.index, 1);
        reorderedProducts.splice(result.destination.index, 0, movedProduct);

        setData('products', reorderedProducts);
    };

    // Popup style
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
        <>
            <Head title={t("create_pi")} />

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

            <div
                className={`w-full rounded-lg shadow-md p-2 ${getDarkModeClass(
                    darkMode,
                    "bg-[#1A1A1A] text-gray-200",
                    "bg-white text-gray-900"
                )}`}
                style={{ fontFamily: "'Battambang', 'Roboto', sans-serif" }}
            >
                <form
                    onSubmit={handleSubmit}
                    className="w-full mx-auto mt-2 flex gap-1"
                >
                    {/* Layout Column 1 (75%) */}
                    <div className="w-[75%]">
                        <div className="flex justify-between items-center mb-2">
                            <div className="relative w-[50%]" ref={productDropdownRef}>
                                <input
                                    type="text"
                                    placeholder={t("create_invoice.search_product_placeholder")}
                                    value={productSearch}
                                    onChange={(e) => handleProductSearchChange(e.target.value)}
                                    className={`w-full p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] shadow-sm hover:shadow-md transition-shadow duration-200 ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 placeholder-gray-500 border border-gray-700",
                                        "bg-white text-gray-700 placeholder-gray-400 border border-gray-300"
                                    )}`}
                                />
                                <span
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-500"
                                    )}`}
                                >
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
                                {isProductDropdownOpen && (
                                    <div
                                        className={`absolute z-20 w-full border rounded-lg mt-1 max-h-96 overflow-y-auto custom-scrollbar shadow-lg ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                    >
                                        {isLoadingProducts ? (
                                            <div className="py-2 px-4">
                                                <ShimmerLoading
                                                    darkMode={darkMode}
                                                    rowCount={3}
                                                    colCount={1}
                                                    width="100%"
                                                    height="60px"
                                                    borderRadius="8px"
                                                />
                                            </div>
                                        ) : products.length > 0 ? (
                                            products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleProductSelect(product)}
                                                    className={`border-b border-b-gray-300 flex items-center px-2 py-1 cursor-pointer hover:bg-[#ff8800]/20 ${getDarkModeClass(
                                                        darkMode,
                                                        "hover:bg-[#3A3A3A] text-gray-300",
                                                        "hover:bg-gray-100 text-gray-900"
                                                    )}`}
                                                >
                                                    {product.image && product.id ? (
                                                        imageLoadingStates[product.id] ? (
                                                            <ShimmerLoading
                                                                darkMode={darkMode}
                                                                rowCount={1}
                                                                colCount={1}
                                                                width="40px"
                                                                height="40px"
                                                                borderRadius="4px"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name_en || "Product"}
                                                                className="w-10 h-10 object-cover rounded"
                                                            />
                                                        )
                                                    ) : (
                                                        <NoImageComponent
                                                            darkMode={darkMode}
                                                            width="2.5rem"
                                                            height="2.5rem"
                                                            borderRadius="0.25rem"
                                                            fontSize="10px"
                                                        />
                                                    )}
                                                    <div className="flex-1 ml-3">
                                                        <div className="font-semibold text-[12px]">
                                                            {(product.product_code || "").length > 30
                                                                ? `${(product.product_code || "").substring(0, 27)}...`
                                                                : product.product_code || ""}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400">
                                                            {product.name_en ? (
                                                                (product.name_en || "").length > 20
                                                                    ? `${(product.name_en || "").substring(0, 17)}...`
                                                                    : product.name_en
                                                            ) : null}
                                                            {product.name_en && product.name_kh ? (
                                                                <span className="font-semibold text-sm">||</span>
                                                            ) : null}
                                                            {product.name_kh ? (
                                                                (product.name_kh || "").length > 20
                                                                    ? `${(product.name_kh || "").substring(0, 17)}...`
                                                                    : product.name_kh
                                                            ) : null}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400">
                                                            {product.name_cn ? (
                                                                (product.name_cn || "").length > 20
                                                                    ? `${(product.name_cn || "").substring(0, 17)}...`
                                                                    : product.name_cn
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div
                                                className={`py-2 px-4 ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-400",
                                                    "text-gray-500"
                                                )}`}
                                            >
                                                <NoDataComponent
                                                    darkMode={darkMode}
                                                    width={80}
                                                    height={80}
                                                    fontSize={12}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="overflow-auto relative h-[calc(100vh-10.5rem)] custom-scrollbar rounded-lg shadow-inner">
                            <DragDropContext onDragEnd={onDragEnd}>
                                <table className="table-auto w-full text-xs">
                                    <thead
                                        className={`bg-gradient-to-r uppercase sticky top-0 z-10 text-white ${getDarkModeClass(
                                            darkMode,
                                            "from-[#2D2D2D] to-[#3A3A3A] text-gray-200",
                                            "from-[#F7B500] to-[#FF8800] text-white"
                                        )}`}
                                    >
                                        <tr
                                            className={`border-b ${getDarkModeClass(
                                                darkMode,
                                                "border-gray-700",
                                                "border-gray-300"
                                            )}`}
                                        >
                                            <th
                                                className={`w-8 text-left ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-200",
                                                    "text-white"
                                                )}`}
                                            ></th>
                                            <th
                                                className={`pl-1 py-3 w-10 text-left ${getDarkModeClass(
                                                    darkMode,
                                                    "text-gray-200",
                                                    "text-white"
                                                )}`}
                                            >
                                                {t("no")}
                                            </th>
                                            {[
                                                "create_invoice.photo",
                                                "create_invoice.code",
                                                "create_invoice.name",
                                                "create_invoice.ctn",
                                                "create_invoice.qty",
                                                "create_invoice.unit_price",
                                                "create_invoice.sub_total",
                                                "create_invoice.remark",
                                                "create_invoice.action",
                                            ].map((header) => (
                                                <th
                                                    key={header}
                                                    className={`px-4 py-3 text-left ${header === "create_invoice.code" ||
                                                        header === "create_invoice.name" ? "w-[8rem]" : "" ||
                                                        header === "create_invoice.photo" ? "w-20" : ""
                                                    }
                                                        ${getDarkModeClass(
                                                        darkMode,
                                                        "text-gray-200",
                                                        "text-white"
                                                    )}`}
                                                >
                                                    {t(header)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <Droppable droppableId="products">
                                        {(provided) => (
                                            <tbody
                                                className="add-to-tbl overflow-y-auto"
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {data.products.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={10} className="py-4 text-center">
                                                            <NoDataComponent
                                                                darkMode={darkMode}
                                                                width={300}
                                                                height={300}
                                                                fontSize={20}
                                                            />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    data.products.map((item, index) => (
                                                        <Draggable
                                                            key={`${item.product_id}-${index}`}
                                                            draggableId={`${item.product_id}-${index}`}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <tr
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`border-b ${getDarkModeClass(
                                                                        darkMode,
                                                                        "bg-[#1A1A1A] text-gray-300 border-gray-700 hover:bg-[#2D2D2D]",
                                                                        "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                                    )} ${snapshot.isDragging ? "opacity-75" : ""}`}
                                                                >
                                                                    <td
                                                                        className="py-3"
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        <FaGripVertical
                                                                            className={`w-5 h-5 cursor-move ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-400 hover:text-[#ff8800]",
                                                                                "text-gray-500 hover:text-[#ff8800]"
                                                                            )}`}
                                                                        />
                                                                    </td>
                                                                    <td className="pl-1 py-3">
                                                                        {index + 1}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {item.photo ? (
                                                                            <img
                                                                                src={item.photo}
                                                                                data-kheng-chetra="belly-product-view"
                                                                                className="w-12 h-12 object-cover rounded"
                                                                                loading="lazy"
                                                                            />
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
                                                                    <td className="px-4 py-3">
                                                                        {item.code ? (
                                                                            <Clipboard darkMode={darkMode} textToCopy={item.code}>
                                                                            <Bellypopover darkMode={darkMode}>
                                                                                <span
                                                                                    className={`label-Purple ${getDarkModeClass(
                                                                                        darkMode,
                                                                                        "label-Purple-darkmode",
                                                                                        ""
                                                                                    )}`}
                                                                                    data-belly-caption={item.code}
                                                                                >
                                                                                    {item.code && typeof item.code === "string" && item.code.length > 15
                                                                                        ? `${item.code.substring(0, 12)}...`
                                                                                        : item.code || ""}
                                                                                </span>
                                                                            </Bellypopover>
                                                                            </Clipboard>
                                                                        ) : (
                                                                            ""
                                                                        )}
                                                                    </td>
                                                                    <td className="p-1 pr-3 pl-3 flex flex-col items-start gap-1">
                                                                        {item.nameen ? (
                                                                            <Clipboard darkMode={darkMode} textToCopy={item.nameen}>
                                                                            <Bellypopover darkMode={darkMode}>
                                                                                <span
                                                                                className={`label-green ${darkMode ? "label-green-darkmode" : ""} inline-block w-auto`}
                                                                                data-belly-caption={item.nameen}
                                                                                >
                                                                                {item.nameen.length >  15 ? `${item.nameen.substring(0, 12)}...` : item.nameen}
                                                                                </span>
                                                                            </Bellypopover>
                                                                            </Clipboard>
                                                                        ) : (
                                                                            ""
                                                                        )}
                                                                        {item.namecn ? (
                                                                            <Clipboard darkMode={darkMode} textToCopy={item.namecn}>
                                                                            <Bellypopover darkMode={darkMode}>
                                                                                <span
                                                                                className={`label-blue ${darkMode ? "label-blue-darkmode" : ""} inline-block w-auto`}
                                                                                data-belly-caption={item.namecn}
                                                                                >
                                                                                {item.namecn.length > 15 ? `${item.namecn.substring(0, 12)}...` : item.namecn}
                                                                                </span>
                                                                            </Bellypopover>
                                                                            </Clipboard>
                                                                        ) : (
                                                                            ""
                                                                        )}
                                                                        {item.namekh ? (
                                                                            <Clipboard darkMode={darkMode} textToCopy={item.namekh}>
                                                                            <Bellypopover darkMode={darkMode}>
                                                                                <span
                                                                                className={`label-pink ${darkMode ? "label-pink-darkmode" : ""} inline-block w-auto`}
                                                                                data-belly-caption={item.namekh}
                                                                                >
                                                                                {item.namekh.length > 15 ? `${item.namekh.substring(0, 12)}...` : item.namekh}
                                                                                </span>
                                                                            </Bellypopover>
                                                                            </Clipboard>
                                                                        ) : (
                                                                            ""
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={item.ctn}
                                                                            onChange={(e) => handleTableInputChange(index, "ctn", e.target.value)}
                                                                            onKeyDown={(e) =>
                                                                                handleKeyDown(e, item.ctn, (value) =>
                                                                                    isValidInput(value) && handleTableInputChange(index, "ctn", value)
                                                                                )
                                                                            }
                                                                            className={`w-full p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] ${getDarkModeClass(
                                                                                darkMode,
                                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                                                                "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                                                            )}`}
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={item.amount}
                                                                            onChange={(e) => handleTableInputChange(index, "amount", e.target.value)}
                                                                            onKeyDown={(e) =>
                                                                                handleKeyDown(e, item.amount, (value) =>
                                                                                    isValidInput(value) && handleTableInputChange(index, "amount", value)
                                                                                )
                                                                            }
                                                                            className={`w-full p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] ${getDarkModeClass(
                                                                                darkMode,
                                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                                                                "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                                                            )}`}
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="text"
                                                                                value={item.unit_price}
                                                                                onChange={(e) => handleTableInputChange(index, "unit_price", e.target.value)}
                                                                                onKeyDown={(e) =>
                                                                                    handleKeyDown(e, item.unit_price, (value) =>
                                                                                        isValidInput(value) && handleTableInputChange(index, "unit_price", value)
                                                                                    )
                                                                                }
                                                                                className={`w-full p-2 pr-6 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                                                                    "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                                                                )}`}
                                                                            />
                                                                            <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-400",
                                                                                "text-gray-500"
                                                                            )}`}>
                                                                                $
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="text"
                                                                                value={item.subTotal}
                                                                                onChange={(e) => handleTableInputChange(index, "subTotal", e.target.value)}
                                                                                onKeyDown={(e) =>
                                                                                    handleKeyDown(e, item.subTotal, (value) =>
                                                                                        isValidInput(value) && handleTableInputChange(index, "subTotal", value)
                                                                                    )
                                                                                }
                                                                                className={`w-full p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                                                                    "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                                                                )}`}
                                                                            />
                                                                            <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getDarkModeClass(
                                                                                darkMode,
                                                                                "text-gray-400",
                                                                                "text-gray-500"
                                                                            )}`}>
                                                                                $
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <textarea
                                                                            ref={(el) => (textareaRefs.current[index] = el)}
                                                                            value={item.note}
                                                                            onClick={(e) => openPopup(index, item.note, e)}
                                                                            className={`w-full overflow-hidden p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] resize-none cursor-pointer ${getDarkModeClass(
                                                                                darkMode,
                                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                                                                "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                                                            )}`}
                                                                            rows="2"
                                                                            placeholder={t("create_invoice.enter_remark")}
                                                                            readOnly
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="relative action-container">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setOpenConfirmDropdown(
                                                                                        openConfirmDropdown === index ? null : index
                                                                                    )
                                                                                }
                                                                                className={`p-2 rounded transition duration-200 ${getDarkModeClass(
                                                                                    darkMode,
                                                                                    "text-gray-400 hover:text-[#ff8800] hover:drop-shadow-[0_0_8px_rgba(255,136,0,0.8)]",
                                                                                    "text-gray-500 hover:text-[#ff8800] hover:bg-orange-100"
                                                                                )}`}
                                                                            >
                                                                                <FaEllipsisV className="w-5 h-5" />
                                                                            </button>
                                                                            {openConfirmDropdown === index && (
                                                                                <div
                                                                                    className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-20 p-4 ${getDarkModeClass(
                                                                                        darkMode,
                                                                                        "bg-[#2D2D2D] text-gray-200 border border-gray-700",
                                                                                        "bg-white text-gray-900 border border-gray-200"
                                                                                    )}`}
                                                                                >
                                                                                    <p className="mb-4 text-center">
                                                                                        {t("create_invoice.confirm_remove_product")}
                                                                                    </p>
                                                                                    <div className="flex justify-end gap-2">
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                setOpenConfirmDropdown(null)
                                                                                            }
                                                                                            className={`px-3 py-1 rounded text-sm ${getDarkModeClass(
                                                                                                darkMode,
                                                                                                "bg-gray-600 text-gray-200 hover:bg-gray-700",
                                                                                                "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                                            )}`}
                                                                                        >
                                                                                            {t("cancel")}
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleRemoveProduct(index)
                                                                                            }
                                                                                            className={`px-3 py-1 rounded text-sm ${getDarkModeClass(
                                                                                                darkMode,
                                                                                                "bg-red-600 text-white hover:bg-red-700",
                                                                                                "bg-red-500 text-white hover:bg-red-600"
                                                                                            )}`}
                                                                                        >
                                                                                            {t("create_invoice.okay")}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </tbody>
                                        )}
                                    </Droppable>
                                </table>
                            </DragDropContext>
                            {data.products.length > 0 && (
                                <div
                                    className={`sticky text-sm bottom-[-0.5px] w-full px-4 py-3 flex justify-end gap-6 border-t z-10 ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-gray-200 text-gray-900 border-gray-300"
                                    )}`}
                                >
                                    <div className="font-bold uppercase">
                                        <span>{t("create_invoice.total_ctn")}:</span>
                                        <span className="ml-2">
                                            {data.products.reduce((sum, item) => sum + (Number(item.ctn) || 0), 0)}
                                        </span>
                                    </div>
                                    <div className="font-bold uppercase">
                                        <span>{t("create_invoice.total_qty")}:</span>
                                        <span className="ml-2">
                                            {data.products.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
                                        </span>
                                    </div>
                                    <div className="font-bold uppercase">
                                        <span>{t("create_invoice.total_subtotal")}:</span>
                                        <span className="ml-2">
                                            ${data.products
                                                .reduce((sum, item) => sum + (Number(item.subTotal) || 0), 0)
                                                .toFixed(3)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Layout Column 2 (25%) */}
                    <div className="w-[25%] p-4 rounded-lg flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("create_invoice.date")}
                            </label>
                            <MuiStyleDatePicker
                                value={data.date}
                                onChange={(date) => {
                                    const formattedDate = date
                                        ? new Date(date).toISOString().split("T")[0]
                                        : today;
                                    setData("date", formattedDate);
                                }}
                                error={!!errors.date}
                                darkMode={darkMode}
                                style={customStyle}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("create_invoice.pi_number")}
                            </label>
                            <div className="relative w-2/3">
                                <input
                                    type="text"
                                    value={piNumber}
                                    onChange={(e) => setPiNumber(e.target.value)}
                                    className={`w-full p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] text-right ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                        "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                    )}`}
                                    placeholder={t("create_invoice.pi_number_placeholder")}
                                />
                                {piNumberError && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {piNumberError}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("name_en")}
                            </label>
                            <input
                                type="text"
                                value={data.pi_name}
                                onChange={(e) => setData("pi_name", e.target.value)}
                                className={`w-2/3 p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] text-right ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                    "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                )}`}
                                placeholder={t("name_en_placeholder")}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("name_cn")}
                            </label>
                            <input
                                type="text"
                                value={data.pi_name_cn}
                                onChange={(e) => setData("pi_name_cn", e.target.value)}
                                className={`w-2/3 p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] text-right ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                    "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                )}`}
                                placeholder={t("name_cn_placeholder")}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("company")}
                            </label>
                            <div className="relative w-2/3" ref={companyDropdownRef}>
                                <input
                                    type="text"
                                    value={companySearch}
                                    onChange={(e) => setCompanySearch(e.target.value)}
                                    onClick={toggleCompanyDropdown}
                                    className={`w-full p-2 pr-10 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] text-right ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                        "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                    )}`}
                                    placeholder={t("create_invoice.select_company_placeholder")}
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-500"
                                    )} ${isCompanyDropdownOpen ? "transform rotate-180" : ""}`}
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
                                {isCompanyDropdownOpen && (
                                    <div
                                        className={`absolute z-20 w-full border rounded-lg mt-1 max-h-60 overflow-y-auto custom-scrollbar shadow-lg ${getDarkModeClass(
                                            darkMode,
                                            "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                            "bg-white text-gray-900 border-gray-200"
                                        )}`}
                                    >
                                        {isLoadingCompanies ? (
                                            <div className="py-2 px-4">
                                                <ShimmerLoading
                                                    darkMode={darkMode}
                                                    rowCount={3}
                                                    colCount={1}
                                                    width="100%"
                                                    height="40px"
                                                    borderRadius="8px"
                                                />
                                            </div>
                                        ) : filteredCompanies.length > 0 ? (
                                            filteredCompanies.map((company) => (
                                                <div
                                                    key={company.id}
                                                    onClick={() => handleCompanySelect(company)}
                                                    className={`flex items-center py-2 px-4 cursor-pointer ${getDarkModeClass(
                                                        darkMode,
                                                        selectedCompany && selectedCompany.id === company.id
                                                            ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                            : "hover:bg-[#3A3A3A] text-gray-300",
                                                        selectedCompany && selectedCompany.id === company.id
                                                            ? "bg-[#ff8800]/20 text-[#ff8800]"
                                                            : "hover:bg-gray-100 text-gray-900"
                                                    )}`}
                                                >
                                                    {selectedCompany && selectedCompany.id === company.id && (
                                                        <svg
                                                            className={`w-4 h-4 mr-2 ${getDarkModeClass(
                                                                darkMode,
                                                                "text-[#ff8800]",
                                                                "text-[#ff8800]"
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
                                                    "text-gray-400",
                                                    "text-gray-500"
                                                )}`}
                                            >
                                                <NoDataComponent
                                                    darkMode={darkMode}
                                                    width={80}
                                                    height={80}
                                                    fontSize={12}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="hidden"
                                    name="company_id"
                                    value={data.company_id}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("create_invoice.total")}
                            </label>
                            <div className="relative w-2/3">
                                <input
                                    type="text"
                                    className={`w-full p-2 pr-6 rounded-md border-b focus:outline-none text-right ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border-gray-300"
                                    )}`}
                                    value={data.products
                                        .reduce((sum, item) => sum + (Number(item.subTotal) || 0), 0)
                                        .toFixed(3)}
                                    disabled
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
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("create_invoice.discount")}
                            </label>
                            <div className="relative w-2/3">
                                <input
                                    type="text"
                                    value={data.discount}
                                    onChange={handleDiscountChange}
                                    onKeyDown={(e) => handleKeyDown(e, data.discount, (value) => isValidInput(value) && setData('discount', value))}
                                    className={`w-full p-2 pr-6 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] text-right ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                        "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
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
                        </div>
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("create_invoice.extra_charge")}
                            </label>
                            <div className="relative w-2/3">
                                <input
                                    type="text"
                                    value={data.extra_charge}
                                    onChange={handleExtraChargeChange}
                                    onKeyDown={(e) => handleKeyDown(e, data.extra_charge, (value) => isValidInput(value) && setData('extra_charge', value))}
                                    className={`w-full p-2 pr-6 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] text-right ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                        "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
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
                        </div>
                        <div className="flex justify-between items-center">
                            <label
                                className={`text-sm uppercase font-medium w-1/3 ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}
                            >
                                {t("create_invoice.grand_total")}
                            </label>
                            <div className="relative w-2/3">
                                <input
                                    type="text"
                                    className={`w-full p-2 pr-6 rounded-md border-b focus:outline-none text-right ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border-gray-300"
                                    )}`}
                                    value={data.openbalance}
                                    disabled
                                />
                                <input
                                    type="hidden"
                                    name="balance"
                                    value={data.openbalance}
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
                        <button
                            type="submit"
                            disabled={processing || piNumberError}
                            className={`border uppercase font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md flex items-center justify-center gap-2 ${getDarkModeClass(
                                darkMode,
                                "border-[#ff8800] text-[#ff8800] bg-[#2D2D2D] hover:bg-[#ff8800] hover:text-white",
                                "border-[#ff8800] text-[#ff8800] bg-white hover:bg-[#ff8800] hover:text-white"
                            )} ${processing || piNumberError ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {processing ? (
                                <Spinner width="20px" height="20px" />
                            ) : (
                                t("save")
                            )}
                            {processing ? t("saving") : ' (CTRL + ENTER)'}
                        </button>
                    </div>
                </form>

                {/* Popup for Textarea */}
                {isPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                        <div
                            style={popupStyle}
                            className={`rounded-lg p-0 w-[800px] max-h-[90vh] flex flex-col ${getDarkModeClass(
                                darkMode,
                                "bg-[#2D2D2D] border border-gray-700",
                                "bg-white border border-gray-200"
                            )}`}
                        >
                            <h3 className={`text-lg font-semibold p-4 ${getDarkModeClass(
                                darkMode,
                                "text-gray-200 border-b border-gray-700",
                                "text-gray-900 border-b border-gray-200"
                            )}`}>
                                {t("remark")}
                            </h3>
                            <div className="flex-1 overflow-hidden p-4">
                                <textarea
                                    value={popupText}
                                    onChange={(e) => handlePopupTextChange(e.target.value)}
                                    className={`w-full h-[300px] p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ff8800] resize-none ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                        "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                    )}`}
                                    placeholder={t("create_invoice.enter_remark")}
                                />
                            </div>
                            <div className={`p-4 flex justify-end gap-2 ${getDarkModeClass(
                                darkMode,
                                "border-t border-gray-700 bg-[#363636]",
                                "border-t border-gray-200 bg-gray-50"
                            )}`}>
                                <button
                                    onClick={cancelPopup}
                                    className={`px-4 py-2 rounded text-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-gray-600 text-gray-200 hover:bg-gray-700",
                                        "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    )}`}
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={confirmPopup}
                                    className={`px-4 py-2 rounded text-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#ff8800] text-white hover:bg-[#e07b00]",
                                        "bg-[#ff8800] text-white hover:bg-[#e07b00]"
                                    )}`}
                                >
                                    {t("create_invoice.okay")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ProductInvoiceForm.title = "pi";
ProductInvoiceForm.subtitle = "create_pi";