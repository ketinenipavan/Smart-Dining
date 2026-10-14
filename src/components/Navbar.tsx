import React, { useEffect, useRef } from 'react';
import { ShoppingBag, UtensilsCrossed, Bell } from 'lucide-react';
import gsap from 'gsap';
import { useCartStore } from '../store/useCartStore';
import { Link } from 'react-router-dom';

interface Props {
  onOpenTableModal: () => void;
  onOpenOrderTracker: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenTableModal, onOpenOrderTracker }) => {
  const { tableNumber, getTotalItemsCount, activeOrderId, setIsCartDrawerOpen } = useCartStore();
  const totalCount = getTotalItemsCount();

  const navRef = useRef<HTMLElement>(null);

  // Slide-down entrance
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -64, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  // Animate cart badge whenever count changes
  const cartBadgeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (totalCount > 0 && cartBadgeRef.current) {
      gsap.fromTo(cartBadgeRef.current, { scale: 1.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)' });
    }
  }, [totalCount]);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-amber-100 shadow-sm"
      style={{ opacity: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo & Slogan */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-maroon-800 to-maroon-700 flex items-center justify-center shadow-md shadow-maroon-900/15 group-hover:scale-105 transition-transform border border-amber-200/40">
              <UtensilsCrossed className="w-5 h-5 text-saffron-400 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-maroon-800">
                  Smart Dining
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Royal India
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium tracking-wide">
                Contactless Dine-in Experience
              </p>
            </div>
          </Link>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Table Badge */}
            <button
              onClick={onOpenTableModal}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                tableNumber
                  ? 'bg-maroon-50 border-maroon-200 text-maroon-800 hover:bg-maroon-100'
                  : 'bg-amber-100/70 border-amber-300 text-amber-900 animate-pulse'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-saffron-500" />
              <span>{tableNumber ? `Table #${tableNumber}` : 'Choose Table'}</span>
            </button>

            {/* Active Order Tracker Pill (if active order exists) */}
            {activeOrderId && (
              <button
                onClick={onOpenOrderTracker}
                className="relative flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-emerald-900/15 transition-all hover:scale-105 active:scale-95"
                title="Track Active Order"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden sm:inline">Track Order</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-maroon-950/20 transition-all hover:scale-105 active:scale-95 border border-amber-300/20"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden sm:inline">My Plate</span>
              {totalCount > 0 && (
                <span
                  ref={cartBadgeRef}
                  className="absolute -top-1.5 -right-1.5 sm:static sm:top-auto sm:right-auto bg-saffron-500 text-maroon-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                >
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
