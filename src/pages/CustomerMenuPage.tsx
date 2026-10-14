import React, { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapReveal } from '../hooks/useGsapReveal';
gsap.registerPlugin(ScrollTrigger);
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Flame,
  Coffee,
  Salad,
  Soup,
  CookingPot,
  Sandwich,
  Cookie,
  IceCream,
  GlassWater,
  UtensilsCrossed,
} from 'lucide-react';
import type { Category, MenuItem, SelectedCustomization, SpiceLevel } from '../types';
import { fetchCategories, fetchCoupons, fetchMenuItems, fetchTables } from '../lib/supabase';
import { useCartStore } from '../store/useCartStore';
import { MenuItemCard } from '../components/MenuItemCard';
import { ItemCustomizeModal } from '../components/ItemCustomizeModal';
import { CartDrawer } from '../components/CartDrawer';
import { TableSelectModal } from '../components/TableSelectModal';
import { OrderTrackerModal } from '../components/OrderTrackerModal';
import { Navbar } from '../components/Navbar';

// Category icon mapper
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee: Coffee,
  Salad: Salad,
  Flame: Flame,
  Sparkles: Sparkles,
  UtensilsCrossed: UtensilsCrossed,
  Soup: Soup,
  CookingPot: CookingPot,
  Sandwich: Sandwich,
  Cookie: Cookie,
  IceCream: IceCream,
  GlassWater: GlassWater,
};

