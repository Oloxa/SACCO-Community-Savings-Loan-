/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { MemberDashboard } from './components/member/MemberDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { SchemaViewerModal } from './components/admin/SchemaViewerModal';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Lock, Sparkles, ArrowRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, switchUser, profiles } = useApp();
  const [currentView, setCurrentView] = useState<'member' | 'admin'>('member');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onChangeView={setCurrentView}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentView === 'member' ? (
              <motion.div
                key="member-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <MemberDashboard />
              </motion.div>
            ) : isAdmin ? (
              <motion.div
                key="admin-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <AdminDashboard />
              </motion.div>
            ) : (
              /* RBAC Protection Gate */
              <motion.div
                key="admin-restricted"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-md mx-auto my-12 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Administrative Access Restricted
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/admin</code> route
                  requires the <strong className="text-slate-900">Admin</strong> role. Your current session is
                  logged in as <strong className="text-slate-900">{currentUser.full_name}</strong> (Member).
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const admin = profiles.find((p) => p.role === 'admin');
                      if (admin) {
                        switchUser(admin.id);
                      }
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Switch to Sarah Chen (SACCO Admin)
                  </button>
                  <button
                    onClick={() => setCurrentView('member')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Return to Member Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SchemaViewerModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      {/* Real-time Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
