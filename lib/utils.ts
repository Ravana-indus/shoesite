import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatPriceShort(price: number): string {
  if (price >= 100000) {
    return `Rs. ${(price / 100000).toFixed(1)}L`;
  }
  if (price >= 1000) {
    return `Rs. ${(price / 1000).toFixed(0)}K`;
  }
  return `Rs. ${price}`;
}
