import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Download, ArrowDownLeft, ArrowUpRight, Filter, Receipt, ShieldCheck } from 'lucide-react';

export const GlobalAuditLedger: React.FC = () => {
  const { transactions, profiles } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    const member = profiles.find((p) => p.id === tx.profile_id);
    const memberName = member?.full_name || '';

    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesDirection = filterDirection === 'all' || tx.direction === filterDirection;
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      memberName.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.amount.toString().includes(search);

    return matchesType && matchesDirection && matchesSearch;
  });

  const totalCredits = filtered
    .filter((t) => t.direction === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = filtered
    .filter((t) => t.direction === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const exportCSV = () => {
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Member ID',
      'Member Name',
      'Type',
      'Direction',
      'Amount (USD)',
      'Description',
      'Reference ID',
    ];

    const rows = filtered.map((tx) => {
      const member = profiles.find((p) => p.id === tx.profile_id);
      return [
        tx.id,
        new Date(tx.created_at).toISOString(),
        tx.profile_id,
        `"${member?.full_name || 'N/A'}"`,
        tx.type,
        tx.direction,
        tx.amount,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.reference_id || '',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sacco-global-audit-ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sacco-global-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Global SACCO Financial Ledger</h2>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable Double-Entry Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete cryptographic audit trail of all capital inflows, loan disbursements, and member settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Filtered Total Inflows (Credits)
          </span>
          <div className="text-xl font-extrabold text-emerald-950 mt-0.5">
            +${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            Filtered Total Outflows (Debits)
          </span>
          <div className="text-xl font-extrabold text-rose-950 mt-0.5">
            -${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Ledger Entries
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">
            {filtered.length} Recorded Movements
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by member, description, ID, amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="contribution">Contributions</option>
            <option value="loan_disbursement">Disbursements</option>
            <option value="loan_repayment">Repayments</option>
            <option value="manual_adjustment">Adjustments</option>
          </select>

          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Credit & Debit</option>
            <option value="credit">Credits (Inflows)</option>
            <option value="debit">Debits (Outflows)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Flow</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Ledger Narration</th>
                <th className="py-3 px-4">Amount ($)</th>
                <th className="py-3 px-4 text-right">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => {
                const member = profiles.find((p) => p.id === tx.profile_id);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      {tx.direction === 'credit' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          <span>CREDIT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px]">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          <span>DEBIT</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            member?.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={member?.full_name || 'Member'}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900">
                          {member?.full_name || 'SACCO General Treasury'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 capitalize">
                      {tx.type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate font-medium">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3 px-4 font-extrabold text-sm ${
                        tx.direction === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {tx.direction === 'credit' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-right whitespace-nowrap font-mono text-[11px]">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
