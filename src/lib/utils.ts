import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'vegetables':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'fruit':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'bakery':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'prepared_food':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'packaged_food':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'dairy':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'accepted':
    case 'matched':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'partially_collected':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'confirmed':
    case 'collected':
      return 'bg-teal-100 text-teal-800 border-teal-300 font-semibold';
    case 'disputed':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
    case 'cancelled':
    case 'expired':
      return 'bg-slate-100 text-slate-600 border-slate-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}
