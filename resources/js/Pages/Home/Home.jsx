// Home.jsx
import { Link, Head } from "@inertiajs/react";
import { getDarkModeClass } from "../../utils/darkModeUtils"; // Import the utility function

export default function Home({ darkMode }) {
    return (
        <>
            <Head title="Dashboad"/>
            <div
                className={`min-h-screen w-full flex items-center justify-center p-6 ${getDarkModeClass(
                    darkMode,
                    "bg-gradient-to-br from-[#0e0d0d] via-[#1a1717] to-[#0e0d0d] text-white",
                    "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-black"
                )}`}
            >
                {/* Main Container */}
                <div className="text-center max-w-4xl mx-auto">
                    {/* Header */}
                    <h1
                        className={`text-4xl md:text-6xl font-extrabold tracking-tight mb-4 ${getDarkModeClass(
                            darkMode,
                            "text-white",
                            "text-gray-900"
                        )}`}
                    >
                        Dashboard <span className="text-[#ff8800]">Coming Soon</span>
                    </h1>
                    <p
                        className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${getDarkModeClass(
                            darkMode,
                            "text-gray-400",
                            "text-gray-600"
                        )}`}
                    >
                        Your ultimate tool for real-time shipment tracking and insights is almost here. Stay tuned!
                    </p>

                    {/* Teaser Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div
                            className={`p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-t-4 border-[#ff8800] ${getDarkModeClass(
                                darkMode,
                                "bg-[#181818] text-white",
                                "bg-white text-black"
                            )}`}
                        >
                            <p className="text-xl font-semibold text-[#ff8800]">Soon</p>
                            <p
                                className={`text-sm ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-500",
                                    "text-gray-400"
                                )}`}
                            >
                                Total Shipments
                            </p>
                        </div>
                        <div
                            className={`p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-t-4 border-[#f7b500] ${getDarkModeClass(
                                darkMode,
                                "bg-[#181818] text-white",
                                "bg-white text-black"
                            )}`}
                        >
                            <p className="text-xl font-semibold text-[#f7b500]">Soon</p>
                            <p
                                className={`text-sm ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-500",
                                    "text-gray-400"
                                )}`}
                            >
                                In Transit
                            </p>
                        </div>
                        <div
                            className={`p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-t-4 border-[#ff8800] ${getDarkModeClass(
                                darkMode,
                                "bg-[#181818] text-white",
                                "bg-white text-black"
                            )}`}
                        >
                            <p className="text-xl font-semibold text-[#ff8800]">Soon</p>
                            <p
                                className={`text-sm ${getDarkModeClass(
                                    darkMode,
                                    "text-gray-500",
                                    "text-gray-400"
                                )}`}
                            >
                                Delivered
                            </p>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="flex justify-center gap-4">
                        <button
                            className="bg-[#ff8800] hover:bg-[#f7b500] text-white py-3 px-8 rounded-full font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            Notify Me
                        </button>
                        <Link
                            href="/learn-more"
                            className={`py-3 px-8 rounded-full font-semibold text-lg border transition-all duration-300 ${getDarkModeClass(
                                darkMode,
                                "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white",
                                "border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white"
                            )}`}
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

Home.title = "Dashboad"; // Updated static title for the page
