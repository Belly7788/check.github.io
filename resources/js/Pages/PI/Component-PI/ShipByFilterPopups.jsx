import React from 'react';
import { useTranslation } from 'react-i18next';

const getDarkModeClass = (darkMode, darkClass, lightClass) => darkMode ? darkClass : lightClass;

export default function ShipByFilterPopups({
  darkMode,
  isShipByPopupOpen,
  isShipByAnimatingOut,
  checkedMethods,
  checkedShipments,
  methods,
  shipments,
  shipByPopupPosition,
  setCheckedMethods,
  setCheckedShipments,
  toggleShipByPopup,
  applyFilters,
}) {
  const { t } = useTranslation();

  return (
    <>
      {isShipByPopupOpen && (
        <div
          className={`fixed w-56 rounded-lg shadow-2xl z-50 transition-all duration-200 ease-in-out transform ${
            darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
          } ship-by-popup`}
          style={{
            top: `${shipByPopupPosition.top}px`,
            left: `${shipByPopupPosition.left}px`,
            transformOrigin: shipByPopupPosition.transformOrigin,
            animation: isShipByAnimatingOut
              ? 'shrinkToPoint 0.2s ease-out forwards'
              : 'growFromPoint 0.2s ease-out forwards',
          }}
        >
          <div className="p-3 flex flex-col max-h-96">
            <h3 className="text-center font-semibold mb-3">{t('list_pis.filter_by_ship_method')}</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">{t('list_pis.methods')}</h4>
                {methods.length > 0 ? (
                  methods.map((method) => (
                    <label
                      key={`method-${method.id}`}
                      className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedMethods.includes(method.name)}
                        onChange={() => setCheckedMethods((prev) =>
                          prev.includes(method.name)
                            ? prev.filter((m) => m !== method.name)
                            : [...prev, method.name]
                        )}
                        className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                      />
                      <span>{method.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">{t('list_pis.no_methods')}</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">{t('list_pis.shipments')}</h4>
                {shipments.length > 0 ? (
                  shipments.map((shipment) => (
                    <label
                      key={`shipment-${shipment.id}`}
                      className={`flex items-center space-x-3 mb-3 text-sm cursor-pointer transition-colors duration-150 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      } hover:bg-opacity-10 hover:bg-gray-500 rounded-md p-1`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedShipments.includes(shipment.name)}
                        onChange={() => setCheckedShipments((prev) =>
                          prev.includes(shipment.name)
                            ? prev.filter((s) => s !== shipment.name)
                            : [...prev, shipment.name]
                        )}
                        className="rounded h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300"
                      />
                      <span>{shipment.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">{t('list_pis.no_shipments')}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={() => {
                  applyFilters();
                  toggleShipByPopup(new Event('click'));
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
                  setCheckedMethods(methods.map(m => m.name));
                  setCheckedShipments(shipments.map(s => s.name));
                  toggleShipByPopup(new Event('click'));
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
