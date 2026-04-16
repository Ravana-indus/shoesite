import React, { useState, useMemo } from 'react';
import { useOrderSearch } from '../../../hooks/useOrderSearch';
import { useOrderContext } from '../../../context/OrderContext';
import { api } from '../../../lib/api';
import { formatPriceCents, type OrderStatus, type PaymentStatus, type FulfillmentStatus } from '../../../types/database';
import { Icon } from '../../ui/Icon';
import { OrderFilters } from './OrderFilters';
import { OrderBulkActions } from './OrderBulkActions';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
  partially_refunded: 'bg-orange-100 text-orange-800',
};

const FULFILLMENT_STATUS_COLORS: Record<string, string> = {
  unfulfilled: 'bg-gray-100 text-gray-800',
  partial: 'bg-orange-100 text-orange-800',
  fulfilled: 'bg-green-100 text-green-800',
};

const COLUMNS = [
  { key: 'order_number', label: 'Order #', sortable: true },
  { key: 'customer', label: 'Customer', sortable: false },
  { key: 'items_count', label: 'Items', sortable: true },
  { key: 'total', label: 'Total', sortable: true },
  { key: 'payment_status', label: 'Payment', sortable: true },
  { key: 'fulfillment_status', label: 'Fulfillment', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Date', sortable: true },
  { key: 'tags', label: 'Tags', sortable: false },
];

interface SortState {
  sort_by: string;
  sort_dir: 'asc' | 'desc';
}

export function OrderList() {
  const { setSelectedOrderId } = useOrderContext();
  const { query, setQuery, filters, setFilter, clearFilters, pagination, setPage, setSort, orders, total, totalPages, loading, refresh } = useOrderSearch();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<SortState>({ sort_by: 'created_at', sort_dir: 'desc' });

  const handleSort = (column: string) => {
    setSortState(prev => ({
      sort_by: column,
      sort_dir: prev.sort_by === column && prev.sort_dir === 'asc' ? 'desc' : 'asc',
    }));
    setSort(column);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map(o => o.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleRowClick = (e: React.MouseEvent, orderId: string) => {
    if ((e.target as HTMLElement).closest('input[type="checkbox"], select, button')) return;
    setSelectedOrderId(orderId);
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dir = sortState.sort_dir === 'asc' ? 1 : -1;
      switch (sortState.sort_by) {
        case 'order_number':
          return dir * a.order_number.localeCompare(b.order_number);
        case 'total':
          return dir * (a.total_cents - b.total_cents);
        case 'created_at':
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        default:
          return 0;
      }
    });
  }, [orders, sortState]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
            <input
              type="text"
              placeholder="Search orders..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg border border-outline-variant/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <OrderFilters filters={filters} setFilter={setFilter} clearFilters={clearFilters} setSort={setSort} />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('status', filters.status ? undefined : 'pending')}
            className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors ${
              filters.status ? 'bg-primary text-on-surface' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setFilter('payment_status', filters.payment_status ? undefined : 'pending')}
            className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors ${
              filters.payment_status ? 'bg-primary text-on-surface' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Payment
          </button>
          <button
            onClick={() => setFilter('fulfillment_status', filters.fulfillment_status ? undefined : 'unfulfilled')}
            className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors ${
              filters.fulfillment_status ? 'bg-primary text-on-surface' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Fulfillment
          </button>
          {(filters.status || filters.payment_status || filters.fulfillment_status) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-surface z-10 border-b border-outline-variant/10">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-outline-variant/50"
                />
              </th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs uppercase tracking-widest text-on-surface-variant font-semibold ${
                    col.sortable ? 'cursor-pointer hover:text-on-surface' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-[10px]">
                        {sortState.sort_by === col.key ? (sortState.sort_dir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-12 text-center text-on-surface-variant">
                  Loading...
                </td>
              </tr>
            ) : sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-12 text-center text-on-surface-variant">
                  No orders found
                </td>
              </tr>
            ) : (
              sortedOrders.map(order => (
                <tr
                  key={order.id}
                  onClick={e => handleRowClick(e, order.id)}
                  className="border-b border-outline-variant/5 hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => handleSelectOne(order.id)}
                      className="rounded border-outline-variant/50"
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-primary">{order.order_number}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface">{order.email}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-on-surface">{formatPriceCents(order.total_cents)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs uppercase tracking-wider font-semibold ${PAYMENT_STATUS_COLORS[order.payment_status ?? 'pending']}`}>
                      {order.payment_status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs uppercase tracking-wider font-semibold ${FULFILLMENT_STATUS_COLORS[order.fulfillment_status ?? 'unfulfilled']}`}>
                      {order.fulfillment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status ?? 'pending'}
                      onChange={async e => {
                        e.stopPropagation();
                        await api.orders.updateStatus(order.id, e.target.value);
                      }}
                      onClick={e => e.stopPropagation()}
                      className={`text-xs uppercase tracking-wider px-2 py-1 rounded-full border-0 cursor-pointer font-semibold ${STATUS_COLORS[order.status ?? 'pending']}`}
                    >
                      {(['pending','confirmed','processing','shipped','delivered','cancelled','refunded'] as OrderStatus[]).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-LK') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {order.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] text-on-surface-variant">
                          {tag}
                        </span>
                      ))}
                      {(order.tags?.length ?? 0) > 2 && (
                        <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] text-on-surface-variant">
                          +{(order.tags?.length ?? 0) - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
        <OrderBulkActions
          selectedIds={Array.from(selectedIds)}
          onClear={() => setSelectedIds(new Set())}
          onRefresh={refresh}
        />
      )}

      <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/10">
        <p className="text-sm text-on-surface-variant">
          Showing {orders.length} of {total} orders
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="chevron-left" className="text-sm" />
          </button>
          <span className="text-sm text-on-surface">
            Page {pagination.page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="chevron-right" className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
