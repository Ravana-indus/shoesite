import React, { useState } from 'react';
import { api } from '../../../lib/api';
import type { OrderStatus } from '../../../types/database';
import { Icon } from '../../ui/Icon';
import { exportOrdersCsv } from './OrderExport';

interface OrderBulkActionsProps {
  selectedIds: string[];
  onClear: () => void;
  onRefresh: () => void;
}

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export function OrderBulkActions({ selectedIds, onClear, onRefresh }: OrderBulkActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  async function handleBulkStatusUpdate(status: OrderStatus) {
    setStatusDropdownOpen(false);
    setLoadingAction('status');
    try {
      await api.orders.bulkUpdateStatus(selectedIds, status);
      onRefresh();
      onClear();
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleMarkAsShipped() {
    setLoadingAction('shipped');
    try {
      await api.orders.bulkUpdateStatus(selectedIds, 'shipped');
      onRefresh();
      onClear();
    } catch (e) {
      console.error('Failed to mark as shipped:', e);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleArchive() {
    setLoadingAction('archive');
    try {
      await api.orders.bulkArchive(selectedIds);
      onRefresh();
      onClear();
    } catch (e) {
      console.error('Failed to archive:', e);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleExportCsv() {
    setLoadingAction('export');
    try {
      await exportOrdersCsv({});
      onClear();
    } catch (e) {
      console.error('Failed to export CSV:', e);
    } finally {
      setLoadingAction(null);
    }
  }

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-sm font-medium text-on-surface">
        {selectedIds.length} order{selectedIds.length !== 1 ? 's' : ''} selected
      </span>

      <div className="w-px h-6 bg-outline-variant/20" />

      <div className="relative">
        <button
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          disabled={loadingAction !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
        >
          <Icon name="edit" className="text-base" />
          Change Status
          <Icon name="expand_more" className="text-base" />
        </button>
        {statusDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
            <div className="absolute bottom-full mb-2 left-0 bg-surface border border-outline-variant/20 rounded-xl shadow-2xl py-1 min-w-[140px] z-20">
              {STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high capitalize transition-colors"
                >
                  {status}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleMarkAsShipped}
        disabled={loadingAction !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
      >
        {loadingAction === 'shipped' ? (
          <Icon name="progress_activity" className="text-base animate-spin" />
        ) : (
          <Icon name="local_shipping" className="text-base" />
        )}
        Mark as Shipped
      </button>

      <button
        onClick={handleArchive}
        disabled={loadingAction !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
      >
        {loadingAction === 'archive' ? (
          <Icon name="progress_activity" className="text-base animate-spin" />
        ) : (
          <Icon name="archive" className="text-base" />
        )}
        Archive
      </button>

      <button
        onClick={handleExportCsv}
        disabled={loadingAction !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
      >
        {loadingAction === 'export' ? (
          <Icon name="progress_activity" className="text-base animate-spin" />
        ) : (
          <Icon name="download" className="text-base" />
        )}
        Export CSV
      </button>

      <div className="w-px h-6 bg-outline-variant/20" />

      <button
        onClick={onClear}
        disabled={loadingAction !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
      >
        <Icon name="close" className="text-base" />
        Deselect all
      </button>
    </div>
  );
}
