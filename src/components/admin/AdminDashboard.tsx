import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { PendingApprovalsQueue } from './PendingApprovalsQueue';
import { MemberDirectory } from './MemberDirectory';
import { GlobalAuditLedger } from './GlobalAuditLedger';
import { SchemaViewerModal } from './SchemaViewerModal';
import {
  Building2,
  HandCoins,
  Clock,
  Users,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    totalCommunityFund,
    totalActiveLoans,
    availableLiquidity,
    pendingContributionsCount,
    pendingLoansCount,
    totalMembersCount,
    contributions,
    loans,
    transactions,
    profiles,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'approvals' | 'members' | 'ledger'
  >('overview');

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  const totalPending = pendingContributionsCount + pendingLoansCount;
  const reserveRatio =
    totalCommunityFund > 0
      ? Math.round((availableLiquidity / totalCommunityFund) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">SACCO Administrative Console</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Treasury & Credit Committee
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Logged in as <strong>{currentUser.full_name}</strong> (Administrator) • Real-time fund oversight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>SQL / Prisma Schema</span>
          </button>

          {totalPending > 0 && (
            <button
              onClick={() => setActiveTab('approvals')}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors animate-pulse"
            >
              <Clock className="w-4 h-4" />
              <span>Review {totalPending} Pending Approvals</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive Overview Cards (as specifically required in tech specs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-community-fund-size"
          title="Total Community Fund Size"
          value={`$${totalCommunityFund.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Collective member savings pool"
          icon={<Building2 className="w-5 h-5" />}
          highlight="emerald"
          trend={{ value: `${reserveRatio}% Liquidity Rate`, isPositive: true }}
          onClick={() => setActiveTab('overview')}
        />

        <StatCard
          id="stat-total-active-loans-value"
          title="Total Active Loans Value"
          value={`$${totalActiveLoans.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Outstanding principal circulating"
          icon={<HandCoins className="w-5 h-5" />}
          highlight="indigo"
          trend={{ value: '5% Fixed Return Yield', isPositive: true }}
          onClick={() => setActiveTab('approvals')}
        />

        <StatCard
          id="stat-pending-approval-requests"
          title="Pending Approvals"
          value={totalPending}
          subtitle={`${pendingContributionsCount} deposits, ${pendingLoansCount} credit apps`}
          icon={<Clock className="w-5 h-5" />}
          highlight={totalPending > 0 ? 'amber' : 'slate'}
          badge={totalPending > 0 ? 'URGENT' : undefined}
          trend={{ value: totalPending > 0 ? 'Action Required' : 'All Clear', isPositive: totalPending === 0 }}
          onClick={() => setActiveTab('approvals')}
        />

        <StatCard
          id="stat-total-registered-members"
          title="Total Registered Members"
          value={totalMembersCount}
          subtitle="Active community contributors"
          icon={<Users className="w-5 h-5" />}
          highlight="purple"
          trend={{ value: '100% In Good Standing', isPositive: true }}
          onClick={() => setActiveTab('members')}
        />
      </div>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          id="admin-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Executive Overview</span>
        </button>

        <button
          id="admin-tab-approvals"
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals Queue</span>
          {totalPending > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
              {totalPending}
            </span>
          )}
        </button>

        <button
          id="admin-tab-members"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Directory</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {totalMembersCount}
          </span>
        </button>

        <button
          id="admin-tab-ledger"
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Global Audit Log</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Action alert banner if pending requests exist */}
          {totalPending > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">
                    {totalPending} Requests Awaiting Treasury Review
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {pendingContributionsCount} member deposit slips and {pendingLoansCount} credit applications are in the queue.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('approvals')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                Go to Approvals Queue
              </button>
            </div>
          )}

          {/* Treasury Reserve & Solvency Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">SACCO Solvency & Capital Allocation</h3>
                  <p className="text-xs text-slate-500">Breakdown of community assets and liquidity buffers</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Health: Excellent (AA+)
                </span>
              </div>

              {/* Progress bar visualizer */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700">Available Liquid Reserves (${availableLiquidity.toLocaleString()})</span>
                  <span className="text-indigo-700">Active Loan Portfolio (${totalActiveLoans.toLocaleString()})</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${reserveRatio}%` }}
                    title={`Available Liquidity: ${reserveRatio}%`}
                  />
                  <div
                    className="bg-indigo-500 h-full transition-all"
                    style={{ width: `${100 - reserveRatio}%` }}
                    title={`Loaned Capital: ${100 - reserveRatio}%`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{reserveRatio}% Cash Liquidity</span>
                  <span>{100 - reserveRatio}% Productive Lending</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[11px] block">Gross Savings Capital</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${totalCommunityFund.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[11px] block">Yield Accrual Rate</span>
                  <span className="font-bold text-emerald-700 text-sm">5.0% Fixed APR</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[11px] block">Default Loss Rate</span>
                  <span className="font-bold text-slate-900 text-sm">0.0% (0 defaults)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Administrative Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quick shortcuts to administrative workflows</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Review Approvals
                  </span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {totalPending}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('members')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Manage Member Directory
                  </span>
                  <span className="font-bold text-slate-600">{totalMembersCount}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ledger')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    Audit Financial Ledger
                  </span>
                  <span className="font-bold text-slate-600">{transactions.length}</span>
                </button>
              </div>

              <button
                onClick={() => setIsSchemaModalOpen(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Database Schema & DDL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && <PendingApprovalsQueue />}
      {activeTab === 'members' && <MemberDirectory />}
      {activeTab === 'ledger' && <GlobalAuditLedger />}

      {/* Schema Viewer Modal */}
      <SchemaViewerModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </div>
  );
};
