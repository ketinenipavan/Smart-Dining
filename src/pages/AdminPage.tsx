import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  ShoppingBag,
  Users,
  Award,
  Plus,
  Edit2,
  QrCode,
  Printer,
  Search,
  X,
  Tag,
  ArrowUpRight,
  FileSpreadsheet,
  LogOut,
  User,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Category, Coupon, MenuItem, Order, RestaurantTable, SpiceLevel } from '../types';
import {
  fetchCategories,
  fetchCoupons,
  fetchMenuItems,
  fetchOrders,
  getLocalTables,
  saveCoupon,
  saveMenuItem,
  updateMenuItemAvailability,
} from '../lib/supabase';
import { VegNonVegBadge } from '../components/VegNonVegBadge';
import { SpiceBadge } from '../components/SpiceBadge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'coupons' | 'analytics'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);

  // Menu Search
  const [menuSearch, setMenuSearch] = useState<string>('');

  // Add / Edit Dish Modal State
  const [isDishModalOpen, setIsDishModalOpen] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<Partial<MenuItem> | null>(null);

  // Add Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 299,
    is_active: true,
  });

  const loadData = async () => {
    const [cats, items, coups, ords] = await Promise.all([
      fetchCategories(),
      fetchMenuItems(),
      fetchCoupons(),
      fetchOrders(),
    ]);
    setCategories(cats);
    setMenuItems(items);
    setCoupons(coups);
    setOrders(ords);
    setTables(getLocalTables());
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPI Computations
  const totalSales = orders.reduce((sum, o) => sum + (o.order_status !== 'cancelled' ? o.total_amount : 0), 0);
  const activeOrdersCount = orders.filter((o) => o.order_status !== 'served' && o.order_status !== 'cancelled').length;
  const occupiedTables = tables.filter((t) => t.is_occupied).length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0;

  // Compute top selling dish
  const itemFrequencies: Record<string, { name: string; count: number }> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      if (!itemFrequencies[item.menu_item_id]) {
        itemFrequencies[item.menu_item_id] = { name: item.item_name, count: 0 };
      }
      itemFrequencies[item.menu_item_id].count += item.quantity;
    });
  });

  const topSellingItem = Object.values(itemFrequencies).sort((a, b) => b.count - a.count)[0]?.name ||
    'Hyderabadi Chicken Dum Biryani';

  // Instant In-Stock toggle
  const handleToggleStock = async (itemId: string, currentStatus: boolean) => {
    const updated = await updateMenuItemAvailability(itemId, !currentStatus);
    setMenuItems(updated);
  };

  // Save Dish
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish || !editingDish.name) return;

    await saveMenuItem(editingDish);
    setIsDishModalOpen(false);
    setEditingDish(null);
    loadData();
  };

  // Save Coupon
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    await saveCoupon(newCoupon);
    setIsCouponModalOpen(false);
    setNewCoupon({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 299,
      is_active: true,
    });
    loadData();
  };

  // CSV Export for Sales Analytics
  const handleExportCSV = () => {
    const headers = 'Order Number,Table,Subtotal,Tax (5%),Discount,Total Amount,Status,Payment Method,Created At\n';
    const rows = orders
      .map((o) =>
        `"${o.order_number}","${o.table_number}",${o.subtotal},${o.tax},${o.discount},${o.total_amount},"${o.order_status}","${o.payment_method}","${o.created_at}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smart_dining_sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://smartdining.local';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 pb-20">
      {/* Admin Navbar */}
      <header className="bg-stone-900 text-white px-4 sm:px-8 py-4 sticky top-0 z-40 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-saffron-500 text-maroon-950 flex items-center justify-center font-black">
              <ShieldAlert className="w-5 h-5 text-maroon-900 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                Smart Dining Manager
              </h1>
              <p className="text-stone-400 text-xs">
                Admin Control, Live Analytics & QR Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-stone-300">
                <User className="w-3.5 h-3.5 text-saffron-400" />
                <span className="font-semibold">{user.fullName || user.email}</span>
                <span className="text-[10px] bg-saffron-500 text-maroon-950 px-1.5 py-0.5 rounded uppercase font-black">
                  Admin
                </span>
              </div>
            )}

            <button
              onClick={async () => {
                await logout();
                navigate('/admin/login');
              }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 border border-stone-700 transition-colors"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <Link
              to="/kitchen"
              className="text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-xl transition-colors"
            >
              Kitchen KDS
            </Link>
            <Link
              to="/"
              className="text-xs font-bold bg-maroon-700 hover:bg-maroon-800 text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Customer Menu
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sales Card */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Today's Gross Sales
              </span>
              <span className="text-2xl sm:text-3xl font-black text-maroon-800 block mt-1">
                ₹{totalSales.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Verified atomic orders</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Active Kitchen Orders
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 block mt-1">
                {activeOrdersCount}
              </span>
              <span className="text-[11px] text-stone-500 font-medium block mt-1">
                Total lifetime: {orders.length} orders
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-200 flex items-center justify-center text-maroon-800">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Table Occupancy
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 block mt-1">
                {occupancyRate}%
              </span>
              <span className="text-[11px] text-stone-500 font-medium block mt-1">
                {occupiedTables} of {tables.length} tables seated
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Top Selling Item */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Top Selling Dish
              </span>
              <span className="text-base sm:text-lg font-bold text-stone-900 block mt-1 line-clamp-1">
                {topSellingItem}
              </span>
              <span className="text-[11px] text-saffron-700 font-medium block mt-1">
                Customer favorite choice
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-saffron-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-maroon-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Menu Catalog ({menuItems.length})
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'bg-maroon-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Table QR Codes ({tables.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'coupons'
                ? 'bg-maroon-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Coupons & Offers ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-maroon-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sales Analytics & CSV</span>
          </button>
        </div>

        {/* 1. Menu Management Tab */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter menu items..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <button
                onClick={() => {
                  setEditingDish({
                    category_id: categories[0]?.id || 'c1',
                    name: '',
                    description: '',
                    price: 250,
                    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
                    is_veg: true,
                    spice_level: 'Medium',
                    is_available: true,
                    prep_time_minutes: 15,
                  });
                  setIsDishModalOpen(true);
                }}
                className="bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Indian Dish</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Spice</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {menuItems
                    .filter((item) => item.name.toLowerCase().includes(menuSearch.toLowerCase()))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                                <VegNonVegBadge isVeg={item.is_veg} size="sm" />
                                <span>{item.name}</span>
                              </div>
                              <p className="text-[11px] text-stone-500 line-clamp-1 max-w-xs mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-stone-600">
                          {categories.find((c) => c.id === item.category_id)?.name || 'Specials'}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-maroon-800 text-sm">
                          ₹{item.price}
                        </td>

                        <td className="py-3.5 px-4">
                          <SpiceBadge level={item.spice_level} size="sm" />
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStock(item.id, item.is_available)}
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all flex items-center gap-1 ${
                              item.is_available
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.is_available ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            <span>{item.is_available ? 'In Stock' : 'Out of Stock'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingDish(item);
                              setIsDishModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            title="Edit Dish"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Table & QR Code Generator Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <strong className="font-bold">Contactless Table QR Badges:</strong> Customers scanning these QR codes on their smartphones land directly on the menu with their table locked.
              </div>
              <button
                onClick={() => window.print()}
                className="bg-maroon-700 hover:bg-maroon-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print All Table QRs</span>
              </button>
            </div>

            {/* Printable QR Code Cards */}
            <div className="printable-qr-section grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tables.map((table) => {
                const tableUrl = `${currentOrigin}/?table=${table.table_number}`;
                return (
                  <div
                    key={table.id}
                    className="bg-white rounded-3xl p-6 border-2 border-dashed border-amber-200 text-center shadow-sm flex flex-col items-center justify-between space-y-4 hover:shadow-warm transition-all"
                  >
                    <div>
                      <div className="inline-flex items-center gap-1 bg-maroon-700 text-white text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase mb-2">
                        Smart Dining
                      </div>
                      <h4 className="font-serif text-2xl font-black text-stone-900">
                        Table #{table.table_number}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Capacity: {table.capacity} Persons
                      </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-3 bg-white rounded-2xl shadow-inner border border-stone-200">
                      <QRCodeSVG
                        value={tableUrl}
                        size={160}
                        level="H"
                        includeMargin={false}
                        fgColor="#800020"
                      />
                    </div>

                    <div className="space-y-1 w-full">
                      <p className="text-xs font-bold text-stone-800">
                        Scan with Phone Camera to Order
                      </p>
                      <p className="text-[10px] text-stone-400 break-all">
                        {tableUrl}
                      </p>
                    </div>

                    <a
                      href={tableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-maroon-700 hover:underline inline-block pt-1"
                    >
                      Test Table Link ↗
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Active Coupons</h3>
                <p className="text-xs text-stone-500">
                  Coupons are strictly validated server-side on checkout.
                </p>
              </div>

              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-lg text-maroon-800 bg-maroon-50 px-2.5 py-1 rounded-lg border border-maroon-200">
                        {coupon.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          coupon.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 font-medium mt-2">{coupon.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 flex justify-between">
                    <span>Min Order: ₹{coupon.min_order_amount}</span>
                    <span className="font-bold text-stone-800">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `Flat ₹${coupon.discount_value} OFF`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Sales Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Sales Transactions Log
                </h3>
                <p className="text-xs text-stone-500">
                  Itemized records with 5% GST tax and payment verification.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV Report</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Table</th>
                    <th className="py-3 px-4">Subtotal</th>
                    <th className="py-3 px-4">GST (5%)</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-amber-50/20">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{o.order_number}</td>
                      <td className="py-3 px-4 font-bold">Table #{o.table_number}</td>
                      <td className="py-3 px-4">₹{o.subtotal.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{o.tax.toFixed(2)}</td>
                      <td className="py-3 px-4 text-emerald-700">
                        {o.discount > 0 ? `-₹${o.discount.toFixed(2)}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 font-bold text-maroon-800">₹{o.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-medium">{o.payment_method.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {o.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Dish Modal */}
      {isDishModalOpen && editingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-amber-100 flex flex-col max-h-[90vh]">
            <div className="bg-maroon-700 p-5 text-white flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold">
                {editingDish.id ? 'Edit Menu Dish' : 'Add New Indian Dish'}
              </h3>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-600 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={editingDish.name || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  placeholder="e.g. Gongura Paneer Curry"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Category</label>
                <select
                  value={editingDish.category_id || categories[0]?.id}
                  onChange={(e) => setEditingDish({ ...editingDish, category_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingDish.price || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Diet Type</label>
                  <select
                    value={editingDish.is_veg ? 'veg' : 'non-veg'}
                    onChange={(e) => setEditingDish({ ...editingDish, is_veg: e.target.value === 'veg' })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Spice Level</label>
                  <select
                    value={editingDish.spice_level || 'Medium'}
                    onChange={(e) => setEditingDish({ ...editingDish, spice_level: e.target.value as SpiceLevel })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                    <option value="Extra Hot">Extra Hot</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingDish.prep_time_minutes || 15}
                    onChange={(e) =>
                      setEditingDish({ ...editingDish, prep_time_minutes: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={editingDish.image_url || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingDish.description || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  placeholder="Mouthwatering description of ingredients and spices..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2.5 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-100 flex flex-col">
            <div className="bg-maroon-700 p-5 text-white flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold">Create Coupon</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-600 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI15"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discount_type: e.target.value as 'percentage' | 'flat' })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newCoupon.min_order_amount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Description</label>
                <input
                  type="text"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="e.g. 15% off festive celebrations"
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-maroon-700 hover:bg-maroon-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
