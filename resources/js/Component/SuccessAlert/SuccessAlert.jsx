import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getDarkModeClass } from "../../utils/darkModeUtils"; // Assuming this utility exists
import { FiCheckCircle, FiX } from "react-icons/fi"; // Success and close icons
import { useTranslation } from "react-i18next";

function SuccessAlert({ isOpen, onClose, title, message, darkMode, timeout = 3000 }) {
    const [isClosing, setIsClosing] = useState(false);
    const { t } = useTranslation();

    // Inject CSS for animations
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(100%);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes slideRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
            .animate-slide-up {
                animation: slideUp 0.3s ease-in-out forwards;
            }
            .animate-slide-right {
                animation: slideRight 0.3s ease-in-out forwards;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Auto-close after timeout
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                handleClose();
            }, timeout);
            return () => clearTimeout(timer);
        }
    }, [isOpen, timeout]);

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
        <div className="fixed inset-0 z-50 flex items-end justify-end px-4 pb-6 pointer-events-none">
            <div
                className={`rounded-lg p-6 shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out pointer-events-auto ${
                    isClosing ? "animate-slide-right" : "animate-slide-up"
                } ${getDarkModeClass(
                    darkMode,
                    "bg-gray-800 text-white border border-gray-700",
                    "bg-white text-gray-800 border border-gray-200"
                )}`}
            >
                {/* Header with Success Icon, Title, and Close Icon */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <FiCheckCircle
                            className={`mr-2 h-6 w-6 ${getDarkModeClass(
                                darkMode,
                                "text-green-400",
                                "text-green-500"
                            )}`}
                        />
                        <h3 className="text-lg font-semibold">{title}</h3>
                    </div>
                    <button onClick={handleClose}>
                        <FiX
                            className={`h-5 w-5 ${getDarkModeClass(
                                darkMode,
                                "text-gray-400 hover:text-gray-200",
                                "text-gray-500 hover:text-gray-700"
                            )}`}
                        />
                    </button>
                </div>
                {/* Message */}
                <p className="text-sm">{message}</p>
            </div>
        </div>
    );
}

// Helper function to trigger the success alert
function showSuccessAlert({ title, message, darkMode = false, timeout = 3000 }) {
    return new Promise((resolve) => {
        const AlertWrapper = () => {
            const [isOpen, setIsOpen] = React.useState(true);

            const handleClose = () => {
                setIsOpen(false);
                resolve(true);
            };

            return (
                <SuccessAlert
                    isOpen={isOpen}
                    onClose={handleClose}
                    title={title}
                    message={message}
                    darkMode={darkMode}
                    timeout={timeout}
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

export { showSuccessAlert };
