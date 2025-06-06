import React from 'react';
import { useTranslation } from 'react-i18next';

const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

export default function CompanyFilterPopups({
  darkMode,
  isCompanyPopupOpen,
  isAnimatingOut,
  checkedCompanies,
  companies,
  popupPosition,
  handleCompanyCheckboxChange,
  toggleCompanyPopup,
  applyFilters,
}) {
  const { t } = useTranslation();

  return (
    <>
      {isCompanyPopupOpen && (
        <div
          className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
          } company-popup`}
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            transformOrigin: popupPosition.transformOrigin,
            animation: isAnimatingOut
              ? 'shrinkToPoint 0.2s ease-out forwards'
              : 'growFromPoint 0.2s ease-out forwards',
          }}
        >
          <div className="p-3 flex flex-col max-h-96">
            <h3 className="text-center font-semibold mb-3">{t('list_pis.filter_by_company')}</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {companies.length > 0 ? (
                companies.map((company) => (
                  <label
                    key={company.id}
                    className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedCompanies.includes(company.name)}
                      onChange={() => handleCompanyCheckboxChange(company.name)}
                      className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                    />
                    <span className='uppercase' >{company.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">{t('list_pis.no_companies')}</p>
              )}
            </div>
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={() => {
                  applyFilters();
                  toggleCompanyPopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {t('list_pos.apply')}
              </button>
              <button
                onClick={() => {
                  // Reset to show all companies the user has access to
                  handleCompanyCheckboxChange(companies.map(c => c.name));
                  toggleCompanyPopup(new Event('click'));
                }}
                className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
