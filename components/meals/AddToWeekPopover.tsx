/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { useState } from 'react';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;
const SLOTS = ['breakfast','lunch','dinner'] as const;

interface AddToWeekPopoverProps {
  onPick: (selection: { dayIdx: number; slot: string }) => void;
  onClose?: () => void;
  className?: string;
}

export function AddToWeekPopover({ onPick, onClose, className = '' }: AddToWeekPopoverProps) {
  const [dayIdx, setDayIdx] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [slot, setSlot] = useState<typeof SLOTS[number]>('dinner');

  const handleAdd = () => {
    onPick({ dayIdx, slot });
    onClose?.();
  };

  const today = new Date();
  const currentDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

  return (
    <div className={`w-64 p-3 rounded-xl border bg-white shadow-lg z-50 ${className}`}>
      <div className="text-sm font-medium mb-3 text-gray-900">Schedule this meal</div>
      
      {/* Day Selection */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {DAYS.map((d, i) => {
          const isToday = i === currentDayIdx;
          const isSelected = i === dayIdx;
          
          return (
            <button
              key={d}
              onClick={() => setDayIdx(i)}
              className={`text-xs py-2 px-1 rounded transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isToday
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium">{d}</div>
              {isToday && !isSelected && (
                <div className="text-[10px] text-indigo-600 mt-0.5">Today</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Meal Slot Selection */}
      <div className="mb-4">
        <div className="text-xs text-gray-600 mb-2">Meal type</div>
        <div className="flex gap-2">
          {SLOTS.map(s => {
            const isSelected = s === slot;
            
            return (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all flex-1 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">Adding to:</div>
        <div className="text-sm font-medium text-gray-900">
          {DAYS[dayIdx]} {slot[0].toUpperCase() + slot.slice(1)}
        </div>
        {dayIdx === currentDayIdx && (
          <div className="text-xs text-indigo-600">Today</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="flex-1 h-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          Add to Week
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 h-9 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}