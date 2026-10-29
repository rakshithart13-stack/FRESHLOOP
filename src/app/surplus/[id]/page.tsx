'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  ArrowLeft,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Layers,
  Building2,
  Calendar,
} from 'lucide-react';
import { SurplusListing, MatchResult, IneligibleCandidate, UserProfile } from '@/types';
import { formatDateTime, getCategoryBadgeClass, getStatusBadgeClass } from '@/lib/utils';

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [listing, setListing] = useState<SurplusListing | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [ineligible, setIneligible] = useState<IneligibleCandidate[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'ineligible'>('matches');

  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptQty, setAcceptQty] = useState<number>(20);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      const [listRes, sessRes] = await Promise.all([
        fetch(`/api/listings/${id}`),
        fetch('/api/demo/session'),
      ]);

      if (listRes.ok) {
        const data = await listRes.json();
        setListing(data.listing);
        setMatches(data.matches || []);
        setIneligible(data.ineligible || []);
        if (data.listing) {
          setAcceptQty(data.listing.available_quantity);
        }
      }

      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setCurrentUser(sessData.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAcceptMatch = async (match: MatchResult) => {
    if (!currentUser) return;
    setAcceptingId(match.id);
    setFeedback(null);

    try {
      const res = await fetch('/api/matches/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          quantityToAccept: Number(acceptQty),
          kitchenOrgId: match.kitchen_org_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept match');
      }

      setFeedback({
        type: 'success',
        message: `Match successfully accepted! Reserved ${acceptQty} ${listing?.unit}. Forwarding to collection agreement...`,
      });

      setTimeout(() => {
        router.push('/collections');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error accepting match';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs">Loading listing details...</div>;
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Listing Not Found</h2>
        <Link href="/surplus" className="text-xs font-semibold text-emerald-700 underline">
          Return to Surplus Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/surplus"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Surplus Inventory</span>
      </Link>

      {/* Main Listing Details Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ${getCategoryBadgeClass(listing.food_category)}`}>
                {listing.food_category}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeClass(listing.status)}`}>
                {listing.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{listing.title}</h1>
          </div>

          {/* Quick Quantities Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right">
            <span className="text-[11px] text-slate-500 font-medium block">Available / Total</span>
            <span className="text-xl font-black text-emerald-800">
              {listing.available_quantity} <span className="text-sm font-semibold text-slate-500">/ {listing.total_quantity} {listing.unit}</span>
            </span>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Col 1: Pickup Window */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Pickup Schedule
            </span>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong>Opens:</strong> {formatDateTime(listing.pickup_start)}
              </p>
              <p>
                <strong>Deadline:</strong>{' '}
                <span className="text-amber-700 font-bold">{formatDateTime(listing.pickup_end)}</span>
              </p>
              <p>
                <strong>Use-By / Expiry:</strong> {formatDateTime(listing.expires_at)}
              </p>
            </div>
          </div>

          {/* Col 2: Location & Address */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              Pickup Location
            </span>
            <p className="text-slate-700 leading-relaxed">{listing.pickup_address}</p>
            {listing.lat && listing.lng && (
              <p className="text-[10px] text-slate-500 font-mono">
                GPS: {listing.lat.toFixed(4)}, {listing.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Col 3: Storage & Safety */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Safe Handling Notes
            </span>
            <p className="text-slate-700 leading-relaxed">
              {listing.storage_notes || 'Standard storage protocol.'}
            </p>
            <p className="text-[11px] text-slate-500">
              <strong>Allergens:</strong> {listing.allergens || 'None declared.'}
            </p>
          </div>
        </div>

        {/* Progress Bar of Inventory */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-slate-600 font-medium">
            <span>Inventory Allocation Status</span>
            <span>
              {listing.available_quantity} {listing.unit} Available • {listing.reserved_quantity} {listing.unit} Reserved •{' '}
              {listing.collected_quantity} {listing.unit} Collected
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{ width: `${(listing.available_quantity / listing.total_quantity) * 100}%` }}
              title="Available"
            />
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${(listing.reserved_quantity / listing.total_quantity) * 100}%` }}
              title="Reserved"
            />
            <div
              className="bg-teal-700 h-full transition-all"
              style={{ width: `${(listing.collected_quantity / listing.total_quantity) * 100}%` }}
              title="Collected & Verified"
            />
          </div>
        </div>
      </div>

      {/* Explainable Matching Engine Results Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              Explainable Match Recommendations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic, server-evaluated match scores with transparent explanations and warnings.
            </p>
          </div>

          {/* Tabs: Eligible vs Ineligible */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-1.5 rounded-lg transition ${
                activeTab === 'matches'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eligible Matches ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab('ineligible')}
              className={`px-4 py-1.5 rounded-lg transition ${
                activeTab === 'ineligible'
                  ? 'bg-white text-rose-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Filtered Out Candidates ({ineligible.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Eligible Matches */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-xs">
                No eligible kitchen matches found for this listing currently. Check filtered out candidates to see why.
              </div>
            ) : (
              matches.map((match, idx) => (
                <div
                  key={match.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5 hover:border-emerald-300 transition"
                >
                  {/* Top Line: Rank & Score */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {match.kitchen_org?.name || 'Community Kitchen'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Contact: {match.kitchen_org?.contact_name} ({match.kitchen_org?.contact_email}) •{' '}
                          {match.kitchen_org?.address}
                        </p>
                      </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Match Score</span>
                        <span className="text-xs text-slate-500">Rule-Based</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-700">{match.overall_score}%</span>
                    </div>
                  </div>

                  {/* 4 Score Component Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Location (30%)</span>
                        <strong className="text-emerald-700">{match.score_breakdown.location_score}/30</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full"
                          style={{ width: `${(match.score_breakdown.location_score / 30) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Quantity (25%)</span>
                        <strong className="text-teal-700">{match.score_breakdown.quantity_score}/25</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-600 h-full"
                          style={{ width: `${(match.score_breakdown.quantity_score / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Time Buffer (25%)</span>
                        <strong className="text-blue-700">{match.score_breakdown.time_score}/25</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full"
                          style={{ width: `${(match.score_breakdown.time_score / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Urgency (20%)</span>
                        <strong className="text-amber-700">{match.score_breakdown.demand_score}/20</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full"
                          style={{ width: `${(match.score_breakdown.demand_score / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Positive Explanations & Warnings */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                      Deterministic Explainability Audit
                    </span>
                    <div className="space-y-1.5">
                      {match.explanations.map((exp, i) => (
                        <div key={i} className="flex items-start gap-2 text-emerald-900 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{exp}</span>
                        </div>
                      ))}

                      {match.warnings.map((warn, i) => (
                        <div key={i} className="flex items-start gap-2 text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accept Action Block */}
                  {listing.available_quantity > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs">
                        <label className="font-semibold text-slate-700">Quantity to Claim:</label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max={listing.available_quantity}
                          value={acceptQty}
                          onChange={(e) => setAcceptQty(Number(e.target.value))}
                          className="w-24 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-900 text-xs font-bold"
                        />
                        <span className="font-semibold text-slate-500">{listing.unit}</span>
                      </div>

                      <button
                        onClick={() => handleAcceptMatch(match)}
                        disabled={acceptingId === match.id}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-xs shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>{acceptingId === match.id ? 'Reserving Inventory...' : 'Accept Match & Reserve'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Filtered Out Ineligible Candidates */}
        {activeTab === 'ineligible' && (
          <div className="space-y-4">
            {ineligible.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-xs">
                No kitchens were filtered out for this listing.
              </div>
            ) : (
              ineligible.map((cand, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-rose-200/80 rounded-2xl p-5 shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {cand.kitchen_org?.name || 'Community Facility'}
                      </h3>
                      <p className="text-xs text-slate-500">{cand.kitchen_org?.address}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider">
                      {cand.rejection_code}
                    </span>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-900 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="block">Eligibility Gate Rejection:</strong>
                      <p className="leading-relaxed">{cand.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
