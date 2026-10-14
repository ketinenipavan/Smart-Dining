import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, SelectedCustomization, SpiceLevel } from '../types';

interface CartState {
  tableNumber: string | null;
  items: CartItem[];
  appliedCouponCode: string;
  notes: string;
  customerPhone: string;
  activeOrderId: string | null;
  isCartDrawerOpen: boolean;

  // Actions
  setTableNumber: (table: string | null) => void;
  addItem: (
    item: MenuItem,
    spiceLevel?: SpiceLevel,
    customizations?: SelectedCustomization[],
    instructions?: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  setCouponCode: (code: string) => void;
  setNotes: (notes: string) => void;
  setCustomerPhone: (phone: string) => void;
  setActiveOrderId: (orderId: string | null) => void;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  clearCart: () => void;

  // Selectors / Helpers
  getTotalItemsCount: () => number;
  getItemCountInCart: (itemId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableNumber: null,
      items: [],
      appliedCouponCode: '',
      notes: '',
      customerPhone: '',
      activeOrderId: null,
      isCartDrawerOpen: false,

      setTableNumber: (table) => set({ tableNumber: table }),

      addItem: (item, spiceLevel, customizations = [], instructions) => {
        const resolvedSpice = spiceLevel || item.spice_level;
        // Generate consistent unique cart item key based on customizations & spice level
        const customKey = customizations
          .map((c) => c.name)
          .sort()
          .join('-');
        const cartItemId = `${item.id}_${resolvedSpice}_${customKey}`;

        const existingIndex = get().items.findIndex((i) => i.cart_item_id === cartItemId);

        if (existingIndex > -1) {
          const updated = [...get().items];
          updated[existingIndex].quantity += 1;
          set({ items: updated });
        } else {
          const newItem: CartItem = {
            cart_item_id: cartItemId,
            item_id: item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            is_veg: item.is_veg,
            quantity: 1,
            spice_level: resolvedSpice,
            customizations,
            special_instructions: instructions,
          };
          set({ items: [...get().items, newItem] });
        }
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cart_item_id !== cartItemId) });
      },

      updateQuantity: (cartItemId, delta) => {
        const existing = get().items.find((i) => i.cart_item_id === cartItemId);
        if (!existing) return;

        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          get().removeItem(cartItemId);
        } else {
          set({
            items: get().items.map((i) =>
              i.cart_item_id === cartItemId ? { ...i, quantity: newQty } : i
            ),
          });
        }
      },

      setCouponCode: (code) => set({ appliedCouponCode: code }),
      setNotes: (notes) => set({ notes }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),
      setActiveOrderId: (orderId) => set({ activeOrderId: orderId }),
      setIsCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),

      clearCart: () =>
        set({
          items: [],
          appliedCouponCode: '',
          notes: '',
          customerPhone: '',
          isCartDrawerOpen: false,
        }),

      getTotalItemsCount: () => {
        return get().items.reduce((acc, curr) => acc + curr.quantity, 0);
      },

      getItemCountInCart: (itemId: string) => {
        return get().items
          .filter((i) => i.item_id === itemId)
          .reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'smart_dining_cart_session',
      partialize: (state) => ({
        tableNumber: state.tableNumber,
        items: state.items,
        appliedCouponCode: state.appliedCouponCode,
        notes: state.notes,
        customerPhone: state.customerPhone,
        activeOrderId: state.activeOrderId,
      }),
    }
  )
);
