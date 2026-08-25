import React from 'react';
import { ContributionStatus, LoanStatus, UserRole, UserStatus } from '../../types';

interface StatusBadgeProps {
  status: ContributionStatus | LoanStatus | UserStatus | UserRole | string;
  type?: 'contribution' | 'loan' | 'user' | 'role';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disbursed':
      case 'completed':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10';
      case 'rejected':
      case 'suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/10';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-600/10';
      case 'member':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-600/10';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDotStyle = () => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disbursed':
      case 'completed':
      case 'active':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-amber-500 animate-pulse';
      case 'rejected':
      case 'suspended':
        return 'bg-rose-500';
      case 'admin':
        return 'bg-purple-500';
      case 'member':
        return 'bg-sky-500';
      default:
        return 'bg-slate-400';
    }
  };

  const formatText = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${getBadgeStyle()} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
      <span className="capitalize">{formatText(status)}</span>
    </span>
  );
};
