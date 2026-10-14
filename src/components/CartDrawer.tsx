import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Tag,
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import type { Coupon, PaymentMethod } from '../types';
import { computeBillBreakdown } from '../utils/billing';
import { submitVerifiedOrder } from '../lib/supabase';
import { processRazorpayPayment } from '../utils/razorpay';
import { VegNonVegBadge } from './VegNonVegBadge';

interface Props {
  coupons: Coupon[];
  onOrderPlaced: (orderId: string) => void;
}

export const CartDrawer: React.FC<Props> = ({ coupons, onOrderPlaced }) => {
  const {
    tableNumber,
    items,
    appliedCouponCode,
    notes,
    customerPhone,
    isCartDrawerOpen,
    updateQuantity,
    setCouponCode,
    setNotes,
    setCustomerPhone,
    setActiveOrderId,
    setIsCartDrawerOpen,
    clearCart,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [couponInput, setCouponInput] = useState<string>(appliedCouponCode || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bill calculation preview using verified billing logic
  const bill = computeBillBreakdown(
    items.map((i) => ({ price: i.price, quantity: i.quantity, customizations: i.customizations })),
    appliedCouponCode,
    coupons
  );

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponCode('');
      setErrorMessage(null);
      return;
    }
    setCouponCode(code);
    setCouponInput(code);
  };

  const handleCheckout = async () => {
    if (!tableNumber) {
      setErrorMessage('Please select a dining table before placing your order.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to order.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Prepare raw items for server verification
      const rawItems = items.map((i) => ({
        item_id: i.item_id,
        quantity: i.quantity,
        spice_level: i.spice_level,
        customizations: i.customizations,
        special_instructions: i.special_instructions,
      }));

      // 2. Handle Razorpay Payment flow if selected
      if (paymentMethod === 'razorpay') {
        await processRazorpayPayment({
          amount: bill.total_amount,
          orderNumber: `Table-${tableNumber}`,
          customerPhone: customerPhone || '9876543210',
          customerName: `Guest Table ${tableNumber}`,
          onSuccess: async (_payId) => {
            const createdOrder = await submitVerifiedOrder({
              table_number: tableNumber,
              items: rawItems,
              coupon_code: appliedCouponCode,
              payment_method: 'razorpay',
              customer_phone: customerPhone,
              notes: notes,
            });

            setActiveOrderId(createdOrder.id);
            clearCart();
            setIsCartDrawerOpen(false);
            onOrderPlaced(createdOrder.id);
          },
          onDismiss: () => {
            setIsSubmitting(false);
          },
        });
      } else {
        // Cash at Counter or Pay at Table
        const createdOrder = await submitVerifiedOrder({
          table_number: tableNumber,
          items: rawItems,
          coupon_code: appliedCouponCode,
          payment_method: paymentMethod,
          customer_phone: customerPhone,
          notes: notes,
        });

        setActiveOrderId(createdOrder.id);
        clearCart();
        setIsCartDrawerOpen(false);
        onOrderPlaced(createdOrder.id);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-amber-100 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShoppingBag className="w-5 h-5 text-saffron-300" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold tracking-tight">Your Dining Order</h3>
              <p className="text-maroon-200 text-xs">
                {tableNumber ? `Table #${tableNumber}` : 'No table assigned'} • {items.length} items
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items & Billing Breakdown */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-serif text-lg font-bold text-stone-700">Your Plate is Empty</p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Explore our authentic Indian curries, dosas, and biryanis to add delicious items!
              </p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3 divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.cart_item_id} className="pt-3 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <VegNonVegBadge isVeg={item.is_veg} size="sm" />
                          <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                          <span>Spice: {item.spice_level}</span>
                          <span>•</span>
                          <span className="font-semibold text-stone-700">
                            ₹{(item.price + item.customizations.reduce((s, c) => s + c.price, 0)) * item.quantity}
                          </span>
                        </div>

                        {item.customizations.length > 0 && (
                          <div className="text-[11px] text-amber-800 mt-0.5">
                            Addons: {item.customizations.map((c) => c.name).join(', ')}
                          </div>
                        )}

                        {item.special_instructions && (
                          <div className="text-[11px] text-stone-400 italic mt-0.5">
                            Note: "{item.special_instructions}"
                          </div>
                        )}
                      </div>

                      {/* Item Quantity Stepper */}
                      <div className="flex items-center bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <Tag className="w-3.5 h-3.5 text-maroon-700" />
                    <span>Restaurant Offers & Coupons</span>
                  </div>
                  {appliedCouponCode && (
                    <button
                      onClick={() => setCouponCode('')}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 uppercase font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {bill.coupon_error && (
                  <p className="text-[11px] text-rose-600 font-medium">{bill.coupon_error}</p>
                )}

                {bill.applied_coupon && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Applied: {bill.applied_coupon.code} ({bill.applied_coupon.description})</span>
                  </div>
                )}

                {/* Quick Offer Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('WELCOME10')}
                    className="text-[10px] font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200 px-2 py-1 rounded-md border border-amber-200 transition-colors"
                  >
                    ⚡ WELCOME10 (10% Off)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('BIRYANI50')}
                    className="text-[10px] font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200 px-2 py-1 rounded-md border border-amber-200 transition-colors"
                  >
                    🍛 BIRYANI50 (₹50 Off)
                  </button>
                </div>
              </div>

              {/* Special Instructions & Phone */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Special Cooking Request for Chef
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra crispy dosa, separate raitha..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Guest Phone Number (Optional SMS Updates)
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-maroon-700 bg-maroon-50 text-maroon-900 ring-2 ring-maroon-700/20'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-maroon-700" />
                    <span>Pay Online</span>
                    <span className="text-[9px] text-stone-400 font-normal">UPI / Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_counter')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'cash_counter'
                        ? 'border-maroon-700 bg-maroon-50 text-maroon-900 ring-2 ring-maroon-700/20'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span>Cash Counter</span>
                    <span className="text-[9px] text-stone-400 font-normal">Pay at Cashier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pay_at_table')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'pay_at_table'
                        ? 'border-maroon-700 bg-maroon-50 text-maroon-900 ring-2 ring-maroon-700/20'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-emerald-700" />
                    <span>Pay at Table</span>
                    <span className="text-[9px] text-stone-400 font-normal">After Dine-in</span>
                  </button>
                </div>
              </div>

              {/* Verified Bill Breakdown */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{bill.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span title="Standard 5% Indian Restaurant GST">GST (5%)</span>
                  <span className="font-semibold text-stone-900">₹{bill.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Service Fee</span>
                  <span className="font-semibold text-stone-900">₹{bill.service_fee.toFixed(2)}</span>
                </div>

                {bill.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Coupon</span>
                    <span>-₹{bill.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-base text-maroon-800">₹{bill.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Bar */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium">To Pay</span>
              <span className="text-xl font-bold text-maroon-800">
                ₹{bill.total_amount.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="flex-1 bg-maroon-700 hover:bg-maroon-800 disabled:bg-stone-300 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-maroon-800/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <Sparkles className="w-4 h-4 text-saffron-300" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
