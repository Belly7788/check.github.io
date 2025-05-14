import { Link, Head, useForm } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { FaEllipsisV, FaStar, FaGripVertical } from "react-icons/fa"; // Added FaGripVertical for drag handle
import { useTranslation } from "react-i18next";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import "../../BELLY/Component/Gallery/gallery_belly";
import NoImageComponent from "../../Component/Empty/NotImage/NotImage";
import NoDataComponent from "../../Component/Empty/NoDataComponent";
import Bellypopover from '../../BELLY/Component/Popover/Popover';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import ShimmerLoading from "../../Component/Loading/ShimmerLoading/ShimmerLoading";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import Spinner from "../../Component/spinner/spinner";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function PurchaseOrderForm({ darkMode, auth }) {
    const { t } = useTranslation();
    const [productSearch, setProductSearch] = useState("");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [openConfirmDropdown, setOpenConfirmDropdown] = useState(null);
    const productDropdownRef = useRef(null);
    const today = new Date().toISOString().split("T")[0];
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupText, setPopupText] = useState("");
    const [originalText, setOriginalText] = useState("");
    const [currentRowIndex, setCurrentRowIndex] = useState(null);
    const [animationState, setAnimationState] = useState("closed");
    const [textareaPosition, setTextareaPosition] = useState({ x: 0, y: 0 });
    const textareaRefs = useRef([]);
    const [imageLoadingStates, setImageLoadingStates] = useState({});

    // Form data
    const { data, setData, post, processing, errors, reset } = useForm({
        date: today,
        products: [],
    });

    // Custom style for disabled text input
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
        cursor: "not-allowed",
    };

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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

    // Handle clicks outside to close product dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
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
    }, []);

    // Calculate totals
    const totalQty = data.products.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalItems = data.products.length;

    // Helper function to check if a value is numeric
    const isNumeric = (value) => {
        if (value === "" || value === null || value === undefined) return true;
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    // Handle restricted input for numeric fields
    const handleRestrictedInput = (value, setter) => {
        let newValue = value.replace(/[^0-9+\-*/=.]/g, '');
        const parts = newValue.split(/([+\-*/=])/);
        newValue = parts
            .map((part) => {
                if (!/[+\-*/=]/.test(part)) {
                    const decimalCount = part.split('.').length - 1;
                    if (decimalCount > 1) {
                        const [integer, ...decimals] = part.split('.');
                        return `${integer}.${decimals.join('')}`;
                    }
                }
                return part;
            })
            .join('');
        setter(newValue);
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
                amount: 1,
                rating: 0,
                remark: "",
            };
            setData("products", [...data.products, newProduct]);
        }

        setProductSearch("");
        setIsProductDropdownOpen(false);
    };

    // Handle table input changes
    const handleTableInputChange = (index, field, value) => {
        const updatedProducts = [...data.products];
        updatedProducts[index] = { ...updatedProducts[index], [field]: value };
        setData("products", updatedProducts);
    };

    // Handle star rating
    const handleRatingChange = (index, rating) => {
        handleTableInputChange(index, "rating", rating);
    };

    // Open popup for textarea
    const openPopup = (index, remark, event) => {
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
            remark: plainText,
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
            remark: originalText,
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

        // Validate amounts are numeric
        const invalidAmounts = data.products.some(item => !isNumeric(item.amount));
        if (invalidAmounts) {
            await showErrorAlert({
                title: t("error"),
                message: t("create_purchase_order.amount_invalid"),
                darkMode,
            });
            return;
        }

        post('/po/store', {
            onSuccess: async () => {
                await showSuccessAlert({
                    title: t("success"),
                    message: t("create_purchase_order.po_created_successfully"),
                    darkMode,
                });
                setData({
                    date: today, // Reset to today's date
                    products: [], // Explicitly clear products
                });
            },
            onError: async (errors) => {
                let errorMessage = t("create_purchase_order.error_creating_po");
                if (errors.products) {
                    errorMessage = t("create_purchase_order.products_required");
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
        if (!result.destination) return; // Dropped outside the list

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
            <Head title={t("create_po")} />

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
                    .star-rating .star {
                        cursor: pointer;
                        transition: color 0.2s;
                    }
                    .star-rating .star:hover,
                    .star-rating .star.active {
                        color: #ff8800;
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
                                    placeholder={t("create_purchase_order.search_product_placeholder")}
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value.trim())}
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
                                            {/* New th for drag handle */}
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
                                                "create_purchase_order.photo",
                                                "create_purchase_order.code",
                                                "create_purchase_order.name",
                                                "create_purchase_order.amount",
                                                "create_purchase_order.ratingstar",
                                                "create_purchase_order.remark",
                                                "create_purchase_order.action",
                                            ].map((header) => (
                                                <th
                                                    key={header}
                                                    className={`px-4 py-3 text-left ${header === "create_purchase_order.code" ||
                                                        header === "create_purchase_order.name" ? "w-[8rem]" : "" ||
                                                        header === "create_purchase_order.remark" ? "w-40" : "" ||
                                                        header === "create_purchase_order.photo" ? "w-20" : ""
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
                                                        <td colSpan={8} className="py-4 text-center">
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
                                                                    {/* New td for drag handle */}
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
                                                                    <td className="pl-1 py-3">{index + 1}</td>
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
                                                                        ) : (
                                                                            ""
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <Bellypopover darkMode={darkMode}>
                                                                            <span
                                                                                data-belly-caption={`${item.nameen || ''}, ${item.namecn || ''}, ${item.namekh || ''}`}
                                                                            >
                                                                                {item.nameen && item.nameen.length > 15
                                                                                    ? `${item.nameen.substring(0, 12)}...`
                                                                                    : item.nameen
                                                                                    ? item.nameen
                                                                                    : item.namecn && item.namecn.length > 15
                                                                                    ? `${item.namecn.substring(0, 12)}...`
                                                                                    : item.namecn
                                                                                    ? item.namecn
                                                                                    : item.namekh && item.namekh.length > 15
                                                                                    ? `${item.namekh.substring(0, 12)}...`
                                                                                    : item.namekh || ""}
                                                                            </span>
                                                                        </Bellypopover>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={item.amount}
                                                                            onChange={(e) => {
                                                                                handleRestrictedInput(e.target.value, (value) =>
                                                                                    handleTableInputChange(index, "amount", value)
                                                                                );
                                                                            }}
                                                                            onKeyDown={(e) =>
                                                                                handleKeyDown(e, item.amount, (value) =>
                                                                                    handleTableInputChange(index, "amount", value)
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
                                                                        <div className="star-rating flex gap-1">
                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                <FaStar
                                                                                    key={star}
                                                                                    className={`star w-5 h-5 ${item.rating >= star ? "active" : ""}`}
                                                                                    onClick={() => handleRatingChange(index, star)}
                                                                                    style={{ color: item.rating >= star ? "#ff8800" : darkMode ? "#4B5563" : "#D1D5DB" }}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <textarea
                                                                            ref={(el) => (textareaRefs.current[index] = el)}
                                                                            value={item.remark}
                                                                            onClick={(e) => openPopup(index, item.remark, e)}
                                                                            className={`w-full overflow-hidden p-2 rounded-md border-b focus:outline-none focus:ring-2 focus:ring-[#ff8800] resize-none cursor-pointer ${getDarkModeClass(
                                                                                darkMode,
                                                                                "bg-[#2D2D2D] text-gray-300 border-gray-700 placeholder-gray-500",
                                                                                "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                                                                            )}`}
                                                                            rows="2"
                                                                            placeholder={t("create_purchase_order.enter_remark")}
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
                                                                                        {t("create_purchase_order.confirm_remove_product")}
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
                                                                                            {t("create_purchase_order.okay")}
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
                                        <span>{t("create_purchase_order.total_qty")}:</span>
                                        <span className="ml-2">{totalQty}</span>
                                    </div>
                                    <div className="font-bold uppercase">
                                        <span>{t("create_purchase_order.total_items")}:</span>
                                        <span className="ml-2">{totalItems}</span>
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
                                {t("create_purchase_order.date")}
                            </label>
                            <input
                                type="text"
                                value={data.date}
                                disabled
                                style={customStyle}
                                className={`w-2/3 p-2 rounded-md border-b text-right ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                    "bg-white text-gray-900 border-gray-300"
                                )}`}
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
                                {t("create_purchase_order.time")}
                            </label>
                            <input
                                type="text"
                                value={currentTime}
                                disabled
                                className={`w-2/3 p-2 rounded-md border-b text-right ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                    "bg-white text-gray-900 border-gray-300"
                                )}`}
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
                                {t("create_purchase_order.total_qty")}
                            </label>
                            <input
                                type="text"
                                value={totalQty}
                                disabled
                                className={`w-2/3 p-2 rounded-md border-b text-right ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                    "bg-white text-gray-900 border-gray-300"
                                )}`}
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
                                {t("create_purchase_order.total_items")}
                            </label>
                            <input
                                type="text"
                                value={totalItems}
                                disabled
                                className={`w-2/3 p-2 rounded-md border-b text-right ${getDarkModeClass(
                                    darkMode,
                                    "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                    "bg-white text-gray-900 border-gray-300"
                                )}`}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`border uppercase font-semibold py-2.5 px-6 rounded-lg transition duration-200 shadow-md flex items-center justify-center gap-2 ${getDarkModeClass(
                                darkMode,
                                "border-[#ff8800] text-[#ff8800] bg-[#2D2D2D] hover:bg-[#ff8800] hover:text-white",
                                "border-[#ff8800] text-[#ff8800] bg-white hover:bg-[#ff8800] hover:text-white"
                            )} ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
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
                                {t("create_purchase_order.remark")}
                            </h3>
                            <div className="flex-1 overflow-hidden">
                                <Editor
                                    tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@5/tinymce.min.js"
                                    value={popupText}
                                    onEditorChange={editor => handlePopupTextChange(editor)}
                                    init={{
                                        height: "300px",
                                        menubar: false,
                                        branding: false,
                                        skin: darkMode ? "oxide-dark" : "oxide",
                                        content_css: darkMode ? "dark" : "default",
                                        plugins: [
                                            'advlist autolink lists link image charmap print preview anchor',
                                            'searchreplace visualblocks code fullscreen',
                                            'insertdatetime media table paste code help wordcount'
                                        ],
                                        toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
                                            'alignleft aligncenter alignright alignjustify | ' +
                                            'bullist numlist outdent indent | removeformat | help',
                                        content_style: `
                                            body {
                                                font-family: Arial, sans-serif;
                                                font-size: 14px;
                                                line-height: 1.6;
                                                color: ${darkMode ? '#e2e2e2' : '#333333'};
                                                background-color: ${darkMode ? '#2D2D2D' : '#ffffff'};
                                                margin: 8px;
                                            }
                                        `,
                                    }}
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
                                    {t("create_purchase_order.okay")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

PurchaseOrderForm.title = "po";
PurchaseOrderForm.subtitle = "create_po";
