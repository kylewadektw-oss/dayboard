/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Feedback Dashboard - Admin interface for managing user feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Filter, 
  Search, 
  Eye, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Bug,
  Lightbulb,
  Zap,
  Frown,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Monitor,
  Smartphone,
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserFeedback, 
  FeedbackStatus, 
  FeedbackType, 
  FeedbackPriority,
  FEEDBACK_TYPES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES
} from '@/types/feedback';

interface FeedbackLogEntry {
  id: string;
  user_id: string;
  message: string;
  data: {
    feedback_type: FeedbackType;
    priority: FeedbackPriority;
    status: FeedbackStatus;
    title: string;
    description: string;
    steps_to_reproduce?: string;
    expected_behavior?: string;
    actual_behavior?: string;
    browser_info?: any;
    screen_resolution?: string;
    user_agent?: string;
    page_url?: string;
    page_title?: string;
    admin_response?: string;
    responded_at?: string;
  };
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const FEEDBACK_ICONS = {
  bug: Bug,
  feature_request: Lightbulb,
  improvement: Zap,
  complaint: Frown,
  compliment: ThumbsUp,
  other: MessageCircle
};

const STATUS_ICONS = {
  submitted: Clock,
  in_review: Eye,
  responded: CheckCircle,
  closed: CheckCircle,
  open: AlertTriangle
};

const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  urgent: 'text-red-600 bg-red-100'
};

