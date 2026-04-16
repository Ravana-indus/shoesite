'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/admin/ui/Icon';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
  { href: '/admin/products', label: 'Products', icon: 'shopping_bag' },
  { href: '/admin/brands', label: 'Brands', icon: 'business' },
  { href: '/admin/categories', label: 'Categories', icon: 'category' },
  { href: '/admin/users', label: 'Users', icon: 'people' },
  { href: '/admin/fulfillment', label: 'Fulfillment', icon: 'local_shipping' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-surface-container shadow-md"
        aria-label="Toggle menu"
      >
        <Icon name={isOpen ? 'close' : 'menu'} className="text-on-surface" />
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-surface z-40 transition-all duration-300
          ${isOpen ? 'w-60' : 'w-0'} lg:w-60 lg:translate-x-0
          border-r border-outline-variant/10 flex flex-col
        `}
      >
        <div className="p-6 border-b border-outline-variant/10">
          <Link href="/admin" className="flex items-center gap-2">
            <Icon name="admin_panel_settings" className="text-tertiary text-2xl" />
            <span className="font-noto-serif text-lg font-bold text-primary">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-primary-container text-on-primary-container font-medium'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }
                `}
              >
                <Icon name={item.icon} className="text-lg" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-outline-variant/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <Icon name="store" className="text-lg" />
            <span className="text-sm">View Store</span>
          </Link>
        </div>
      </aside>
    </>
  );
}