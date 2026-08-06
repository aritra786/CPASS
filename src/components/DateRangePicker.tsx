import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // Format: YYYY-MM-DD or DD/MM/YYYY
  endDate: string;
  onChange: (start: string, end: string, label?: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Local state for start and end input dates
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [selectedPreset, setSelectedPreset] = useState('Last 30 Days');

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateLabel = (dStr: string) => {
    if (!dStr) return '';
    if (dStr.includes('/')) return dStr;
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  const applyPreset = (presetLabel: string) => {
    const today = new Date('2026-08-06');
    let s = new Date(today);
    let e = new Date(today);

    if (presetLabel === 'Today') {
      // same
    } else if (presetLabel === 'Yesterday') {
      s.setDate(today.getDate() - 1);
      e.setDate(today.getDate() - 1);
    } else if (presetLabel === 'Last 7 Days') {
      s.setDate(today.getDate() - 6);
    } else if (presetLabel === 'Last 30 Days') {
      s.setDate(today.getDate() - 29);
    } else if (presetLabel === 'This Month') {
      s = new Date(2026, 7, 1); // August 1, 2026
    }

    const startFormatted = s.toISOString().split('T')[0];
    const endFormatted = e.toISOString().split('T')[0];

    setTempStart(startFormatted);
    setTempEnd(endFormatted);
    setSelectedPreset(presetLabel);
    onChange(startFormatted, endFormatted, presetLabel);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (!tempStart || !tempEnd) return;
    setSelectedPreset('Custom Range');
    onChange(tempStart, tempEnd, 'Custom Range');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 rounded-xl px-3 py-1.5 shadow-2xs text-xs font-semibold text-slate-700 transition-colors focus:outline-hidden"
      >
        <CalendarIcon className="w-4 h-4 text-blue-600" />
        <span>
          {formatDateLabel(tempStart)} - {formatDateLabel(tempEnd)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Date Range</span>
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Buttons Grid */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Presets
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors flex items-center justify-between ${
                    selectedPreset === preset
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{preset}</span>
                  {selectedPreset === preset && <Check className="w-3 h-3 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Selectors */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Custom Calendar Selection
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCustomApply}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Apply Custom Range
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
