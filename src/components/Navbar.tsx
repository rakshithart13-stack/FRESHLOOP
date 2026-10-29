'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Leaf,
  PlusCircle,
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  ClipboardCheck,
  BarChart3,
  ShieldAlert,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/surplus', label: 'Surplus', icon: UtensilsCrossed },
    { href: '/kitchens', label: 'Kitchen Needs', icon: PlusCircle },
    { href: '/matches', label: 'Matches', icon: Sparkles },
    { href: '/collections', label: 'Collections', icon: ClipboardCheck },
    { href: '/impact', label: 'Verified Impact', icon: BarChart3 },
    { href: '/how-it-works', label: 'How It Works', icon: HelpCircle },
    { href: '/admin', label: 'Admin', icon: ShieldAlert },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-9 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand Tagline */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-sm transition group-hover:scale-105">
                <Leaf className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Fresh<span className="text-emerald-700">Loop</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded tracking-normal">
                    HexaCore
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">
                  Less Waste. More Meals.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-emerald-700' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/surplus/new"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-200" />
              <span>List Surplus</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-emerald-700' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/surplus/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>List New Surplus</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
