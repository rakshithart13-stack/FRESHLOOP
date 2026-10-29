'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Building2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'vendor' | 'kitchen'>('vendor');
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    phone: '',
    address: '',
    service_area: 'Downtown',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate successful onboarding
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white mx-auto shadow-sm">
            <Leaf className="w-6 h-6 text-emerald-200" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register Your Organisation</h1>
          <p className="text-xs text-slate-500">
            Join the FreshLoop network to match food surplus with validated community need.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900">Registration Complete!</h3>
            <p className="text-xs text-emerald-700">Redirecting to your coordination dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Organisation Role *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`p-3 rounded-xl border text-left font-semibold transition ${
                    role === 'vendor'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-sm font-bold">Food Vendor</span>
                  <span className="text-[11px] font-normal text-slate-500">Restaurant, bakery, caterer, grocer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('kitchen')}
                  className={`p-3 rounded-xl border text-left font-semibold transition ${
                    role === 'kitchen'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-sm font-bold">Community Kitchen</span>
                  <span className="text-[11px] font-normal text-slate-500">Shelter, pantry, soup kitchen</span>
                </button>
              </div>
            </div>

            {/* Organisation Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Organisation / Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. GreenBistro or Hope Kitchen"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            {/* Contact Person & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@org.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Facility Address *</label>
              <input
                type="text"
                required
                placeholder="Street address and neighborhood"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-emerald-700 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
