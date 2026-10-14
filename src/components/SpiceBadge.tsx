import React from 'react';
import { Flame } from 'lucide-react';
import type { SpiceLevel } from '../types';

interface Props {
  level: SpiceLevel;
  size?: 'sm' | 'md';
}

export const SpiceBadge: React.FC<Props> = ({ level, size = 'sm' }) => {
  const config: Record<SpiceLevel, { bg: string; text: string; flames: number }> = {
    Mild: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      text: 'Mild',
      flames: 1,
    },
    Medium: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      text: 'Medium',
      flames: 2,
    },
    Hot: {
      bg: 'bg-orange-50 border-orange-200 text-orange-700',
      text: 'Hot',
      flames: 3,
    },
    'Extra Hot': {
      bg: 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse',
      text: 'Extra Hot',
      flames: 4,
    },
  };

  const item = config[level] || config.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded-full px-2 py-0.5 ${
        size === 'sm' ? 'text-[11px]' : 'text-xs'
      } ${item.bg}`}
      title={`Spice Level: ${level}`}
    >
      <span className="flex items-center -space-x-1">
        {Array.from({ length: item.flames }).map((_, i) => (
          <Flame key={i} className={`w-3 h-3 ${level === 'Extra Hot' ? 'fill-rose-600 text-rose-600' : 'fill-current'}`} />
        ))}
      </span>
      <span>{item.text}</span>
    </span>
  );
};
