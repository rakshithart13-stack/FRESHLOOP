'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, ArrowLeft, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NewSurplusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionVendorOrgId, setSessionVendorOrgId] = useState<string>('org_vendor_greenbistro');

  // Default times: pickup starting today at 14:00, ending at 18:00, expires at 22:00
  const [formData, setFormData] = useState({
    title: '',
    food_category: 'vegetables',
    description: '',
    total_quantity: 20,
    unit: 'kg',
    pickup_start: '',
    pickup_end: '',
    expires_at: '',
    pickup_address: '142 Market Street, Downtown District',
    storage_notes: 'Chilled at 4°C. Packaged in food-grade crates.',
    allergens: 'None',
    safetyChecked: false,
  });

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatInputDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const startD = new Date(now);
    startD.setHours(14, 0, 0, 0);
    const endD = new Date(now);
    endD.setHours(18, 0, 0, 0);
    const expiryD = new Date(now);
    expiryD.setHours(22, 0, 0, 0);

    setFormData((prev) => ({
      ...prev,
      pickup_start: formatInputDate(startD),
      pickup_end: formatInputDate(endD),
      expires_at: formatInputDate(expiryD),
    }));
  }, []);

  useEffect(() => {
    fetch('/api/demo/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.organisation?.id) {
          setSessionVendorOrgId(data.organisation.id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.safetyChecked) {
      setError('Please acknowledge the food safety responsibility checkbox before publishing.');
      return;
    }

    if (new Date(formData.pickup_start) >= new Date(formData.pickup_end)) {
      setError('Pickup start time must be before pickup deadline.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_org_id: sessionVendorOrgId,
          title: formData.title,
          food_category: formData.food_category,
          description: formData.description,
          total_quantity: Number(formData.total_quantity),
          unit: formData.unit,
          pickup_start: new Date(formData.pickup_start).toISOString(),
          pickup_end: new Date(formData.pickup_end).toISOString(),
          expires_at: new Date(formData.expires_at).toISOString(),
          pickup_address: formData.pickup_address,
          storage_notes: formData.storage_notes,
          allergens: formData.allergens,
          status: 'available',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create surplus listing');
      }

      const created = await res.json();
      router.push(`/surplus/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/surplus"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Surplus Inventory</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">List Surplus Food</h1>
              <p className="text-xs text-slate-500">
                Publish surplus food for eligible community kitchens to discover and claim.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Listing Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 20 kg Fresh Farm Vegetables (Carrots, Squash)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Quantity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Food Category *</label>
              <select
                value={formData.food_category}
                onChange={(e) => setFormData({ ...formData, food_category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="vegetables">Vegetables</option>
                <option value="fruit">Fruit</option>
                <option value="bakery">Bakery</option>
                <option value="packaged_food">Packaged Food</option>
                <option value="prepared_food">Prepared Food</option>
                <option value="dairy">Dairy</option>
                <option value="beverages">Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Total Quantity *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.total_quantity}
                onChange={(e) => setFormData({ ...formData, total_quantity: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="meals">meals (Prepared Meals)</option>
                <option value="boxes">boxes</option>
                <option value="litres">litres</option>
                <option value="portions">portions</option>
                <option value="units">units</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Description & Handling Details</label>
            <textarea
              rows={2}
              placeholder="Fresh morning delivery surplus. Pre-sorted and clean."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Pickup Window & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Pickup Available From *</label>
              <input
                type="datetime-local"
                required
                value={formData.pickup_start}
                onChange={(e) => setFormData({ ...formData, pickup_start: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Pickup Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.pickup_end}
                onChange={(e) => setFormData({ ...formData, pickup_end: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Use-By / Expiry Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Pickup Address / Area *</label>
            <input
              type="text"
              required
              value={formData.pickup_address}
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Storage & Allergens Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Storage & Temperature Notes</label>
              <input
                type="text"
                placeholder="e.g. Chilled at 4°C, store dry, etc."
                value={formData.storage_notes}
                onChange={(e) => setFormData({ ...formData, storage_notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Allergen Information</label>
              <input
                type="text"
                placeholder="e.g. Gluten, Dairy, Nuts, None"
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Mandatory Food Safety Check */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.safetyChecked}
                onChange={(e) => setFormData({ ...formData, safetyChecked: e.target.checked })}
                className="mt-0.5 rounded border-amber-400 text-emerald-700 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-amber-900 leading-normal">
                <strong>Food Safety Compliance Acknowledgment:</strong> I confirm that this food has been handled in
                accordance with applicable hygiene standards and temperature controls. Both donors and recipients remain
                responsible for applicable food-safety requirements.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <Link
              href="/surplus"
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Publishing & Finding Matches...' : 'Publish Surplus Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
