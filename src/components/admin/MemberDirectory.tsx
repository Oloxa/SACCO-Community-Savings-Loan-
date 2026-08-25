import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Profile, UserRole, UserStatus } from '../../types';
import {
  Search,
  UserPlus,
  Users,
  Shield,
  Phone,
  Mail,
  Edit,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Building,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const MemberDirectory: React.FC = () => {
  const { profiles, savingsAccounts, loans, updateMemberProfile, addManualAdjustment } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'member' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

  // Modal states for selected member
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentDirection, setAdjustmentDirection] = useState<'credit' | 'debit'>('credit');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const filteredMembers = profiles.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone_number.includes(search) ||
      (p.occupation && p.occupation.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleRoleToggle = (profile: Profile) => {
    const newRole: UserRole = profile.role === 'admin' ? 'member' : 'admin';
    updateMemberProfile(profile.id, { role: newRole });
    if (selectedMember?.id === profile.id) {
      setSelectedMember({ ...selectedMember, role: newRole });
    }
  };

  const handleStatusToggle = (profile: Profile) => {
    const newStatus: UserStatus = profile.status === 'active' ? 'suspended' : 'active';
    updateMemberProfile(profile.id, { status: newStatus });
    if (selectedMember?.id === profile.id) {
      setSelectedMember({ ...selectedMember, status: newStatus });
    }
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    const num = parseFloat(adjustmentAmount);
    if (isNaN(num) || num <= 0 || !adjustmentReason.trim()) return;

    addManualAdjustment(selectedMember.id, num, adjustmentDirection, adjustmentReason.trim());
    setAdjustmentAmount('');
    setAdjustmentReason('');
    setShowAdjustmentForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Member Directory & Profiles</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
              {profiles.length} Registered Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage membership records, RBAC permissions, and perform authorized ledger balance adjustments.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or occupation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="member">Members Only</option>
            <option value="admin">Admins Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.map((profile) => {
          const savings = savingsAccounts.find((s) => s.profile_id === profile.id);
          const memberLoans = loans.filter((l) => l.profile_id === profile.id && l.status === 'disbursed');
          const activeDebt = memberLoans.reduce((sum, l) => sum + l.remaining_balance, 0);

          return (
            <div
              key={profile.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      profile.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                    }
                    alt={profile.full_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{profile.full_name}</h4>
                    <p className="text-xs text-slate-500">{profile.occupation || 'Member'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StatusBadge status={profile.role} type="role" />
                      <StatusBadge status={profile.status} type="user" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMember(profile)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Manage
                </button>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[11px] block">Savings Balance</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ${savings?.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[11px] block">Active Loan Debt</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${activeDebt.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.phone_number}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Manage / Edit Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedMember.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedMember.full_name}
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedMember.full_name}</h3>
                  <p className="text-xs text-slate-500">{selectedMember.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Account Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Permissions & Status Controls
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleRoleToggle(selectedMember)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedMember.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Role: {selectedMember.role.toUpperCase()} (Click to toggle)</span>
                  </button>

                  <button
                    onClick={() => handleStatusToggle(selectedMember)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedMember.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span>Status: {selectedMember.status.toUpperCase()}</span>
                  </button>
                </div>
              </div>

              {/* Financial Snapshot */}
              {(() => {
                const s = savingsAccounts.find((acc) => acc.profile_id === selectedMember.id);
                return (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 text-[11px] font-semibold block">
                        Verified Savings Balance
                      </span>
                      <span className="text-xl font-extrabold text-emerald-950">
                        ${s?.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} USD
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAdjustmentForm(!showAdjustmentForm)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      {showAdjustmentForm ? 'Cancel Adjustment' : 'Manual Balance Adjustment'}
                    </button>
                  </div>
                );
              })()}

              {/* Manual Balance Adjustment Form */}
              {showAdjustmentForm && (
                <form
                  onSubmit={handleApplyAdjustment}
                  className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3"
                >
                  <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block">
                    Treasury Manual Balance Adjustment (Audit Logged)
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentDirection('credit')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                        adjustmentDirection === 'credit'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      + Credit (Add)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentDirection('debit')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                        adjustmentDirection === 'debit'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      - Debit (Deduct)
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Amount ($ USD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(e.target.value)}
                      placeholder="e.g. 150.00"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Audit Reason & Reference
                    </label>
                    <input
                      type="text"
                      required
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      placeholder="e.g. Dividend distribution payout / Error correction"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Commit Adjustment to Ledger
                  </button>
                </form>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
