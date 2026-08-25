import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Users,
  Shield,
  RotateCcw,
  Menu,
  ChevronDown,
  Sparkles,
  Database,
  LogIn,
  Check,
  Clock,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenAuthModal: () => void;
  onOpenSchemaModal: () => void;
  currentView: 'member' | 'admin';
  onChangeView: (view: 'member' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenAuthModal,
  onOpenSchemaModal,
  currentView,
  onChangeView,
}) => {
  const {
    currentUser,
    profiles,
    switchUser,
    resetToDefaultData,
    pendingContributionsCount,
    pendingLoansCount,
  } = useApp();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const totalPending = pendingContributionsCount + pendingLoansCount;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  SACCO Savings
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ROSCA MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Community Savings & Peer Credit Ledger
              </p>
            </div>
          </div>
        </div>

        {/* Center: View Switcher Tabs (Member vs Admin) */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => onChangeView('member')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'member'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Member Portal</span>
          </button>

          <button
            onClick={() => {
              if (currentUser.role !== 'admin') {
                // Auto switch to admin Sarah Chen or inform
                const adminProfile = profiles.find((p) => p.role === 'admin');
                if (adminProfile) {
                  switchUser(adminProfile.id);
                }
              }
              onChangeView('admin');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
            {totalPending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Right: Quick User Switcher Dropdown, Reset, Schema */}
        <div className="flex items-center gap-2">
          {/* Schema Button */}
          <button
            onClick={onOpenSchemaModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Inspect PostgreSQL & Prisma Schema"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Schema</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetToDefaultData}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Reset all balances, contributions, and loans to seed data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* User Profile / Fast Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all text-left"
            >
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="hidden md:block pr-1">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] font-extrabold uppercase text-emerald-700">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Session
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Test different Member and Admin capabilities instantly:
                  </p>
                </div>

                <div className="p-1 space-y-0.5 max-h-60 overflow-y-auto">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchUser(p.id);
                        if (p.role === 'admin') onChangeView('admin');
                        setIsUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        p.id === currentUser.id
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={p.full_name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-slate-900">{p.full_name}</div>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              p.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.role}
                          </span>
                        </div>
                      </div>
                      {p.id === currentUser.id && (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Register New Member Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      resetToDefaultData();
                    }}
                    className="w-full py-1.5 text-[11px] text-slate-500 hover:text-rose-600 transition-colors text-center"
                  >
                    Reset Demo State to Initial Seeds
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
