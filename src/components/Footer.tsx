'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 text-emerald-200" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                FreshLoop <span className="text-emerald-400 font-normal">by HexaCore</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Connecting surplus food providers with community kitchens through deterministic, explainable
              matching. Enforcing two-party collection verification before any gram of food contributes to verified impact.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Core Principle: A suggested match is not a completed donation.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">Core Routes</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/surplus" className="hover:text-emerald-400 transition">
                  Surplus Inventory
                </Link>
              </li>
              <li>
                <Link href="/kitchens" className="hover:text-emerald-400 transition">
                  Kitchen Requirements
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-emerald-400 transition">
                  Explainable Matches
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-emerald-400 transition">
                  Handover Verification
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-emerald-400 transition">
                  Verified Impact Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Docs */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">Documentation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition">
                  How FreshLoop Works
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Architecture (docs/ARCHITECTURE.md)</span>
              </li>
              <li>
                <span className="text-slate-400">Matching Engine (docs/MATCHING.md)</span>
              </li>
              <li>
                <span className="text-slate-400">Database Schema (docs/DATABASE.md)</span>
              </li>
              <li>
                <span className="text-slate-400">Security & RLS (docs/SECURITY.md)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="border-t border-slate-800 pt-6 pb-4">
          <div className="bg-slate-800/60 rounded-lg p-3 text-[11px] text-slate-400 leading-normal border border-slate-700/60">
            <strong className="text-amber-400">Food Safety Notice:</strong> FreshLoop facilitates logistics coordination
            between commercial donors and receiving community facilities. Donors and recipients remain solely responsible
            for inspecting perishables, adhering to local food-handling temperatures, allergen disclosures, and applicable food
            safety codes.
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© 2026 FreshLoop. Built by Team HexaCore for Hackathon 2026.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Zero Food Waste.
          </p>
        </div>
      </div>
    </footer>
  );
}
