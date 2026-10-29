'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  History,
  Sparkles,
} from 'lucide-react';
import { Organisation, AuditLog, Collection, SurplusListing } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function AdminPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<'organisations' | 'disputes' | 'logs'>('organisations');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [orgRes, logRes, colRes] = await Promise.all([
        fetch('/api/admin/organisations'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/collections'),
      ]);

      if (orgRes.ok) setOrganisations(await orgRes.json());
      if (logRes.ok) setAuditLogs(await logRes.json());
      if (colRes.ok) setCollections(await colRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrgStatus = async (id: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/organisations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setToast(`Organisation status updated to ${status}!`);
        setTimeout(() => setToast(null), 3000);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const disputedCollections = collections.filter(
    (c) => c.status === 'disputed' || c.status === 'cancelled'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-800" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Administration & Moderation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Restricted operational oversight for organisation compliance, collection disputes, and immutable audit logs.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('organisations')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'organisations'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Organisations ({organisations.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'disputes'
                ? 'bg-white text-rose-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disputes & Flags ({disputedCollections.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'logs'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-600 text-white font-semibold p-3 rounded-xl text-xs shadow-md animate-pulse">
          {toast}
        </div>
      )}

      {/* Tab 1: Organisations Management */}
      {activeTab === 'organisations' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Participating Organisations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5 px-3">Organisation</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {organisations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <strong className="text-slate-900 block">{org.name}</strong>
                      <span className="text-[11px] text-slate-500">{org.address}</span>
                    </td>
                    <td className="py-3 px-3 capitalize">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium text-[11px]">
                        {org.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div>{org.contact_name}</div>
                      <span className="text-[11px] text-slate-400">{org.contact_email}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          org.verified_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : org.verified_status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {org.verified_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {org.verified_status !== 'verified' && (
                        <button
                          onClick={() => handleUpdateOrgStatus(org.id, 'verified')}
                          className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded text-[11px] transition"
                        >
                          Approve
                        </button>
                      )}
                      {org.verified_status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateOrgStatus(org.id, 'rejected')}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-2.5 py-1 rounded text-[11px] transition"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Disputes & Flags */}
      {activeTab === 'disputes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Disputed & Cancelled Collections</h2>
          {disputedCollections.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Zero active collection disputes. All handovers currently proceeding smoothly.
            </div>
          ) : (
            <div className="space-y-3">
              {disputedCollections.map((c) => (
                <div key={c.id} className="border border-rose-200 rounded-xl p-4 bg-rose-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{c.listing?.title}</h3>
                      <p className="text-slate-500">
                        Vendor: {c.vendor_org?.name} • Kitchen: {c.kitchen_org?.name}
                      </p>
                    </div>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-rose-300">
                      {c.status}
                    </span>
                  </div>
                  {c.dispute_reason && (
                    <p className="text-rose-900 font-medium">
                      <strong>Dispute Flag:</strong> {c.dispute_reason}
                    </p>
                  )}
                  {c.cancellation_reason && (
                    <p className="text-slate-700">
                      <strong>Cancellation Reason:</strong> {c.cancellation_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Audit Logs Stream */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Immutable System Audit Logs</h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-500">Role: {log.actor_role || 'system'}</span>
                  </div>
                  <pre className="text-[10px] text-slate-600 mt-1 font-mono">
                    {JSON.stringify(log.details)}
                  </pre>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {formatDateTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
