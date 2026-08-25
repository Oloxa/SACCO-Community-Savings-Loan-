import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { X, ArrowUpRight, ShieldCheck, DollarSign, FileText, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({ isOpen, onClose }) => {
  const { addContribution, currentUser } = useApp();

  const [amount, setAmount] = useState<string>('250');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [100, 250, 500, 1000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addContribution({
        amount: numAmount,
        payment_method: paymentMethod,
        reference_code: referenceCode.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const generateQuickRef = () => {
    const prefix = paymentMethod === 'M-Pesa' ? 'MP' : paymentMethod === 'Mobile Money' ? 'MM' : 'TX';
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    setReferenceCode(`${prefix}-${rand}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="contribution-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Log Savings Contribution</h3>
              <p className="text-xs text-slate-500">Record a new deposit to your SACCO savings</p>
            </div>
          </div>
          <button
            id="close-contribution-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Member Banner */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Contributing Member: <strong className="text-slate-900">{currentUser.full_name}</strong>
            </span>
            <span className="text-emerald-700 font-medium bg-emerald-100 px-2 py-0.5 rounded">
              Verified SACCO ID
            </span>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contribution Amount ($ USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                $
              </div>
              <input
                id="contribution-amount-input"
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                    amount === amt.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Channel / Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Bank Transfer', 'Mobile Money', 'M-Pesa', 'Cash', 'Cheque'] as PaymentMethod[]).map(
                (method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      paymentMethod === method
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{method}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Reference Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Transaction Reference / Slip #
              </label>
              <button
                type="button"
                onClick={generateQuickRef}
                className="text-[11px] text-emerald-600 hover:underline font-medium"
              >
                Auto-generate Ref
              </button>
            </div>
            <input
              id="contribution-ref-input"
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="e.g. WIRE-992144 or MP-55102938"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes or Description
            </label>
            <textarea
              id="contribution-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Monthly SACCO regular installment for August"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Approval Notice Info */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              Upon submission, your contribution status will be <strong>Pending</strong>. The SACCO
              treasury admin will verify the reference code and approve it to credit your savings balance.
            </p>
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
              id="submit-contribution-btn"
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : `Submit $${parseFloat(amount || '0').toLocaleString()} Deposit`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
