import React, { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, HandCoins, ArrowRight } from 'lucide-react';

export const SavingsCalculator: React.FC<{ onApplyLoan: () => void; onDeposit: () => void }> = ({
  onApplyLoan,
  onDeposit,
}) => {
  const [monthlyContribution, setMonthlyContribution] = useState<number>(200);
  const [timelineMonths, setTimelineMonths] = useState<number>(12);
  const [dividendRate] = useState<number>(6.5); // 6.5% annual SACCO dividend payout estimate

  const totalDeposited = monthlyContribution * timelineMonths;
  const estimatedDividends = (totalDeposited * (dividendRate / 100) * (timelineMonths / 12)) / 2;
  const futureNestEgg = totalDeposited + estimatedDividends;
  const futureBorrowingLimit = futureNestEgg * 3;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">SACCO Growth & Borrowing Calculator</h3>
          <p className="text-xs text-slate-500">
            Simulate your community wealth accumulation and credit multiplier over time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span>Target Monthly Savings</span>
              <span className="text-emerald-700 font-extrabold text-sm">${monthlyContribution}/mo</span>
            </div>
            <input
              type="range"
              min="25"
              max="2000"
              step="25"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>$25</span>
              <span>$500</span>
              <span>$1,000</span>
              <span>$2,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span>Time Horizon (Months)</span>
              <span className="text-indigo-700 font-extrabold text-sm">{timelineMonths} Months</span>
            </div>
            <input
              type="range"
              min="3"
              max="36"
              step="3"
              value={timelineMonths}
              onChange={(e) => setTimelineMonths(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>3 mos</span>
              <span>12 mos</span>
              <span>24 mos</span>
              <span>36 mos</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Annual Dividend Yield Rate:</span>
              <span className="font-bold text-emerald-600">~{dividendRate}% p.a.</span>
            </div>
            <div className="flex justify-between">
              <span>SACCO Peer Loan Multiplier:</span>
              <span className="font-bold text-indigo-600">3.0x Collateral</span>
            </div>
          </div>
        </div>

        {/* Forecasted Results */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Projected Personal Savings
            </span>
            <div className="text-3xl font-extrabold tracking-tight mt-1 text-white">
              ${futureNestEgg.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Principal: ${totalDeposited.toLocaleString()} + Est. Dividends: ${estimatedDividends.toFixed(0)}
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[11px] text-indigo-300 font-semibold block">
              Unlocked SACCO Loan Line:
            </span>
            <div className="text-xl font-bold text-indigo-400">
              Up to ${futureBorrowingLimit.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
            </div>
            <p className="text-[11px] text-slate-400">
              Guaranteed borrowing capacity without commercial bank red tape.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDeposit}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Start Saving
            </button>
            <button
              onClick={onApplyLoan}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Apply Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
