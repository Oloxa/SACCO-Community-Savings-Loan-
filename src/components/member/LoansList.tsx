import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Loan } from '../../types';
import { HandCoins, Plus, Calendar, DollarSign, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoansListProps {
  onOpenLoanModal: () => void;
  onOpenRepayModal: (loan?: Loan) => void;
}

export const LoansList: React.FC<LoansListProps> = ({ onOpenLoanModal, onOpenRepayModal }) => {
  const { currentMemberLoans, currentMemberSavings } = useApp();
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(null);

  const activeLoans = currentMemberLoans.filter((l) => l.status === 'disbursed');
  const pendingLoans = currentMemberLoans.filter((l) => l.status === 'pending');
  const completedLoans = currentMemberLoans.filter((l) => l.status === 'completed');

  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.remaining_balance, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Active Loan Balance</span>
            <div className="text-xl font-extrabold text-indigo-900 mt-0.5">
              ${totalOutstanding.toFixed(2)}
            </div>
          </div>
          <HandCoins className="w-6 h-6 text-indigo-600" />
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</span>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">
              {pendingLoans.length} Applications
            </div>
          </div>
          <Calendar className="w-6 h-6 text-amber-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SACCO Credit Actions</span>
            <div className="text-xs text-slate-500 mt-0.5">5% fixed community rate</div>
          </div>
          <button
            onClick={onOpenLoanModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      {/* Loans Cards / List */}
      {currentMemberLoans.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <HandCoins className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Loans on Record</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have any active or past loans. SACCO members in good standing are eligible for low-interest loans up to 3x their savings.
          </p>
          <button
            onClick={onOpenLoanModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for a Loan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentMemberLoans.map((loan) => {
            const progressPercent =
              loan.total_payable > 0
                ? Math.min(100, Math.round((loan.total_paid / loan.total_payable) * 100))
                : 0;

            return (
              <div
                key={loan.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                      <HandCoins className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          Loan #{loan.id.slice(-6).toUpperCase()}
                        </h4>
                        <StatusBadge status={loan.status} type="loan" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{loan.purpose}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:text-right">
                    {loan.status === 'disbursed' && loan.remaining_balance > 0 && (
                      <button
                        onClick={() => onOpenRepayModal(loan)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pay Installment</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLoanDetails(loan)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>

                {/* Loan Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[11px] block">Principal</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ${loan.amount_requested.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[11px] block">Monthly Due</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ${loan.monthly_installment.toFixed(2)}/mo
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[11px] block">Remaining Balance</span>
                    <span className="font-bold text-rose-600 text-sm">
                      ${loan.remaining_balance.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[11px] block">Tenure / Term</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {loan.duration_months} Months (5%)
                    </span>
                  </div>
                </div>

                {/* Repayment Progress Bar */}
                {loan.status === 'disbursed' || loan.status === 'completed' ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">
                        Paid: ${loan.total_paid.toFixed(2)} of ${loan.total_payable.toFixed(2)}
                      </span>
                      <span className="text-indigo-600">{progressPercent}% Settled</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          loan.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : loan.status === 'pending' ? (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
                    <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Application under Credit Committee review. Submitted on{' '}
                      {new Date(loan.created_at).toLocaleDateString()}.
                    </span>
                  </div>
                ) : loan.status === 'rejected' ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Application Declined</strong>
                      <span>{loan.rejection_reason || 'Did not satisfy credit requirements.'}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Loan Details Modal */}
      {selectedLoanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-sm">
                Loan Contract Schedule #{selectedLoanDetails.id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedLoanDetails(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Principal Requested:</span>
                <span className="font-bold text-slate-900">
                  ${selectedLoanDetails.amount_requested.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Interest (5% Fixed):</span>
                <span className="font-bold text-indigo-600">
                  ${((selectedLoanDetails.amount_requested * selectedLoanDetails.interest_rate) / 100).toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Payable:</span>
                <span className="font-bold text-slate-900">
                  ${selectedLoanDetails.total_payable.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-bold text-rose-600">
                  ${selectedLoanDetails.remaining_balance.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Monthly Installment:</span>
                <span className="font-bold text-emerald-700">
                  ${selectedLoanDetails.monthly_installment.toFixed(2)} / month
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Application Date:</span>
                <span className="text-slate-800">
                  {new Date(selectedLoanDetails.created_at).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-semibold mb-1">Stated Purpose:</span>
                <p className="text-slate-800">{selectedLoanDetails.purpose}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              {selectedLoanDetails.status === 'disbursed' && selectedLoanDetails.remaining_balance > 0 && (
                <button
                  onClick={() => {
                    const loan = selectedLoanDetails;
                    setSelectedLoanDetails(null);
                    onOpenRepayModal(loan);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Pay Installment
                </button>
              )}
              <button
                onClick={() => setSelectedLoanDetails(null)}
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
