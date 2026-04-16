import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import type { OrderStatus, PaymentStatus, FulfillmentStatus, OrderSearchFilters } from '../../../types/database';
import { Icon } from '../../ui/Icon';

interface Props {
  filters: OrderSearchFilters;
  setFilter: (key: keyof OrderSearchFilters, value: unknown) => void;
  clearFilters: () => void;
  setSort: (sort_by: string) => void;
}

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];
const FULFILLMENT_STATUSES: FulfillmentStatus[] = ['unfulfilled', 'partial', 'fulfilled'];

export function OrderFilters({ filters, setFilter, clearFilters, setSort }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const [localStatus, setLocalStatus] = useState<OrderStatus | ''>(filters.status ?? '');
  const [localPaymentStatus, setLocalPaymentStatus] = useState<PaymentStatus | ''>(filters.payment_status ?? '');
  const [localFulfillment, setLocalFulfillment] = useState<FulfillmentStatus | ''>(filters.fulfillment_status ?? '');
  const [localDateFrom, setLocalDateFrom] = useState(filters.date_from ?? '');
  const [localDateTo, setLocalDateTo] = useState(filters.date_to ?? '');
  const [localTags, setLocalTags] = useState<string[]>(filters.tags ?? []);

  useEffect(() => {
    api.orders.getDistinctTags().then(setTags).catch(console.error);
  }, []);

  useEffect(() => {
    setLocalStatus(filters.status ?? '');
    setLocalPaymentStatus(filters.payment_status ?? '');
    setLocalFulfillment(filters.fulfillment_status ?? '');
    setLocalDateFrom(filters.date_from ?? '');
    setLocalDateTo(filters.date_to ?? '');
    setLocalTags(filters.tags ?? []);
  }, [filters]);

  const activeFilterCount = [
    filters.status ? 1 : 0,
    filters.payment_status ? 1 : 0,
    filters.fulfillment_status ? 1 : 0,
    filters.date_from ? 1 : 0,
    filters.date_to ? 1 : 0,
    filters.tags && filters.tags.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function handleApply() {
    if (localStatus) setFilter('status', localStatus);
    else setFilter('status', undefined);
    if (localPaymentStatus) setFilter('payment_status', localPaymentStatus);
    else setFilter('payment_status', undefined);
    if (localFulfillment) setFilter('fulfillment_status', localFulfillment);
    else setFilter('fulfillment_status', undefined);
    setFilter('date_from', localDateFrom || undefined);
    setFilter('date_to', localDateTo || undefined);
    setFilter('tags', localTags.length > 0 ? localTags : undefined);
    setIsOpen(false);
  }

  function handleClear() {
    clearFilters();
    setLocalStatus('');
    setLocalPaymentStatus('');
    setLocalFulfillment('');
    setLocalDateFrom('');
    setLocalDateTo('');
    setLocalTags([]);
  }

  function toggleTag(tag: string) {
    setLocalTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  return (
    <div className="border border-outline-variant/10 rounded-xl bg-surface overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon name="tune" className="text-lg text-on-surface-variant" />
          <span className="text-sm font-medium text-on-surface">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-primary text-on-primary">
              {activeFilterCount}
            </span>
          )}
        </div>
        <Icon
          name={isOpen ? 'expand_less' : 'expand_more'}
          className={`text-xl text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-6 border-t border-outline-variant/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Status</label>
              <div className="space-y-1">
                {ORDER_STATUSES.map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={localStatus === status}
                      onChange={() => setLocalStatus(status)}
                      className="w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Payment Status</label>
              <div className="space-y-1">
                {PAYMENT_STATUSES.map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="payment_status"
                      value={status}
                      checked={localPaymentStatus === status}
                      onChange={() => setLocalPaymentStatus(status)}
                      className="w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Fulfillment</label>
              <div className="space-y-1">
                {FULFILLMENT_STATUSES.map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="fulfillment"
                      value={status}
                      checked={localFulfillment === status}
                      onChange={() => setLocalFulfillment(status)}
                      className="w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Date From</label>
              <input
                type="date"
                value={localDateFrom}
                onChange={e => setLocalDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Date To</label>
              <input
                type="date"
                value={localDateTo}
                onChange={e => setLocalDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {tags.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Tags</label>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        localTags.includes(tag)
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
