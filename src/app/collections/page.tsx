'use client';

import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Scale,
  ShieldCheck,
  XCircle,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { Collection, UserProfile, Organisation } from '@/types';
import { formatDateTime, getStatusBadgeClass } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [session, setSession] = useState<{ user: UserProfile; organisation: Organisation } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [handoverInputs, setHandoverInputs] = useState<Record<string, number>>({});
  const [handoverNotes, setHandoverNotes] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      const [colRes, sessRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/demo/session'),
      ]);
      if (colRes.ok) setCollections(await colRes.json());
      if (sessRes.ok) setSession(await sessRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentRole = session?.user?.role || 'vendor';

  const handleRecordHandover = async (collectionId: string) => {
    const qty = handoverInputs[collectionId];
    if (qty === undefined || qty < 0) {
      setToast({ type: 'error', message: 'Please enter a valid actual collected quantity.' });
      return;
    }

    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_handover',
          collectedQuantity: Number(qty),
          role: currentRole,
          notes: handoverNotes[collectionId] || 'Physical collection handover recorded.',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to record handover');
      }

      setToast({
        type: 'success',
        message: `Handover of ${qty} recorded! Status is now pending dual-party confirmation.`,
      });
      await loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleConfirm = async (collectionId: string) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          role: currentRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to confirm');
      }

      setToast({
        type: 'success',
        message: `Confirmed by ${currentRole.toUpperCase()}! Check Verified Impact dashboard.`,
      });
      await loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDispute = async (collectionId: string) => {
    const reason = prompt('Please enter the reason for flagging/disputing this collection:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispute',
          reason,
          role: currentRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to dispute');
      }

      setToast({ type: 'error', message: 'Collection marked as DISPUTED and held from impact metrics.' });
      await loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error';
      setToast({ type: 'error', message: msg });
    }
  };

  const filtered = collections.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-700" />
            Collection Handover & Two-Party Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforcing physical receipt verification. Only confirmed collected quantities enter verified impact totals.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 text-xs bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {['all', 'pending_pickup', 'collected_pending_confirmation', 'confirmed', 'disputed'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeFilter === st
                  ? 'bg-emerald-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Collections List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading collections...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No collections match this filter.
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((c) => {
            const isConfirmed = c.status === 'confirmed';
            const isDisputed = c.status === 'disputed';
            const isCancelled = c.status === 'cancelled';

            const defaultQty = c.collected_quantity ?? c.accepted_quantity;
            const currentInput = handoverInputs[c.id] ?? defaultQty;

            return (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5 hover:border-emerald-300 transition"
              >
                {/* Title & Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {c.listing?.title || 'Food Surplus Collection'}
                      </h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeClass(c.status)}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vendor: <strong className="text-slate-800">{c.vendor_org?.name}</strong> • Kitchen:{' '}
                      <strong className="text-slate-800">{c.kitchen_org?.name}</strong>
                    </p>
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Deadline: {formatDateTime(c.pickup_deadline)}
                  </span>
                </div>

                {/* Handover Data & Dual Sign-off Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Left Column: Quantities Comparison */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                      Physical Handover Quantities
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Agreed / Accepted:</span>
                        <strong className="text-base font-extrabold text-slate-900">
                          {c.accepted_quantity} {c.unit}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Actual Collected:</span>
                        <strong className="text-base font-extrabold text-emerald-800">
                          {c.collected_quantity !== null && c.collected_quantity !== undefined
                            ? `${c.collected_quantity} ${c.unit}`
                            : 'Pending input'}
                        </strong>
                      </div>
                    </div>

                    {c.collected_quantity !== null &&
                      c.collected_quantity !== undefined &&
                      c.collected_quantity < c.accepted_quantity && (
                        <div className="bg-amber-100/70 border border-amber-300 text-amber-900 p-2 rounded-lg text-[11px] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                          <span>
                            Partial Collection: {c.accepted_quantity - c.collected_quantity} {c.unit} variance recorded.
                            Only {c.collected_quantity} {c.unit} counts toward impact.
                          </span>
                        </div>
                      )}

                    {c.notes && (
                      <p className="text-[11px] text-slate-600 italic">
                        <strong>Handover Note:</strong> "{c.notes}"
                      </p>
                    )}

                    {c.dispute_reason && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 rounded-lg text-[11px]">
                        <strong>Dispute Flag:</strong> {c.dispute_reason}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Two-Party Confirmation Barrier */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                      Two-Party Confirmation Barrier
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Vendor Sign-off ({c.vendor_org?.name}):
                        </span>
                        {c.vendor_confirmed ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">Awaiting Confirmation</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Kitchen Sign-off ({c.kitchen_org?.name}):
                        </span>
                        {c.kitchen_confirmed ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">Awaiting Confirmation</span>
                        )}
                      </div>
                    </div>

                    {isConfirmed ? (
                      <div className="bg-teal-50 border border-teal-200 text-teal-900 p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        <span>Dual confirmation achieved! Added to Verified Impact totals.</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        Both parties must confirm the handover before verified impact numbers are updated.
                      </p>
                    )}
                  </div>
                </div>

                {/* Handover Input & Actions Bar */}
                {!isConfirmed && !isCancelled && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                    {/* Left: Input actual collection weight */}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="font-semibold text-slate-700">Actual Collected:</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={c.accepted_quantity}
                        value={currentInput}
                        onChange={(e) =>
                          setHandoverInputs({
                            ...handoverInputs,
                            [c.id]: Number(e.target.value),
                          })
                        }
                        className="w-24 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-bold"
                      />
                      <span className="font-semibold text-slate-500">{c.unit}</span>

                      <button
                        onClick={() => handleRecordHandover(c.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1 rounded text-xs transition"
                      >
                        Save Actual Weight
                      </button>
                    </div>

                    {/* Right: Confirm & Dispute Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDispute(c.id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold px-3 py-1 rounded border border-rose-200 hover:bg-rose-50 transition"
                      >
                        Flag Dispute
                      </button>

                      {/* Confirm Button for active role */}
                      <button
                        onClick={() => handleConfirm(c.id)}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-1.5 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Confirm as {currentRole.toUpperCase()}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
