'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, UserCheck, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SessionInfo {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: 'vendor' | 'kitchen' | 'admin';
  };
  organisation: {
    id: string;
    name: string;
    type: string;
    address: string;
  };
  availableProfiles: Array<{
    id: string;
    full_name: string;
    email: string;
    role: 'vendor' | 'kitchen' | 'admin';
    organisation_name: string;
  }>;
}

export function DemoBar() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/demo/session');
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (e) {
      console.error('Failed to load demo session', e);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleSwitchRole = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        await fetchSession();
        setToastMsg(`Switched role successfully!`);
        setTimeout(() => setToastMsg(null), 3000);
        router.refresh();
      }
    } catch (e) {
      console.error('Role switch failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all demo data back to the clean benchmark scenario?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        await fetchSession();
        setToastMsg('Demo data reset to 20kg benchmark state!');
        setTimeout(() => setToastMsg(null), 4000);
        router.refresh();
      }
    } catch (e) {
      console.error('Reset failed', e);
    } finally {
      setResetting(false);
    }
  };

  if (!session) return null;

  return (
    <div className="bg-emerald-950 text-emerald-100 px-4 py-2 text-xs border-b border-emerald-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Demo Mode Pill */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold text-emerald-300 uppercase tracking-wider bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            HexaCore Demo Bar
          </span>
          <span className="hidden sm:inline text-emerald-300/80">
            Current Org: <strong className="text-white font-semibold">{session.organisation?.name || 'Default'}</strong>
          </span>
          <span className="bg-emerald-800/60 text-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-700/50">
            Role: <strong className="uppercase text-amber-300">{session.user?.role}</strong>
          </span>
        </div>

        {/* Center: Toast feedback */}
        {toastMsg && (
          <div className="bg-amber-500 text-slate-950 font-semibold px-3 py-0.5 rounded shadow-sm text-xs animate-pulse">
            {toastMsg}
          </div>
        )}

        {/* Right: Quick Switcher Dropdown & Reset Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline text-emerald-300 font-medium">Switch User:</span>
            <select
              aria-label="Switch User Profile"
              value={session.user?.id}
              onChange={(e) => handleSwitchRole(e.target.value)}
              disabled={loading}
              className="bg-emerald-900 border border-emerald-700 text-white rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
            >
              {session.availableProfiles?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset data back to the clean benchmark scenario"
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white font-medium px-2.5 py-1 rounded transition duration-150 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
