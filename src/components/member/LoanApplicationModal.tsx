import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, HandCoins, Calculator, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({ isOpen, onClose }) => {
  const { applyLoan, currentUser, currentMemberSavings } = useApp();

  const [amount, setAmount] = useState<string>('1500');
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [purpose, setPurpose] = useState<string>('Small business inventory expansion');
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentSavings = currentMemberSavings?.current_balance || 0;
  const maxEligibleLimit = Math.max(1000, currentSavings * 3); // 3x multiplier
  const requestedAmount = parseFloat(amount) || 0;
  const interestRate = 5; // 5% fixed SACCO community rate
  const totalInterest = (requestedAmount * interestRate) / 100;
  const totalPayable = requestedAmount + totalInterest;
  const monthlyInstallment = durationMonths > 0 ? totalPayable / durationMonths : 0;

  const isExceedingLimit = requestedAmount > maxEligibleLimit;

  const purposeOptions = [
    'Small business inventory expansion',
    'Agricultural inputs & irrigation equipment',
    'Emergency medical / healthcare costs',
    'Education & school tuition fees',
    'Equipment purchase / technology upgrade',
    'Home improvement & solar electrification',
    'Other custom purpose',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestedAmount <= 0) return;

    const finalPurpose = purpose === 'Other custom purpose' ? customPurpose.trim() : purpose;
    if (!finalPurpose) return;

    setIsSubmitting(true);
    setTimeout(() => {
      applyLoan({
        amount_requested: requestedAmount,
        duration_months: durationMonths,
        purpose: finalPurpose,
        interest_rate: interestRate,
      });

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="loan-modal-card"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Apply for SACCO Community Loan</h3>
              <p className="text-xs text-slate-500">Low-interest peer-backed credit with flexible tenures</p>
            </div>
          </div>
          <button
            id="close-loan-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Member Collateral & Eligibility Banner */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500">Your Current Savings Collateral:</span>
              <div className="font-bold text-slate-900 text-sm">
                ${currentSavings.toLocaleString()} USD
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-slate-500">Max Recommended Borrowing (3x):</span>
              <div className="font-bold text-indigo-700 text-sm">
                ${maxEligibleLimit.toLocaleString()} USD
              </div>
            </div>
          </div>

          {/* Amount Requested */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Loan Principal Requested ($ USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                $
              </div>
              <input
                id="loan-amount-input"
                type="number"
                min="50"
                step="50"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            {isExceedingLimit && (
              <p className="flex items-center gap-1 text-xs text-amber-700 mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Note: Amount exceeds 3x savings. Approval will require additional committee guarantor review.
              </p>
            )}
          </div>

          {/* Duration in Months */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Loan Repayment Tenure: <span className="text-indigo-600 font-extrabold">{durationMonths} Months</span>
              </label>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={durationMonths}
              onChange={(e) => setDurationMonths(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1 mo</span>
              <span>6 mos</span>
              <span>12 mos</span>
              <span>18 mos</span>
              <span>24 mos</span>
            </div>
          </div>

          {/* Live Loan Calculation Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Real-Time Loan Repayment Breakdown</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px]">Interest Rate</span>
                <p className="font-bold text-slate-900 mt-0.5">{interestRate}% Flat</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px]">Total Interest</span>
                <p className="font-bold text-indigo-600 mt-0.5">${totalInterest.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px]">Total Payable</span>
                <p className="font-bold text-slate-900 mt-0.5">${totalPayable.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 text-[11px] font-semibold">Monthly Installment</span>
                <p className="font-extrabold text-emerald-800 mt-0.5">
                  ${monthlyInstallment.toFixed(2)}/mo
                </p>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Loan Purpose & Utilization Plan <span className="text-rose-500">*</span>
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {purposeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {purpose === 'Other custom purpose' && (
              <textarea
                rows={2}
                value={customPurpose}
                onChange={(e) => setCustomPurpose(e.target.value)}
                placeholder="Specify your exact loan purpose and payback plan..."
                className="w-full mt-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-loan-app-btn"
              type="submit"
              disabled={isSubmitting || requestedAmount <= 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : `Submit Application ($${requestedAmount.toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
