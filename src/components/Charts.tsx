import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { AppSettings } from '../types';

interface DonutSlice {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: DonutSlice[];
  total: number;
  settings: AppSettings;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, total, settings }) => {
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mb-2">
          <span className="text-xs">0%</span>
        </div>
        <p className="text-xs">No expense data for this period</p>
      </div>
    );
  }

  // Calculate SVG stroke dashes
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-40 h-40 shrink-0">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="20"
            fill="transparent"
          />
          {data.map((slice, i) => {
            const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (slice.percentage / 100) * circumference;

            return (
              <circle
                key={slice.name}
                cx="80"
                cy="80"
                r={radius}
                stroke={slice.color}
                strokeWidth="20"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
            {formatCurrency(total, settings)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(item.amount, settings)}
              </span>
              <span className="text-slate-400 text-[11px] w-8 text-right font-mono">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BarItem {
  label: string;
  amount: number;
  isHighlight?: boolean;
}

interface BarChartProps {
  items: BarItem[];
  settings: AppSettings;
  onBarClick?: (index: number) => void;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({ items, settings, onBarClick }) => {
  const max = Math.max(...items.map((i) => i.amount), 1);

  return (
    <div className="w-full">
      <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-1">
        {items.map((item, idx) => {
          const heightPercent = Math.max(Math.round((item.amount / max) * 100), 4);
          return (
            <div
              key={idx}
              onClick={() => onBarClick && onBarClick(idx)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                {item.amount > 0 ? formatCurrency(item.amount, settings) : ''}
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                  item.isHighlight
                    ? 'bg-emerald-500 shadow-md shadow-emerald-500/20'
                    : item.amount > 0
                    ? 'bg-emerald-400/70 hover:bg-emerald-500 dark:bg-emerald-600/70'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
