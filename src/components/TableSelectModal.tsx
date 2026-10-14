import React from 'react';
import { Utensils, X, Check, Users } from 'lucide-react';
import type { RestaurantTable } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTable[];
  currentTable: string | null;
  onSelectTable: (tableNumber: string) => void;
}

export const TableSelectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tables,
  currentTable,
  onSelectTable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Utensils className="w-5 h-5 text-saffron-300" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold tracking-tight">Select Dining Table</h3>
              <p className="text-maroon-100 text-xs mt-0.5">
                Scan your table QR code or choose your table number
              </p>
            </div>
          </div>
          {currentTable && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Available Dining Tables
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tables.map((table) => {
              const isSelected = currentTable === table.table_number;
              return (
                <button
                  key={table.id}
                  onClick={() => {
                    onSelectTable(table.table_number);
                    onClose();
                  }}
                  className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-maroon-700 bg-maroon-50/70 shadow-sm ring-2 ring-maroon-700/20'
                      : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-stone-900">
                      Table #{table.table_number}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-maroon-700 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{table.capacity} Guests</span>
                  </div>

                  {table.is_occupied && !isSelected && (
                    <span className="mt-2 text-[10px] font-medium text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md inline-block w-fit">
                      Occupied
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">
              Each table has a dedicated QR code stickers for instant self-ordering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
