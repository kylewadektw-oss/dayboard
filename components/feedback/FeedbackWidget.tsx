/*
 * 🛡️ DAYBOARD PROPimport { 
  FeedbackType, 
  FeedbackPriority, 
  CreateFeedbackData, 
  FEEDBACK_TYPES,
  FEEDBACK_PRIORITIES,
  BrowserInfo
} from '@/types';
import { Json } from '@/src/lib/types_db';CODE
 * 
 * Feedback Widget - Floating sidebar feedback form
 */

'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bug,
  Lightbulb,
  Zap,
  Frown,
  ThumbsUp,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import {
  FeedbackType,
  FeedbackPriority,
  CreateFeedbackData,
  FEEDBACK_TYPES,
  FEEDBACK_PRIORITIES,
  BrowserInfo
} from '@/types/feedback';
import { Json } from '@/src/lib/types_db';

interface FeedbackWidgetProps {
  className?: string;
}

const FEEDBACK_ICONS = {
  bug: Bug,
  feature_request: Lightbulb,
  improvement: Zap,
  complaint: Frown,
  compliment: ThumbsUp,
  other: MessageCircle
};

export default function FeedbackWidget({
  className = ''
}: FeedbackWidgetProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('improvement');
  const [priority, setPriority] = useState<FeedbackPriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');

  const supabase = createClient();

  // Always show the widget for testing - we'll handle auth in the form submission
  // console.log('FeedbackWidget rendering, profile:', !!profile); // Removed to prevent render loops

  // Get browser and page info
  const getBrowserInfo = (): BrowserInfo => {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      browser: getBrowserName(),
      os: getOperatingSystem(),
      device: getDeviceType(),
      timestamp: new Date().toISOString()
    };
  };

  const getBrowserName = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
      return 'Safari';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getOperatingSystem = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    )
      return 'Mobile';
    return 'Desktop';
  };

  const getCurrentPageInfo = () => {
    return {
      url: window.location.href,
      title: document.title,
      pathname: window.location.pathname
    };
  };

  const resetForm = () => {
    setFeedbackType('improvement');
    setPriority('medium');
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setExpectedBehavior('');
    setActualBehavior('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id || !title.trim() || !description.trim()) {
      if (!profile?.id) {
        alert('Please sign in to submit feedback');
        return;
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const pageInfo = getCurrentPageInfo();
      const browserInfo = getBrowserInfo();

      const feedbackData: CreateFeedbackData = {
        page_url: pageInfo.url,
        page_title: pageInfo.title,
        feedback_type: feedbackType,
        priority,
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: stepsToReproduce.trim() || undefined,
        expected_behavior: expectedBehavior.trim() || undefined,
        actual_behavior: actualBehavior.trim() || undefined,
        browser_info: browserInfo,
        screen_resolution: `${browserInfo.screen.width}x${browserInfo.screen.height}`,
        user_agent: browserInfo.userAgent
      };

      const { error } = await supabase.from('application_logs').insert({
        user_id: profile.id,
        session_id: `feedback-${Date.now()}`,
        level: 'info',
        message: `Feedback: ${feedbackData.title}`,
        component: 'feedback_system',
        data: {
          feedback_type: feedbackData.feedback_type,
          priority: feedbackData.priority || 'medium',
          title: feedbackData.title,
          description: feedbackData.description,
          steps_to_reproduce: feedbackData.steps_to_reproduce || null,
          expected_behavior: feedbackData.expected_behavior || null,
          actual_behavior: feedbackData.actual_behavior || null,
          browser_info: feedbackData.browser_info
            ? JSON.parse(JSON.stringify(feedbackData.browser_info))
            : null,
          screen_resolution: feedbackData.screen_resolution || null,
          user_agent: feedbackData.user_agent || null,
          page_url: feedbackData.page_url || null,
          page_title: feedbackData.page_title || null,
          household_id: profile.household_id,
          status: 'submitted'
        } as Json,
        user_agent: feedbackData.user_agent || null,
        url: feedbackData.page_url || null,
        timestamp: new Date().toISOString()
      });

      if (error) throw error;

      setSubmitted(true);
      resetForm();

      // Auto-close after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 3000);
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      style={{ zIndex: 9999 }}
    >
      {/* Debug indicator */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>

      {/* Feedback Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
          title="Send Feedback"
        >
          <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Send Feedback</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success State */}
          {submitted && (
            <div className="p-6 text-center">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                <ThumbsUp className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Thank you!</h4>
                <p className="text-sm">
                  Your feedback has been submitted successfully.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          {!submitted && (
            <form
              onSubmit={handleSubmit}
              className="p-4 space-y-4 max-h-[calc(80vh-80px)] overflow-y-auto"
            >
              {/* Page Info */}
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium text-gray-700 mb-1">
                  Current Page:
                </div>
                <div className="text-gray-600 truncate">
                  {getCurrentPageInfo().pathname}
                </div>
              </div>

              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FEEDBACK_TYPES.map((type) => {
                    const IconComponent = FEEDBACK_ICONS[type.value];
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFeedbackType(type.value)}
                        className={`p-2 text-xs border rounded-lg transition-colors ${
                          feedbackType === type.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <IconComponent className="h-4 w-4 mx-auto mb-1" />
                        <div>{type.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as FeedbackPriority)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {FEEDBACK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your feedback"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information about your feedback"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Bug-specific fields */}
              {feedbackType === 'bug' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Steps to Reproduce
                    </label>
                    <textarea
                      value={stepsToReproduce}
                      onChange={(e) => setStepsToReproduce(e.target.value)}
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      value={expectedBehavior}
                      onChange={(e) => setExpectedBehavior(e.target.value)}
                      placeholder="What should happen?"
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      value={actualBehavior}
                      onChange={(e) => setActualBehavior(e.target.value)}
                      placeholder="What actually happened?"
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Send Feedback'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
