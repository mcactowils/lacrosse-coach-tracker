'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TapCounterProps {
  label: string;
  count: number;
  color: string;
  onIncrement: () => void;
  onDecrement?: () => void;
  disabled?: boolean;
  className?: string;
}

export function TapCounter({
  label,
  count,
  color,
  onIncrement,
  onDecrement,
  disabled = false,
  className
}: TapCounterProps) {
  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      {/* Label */}
      <div className="text-center">
        <h3 className="font-semibold text-lg text-gray-900">{label}</h3>
      </div>

      {/* Count Display */}
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center border-4",
        color,
        "text-white font-bold text-2xl"
      )}>
        {count}
      </div>

      {/* Buttons */}
      <div className="flex items-center space-x-2">
        {onDecrement && count > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDecrement}
            disabled={disabled}
            className="w-10 h-10 rounded-full p-0"
          >
            -
          </Button>
        )}

        <Button
          onClick={onIncrement}
          disabled={disabled}
          className={cn(
            "w-16 h-16 rounded-full font-bold text-xl",
            color.replace('bg-', 'bg-').replace('border-', 'hover:bg-'),
            "hover:scale-105 transition-transform"
          )}
        >
          +
        </Button>

        {count > 0 && (
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="text-sm text-gray-500">{count}</span>
          </div>
        )}
      </div>
    </div>
  );
}