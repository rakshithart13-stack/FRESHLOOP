'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  Clock,
  MapPin,
  Scale,
  ShieldCheck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { MatchResult, UserProfile } from '@/types';
import { formatDateTime, getCategoryBadgeClass } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const loadMatches = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/demo/session'),
      ]);
      if (mRes.ok) setMatches(await mRes.json());
      if (sRes.ok) {
        const sData = await sRes.json();
        setCurrentUser(sData.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleAccept = async (match: MatchResult) => {
    setAcceptingId(match.id);
    try {
      const res = await fetch('/api/matches/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          quantityToAccept: match.listing?.available_quantity || 20,
          kitchenOrgId: match.kitchen_org_id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to accept match');
        return;
      }

      setToast('Match accepted! Inventory reserved. Redirecting to collections...');
      setTimeout(() => router.push('/collections'), 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingId(null);
    }
  };

  const filtered = matches.filter((m) => m.overall_score >= minScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-700" />
            Explainable Match Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Server-evaluated deterministic rankings pairing surplus inventory with eligible kitchen requirements.
          </p>
        </div>

        {/* Score Threshold Filter */}
        <div className="flex items-center gap-2 text-xs bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Min Score:</span>
          {[0, 75, 90].map((score) => (
            <button
              key={score}
              onClick={() => setMinScore(score)}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                minScore === score
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {score === 0 ? 'All Matches' : `${score}%+`}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-600 text-white font-semibold p-3 rounded-xl text-xs shadow-md animate-pulse">
          {toast}
        </div>
      )}

      {/* Matches Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Computing deterministic matches...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No matches found exceeding {minScore}% match score threshold.
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((match, idx) => (
            <div
              key={match.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5 hover:border-emerald-300 transition"
            >
              {/* Match Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
                      {match.listing?.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Offered by <strong className="text-slate-800">{match.vendor_org?.name}</strong> • Matched with{' '}
                      <strong className="text-emerald-800 font-semibold">{match.kitchen_org?.name}</strong>
                    </p>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Match Score</span>
                    <span className="text-[10px] text-slate-500 font-medium">Deterministic</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-700">{match.overall_score}%</span>
                </div>
              </div>

              {/* Score Breakdown Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
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
                    <span className="text-slate-500">Pickup Window (25%)</span>
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

              {/* Explanations List */}
              <div className="space-y-1.5 text-xs">
                {match.explanations.map((exp, i) => (
                  <div key={i} className="flex items-start gap-2 text-emerald-950 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{exp}</span>
                  </div>
                ))}
                {match.warnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-2 text-amber-950 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Available to reserve:{' '}
                  <strong className="text-slate-900">
                    {match.listing?.available_quantity} {match.listing?.unit}
                  </strong>
                </span>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/surplus/${match.listing_id}`}
                    className="font-semibold text-slate-600 hover:text-slate-900 underline"
                  >
                    View Listing Audit
                  </Link>

                  <button
                    onClick={() => handleAccept(match)}
                    disabled={acceptingId === match.id || (match.listing?.available_quantity || 0) <= 0}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{acceptingId === match.id ? 'Reserving...' : 'Accept Match'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
