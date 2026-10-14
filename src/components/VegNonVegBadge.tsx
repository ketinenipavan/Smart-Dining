import React from 'react';

interface Props {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VegNonVegBadge: React.FC<Props> = ({ isVeg, size = 'md', showLabel = false }) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 p-0.5',
    md: 'w-4 h-4 p-0.5',
    lg: 'w-5 h-5 p-1',
  };

  const innerDotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`flex items-center justify-center rounded-[3px] bg-white border ${
          isVeg ? 'border-emerald-600' : 'border-rose-600'
        } ${sizeClasses[size]}`}
        title={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
      >
        {isVeg ? (
          <div className={`rounded-full bg-emerald-600 ${innerDotSize[size]}`} />
        ) : (
          <div
            className={`w-0 h-0 border-l-[3.5px] border-r-[3.5px] border-b-[7px] border-l-transparent border-r-transparent border-b-rose-600`}
          />
        )}
      </div>
      {showLabel && (
        <span className={`font-semibold tracking-wide text-xs ${isVeg ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isVeg ? 'VEG' : 'NON-VEG'}
        </span>
      )}
    </div>
  );
};
