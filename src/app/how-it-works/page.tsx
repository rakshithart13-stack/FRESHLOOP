import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Scale,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
          System Design & Matching Engine
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How FreshLoop Works
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          FreshLoop replaces chaotic spreadsheets and unverified claims with an explainable, deterministic matching
          engine and transactional two-party collection verification.
        </p>
      </div>

      {/* The Core Maxim Alert */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-800 shadow-md">
        <div className="flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-emerald-300">The Core Accountability Principle</h2>
            <blockquote className="text-xl sm:text-2xl font-black text-white italic leading-snug">
              “A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics.”
            </blockquote>
            <p className="text-xs text-slate-300 pt-2 leading-relaxed">
              Many sustainability apps report “impact” as soon as a meal is posted or matched. FreshLoop requires physical handover
              inspection, actual weight verification, and mutual confirmation before any quantity is added to verified impact.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Gate Matching Engine Architecture */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            The 3-Gate Deterministic Matching Engine
          </h2>
          <p className="text-xs text-slate-500">
            No generative hallucination. Pure rule-based, reproducible, transparent logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gate 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                GATE 1
              </span>
              <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Hard Rejection
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Strict Eligibility Filter</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instantly rejects candidates on impossible constraints:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Category mismatch</li>
              <li>Expired pickup deadline</li>
              <li>Zero window overlap</li>
              <li>Quantity &lt; kitchen minimum</li>
              <li>Incompatible units</li>
            </ul>
          </div>

          {/* Gate 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                GATE 2
              </span>
              <span className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" /> 0–100 Ranking
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Calibrated Weighted Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent, multi-factor score:
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                <span>Location Proximity:</span>
                <strong className="text-emerald-700">30% (30 pts)</strong>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                <span>Quantity Fit:</span>
                <strong className="text-teal-700">25% (25 pts)</strong>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                <span>Pickup Time Buffer:</span>
                <strong className="text-blue-700">25% (25 pts)</strong>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                <span>Urgency & Freshness:</span>
                <strong className="text-amber-700">20% (20 pts)</strong>
              </div>
            </div>
          </div>

          {/* Gate 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                GATE 3
              </span>
              <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Human Reasons
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Explainability & Warnings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produces transparent positive reasons and warnings:
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-200 text-[11px]">
                ✓ "Optimal batch size: 20 kg meets 100% of kitchen demand."
              </div>
              <div className="bg-amber-50 text-amber-800 p-2 rounded border border-amber-200 text-[11px]">
                ⚠ "Service-area fallback: precise coordinates unverified."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          FreshLoop State Machine vs Traditional Platforms
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">State Event</th>
                <th className="py-2.5 px-3">Conventional Platform</th>
                <th className="py-2.5 px-3">FreshLoop (HexaCore)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">1. Listing Posted</td>
                <td className="py-3 px-3 text-slate-500">Unverified board listing</td>
                <td className="py-3 px-3 text-emerald-700 font-medium">Validates quantities & pickup deadlines</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">2. Match Computed</td>
                <td className="py-3 px-3 text-rose-600 font-medium">Often falsely logs "Impact Created"</td>
                <td className="py-3 px-3 text-emerald-700 font-medium">Zero impact recorded. Pure recommendation.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">3. Kitchen Accepts</td>
                <td className="py-3 px-3 text-slate-500">Double booking vulnerability</td>
                <td className="py-3 px-3 text-emerald-700 font-medium">Atomic row lock reserves inventory immediately</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">4. Handover Inspection</td>
                <td className="py-3 px-3 text-slate-500">Ignored</td>
                <td className="py-3 px-3 text-emerald-700 font-medium">Reports actual physical weight (supports partials)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">5. Confirmation</td>
                <td className="py-3 px-3 text-slate-500">Single click or automatic</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">Mutual two-party confirmation required</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">6. Impact Calculation</td>
                <td className="py-3 px-3 text-rose-600 font-medium">Inflated totals based on listings</td>
                <td className="py-3 px-3 text-emerald-800 font-bold bg-emerald-50/50">Only verified collected kg enter totals</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex justify-center gap-4 pt-4">
        <Link
          href="/surplus/listing_veg_20kg"
          className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition active:scale-95"
        >
          <span>See Benchmark 20 kg Vegetable Rescue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-lg border border-slate-300 shadow-2xs transition"
        >
          <span>Open Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
