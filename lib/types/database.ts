import type { Database } from './supabase';

export type { Database };
export type Brand = Database['public']['Tables']['brands']['Row'];
export type BrandInsert = Database['public']['Tables']['brands']['Insert'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type ProductImage = Database['public']['Tables']['product_images']['Row'];
export type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Cart = Database['public']['Tables']['carts']['Row'] & { totalQuantity: number };
export type CartItem = Database['public']['Tables']['cart_items']['Row'] & { product?: Product };
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type ShippingMethod = Database['public']['Tables']['shipping_methods']['Row'];
export type Promotion = Database['public']['Tables']['promotions']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type WishlistItem = Database['public']['Tables']['wishlist']['Row'];
export type Consultation = Database['public']['Tables']['consultations']['Row'];
export type RitualCategory = Database['public']['Tables']['ritual_categories']['Row'];
export type RitualCategoryProduct = Database['public']['Tables']['ritual_category_products']['Row'];

export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled';
export type FulfillmentRecordStatus = 'pending' | 'in_transit' | 'delivered';
export type RefundReason = 'damaged' | 'wrong_item' | 'customer_request' | 'other';
export type RefundStatus = 'pending' | 'processed' | 'failed';
export type NoteType = 'internal' | 'customer' | 'activity';
export type OrderEditType = 'add_item' | 'remove_item' | 'change_quantity' | 'change_price';

export type OrderSearchFilters = {
  query?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  fulfillment_status?: FulfillmentStatus;
  date_from?: string;
  date_to?: string;
  tags?: string[];
};

export type Pagination = {
  page: number;
  per_page: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
};

export type PaginatedOrders = {
  data: Order[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type OrderFulfillment = {
  id: string;
  order_id: string;
  tracking_number: string | null;
  carrier: string | null;
  status: FulfillmentRecordStatus;
  shipped_at: string | null;
  delivered_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type OrderFulfillmentItem = {
  id: string;
  fulfillment_id: string;
  order_item_id: string;
  quantity: number;
};

export type OrderRefund = {
  id: string;
  order_id: string;
  amount_cents: number;
  reason: RefundReason;
  status: RefundStatus;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type OrderRefundItem = {
  id: string;
  refund_id: string;
  order_item_id: string;
  quantity: number;
  amount_cents: number;
};

export type OrderNote = {
  id: string;
  order_id: string;
  content: string;
  note_type: NoteType;
  created_by: string | null;
  created_at: string;
};

export type OrderTag = {
  id: string;
  order_id: string;
  tag: string;
};

export type OrderEdit = {
  id: string;
  order_id: string;
  edit_type: OrderEditType;
  before_data: Record<string, unknown>;
  after_data: Record<string, unknown>;
  edited_by: string | null;
  created_at: string;
};

export type ProfileRole = 'customer' | 'admin' | 'super_admin';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type BadgeType = 'tertiary' | 'secondary' | 'editorial';

export function formatPriceCents(cents: number): string {
  // Prices stored as rupees directly (e.g., 5500 = Rs 5,500.00)
  const rupees = cents;
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function parsePriceString(priceStr: string): number {
  if (!priceStr) return 0;
  let cleaned = priceStr.toString().replace(/[^\d.,]/g, '');
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '');
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastComma > -1) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length !== 3) {
      cleaned = cleaned.replace(',', '.');
    } else if (parts.length > 2) {
      cleaned = cleaned.replace(/,/g, '');
    } else {
      if (parts[1].length === 3) {
          cleaned = cleaned.replace(/,/g, '');
      } else {
          cleaned = cleaned.replace(',', '.');
      }
    }
  }

  // Store as rupees directly (e.g., input 5500.00 -> stores as 5500)
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}