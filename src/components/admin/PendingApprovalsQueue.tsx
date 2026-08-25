import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Contribution, Loan } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  HandCoins,
  ShieldCheck,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  Check,
  X,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PendingApprovalsQueue: React.FC = () => {
  const {
    contributions,
    loans,
    profiles,
    savingsAccounts,
    approveContribution,
    rejectContribution,
    approveAndDisburseLoan,
    rejectLoan,
    totalCommunityFund,
    availableLiquidity,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contributions' | 'loans'>('contributions');
  const [rejectingContributionId, setRejectingContributionId] = useState<string | null>(null);
  const [contributionRejectReason, setContributionRejectReason] = useState<string>('');
  
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);
  const [loanRejectReason, setLoanRejectReason] = useState<string>('');

  const pendingContributions = contributions.filter((c) => c.status === 'pending');
  const pendingLoans = loans.filter((l) => l.status === 'pending');

  const handleApproveContribution = (id: string) => {
    approveContribution(id);
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.6 },
    });
  };

  const handleRejectContributionConfirm = () => {
    if (!rejectingContributionId) return;
    rejectContribution(rejectingContributionId, contributionRejectReason);
    setRejectingContributionId(null);
    setContributionRejectReason('');
  };

  const handleApproveLoan = (id: string) => {
    approveAndDisburseLoan(id);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleRejectLoanConfirm = () => {
    if (!rejectingLoanId) return;
    rejectLoan(rejectingLoanId, loanRejectReason);
    setRejectingLoanId(null);
    setLoanRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Pending Approvals Queue</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingContributions.length + pendingLoans.length} Action Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming deposit receipts and loan applications before financial ledger commitment.
          </p>
        </div>

        {/* Treasury Liquidity Gauge */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">SACCO Available Liquidity:</span>
            <span className="font-extrabold text-emerald-700 text-sm">
              ${availableLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          id="queue-tab-contributions"
          onClick={() => setActiveTab('contributions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'contributions'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Pending Contributions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              pendingContributions.length > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {pendingContributions.length}
          </span>
        </button>

        <button
          id="queue-tab-loans"
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'loans'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          <span>Pending Loans</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              pendingLoans.length > 0
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {pendingLoans.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Pending Contributions Queue */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          {pendingContributions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">All Contributions Reconciled</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No pending deposit slips in the queue. New member contributions will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingContributions.map((cnt) => {
                const member = profiles.find((p) => p.id === cnt.profile_id);
                const memberSavings = savingsAccounts.find((s) => s.profile_id === cnt.profile_id);

                return (
                  <div
                    key={cnt.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member?.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={member?.full_name || 'Member'}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {member?.full_name || 'Unknown Member'}
                            </h4>
                            <StatusBadge status={member?.status || 'active'} />
                          </div>
                          <p className="text-xs text-slate-500">
                            {member?.email} • {member?.phone_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`reject-cnt-${cnt.id}-btn`}
                          onClick={() => setRejectingContributionId(cnt.id)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          id={`approve-cnt-${cnt.id}-btn`}
                          onClick={() => handleApproveContribution(cnt.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Credit Balance</span>
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
                        <span className="text-emerald-800 text-[11px] font-semibold block">
                          Deposit Amount
                        </span>
                        <span className="font-extrabold text-emerald-900 text-base">
                          ${cnt.amount.toLocaleString()} USD
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-500 text-[11px] block">Payment Channel</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          {cnt.payment_method}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-500 text-[11px] block">Reference Code</span>
                        <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                          {cnt.reference_code || 'N/A'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-500 text-[11px] block">Current Balance</span>
                        <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                          ${memberSavings?.current_balance.toLocaleString() || '0'} USD
                        </span>
                      </div>
                    </div>

                    {cnt.notes && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <span className="font-semibold text-slate-500 block mb-0.5">Member Notes:</span>
                        {cnt.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Loans Queue */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {pendingLoans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">All Loan Applications Reviewed</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active credit requests awaiting underwriting approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingLoans.map((loan) => {
                const member = profiles.find((p) => p.id === loan.profile_id);
                const memberSavings = savingsAccounts.find((s) => s.profile_id === loan.profile_id);
                const currentBalance = memberSavings?.current_balance || 0;
                const savingsMultiplier =
                  currentBalance > 0 ? (loan.amount_requested / currentBalance).toFixed(1) : '∞';
                const isWithinStandard3x = currentBalance > 0 && loan.amount_requested <= currentBalance * 3;

                return (
                  <div
                    key={loan.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member?.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={member?.full_name || 'Member'}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {member?.full_name || 'Unknown Member'}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {member?.occupation || 'Member'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {member?.email} • Applied on {new Date(loan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`reject-loan-${loan.id}-btn`}
                          onClick={() => setRejectingLoanId(loan.id)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          id={`approve-loan-${loan.id}-btn`}
                          onClick={() => handleApproveLoan(loan.id)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Disburse Funds</span>
                        </button>
                      </div>
                    </div>

                    {/* Underwriting Checklist Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-xl">
                        <span className="text-indigo-800 text-[11px] font-semibold block">
                          Requested Principal
                        </span>
                        <span className="font-extrabold text-indigo-900 text-base">
                          ${loan.amount_requested.toLocaleString()} USD
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-500 text-[11px] block">Duration / Interest</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          {loan.duration_months} Months @ {loan.interest_rate}% Flat
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-500 text-[11px] block">Monthly Installment</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          ${loan.monthly_installment.toFixed(2)}/mo
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-xl border ${
                          isWithinStandard3x
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                      >
                        <span className="text-[11px] font-semibold block">Collateral Ratio</span>
                        <span className="font-bold mt-0.5 block">
                          {savingsMultiplier}x Savings (${currentBalance.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <span className="font-semibold text-slate-500 block mb-0.5">Loan Purpose:</span>
                      {loan.purpose}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reject Contribution Modal */}
      {rejectingContributionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Reject Contribution Deposit</h3>
              <button
                onClick={() => setRejectingContributionId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Please specify the reason for rejection (e.g. invalid bank slip, unverified reference
                code, missing bank stamp):
              </p>
              <textarea
                rows={3}
                value={contributionRejectReason}
                onChange={(e) => setContributionRejectReason(e.target.value)}
                placeholder="Deposit reference code could not be reconciled with treasury bank statement..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setRejectingContributionId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectContributionConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Loan Modal */}
      {rejectingLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Decline Loan Application</h3>
              <button
                onClick={() => setRejectingLoanId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Please provide feedback for the credit committee's decline decision:
              </p>
              <textarea
                rows={3}
                value={loanRejectReason}
                onChange={(e) => setLoanRejectReason(e.target.value)}
                placeholder="Requested amount exceeds 3x savings collateral ceiling. Recommended to increase savings balance first."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setRejectingLoanId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectLoanConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
