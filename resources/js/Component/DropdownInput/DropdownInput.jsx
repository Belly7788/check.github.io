import React, { useState, useRef, useEffect } from 'react';
import { getDarkModeClass } from '../../utils/darkModeUtils';
import NoDataComponent from '../Empty/NoDataComponent';

const DropdownInput = ({
    name,
    value,
    onChange,
    placeholder,
    options = [],
    darkMode,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(
        options.find(opt => opt.id === value)?.name || ''
    );
    const [tempSearchTerm, setTempSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setSearchTerm(options.find(opt => opt.id === value)?.name || '');
    }, [value, options]);

    const filteredOptions = options
        .filter((option) =>
            option.name.toLowerCase().includes(tempSearchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleInputChange = (e) => {
        setTempSearchTerm(e.target.value);
        setIsOpen(true);
    };

    const handleSelect = (option) => {
        setSearchTerm(option.name);
        setTempSearchTerm('');
        onChange({ target: { name, value: option.id } });
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            setTempSearchTerm('');
        }
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    autocomplete="off"
                    value={isOpen ? tempSearchTerm : searchTerm}
                    onChange={handleInputChange}
                    onClick={() => {
                        setTempSearchTerm('');
                        setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className={`w-full border rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 ${getDarkModeClass(
                        darkMode,
                        'bg-[#2D2D2D] text-gray-300 border-gray-700',
                        'bg-white text-gray-900 border-gray-200'
                    )} ${className}`}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
                        isOpen ? 'rotate-180' : ''
                    } ${getDarkModeClass(darkMode, 'text-gray-400', 'text-gray-500')}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    onClick={toggleDropdown}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
            {isOpen && (
                <div
                    className={`absolute z-20 w-full max-h-60 overflow-y-auto custom-scrollbar border rounded-lg shadow-lg ${getDarkModeClass(
                        darkMode,
                        'bg-[#2D2D2D] border-gray-700 text-gray-300',
                        'bg-white border-gray-200 text-gray-900'
                    )}`}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelect(option)}
                                className={`p-2 cursor-pointer ${
                                    option.id === value
                                        ? 'bg-orange-400 text-white'
                                        : getDarkModeClass(
                                              darkMode,
                                              'hover:bg-orange-500',
                                              'hover:bg-orange-400'
                                          ) + ' hover:text-white'
                                } transition duration-200`}
                            >
                                {option.name}
                            </div>
                        ))
                    ) : (
                        <NoDataComponent
                            darkMode={darkMode}
                            width={80}
                            height={80}
                            fontSize={12}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DropdownInput;
