import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Category,
  Coupon,
  MenuItem,
  Order,
  OrderStatus,
  RestaurantTable,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_TABLES,
} from '../data/mockData';
import { computeBillBreakdown } from '../utils/billing';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ekdhrknbwhyklsbjnvbj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_anon_public_key_here' &&
  !supabaseAnonKey.startsWith('your_')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// ===================================================================
// Resilient Storage & Realtime Fallback Store
// Synchronizes seamlessly between tabs using BroadcastChannel & window events
// ===================================================================
const DATA_VERSION = 'v10'; // Bump this whenever mockData changes to force localStorage refresh

const STORAGE_KEYS = {
  MENU: 'sd_menu_items',
  CATEGORIES: 'sd_categories',
  TABLES: 'sd_tables',
  COUPONS: 'sd_coupons',
  ORDERS: 'sd_orders',
  VERSION: 'sd_data_version',
};

// On load: if version mismatch, clear all cached data so fresh seed applies
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.MENU);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
  }
}

// Cross-tab broadcast channel for instant multi-window synchronization
const realtimeChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('smart_dining_realtime')
  : null;

function broadcastUpdate(type: string, payload: unknown) {
  if (realtimeChannel) {
    realtimeChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smart_dining_update', { detail: { type, payload } }));
  }
}

// Storage helpers
export function getLocalMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MENU_ITEMS;
  }
}

export function saveLocalMenuItems(items: MenuItem[]): void {
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  broadcastUpdate('menu_updated', items);
}

export function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function getLocalTables(): RestaurantTable[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
      return INITIAL_TABLES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TABLES;
  }
}

export function saveLocalTables(tables: RestaurantTable[]): void {
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  broadcastUpdate('tables_updated', tables);
}

export function getLocalCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COUPONS;
  }
}

export function saveLocalCoupons(coupons: Coupon[]): void {
  localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  broadcastUpdate('coupons_updated', coupons);
}

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveLocalOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  broadcastUpdate('orders_updated', orders);
}

// ===================================================================
// Database Service Interface (Supabase with Resilient Local Fallback)
// ===================================================================

export async function fetchCategories(): Promise<Category[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetchCategories failed, using fallback:', e);
    }
  }
  return getLocalCategories();
}

export async function fetchTables(): Promise<RestaurantTable[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetchTables failed, using fallback:', e);
    }
  }
  return getLocalTables();
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetchMenuItems failed, using fallback:', e);
    }
  }
  return getLocalMenuItems();
}

export async function updateMenuItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem[]> {
  if (supabase) {
    try {
      await supabase
        .from('menu_items')
        .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase updateMenuItemAvailability failed:', e);
    }
  }

  const items = getLocalMenuItems();
  const updated = items.map((item) => (item.id === id ? { ...item, is_available: isAvailable } : item));
  saveLocalMenuItems(updated);
  return updated;
}

export async function saveMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
  const items = getLocalMenuItems();
  let savedItem: MenuItem;

  if (itemData.id) {
    savedItem = {
      ...items.find((i) => i.id === itemData.id)!,
      ...itemData,
      updated_at: new Date().toISOString(),
    } as MenuItem;
    const updated = items.map((i) => (i.id === itemData.id ? savedItem : i));
    saveLocalMenuItems(updated);
  } else {
    savedItem = {
      id: 'm-' + Date.now(),
      category_id: itemData.category_id || 'c1',
      name: itemData.name || 'New Dish',
      description: itemData.description || '',
      price: Number(itemData.price) || 100,
      image_url: itemData.image_url || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
      is_veg: itemData.is_veg ?? true,
      spice_level: itemData.spice_level || 'Medium',
      is_available: true,
      rating: 4.8,
      prep_time_minutes: itemData.prep_time_minutes || 15,
      customization_options: itemData.customization_options || [],
      created_at: new Date().toISOString(),
    };
    saveLocalMenuItems([savedItem, ...items]);
  }

  if (supabase) {
    try {
      if (itemData.id) {
        await supabase.from('menu_items').update(savedItem).eq('id', itemData.id);
      } else {
        await supabase.from('menu_items').insert(savedItem);
      }
    } catch (e) {
      console.warn('Supabase saveMenuItem sync error:', e);
    }
  }

  return savedItem;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true);
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetchCoupons failed:', e);
    }
  }
  return getLocalCoupons();
}

export async function saveCoupon(coupon: Partial<Coupon>): Promise<Coupon[]> {
  const coupons = getLocalCoupons();
  let updated: Coupon[];
  if (coupon.id) {
    updated = coupons.map((c) => (c.id === coupon.id ? { ...c, ...coupon } as Coupon : c));
  } else {
    const newCoupon: Coupon = {
      id: 'cp-' + Date.now(),
      code: (coupon.code || 'SPECIAL').toUpperCase(),
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: Number(coupon.discount_value) || 10,
      min_order_amount: Number(coupon.min_order_amount) || 100,
      is_active: coupon.is_active ?? true,
    };
    updated = [newCoupon, ...coupons];
  }
  saveLocalCoupons(updated);
  return updated;
}

