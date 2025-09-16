/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * User Feedback System Types
 * Types for the user feedback and critique system
 */

export type FeedbackType =
  | 'bug'
  | 'feature_request'
  | 'improvement'
  | 'complaint'
  | 'compliment'
  | 'other';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';

export type FeedbackStatus =
  | 'submitted'
  | 'in_review'
  | 'responded'
  | 'closed'
  | 'open';

export interface BrowserInfo {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  screen: {
    width: number;
    height: number;
  };
  browser: string;
  os: string;
  device: string;
  timestamp: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  household_id: string;

  // Feedback Details
  page_url: string;
  page_title: string | null;
  feedback_type: FeedbackType;
  priority: FeedbackPriority;

  // Content
  title: string;
  description: string;
  steps_to_reproduce: string | null;
  expected_behavior: string | null;
  actual_behavior: string | null;

  // Context
  browser_info: BrowserInfo | null;
  screen_resolution: string | null;
  user_agent: string | null;

  // Status Management
  status: FeedbackStatus;
  admin_notes: string | null;
  assigned_to: string | null;
  resolution_notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  resolved_at: string | null;

  // Relations (populated via joins)
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  assigned_admin?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateFeedbackData {
  page_url?: string;
  page_title?: string;
  feedback_type: FeedbackType;
  priority?: FeedbackPriority;
  title: string;
  description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  browser_info?: BrowserInfo;
  screen_resolution?: string;
  user_agent?: string;
}

export interface UpdateFeedbackData {
  title?: string;
  description?: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  priority?: FeedbackPriority;
}

export interface AdminUpdateFeedbackData {
  status?: FeedbackStatus;
  admin_notes?: string;
  assigned_to?: string;
  resolution_notes?: string;
  priority?: FeedbackPriority;
}

export interface FeedbackFilters {
  status?: FeedbackStatus | FeedbackStatus[];
  feedback_type?: FeedbackType | FeedbackType[];
  priority?: FeedbackPriority | FeedbackPriority[];
  assigned_to?: string;
  user_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface FeedbackStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_type: Record<FeedbackType, number>;
  by_priority: Record<FeedbackPriority, number>;
  avg_resolution_time: number; // in hours
  recent_activity: number; // feedback in last 7 days
}

// Helper functions for feedback types
export const FEEDBACK_TYPES: {
  value: FeedbackType;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    value: 'bug',
    label: 'Bug Report',
    icon: '🐛',
    color: 'text-red-600 bg-red-50'
  },
  {
    value: 'feature_request',
    label: 'Feature Request',
    icon: '💡',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    value: 'improvement',
    label: 'Improvement',
    icon: '⚡',
    color: 'text-yellow-600 bg-yellow-50'
  },
  {
    value: 'complaint',
    label: 'Complaint',
    icon: '😞',
    color: 'text-orange-600 bg-orange-50'
  },
  {
    value: 'compliment',
    label: 'Compliment',
    icon: '👍',
    color: 'text-green-600 bg-green-50'
  },
  {
    value: 'other',
    label: 'Other',
    icon: '💭',
    color: 'text-gray-600 bg-gray-50'
  }
];

export const FEEDBACK_PRIORITIES: {
  value: FeedbackPriority;
  label: string;
  color: string;
}[] = [
  { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-100' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600 bg-blue-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-100' }
];

export const FEEDBACK_STATUSES: {
  value: FeedbackStatus;
  label: string;
  color: string;
}[] = [
  {
    value: 'submitted',
    label: 'Submitted',
    color: 'text-blue-600 bg-blue-100'
  },
  {
    value: 'in_review',
    label: 'In Review',
    color: 'text-yellow-600 bg-yellow-100'
  },
  {
    value: 'responded',
    label: 'Responded',
    color: 'text-green-600 bg-green-100'
  },
  { value: 'closed', label: 'Closed', color: 'text-gray-600 bg-gray-100' },
  { value: 'open', label: 'Open', color: 'text-orange-600 bg-orange-100' }
];