export const CustomerMenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const {
    tableNumber,
    setTableNumber,
    addItem,
    getItemCountInCart,
    activeOrderId,
    setIsCartDrawerOpen,
  } = useCartStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedSpiceFilter, _setSelectedSpiceFilter] = useState<string>('all');

  // Modals state
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState<boolean>(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // GSAP refs
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroBadgesRef = useRef<HTMLDivElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const gridRevealRef = useGsapReveal(0.06);

  // Sync table parameter from URL or prompt if missing
  useEffect(() => {
    if (tableParam) {
      setTableNumber(tableParam);
    } else if (!tableNumber) {
      // Auto prompt table select modal if no table set
      setIsTableModalOpen(true);
    }
  }, [tableParam, tableNumber, setTableNumber]);

  // Hero entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(heroBadgesRef.current, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.55 })
      .fromTo(heroTitleRef.current, { autoAlpha: 0, y: 40, skewX: -3 }, { autoAlpha: 1, y: 0, skewX: 0, duration: 0.7 }, '-=0.3')
      .fromTo(heroDescRef.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.35');
    return () => { tl.kill(); };
  }, []);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, items, coups] = await Promise.all([
          fetchCategories(),
          fetchMenuItems(),
          fetchCoupons(),
        ]);
        setCategories(cats);
        setMenuItems(items);
        setCoupons(coups);

        // Fetch tables for modal
        const tablesData = await fetchTables();
        setTables(tablesData);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (activeCategorySlug !== 'all') {
        const cat = categories.find((c) => c.slug === activeCategorySlug);
        if (cat && item.category_id !== cat.id) return false;
      }

      // Veg / Non-Veg filter
      if (dietFilter === 'veg' && !item.is_veg) return false;
      if (dietFilter === 'non-veg' && item.is_veg) return false;

      // Spice level filter
      if (selectedSpiceFilter !== 'all' && item.spice_level !== selectedSpiceFilter) {
        return false;
      }

      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [menuItems, categories, activeCategorySlug, dietFilter, selectedSpiceFilter, searchQuery]);

  const handleSelectTable = (selected: string) => {
    setTableNumber(selected);
    setSearchParams({ table: selected });
  };

  const handleAddDirect = (item: MenuItem) => {
    addItem(item, item.spice_level, [], undefined);
  };

  const handleConfirmCustomize = (
    item: MenuItem,
    spiceLevel: SpiceLevel,
    customizations: SelectedCustomization[],
    instructions?: string
  ) => {
    addItem(item, spiceLevel, customizations, instructions);
  };

  const handleOrderPlaced = (_orderId: string) => {
    setIsTrackerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-900 pb-28 relative">
      {/* Navbar */}
      <Navbar
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onOpenOrderTracker={() => setIsTrackerModalOpen(true)}
      />

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-950 text-white py-9 sm:py-14 px-4 sm:px-8 border-b border-amber-500/20 shadow-lg">
        {/* Animated glowing golden light sweep */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left space-y-3 max-w-2xl">
            <div ref={heroBadgesRef} style={{ opacity: 0 }} className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-saffron-300 border border-amber-300/25 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Royal Culinary Heritage • 100% Desi Ghee</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-saffron-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-200 border border-saffron-400/30">
                <Flame className="w-3.5 h-3.5 text-saffron-400 animate-pulse" />
                <span>Clay Tandoor & Slow Dum</span>
              </div>
            </div>

            <h1 ref={heroTitleRef} style={{ opacity: 0 }} className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              Savor Royal Indian Flavors
            </h1>
            <p ref={heroDescRef} style={{ opacity: 0 }} className="text-sm sm:text-base text-maroon-100 font-normal leading-relaxed">
              Order directly from your table. Freshly ground spices, clay tandoor delicacies, and slow-dum biryanis delivered hot to <span className="text-saffron-300 font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-amber-300/30">Table #{tableNumber || 'Selected Table'}</span>.
            </p>
          </div>

          {/* Quick Coupon Callout Card */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-amber-200/30 p-4 sm:p-5 rounded-2xl text-left max-w-xs w-full shadow-xl hover:scale-105 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-saffron-400/20 rounded-full blur-xl pointer-events-none group-hover:bg-saffron-400/30 transition-all" />
            
            <div className="flex items-center justify-between text-xs text-amber-200 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-saffron-400" />
                SPECIAL DINE-IN OFFER
              </span>
              <span className="bg-saffron-500 text-maroon-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm animate-pulse">
                10% OFF
              </span>
            </div>
            <p className="text-xs text-white/95 font-medium leading-relaxed">
              Use promo code <strong className="text-saffron-300 font-black tracking-wider bg-white/15 px-1.5 py-0.5 rounded">WELCOME10</strong> on orders above ₹299.
            </p>
          </div>
        </div>

        {/* Decorative background blur blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-saffron-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-maroon-500/30 rounded-full blur-3xl pointer-events-none animate-pulse-delayed" />
      </section>

      {/* Main Browsing Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Search & Strict Veg/Non-Veg Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search biryani, butter chicken, dosa, paneer tikka..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-sm shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Strict Diet Toggle (Veg / Non-Veg / All) */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 shadow-sm self-start md:self-auto">
            <button
              type="button"
              onClick={() => setDietFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                dietFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Dishes
            </button>

            <button
              type="button"
              onClick={() => setDietFilter('veg')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dietFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 bg-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </div>
              <span>Pure Veg</span>
            </button>

            <button
              type="button"
              onClick={() => setDietFilter('non-veg')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dietFilter === 'non-veg'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-[2px] border border-rose-600 bg-white flex items-center justify-center">
                <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-rose-600" />
              </div>
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Sticky Category Pills Navigation */}
        <div className="sticky top-18 sm:top-20 z-30 bg-[#FAF7F2]/85 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-stone-200/60 mb-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setActiveCategorySlug('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 ${
                activeCategorySlug === 'all'
                  ? 'bg-maroon-700 text-white shadow-lg shadow-maroon-900/25 ring-2 ring-amber-400/40 scale-[1.02]'
                  : 'bg-white/90 border border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Menu ({menuItems.length})</span>
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategorySlug === cat.slug;
              const Icon = CATEGORY_ICONS[cat.icon || 'UtensilsCrossed'] || UtensilsCrossed;
              const catItemCount = menuItems.filter((m) => m.category_id === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-maroon-700 text-white shadow-lg shadow-maroon-900/25 ring-2 ring-amber-400/40 scale-[1.02]'
                      : 'bg-white/90 border border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    {catItemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-amber-100/60 animate-pulse space-y-4"
              >
                <div className="aspect-[4/3] bg-stone-200 rounded-xl" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-full" />
                <div className="h-8 bg-stone-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white/90 backdrop-blur-sm rounded-3xl border border-stone-200 max-w-lg mx-auto p-8 shadow-sm">
            <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-stone-800">No dishes match your filter</h3>
            <p className="text-xs text-stone-500">
              Try selecting "All Dishes" or clearing your search term.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDietFilter('all');
                setActiveCategorySlug('all');
              }}
              className="mt-2 text-xs font-bold text-maroon-700 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div ref={gridRevealRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                cartCount={getItemCountInCart(item.id)}
                onAddDirect={handleAddDirect}
                onOpenCustomize={(target) => setCustomizingItem(target)}
                onIncrement={handleAddDirect}
                onDecrement={(target) => {
                  // Find first matching cart item for this dish
                  const storeState = useCartStore.getState();
                  const match = storeState.items.find((i) => i.item_id === target.id);
                  if (match) {
                    storeState.updateQuantity(match.cart_item_id, -1);
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar for Mobile View */}
      <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="w-full bg-gradient-to-r from-maroon-700 via-maroon-800 to-maroon-900 text-white p-4 rounded-2xl shadow-floating flex items-center justify-between font-bold text-sm border border-amber-300/40 hover:scale-[1.02] active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="bg-saffron-500 text-maroon-950 text-xs px-2.5 py-0.5 rounded-full font-black shadow-sm">
              Table #{tableNumber || '--'}
            </span>
            <span>View Current Order</span>
          </div>
          <span className="flex items-center gap-1 text-saffron-300">
            Open Cart →
          </span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tables={tables}
        currentTable={tableNumber}
        onSelectTable={handleSelectTable}
      />

      <ItemCustomizeModal
        item={customizingItem}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        onConfirm={handleConfirmCustomize}
      />

      <CartDrawer
        coupons={coupons}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrderTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        orderId={activeOrderId}
        onOrderMore={() => setIsCartDrawerOpen(false)}
      />
    </div>
  );
};
