/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Save,
  Trash2,
  Copy,
  AlertCircle
} from 'lucide-react';

interface FeedEvent {
  event_id: string;
  household_id: string;
  kind: 'manual' | 'meal' | 'list_item' | 'project_task';
  title: string;
  description?: string;
  location?: string;
  start_ts: string;
  end_ts: string;
  all_day: boolean;
  color?: string;
  link_href?: string;
  meta?: unknown;
}

interface EventModalProps {
  event: FeedEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: FeedEvent) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  onDuplicate: (event: FeedEvent) => Promise<void>;
}

export default function EventModal({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete
  // onDuplicate feature not yet implemented
}: EventModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FeedEvent>>({});

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        // Convert dates to local format for editing
        start_ts: formatDateForInput(event.start_ts),
        end_ts: formatDateForInput(event.end_ts)
      });
      setIsEditing(false);
      setError(null);
    }
  }, [event]);

  // Format date for datetime-local input
  const formatDateForInput = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format date for display
  const formatDateForDisplay = (isoString: string): string => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle form submission
  const handleSave = async () => {
    if (!formData || !event) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert datetime-local back to ISO string
      const updatedEvent: FeedEvent = {
        ...event,
        ...formData,
        start_ts: new Date(formData.start_ts || event.start_ts).toISOString(),
        end_ts: new Date(formData.end_ts || event.end_ts).toISOString()
      };

      await onSave(updatedEvent);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!event || !confirm('Are you sure you want to delete this event?'))
      return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(event.event_id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = () => {
    if (!event) return;

    const duplicatedEvent = {
      ...event,
      event_id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${event.title} (Copy)`,
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000) // 1 hour later
    };

    onSave(duplicatedEvent);
    setIsEditing(false);
  };

  // Get event type color
  const getEventTypeColor = (kind: string): string => {
    switch (kind) {
      case 'manual':
        return 'bg-blue-100 text-blue-800';
      case 'meal':
        return 'bg-green-100 text-green-800';
      case 'list_item':
        return 'bg-purple-100 text-purple-800';
      case 'project_task':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Event' : 'Event Details'}
            </h2>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.kind)}`}
            >
              {event.kind.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event title"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{event.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event description"
              />
            ) : (
              <p className="text-gray-700">
                {event.description || 'No description'}
              </p>
            )}
          </div>

          {/* Dates and Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={formData.start_ts || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, start_ts: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-700">
                  {formatDateForDisplay(event.start_ts)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                End Time
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={formData.end_ts || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, end_ts: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-700">
                  {formatDateForDisplay(event.end_ts)}
                </p>
              )}
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.all_day ?? event.all_day}
                onChange={(e) =>
                  setFormData({ ...formData, all_day: e.target.checked })
                }
                disabled={!isEditing}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">All day event</span>
            </label>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event location"
              />
            ) : (
              <p className="text-gray-700">
                {event.location || 'No location specified'}
              </p>
            )}
          </div>

          {/* Color */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {[
                  '#3b82f6',
                  '#22c55e',
                  '#60a5fa',
                  '#a855f7',
                  '#f59e0b',
                  '#ef4444',
                  '#8b5cf6'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      (formData.color || event.color) === color
                        ? 'border-gray-800'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Link */}
          {event.link_href && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Link
              </label>
              <a
                href={event.link_href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {event.link_href}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={handleDuplicate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>

            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ ...event });
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Edit className="w-4 h-4" />
                Edit Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
