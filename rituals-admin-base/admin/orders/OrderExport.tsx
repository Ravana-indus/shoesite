import { api } from '../../../lib/api';
import type { OrderSearchFilters } from '../../../types/database';

export async function exportOrdersCsv(filters: OrderSearchFilters): Promise<void> {
  const csv = await api.orders.exportCsv(filters);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
