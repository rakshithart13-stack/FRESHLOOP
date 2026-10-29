'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Sparkles, UserCheck, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // In demo environment, match with demo profiles or fallback
    try {
      const res = await fetch('/api/demo/session');
      const data = await res.json();
      const match = data.availableProfiles?.find(
        (p: { email: string }) => p.email.toLowerCase() === email.toLowerCase()
      );
      if (match) {
        await handleDemoLogin(match.id);
      } else {
        // Log in as GreenBistro by default
        await handleDemoLogin('user_vendor_greenbistro');
      }
    } catch {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white mx-auto shadow-sm">
            <Leaf className="w-6 h-6 text-emerald-200" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to FreshLoop</h1>
          <p className="text-xs text-slate-500">
            Access your organisation's surplus inventory and coordination dashboard.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* 1-Click Fast Demo Login for Judges */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hackathon Quick-Sign-In (1-Click)</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Select a verified persona to test role-specific permissions and workflows immediately:
          </p>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => handleDemoLogin('user_vendor_greenbistro')}
              disabled={loading}
              className="w-full flex items-center justify-between bg-white hover:bg-emerald-100/60 border border-emerald-300 text-slate-900 font-semibold p-2.5 rounded-lg transition active:scale-98"
            >
              <span>GreenBistro (Food Vendor)</span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Vendor
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin('user_kitchen_hope')}
              disabled={loading}
              className="w-full flex items-center justify-between bg-white hover:bg-emerald-100/60 border border-emerald-300 text-slate-900 font-semibold p-2.5 rounded-lg transition active:scale-98"
            >
              <span>Hope Community Kitchen</span>
              <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Kitchen
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin('user_admin_hexacore')}
              disabled={loading}
              className="w-full flex items-center justify-between bg-white hover:bg-emerald-100/60 border border-emerald-300 text-slate-900 font-semibold p-2.5 rounded-lg transition active:scale-98"
            >
              <span>HexaCore Platform Ops</span>
              <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Admin
              </span>
            </button>
          </div>
        </div>

        {/* Traditional Form */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">or continue with email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Work Email</label>
            <input
              type="email"
              required
              placeholder="elena@greenbistro.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg transition active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          New to FreshLoop?{' '}
          <Link href="/register" className="font-semibold text-emerald-700 underline">
            Register your organisation
          </Link>
        </p>
      </div>
    </div>
  );
}
