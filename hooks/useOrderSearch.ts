'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Order, OrderSearchFilters, PaginatedOrders } from '@/lib/types/database';

export function useOrderSearch(initialFilters?: OrderSearchFilters) {
  const [filters, setFilters] = useState<OrderSearchFilters>(initialFilters || {});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  });

  const supabase = createClient();

  const search = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.query) {
        query = query.or(`order_number.ilike.%${filters.query}%,email.ilike.%${filters.query}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      if (filters.fulfillment_status) {
        query = query.eq('fulfillment_status', filters.fulfillment_status);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const from = (pagination.page - 1) * pagination.per_page;
      const to = from + pagination.per_page - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      setOrders(data || []);
      setPagination(p => ({
        ...p,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pagination.per_page),
      }));
    } catch (error) {
      console.error('Error searching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.per_page]);

  useEffect(() => {
    search();
  }, [filters.status, filters.payment_status, filters.fulfillment_status, filters.date_from, filters.date_to, pagination.page]);

  const updateFilters = (newFilters: Partial<OrderSearchFilters>) => {
    setFilters(f => ({ ...f, ...newFilters }));
    setPagination(p => ({ ...p, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setPagination(p => ({ ...p, page: 1 }));
  };

  return {
    filters,
    orders,
    loading,
    pagination,
    updateFilters,
    clearFilters,
    search,
  };
}