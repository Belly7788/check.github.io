import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDarkModeClass } from "../../utils/darkModeUtils";

export default function WholesaleCosting({ darkMode }) {
    const { t } = useTranslation();

    // State for form inputs
    const [formData, setFormData] = useState({
        productCode: "",
        productName: "",
        supplyPrice: "",
        promotionPcs: "",
        qty1: "",
        qty2: "",
        totalCost: "",
        ourProfit: "",
        totalBuyShop: "",
        totalBosDom: "",
        customerProfit: "",
        pricePerPcs: "",
        tenPcsPrice: "",
        profit: "",
        status: "",
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle number input restriction
    const handleNumberInput = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Calculate fields when relevant inputs change
    useEffect(() => {
        const qty1 = parseFloat(formData.qty1) || 0;
        const promoPcs = parseFloat(formData.promotionPcs) || 1;
        const supplyPrice = parseFloat(formData.supplyPrice) || 0;
        const ourProfit = parseFloat(formData.ourProfit) || 0;

        if (promoPcs > 0) {
            const qty2 = qty1 / promoPcs;
            const totalCost = qty2 * supplyPrice;
            const totalBuyShop = 1.21 * qty2;
            const totalBosDom = totalCost + ourProfit;
            const customerProfit = totalBuyShop - totalBosDom;
            const pricePerPcs = totalBosDom / qty2;
            const tenPcsPrice = (pricePerPcs * 15) / 100 + pricePerPcs;
            const profit = (1.21 - tenPcsPrice) * 10;
            const status = tenPcsPrice < 1.21 ? "True" : "False";

            setFormData((prev) => ({
                ...prev,
                qty2: qty2.toFixed(2),
                totalCost: totalCost.toFixed(2),
                totalBuyShop: totalBuyShop.toFixed(2),
                totalBosDom: totalBosDom.toFixed(2),
                customerProfit: customerProfit.toFixed(2),
                pricePerPcs: pricePerPcs.toFixed(3),
                tenPcsPrice: tenPcsPrice.toFixed(3),
                profit: profit.toFixed(3),
                status: status,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                qty2: "",
                totalCost: "",
                totalBuyShop: "",
                totalBosDom: "",
                customerProfit: "",
                pricePerPcs: "",
                tenPcsPrice: "",
                profit: "",
                status: "",
            }));
        }
    }, [formData.qty1, formData.promotionPcs, formData.supplyPrice, formData.ourProfit]);

    // Handle Telegram sharing
    const handleShareToTelegram = () => {
        const { productCode, productName, totalBosDom, tenPcsPrice } = formData;

        if (totalBosDom && tenPcsPrice) {
            const message = `📢 *${t("cost.wholesale_costing")}:*\n\n*${t("cost.product_code")}:* ${productCode}\n*${t("cost.product_name")}:* ${productName}\n💰 *${t("cost.total_bos_dom")}:* ${totalBosDom}$\n🔟 *${t("cost.ten_pcs_price")}:* ${tenPcsPrice}$`;
            const botToken = "5671578892:AAEHo3TyyENCUMpId-JkOl9l3kUui1SjD6I"; // Replace with your Telegram bot token
            const groupChatId = "-4716956662"; // Replace with your group chat ID

            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const data = {
                chat_id: groupChatId,
                text: message,
                parse_mode: "Markdown",
            };

            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.ok) {
                        alert(t("cost.successfully_sent_to_telegram"));
                    } else {
                        alert(t("cost.failed_to_send_telegram"));
                    }
                })
                .catch((error) => {
                    alert(`${t("cost.error")}: ${error}`);
                });
        } else {
            alert(t("cost.fill_required_fields"));
        }
    };

    return (
        <>
            <Head title={t("cost.wholesale_costing")} />
            <div
                className={`w-full max-w-4xl mx-auto rounded-2xl shadow-xl p-6 transition-all duration-300 ${getDarkModeClass(
                    darkMode,
                    "bg-[#1A1A1A] text-gray-200",
                    "bg-white text-gray-900"
                )}`}
                style={{ fontFamily: "'Noto Sans Khmer', 'Roboto', sans-serif" }}
            >
                <h1 className="text-3xl font-bold text-center mb-8 text-[#ff8800] tracking-tight">
                    {t("cost.wholesale_costing")}
                </h1>

                <div className="flex flex-col gap-8">
                    {/* Our Section */}
                    <div className="flex flex-col gap-4 bg-opacity-50 rounded-xl p-6 transition-all duration-200 hover:shadow-lg">
                        <div className="w-full bg-[#ff8800] rounded-lg p-3 shadow-md">
                            <h2 className="text-xl font-semibold text-center text-white">{t("cost.our")}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.product_code")}*
                                </label>
                                <input
                                    type="text"
                                    name="productCode"
                                    value={formData.productCode}
                                    onChange={handleInputChange}
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] transition duration-200 shadow-sm hover:shadow-md ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border border-gray-300"
                                    )}`}
                                    placeholder={t("cost.product_code")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.product_name")}*
                                </label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] transition duration-200 shadow-sm hover:shadow-md ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border border-gray-300"
                                    )}`}
                                    placeholder={t("cost.product_name")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.supply_price")}*
                                </label>
                                <input
                                    type="text"
                                    name="supplyPrice"
                                    value={formData.supplyPrice}
                                    onChange={handleNumberInput}
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] transition duration-200 shadow-sm hover:shadow-md ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border border-gray-300"
                                    )}`}
                                    placeholder={t("cost.enter_supply_price")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.promotion_pcs")}*
                                </label>
                                <input
                                    type="text"
                                    name="promotionPcs"
                                    value={formData.promotionPcs}
                                    onChange={handleNumberInput}
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] transition duration-200 shadow-sm hover:shadow-md ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border border-gray-300"
                                    )}`}
                                    placeholder={t("cost.enter_pcs")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.qty1")}*
                                </label>
                                <input
                                    type="text"
                                    name="qty1"
                                    value={formData.qty1}
                                    onChange={handleNumberInput}
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] transition duration-200 shadow-sm hover:shadow-md ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border border-gray-300"
                                    )}`}
                                    placeholder={t("cost.qty1")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.qty2")}
                                </label>
                                <input
                                    type="text"
                                    name="qty2"
                                    value={formData.qty2}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 opacity-60",
                                        "bg-gray-100 text-gray-900 border border-gray-300 opacity-60"
                                    )}`}
                                    placeholder={t("cost.qty2")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.total_cost")}
                                </label>
                                <input
                                    type="text"
                                    name="totalCost"
                                    value={formData.totalCost}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 opacity-60",
                                        "bg-gray-100 text-gray-900 border border-gray-300 opacity-60"
                                    )}`}
                                    placeholder={t("cost.total_cost")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.our_profit")}*
                                </label>
                                <input
                                    type="text"
                                    name="ourProfit"
                                    value={formData.ourProfit}
                                    onChange={handleNumberInput}
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8800] transition duration-200 shadow-sm hover:shadow-md ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700",
                                        "bg-white text-gray-900 border border-gray-300"
                                    )}`}
                                    placeholder={t("cost.our_profit")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customer Section */}
                    <div className="flex flex-col gap-4 bg-opacity-50 rounded-xl p-6 transition-all duration-200 hover:shadow-lg">
                        <div className="w-full bg-[#ff8800] rounded-lg p-3 shadow-md">
                            <h2 className="text-xl font-semibold text-center text-white">{t("cost.customer")}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.total_buy_shop")}
                                </label>
                                <input
                                    type="text"
                                    name="totalBuyShop"
                                    value={formData.totalBuyShop}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 opacity-60",
                                        "bg-gray-100 text-gray-900 border border-gray-300 opacity-60"
                                    )}`}
                                    placeholder={t("cost.total_buy_shop")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.total_bos_dom")}
                                </label>
                                <input
                                    type="text"
                                    name="totalBosDom"
                                    value={formData.totalBosDom}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#ff8800] text-white border-gray-700 opacity-80",
                                        "bg-[#ff8800] text-white border border-gray-300 opacity-80"
                                    )}`}
                                    placeholder={t("cost.total_bos_dom")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.customer_profit")}
                                </label>
                                <input
                                    type="text"
                                    name="customerProfit"
                                    value={formData.customerProfit}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 opacity-60",
                                        "bg-gray-100 text-gray-900 border border-gray-300 opacity-60"
                                    )}`}
                                    placeholder={t("cost.customer_profit")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.price_per_pcs")}
                                </label>
                                <input
                                    type="text"
                                    name="pricePerPcs"
                                    value={formData.pricePerPcs}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 opacity-60",
                                        "bg-gray-100 text-gray-900 border border-gray-300 opacity-60"
                                    )}`}
                                    placeholder={t("cost.price_per_pcs")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Result Check Section */}
                    <div className="flex flex-col gap-4 bg-opacity-50 rounded-xl p-6 transition-all duration-200 hover:shadow-lg">
                        <div className="w-full bg-[#ff8800] rounded-lg p-3 shadow-md">
                            <h2 className="text-xl font-semibold text-center text-white">{t("cost.result_check")}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.ten_pcs_price")}
                                </label>
                                <input
                                    type="text"
                                    name="tenPcsPrice"
                                    value={formData.tenPcsPrice}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#ff8800] text-white border-gray-700 opacity-80",
                                        "bg-[#ff8800] text-white border border-gray-300 opacity-80"
                                    )}`}
                                    placeholder={t("cost.ten_pcs_price")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.profit")}
                                </label>
                                <input
                                    type="text"
                                    name="profit"
                                    value={formData.profit}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 opacity-60",
                                        "bg-gray-100 text-gray-900 border border-gray-300 opacity-60"
                                    )}`}
                                    placeholder={t("cost.profit")}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-sm font-medium ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-300",
                                    "text-gray-700"
                                )}`}>
                                    {t("cost.status")}
                                </label>
                                <input
                                    type="text"
                                    name="status"
                                    value={formData.status}
                                    disabled
                                    className={`w-full h-11 p-3 rounded-lg focus:outline-none transition duration-200 shadow-sm ${getDarkModeClass(
                                        darkMode,
                                        "bg-[#2D2D2D] text-gray-300 border-gray-700 opacity-60",
                                        "bg-gray-100 text-gray-900 border border-gray-300 opacity-60"
                                    )}`}
                                    placeholder={t("cost.status")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Share to Telegram Button */}
                    <button
                        onClick={handleShareToTelegram}
                        className={`w-full h-12 rounded-lg font-semibold text-white bg-[#ff8800] hover:bg-[#e07b00] transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
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
                                d="M8.684 13.342C8.297 13.729 8.103 14.315 8.103 14.908v4.092a1 1 0 001.414.914l4.092-2.046a1 1 0 01.894 0l4.092 2.046a1 1 0 001.414-.914v-4.092c0-.593-.196-1.18-.583-1.566l-4.092-4.092a1 1 0 00-1.414 0l-4.092 4.092zM3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2z"
                            />
                        </svg>
                        {t("cost.share_to_telegram")}
                    </button>
                </div>
            </div>
        </>
    );
}

WholesaleCosting.title = "cost.wholesale_costing";
WholesaleCosting.subtitle = "cost.wholesale_costing_list";