import React, { useEffect, useState } from 'react';
import {
  ChefHat,
  Clock,
  BellRing,
  Volume2,
  RefreshCw,
  Flame,
  ArrowRight,
  LogOut,
  User,
} from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { fetchOrders, subscribeToOrders, updateOrderStatus } from '../lib/supabase';
import { playKitchenOrderChime } from '../utils/audio';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const KitchenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());

  // Keep live elapsed time clock ticking every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const loadAllOrders = async () => {
    const fetched = await fetchOrders();
    setOrders(fetched);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    loadAllOrders();

    // Subscribe to real-time events
    const unsubscribe = subscribeToOrders((_incomingOrder) => {
      // Play synthesized kitchen audio bell chime if audio enabled
      if (isAudioEnabled) {
        playKitchenOrderChime();
      }
      loadAllOrders();
    });

    return () => unsubscribe();
  }, [isAudioEnabled]);

  const handleAdvanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
      received: 'accepted',
      accepted: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: null,
      cancelled: null,
    };

    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;

    await updateOrderStatus(orderId, nextStatus);
    await loadAllOrders();
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await updateOrderStatus(orderId, 'cancelled');
      await loadAllOrders();
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'all') {
      return o.order_status !== 'served' && o.order_status !== 'cancelled';
    }
    return o.order_status === activeFilter;
  });

  const getElapsedTimeText = (isoDate: string) => {
    const diffMs = now.getTime() - new Date(isoDate).getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
            <BellRing className="w-3 h-3" />
            <span>NEW ORDER</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold">
            ACCEPTED
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-orange-100 text-orange-800 border border-orange-300 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-600 fill-orange-600" />
            <span>PREPARING</span>
          </span>
        );
      case 'ready':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold">
            READY FOR TABLE
          </span>
        );
      case 'served':
        return (
          <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-1 rounded-full text-xs font-bold">
            SERVED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 pb-16">
      {/* Top KDS Header */}
      <header className="bg-stone-950 border-b border-stone-800 px-4 sm:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-maroon-700 text-white flex items-center justify-center shadow-lg shadow-maroon-900/40">
              <ChefHat className="w-5 h-5 text-saffron-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Kitchen Display System (KDS)
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Realtime order flow • Refreshed at {lastRefreshed.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                playKitchenOrderChime();
                setIsAudioEnabled(!isAudioEnabled);
              }}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                isAudioEnabled
                  ? 'bg-stone-800 border-amber-500/50 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="Test & Toggle Audio Chime Alert"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isAudioEnabled ? 'Chime On' : 'Chime Off'}</span>
            </button>

            <button
              onClick={loadAllOrders}
              className="p-2 rounded-xl bg-stone-800 border border-stone-700 hover:bg-stone-700 text-stone-200 transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {user && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 text-xs text-stone-300">
                <User className="w-3.5 h-3.5 text-saffron-400" />
                <span className="font-semibold">{user.fullName || user.email}</span>
                <span className="text-[10px] bg-maroon-800 text-saffron-200 px-1.5 py-0.5 rounded uppercase font-bold">
                  {user.role}
                </span>
              </div>
            )}

            <button
              onClick={async () => {
                await logout();
                navigate('/kitchen/login');
              }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 border border-stone-700 transition-colors"
              title="Sign Out of Kitchen KDS"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <Link
              to="/"
              className="text-xs font-bold bg-maroon-700 hover:bg-maroon-800 text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Customer View
            </Link>
          </div>
        </div>
      </header>

      {/* Main KDS Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-stone-800 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-maroon-700 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            Active Orders ({orders.filter((o) => o.order_status !== 'served' && o.order_status !== 'cancelled').length})
          </button>

          <button
            onClick={() => setActiveFilter('received')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'received'
                ? 'bg-rose-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            New Received ({orders.filter((o) => o.order_status === 'received').length})
          </button>

          <button
            onClick={() => setActiveFilter('preparing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'preparing'
                ? 'bg-orange-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            Preparing ({orders.filter((o) => o.order_status === 'preparing').length})
          </button>

          <button
            onClick={() => setActiveFilter('ready')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'ready'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            Ready ({orders.filter((o) => o.order_status === 'ready').length})
          </button>

          <button
            onClick={() => setActiveFilter('served')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'served'
                ? 'bg-stone-700 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            Served ({orders.filter((o) => o.order_status === 'served').length})
          </button>
        </div>

        {/* Orders Kanban Grid */}
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-stone-950/60 rounded-3xl border border-stone-800 max-w-md mx-auto p-8">
            <ChefHat className="w-12 h-12 text-stone-700 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-300">No Orders in this Status</h3>
            <p className="text-xs text-stone-500">
              New customer orders will immediately ping here with live audio alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedTimeText(order.created_at);
              const isUrgent =
                (order.order_status === 'received' || order.order_status === 'accepted') &&
                now.getTime() - new Date(order.created_at).getTime() > 15 * 60000;

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden transition-all ${
                    isUrgent
                      ? 'border-rose-500/80 bg-stone-950 shadow-lg shadow-rose-950/30'
                      : 'border-stone-800 bg-stone-950/90'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-xl text-white">
                          Table #{order.table_number}
                        </span>
                        <span className="text-xs font-bold text-stone-400">
                          {order.order_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{elapsed}</span>
                      </div>
                    </div>

                    <div>{getStatusBadge(order.order_status)}</div>
                  </div>

                  {/* Card Items List */}
                  <div className="p-4 flex-1 space-y-3 divide-y divide-stone-800/60">
                    {order.items?.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center">
                                {item.quantity}
                              </span>
                              <span className="font-bold text-sm text-stone-100">
                                {item.item_name}
                              </span>
                            </div>

                            {item.spice_level && (
                              <div className="text-[11px] text-amber-400/90 ml-7 mt-0.5 font-medium">
                                Spice: {item.spice_level}
                              </div>
                            )}

                            {item.customizations && item.customizations.length > 0 && (
                              <div className="text-[11px] text-stone-400 ml-7 mt-0.5">
                                + {item.customizations.map((c) => c.name).join(', ')}
                              </div>
                            )}

                            {item.special_instructions && (
                              <div className="text-[11px] text-amber-300/80 bg-amber-950/40 px-2 py-1 rounded ml-7 mt-1 border border-amber-900/50">
                                👨‍🍳 Note: "{item.special_instructions}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special order note if any */}
                  {order.notes && (
                    <div className="px-4 py-2 bg-amber-950/30 border-t border-amber-900/40 text-[11px] text-amber-200">
                      <strong>Table Request:</strong> {order.notes}
                    </div>
                  )}

                  {/* Card Bottom Status Stepper Action */}
                  <div className="p-4 bg-stone-900/60 border-t border-stone-800 flex items-center justify-between gap-2">
                    {order.order_status !== 'served' && order.order_status !== 'cancelled' ? (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, order.order_status)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                          order.order_status === 'received'
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : order.order_status === 'accepted'
                            ? 'bg-orange-600 hover:bg-orange-500 text-white'
                            : order.order_status === 'preparing'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-maroon-700 hover:bg-maroon-600 text-white'
                        }`}
                      >
                        <span>
                          {order.order_status === 'received' && 'Accept Order'}
                          {order.order_status === 'accepted' && 'Mark Preparing'}
                          {order.order_status === 'preparing' && 'Mark Ready'}
                          {order.order_status === 'ready' && 'Mark Served'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-stone-500 font-medium py-1">
                        Completed ({order.order_status})
                      </span>
                    )}

                    {order.order_status !== 'served' && order.order_status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Cancel Order"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
