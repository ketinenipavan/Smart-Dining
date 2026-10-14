import { describe, it, expect } from 'vitest';
import {
  calculateItemUnitPrice,
  calculateSubtotal,
  calculateDiscount,
  calculateGST,
  computeBillBreakdown,
  SERVICE_FEE,
} from './billing';
import type { Coupon } from '../types';

describe('Smart Dining Bill Calculation Engine', () => {
  const testCoupons: Coupon[] = [
    {
      id: 'c1',
      code: 'WELCOME10',
      description: '10% off',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 299,
      is_active: true,
    },
    {
      id: 'c2',
      code: 'BIRYANI50',
      description: 'Flat ₹50 off',
      discount_type: 'flat',
      discount_value: 50,
      min_order_amount: 399,
      is_active: true,
    },
    {
      id: 'c3',
      code: 'EXPIRED',
      description: 'Inactive coupon',
      discount_type: 'flat',
      discount_value: 100,
      min_order_amount: 100,
      is_active: false,
    },
  ];

  it('calculates item unit price with and without customizations', () => {
    // Base price only
    expect(calculateItemUnitPrice(150, [])).toBe(150);

    // With addons (e.g. Extra Ghee Roast ₹20 + Extra Cheese ₹35)
    const addons = [{ price: 20 }, { price: 35 }];
    expect(calculateItemUnitPrice(135, addons)).toBe(190);
  });

  it('calculates subtotal across multiple items correctly', () => {
    const items = [
      { price: 320, quantity: 2, customizations: [{ price: 20 }] }, // (320 + 20) * 2 = 680
      { price: 60, quantity: 1, customizations: [] },                // 60 * 1 = 60
    ];
    expect(calculateSubtotal(items)).toBe(740);
  });

  it('calculates 5% GST accurately', () => {
    expect(calculateGST(100)).toBe(5.00);
    expect(calculateGST(740)).toBe(37.00);
    expect(calculateGST(345)).toBe(17.25);
  });

  it('calculates percentage coupon discount when threshold is met', () => {
    const coupon = testCoupons[0]; // WELCOME10, 10% min 299
    // Subtotal 500 >= 299 -> 10% of 500 = 50
    const res = calculateDiscount(500, coupon);
    expect(res.discount).toBe(50);
    expect(res.error).toBeNull();
  });

  it('rejects coupon if minimum order amount is not met', () => {
    const coupon = testCoupons[0]; // WELCOME10, min 299
    const res = calculateDiscount(200, coupon);
    expect(res.discount).toBe(0);
    expect(res.error).toContain('Minimum order of ₹299 required');
  });

  it('calculates flat discount coupon accurately', () => {
    const coupon = testCoupons[1]; // BIRYANI50, flat 50, min 399
    const res = calculateDiscount(420, coupon);
    expect(res.discount).toBe(50);
    expect(res.error).toBeNull();
  });

  it('ignores inactive coupons', () => {
    const coupon = testCoupons[2]; // EXPIRED
    const res = calculateDiscount(600, coupon);
    expect(res.discount).toBe(0);
  });

  it('computes complete bill breakdown following the exact formula', () => {
    // Hyderabadi Biryani (320) + Extra Raitha (20) = 340
    // Qty: 2 = 680
    // Filter Coffee (60) * 1 = 60
    // Subtotal = 740
    // Coupon: BIRYANI50 -> Discount = 50
    // 5% GST on 740 = 37.00
    // Service Fee = 15.00
    // Total = 740 + 37.00 + 15.00 - 50.00 = 742.00
    const items = [
      { price: 320, quantity: 2, customizations: [{ price: 20 }] },
      { price: 60, quantity: 1, customizations: [] },
    ];

    const bill = computeBillBreakdown(items, 'BIRYANI50', testCoupons);

    expect(bill.subtotal).toBe(740);
    expect(bill.discount).toBe(50);
    expect(bill.tax).toBe(37.00);
    expect(bill.service_fee).toBe(SERVICE_FEE);
    expect(bill.total_amount).toBe(742.00);
    expect(bill.applied_coupon?.code).toBe('BIRYANI50');
    expect(bill.coupon_error).toBeNull();
  });

  it('returns empty bill safely when cart is empty', () => {
    const bill = computeBillBreakdown([], null, testCoupons);
    expect(bill.subtotal).toBe(0);
    expect(bill.tax).toBe(0);
    expect(bill.service_fee).toBe(0);
    expect(bill.discount).toBe(0);
    expect(bill.total_amount).toBe(0);
  });
});
