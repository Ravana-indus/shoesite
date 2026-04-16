-- Order Management Powerhouse Migration
-- Run this in Supabase SQL Editor

-- 1. New tables

CREATE TABLE IF NOT EXISTS order_fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number TEXT,
  carrier TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered')),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_fulfillment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id UUID NOT NULL REFERENCES order_fulfillments(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS order_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  reason TEXT NOT NULL CHECK (reason IN ('damaged', 'wrong_item', 'customer_request', 'other')),
  status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('pending', 'processed', 'failed')),
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_refund_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_id UUID NOT NULL REFERENCES order_refunds(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0)
);

CREATE TABLE IF NOT EXISTS order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'internal' CHECK (note_type IN ('internal', 'customer', 'activity')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(order_id, tag)
);

CREATE TABLE IF NOT EXISTS order_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  edit_type TEXT NOT NULL CHECK (edit_type IN ('add_item', 'remove_item', 'change_quantity', 'change_price')),
  before_data JSONB NOT NULL,
  after_data JSONB NOT NULL,
  edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Columns added to orders

ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- 3. Columns added to order_items

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS fulfilled_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS refunded_quantity INTEGER NOT NULL DEFAULT 0;

-- 3b. RPC helper functions (called from api.fulfillments and api.refunds)

CREATE OR REPLACE FUNCTION increment_fulfilled_quantity(item_id UUID, qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE order_items SET fulfilled_quantity = fulfilled_quantity + qty WHERE id = item_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_refunded_quantity(item_id UUID, qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE order_items SET refunded_quantity = refunded_quantity + qty WHERE id = item_id;
END;
$$;

-- 4. RLS Policies (same pattern as existing tables)

ALTER TABLE order_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_refund_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_edits ENABLE ROW LEVEL SECURITY;

-- Admins get full access to all new tables
CREATE POLICY "Admins have full access to order_fulfillments" ON order_fulfillments FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')));
CREATE POLICY "Admins have full access to order_fulfillment_items" ON order_fulfillment_items FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')));
CREATE POLICY "Admins have full access to order_refunds" ON order_refunds FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')));
CREATE POLICY "Admins have full access to order_refund_items" ON order_refund_items FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')));
CREATE POLICY "Admins have full access to order_notes" ON order_notes FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')));
CREATE POLICY "Admins have full access to order_tags" ON order_tags FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')));
CREATE POLICY "Admins have full access to order_edits" ON order_edits FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')));

-- 5. Indexes for performance

CREATE INDEX IF NOT EXISTS idx_fulfillments_order_id ON order_fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_items_fulfillment_id ON order_fulfillment_items(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_items_order_item_id ON order_fulfillment_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON order_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_refund_id ON order_refund_items(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_order_item_id ON order_refund_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_tags_order_id ON order_tags(order_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON order_tags(tag);
CREATE INDEX IF NOT EXISTS idx_edits_order_id ON order_edits(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_search ON orders(order_number, email, created_at);
