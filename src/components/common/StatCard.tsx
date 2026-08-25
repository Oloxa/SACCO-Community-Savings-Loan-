import React, { ReactNode } from 'react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: 'emerald' | 'amber' | 'indigo' | 'purple' | 'slate';
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = 'slate',
  onClick,
  badge,
}) => {
  const getIconBackground = () => {
    switch (highlight) {
      case 'emerald':
        return 'bg-emerald-100 text-emerald-700';
      case 'amber':
        return 'bg-amber-100 text-amber-700';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-700';
      case 'purple':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getBorderHover = () => {
    if (!onClick) return 'border-slate-200';
    switch (highlight) {
      case 'emerald':
        return 'border-slate-200 hover:border-emerald-300 hover:shadow-md cursor-pointer';
      case 'amber':
        return 'border-slate-200 hover:border-amber-300 hover:shadow-md cursor-pointer';
      case 'indigo':
        return 'border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer';
      default:
        return 'border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${getBorderHover()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{title}</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
            {value}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className={`p-2.5 rounded-xl ${getIconBackground()}`}>{icon}</div>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
              {badge}
            </span>
          )}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto ${
                trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
