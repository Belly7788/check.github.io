import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import { FiAlertCircle } from "react-icons/fi"; // Icon from react-icons
import { useTranslation } from "react-i18next"; // Import useTranslation

function ErrorAlert({ isOpen, onClose, title, message, darkMode }) {
    const [isClosing, setIsClosing] = useState(false);
    const { t } = useTranslation(); // Initialize translation hook

    // Inject CSS into the document head when the component mounts
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            @keyframes showAlert {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            .animate-show-alert {
                animation: showAlert 0.3s ease-in-out forwards;
            }
        `;
        document.head.appendChild(style);

        // Cleanup: Remove the style tag when the component unmounts
        return () => {
            document.head.removeChild(style);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Handle closing with animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300); // Match animation duration
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                className={`rounded-lg p-6 shadow-xl w-96 transform transition-all duration-300 ease-in-out ${
                    isClosing
                        ? "scale-95 opacity-0"
                        : "scale-100 opacity-100 animate-show-alert"
                } ${getDarkModeClass(
                    darkMode,
                    "bg-gray-800 text-white border border-gray-700",
                    "bg-white text-gray-800 border border-gray-200"
                )}`}
            >
                <div className="flex items-center mb-4">
                    <FiAlertCircle
                        className={`mr-2 h-6 w-6 ${getDarkModeClass(
                            darkMode,
                            "text-red-500",
                            "text-red-500"
                        )}`}
                    />
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="mb-6 text-sm">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className={`px-4 py-2 rounded-md transition-colors duration-200 ${getDarkModeClass(
                            darkMode,
                            "bg-gray-600 hover:bg-gray-700 text-white",
                            "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        )}`}
                    >
                        {t("cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper function to easily trigger the error alert
function showErrorAlert({ title, message, darkMode = false }) {
    return new Promise((resolve) => {
        const AlertWrapper = () => {
            const [isOpen, setIsOpen] = React.useState(true);

            const handleClose = () => {
                setIsOpen(false);
                resolve(false);
            };

            return (
                <ErrorAlert
                    isOpen={isOpen}
                    onClose={handleClose}
                    title={title}
                    message={message}
                    darkMode={darkMode}
                />
            );
        };

        const mountPoint = document.createElement("div");
        document.body.appendChild(mountPoint);

        const root = createRoot(mountPoint);
        root.render(<AlertWrapper />);

        // Cleanup function
        return () => {
            root.unmount();
            document.body.removeChild(mountPoint);
        };
    });
}

export { showErrorAlert };
