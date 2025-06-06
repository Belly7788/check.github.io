import { Link, Head } from "@inertiajs/react";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

export default function Home({ darkMode }) {
    const { t } = useTranslation();

    // Sample data for charts
    const shipmentData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [65, 59, 80, 81, 56, 72]
    };

    const statusData = {
        delivered: 45,
        inTransit: 30,
        pending: 25
    };

    const reportData = [
        { month: 'Jan', revenue: 5000, shipments: 65 },
        { month: 'Feb', revenue: 8000, shipments: 59 },
        { month: 'Mar', revenue: 12000, shipments: 80 },
        { month: 'Apr', revenue: 9000, shipments: 81 },
        { month: 'May', revenue: 7000, shipments: 56 },
        { month: 'Jun', revenue: 11000, shipments: 72 }
    ];

    return (
        <>
            <Head title={t("dashboard")} />
            <div className="relative min-h-screen w-full p-6">
                {/* Overlay with Coming Soon */}
                <div className={`absolute inset-0 flex pt-60 justify-center z-10 ${getDarkModeClass(
                    darkMode,
                    "bg-black bg-opacity-70",
                    "bg-white bg-opacity-70" // Added light mode background
                )}`}>
                    <h1 className={`text-5xl uppercase md:text-6xl font-bold ${getDarkModeClass(
                        darkMode,
                        "text-[#ff8800]",
                        "text-[#ff8800]"
                    )}`}>
                        {t("coming_soon")}
                    </h1>
                </div>

                {/* Main Container */}
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${getDarkModeClass(
                            darkMode,
                            "text-white",
                            "text-gray-800"
                        )}`}>
                            {t("dashboard")} <span className="text-orange-500">Tracking</span>
                        </h1>
                        <p className={`text-lg ${getDarkModeClass(
                            darkMode,
                            "text-gray-400",
                            "text-gray-600"
                        )}`}>
                            Real-time shipment tracking and analytics dashboard
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {/* Total Shipments */}
                        <div className={`p-6 rounded-xl shadow-md ${getDarkModeClass(
                            darkMode,
                            "bg-gray-800",
                            "bg-white"
                        )}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-500"
                                    )}`}>Total Shipments</p>
                                    <p className="text-2xl font-bold mt-1">1,248</p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                <span className="ml-1">12.5% from last month</span>
                            </div>
                        </div>

                        {/* In Transit */}
                        <div className={`p-6 rounded-xl shadow-md ${getDarkModeClass(
                            darkMode,
                            "bg-gray-800",
                            "bg-white"
                        )}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-500"
                                    )}`}>In Transit</p>
                                    <p className="text-2xl font-bold mt-1">342</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                <span className="ml-1">3.2% from last month</span>
                            </div>
                        </div>

                        {/* Delivered */}
                        <div className={`p-6 rounded-xl shadow-md ${getDarkModeClass(
                            darkMode,
                            "bg-gray-800",
                            "bg-white"
                        )}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-500"
                                    )}`}>Delivered</p>
                                    <p className="text-2xl font-bold mt-1">856</p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                <span className="ml-1">8.7% from last month</span>
                            </div>
                        </div>

                        {/* On Time Rate */}
                        <div className={`p-6 rounded-xl shadow-md ${getDarkModeClass(
                            darkMode,
                            "bg-gray-800",
                            "bg-white"
                        )}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-500"
                                    )}`}>On Time Rate</p>
                                    <p className="text-2xl font-bold mt-1">92%</p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                <span className="ml-1">2.4% from last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Shipment Progress Chart */}
                        <div className={`lg:col-span-2 p-6 rounded-xl shadow-md ${getDarkModeClass(
                            darkMode,
                            "bg-gray-800",
                            "bg-white"
                        )}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-lg font-semibold ${getDarkModeClass(
                                    darkMode,
                                    "text-white",
                                    "text-gray-800"
                                )}`}>Monthly Shipments</h2>
                                <select className={`text-sm rounded-md px-3 py-1 ${getDarkModeClass(
                                    darkMode,
                                    "bg-gray-700 text-white",
                                    "bg-gray-100 text-gray-800"
                                )}`}>
                                    <option>Last 6 Months</option>
                                    <option>Last Year</option>
                                    <option>All Time</option>
                                </select>
                            </div>
                            <div className="h-64">
                                {/* Chart would be implemented with a library like Chart.js */}
                                <div className={`relative h-full w-full ${getDarkModeClass(
                                    darkMode,
                                    "bg-gray-700",
                                    "bg-gray-50"
                                )} rounded-lg flex items-end justify-between px-4 pb-4`}>
                                    {shipmentData.values.map((value, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div
                                                className="w-8 bg-orange-500 rounded-t-sm hover:bg-orange-400 transition-all duration-200"
                                                style={{ height: `${value}%` }}
                                            ></div>
                                            <span className={`text-xs mt-2 ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-400",
                                                "text-gray-500"
                                            )}`}>{shipmentData.labels[index]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Shipment Status Pie Chart */}
                        <div className={`p-6 rounded-xl shadow-md ${getDarkModeClass(
                            darkMode,
                            "bg-gray-800",
                            "bg-white"
                        )}`}>
                            <h2 className={`text-lg font-semibold mb-6 ${getDarkModeClass(
                                darkMode,
                                "text-white",
                                "text-gray-800"
                            )}`}>Shipment Status</h2>
                            <div className="h-64 flex items-center justify-center">
                                {/* Pie chart would be implemented with a library like Chart.js */}
                                <div className="relative w-40 h-40 rounded-full flex items-center justify-center">
                                    <div className="absolute w-full h-full rounded-full border-8 border-blue-500"
                                         style={{ clipPath: `circle(50% at 50% 50%)` }}></div>
                                    <div className="absolute w-full h-full rounded-full border-8 border-green-500"
                                         style={{ clipPath: `circle(50% at 50% 50%), polygon(50% 50%, 50% 0%, 0% 0%, 0% 50%)` }}></div>
                                    <div className="absolute w-full h-full rounded-full border-8 border-orange-500"
                                         style={{ clipPath: `circle(50% at 50% 50%), polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)` }}></div>
                                    <div className={`absolute w-28 h-28 rounded-full flex items-center justify-center ${getDarkModeClass(
                                        darkMode,
                                        "bg-gray-800",
                                        "bg-white"
                                    )}`}>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">1,248</p>
                                            <p className={`text-xs ${getDarkModeClass(
                                                darkMode,
                                                "text-gray-400",
                                                "text-gray-500"
                                            )}`}>Total</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center space-x-6">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                    <span className={`text-sm ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-600"
                                    )}`}>Pending ({statusData.pending}%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                                    <span className={`text-sm ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-600"
                                    )}`}>In Transit ({statusData.inTransit}%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                    <span className={`text-sm ${getDarkModeClass(
                                        darkMode,
                                        "text-gray-400",
                                        "text-gray-600"
                                    )}`}>Delivered ({statusData.delivered}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className={`p-6 rounded-xl shadow-md mb-8 ${getDarkModeClass(
                        darkMode,
                        "bg-gray-800",
                        "bg-white"
                    )}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-lg font-semibold ${getDarkModeClass(
                                darkMode,
                                "text-white",
                                "text-gray-800"
                            )}`}>Monthly Report</h2>
                            <button className={`text-sm rounded-md px-3 py-1 flex items-center ${getDarkModeClass(
                                darkMode,
                                "bg-gray-700 text-white hover:bg-gray-600",
                                "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            )}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${getDarkModeClass(
                                        darkMode,
                                        "border-gray-700",
                                        "border-gray-200"
                                    )}`}>
                                        <th className={`text-left pb-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-400",
                                            "text-gray-500"
                                        )}`}>Month</th>
                                        <th className={`text-right pb-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-400",
                                            "text-gray-500"
                                        )}`}>Shipments</th>
                                        <th className={`text-right pb-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-400",
                                            "text-gray-500"
                                        )}`}>Revenue</th>
                                        <th className={`text-right pb-3 font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-400",
                                            "text-gray-500"
                                        )}`}>Avg. Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((item, index) => (
                                        <tr key={index} className={`${index !== reportData.length - 1 ? `border-b ${getDarkModeClass(
                                            darkMode,
                                            "border-gray-700",
                                            "border-gray-200"
                                        )}` : ''}`}>
                                            <td className={`py-3 ${getDarkModeClass(
                                                darkMode,
                                                "text-white",
                                                "text-gray-800"
                                            )}`}>{item.month}</td>
                                            <td className={`text-right py-3 ${getDarkModeClass(
                                                darkMode,
                                                "text-white",
                                                "text-gray-800"
                                            )}`}>{item.shipments}</td>
                                            <td className={`text-right py-3 ${getDarkModeClass(
                                                darkMode,
                                                "text-white",
                                                "text-gray-800"
                                            )}`}>${item.revenue.toLocaleString()}</td>
                                            <td className="text-right py-3 text-green-500">{(Math.random() * 2 + 1).toFixed(1)} days</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className={`p-6 rounded-xl shadow-md ${getDarkModeClass(
                        darkMode,
                        "bg-gray-800",
                        "bg-white"
                    )}`}>
                        <h2 className={`text-lg font-semibold mb-6 ${getDarkModeClass(
                            darkMode,
                            "text-white",
                            "text-gray-800"
                        )}`}>Recent Activity</h2>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="flex items-start">
                                    <div className={`p-2 rounded-full mr-4 ${item % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {item % 2 === 0 ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${getDarkModeClass(
                                            darkMode,
                                            "text-white",
                                            "text-gray-800"
                                        )}`}>
                                            {item % 2 === 0 ? 'Shipment Delivered' : 'Shipment In Transit'}
                                        </p>
                                        <p className={`text-sm ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-400",
                                            "text-gray-500"
                                        )}`}>
                                            Shipment #{Math.floor(Math.random() * 10000)} {item % 2 === 0 ? 'was delivered successfully' : 'is on the way'}
                                        </p>
                                        <p className={`text-xs mt-1 ${getDarkModeClass(
                                            darkMode,
                                            "text-gray-500",
                                            "text-gray-400"
                                        )}`}>
                                            {new Date(Date.now() - (item * 3600000)).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Home.title = "dashboard";
