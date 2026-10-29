'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  PlusCircle,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { SurplusListing } from '@/types';
import { formatDateTime, getCategoryBadgeClass, getStatusBadgeClass } from '@/lib/utils';

export default function SurplusPage() {
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/listings')
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && l.food_category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-emerald-700" />
            Surplus Food Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse available surplus food listings or publish new eligible batches.
          </p>
        </div>

        <Link
          href="/surplus/new"
          className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-emerald-200" />
          <span>List Surplus Food</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['all', 'available', 'accepted', 'partially_collected', 'collected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full font-medium transition ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="category-select" className="font-semibold text-slate-500">Category:</label>
          <select
            id="category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruit">Fruit</option>
            <option value="bakery">Bakery</option>
            <option value="packaged_food">Packaged Food</option>
            <option value="prepared_food">Prepared Food</option>
            <option value="dairy">Dairy</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading surplus inventory...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No surplus listings match this filter</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or publish a new listing.</p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="text-xs font-semibold text-emerald-700 underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-emerald-300 transition"
            >
              <div className="space-y-3">
                {/* Header Pills */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getCategoryBadgeClass(listing.food_category)}`}>
                    {listing.food_category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeClass(listing.status)}`}>
                    {listing.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{listing.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {listing.description || 'No extra description provided.'}
                  </p>
                </div>

                {/* Quantity Breakdown Bar */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500 font-medium">Available Quantity:</span>
                    <strong className="text-sm font-extrabold text-emerald-800">
                      {listing.available_quantity} {listing.unit}
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{ width: `${(listing.available_quantity / listing.total_quantity) * 100}%` }}
                    />
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${(listing.reserved_quantity / listing.total_quantity) * 100}%` }}
                    />
                    <div
                      className="bg-teal-700 h-full"
                      style={{ width: `${(listing.collected_quantity / listing.total_quantity) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Total: {listing.total_quantity} {listing.unit}</span>
                    {listing.reserved_quantity > 0 && <span>Reserved: {listing.reserved_quantity} {listing.unit}</span>}
                  </div>
                </div>

                {/* Pickup Window & Warnings */}
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Pickup: <strong className="text-slate-800">{formatDateTime(listing.pickup_start)}</strong> -{' '}
                      <strong className="text-slate-800">{formatDateTime(listing.pickup_end)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{listing.pickup_address}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={`/surplus/${listing.id}`}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-emerald-800 text-white text-xs font-semibold py-2 rounded-lg transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>View Details & Matches</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
