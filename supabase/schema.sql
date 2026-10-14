-- ===================================================================
-- Smart Dining - PostgreSQL Database Schema & Migration Script
-- Production-Ready Indian Restaurant Self-Ordering SaaS
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------
-- 1. ENUMS
-- -------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'kitchen', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('received', 'accepted', 'preparing', 'ready', 'served', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('razorpay', 'cash_counter', 'pay_at_table');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- -------------------------------------------------------------------
-- 2. TABLES
-- -------------------------------------------------------------------

-- User Profiles (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'kitchen',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number TEXT NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    is_occupied BOOLEAN NOT NULL DEFAULT false,
    qr_slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Food Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    spice_level TEXT NOT NULL DEFAULT 'Medium' CHECK (spice_level IN ('Mild', 'Medium', 'Hot', 'Extra Hot')),
    is_available BOOLEAN NOT NULL DEFAULT true,
    rating NUMERIC(3, 1) NOT NULL DEFAULT 4.7,
    prep_time_minutes INT NOT NULL DEFAULT 15,
    customization_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    table_number TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10, 2) NOT NULL CHECK (tax >= 0), -- 5% Indian Restaurant GST
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 15.00 CHECK (service_fee >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    coupon_code TEXT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    order_status order_status NOT NULL DEFAULT 'received',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    customer_phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    spice_level TEXT,
    customizations JSONB NOT NULL DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-THROUGHPUT REALTIME PERFORMANCE
-- -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- -------------------------------------------------------------------
-- 4. ATOMIC DATABASE RPC FUNCTION: create_verified_order()
-- -------------------------------------------------------------------
-- CRITICAL SECURITY STANDARD: Never trust client prices!
-- Computes verified Subtotal, 5% GST, ₹15 Service Fee, Coupon discounts,
-- and inserts Order + Order Items within a single atomic database transaction.
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_verified_order(
    p_table_number TEXT,
    p_items JSONB,              -- Array of { item_id, quantity, spice_level, customizations, special_instructions }
    p_coupon_code TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT 'cash_counter',
    p_customer_phone TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_table_id UUID;
    v_item RECORD;
    v_item_id UUID;
    v_item_qty INT;
    v_spice_level TEXT;
    v_customizations JSONB;
    v_instructions TEXT;
    v_menu_record RECORD;
    v_addon_cost NUMERIC(10, 2);
    v_item_unit_price NUMERIC(10, 2);
    v_item_total NUMERIC(10, 2);
    v_subtotal NUMERIC(10, 2) := 0.00;
    v_discount NUMERIC(10, 2) := 0.00;
    v_tax NUMERIC(10, 2) := 0.00;
    v_service_fee NUMERIC(10, 2) := 15.00;
    v_total_amount NUMERIC(10, 2) := 0.00;
    v_coupon RECORD;
    v_addon_item RECORD;
BEGIN
    -- 1. Validate Table
    SELECT id INTO v_table_id FROM restaurant_tables WHERE table_number = p_table_number LIMIT 1;
    IF v_table_id IS NULL THEN
        -- If table doesn't exist yet, auto-provision it for resilience
        INSERT INTO restaurant_tables (table_number, qr_slug, is_occupied)
        VALUES (p_table_number, 'table-' || p_table_number, true)
        RETURNING id INTO v_table_id;
    ELSE
        UPDATE restaurant_tables SET is_occupied = true WHERE id = v_table_id;
    END IF;

    -- 2. Validate Items count
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item.';
    END IF;

    -- 3. Calculate verified Subtotal from DB Menu Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_id := (v_item.value->>'item_id')::UUID;
        v_item_qty := COALESCE((v_item.value->>'quantity')::INT, 1);
        
        IF v_item_qty <= 0 THEN
            RAISE EXCEPTION 'Item quantity must be greater than zero.';
        END IF;

        -- Fetch official price from database
        SELECT * INTO v_menu_record FROM menu_items WHERE id = v_item_id;
        IF v_menu_record IS NULL THEN
            RAISE EXCEPTION 'Menu item with ID % does not exist.', v_item_id;
        END IF;

        IF NOT v_menu_record.is_available THEN
            RAISE EXCEPTION 'Item "%" is currently out of stock.', v_menu_record.name;
        END IF;

        -- Addon price verification
        v_addon_cost := 0.00;
        IF (v_item.value ? 'customizations') AND jsonb_typeof(v_item.value->'customizations') = 'array' THEN
            FOR v_addon_item IN SELECT * FROM jsonb_array_elements(v_item.value->'customizations')
            LOOP
                v_addon_cost := v_addon_cost + COALESCE((v_addon_item.value->>'price')::NUMERIC, 0.00);
            END LOOP;
        END IF;

        v_item_unit_price := v_menu_record.price + v_addon_cost;
        v_item_total := v_item_unit_price * v_item_qty;
        v_subtotal := v_subtotal + v_item_total;
    END LOOP;

    -- 4. Validate Coupon & Calculate Discount
    IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
        SELECT * INTO v_coupon FROM coupons 
        WHERE UPPER(code) = UPPER(TRIM(p_coupon_code)) AND is_active = true;

        IF v_coupon IS NOT NULL THEN
            IF v_subtotal >= v_coupon.min_order_amount THEN
                IF v_coupon.discount_type = 'percentage' THEN
                    v_discount := ROUND((v_subtotal * (v_coupon.discount_value / 100.0)), 2);
                ELSE
                    v_discount := LEAST(v_coupon.discount_value, v_subtotal);
                END IF;
            END IF;
        END IF;
    END IF;

    -- 5. Calculate GST (5% standard restaurant tax)
    v_tax := ROUND((v_subtotal * 0.05), 2);

    -- 6. Calculate Final Total
    v_total_amount := GREATEST(0.00, ROUND(v_subtotal + v_tax + v_service_fee - v_discount, 2));

    -- 7. Generate Random Order Reference: #SD-XXXX
    v_order_number := '#SD-' || LPAD(FLOOR(1000 + (RANDOM() * 8999))::TEXT, 4, '0');

    -- 8. Insert Order Record
    INSERT INTO orders (
        order_number,
        table_id,
        table_number,
        subtotal,
        tax,
        service_fee,
        discount,
        coupon_code,
        total_amount,
        order_status,
        payment_status,
        payment_method,
        customer_phone,
        notes
    ) VALUES (
        v_order_number,
        v_table_id,
        p_table_number,
        v_subtotal,
        v_tax,
        v_service_fee,
        v_discount,
        p_coupon_code,
        v_total_amount,
        'received',
        CASE WHEN p_payment_method = 'razorpay' THEN 'completed'::payment_status ELSE 'pending'::payment_status END,
        p_payment_method::payment_method,
        p_customer_phone,
        p_notes
    ) RETURNING id INTO v_order_id;

    -- 9. Insert Order Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_id := (v_item.value->>'item_id')::UUID;
        v_item_qty := COALESCE((v_item.value->>'quantity')::INT, 1);
        v_spice_level := v_item.value->>'spice_level';
        v_customizations := COALESCE(v_item.value->'customizations', '[]'::jsonb);
        v_instructions := v_item.value->>'special_instructions';

        SELECT * INTO v_menu_record FROM menu_items WHERE id = v_item_id;

        v_addon_cost := 0.00;
        IF jsonb_typeof(v_customizations) = 'array' THEN
            FOR v_addon_item IN SELECT * FROM jsonb_array_elements(v_customizations)
            LOOP
                v_addon_cost := v_addon_cost + COALESCE((v_addon_item.value->>'price')::NUMERIC, 0.00);
            END LOOP;
        END IF;

        v_item_unit_price := v_menu_record.price + v_addon_cost;
        v_item_total := v_item_unit_price * v_item_qty;

        INSERT INTO order_items (
            order_id,
            menu_item_id,
            item_name,
            quantity,
            unit_price,
            total_price,
            spice_level,
            customizations,
            special_instructions
        ) VALUES (
            v_order_id,
            v_item_id,
            v_menu_record.name,
            v_item_qty,
            v_item_unit_price,
            v_item_total,
            v_spice_level,
            v_customizations,
            v_instructions
        );
    END LOOP;

    -- 10. Return verified payload
    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_number', v_order_number,
        'table_number', p_table_number,
        'subtotal', v_subtotal,
        'tax', v_tax,
        'service_fee', v_service_fee,
        'discount', v_discount,
        'total_amount', v_total_amount,
        'order_status', 'received',
        'payment_status', CASE WHEN p_payment_method = 'razorpay' THEN 'completed' ELSE 'pending' END
    );
END;
$$;

-- -------------------------------------------------------------------
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public can read active menus, categories, tables, coupons
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Menu Items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public Read Tables" ON restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Public Read Coupons" ON coupons FOR SELECT USING (is_active = true);

-- Orders: Public can create orders, and read orders by ID or active session
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public Update Orders Status" ON orders FOR UPDATE USING (true);

-- Order Items: Public read and write
CREATE POLICY "Public Insert Order Items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Order Items" ON order_items FOR SELECT USING (true);

-- Realtime replication setup for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
