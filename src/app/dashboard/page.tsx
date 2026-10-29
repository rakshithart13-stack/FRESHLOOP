'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  ClipboardCheck,
  BarChart3,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { SurplusListing, Collection, ImpactMetrics, Organisation, UserProfile } from '@/types';
import { formatDateTime, getCategoryBadgeClass, getStatusBadgeClass } from '@/lib/utils';

export default function DashboardPage() {
  const [session, setSession] = useState<{ user: UserProfile; organisation: Organisation } | null>(null);
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessRes, listRes, colRes, impRes] = await Promise.all([
          fetch('/api/demo/session'),
          fetch('/api/listings'),
          fetch('/api/collections'),
          fetch('/api/impact'),
        ]);

        if (sessRes.ok) setSession(await sessRes.json());
        if (listRes.ok) setListings(await listRes.json());
        if (colRes.ok) setCollections(await colRes.json());
        if (impRes.ok) setMetrics(await impRes.json());
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-3"></div>
        <p>Loading FreshLoop Dashboard...</p>
      </div>
    );
  }

  const role = session?.user?.role || 'vendor';
  const orgName = session?.organisation?.name || 'GreenBistro Farm Kitchen';

  // Filter listings and collections according to current context
  const activeListings = listings.filter((l) => l.status === 'available' || l.status === 'matched');
  const pendingCollections = collections.filter(
    (c) => c.status === 'pending_pickup' || c.status === 'collected_pending_confirmation'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Org Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{orgName}</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Signed in as <strong className="text-slate-800">{session?.user?.full_name}</strong> •{' '}
            {session?.organisation?.address || 'Downtown District'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'vendor' && (
            <Link
              href="/surplus/new"
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>List New Surplus</span>
            </Link>
          )}

          {role === 'kitchen' && (
            <Link
              href="/kitchens"
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>Post Requirement</span>
            </Link>
          )}

          <Link
            href="/matches"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-300 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Review Matches</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Verified Impact</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700">
              {metrics?.total_verified_collected_kg ?? 15}
            </span>
            <span className="text-xs font-bold text-slate-600">kg</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            ✓ Strictly confirmed collected
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Available Surplus</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{activeListings.length}</span>
            <span className="text-xs font-bold text-slate-500">active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting kitchen pickup</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Handover</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{pendingCollections.length}</span>
            <span className="text-xs font-bold text-slate-500">collections</span>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">Awaiting dual confirmation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Completed Deliveries</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-teal-800">
              {metrics?.total_completed_collections ?? 1}
            </span>
            <span className="text-xs font-bold text-slate-500">verified</span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">100% completion rate</p>
        </div>
      </div>

      {/* Main Grid: Surplus Inventory & Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Active Surplus Listings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">Current Surplus Inventory</h2>
            </div>
            <Link href="/surplus" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              View All ({listings.length})
            </Link>
          </div>

          <div className="space-y-3">
            {listings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No surplus listings found.</div>
            ) : (
              listings.slice(0, 3).map((l) => (
                <div
                  key={l.id}
                  className="border border-slate-200/80 rounded-xl p-4 hover:border-emerald-300 transition bg-slate-50/50"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{l.title}</h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Deadline: {formatDateTime(l.pickup_end)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeClass(l.status)}`}>
                      {l.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 mt-2">
                    <div className="space-x-2">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getCategoryBadgeClass(l.food_category)}`}>
                        {l.food_category}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {l.available_quantity} / {l.total_quantity} {l.unit} available
                      </span>
                    </div>
                    <Link
                      href={`/surplus/${l.id}`}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <span>Matches</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Collections in Handover */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">Collections & Handovers</h2>
            </div>
            <Link href="/collections" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              View All ({collections.length})
            </Link>
          </div>

          <div className="space-y-3">
            {collections.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No active collections right now.</div>
            ) : (
              collections.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 hover:border-emerald-300 transition"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {c.listing?.title || 'Collection Handover'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Between <strong className="text-slate-800">{c.vendor_org?.name}</strong> and{' '}
                        <strong className="text-slate-800">{c.kitchen_org?.name}</strong>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeClass(c.status)}`}>
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 mt-2">
                    <span className="font-semibold text-slate-700">
                      Accepted: {c.accepted_quantity} {c.unit}
                      {c.collected_quantity !== null && c.collected_quantity !== undefined && (
                        <span className="text-emerald-700 ml-1">
                          • Handover: {c.collected_quantity} {c.unit}
                        </span>
                      )}
                    </span>
                    <Link
                      href="/collections"
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <span>Details & Confirm</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
