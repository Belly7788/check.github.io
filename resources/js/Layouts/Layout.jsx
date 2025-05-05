import { Link, usePage, router } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { EzeLogo } from "../Logo/EzeLogo";
import { Logo } from "../Logo/EzeLogo";
import "../../css/scrollbar/scrollbar.css";
import { showConfirmAlert } from "../Component/Confirm-Alert/Confirm-Alert";
import { useTranslation } from "react-i18next";

export function Layout({ children }) {
  const { props } = usePage();
  const { auth } = props;
  const user = auth?.user || {};

  const { t, i18n } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);
  const [piOpen, setPiOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("/");
  const [isManuallyToggled, setIsManuallyToggled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode !== null ? JSON.parse(savedDarkMode) : false;
  });
  const { url } = usePage();

  // Extract base path without query parameters
  const basePath = url.split("?")[0]; // Removes query parameters

  const firstLetter = user.username ? user.username.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Set active menu based on basePath
    setActiveMenu(basePath);
    if (basePath.startsWith("/product")) setProductOpen(true);
    if (basePath.startsWith("/po")) setPoOpen(true);
    if (basePath.startsWith("/pi")) setPiOpen(true);
    if (basePath.startsWith("/settings")) setSettingsOpen(true);
    if (basePath.startsWith("/settings/status")) setStatusOpen(true);
  }, [basePath]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setIsManuallyToggled(!sidebarOpen);
  };

  const handleMouseEnter = () => {
    if (!isManuallyToggled) setSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isManuallyToggled) setSidebarOpen(false);
  };

  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleLanguage = () => setLanguageOpen(!languageOpen);
  const togglePo = () => setPoOpen(!poOpen);
  const togglePi = () => setPiOpen(!piOpen);
  const toggleProduct = () => setProductOpen(!productOpen);
  const toggleSettings = () => setSettingsOpen(!settingsOpen);
  const toggleStatus = () => setStatusOpen(!statusOpen);
  const toggleDarkMode = () => setDarkMode((prevMode) => !prevMode);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageOpen(false);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirmAlert({
      title: t("confirm_logout"),
      message: t("are_you_sure_logout"),
      onConfirm: () => {
        router.post("/logout", {}, {
          onSuccess: () => {
            window.location.href = "/login";
          },
        });
      },
      darkMode: darkMode,
    });
  };

  const title = React.Children.map(children, (child) => child.type.title)?.[0] || "";
  const subtitle = React.Children.map(children, (child) => child.type.subtitle)?.[0] || "";

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { darkMode });
    }
    return child;
  });

  return (
    <div className={`flex h-screen ${darkMode ? "dark:text-white" : "text-black"}`}>
      {/* Sidebar */}
      <div
        className={`${
          darkMode ? "bg-[#111111] text-white" : "bg-[#ff8800] text-black"
        } transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 flex items-center justify-center">
          {sidebarOpen ? <EzeLogo /> : <Logo />}
        </div>

        <nav className="flex w-full flex-col gap-2 pr-4 pl-4 flex-1 overflow-y-auto custom-scrollbar">
          <NavItem
            href="/"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            }
            text={t("dashboard")}
            sidebarOpen={sidebarOpen}
            active={basePath === "/"}
            onClick={() => setActiveMenu("/")}
            darkMode={darkMode}
          />

          {/* Product Menu with Dropdown */}
          <div className="w-full">
            <button
              onClick={toggleProduct}
              className={`flex items-center p-2 pl-3 w-full rounded-lg transition-colors duration-200 ${
                basePath.startsWith("/product")
                  ? darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-[#ff8800]"
                  : darkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-white"
              }`}
            >
              <span className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </span>
              {sidebarOpen && (
                <div className="ml-4 flex-1 flex justify-between items-center">
                  <span>{t("product")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      productOpen ? "transform rotate-180" : ""
                    }`}
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
              )}
            </button>
            {productOpen && sidebarOpen && (
              <div className="ml-8 pl-2 mt-1 space-y-1">
                <NavItem
                  href="/product/productlist"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  text={t("list_products")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/product/productlist"}
                  onClick={() => setActiveMenu("/product/productlist")}
                  darkMode={darkMode}
                />
                <NavItem
                  href="/product/product_cost"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  text={t("product_cost")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/product/product_cost"}
                  onClick={() => setActiveMenu("/product/product_cost")}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          {/* PO Menu with Dropdown */}
          <div className="w-full">
            <button
              onClick={togglePo}
              className={`flex items-center p-2 pl-3 w-full rounded-lg transition-colors duration-200 ${
                basePath.startsWith("/po")
                  ? darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-[#ff8800]"
                  : darkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-white"
              }`}
            >
              <span className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </span>
              {sidebarOpen && (
                <div className="ml-4 flex-1 flex justify-between items-center">
                  <span>{t("po")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      poOpen ? "transform rotate-180" : ""
                    }`}
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
              )}
            </button>
            {poOpen && sidebarOpen && (
              <div className="ml-8 pl-2 mt-1 space-y-1">
                <NavItem
                  href="/po/create"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  text={t("create_po")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/po/create"}
                  onClick={() => setActiveMenu("/po/create")}
                  darkMode={darkMode}
                />
                <NavItem
                  href="/po/list"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />


                    </svg>
                  }
                  text={t("list_po")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/po/list"}
                  onClick={() => setActiveMenu("/po/list")}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          {/* PI Menu with Dropdown */}
          <div className="w-full">
            <button
              onClick={togglePi}
              className={`flex items-center p-2 pl-3 w-full rounded-lg transition-colors duration-200 ${
                basePath.startsWith("/pi")
                  ? darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-[#ff8800]"
                  : darkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-white"
              }`}
            >
              <span className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              </span>
              {sidebarOpen && (
                <div className="ml-4 flex-1 flex justify-between items-center">
                  <span>{t("pi")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      piOpen ? "transform rotate-180" : ""
                    }`}
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
              )}
            </button>
            {piOpen && sidebarOpen && (
              <div className="ml-8 mt-1 space-y-1">
                <NavItem
                  href="/pi/create"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  text={t("create_pi")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/pi/create"}
                  onClick={() => setActiveMenu("/pi/create")}
                  darkMode={darkMode}
                />
                <NavItem
                  href="/pi/list"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  text={t("list_pi")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/pi/list"}
                  onClick={() => setActiveMenu("/pi/list")}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          <NavItem
            href="/payment"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            text={t("payment")}
            sidebarOpen={sidebarOpen}
            active={basePath === "/payment"}
            onClick={() => setActiveMenu("/payment")}
            darkMode={darkMode}
          />

          {/* Settings Menu with Dropdown */}
          <div className="mt-auto w-full mb-4">
            <button
              onClick={toggleSettings}
              className={`flex items-center p-2 pl-3 w-full rounded-lg transition-colors duration-200 ${
                basePath.startsWith("/settings")
                  ? darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-[#ff8800]"
                  : darkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-white"
              }`}
            >
              <span className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              {sidebarOpen && (
                <div className="ml-4 flex-1 flex justify-between items-center">
                  <span>{t("settings")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      settingsOpen ? "transform rotate-180" : ""
                    }`}
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
              )}
            </button>
            {settingsOpen && sidebarOpen && (
              <div className="ml-8 pl-2 mt-1 space-y-1">
                <NavItem
                  href="/settings/user/user-management"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  text={t("user")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/settings/user/user-management"}
                  onClick={() => setActiveMenu("/settings/user/user-management")}
                  darkMode={darkMode}
                />
                <NavItem
                  href="/settings/role/role-management"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  text={t("role")}
                  sidebarOpen={sidebarOpen}
                  active={basePath === "/settings/role/role-management"}
                  onClick={() => setActiveMenu("/settings/role/role-management")}
                  darkMode={darkMode}
                />
                <div className="w-full">
                  <button
                    onClick={toggleStatus}
                    className={`flex items-center p-2 w-full rounded-lg transition-colors duration-200 ${
                      basePath.startsWith("/settings/status")
                        ? darkMode
                          ? "bg-gray-700 text-white"
                          : "bg-white text-[#ff8800]"
                        : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-white"
                    }`}
                  >
                    <span className="flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                    <div className="ml-4 flex-1 flex justify-between items-center">
                      <span>{t("status")}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform duration-200 ${
                          statusOpen ? "transform rotate-180" : ""
                        }`}
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
                  </button>
                  {statusOpen && (
                    <div className="ml-8 pl-2 mt-1 space-y-1">
                      <NavItem
                        href="/settings/status/branch"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        }
                        text={t("branch")}
                        sidebarOpen={sidebarOpen}
                        active={basePath === "/settings/status/branch"}
                        onClick={() => setActiveMenu("/settings/status/branch")}
                        darkMode={darkMode}
                      />
                      <NavItem
                        href="/settings/status/company"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        }
                        text={t("company")}
                        sidebarOpen={sidebarOpen}
                        active={basePath === "/settings/status/company"}
                        onClick={() => setActiveMenu("/settings/status/company")}
                        darkMode={darkMode}
                      />
                      <NavItem
                        href="/settings/status/method"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        }
                        text={t("method")}
                        sidebarOpen={sidebarOpen}
                        active={basePath === "/settings/status/method"}
                        onClick={() => setActiveMenu("/settings/status/method")}
                        darkMode={darkMode}
                      />
                      <NavItem
                        href="/settings/status/shipment"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        }
                        text={t("shipment")}
                        sidebarOpen={sidebarOpen}
                        active={basePath === "/settings/status/shipment"}
                        onClick={() => setActiveMenu("/settings/status/shipment")}
                        darkMode={darkMode}
                      />
                      <NavItem
                        href="/settings/status/warehouse"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        }
                        text={t("warehouse")}
                        sidebarOpen={sidebarOpen}
                        active={basePath === "/settings/status/warehouse"}
                        onClick={() => setActiveMenu("/settings/status/warehouse")}
                        darkMode={darkMode}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`shadow-sm ${darkMode ? "bg-[#111111] text-white" : "bg-white text-gray-800"}`}
        >
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className={`p-2 mr-4 rounded-lg ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="4" y="4" width="6" height="6" rx="1" />
                  <rect x="14" y="4" width="6" height="6" rx="1" />
                  <rect x="4" y="14" width="6" height="6" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold">
                {t(title)}
                {subtitle && (
                  <>
                    <span className="inline-block mx-2">→</span>
                    {t(subtitle)}
                  </>
                )}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={toggleLanguage}
                  className={`flex items-center space-x-2 focus:outline-none px-2 py-1 rounded-md transition-colors duration-200 ${
                    darkMode
                      ? " text-gray-200 hover:bg-gray-700"
                      : " text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center">
                    <img
                      src={
                        i18n.language === "en"
                          ? "https://flagcdn.com/w20/gb.png"
                          : i18n.language === "km"
                          ? "https://flagcdn.com/w20/kh.png"
                          : "https://flagcdn.com/w20/cn.png"
                      }
                      srcSet={
                        i18n.language === "en"
                          ? "https://flagcdn.com/48x36/gb.png 2x, https://flagcdn.com/72x54/gb.png 3x"
                          : i18n.language === "km"
                          ? "https://flagcdn.com/48x36/kh.png 2x, https://flagcdn.com/72x54/kh.png 3x"
                          : "https://flagcdn.com/48x36/cn.png 2x, https://flagcdn.com/72x54/cn.png 3x"
                      }
                      alt="Language flag"
                    />
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      languageOpen ? "transform rotate-180" : ""
                    }`}
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
                </button>

                {languageOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg py-2 z-20 border ${
                      darkMode
                        ? "bg-gray-800 text-gray-200 border-gray-700"
                        : "bg-white text-gray-800 border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-200 ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <img
                        src="https://flagcdn.com/w20/gb.png"
                        srcSet="https://flagcdn.com/w40/gb.png 2x"
                        alt="English flag"
                        className="mr-2"
                      />
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage("km")}
                      className={`flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-200 ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <img
                        src="https://flagcdn.com/w20/kh.png"
                        srcSet="https://flagcdn.com/w40/kh.png 2x"
                        alt="Khmer flag"
                        className="mr-2"
                      />
                      ខ្មែរ
                    </button>
                    <button
                      onClick={() => changeLanguage("zh")}
                      className={`flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-200 ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <img
                        src="https://flagcdn.com/w20/cn.png"
                        srcSet="https://flagcdn.com/w40/cn.png 2x"
                        alt="Chinese flag"
                        className="mr-2"
                      />
                      中文
                    </button>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="relative w-[52px] h-6 bg-gray-300 rounded-full flex items-center p-1 transition-colors duration-300"
              >
                <div
                  className={`absolute w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center ${
                    darkMode
                      ? "translate-x-6 bg-gray-600"
                      : "translate-x-0 bg-orange-400"
                  }`}
                >
                  {darkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className={`flex items-center space-x-2 focus:outline-none px-2 py-1 rounded-md transition-colors duration-200 ${
                    darkMode
                      ? " text-gray-200 hover:bg-gray-700"
                      : " text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt="User profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-white font-semibold text-lg ${
                          darkMode ? "bg-gray-600" : "bg-orange-500"
                        }`}
                      >
                        {firstLetter}
                      </div>
                    )}
                  </div>
                  {sidebarOpen && (
                    <span className="hidden md:inline-block text-sm">{t("profile")}</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      profileOpen ? "transform rotate-180" : ""
                    }`}
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
                </button>

                {profileOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg py-2 z-20 border ${
                      darkMode
                        ? "bg-gray-800 text-gray-200 border-gray-700"
                        : "bg-white text-gray-800 border-gray-200"
                    }`}
                  >
                    <p
                      className={`block px-4 py-2 text-sm ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {user.username || "User"}
                    </p>
                    <Link
                      href="/settings"
                      className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                        darkMode
                          ? "text-gray-200 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {t("settings")}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`w-full text-start block px-4 py-2 text-sm transition-colors duration-200 ${
                        darkMode
                          ? "text-gray-200 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {t("sign_out")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 min-w-full custom-scrollbar p-2 overflow-y-auto ${
            darkMode ? "bg-[#0e0d0d] text-white" : "bg-gray-100 text-black"
          }`}
        >
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, text, sidebarOpen, active, onClick, darkMode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center p-2 pl-3 w-full rounded-lg transition-colors duration-200 ${
        active
          ? darkMode
            ? "bg-gray-700 text-white"
            : "bg-white text-[#ff8800]"
          : darkMode
          ? "hover:bg-gray-700"
          : "hover:bg-white"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {sidebarOpen && <span className="ml-4">{text}</span>}
    </Link>
  );
}
