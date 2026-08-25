import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Loan } from '../../types';
import { X, CheckCircle2, DollarSign, ArrowDownLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoanRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoan?: Loan | null;
}

export const LoanRepaymentModal: React.FC<LoanRepaymentModalProps> = ({
  isOpen,
  onClose,
  selectedLoan,
}) => {
  const { repayLoan, currentMemberLoans } = useApp();

  const activeLoans = currentMemberLoans.filter(
    (l) => l.status === 'disbursed' && l.remaining_balance > 0
  );

  const defaultLoan = selectedLoan || activeLoans[0];
  const [loanId, setLoanId] = useState<string>(defaultLoan?.id || '');
  const [amount, setAmount] = useState<string>(
    defaultLoan ? defaultLoan.monthly_installment.toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentActiveLoan = activeLoans.find((l) => l.id === loanId) || activeLoans[0];

  const handleLoanSelect = (id: string) => {
    setLoanId(id);
    const target = activeLoans.find((l) => l.id === id);
    if (target) {
      setAmount(Math.min(target.monthly_installment, target.remaining_balance).toString());
    }
  };

  const handlePayFull = () => {
    if (currentActiveLoan) {
      setAmount(currentActiveLoan.remaining_balance.toString());
    }
  };

  const handlePayInstallment = () => {
    if (currentActiveLoan) {
      setAmount(
        Math.min(currentActiveLoan.monthly_installment, currentActiveLoan.remaining_balance).toString()
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!currentActiveLoan || isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      repayLoan(currentActiveLoan.id, numAmount);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="loan-repay-modal-card"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Make Loan Repayment</h3>
              <p className="text-xs text-slate-500">Pay down your SACCO loan balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">No Active Loans Due</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You currently do not have any active loans with a remaining balance.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Select Loan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Active Loan
              </label>
              <select
                value={currentActiveLoan?.id}
                onChange={(e) => handleLoanSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {activeLoans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    Loan #{loan.id.slice(-6)} - {loan.purpose} (Due: ${loan.remaining_balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Loan Card */}
            {currentActiveLoan && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Balance:</span>
                  <span className="font-bold text-rose-600">
                    ${currentActiveLoan.remaining_balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Installment:</span>
                  <span className="font-bold text-slate-900">
                    ${currentActiveLoan.monthly_installment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid So Far:</span>
                  <span className="font-bold text-emerald-600">
                    ${currentActiveLoan.total_paid.toFixed(2)} / ${currentActiveLoan.total_payable.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Repayment Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Amount ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  $
                </div>
                <input
                  type="number"
                  min="1"
                  max={currentActiveLoan?.remaining_balance}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick action buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePayInstallment}
                  className="text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Pay Monthly Due (${currentActiveLoan?.monthly_installment.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-xs font-semibold px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                >
                  Pay Full Balance (${currentActiveLoan?.remaining_balance.toFixed(2)})
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : `Pay $${parseFloat(amount || '0').toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
