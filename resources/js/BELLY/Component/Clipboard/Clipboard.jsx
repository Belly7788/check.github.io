import { useState } from "react";
import { getDarkModeClass } from "../../../utils/darkModeUtils";

const Clipboard = ({ children, darkMode, textToCopy }) => {
  const [showCopyIcon, setShowCopyIcon] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowCopyIcon(true)}
      onMouseLeave={() => setShowCopyIcon(false)}
      data-copy-belly={textToCopy}
    >
      {children}
      {showCopyIcon && (
        <button
            type="button"
            onClick={handleCopy}
            className={`absolute -right-5 top-1/2 -translate-y-1/2 p-1 rounded ${getDarkModeClass(
            darkMode, "text-gray-300 hover:text-white", "text-gray-500 hover:text-black"
        )}`}
          aria-label="Copy to clipboard"
        >
          {copied ? (
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
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
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default Clipboard;
