import React from 'react';
import { Check, Clock, ChefHat, Utensils, BellRing } from 'lucide-react';
import type { OrderStatus } from '../types';

interface Props {
  currentStatus: OrderStatus;
}

export const OrderStatusStepper: React.FC<Props> = ({ currentStatus }) => {
  const steps: Array<{
    status: OrderStatus;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      status: 'received',
      label: 'Order Placed',
      description: 'Sent to restaurant kitchen',
      icon: BellRing,
    },
    {
      status: 'accepted',
      label: 'Accepted',
      description: 'Confirmed by kitchen captain',
      icon: Clock,
    },
    {
      status: 'preparing',
      label: 'Preparing',
      description: 'Simmering fresh on the tawa',
      icon: ChefHat,
    },
    {
      status: 'ready',
      label: 'Order Ready',
      description: 'Plated hot and ready for table',
      icon: Utensils,
    },
    {
      status: 'served',
      label: 'Served',
      description: 'Delivered to your table. Enjoy!',
      icon: Check,
    },
  ];

  const statusOrder: Record<OrderStatus, number> = {
    received: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    served: 4,
    cancelled: -1,
  };

  const currentIndex = statusOrder[currentStatus] ?? 0;

  if (currentStatus === 'cancelled') {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <p className="font-bold text-rose-700">Order Cancelled</p>
        <p className="text-xs text-rose-600 mt-0.5">Please contact restaurant staff.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between">
        {/* Continuous background progress line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-maroon-700 to-saffron-500 transition-all duration-700 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIndex / (steps.length - 1)) * 100))}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? 'bg-maroon-700 text-white shadow-md shadow-maroon-800/30'
                    : isCurrent
                    ? 'bg-gradient-to-br from-saffron-500 to-amber-600 text-white ring-4 ring-amber-200 shadow-lg scale-110 animate-pulse'
                    : 'bg-white border-2 border-stone-200 text-stone-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="text-center mt-2.5">
                <span
                  className={`block text-[11px] sm:text-xs font-bold leading-tight ${
                    isCurrent
                      ? 'text-saffron-700'
                      : isCompleted
                      ? 'text-stone-800'
                      : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current status description callout */}
      <div className="mt-5 p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-saffron-500 animate-ping" />
        <p className="text-xs text-amber-900 font-medium">
          <strong className="font-bold">{steps[currentIndex]?.label}:</strong>{' '}
          {steps[currentIndex]?.description}
        </p>
      </div>
    </div>
  );
};
