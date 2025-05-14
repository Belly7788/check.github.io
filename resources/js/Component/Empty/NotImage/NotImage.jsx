import { getDarkModeClass } from "../../../utils/darkModeUtils";
import React from 'react';
import { useTranslation } from "react-i18next";

const NoImageComponent = ({
    darkMode,
    width = '100%',
    height = '24px',
    borderRadius = '4px',
    fontSize = '14px', // Added fontSize prop with default value
}) => {
    const { t } = useTranslation();
    return (
        <div
            className={`flex text-center items-center justify-center rounded font-medium ${getDarkModeClass(
                darkMode,
                "bg-gray-800 text-gray-400",
                "bg-gray-200 text-gray-500"
            )}`}
            style={{ width, height, borderRadius, fontSize }} // Added fontSize to style
        >
            {t("no_image")}
        </div>
    );
};

export default NoImageComponent;
