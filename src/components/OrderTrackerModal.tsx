import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import type { Order } from '../types';
import { fetchOrderById, subscribeToOrders } from '../lib/supabase';
import { OrderStatusStepper } from './OrderStatusStepper';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onOrderMore?: () => void;
}

export const OrderTrackerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  orderId,
  onOrderMore,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    let isMounted = true;
    setIsLoading(true);

    fetchOrderById(orderId).then((data) => {
      if (isMounted) {
        setOrder(data);
        setIsLoading(false);
        // Trigger celebratory confetti once on order received
        if (data && data.order_status === 'received') {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#800020', '#FF9933', '#E65100', '#16A34A'],
            });
          } catch {}
        }
      }
    });

    // Subscribe to live status updates
    const unsubscribe = subscribeToOrders((updatedOrder) => {
      if (updatedOrder.id === orderId || updatedOrder.order_number === orderId) {
        setOrder(updatedOrder);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-amber-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon-700 via-maroon-800 to-maroon-900 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <UtensilsCrossed className="w-5 h-5 text-saffron-300" />
              </span>
              <div>
                <span className="text-maroon-200 text-xs font-semibold uppercase tracking-wider block">
                  Table #{order?.table_number || '--'}
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight">
                  {order ? order.order_number : 'Loading Order...'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-medium">Fetching real-time kitchen status...</p>
            </div>
          ) : !order ? (
            <div className="py-12 text-center space-y-2">
              <p className="font-serif text-lg font-bold text-stone-800">No Active Order Found</p>
              <p className="text-xs text-stone-500">Order may have expired or closed.</p>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <OrderStatusStepper currentStatus={order.order_status} />

              {/* Items List */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-100/80">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200/60">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Ordered Dishes ({order.items?.length || 0})
                  </span>
                  <span className="text-xs font-semibold text-maroon-700">
                    {order.payment_method === 'razorpay'
                      ? 'Paid Online'
                      : order.payment_method === 'pay_at_table'
                      ? 'Pay at Table'
                      : 'Cash at Counter'}
                  </span>
                </div>

                <div className="space-y-3 divide-y divide-stone-200/50">
                  {order.items?.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs bg-maroon-100 text-maroon-800 px-1.5 py-0.5 rounded">
                              {item.quantity}x
                            </span>
                            <span className="text-sm font-bold text-stone-900">
                              {item.item_name}
                            </span>
                          </div>

                          {item.spice_level && (
                            <span className="text-[11px] text-stone-500 block mt-0.5">
                              Spice: {item.spice_level}
                            </span>
                          )}

                          {item.customizations && item.customizations.length > 0 && (
                            <div className="text-[11px] text-amber-800 mt-0.5">
                              Addons: {item.customizations.map((c) => c.name).join(', ')}
                            </div>
                          )}

                          {item.special_instructions && (
                            <div className="text-[11px] text-stone-500 italic mt-0.5">
                              Note: "{item.special_instructions}"
                            </div>
                          )}
                        </div>

                        <span className="font-semibold text-xs text-stone-900">
                          ₹{item.total_price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-2 text-xs text-stone-600 px-1">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5% Restaurant Tax)</span>
                  <span className="font-semibold text-stone-900">₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dine-In Service Fee</span>
                  <span className="font-semibold text-stone-900">₹{order.service_fee.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({order.coupon_code || 'Promo'})</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Final Amount</span>
                  <span className="text-base text-maroon-800">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Status Pill */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      order.payment_status === 'completed'
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  />
                  <span className="font-semibold text-stone-800">
                    Payment Status:{' '}
                    <span
                      className={
                        order.payment_status === 'completed'
                          ? 'text-emerald-700 uppercase'
                          : 'text-amber-700 uppercase'
                      }
                    >
                      {order.payment_status}
                    </span>
                  </span>
                </div>

                <div className="text-[11px] text-stone-500">
                  Ref: {order.order_number}
                </div>
              </div>

              {order.notes && (
                <div className="text-xs text-stone-500 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <strong>Kitchen Note:</strong> {order.notes}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              if (onOrderMore) onOrderMore();
            }}
            className="flex-1 bg-maroon-700 hover:bg-maroon-800 text-white py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            Order Additional Items
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 border border-stone-200 text-stone-700 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-stone-100 transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
