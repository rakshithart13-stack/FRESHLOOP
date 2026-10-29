'use client';

import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Clock,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { KitchenRequirement, Organisation, UserProfile } from '@/types';
import { formatDateTime, formatTimeOnly } from '@/lib/utils';

export default function KitchensPage() {
  const [requirements, setRequirements] = useState<KitchenRequirement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    categories: ['vegetables', 'fruit'],
    desired_quantity: 20,
    min_quantity: 10,
    max_quantity: 30,
    unit: 'kg',
    pickup_start: '',
    pickup_end: '',
    needed_by: '',
    service_area: 'Downtown',
    storage_capabilities: 'Commercial walk-in cooler (4°C) and dry pantry shelves.',
    handling_restrictions: 'Staffed intake team available until 5:30 PM.',
  });

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatInputDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const startD = new Date(now);
    startD.setHours(13, 0, 0, 0);
    const endD = new Date(now);
    endD.setHours(17, 0, 0, 0);
    const neededD = new Date(now);
    neededD.setHours(18, 30, 0, 0);

    setFormData((prev) => ({
      ...prev,
      pickup_start: formatInputDate(startD),
      pickup_end: formatInputDate(endD),
      needed_by: formatInputDate(neededD),
    }));
  }, []);

  const loadData = async () => {
    try {
      const [reqRes, sessRes] = await Promise.all([
        fetch('/api/kitchens'),
        fetch('/api/demo/session'),
      ]);

      if (reqRes.ok) setRequirements(await reqRes.json());
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setCurrentUser(sessData.user);
        setCurrentOrg(sessData.organisation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCategory = (cat: string) => {
    if (formData.categories.includes(cat)) {
      if (formData.categories.length === 1) return; // Keep at least one
      setFormData({ ...formData, categories: formData.categories.filter((c) => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...formData.categories, cat] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentOrg) return;

    if (formData.min_quantity > formData.max_quantity) {
      setError('Minimum quantity cannot be greater than maximum acceptable quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/kitchens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchen_org_id: currentOrg.id,
          accepted_categories: formData.categories,
          desired_quantity: Number(formData.desired_quantity),
          min_quantity: Number(formData.min_quantity),
          max_quantity: Number(formData.max_quantity),
          unit: formData.unit,
          pickup_start: new Date(formData.pickup_start).toISOString(),
          pickup_end: new Date(formData.pickup_end).toISOString(),
          needed_by: new Date(formData.needed_by).toISOString(),
          service_area: formData.service_area,
          storage_capabilities: formData.storage_capabilities,
          handling_restrictions: formData.handling_restrictions,
          is_active: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create requirement');
      }

      setShowModal(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating requirement';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-700" />
            Kitchen Demand & Food Requirements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Community kitchens declare acceptable food categories, batch capacities, and intake operating hours.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-emerald-200" />
          <span>Post Kitchen Requirement</span>
        </button>
      </div>

      {/* Requirements Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading kitchen requirements...</div>
      ) : requirements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No active kitchen requirements found. Click "Post Kitchen Requirement" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-emerald-300 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {req.kitchen_org?.name || 'Community Facility'}
                  </h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {req.service_area || req.kitchen_org?.service_area || 'Downtown Area'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  {req.is_active ? 'Active Need' : 'Paused'}
                </span>
              </div>

              {/* Quantity Demand */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Desired Batch Volume:</span>
                  <strong className="text-sm font-extrabold text-emerald-800">
                    {req.desired_quantity} {req.unit}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Min / Max Acceptable:</span>
                  <span>
                    {req.min_quantity} – {req.max_quantity} {req.unit}
                  </span>
                </div>
              </div>

              {/* Accepted Categories Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Accepted Food Categories
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {req.accepted_categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pickup Availability & Needed By */}
              <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Operating Hours: {formatTimeOnly(req.pickup_start)} – {formatTimeOnly(req.pickup_end)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Needed by: {formatDateTime(req.needed_by)}</span>
                </div>
              </div>

              {/* Storage Info */}
              {req.storage_capabilities && (
                <div className="bg-slate-50/60 p-2.5 rounded-lg text-[11px] text-slate-600 border border-slate-100">
                  <strong className="text-slate-800">Storage:</strong> {req.storage_capabilities}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/matches"
                  className="w-full flex items-center justify-center gap-1 bg-slate-900 hover:bg-emerald-800 text-white text-xs font-semibold py-2 rounded-lg transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Find Matching Surplus</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Kitchen Requirement */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Post Kitchen Requirement</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category Toggles */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Accepted Food Categories *</label>
                <div className="flex flex-wrap gap-2">
                  {['vegetables', 'fruit', 'bakery', 'packaged_food', 'prepared_food', 'dairy'].map((c) => {
                    const isSelected = formData.categories.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => handleToggleCategory(c)}
                        className={`px-3 py-1 rounded-lg font-medium border text-xs capitalize transition ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-800 font-semibold'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}
                        {c.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Desired Qty *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.desired_quantity}
                    onChange={(e) => setFormData({ ...formData, desired_quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Min Acceptable *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Max Acceptable *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.max_quantity}
                    onChange={(e) => setFormData({ ...formData, max_quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Intake Opens *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.pickup_start}
                    onChange={(e) => setFormData({ ...formData, pickup_start: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Intake Closes *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.pickup_end}
                    onChange={(e) => setFormData({ ...formData, pickup_end: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Needed By */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Needed By Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.needed_by}
                  onChange={(e) => setFormData({ ...formData, needed_by: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                />
              </div>

              {/* Storage & Handling */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Storage & Cold-Chain Capacity</label>
                <input
                  type="text"
                  value={formData.storage_capabilities}
                  onChange={(e) => setFormData({ ...formData, storage_capabilities: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Post Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
