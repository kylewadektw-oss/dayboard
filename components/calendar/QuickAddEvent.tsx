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

"use client";

import { useState, useCallback, memo, useMemo } from "react";
import { Plus, Calendar, Clock, MapPin, Palette, X } from "lucide-react";

interface QuickAddEventProps {
  selectedDate?: Date | null;
  onEventCreated?: () => void;
  onCancel?: () => void;
  inline?: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green  
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#10b981', // emerald
  '#f97316', // orange
];

// 🚀 PERFORMANCE: Memoized component
function QuickAddEventComponent({ 
  selectedDate, 
  onEventCreated, 
  onCancel,
  inline = false 
}: QuickAddEventProps) {
  const [isOpen, setIsOpen] = useState(inline);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🚀 PERFORMANCE: Memoize initial form data calculation
  const initialFormData = useMemo((): EventFormData => {
    const defaultDate = selectedDate || new Date();
    const dateStr = defaultDate.toISOString().split('T')[0];
    const timeStr = formatTimeForInput(defaultDate);
    
    return {
      title: '',
      description: '',
      location: '',
      date: dateStr,
      startTime: timeStr,
      endTime: addHour(timeStr),
      allDay: false,
      color: PRESET_COLORS[0],
    };
  }, [selectedDate]);

  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setError(null);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Construct start and end timestamps
      let startTs: string;
      let endTs: string;

      if (formData.allDay) {
        // All-day events: use date only
        startTs = `${formData.date}T00:00:00`;
        endTs = `${formData.date}T23:59:59`;
      } else {
        // Timed events: combine date and time
        startTs = `${formData.date}T${formData.startTime}:00`;
        endTs = `${formData.date}T${formData.endTime}:00`;
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        start_ts: startTs,
        end_ts: endTs,
        all_day: formData.allDay,
        color: formData.color,
      };

      const response = await fetch('/api/calendar/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Event created:', result.event);

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: formData.date, // Keep selected date
        startTime: formData.startTime,
        endTime: formData.endTime,
        allDay: false,
        color: PRESET_COLORS[0],
      });
      
      // Close form if not inline
      if (!inline) {
        setIsOpen(false);
      }

      // Notify parent component
      if (onEventCreated) {
        onEventCreated();
      }
      
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, inline, onEventCreated]);

  const updateField = useCallback((field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // If not inline and not open, show the trigger button
  if (!inline && !isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Event
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-lg ${inline ? '' : 'border border-gray-200 shadow-lg'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Add Event</h3>
        </div>
        {!inline && (
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="What's happening?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Additional details..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="Where is it happening?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* All Day Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allDay"
            checked={formData.allDay}
            onChange={(e) => updateField('allDay', e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="allDay" className="text-sm text-gray-700">
            All day event
          </label>
        </div>

        {/* Time Fields (hidden if all-day) */}
        {!formData.allDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        )}

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette className="inline h-4 w-4 mr-1" />
            Color
          </label>
          <div className="flex gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => updateField('color', color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex gap-3 pt-2 ${inline ? 'justify-end' : ''}`}>
          {!inline && (
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

// 🚀 PERFORMANCE: Memoize the component
const QuickAddEvent = memo(QuickAddEventComponent);
export default QuickAddEvent;

// Helper functions
function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5); // "HH:MM"
}

function addHour(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newHours = (hours + 1) % 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}