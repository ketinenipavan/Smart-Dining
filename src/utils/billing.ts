import type { BillCalculation, Coupon } from '../types';

export const GST_RATE = 0.05; // 5% GST for Indian Restaurants
export const SERVICE_FEE = 15.00; // Standard nominal dine-in service fee in INR

/**
 * Calculates item unit price including optional selected addons
 */
export function calculateItemUnitPrice(basePrice: number, customizations: { price: number }[] = []): number {
  const addonTotal = customizations.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
  return Number((basePrice + addonTotal).toFixed(2));
}

/**
 * Calculates the raw Subtotal for items in cart
 */
export function calculateSubtotal(
  items: Array<{
    price: number;
    quantity: number;
    customizations?: { price: number }[];
  }>
): number {
  const rawSubtotal = items.reduce((sum, item) => {
    const unitPrice = calculateItemUnitPrice(item.price, item.customizations || []);
    return sum + (unitPrice * item.quantity);
  }, 0);
  return Number(rawSubtotal.toFixed(2));
}

/**
 * Validates and calculates discount for an applied coupon
 */
export function calculateDiscount(subtotal: number, coupon: Coupon | null | undefined): {
  discount: number;
  error: string | null;
} {
  if (!coupon || !coupon.is_active) {
    return { discount: 0, error: null };
  }

  if (subtotal < coupon.min_order_amount) {
    return {
      discount: 0,
      error: `Minimum order of ₹${coupon.min_order_amount} required for coupon ${coupon.code}.`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * coupon.discount_value) / 100;
  } else if (coupon.discount_type === 'flat') {
    discount = Math.min(coupon.discount_value, subtotal);
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);
  return {
    discount: Number(discount.toFixed(2)),
    error: null,
  };
}

/**
 * Computes 5% GST on the subtotal
 */
export function calculateGST(subtotal: number): number {
  return Number((subtotal * GST_RATE).toFixed(2));
}

/**
 * Computes the full verified bill breakdown
 * Formula: Item Total + 5% GST + Service Fee (₹15) - Coupon Discount = Total Amount
 */
export function computeBillBreakdown(
  items: Array<{
    price: number;
    quantity: number;
    customizations?: { price: number }[];
  }>,
  couponCode?: string | null,
  availableCoupons: Coupon[] = []
): BillCalculation {
  const subtotal = calculateSubtotal(items);

  let appliedCoupon: Coupon | null = null;
  let couponError: string | null = null;
  let discount = 0;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const foundCoupon = availableCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.is_active
    );

    if (!foundCoupon) {
      couponError = `Invalid coupon code "${couponCode}".`;
    } else {
      const discountResult = calculateDiscount(subtotal, foundCoupon);
      if (discountResult.error) {
        couponError = discountResult.error;
      } else {
        appliedCoupon = foundCoupon;
        discount = discountResult.discount;
      }
    }
  }

  const tax = calculateGST(subtotal);
  const serviceFee = items.length > 0 ? SERVICE_FEE : 0;
  const totalAmount = Math.max(0, Number((subtotal + tax + serviceFee - discount).toFixed(2)));

  return {
    subtotal,
    tax,
    service_fee: serviceFee,
    discount,
    total_amount: totalAmount,
    applied_coupon: appliedCoupon,
    coupon_error: couponError,
  };
}