export default function FeedbackDashboard() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackLogEntry[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackLogEntry | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<FeedbackPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Response form
  const [adminResponse, setAdminResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState<FeedbackStatus>('responded');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, statusFilter, typeFilter, priorityFilter, searchTerm]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback');
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      } else {
        console.error('Failed to fetch feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = feedback;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.data.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.data.feedback_type === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(f => f.data.priority === priorityFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.data.title.toLowerCase().includes(term) ||
        f.data.description.toLowerCase().includes(term) ||
        f.profiles.first_name.toLowerCase().includes(term) ||
        f.profiles.last_name.toLowerCase().includes(term) ||
        f.profiles.email.toLowerCase().includes(term)
      );
    }

    setFilteredFeedback(filtered);
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: FeedbackStatus, response?: string) => {
    try {
      setSubmittingResponse(true);
      
      const updateResponse = await fetch(`/api/feedback?id=${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          admin_response: response || null
        }),
      });

      if (updateResponse.ok) {
        await fetchFeedback();
        setSelectedFeedback(null);
        setAdminResponse('');
      } else {
        console.error('Failed to update feedback');
        alert('Failed to update feedback');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Error updating feedback');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (browserInfo: any) => {
    if (!browserInfo?.device) return Monitor;
    if (browserInfo.device === 'Mobile') return Smartphone;
    if (browserInfo.device === 'Tablet') return Smartphone;
    return Monitor;
  };

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">You need to be logged in to view feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="h-8 w-8 mr-3 text-indigo-600" />
          Feedback Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Manage and respond to user feedback
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search feedback..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              {FEEDBACK_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FeedbackType | 'all')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              {FEEDBACK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as FeedbackPriority | 'all')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              {FEEDBACK_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
          <p className="mt-4 text-gray-500">Loading feedback...</p>
        </div>
      )}

      {/* Feedback List */}
      {!loading && (
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No feedback has been submitted yet'
                }
              </p>
            </div>
          ) : (
            filteredFeedback.map((item) => {
              const TypeIcon = FEEDBACK_ICONS[item.data.feedback_type];
              const StatusIcon = STATUS_ICONS[item.data.status];
              const DeviceIcon = getDeviceIcon(item.data.browser_info);
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          <TypeIcon className="h-5 w-5 text-gray-600" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[item.data.priority]}`}>
                            {item.data.priority.toUpperCase()}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {FEEDBACK_STATUSES.find(s => s.value === item.data.status)?.label}
                          </div>
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.data.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {item.data.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {item.profiles.first_name} {item.profiles.last_name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(item.created_at)}
                          </div>
                          {item.data.page_url && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              {new URL(item.data.page_url).pathname}
                            </div>
                          )}
                          {item.data.browser_info && (
                            <div className="flex items-center">
                              <DeviceIcon className="h-4 w-4 mr-1" />
                              {item.data.browser_info.browser} on {item.data.browser_info.os}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                        {(item.data.status === 'submitted' || item.data.status === 'open') && (
                          <button
                            onClick={() => handleStatusUpdate(item.id, 'in_review')}
                            className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          >
                            Start Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-lg font-semibold text-gray-900">Feedback Details</div>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[selectedFeedback.data.priority]}`}>
                  {selectedFeedback.data.priority.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{selectedFeedback.data.title}</h3>
                  <p className="text-gray-700 mb-4">{selectedFeedback.data.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Type:</span>
                      <span className="ml-2 text-gray-600">
                        {FEEDBACK_TYPES.find(t => t.value === selectedFeedback.data.feedback_type)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Status:</span>
                      <span className="ml-2 text-gray-600">
                        {FEEDBACK_STATUSES.find(s => s.value === selectedFeedback.data.status)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">User:</span>
                      <span className="ml-2 text-gray-600">
                        {selectedFeedback.profiles.first_name} {selectedFeedback.profiles.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Date:</span>
                      <span className="ml-2 text-gray-600">
                        {formatDate(selectedFeedback.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bug-specific fields */}
                                {selectedFeedback.data.feedback_type === 'bug' && (
                  <div className="space-y-4">
                    {selectedFeedback.data.steps_to_reproduce && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Steps to Reproduce</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.data.steps_to_reproduce}</p>
                      </div>
                    )}
                    {selectedFeedback.data.expected_behavior && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Expected Behavior</h4>
                        <p className="text-gray-700">{selectedFeedback.data.expected_behavior}</p>
                      </div>
                    )}
                    {selectedFeedback.data.actual_behavior && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Actual Behavior</h4>
                        <p className="text-gray-700">{selectedFeedback.data.actual_behavior}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Technical Information */}
                {selectedFeedback.data.browser_info && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Details:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                      <div>
                        <span className="font-medium">Browser:</span> {selectedFeedback.data.browser_info.browser}
                      </div>
                      <div>
                        <span className="font-medium">OS:</span> {selectedFeedback.data.browser_info.os}
                      </div>
                      <div>
                        <span className="font-medium">Device:</span> {selectedFeedback.data.browser_info.device}
                      </div>
                      <div>
                        <span className="font-medium">Screen:</span> {selectedFeedback.data.screen_resolution}
                      </div>
                      {selectedFeedback.data.page_url && (
                        <div>
                          <span className="font-medium">Page:</span> {selectedFeedback.data.page_url}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Response */}
                {selectedFeedback.data.admin_response && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Admin Response:</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedFeedback.data.admin_response}</p>
                      {selectedFeedback.data.responded_at && (
                        <p className="text-sm text-gray-500 mt-2">
                          Responded on {formatDate(selectedFeedback.data.responded_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Response Form */}
                {selectedFeedback.data.status !== 'closed' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Admin Response:</h4>
                    <div className="space-y-4">
                      <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Enter your response to the user..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div className="flex items-center space-x-4">
                        <select
                          value={responseStatus}
                          onChange={(e) => setResponseStatus(e.target.value as FeedbackStatus)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="responded">Respond & Keep Open</option>
                          <option value="closed">Respond & Close</option>
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(selectedFeedback.id, responseStatus, adminResponse)}
                          disabled={submittingResponse || !adminResponse.trim()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                        >
                          {submittingResponse ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageCircle className="h-4 w-4" />
                          )}
                          <span>{submittingResponse ? 'Submitting...' : 'Submit Response'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
