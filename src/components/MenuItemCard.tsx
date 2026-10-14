import React, { useRef } from 'react';
import { Plus, Minus, Star, Clock } from 'lucide-react';
import gsap from 'gsap';
import type { MenuItem } from '../types';
import { VegNonVegBadge } from './VegNonVegBadge';
import { SpiceBadge } from './SpiceBadge';

interface Props {
  item: MenuItem;
  cartCount: number;
  onAddDirect: (item: MenuItem) => void;
  onOpenCustomize: (item: MenuItem) => void;
  onIncrement: (item: MenuItem) => void;
  onDecrement: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<Props> = ({
  item,
  cartCount,
  onAddDirect,
  onOpenCustomize,
  onIncrement,
  onDecrement,
}) => {
  const hasCustomizations = item.customization_options && item.customization_options.length > 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleAddClick = () => {
    if (hasCustomizations) {
      onOpenCustomize(item);
    } else {
      onAddDirect(item);
    }
  };

  // GSAP magnetic tilt on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    gsap.to(cardRef.current, {
      rotateY: x * 5,
      rotateX: -y * 5,
      scale: 1.025,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  // Add-to-cart pop effect
  const handleAddWithAnimation = () => {
    const btn = document.activeElement as HTMLElement;
    if (btn) {
      gsap.fromTo(btn, { scale: 0.85 }, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' });
    }
    handleAddClick();
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 border flex flex-col justify-between royal-card overflow-hidden ${
        item.is_available
          ? 'border-amber-100 hover:border-amber-300/80 bg-gradient-to-b from-white via-white to-[#FCFAF7]'
          : 'border-stone-200 bg-stone-50/70 opacity-60'
      }`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {/* Subtle top card shimmer on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Top Image + Badges Container */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-stone-100 mb-3.5 shadow-inner">
          <img
            ref={imageRef}
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800';
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

          {/* Top Indicators */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <VegNonVegBadge isVeg={item.is_veg} size="md" />
            <SpiceBadge level={item.spice_level} size="sm" />
          </div>

          {/* Prep time & rating */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-medium drop-shadow-md">
            <div className="flex items-center gap-1 bg-stone-900/60 backdrop-blur-md px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
            </div>

            <div className="flex items-center gap-1 bg-stone-900/60 backdrop-blur-md px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-stone-200" />
              <span>{item.prep_time_minutes} min</span>
            </div>
          </div>

          {!item.is_available && (
            <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content details */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-snug group-hover:text-maroon-700 transition-colors">
              {item.name}
            </h4>
          </div>

          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Pricing and Action Bar */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-lg sm:text-xl font-bold text-maroon-800">
              ₹{item.price}
            </span>
          </div>
          {hasCustomizations && item.is_available && (
            <span
              onClick={() => onOpenCustomize(item)}
              className="text-[10px] font-semibold text-saffron-600 hover:text-saffron-700 cursor-pointer block mt-0.5 tracking-tight uppercase"
            >
              Customisable • View Options
            </span>
          )}
        </div>

        {item.is_available && (
          <div>
            {cartCount === 0 ? (
              <button
                type="button"
                onClick={handleAddWithAnimation}
                className="bg-maroon-700 hover:bg-maroon-800 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1"
              >
                <span>ADD</span>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <div className="flex items-center bg-maroon-50 border border-maroon-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => onDecrement(item)}
                  className="w-8 h-8 flex items-center justify-center text-maroon-800 hover:bg-maroon-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <span className="w-7 text-center font-bold text-xs text-maroon-900">
                  {cartCount}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (hasCustomizations) {
                      onOpenCustomize(item);
                    } else {
                      onIncrement(item);
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center text-maroon-800 hover:bg-maroon-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
