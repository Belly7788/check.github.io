import React from "react";

const Spinner = ({
    width = "32px",
    height = "32px",
    borderColor = "#e5e7eb", // ពណ៌ border លើក្បាល
    borderBgColor = "#ff8800", // ពណ៌ border ផ្សេងៗ
    borderWidth = "4px", // កម្រាស់ border
    duration = "1s" // ល្បឿន animation
}) => {
    return (
        <div
            style={{
                width,
                height,
                borderWidth,
                borderTopColor: borderColor,
                borderLeftColor: borderBgColor,
                borderRightColor: borderBgColor,
                borderBottomColor: borderBgColor,
                animationDuration: duration
            }}
            className="border-solid rounded-full animate-spin"
        ></div>
    );
};

export default Spinner;
