import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';
import type { OrderNote, OrderFulfillment, OrderRefund, OrderEdit } from '../../../types/database';
import { Icon } from '../../ui/Icon';

interface OrderTimelineProps {
  orderId: string;
}

type TimelineEventType =
  | 'order_created'
  | 'status_changed'
  | 'payment_confirmed'
  | 'payment_failed'
  | 'refund_issued'
  | 'fulfillment_added'
  | 'tracking_updated'
  | 'delivered'
  | 'note_added'
  | 'order_edited'
  | 'tag_added'
  | 'tag_removed';

interface TimelineItem {
  id: string;
  type: TimelineEventType;
  noteType?: 'internal' | 'customer' | 'activity';
  description: string;
  user?: string | null;
  createdAt: string;
  content?: string;
}

const EVENT_ICONS: Record<TimelineEventType, string> = {
  order_created: 'add_circle',
  status_changed: 'swap_horiz',
  payment_confirmed: 'payments',
  payment_failed: 'error',
  refund_issued: 'undo',
  fulfillment_added: 'local_shipping',
  tracking_updated: 'tracking',
  delivered: 'check_circle',
  note_added: 'note',
  order_edited: 'edit',
  tag_added: 'label',
  tag_removed: 'label',
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

function formatAbsoluteTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderTimeline({ orderId }: OrderTimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'customer'>('internal');
  const [submitting, setSubmitting] = useState(false);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const [notes, fulfillments, refunds, edits, order] = await Promise.all([
        api.orders.getNotes(orderId),
        api.fulfillments.getByOrder(orderId),
        api.refunds.getByOrder(orderId),
        api.orderEdits.getHistory(orderId),
        api.orders.getById(orderId),
      ]);

      const timelineItems: TimelineItem[] = [];

      timelineItems.push({
        id: `created-${orderId}`,
        type: 'order_created',
        noteType: 'activity',
        description: 'Order created',
        user: null,
        createdAt: order?.created_at ?? new Date().toISOString(),
      });

      for (const fulfillment of fulfillments) {
        const fItems = fulfillment as OrderFulfillment & { items: unknown[] };
        if (fItems.tracking_number) {
          timelineItems.push({
            id: `fulfillment-${fItems.id}`,
            type: fItems.status === 'delivered' ? 'delivered' : fItems.status === 'in_transit' ? 'tracking_updated' : 'fulfillment_added',
            noteType: 'activity',
            description: fItems.status === 'delivered'
              ? `Delivered via ${fItems.carrier ?? 'carrier'}`
              : fItems.status === 'in_transit'
              ? `In transit with ${fItems.carrier ?? 'carrier'} - ${fItems.tracking_number}`
              : `Shipment created${fItems.carrier ? ` via ${fItems.carrier}` : ''}${fItems.tracking_number ? ` - ${fItems.tracking_number}` : ''}`,
            user: fItems.created_by,
            createdAt: fItems.shipped_at ?? fItems.created_at,
          });
        } else {
          timelineItems.push({
            id: `fulfillment-${fItems.id}`,
            type: 'fulfillment_added',
            noteType: 'activity',
            description: `Fulfillment created${fItems.carrier ? ` via ${fItems.carrier}` : ''}`,
            user: fItems.created_by,
            createdAt: fItems.created_at,
          });
        }
      }

      for (const refund of refunds) {
        const rItems = refund as OrderRefund & { items: unknown[] };
        timelineItems.push({
          id: `refund-${rItems.id}`,
          type: 'refund_issued',
          noteType: 'activity',
          description: `Refund of $${(rItems.amount_cents / 100).toFixed(2)} issued${rItems.reason ? ` (${rItems.reason.replace('_', ' ')})` : ''}`,
          user: rItems.created_by,
          createdAt: rItems.created_at,
        });
      }

      for (const edit of edits) {
        const eItems = edit as OrderEdit;
        let description = '';
        switch (eItems.edit_type) {
          case 'add_item':
            description = `Added item: ${eItems.after_data.product_name ?? 'item'}`;
            break;
          case 'remove_item':
            description = `Removed item: ${eItems.before_data.product_name ?? 'item'}`;
            break;
          case 'change_quantity':
            description = `Changed quantity from ${eItems.before_data.quantity} to ${eItems.after_data.quantity}`;
            break;
          case 'change_price':
            description = `Changed price from $${((eItems.before_data.unit_price_cents as number) ?? 0) / 100} to $${((eItems.after_data.unit_price_cents as number) ?? 0) / 100}`;
            break;
          default:
            description = 'Order edited';
        }
        timelineItems.push({
          id: `edit-${eItems.id}`,
          type: 'order_edited',
          noteType: 'activity',
          description,
          user: eItems.edited_by,
          createdAt: eItems.created_at,
        });
      }

      for (const note of notes) {
        const nItems = note as OrderNote;
        timelineItems.push({
          id: `note-${nItems.id}`,
          type: 'note_added',
          noteType: nItems.note_type as 'internal' | 'customer' | 'activity',
          description: nItems.note_type === 'internal' ? 'Internal note added' : nItems.note_type === 'customer' ? 'Customer-facing note added' : 'Activity note',
          user: nItems.created_by,
          createdAt: nItems.created_at,
          content: nItems.content,
        });
      }

      timelineItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setItems(timelineItems);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handleSubmitNote = async () => {
    if (!noteContent.trim()) return;
    setSubmitting(true);
    try {
      await api.orders.addNote(orderId, noteContent.trim(), noteType);
      setNoteContent('');
      await loadTimeline();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant/10 space-y-3">
        <textarea
          value={noteContent}
          onChange={e => setNoteContent(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg">
            <button
              type="button"
              onClick={() => setNoteType('internal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                noteType === 'internal'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Internal
            </button>
            <button
              type="button"
              onClick={() => setNoteType('customer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                noteType === 'customer'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Customer
            </button>
          </div>
          <button
            onClick={handleSubmitNote}
            disabled={!noteContent.trim() || submitting}
            className="px-4 py-2 bg-primary text-on-surface text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading timeline...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
            <Icon name="timeline" className="text-4xl mb-2 opacity-50" />
            <p className="text-sm">No timeline events yet</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/5">
            {items.map(item => (
              <div key={item.id} className="p-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.noteType === 'internal'
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.noteType === 'customer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      <Icon name={EVENT_ICONS[item.type]} className="text-base" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.noteType === 'internal' && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wider font-semibold rounded">
                          Internal
                        </span>
                      )}
                      {item.noteType === 'customer' && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] uppercase tracking-wider font-semibold rounded">
                          Customer
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface font-medium">{item.description}</p>
                    {item.content && (
                      <div className="mt-2 p-3 bg-surface-container-low rounded-lg">
                        <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{item.content}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-on-surface-variant">
                      {item.user && <span>{item.user}</span>}
                      <span
                        className="cursor-help underline decoration-dotted underline-offset-2"
                        title={formatAbsoluteTime(item.createdAt)}
                      >
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
