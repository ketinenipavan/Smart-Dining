import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import type { MenuItem, SelectedCustomization, SpiceLevel } from '../types';
import { VegNonVegBadge } from './VegNonVegBadge';
import { SpiceBadge } from './SpiceBadge';

interface Props {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    item: MenuItem,
    spiceLevel: SpiceLevel,
    customizations: SelectedCustomization[],
    instructions?: string
  ) => void;
}

export const ItemCustomizeModal: React.FC<Props> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(item?.spice_level || 'Medium');
  const [selectedAddons, setSelectedAddons] = useState<SelectedCustomization[]>([]);
  const [instructions, setInstructions] = useState<string>('');

  useEffect(() => {
    if (item) {
      setSpiceLevel(item.spice_level);
      setSelectedAddons([]);
      setInstructions('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const toggleAddon = (name: string, price: number) => {
    if (selectedAddons.some((a) => a.name === name)) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== name));
    } else {
      setSelectedAddons([...selectedAddons, { name, price }]);
    }
  };

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = item.price + addonTotal;

  const spiceOptions: SpiceLevel[] = ['Mild', 'Medium', 'Hot', 'Extra Hot'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-amber-100 flex flex-col max-h-[88vh]">
        {/* Dish banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-stone-100">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-stone-900/60 hover:bg-stone-900 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <VegNonVegBadge isVeg={item.is_veg} size="md" />
              <SpiceBadge level={item.spice_level} size="sm" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
              {item.name}
            </h3>
            <p className="text-amber-200 font-semibold text-lg mt-0.5">₹{item.price}</p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Spice Level Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
              Select Spice Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {spiceOptions.map((level) => {
                const isSelected = spiceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-maroon-700 bg-maroon-700 text-white shadow-sm'
                        : 'border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-stone-50'
                    }`}
                  >
                    <span>{level}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons */}
          {item.customization_options && item.customization_options.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                Optional Add-ons & Accompaniments
              </label>
              <div className="space-y-2">
                {item.customization_options.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <div
                      key={addon.name}
                      onClick={() => toggleAddon(addon.name, addon.price)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-maroon-700 border-maroon-700 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium text-stone-800">{addon.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-maroon-800">
                        {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
              Special Cooking Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, make it extra crispy, no garlic"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 bg-stone-50/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-stone-500 block">Calculated Total</span>
            <span className="text-2xl font-bold text-maroon-800">₹{totalPrice}</span>
          </div>

          <button
            onClick={() => {
              onConfirm(item, spiceLevel, selectedAddons, instructions);
              onClose();
            }}
            className="flex-1 max-w-xs bg-maroon-700 hover:bg-maroon-800 text-white py-3.5 px-6 rounded-2xl font-semibold shadow-md shadow-maroon-800/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add to Cart • ₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
