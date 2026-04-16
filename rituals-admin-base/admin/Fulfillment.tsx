import React, { useState } from 'react';
import { DailyPickList } from '../../components/admin/fulfillment/DailyPickList';
import { FulfillmentDashboard } from '../../components/admin/fulfillment/FulfillmentDashboard';

export default function Fulfillment() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'picklist'>('dashboard');

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Fulfillment</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage orders and daily pick lists</p>
        </div>
        <div className="flex bg-surface border border-outline-variant/30 rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('picklist')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'picklist'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Daily Pick List
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? <FulfillmentDashboard /> : <DailyPickList />}
    </div>
  );
}
