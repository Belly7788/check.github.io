import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { getDarkModeClass } from '../../../utils/darkModeUtils';
import { useTranslation } from 'react-i18next';

const MuiStyleDatePicker = ({ label, value, onChange, error, helperText, style, darkMode = false }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : new Date());
  const [view, setView] = useState('day');
  const [inputValue, setInputValue] = useState(value || '');
  const [dropdownPosition, setDropdownPosition] = useState({
    horizontal: 'right',
    vertical: 'bottom',
  });
  const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });
  const datePickerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-position dropdown and set animation origin
  useEffect(() => {
    if (isOpen && datePickerRef.current && dropdownRef.current && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const dropdownWidth = 288;
      const dropdownHeight = 320;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const spaceOnRight = viewportWidth - inputRect.right;
      const spaceOnLeft = inputRect.left;
      const horizontal =
        spaceOnRight >= dropdownWidth ? 'right' : spaceOnLeft >= dropdownWidth ? 'left' : 'right';

      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const vertical =
        spaceBelow >= dropdownHeight ? 'bottom' : spaceAbove >= dropdownHeight ? 'top' : 'bottom';

      setDropdownPosition({ horizontal, vertical });

      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const originX = inputRect.left + inputRect.width / 2 - dropdownRect.left;
      const originY = inputRect.bottom - dropdownRect.top;
      setAnimationOrigin({ x: originX, y: originY });
    }
  }, [isOpen]);

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    const formattedDate = formatDate(newDate);
    onChange(formattedDate);
    setInputValue(formattedDate);
    closeDropdown();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      if (!isNaN(newDate.getTime())) {
        setDate(newDate);
        onChange(e.target.value);
      }
    }
  };

  const openDropdown = () => setIsOpen(true);

  const closeDropdown = () => {
    const dropdown = dropdownRef.current;
    if (dropdown) {
      dropdown.classList.remove('animate-zoom-in');
      dropdown.classList.add('animate-zoom-out');
      setTimeout(() => {
        setIsOpen(false);
        setView('day');
        if (dropdown) {
          dropdown.classList.remove('animate-zoom-out');
          dropdown.classList.add('animate-zoom-in');
        }
      }, 200);
    } else {
      setIsOpen(false);
      setView('day');
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(date);
    if (view === 'day') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'year') {
      newDate.setFullYear(newDate.getFullYear() + direction * 10);
    }
    setDate(newDate);
  };

  const clearDate = () => {
    setInputValue('');
    onChange('');
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 py-3">
      <button
        type="button"
        onClick={() => navigateMonth(-1)}
        className={getDarkModeClass(
          darkMode,
          'text-gray-300 hover:bg-gray-700 rounded-full p-1',
          'text-gray-600 hover:bg-gray-100 rounded-full p-1'
        )}
      >
        <FiChevronLeft size={20} />
      </button>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setView('month')}
          className={getDarkModeClass(
            darkMode,
            'text-sm font-medium text-gray-200 hover:bg-gray-700 px-2 py-1 rounded',
            'text-sm font-medium text-gray-800 hover:bg-gray-100 px-2 py-1 rounded'
          )}
        >
          {t(`datePicker.months.${date.toLocaleString('en', { month: 'short' }).toLowerCase()}`)}
        </button>
        <button
          type="button"
          onClick={() => setView('year')}
          className={getDarkModeClass(
            darkMode,
            'text-sm font-medium text-gray-200 hover:bg-gray-700 px-2 py-1 rounded',
            'text-sm font-medium text-gray-800 hover:bg-gray-100 px-2 py-1 rounded'
          )}
        >
          {date.getFullYear()}
        </button>
      </div>
      <button
        type="button"
        onClick={() => navigateMonth(1)}
        className={getDarkModeClass(
          darkMode,
          'text-gray-300 hover:bg-gray-700 rounded-full p-1',
          'text-gray-600 hover:bg-gray-100 rounded-full p-1'
        )}
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );

  const renderDaysHeader = () => {
    const days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
    return (
      <div className="grid grid-cols-7 gap-1 px-3 pb-1">
        {days.map((day) => (
          <div
            key={day}
            className={getDarkModeClass(
              darkMode,
              'text-xs text-center text-gray-400 font-medium py-1',
              'text-xs text-center text-gray-500 font-medium py-1'
            )}
          >
            {t(`datePicker.days.${day}`)}
          </div>
        ))}
      </div>
    );
  };

  const renderDays = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`prev-${i}`} className="h-10 flex items-center justify-center">
          <span
            className={getDarkModeClass(darkMode, 'text-gray-600 text-sm', 'text-gray-400 text-sm')}
          >
            {daysInPrevMonth - firstDay + i + 1}
          </span>
        </div>
      );
    }

    const today = new Date();
    const selectedDate = value ? new Date(value) : null;
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      days.push(
        <button
          type="button"
          key={`current-${i}`}
          onClick={() => handleDateChange(new Date(year, month, i))}
          className={getDarkModeClass(
            darkMode,
            `h-9 w-8 flex items-center justify-center rounded-md text-sm font-medium
            ${isToday ? 'border border-[#ff8800]' : ''}
            ${isSelected ? 'bg-[#ff8800] text-white' : 'hover:bg-gray-700 text-gray-200'}
            ${isSelected && isToday ? 'bg-[#e67b00]' : ''}`,
            `h-9 w-8 flex items-center justify-center rounded-md text-sm font-medium
            ${isToday ? 'border border-[#ff8800]' : ''}
            ${isSelected ? 'bg-[#ff8800] text-white' : 'hover:bg-gray-100 text-gray-800'}
            ${isSelected && isToday ? 'bg-[#e67b00]' : ''}`
          )}
        >
          {i}
        </button>
      );
    }

    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="h-10 flex items-center justify-center">
          <span
            className={getDarkModeClass(darkMode, 'text-gray-600 text-sm', 'text-gray-400 text-sm')}
          >
            {i}
          </span>
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-1 px-3">{days}</div>;
  };

  const renderMonths = () => {
    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('en', { month: 'short' }).toLowerCase()
    );

    return (
      <div className="grid grid-cols-3 gap-4 p-4">
        {months.map((month, index) => (
          <button
            type="button"
            key={month}
            onClick={() => {
              setDate(new Date(date.getFullYear(), index, 1));
              setView('day');
            }}
            className={getDarkModeClass(
              darkMode,
              `py-2 rounded-md text-sm font-medium
              ${date.getMonth() === index ? 'bg-[#ff8800]/20 text-[#ff8800]' : 'hover:bg-gray-700 text-gray-200'}`,
              `py-2 rounded-md text-sm font-medium
              ${date.getMonth() === index ? 'bg-[#ff8800]/20 text-[#ff8800]' : 'hover:bg-gray-100 text-gray-800'}`
            )}
          >
            {t(`datePicker.months.${month}`)}
          </button>
        ))}
      </div>
    );
  };

  const renderYears = () => {
    const currentYear = date.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10 - 1;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div className="grid grid-cols-3 gap-4 p-4">
        {years.map((year) => (
          <button
            type="button"
            key={year}
            onClick={() => {
              setDate(new Date(year, date.getMonth(), 1));
              setView('month');
            }}
            className={getDarkModeClass(
              darkMode,
              `py-2 rounded-md text-sm font-medium
              ${date.getFullYear() === year ? 'bg-[#ff8800]/20 text-[#ff8800]' : 'hover:bg-gray-700 text-gray-200'}`,
              `py-2 rounded-md text-sm font-medium
              ${date.getFullYear() === year ? 'bg-[#ff8800]/20 text-[#ff8800]' : 'hover:bg-gray-100 text-gray-800'}`
            )}
          >
            {year}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <style>
        {`
          .animate-zoom-in {
            animation: zoomIn 0.2s ease-out forwards;
            transform-origin: ${animationOrigin.x}px ${animationOrigin.y}px;
          }

          .animate-zoom-out {
            animation: zoomOut 0.2s ease-out forwards;
            transform-origin: ${animationOrigin.x}px ${animationOrigin.y}px;
          }

          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.5);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes zoomOut {
            from {
              opacity: 1;
              transform: scale(1);
            }
            to {
              opacity: 0;
              transform: scale(0.5);
            }
          }
        `}
      </style>

      <div
        // className={getDarkModeClass(
        //   darkMode,
        //   `relative border rounded-md transition-colors ${
        //     error ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
        //   } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`,
        //   `relative border rounded-md transition-colors ${
        //     error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
        //   } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`
        // )}
        style={style}
      >
        <div className="flex items-center pr-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={t('datePicker.placeholder')}
            className={getDarkModeClass(
              darkMode,
              'w-full px-3 py-2 outline-none bg-transparent text-gray-200',
              'w-full px-3 py-2 outline-none bg-transparent text-gray-800'
            )}
            onFocus={openDropdown}
          />
          {inputValue && (
            <button
              type="button"
              onClick={clearDate}
              className={getDarkModeClass(
                darkMode,
                'text-gray-500 hover:text-gray-300 p-1',
                'text-gray-400 hover:text-gray-600 p-1'
              )}
            >
              <FiX size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => (isOpen ? closeDropdown() : openDropdown())}
            className={getDarkModeClass(
              darkMode,
              'text-gray-500 hover:text-gray-300 p-1 ml-1',
              'text-gray-400 hover:text-gray-600 p-1 ml-1'
            )}
          >
            <FiCalendar size={18} />
          </button>
        </div>
      </div>

      {helperText && (
        <p
          className={getDarkModeClass(
            darkMode,
            `mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-400'}`,
            `mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-500'}`
          )}
        >
          {helperText}
        </p>
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className={getDarkModeClass(
            darkMode,
            `absolute z-10 w-72 rounded-lg shadow-lg border overflow-hidden
            ${dropdownPosition.horizontal === 'left' ? 'right-0' : 'left-0'}
            ${dropdownPosition.vertical === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
            animate-zoom-in bg-gray-800 border-gray-700`,
            `absolute z-10 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden
            ${dropdownPosition.horizontal === 'left' ? 'right-0' : 'left-0'}
            ${dropdownPosition.vertical === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
            animate-zoom-in`
          )}
          style={{
            transformOrigin: `${animationOrigin.x}px ${animationOrigin.y}px`,
          }}
        >
          {renderHeader()}
          {view === 'day' && (
            <>
              {renderDaysHeader()}
              {renderDays()}
            </>
          )}
          {view === 'month' && renderMonths()}
          {view === 'year' && renderYears()}
          <div
            className={getDarkModeClass(
              darkMode,
              'flex justify-between items-center px-4 py-2 border-t border-gray-700',
              'flex justify-between items-center px-4 py-2 border-t'
            )}
          >
            <button
              type="button"
              onClick={() => handleDateChange(new Date())}
              className={getDarkModeClass(
                darkMode,
                'text-sm text-[#ff8800] hover:bg-gray-700 px-3 py-1 rounded-md',
                'text-sm text-[#ff8800] hover:bg-orange-100 px-3 py-1 rounded-md'
              )}
            >
              {t('datePicker.today')}
            </button>
            <button
              type="button"
              onClick={clearDate}
              className={getDarkModeClass(
                darkMode,
                'text-sm text-gray-400 hover:bg-gray-700 px-3 py-1 rounded-md',
                'text-sm text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md'
              )}
            >
              {t('datePicker.clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuiStyleDatePicker;
