import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Shield,
  PiggyBank,
  HandCoins,
  Receipt,
  Calculator,
  Building2,
  Clock,
  Database,
  Lock,
  Sparkles,
  X,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'member' | 'admin';
  onChangeView: (view: 'member' | 'admin') => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSchemaModal: () => void;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  isOpenMobile,
  onCloseMobile,
  onOpenSchemaModal,
  onOpenAuthModal,
}) => {
  const {
    currentUser,
    pendingContributionsCount,
    pendingLoansCount,
    totalCommunityFund,
    availableLiquidity,
    profiles,
    switchUser,
  } = useApp();

  const totalPending = pendingContributionsCount + pendingLoansCount;
  const isAdmin = currentUser.role === 'admin';

  const handleAdminSwitch = () => {
    if (!isAdmin) {
      // Find admin profile to switch seamlessly
      const admin = profiles.find((p) => p.role === 'admin');
      if (admin) {
        switchUser(admin.id);
      }
    }
    onChangeView('admin');
    onCloseMobile();
  };

  const handleMemberSwitch = () => {
    onChangeView('member');
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 space-y-6 text-xs">
      {/* Navigation Sections */}
      <div className="space-y-6">
        {/* Active Role Indicator */}
        <div
          className={`p-3.5 rounded-2xl border ${
            isAdmin
              ? 'bg-purple-50/70 border-purple-200 text-purple-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Active Context
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-purple-200 text-purple-900' : 'bg-emerald-200 text-emerald-900'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
          <div className="font-bold text-slate-900 mt-1 truncate">{currentUser.full_name}</div>
          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
        </div>

        {/* Member Navigation Menu */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Member Operations
          </div>
          <button
            onClick={handleMemberSwitch}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
              currentView === 'member'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Member Dashboard</span>
            </div>
            <span className="text-[10px] opacity-75">/dashboard</span>
          </button>
        </div>

        {/* Admin Navigation Menu (with RBAC enforcement) */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Admin Management
          </div>

          <button
            onClick={handleAdminSwitch}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-colors ${
              currentView === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Admin Console</span>
            </div>
            <div className="flex items-center gap-1.5">
              {totalPending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 animate-pulse">
                  {totalPending}
                </span>
              )}
              <span className="text-[10px] opacity-75">/admin</span>
            </div>
          </button>
        </div>

        {/* Architecture & SQL DDL shortcut */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Fintech Architecture
          </div>
          <button
            onClick={() => {
              onOpenSchemaModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>PostgreSQL & Prisma DDL</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              RLS
            </span>
          </button>
        </div>
      </div>

      {/* Community Treasury Solvency Gauge */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Pool Liquidity
          </span>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
            Audited
          </span>
        </div>
        <div className="text-base font-extrabold text-slate-900">
          ${availableLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Total Pool: ${totalCommunityFund.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-50">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">SACCO Menu</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
