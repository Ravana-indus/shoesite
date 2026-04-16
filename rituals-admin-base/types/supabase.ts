export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          address_type: string | null
          city: string
          country: string | null
          created_at: string | null
          district: string
          id: string
          is_default: boolean | null
          label: string | null
          phone: string | null
          postal_code: string | null
          recipient_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line_1: string; address_line_2?: string | null; address_type?: string | null
          city: string; country?: string | null; created_at?: string | null; district: string
          id?: string; is_default?: boolean | null; label?: string | null; phone?: string | null
          postal_code?: string | null; recipient_name: string; updated_at?: string | null; user_id: string
        }
        Update: {
          address_line_1?: string; address_line_2?: string | null; address_type?: string | null
          city?: string; country?: string | null; created_at?: string | null; district?: string
          id?: string; is_default?: boolean | null; label?: string | null; phone?: string | null
          postal_code?: string | null; recipient_name?: string; updated_at?: string | null; user_id?: string
        }
        Relationships: [{ foreignKeyName: "addresses_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      admin_activity_log: {
        Row: { action: string; admin_user_id: string; created_at: string | null; details: Json | null; entity_id: string | null; entity_type: string | null; id: string; ip_address: string | null }
        Insert: { action: string; admin_user_id: string; created_at?: string | null; details?: Json | null; entity_id?: string | null; entity_type?: string | null; id?: string; ip_address?: string | null }
        Update: { action?: string; admin_user_id?: string; created_at?: string | null; details?: Json | null; entity_id?: string | null; entity_type?: string | null; id?: string; ip_address?: string | null }
        Relationships: [{ foreignKeyName: "admin_activity_log_admin_user_id_fkey"; columns: ["admin_user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      brands: {
        Row: { country_of_origin: string | null; created_at: string | null; description: string | null; id: string; is_active: boolean | null; logo_url: string | null; name: string; slug: string; updated_at: string | null; website: string | null }
        Insert: { country_of_origin?: string | null; created_at?: string | null; description?: string | null; id?: string; is_active?: boolean | null; logo_url?: string | null; name: string; slug: string; updated_at?: string | null; website?: string | null }
        Update: { country_of_origin?: string | null; created_at?: string | null; description?: string | null; id?: string; is_active?: boolean | null; logo_url?: string | null; name?: string; slug?: string; updated_at?: string | null; website?: string | null }
        Relationships: []
      }
      cart_items: {
        Row: { cart_id: string; created_at: string | null; id: string; price_cents: number; product_id: string; quantity: number; updated_at: string | null; variant_id: string | null }
        Insert: { cart_id: string; created_at?: string | null; id?: string; price_cents: number; product_id: string; quantity: number; updated_at?: string | null; variant_id?: string | null }
        Update: { cart_id?: string; created_at?: string | null; id?: string; price_cents?: number; product_id?: string; quantity?: number; updated_at?: string | null; variant_id?: string | null }
        Relationships: [
          { foreignKeyName: "cart_items_cart_id_fkey"; columns: ["cart_id"]; referencedRelation: "carts"; referencedColumns: ["id"] },
          { foreignKeyName: "cart_items_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "cart_items_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
      }
      carts: {
        Row: { created_at: string | null; id: string; session_id: string | null; status: string | null; updated_at: string | null; user_id: string | null }
        Insert: { created_at?: string | null; id?: string; session_id?: string | null; status?: string | null; updated_at?: string | null; user_id?: string | null }
        Update: { created_at?: string | null; id?: string; session_id?: string | null; status?: string | null; updated_at?: string | null; user_id?: string | null }
        Relationships: [{ foreignKeyName: "carts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      categories: {
        Row: { created_at: string | null; description: string | null; display_order: number | null; icon_name: string | null; id: string; is_active: boolean | null; name: string; parent_id: string | null; slug: string; updated_at: string | null }
        Insert: { created_at?: string | null; description?: string | null; display_order?: number | null; icon_name?: string | null; id?: string; is_active?: boolean | null; name: string; parent_id?: string | null; slug: string; updated_at?: string | null }
        Update: { created_at?: string | null; description?: string | null; display_order?: number | null; icon_name?: string | null; id?: string; is_active?: boolean | null; name?: string; parent_id?: string | null; slug?: string; updated_at?: string | null }
        Relationships: [{ foreignKeyName: "categories_parent_id_fkey"; columns: ["parent_id"]; referencedRelation: "categories"; referencedColumns: ["id"] }]
      }
      consultations: {
        Row: { ai_recommendation: Json | null; budget_range: string | null; created_at: string | null; email: string; fragrance_preferences: string[] | null; hair_concerns: string[] | null; hair_type: string | null; id: string; notes: string | null; ritual_focus: string | null; skin_concerns: string[] | null; skin_type: string | null; status: string | null; updated_at: string | null; user_id: string | null }
        Insert: { ai_recommendation?: Json | null; budget_range?: string | null; created_at?: string | null; email: string; fragrance_preferences?: string[] | null; hair_concerns?: string[] | null; hair_type?: string | null; id?: string; notes?: string | null; ritual_focus?: string | null; skin_concerns?: string[] | null; skin_type?: string | null; status?: string | null; updated_at?: string | null; user_id?: string | null }
        Update: { ai_recommendation?: Json | null; budget_range?: string | null; created_at?: string | null; email?: string; fragrance_preferences?: string[] | null; hair_concerns?: string[] | null; hair_type?: string | null; id?: string; notes?: string | null; ritual_focus?: string | null; skin_concerns?: string[] | null; skin_type?: string | null; status?: string | null; updated_at?: string | null; user_id?: string | null }
        Relationships: [{ foreignKeyName: "consultations_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      order_items: {
        Row: { created_at: string | null; fulfilled_quantity: number; id: string; order_id: string; product_id: string; product_name: string; quantity: number; refunded_quantity: number; total_cents: number; unit_price_cents: number; variant_id: string | null; variant_name: string | null }
        Insert: { created_at?: string | null; fulfilled_quantity?: number; id?: string; order_id: string; product_id: string; product_name: string; quantity: number; refunded_quantity?: number; total_cents: number; unit_price_cents: number; variant_id?: string | null; variant_name?: string | null }
        Update: { created_at?: string | null; fulfilled_quantity?: number; id?: string; order_id?: string; product_id?: string; product_name?: string; quantity?: number; refunded_quantity?: number; total_cents?: number; unit_price_cents?: number; variant_id?: string | null; variant_name?: string | null }
        Relationships: [
          { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_items_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "order_items_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
      }
      orders: {
        Row: { billing_address_id: string | null; cancelled_at: string | null; cancelled_reason: string | null; created_at: string | null; discount_cents: number | null; edited_at: string | null; email: string; fulfillment_status: string; id: string; notes: string | null; order_number: string; payhere_payment_id: string | null; payment_method: string | null; payment_status: string | null; shipping_address_id: string | null; shipping_cents: number | null; status: string | null; subtotal_cents: number; tax_cents: number | null; total_cents: number; updated_at: string | null; user_id: string | null }
        Insert: { billing_address_id?: string | null; cancelled_at?: string | null; cancelled_reason?: string | null; created_at?: string | null; discount_cents?: number | null; edited_at?: string | null; email: string; fulfillment_status?: string; id?: string; notes?: string | null; order_number: string; payhere_payment_id?: string | null; payment_method?: string | null; payment_status?: string | null; shipping_address_id?: string | null; shipping_cents?: number | null; status?: string | null; subtotal_cents: number; tax_cents?: number | null; total_cents: number; updated_at?: string | null; user_id?: string | null }
        Update: { billing_address_id?: string | null; cancelled_at?: string | null; cancelled_reason?: string | null; created_at?: string | null; discount_cents?: number | null; edited_at?: string | null; email?: string; fulfillment_status?: string; id?: string; notes?: string | null; order_number?: string; payhere_payment_id?: string | null; payment_method?: string | null; payment_status?: string | null; shipping_address_id?: string | null; shipping_cents?: number | null; status?: string | null; subtotal_cents?: number; tax_cents?: number | null; total_cents?: number; updated_at?: string | null; user_id?: string | null }
        Relationships: [{ foreignKeyName: "orders_billing_address_id_fkey"; columns: ["billing_address_id"]; referencedRelation: "addresses"; referencedColumns: ["id"] }, { foreignKeyName: "orders_shipping_address_id_fkey"; columns: ["shipping_address_id"]; referencedRelation: "addresses"; referencedColumns: ["id"] }, { foreignKeyName: "orders_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      payments: {
        Row: { amount_cents: number; created_at: string | null; id: string; order_id: string; payment_method: string; payment_status: string | null; provider: string; provider_response: Json | null; provider_txn_id: string | null; updated_at: string | null }
        Insert: { amount_cents: number; created_at?: string | null; id?: string; order_id: string; payment_method: string; payment_status?: string | null; provider: string; provider_response?: Json | null; provider_txn_id?: string | null; updated_at?: string | null }
        Update: { amount_cents?: number; created_at?: string | null; id?: string; order_id?: string; payment_method?: string; payment_status?: string | null; provider?: string; provider_response?: Json | null; provider_txn_id?: string | null; updated_at?: string | null }
        Relationships: [{ foreignKeyName: "payments_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] }]
      }
      product_images: {
        Row: { alt_text: string | null; created_at: string | null; display_order: number | null; height: number | null; id: string; product_id: string; url: string; width: number | null }
        Insert: { alt_text?: string | null; created_at?: string | null; display_order?: number | null; height?: number | null; id?: string; product_id: string; url: string; width?: number | null }
        Update: { alt_text?: string | null; created_at?: string | null; display_order?: number | null; height?: number | null; id?: string; product_id?: string; url?: string; width?: number | null }
        Relationships: [{ foreignKeyName: "product_images_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] }]
      }
      product_variants: {
        Row: { compare_at_price_cents: number | null; created_at: string | null; id: string; is_active: boolean | null; name: string; option_values: Json | null; price_cents: number; product_id: string; sku: string | null; stock_qty: number | null; updated_at: string | null }
        Insert: { compare_at_price_cents?: number | null; created_at?: string | null; id?: string; is_active?: boolean | null; name: string; option_values?: Json | null; price_cents: number; product_id: string; sku?: string | null; stock_qty?: number | null; updated_at?: string | null }
        Update: { compare_at_price_cents?: number | null; created_at?: string | null; id?: string; is_active?: boolean | null; name?: string; option_values?: Json | null; price_cents?: number; product_id?: string; sku?: string | null; stock_qty?: number | null; updated_at?: string | null }
        Relationships: [{ foreignKeyName: "product_variants_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] }]
      }
      products: {
        Row: { barcode: string | null; brand_id: string; category_id: string; compare_at_price_cents: number | null; created_at: string | null; description: string | null; dimensions: string | null; how_to_use: string | null; id: string; ingredients: string | null; is_active: boolean | null; is_featured: boolean | null; key_benefits: string[] | null; low_stock_threshold: number | null; name: string; price_cents: number; search_vector: unknown; sku: string | null; slug: string; stock_qty: number | null; tagline: string | null; updated_at: string | null; weight_grams: number | null }
        Insert: { barcode?: string | null; brand_id: string; category_id: string; compare_at_price_cents?: number | null; created_at?: string | null; description?: string | null; dimensions?: string | null; how_to_use?: string | null; id?: string; ingredients?: string | null; is_active?: boolean | null; is_featured?: boolean | null; key_benefits?: string[] | null; low_stock_threshold?: number | null; name: string; price_cents: number; search_vector?: unknown; sku?: string | null; slug: string; stock_qty?: number | null; tagline?: string | null; updated_at?: string | null; weight_grams?: number | null }
        Update: { barcode?: string | null; brand_id?: string; category_id?: string; compare_at_price_cents?: number | null; created_at?: string | null; description?: string | null; dimensions?: string | null; how_to_use?: string | null; id?: string; ingredients?: string | null; is_active?: boolean | null; is_featured?: boolean | null; key_benefits?: string[] | null; low_stock_threshold?: number | null; name?: string; price_cents?: number; search_vector?: unknown; sku?: string | null; slug?: string; stock_qty?: number | null; tagline?: string | null; updated_at?: string | null; weight_grams?: number | null }
        Relationships: [
          { foreignKeyName: "products_brand_id_fkey"; columns: ["brand_id"]; referencedRelation: "brands"; referencedColumns: ["id"] },
          { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; referencedRelation: "categories"; referencedColumns: ["id"] }
        ]
      }
      profiles: {
        Row: { avatar_url: string | null; created_at: string | null; default_billing_address_id: string | null; default_shipping_address_id: string | null; email: string; full_name: string | null; id: string; is_verified: boolean | null; phone: string | null; preferences: Json | null; role: string | null; updated_at: string | null }
        Insert: { avatar_url?: string | null; created_at?: string | null; default_billing_address_id?: string | null; default_shipping_address_id?: string | null; email: string; full_name?: string | null; id: string; is_verified?: boolean | null; phone?: string | null; preferences?: Json | null; role?: string | null; updated_at?: string | null }
        Update: { avatar_url?: string | null; created_at?: string | null; default_billing_address_id?: string | null; default_shipping_address_id?: string | null; email?: string; full_name?: string | null; id?: string; is_verified?: boolean | null; phone?: string | null; preferences?: Json | null; role?: string | null; updated_at?: string | null }
        Relationships: []
      }
      promotions: {
        Row: { code: string; created_at: string | null; description: string | null; discount_type: string; discount_value: number; expires_at: string | null; id: string; is_active: boolean | null; max_discount_cents: number | null; min_order_cents: number | null; name: string; starts_at: string | null; usage_limit: number | null; used_count: number | null }
        Insert: { code: string; created_at?: string | null; description?: string | null; discount_type: string; discount_value: number; expires_at?: string | null; id?: string; is_active?: boolean | null; max_discount_cents?: number | null; min_order_cents?: number | null; name: string; starts_at?: string | null; usage_limit?: number | null; used_count?: number | null }
        Update: { code?: string; created_at?: string | null; description?: string | null; discount_type?: string; discount_value?: number; expires_at?: string | null; id?: string; is_active?: boolean | null; max_discount_cents?: number | null; min_order_cents?: number | null; name?: string; starts_at?: string | null; usage_limit?: number | null; used_count?: number | null }
        Relationships: []
      }
      reviews: {
        Row: { body: string | null; created_at: string | null; helpful_count: number | null; id: string; is_approved: boolean | null; is_verified_purchase: boolean | null; order_id: string | null; product_id: string; rating: number; title: string | null; updated_at: string | null; user_id: string | null }
        Insert: { body?: string | null; created_at?: string | null; helpful_count?: number | null; id?: string; is_approved?: boolean | null; is_verified_purchase?: boolean | null; order_id?: string | null; product_id: string; rating: number; title?: string | null; updated_at?: string | null; user_id?: string | null }
        Update: { body?: string | null; created_at?: string | null; helpful_count?: number | null; id?: string; is_approved?: boolean | null; is_verified_purchase?: boolean | null; order_id?: string | null; product_id?: string; rating?: number; title?: string | null; updated_at?: string | null; user_id?: string | null }
        Relationships: [
          { foreignKeyName: "reviews_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
      }
      ritual_categories: {
        Row: { created_at: string | null; curator_note: string | null; display_order: number | null; icon_name: string | null; id: string; is_active: boolean | null; name: string; slug: string; subtitle: string | null; updated_at: string | null }
        Insert: { created_at?: string | null; curator_note?: string | null; display_order?: number | null; icon_name?: string | null; id?: string; is_active?: boolean | null; name: string; slug: string; subtitle?: string | null; updated_at?: string | null }
        Update: { created_at?: string | null; curator_note?: string | null; display_order?: number | null; icon_name?: string | null; id?: string; is_active?: boolean | null; name?: string; slug?: string; subtitle?: string | null; updated_at?: string | null }
        Relationships: []
      }
      ritual_category_products: {
        Row: { badge_label: string | null; badge_type: string | null; created_at: string | null; curator_price_cents: number; display_order: number | null; expiry_month: string | null; id: string; is_active: boolean | null; market_price_cents: number; product_id: string; ritual_category_id: string; stock_left: number | null; stock_percent: number | null; why_discounted: string | null }
        Insert: { badge_label?: string | null; badge_type?: string | null; created_at?: string | null; curator_price_cents: number; display_order?: number | null; expiry_month?: string | null; id?: string; is_active?: boolean | null; market_price_cents: number; product_id: string; ritual_category_id: string; stock_left?: number | null; stock_percent?: number | null; why_discounted?: string | null }
        Update: { badge_label?: string | null; badge_type?: string | null; created_at?: string | null; curator_price_cents?: number; display_order?: number | null; expiry_month?: string | null; id?: string; is_active?: boolean | null; market_price_cents?: number; product_id?: string; ritual_category_id?: string; stock_left?: number | null; stock_percent?: number | null; why_discounted?: string | null }
        Relationships: [
          { foreignKeyName: "ritual_category_products_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "ritual_category_products_ritual_category_id_fkey"; columns: ["ritual_category_id"]; referencedRelation: "ritual_categories"; referencedColumns: ["id"] }
        ]
      }
      shipping_methods: {
        Row: { created_at: string | null; description: string | null; display_order: number | null; estimated_days: string | null; id: string; is_active: boolean | null; name: string; price_cents: number }
        Insert: { created_at?: string | null; description?: string | null; display_order?: number | null; estimated_days?: string | null; id?: string; is_active?: boolean | null; name: string; price_cents: number }
        Update: { created_at?: string | null; description?: string | null; display_order?: number | null; estimated_days?: string | null; id?: string; is_active?: boolean | null; name?: string; price_cents?: number }
        Relationships: []
      }
      store_settings: {
        Row: { description: string | null; id: string; is_public: boolean | null; key: string; updated_at: string | null; value: Json }
        Insert: { description?: string | null; id?: string; is_public?: boolean | null; key: string; updated_at?: string | null; value: Json }
        Update: { description?: string | null; id?: string; is_public?: boolean | null; key?: string; updated_at?: string | null; value?: Json }
        Relationships: []
      }
      wishlist: {
        Row: { created_at: string | null; id: string; product_id: string; user_id: string; variant_id: string | null }
        Insert: { created_at?: string | null; id?: string; product_id: string; user_id: string; variant_id?: string | null }
        Update: { created_at?: string | null; id?: string; product_id?: string; user_id?: string; variant_id?: string | null }
        Relationships: [
          { foreignKeyName: "wishlist_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "wishlist_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "wishlist_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { is_admin: { Args: never; Returns: boolean } }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
