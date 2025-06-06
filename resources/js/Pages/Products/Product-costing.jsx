import { Link, Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDarkModeClass } from "../../utils/darkModeUtils";
import ComingSoon404 from "../../Component/ErrorPages/404";

export default function Product_costing({ darkMode }) {
    const { t } = useTranslation();

    return (
        <ComingSoon404 darkMode={darkMode} />
    );
}

Product_costing.title = "product";
Product_costing.subtitle = "products_costing";
