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

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Check, X, MessageSquare, User, AlertCircle } from 'lucide-react';
import { Database } from '@/src/lib/types_db';

type Json =
  Database['public']['Tables']['customer_reviews']['Row']['device_info'];

interface CustomerReview {
  id: string;
  user_id: string;
  status: string;
  rating: number | null;
  review_text: string | null;
  review_type: string | null;
  feedback_category: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
  app_version: string | null;
  device_info: Json | null;
  helpful_votes: number | null;
  is_public: boolean | null;
  response_from_team: string | null;
  response_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Profile {
  id: string;
  name: string | null;
  avatar_url?: string | null;
}

export default function CustomerReviewPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responseText, setResponseText] = useState('');

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: reviewData, error } = await query;

      if (error) throw error;

      setReviews(reviewData || []);

      // Fetch user profiles for reviewers
      if (reviewData && reviewData.length > 0) {
        const userIds = reviewData.map((review) => review.user_id);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);

        if (!profileError && profileData) {
          const profileMap: { [key: string]: Profile } = {};
          profileData.forEach((profile) => {
            profileMap[profile.id] = profile;
          });
          setProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, statusFilter]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    fetchReviews();
  }, [user, isAdmin, fetchReviews]);

  const updateReviewStatus = async (reviewId: string, newStatus: string) => {
    try {
      const updateData: Partial<CustomerReview> = { status: newStatus };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (responseText.trim()) {
        updateData.response_from_team = responseText.trim();
        updateData.response_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customer_reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;

      // Refresh reviews
      fetchReviews();
      setSelectedReview(null);
      setResponseText('');
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReviewTypeIcon = (type: string | null) => {
    switch (type) {
      case 'bug_report':
        return <AlertCircle className="h-4 w-4" />;
      case 'feature_request':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Only administrators can access customer reviews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="mt-2 text-gray-600">
            Manage customer feedback and reviews
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reviews List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Reviews ({reviews.length})
                  </h3>

                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No reviews found.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          onClick={() => setSelectedReview(review)}
                          className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              {getReviewTypeIcon(review.review_type)}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {profiles[review.user_id]?.name ||
                                    review.reviewer_name ||
                                    'Anonymous'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(review.created_at)}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}
                            >
                              {review.status}
                            </span>
                          </div>

                          {review.rating && (
                            <div className="mt-2 flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < review.rating!
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}

                          {review.review_text && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {review.review_text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Review Detail */}
            <div className="lg:col-span-1">
              {selectedReview ? (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Review Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Reviewer
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {profiles[selectedReview.user_id]?.name ||
                            selectedReview.reviewer_name ||
                            'Anonymous'}
                        </p>
                        {selectedReview.reviewer_email && (
                          <p className="text-sm text-gray-500">
                            {selectedReview.reviewer_email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReview.status)}`}
                        >
                          {selectedReview.status}
                        </span>
                      </div>

                      {selectedReview.rating && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Rating
                          </label>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < selectedReview.rating!
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedReview.review_text && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Review
                          </label>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                            {selectedReview.review_text}
                          </p>
                        </div>
                      )}

                      {selectedReview.review_type && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedReview.review_type}
                          </p>
                        </div>
                      )}

                      {selectedReview.feedback_category && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Category
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedReview.feedback_category}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Created
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(selectedReview.created_at)}
                        </p>
                      </div>

                      {selectedReview.response_from_team && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Team Response
                          </label>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                            {selectedReview.response_from_team}
                          </p>
                          {selectedReview.response_at && (
                            <p className="text-sm text-gray-500 mt-2">
                              Reviewed on{' '}
                              {formatDate(selectedReview.response_at)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Response Section */}
                      {selectedReview.status !== 'completed' && (
                        <div className="border-t pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Response
                          </label>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={3}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Add a response to this review..."
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      {selectedReview.status !== 'completed' && (
                        <div className="flex space-x-2 pt-4">
                          <button
                            onClick={() =>
                              updateReviewStatus(
                                selectedReview.id,
                                'in_progress'
                              )
                            }
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                          >
                            Mark In Progress
                          </button>
                          <button
                            onClick={() =>
                              updateReviewStatus(selectedReview.id, 'completed')
                            }
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 inline mr-1" />
                            Complete
                          </button>
                          <button
                            onClick={() =>
                              updateReviewStatus(selectedReview.id, 'rejected')
                            }
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                          >
                            <X className="h-4 w-4 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a review to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
