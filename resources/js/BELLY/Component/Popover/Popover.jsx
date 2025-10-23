import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDarkModeClass } from "../../../utils/darkModeUtils";

const Bellypopover = ({ children, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  // Get caption and title from data attributes
  const caption = children.props['data-belly-caption'] || '';
  const title = children.props['data-belly-title'] || null;

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update popover position dynamically
  useEffect(() => {
    if (isOpen && popoverRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      const left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
      const top = triggerRect.top - popoverRect.height - 8;

      popoverRef.current.style.left = `${left}px`;
      popoverRef.current.style.top = `${top}px`;
    }
  }, [isOpen]);

  // Animation variants
  const popoverVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  };

  // Split caption into lines by comma and filter out empty strings
  const captionLines = caption
    .split(',')
    .map(line => line.trim())
    .filter(line => line);

  return (
    <div className="relative inline-block">
      <style>
        {`
          .popover-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            word-break: break-all;
            white-space: normal;
          }
          .popover-caption {
            word-break: break-all;
            white-space: normal;
            font-size: 0.875rem;
            line-height: 1.25rem;
          }
        `}
      </style>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isOpen && (caption || title) && (
          <motion.div
            ref={popoverRef}
            variants={popoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={getDarkModeClass(
              darkMode,
              'fixed z-20 min-w-[200px] max-w-[300px] p-3 rounded-lg shadow-lg border bg-gray-800 text-white border-gray-700',
              'fixed z-20 min-w-[200px] max-w-[300px] p-3 rounded-lg shadow-lg border bg-white text-gray-900 border-gray-200'
            )}
          >
            <div
              className={getDarkModeClass(
                darkMode,
                'absolute w-3 h-3 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r bg-gray-800 border-gray-700',
                'absolute w-3 h-3 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r bg-white border-gray-200'
              )}
            />
            {title && (
              <div
                className="popover-title"
                style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}
              >
                {title}
              </div>
            )}
            {captionLines.length > 0 && (
              <div className="popover-caption">
                {captionLines.map((line, index) => (
                  <div key={index} style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bellypopover;
