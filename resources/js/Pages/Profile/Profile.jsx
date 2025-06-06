import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { FaCamera, FaUserCircle, FaSave, FaEye, FaEyeSlash } from "react-icons/fa";
import { router, usePage, Head } from "@inertiajs/react";
import axios from "axios";
import Spinner from "../../Component/spinner/spinner";
import { showSuccessAlert } from "../../Component/SuccessAlert/SuccessAlert";
import { showErrorAlert } from "../../Component/ErrorAlert/ErrorAlert";
import { showConfirmAlert } from "../../Component/Confirm-Alert/Confirm-Alert";
import ProfileSettingsLoading from './Component/ProfileSettingsLoading'; // Adjust the import path as needed
import { getDarkModeClass } from "../../utils/darkModeUtils";

export default function ProfileSettings({ darkMode }) {
    const { t } = useTranslation();
    const { props } = usePage();
    const { user } = props;

    // State for loading
    const [isLoading, setIsLoading] = useState(true);

    // State for messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // State for images
    const [profileImage, setProfileImage] = useState(user.image || null);
    const [coverImage, setCoverImage] = useState(user.cover || null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isCoverLoading, setIsCoverLoading] = useState(false);
    const [isProfileDragging, setIsProfileDragging] = useState(false);
    const [isCoverDragging, setIsCoverDragging] = useState(false);

    // State for form data
    const [formData, setFormData] = useState({
        username: user.username || "",
        email: user.email || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // State for username validation
    const [usernameError, setUsernameError] = useState("");
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
    const [isProfileSaveDisabled, setIsProfileSaveDisabled] = useState(true);

    // State for password validation
    const [passwordErrors, setPasswordErrors] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        match: false,
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordSaveDisabled, setIsPasswordSaveDisabled] = useState(true);

    // State for form submission loading
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

    // Simulate slow internet loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false); // Simulate data fetch completion after 3 seconds
        }, 3000); // Adjust delay to simulate slow internet

        return () => clearTimeout(timer);
    }, []);

    // Handle messages display
    useEffect(() => {
        if (successMessage) {
            showSuccessAlert({
                title: t("success"),
                message: successMessage,
                darkMode,
            });
            setSuccessMessage(null);
        }
        if (errorMessage) {
            showErrorAlert({
                title: t("error"),
                message: errorMessage,
                darkMode,
            });
            setErrorMessage(null);
        }
    }, [successMessage, errorMessage, darkMode, t]);

    // Real-time username validation
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (formData.username && formData.username !== user.username) {
                axios
                    .get(`/check-username/${encodeURIComponent(formData.username)}`)
                    .then((response) => {
                        setIsUsernameAvailable(response.data.available);
                        setUsernameError(response.data.message);
                        setIsProfileSaveDisabled(
                            !response.data.available ||
                            (formData.username === user.username && formData.email === user.email)
                        );
                    })
                    .catch((error) => {
                        console.error("Error checking username:", error);
                        setIsUsernameAvailable(false);
                        setUsernameError(t("profile_setting.username_check_error"));
                        setIsProfileSaveDisabled(true);
                    });
            } else {
                setIsUsernameAvailable(true);
                setUsernameError("");
                setIsProfileSaveDisabled(formData.username === user.username && formData.email === user.email);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [formData.username, formData.email, user.username, user.email, t]);

    // Real-time password validation
    useEffect(() => {
        const { newPassword, confirmPassword } = formData;
        const errors = {
            length: newPassword.length < 8,
            uppercase: !/[A-Z]/.test(newPassword),
            lowercase: !/[a-z]/.test(newPassword),
            number: !/[0-9]/.test(newPassword),
            match: newPassword !== confirmPassword || !confirmPassword,
        };

        setPasswordErrors(errors);
        setIsPasswordSaveDisabled(
            errors.length || errors.uppercase || errors.lowercase || errors.number || errors.match
        );
    }, [formData.newPassword, formData.confirmPassword]);

    // Handle image file selection with confirmation
    const handleImageChange = (file, type) => {
        if (file && file.type.startsWith("image/")) {
            showConfirmAlert({
                title: t("profile_setting.confirm_update"),
                message: t(type === "profile" ? "profile_setting.confirm_update_profile_image" : "profile_setting.confirm_update_cover_image"),
                darkMode,
                onConfirm: () => {
                    const setLoading = type === "profile" ? setIsProfileLoading : setIsCoverLoading;
                    const setImage = type === "profile" ? setProfileImage : setCoverImage;

                    setLoading(true);
                    const reader = new FileReader();
                    reader.onload = () => {
                        setImage(reader.result);
                        const formData = new FormData();
                        formData.append(type === "profile" ? "profile_image" : "cover_image", file);
                        router.post(
                            type === "profile" ? "/settings/profile/image" : "/settings/profile/cover",
                            formData,
                            {
                                preserveState: true,
                                preserveScroll: true,
                                onStart: () => setLoading(true),
                                onSuccess: () => {
                                    setSuccessMessage(t(type === "profile" ? "profile_setting.profile_image_updated" : "profile_setting.cover_image_updated"));
                                },
                                onError: (errors) => {
                                    setErrorMessage(errors.profile_image || errors.cover_image || t("profile_setting.image_update_failed"));
                                },
                                onFinish: () => setLoading(false),
                            }
                        );
                    };
                    reader.onerror = () => {
                        setLoading(false);
                        setErrorMessage(t("profile_setting.image_read_error"));
                    };
                    reader.readAsDataURL(file);
                },
            });
        } else {
            setErrorMessage(t("profile_setting.invalid_image_file"));
        }
    };

    // Handle file input
    const handleFileInput = (e, type) => {
        const file = e.target.files[0];
        handleImageChange(file, type);
    };

    // Handle drag and drop
    const handleDrop = (e, type) => {
        e.preventDefault();
        const setDragging = type === "profile" ? setIsProfileDragging : setIsCoverDragging;
        setDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageChange(file, type);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle profile form submission
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (!isUsernameAvailable) {
            setErrorMessage(t("profile_setting.username_taken"));
            return;
        }
        setIsProfileSubmitting(true);
        router.post(
            "/settings/profile",
            {
                username: formData.username,
                email: formData.email,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsProfileSubmitting(true),
                onSuccess: () => {
                    setSuccessMessage(t("profile_setting.profile_updated"));
                },
                onError: (errors) => {
                    setErrorMessage(errors.username || errors.email || t("profile_setting.profile_update_failed"));
                },
                onFinish: () => setIsProfileSubmitting(false),
            }
        );
    };

    // Handle password form submission
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setErrorMessage(t("profile_setting.passwords_do_not_match"));
            return;
        }
        setIsPasswordSubmitting(true);
        router.post(
            "/settings/password",
            {
                old_password: formData.oldPassword,
                new_password: formData.newPassword,
                new_password_confirmation: formData.confirmPassword,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsPasswordSubmitting(true),
                onSuccess: () => {
                    setSuccessMessage(t("profile_setting.password_updated"));
                    setFormData((prev) => ({
                        ...prev,
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    }));
                },
                onError: (errors) => {
                    setErrorMessage(errors.old_password || t("profile_setting.password_update_failed"));
                },
                onFinish: () => setIsPasswordSubmitting(false),
            }
        );
    };

    // Handle ESC key to reset forms
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                setFormData({
                    username: user.username || "",
                    email: user.email || "",
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setProfileImage(user.image || null);
                setCoverImage(user.cover || null);
                setUsernameError("");
                setIsUsernameAvailable(true);
                setIsProfileSaveDisabled(true);
                setPasswordErrors({
                    length: false,
                    uppercase: false,
                    lowercase: false,
                    number: false,
                    match: false,
                });
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [user]);

    // Dark mode utility
    const darkClass = (darkClass, lightClass) => (darkMode ? darkClass : lightClass);

    // Render loading component if still loading
    if (isLoading) {
        return <ProfileSettingsLoading darkMode={darkMode} />;
    }

    // Original ProfileSettings content
    return (
        <>
            <Head title={t("profile")} />
            <div className={`w-full rounded-2xl overflow-hidden transition-all duration-300`}>
                {/* Cover Photo Section */}
                <div className="relative h-72 w-full">
                    <div
                        className={`absolute inset-0 cursor-pointer rounded-t-2xl border-2 border-dashed transition-all duration-300 ${
                            isCoverDragging
                                ? "border-[#ff8800] bg-[#ff8800]/10 shadow-[0_0_20px_5px_rgba(255,136,0,0.5)]"
                                : darkClass(
                                    "border-gray-600 shadow-[0_0_10px_2px_rgba(255,136,0,0.3)]",
                                    "border-gray-300 shadow-[0_0_10px_2px_rgba(255,136,0,0.2)]"
                                )
                        }`}
                        onDrop={(e) => handleDrop(e, "cover")}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsCoverDragging(true);
                        }}
                        onDragLeave={() => setIsCoverDragging(false)}
                        onClick={() => document.getElementById("cover-image-input").click()}
                    >
                        {isCoverLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-t-2xl">
                                <Spinner width="40px" height="40px" />
                            </div>
                        )}
                        {!coverImage && !isCoverLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <FaCamera
                                    className={`w-12 h-12 mb-3 ${darkClass(
                                        "text-gray-400",
                                        "text-gray-500"
                                    )} transition-transform duration-300 hover:scale-110`}
                                />
                                <p className={`text-sm font-medium ${darkClass("text-gray-300", "text-gray-600")}`}>
                                    {t("profile_setting.drag_drop_cover_image")}
                                </p>
                            </div>
                        )}
                        {coverImage && !isCoverLoading && (
                            <img
                                src={coverImage}
                                alt="Cover Preview"
                                className="w-full h-full object-cover rounded-t-2xl transition-opacity duration-300 hover:opacity-90"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="cover-image-input"
                            onChange={(e) => handleFileInput(e, "cover")}
                        />
                    </div>

                    {/* Profile Picture Section */}
                    <div className="absolute -bottom-16 left-8">
                        <div
                            className={`relative w-36 h-36 rounded-full border-4 transition-all duration-300 ${
                                isProfileDragging
                                    ? "border-[#ff8800] bg-[#ff8800]/10 shadow-[0_0_20px_5px_rgba(255,136,0,0.5)]"
                                    : darkClass(
                                        "border-[#ff8800] shadow-[0_0_15px_3px_rgba(255,136,0,0.4)]",
                                        "border-[#ff8800] shadow-[0_0_15px_3px_rgba(255,136,0,0.3)]"
                                    )
                            }`}
                            onDrop={(e) => handleDrop(e, "profile")}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsProfileDragging(true);
                            }}
                            onDragLeave={() => setIsProfileDragging(false)}
                            onClick={() => document.getElementById("profile_setting.profile-image-input").click()}
                        >
                            {isProfileLoading && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                    <Spinner width="32px" height="32px" />
                                </div>
                            )}
                            {!profileImage && !isProfileLoading && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full">
                                    <FaUserCircle
                                        className={`w-full h-full ${darkClass(
                                            "text-gray-500",
                                            "text-gray-400"
                                        )} transition-transform duration-300 hover:scale-105`}
                                    />
                                </div>
                            )}
                            {profileImage && !isProfileLoading && (
                                <img
                                    src={profileImage}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover rounded-full transition-opacity duration-300 hover:opacity-90"
                                />
                            )}
                            <div className="absolute bottom-2 right-2 bg-[#ff8800] rounded-full p-3 shadow-lg cursor-pointer hover:bg-[#e67b00] transition-all duration-200">
                                <FaCamera className="w-5 h-5 text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="profile-image-input"
                                onChange={(e) => handleFileInput(e, "profile")}
                            />
                        </div>
                        <p className={`text-center mt-2 font-medium ${darkClass("text-gray-200", "text-gray-700")}`}>
                            {formData.username || t("username")}
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 pt-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div
                            className={`p-8 rounded-2xl shadow-lg border-2 border-[#ff8800] ${darkClass(
                                "bg-[#1d1c1c] shadow-[0_0_15px_3px_rgba(255,136,0,0.4)]",
                                "bg-white/90 shadow-[0_0_15px_3px_rgba(255,136,0,0.3)]"
                            )} backdrop-blur-md transition-all duration-300`}
                        >
                            <h2
                                className={`text-lg font-semibold mb-6 pb-3 border-b-2 border-[#ff8800] ${darkClass(
                                    "text-gray-100",
                                    "text-gray-900"
                                )}`}
                            >
                                <FaUserCircle className="inline mr-3 text-[#ff8800] w-5 h-5" />
                                {t("profile_setting.profile_information")}
                            </h2>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div>
                                    <label
                                        className={`block text-xs font-medium mb-2 ${darkClass(
                                            "text-gray-200",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("username")}
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={`w-full border-2 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:shadow-[0_0_10px_2px_rgba(255,136,0,0.4)] focus:border-transparent transition-all duration-200 ${darkClass(
                                            "bg-gray-700/50 text-gray-200 border-gray-600",
                                            "bg-gray-50 text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder={t("enter_username")}
                                    />
                                    {usernameError && (
                                        <p
                                            className={`text-red-500 text-xs mt-2 transition-opacity duration-200 ${
                                                isUsernameAvailable ? "opacity-0" : "opacity-100"
                                            }`}
                                        >
                                            {usernameError}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        className={`block text-xs font-medium mb-2 ${darkClass(
                                            "text-gray-200",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("profile_setting.email")}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full border-2 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:shadow-[0_0_10px_2px_rgba(255,136,0,0.4)] focus:border-transparent transition-all duration-200 ${darkClass(
                                            "bg-gray-700/50 text-gray-200 border-gray-600",
                                            "bg-gray-50 text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder="example@gmail.com"
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isProfileSaveDisabled || isProfileSubmitting}
                                        className={`flex items-center px-6 py-3 mt-24 rounded-xl font-medium text-sm border-2 border-[#ff8800] text-[#ff8800] shadow-md transition-all duration-200 transform hover:-translate-y-0.5 ${
                                            isProfileSaveDisabled || isProfileSubmitting
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-[#ff8800] hover:text-white hover:shadow-[0_0_15px_3px_rgba(255,136,0,0.4)]"
                                        }`}
                                    >
                                        {isProfileSubmitting ? (
                                            <Spinner width="20px" height="20px" className="mr-2" />
                                        ) : (
                                            <FaSave className="mr-2 w-4 h-4" />
                                        )}
                                        {t("save")}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Form */}
                        <div
                            className={`p-8 rounded-2xl shadow-lg border-2 border-[#ff8800] ${darkClass(
                                "bg-[#1d1c1c] shadow-[0_0_15px_3px_rgba(255,136,0,0.4)]",
                                "bg-white/90 shadow-[0_0_15px_3px_rgba(255,136,0,0.3)]"
                            )} backdrop-blur-md transition-all duration-300`}
                        >
                            <h2
                                className={`text-lg font-semibold mb-6 pb-3 border-b-2 border-[#ff8800] ${darkClass(
                                    "text-gray-100",
                                    "text-gray-900"
                                )}`}
                            >
                                <svg
                                    className="inline w-5 h-5 mr-3 text-[#ff8800]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                {t("profile_setting.change_password")}
                            </h2>
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="relative">
                                    <label
                                        className={`block text-xs font-medium mb-2 ${darkClass(
                                            "text-gray-200",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("profile_setting.old_password")}
                                    </label>
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        name="oldPassword"
                                        value={formData.oldPassword}
                                        onChange={handleInputChange}
                                        className={`w-full border-2 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:shadow-[0_0_10px_2px_rgba(255,136,0,0.4)] focus:border-transparent transition-all duration-200 ${darkClass(
                                            "bg-gray-700/50 text-gray-200 border-gray-600",
                                            "bg-gray-50 text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder={t("profile_setting.enter_old_password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                    >
                                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label
                                        className={`block text-xs font-medium mb-2 ${darkClass(
                                            "text-gray-200",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("profile_setting.new_password")}
                                    </label>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className={`w-full border-2 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:shadow-[0_0_10px_2px_rgba(255,136,0,0.4)] focus:border-transparent transition-all duration-200 ${darkClass(
                                            "bg-gray-700/50 text-gray-200 border-gray-600",
                                            "bg-gray-50 text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder={t("profile_setting.enter_new_password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    {formData.newPassword && (
                                        <div className="text-red-500 text-xs mt-2">
                                            {passwordErrors.length && <p>{t("profile_setting.password_min_8")}</p>}
                                            {passwordErrors.uppercase && <p>{t("profile_setting.password_uppercase")}</p>}
                                            {passwordErrors.lowercase && <p>{t("profile_setting.password_lowercase")}</p>}
                                            {passwordErrors.number && <p>{t("profile_setting.password_number")}</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <label
                                        className={`block text-xs font-medium mb-2 ${darkClass(
                                            "text-gray-200",
                                            "text-gray-700"
                                        )}`}
                                    >
                                        {t("profile_setting.confirm_password")}
                                    </label>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`w-full border-2 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:shadow-[0_0_10px_2px_rgba(255,136,0,0.4)] focus:border-transparent transition-all duration-200 ${darkClass(
                                            "bg-gray-700/50 text-gray-200 border-gray-600",
                                            "bg-gray-50 text-gray-900 border-gray-200"
                                        )}`}
                                        placeholder={t("profile_setting.confirm_new_password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    {formData.confirmPassword && passwordErrors.match && (
                                        <p className="text-red-500 text-xs mt-2">{t("passwords_do_not_match")}</p>
                                    )}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isPasswordSaveDisabled || isPasswordSubmitting}
                                        className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm border-2 border-[#ff8800] text-[#ff8800] shadow-md transition-all duration-200 transform hover:-translate-y-0.5 ${
                                            isPasswordSaveDisabled || isPasswordSubmitting
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-[#ff8800] hover:text-white hover:shadow-[0_0_15px_3px_rgba(255,136,0,0.4)]"
                                        }`}
                                    >
                                        {isPasswordSubmitting ? (
                                            <Spinner width="20px" height="20px" className="mr-2" />
                                        ) : (
                                            <FaSave className="mr-2 w-4 h-4" />
                                        )}
                                        {t("save")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ProfileSettings.title = "profile_setting.profile_settings";
ProfileSettings.subtitle = "profile_setting.manage_profile";
