import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { ContributionsList } from './ContributionsList';
import { LoansList } from './LoansList';
import { PersonalLedger } from './PersonalLedger';
import { SavingsCalculator } from './SavingsCalculator';
import { ContributionModal } from './ContributionModal';
import { LoanApplicationModal } from './LoanApplicationModal';
import { LoanRepaymentModal } from './LoanRepaymentModal';
import { Loan } from '../../types';
import {
  PiggyBank,
  HandCoins,
  Building2,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const {
    currentUser,
    currentMemberSavings,
    currentMemberLoans,
    currentMemberContributions,
    totalCommunityFund,
    totalActiveLoans,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'contributions' | 'loans' | 'ledger' | 'calculator'
  >('overview');

  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<Loan | null>(null);

  const personalSavings = currentMemberSavings?.current_balance || 0;
  const activeLoans = currentMemberLoans.filter((l) => l.status === 'disbursed');
  const activeLoanDebt = activeLoans.reduce((sum, l) => sum + l.remaining_balance, 0);
  const pendingDeposits = currentMemberContributions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleOpenRepayModal = (loan?: Loan) => {
    setSelectedLoanForRepay(loan || null);
    setIsRepayModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Member Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.full_name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Welcome, {currentUser.full_name}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.occupation || 'SACCO Community Member'} • {currentUser.email}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="log-contribution-action-btn"
            onClick={() => setIsContributionModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Log Contribution</span>
          </button>

          <button
            id="apply-loan-action-btn"
            onClick={() => setIsLoanModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <HandCoins className="w-4 h-4" />
            <span>Apply for Loan</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (as explicitly required in prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-personal-savings"
          title="Total Personal Savings"
          value={`$${personalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={
            pendingDeposits > 0
              ? `+$${pendingDeposits.toLocaleString()} pending approval`
              : 'Principal collateral balance'
          }
          icon={<PiggyBank className="w-5 h-5" />}
          highlight="emerald"
          trend={{ value: 'Safe & Accruing', isPositive: true }}
          onClick={() => setActiveTab('contributions')}
        />

        <StatCard
          id="stat-active-loan-balance"
          title="Active Loan Balance"
          value={`$${activeLoanDebt.toFixed(2)}`}
          subtitle={
            activeLoans.length > 0
              ? `${activeLoans.length} active loan in progress`
              : 'Zero active debt'
          }
          icon={<HandCoins className="w-5 h-5" />}
          highlight={activeLoanDebt > 0 ? 'amber' : 'slate'}
          trend={{
            value: activeLoanDebt > 0 ? '5% Low Interest' : 'High Borrowing Power',
            isPositive: activeLoanDebt === 0,
          }}
          onClick={() => setActiveTab('loans')}
        />

        <StatCard
          id="stat-group-pool-balance"
          title="Total Group Pool Balance"
          value={`$${totalCommunityFund.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
          subtitle="Collective SACCO treasury (read-only)"
          icon={<Building2 className="w-5 h-5" />}
          highlight="indigo"
          trend={{ value: 'Full Liquidity', isPositive: true }}
        />

        <StatCard
          id="stat-max-borrowing-power"
          title="Borrowing Limit (3x)"
          value={`$${Math.max(1000, personalSavings * 3).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}`}
          subtitle="Peer-guaranteed credit line"
          icon={<TrendingUp className="w-5 h-5" />}
          highlight="purple"
          trend={{ value: 'Instant Eligibility', isPositive: true }}
          onClick={() => setIsLoanModalOpen(true)}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          id="tab-overview-btn"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          id="tab-contributions-btn"
          onClick={() => setActiveTab('contributions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'contributions'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>My Contributions</span>
          {pendingDeposits > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          id="tab-loans-btn"
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'loans'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          <span>My Loans</span>
        </button>

        <button
          id="tab-ledger-btn"
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Personal Ledger</span>
        </button>

        <button
          id="tab-calculator-btn"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Savings Calculator</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Contributions Snapshot */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Recent Contributions</h3>
                </div>
                <button
                  onClick={() => setActiveTab('contributions')}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  View All ({currentMemberContributions.length})
                </button>
              </div>

              {currentMemberContributions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No contributions recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {currentMemberContributions.slice(0, 3).map((cnt) => (
                    <div key={cnt.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">${cnt.amount.toLocaleString()}</div>
                        <div className="text-slate-500 text-[11px]">
                          {cnt.payment_method} • {new Date(cnt.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          cnt.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : cnt.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {cnt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Loans Snapshot */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HandCoins className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Loan Contracts</h3>
                </div>
                <button
                  onClick={() => setActiveTab('loans')}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  View All ({currentMemberLoans.length})
                </button>
              </div>

              {currentMemberLoans.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No active or past loans.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {currentMemberLoans.slice(0, 3).map((loan) => (
                    <div key={loan.id} className="py-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 line-clamp-1">{loan.purpose}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            loan.status === 'disbursed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : loan.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Remaining: ${loan.remaining_balance.toFixed(2)}</span>
                        <span>Due: ${loan.monthly_installment.toFixed(2)}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SACCO Benefits Banner */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Community Savings & Peer Credit Security
              </h4>
              <p className="text-xs text-slate-300 max-w-xl">
                Every dollar saved guarantees 3x low-interest borrowing power (5% flat) and shares in
                annual SACCO dividend distributions.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('calculator')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
            >
              Simulate Wealth Growth
            </button>
          </div>
        </div>
      )}

      {activeTab === 'contributions' && (
        <ContributionsList onOpenContributionModal={() => setIsContributionModalOpen(true)} />
      )}

      {activeTab === 'loans' && (
        <LoansList
          onOpenLoanModal={() => setIsLoanModalOpen(true)}
          onOpenRepayModal={handleOpenRepayModal}
        />
      )}

      {activeTab === 'ledger' && <PersonalLedger />}

      {activeTab === 'calculator' && (
        <SavingsCalculator
          onDeposit={() => setIsContributionModalOpen(true)}
          onApplyLoan={() => setIsLoanModalOpen(true)}
        />
      )}

      {/* Modals */}
      <ContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
      />

      <LoanApplicationModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
      />

      <LoanRepaymentModal
        isOpen={isRepayModalOpen}
        onClose={() => setIsRepayModalOpen(false)}
        selectedLoan={selectedLoanForRepay}
      />
    </div>
  );
};