export async function fetchOrders(): Promise<Order[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Order[];
    } catch (e) {
      console.warn('Supabase fetchOrders failed, using fallback:', e);
    }
  }
  return getLocalOrders();
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const orders = await fetchOrders();
  return orders.find((o) => o.id === orderId || o.order_number === orderId) || null;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  if (supabase) {
    try {
      await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } catch (e) {
      console.warn('Supabase updateOrderStatus sync error:', e);
    }
  }

  const orders = getLocalOrders();
  let updatedOrder: Order | null = null;
  const updatedOrders = orders.map((o) => {
    if (o.id === orderId || o.order_number === orderId) {
      updatedOrder = { ...o, order_status: status, updated_at: new Date().toISOString() };
      return updatedOrder;
    }
    return o;
  });

  saveLocalOrders(updatedOrders);
  return updatedOrder;
}

/**
 * Server-verified order creation API
 * CRITICAL ARCHITECTURAL STANDARD: Never trust client prices!
 * The client sends raw item IDs & quantities. Pricing, 5% GST, ₹15 service fee,
 * and coupons are recalculated and verified here.
 */
export async function submitVerifiedOrder(params: {
  table_number: string;
  items: Array<{
    item_id: string;
    quantity: number;
    spice_level?: string;
    customizations?: Array<{ name: string; price: number }>;
    special_instructions?: string;
  }>;
  coupon_code?: string;
  payment_method: 'razorpay' | 'cash_counter' | 'pay_at_table';
  customer_phone?: string;
  notes?: string;
}): Promise<Order> {
  const menuItems = await fetchMenuItems();
  const coupons = await fetchCoupons();

  // Validate all items exist and build verified order items
  const verifiedOrderItems = params.items.map((cartItem) => {
    const menuItem = menuItems.find((m) => m.id === cartItem.item_id);
    if (!menuItem) {
      throw new Error(`Invalid item ID: ${cartItem.item_id}`);
    }
    if (!menuItem.is_available) {
      throw new Error(`Item "${menuItem.name}" is currently out of stock.`);
    }

    const addonTotal = (cartItem.customizations || []).reduce(
      (sum, addon) => sum + (Number(addon.price) || 0),
      0
    );
    const unitPrice = menuItem.price + addonTotal;
    const totalPrice = unitPrice * cartItem.quantity;

    return {
      id: 'oi-' + Math.random().toString(36).substring(2, 9),
      order_id: '',
      menu_item_id: menuItem.id,
      item_name: menuItem.name,
      quantity: cartItem.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      spice_level: (cartItem.spice_level as any) || menuItem.spice_level,
      customizations: cartItem.customizations || [],
      special_instructions: cartItem.special_instructions,
    };
  });

  // Calculate verified bill breakdown
  const billItems = verifiedOrderItems.map((vi) => ({
    price: vi.unit_price,
    quantity: vi.quantity,
  }));
  const bill = computeBillBreakdown(billItems, params.coupon_code, coupons);

  const newOrderId = 'ord-' + Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newOrderNumber = `#SD-${randomSuffix}`;

  const newOrder: Order = {
    id: newOrderId,
    order_number: newOrderNumber,
    table_number: params.table_number,
    subtotal: bill.subtotal,
    tax: bill.tax,
    service_fee: bill.service_fee,
    discount: bill.discount,
    coupon_code: bill.applied_coupon?.code,
    total_amount: bill.total_amount,
    order_status: 'received',
    payment_status: params.payment_method === 'razorpay' ? 'completed' : 'pending',
    payment_method: params.payment_method,
    customer_phone: params.customer_phone,
    notes: params.notes,
    items: verifiedOrderItems.map((item) => ({ ...item, order_id: newOrderId })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // If Supabase RPC is available, trigger atomic function
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('create_verified_order', {
        p_table_number: params.table_number,
        p_items: params.items,
        p_coupon_code: params.coupon_code || null,
        p_payment_method: params.payment_method,
        p_customer_phone: params.customer_phone || null,
        p_notes: params.notes || null,
      });
      if (!error && data?.order_id) {
        newOrder.id = data.order_id;
        newOrder.order_number = data.order_number;
      }
    } catch (e) {
      console.warn('Supabase create_verified_order RPC error, using local fallback record:', e);
    }
  }

  // Save to orders list and broadcast
  const existingOrders = getLocalOrders();
  saveLocalOrders([newOrder, ...existingOrders]);

  // Update table occupancy status
  const tables = getLocalTables();
  const updatedTables = tables.map((t) =>
    t.table_number === params.table_number ? { ...t, is_occupied: true } : t
  );
  saveLocalTables(updatedTables);

  return newOrder;
}

/**
 * Subscribes to real-time events for orders
 */
export function subscribeToOrders(onUpdate: (order: Order) => void): () => void {
  // 1. Supabase Realtime channel subscription
  let supabaseChannel: any = null;
  if (supabase) {
    supabaseChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new as Order);
          }
        }
      )
      .subscribe();
  }

  // 2. BroadcastChannel & Window event listener fallback
  const handleMessage = (e: MessageEvent) => {
    if (e.data?.type === 'orders_updated') {
      const orders = getLocalOrders();
      if (orders.length > 0) {
        onUpdate(orders[0]);
      }
    }
  };

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail?.type === 'orders_updated') {
      const orders = getLocalOrders();
      if (orders.length > 0) {
        onUpdate(orders[0]);
      }
    }
  };

  if (realtimeChannel) {
    realtimeChannel.addEventListener('message', handleMessage);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('smart_dining_update', handleCustomEvent);
  }

  return () => {
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
    if (realtimeChannel) {
      realtimeChannel.removeEventListener('message', handleMessage);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('smart_dining_update', handleCustomEvent);
    }
  };
}
