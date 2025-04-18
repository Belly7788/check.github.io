import React from "react";

export function EzeLogo() {
    return (
        <div className="flex items-center p-2">
            {/* EZE Text */}
            <h1
                className="text-2xl font-extrabold text-white uppercase tracking-wider"
                style={{
                    fontFamily: "'Berlin Sans FB Demi Bold', sans-serif",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                }}
            >
                EZE
            </h1>

            {/* 1.1 Circle */}
            <div
                className="ml-2 flex items-center justify-center w-8 h-8 bg-white rounded-full"
                style={{
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
            >
                <span
                    className="text-2xl font-bold text-[#ff8800]"
                    style={{
                        fontFamily: "'Berlin Sans FB Demi Bold', sans-serif",
                    }}
                >
                    1.1
                </span>
            </div>
        </div>
    );
}
export function EzeLogoForLogin() {
    return (
        <div className="flex items-center p-2">
            {/* EZE Text */}
            <h1
                className="text-4xl font-extrabold text-[#ff8800] uppercase tracking-wider"
                style={{
                    fontFamily: "'Berlin Sans FB Demi Bold', sans-serif",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                }}
            >
                EZE
            </h1>

            {/* 1.1 Circle with spinning border */}
            <div className="ml-3 relative flex items-center justify-center w-12 h-12">
                {/* Spinning border */}
                <div
                    className="absolute w-full h-full border-4 border-r-[#ff8800] border-t-[#ff8800] rounded-full"
                    style={{
                        
                        animation: "spin 1s linear infinite",
                    }}
                ></div>
                {/* Static inner circle with text */}
                <div className="flex items-center justify-center w-full h-full bg-white rounded-full">
                    <span
                        className="text-4xl font-bold text-[#ff8800]"
                        style={{
                            fontFamily: "'Berlin Sans FB Demi Bold', sans-serif",
                        }}
                    >
                        1.1
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
export function Logo() {
    return (
        <div className="flex items-center p-2">
            {/* 1.1 Circle */}
            <div
                className="flex items-center justify-center w-8 h-8 bg-white rounded-full"
                style={{
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
            >
                <span
                    className="text-2xl font-bold text-[#ff8800]"
                    style={{
                        fontFamily: "'Berlin Sans FB Demi Bold', sans-serif",
                    }}
                >
                    1.1
                </span>
            </div>
        </div>
    );
}
