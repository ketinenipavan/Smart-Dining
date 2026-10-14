export type UserRole = 'customer' | 'kitchen' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
}

export type OrderStatus = 'received' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod = 'razorpay' | 'cash_counter' | 'pay_at_table';

export type SpiceLevel = 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';

export interface CustomizationOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  spice_level: SpiceLevel;
  is_available: boolean;
  rating: number;
  prep_time_minutes: number;
  customization_options?: CustomizationOption[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  icon?: string;
}

export interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  is_occupied: boolean;
  qr_slug: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
}

export interface SelectedCustomization {
  name: string;
  price: number;
}

export interface CartItem {
  cart_item_id: string; // unique key in cart (item_id + customizations)
  item_id: string;
  name: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  quantity: number;
  spice_level: SpiceLevel;
  customizations: SelectedCustomization[];
  special_instructions?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  spice_level?: SpiceLevel;
  customizations?: SelectedCustomization[];
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  table_id?: string;
  table_number: string;
  subtotal: number;
  tax: number;
  service_fee: number;
  discount: number;
  coupon_code?: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  customer_phone?: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface BillCalculation {
  subtotal: number;
  tax: number;
  service_fee: number;
  discount: number;
  total_amount: number;
  applied_coupon?: Coupon | null;
  coupon_error?: string | null;
}
