export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
          address_line_1: string
          address_line_2?: string | null
          address_type?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          district: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          recipient_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          address_type?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          district?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          recipient_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          country_of_origin: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          price_cents: number
          product_id: string
          quantity: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          price_cents: number
          product_id: string
          quantity: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          price_cents?: number
          product_id?: string
          quantity?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          ai_recommendation: Json | null
          budget_range: string | null
          created_at: string | null
          email: string
          fragrance_preferences: string[] | null
          hair_concerns: string[] | null
          hair_type: string | null
          id: string
          notes: string | null
          ritual_focus: string | null
          skin_concerns: string[] | null
          skin_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_recommendation?: Json | null
          budget_range?: string | null
          created_at?: string | null
          email: string
          fragrance_preferences?: string[] | null
          hair_concerns?: string[] | null
          hair_type?: string | null
          id?: string
          notes?: string | null
          ritual_focus?: string | null
          skin_concerns?: string[] | null
          skin_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_recommendation?: Json | null
          budget_range?: string | null
          created_at?: string | null
          email?: string
          fragrance_preferences?: string[] | null
          hair_concerns?: string[] | null
          hair_type?: string | null
          id?: string
          notes?: string | null
          ritual_focus?: string | null
          skin_concerns?: string[] | null
          skin_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_edits: {
        Row: {
          after_data: Json
          before_data: Json
          created_at: string | null
          edit_type: string
          edited_by: string | null
          id: string
          order_id: string
        }
        Insert: {
          after_data: Json
          before_data: Json
          created_at?: string | null
          edit_type: string
          edited_by?: string | null
          id?: string
          order_id: string
        }
        Update: {
          after_data?: Json
          before_data?: Json
          created_at?: string | null
          edit_type?: string
          edited_by?: string | null
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_edits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_fulfillment_items: {
        Row: {
          fulfillment_id: string
          id: string
          order_item_id: string
          quantity: number
        }
        Insert: {
          fulfillment_id: string
          id?: string
          order_item_id: string
          quantity: number
        }
        Update: {
          fulfillment_id?: string
          id?: string
          order_item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_fulfillment_items_fulfillment_id_fkey"
            columns: ["fulfillment_id"]
            isOneToOne: false
            referencedRelation: "order_fulfillments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_fulfillment_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_fulfillments: {
        Row: {
          carrier: string | null
          created_at: string | null
          created_by: string | null
          delivered_at: string | null
          id: string
          order_id: string
          shipped_at: string | null
          status: string | null
          tracking_number: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          order_id: string
          shipped_at?: string | null
          status?: string | null
          tracking_number?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          order_id?: string
          shipped_at?: string | null
          status?: string | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_fulfillments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          fulfilled_quantity: number | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          refunded_quantity: number | null
          total_cents: number
          unit_price_cents: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          fulfilled_quantity?: number | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          refunded_quantity?: number | null
          total_cents: number
          unit_price_cents: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          fulfilled_quantity?: number | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          refunded_quantity?: number | null
          total_cents?: number
          unit_price_cents?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          note_type: string | null
          order_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note_type?: string | null
          order_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note_type?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_refund_items: {
        Row: {
          amount_cents: number
          id: string
          order_item_id: string
          quantity: number
          refund_id: string
        }
        Insert: {
          amount_cents: number
          id?: string
          order_item_id: string
          quantity: number
          refund_id: string
        }
        Update: {
          amount_cents?: number
          id?: string
          order_item_id?: string
          quantity?: number
          refund_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_refund_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_refund_items_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "order_refunds"
            referencedColumns: ["id"]
          },
        ]
      }
      order_refunds: {
        Row: {
          amount_cents: number
          created_at: string | null
          created_by: string | null
          id: string
          note: string | null
          order_id: string
          reason: string
          status: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string | null
          order_id: string
          reason: string
          status?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string
          reason?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tags: {
        Row: {
          id: string
          order_id: string
          tag: string
        }
        Insert: {
          id?: string
          order_id: string
          tag: string
        }
        Update: {
          id?: string
          order_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tags_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          cancelled_at: string | null
          cancelled_reason: string | null
          created_at: string | null
          discount_cents: number | null
          edited_at: string | null
          email: string
          fulfillment_status: string | null
          id: string
          notes: string | null
          order_number: string
          payhere_payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address_id: string | null
          shipping_cents: number | null
          status: string | null
          subtotal_cents: number
          tax_cents: number | null
          total_cents: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address_id?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          discount_cents?: number | null
          edited_at?: string | null
          email: string
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payhere_payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          shipping_cents?: number | null
          status?: string | null
          subtotal_cents: number
          tax_cents?: number | null
          total_cents: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address_id?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          discount_cents?: number | null
          edited_at?: string | null
          email?: string
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payhere_payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          shipping_cents?: number | null
          status?: string | null
          subtotal_cents?: number
          tax_cents?: number | null
          total_cents?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          order_id: string
          payment_method: string
          payment_status: string | null
          provider: string
          provider_response: Json | null
          provider_txn_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_method: string
          payment_status?: string | null
          provider: string
          provider_response?: Json | null
          provider_txn_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_method?: string
          payment_status?: string | null
          provider?: string
          provider_response?: Json | null
          provider_txn_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          height: number | null
          id: string
          product_id: string
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          height?: number | null
          id?: string
          product_id: string
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          height?: number | null
          id?: string
          product_id?: string
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          compare_at_price_cents: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          option_values: Json | null
          price_cents: number
          product_id: string
          sku: string | null
          stock_qty: number | null
          updated_at: string | null
        }
        Insert: {
          compare_at_price_cents?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          option_values?: Json | null
          price_cents: number
          product_id: string
          sku?: string | null
          stock_qty?: number | null
          updated_at?: string | null
        }
        Update: {
          compare_at_price_cents?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          option_values?: Json | null
          price_cents?: number
          product_id?: string
          sku?: string | null
          stock_qty?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand_id: string
          category_id: string
          compare_at_price_cents: number | null
          created_at: string | null
          description: string | null
          dimensions: string | null
          how_to_use: string | null
          id: string
          ingredients: string | null
          is_active: boolean | null
          is_featured: boolean | null
          key_benefits: string[] | null
          low_stock_threshold: number | null
          name: string
          price_cents: number
          search_vector: unknown
          sku: string | null
          slug: string
          stock_qty: number | null
          tagline: string | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          barcode?: string | null
          brand_id: string
          category_id: string
          compare_at_price_cents?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          how_to_use?: string | null
          id?: string
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          key_benefits?: string[] | null
          low_stock_threshold?: number | null
          name: string
          price_cents: number
          search_vector?: unknown
          sku?: string | null
          slug: string
          stock_qty?: number | null
          tagline?: string | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          barcode?: string | null
          brand_id?: string
          category_id?: string
          compare_at_price_cents?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          how_to_use?: string | null
          id?: string
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          key_benefits?: string[] | null
          low_stock_threshold?: number | null
          name?: string
          price_cents?: number
          search_vector?: unknown
          sku?: string | null
          slug?: string
          stock_qty?: number | null
          tagline?: string | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_billing_address_id: string | null
          default_shipping_address_id: string | null
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          preferences: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_billing_address_id?: string | null
          default_shipping_address_id?: string | null
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_billing_address_id?: string | null
          default_shipping_address_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_discount_cents: number | null
          min_order_cents: number | null
          name: string
          starts_at: string | null
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_cents?: number | null
          min_order_cents?: number | null
          name: string
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_cents?: number | null
          min_order_cents?: number | null
          name?: string
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ritual_categories: {
        Row: {
          created_at: string | null
          curator_note: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          curator_note?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          curator_note?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ritual_category_products: {
        Row: {
          badge_label: string | null
          badge_type: string | null
          created_at: string | null
          curator_price_cents: number
          display_order: number | null
          expiry_month: string | null
          id: string
          is_active: boolean | null
          market_price_cents: number
          product_id: string
          ritual_category_id: string
          stock_left: number | null
          stock_percent: number | null
          updated_at: string | null
          why_discounted: string | null
        }
        Insert: {
          badge_label?: string | null
          badge_type?: string | null
          created_at?: string | null
          curator_price_cents: number
          display_order?: number | null
          expiry_month?: string | null
          id?: string
          is_active?: boolean | null
          market_price_cents: number
          product_id: string
          ritual_category_id: string
          stock_left?: number | null
          stock_percent?: number | null
          updated_at?: string | null
          why_discounted?: string | null
        }
        Update: {
          badge_label?: string | null
          badge_type?: string | null
          created_at?: string | null
          curator_price_cents?: number
          display_order?: number | null
          expiry_month?: string | null
          id?: string
          is_active?: boolean | null
          market_price_cents?: number
          product_id?: string
          ritual_category_id?: string
          stock_left?: number | null
          stock_percent?: number | null
          updated_at?: string | null
          why_discounted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ritual_category_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ritual_category_products_ritual_category_id_fkey"
            columns: ["ritual_category_id"]
            isOneToOne: false
            referencedRelation: "ritual_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          estimated_days: string | null
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {
      increment_fulfilled_quantity: {
        Args: { item_id: string; qty: number }
        Returns: undefined
      }
      increment_refunded_quantity: {
        Args: { item_id: string; qty: number }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {}
    CompositeTypes: {}
  }
}