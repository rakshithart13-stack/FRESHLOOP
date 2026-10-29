'use client';

import React, { useEffect, useState } from 'react';
import { Building2, User, Mail, Phone, MapPin, ShieldCheck, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserProfile, Organisation } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function ProfilePage() {
  const [session, setSession] = useState<{ user: UserProfile; organisation: Organisation } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/demo/session')
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs">Loading profile...</div>;
  }

  const user = session?.user;
  const org = session?.organisation;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              {org?.name.charAt(0) || 'F'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{org?.name}</h1>
              <p className="text-xs text-slate-500">
                Member since {formatDateTime(org?.created_at)}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            {org?.verified_status || 'verified'}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              Organisation Profile
            </h3>
            <div className="space-y-1.5 text-slate-700">
              <p>
                <strong>Role / Type:</strong> <span className="capitalize">{org?.type}</span>
              </p>
              <p>
                <strong>Address:</strong> {org?.address}
              </p>
              <p>
                <strong>Service Area:</strong> {org?.service_area || 'Downtown'}
              </p>
              <p>
                <strong>Operating Hours:</strong> {org?.operating_hours || '08:00 - 18:00'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-700" />
              Designated Contact
            </h3>
            <div className="space-y-1.5 text-slate-700">
              <p>
                <strong>Name:</strong> {user?.full_name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Role:</strong> <span className="capitalize">{user?.role}</span>
              </p>
              <p>
                <strong>Security:</strong> Role-Based Access Control (RBAC) Verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
