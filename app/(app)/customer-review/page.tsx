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

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Check, X, MessageSquare, Calendar, User, AlertCircle } from 'lucide-react';

interface CustomerReview {
  id: string;
  user_id: string;
  household_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function CustomerReviewPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: {id: string, name: string | null, preferred_name?: string | null, avatar_url?: string | null}}>({});
  const [households, setHouseholds] = useState<{[key: string]: {id: string, name: string | null, address?: string | null, city?: string | null, state?: string | null, zip?: string | null}}>({});

  // Check if user has admin privileges
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (!isAdmin) {
      setError('You do not have permission to access this page.');
      setLoading(false);
      return;
    }
    
    fetchReviews();
  }, [isAdmin, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: reviewData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setReviews(reviewData || []);

      // Fetch user profiles separately
      if (reviewData && reviewData.length > 0) {
        const userIds = reviewData.map(review => review.user_id);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, preferred_name, avatar_url')
          .in('id', userIds);

        const profileMap: {[key: string]: {id: string, name: string | null, preferred_name?: string | null, avatar_url?: string | null}} = {};
        profileData?.forEach(profile => {
          profileMap[profile.id] = profile;
        });
        setUserProfiles(profileMap);

        // Fetch household data
        const householdIds = reviewData
          .filter(review => review.household_id)
          .map(review => review.household_id) as string[];
        if (householdIds.length > 0) {
          const { data: householdData } = await supabase
            .from('households')
            .select('id, name, address, city, state, zip')
            .in('id', householdIds);

          const householdMap: {[key: string]: {id: string, name: string | null, address?: string | null, city?: string | null, state?: string | null, zip?: string | null}} = {};
          householdData?.forEach(household => {
            householdMap[household.id] = household;
          });
          setHouseholds(householdMap);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load customer reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId: string, action: 'approved' | 'rejected', notes?: string) => {
    if (!user) return;

    try {
      setProcessingId(reviewId);
      
      const { error: updateError } = await supabase
        .from('customer_reviews')
        .update({
          status: action,
          review_notes: notes || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      // Refresh the reviews list
      await fetchReviews();
      setSelectedReview(null);
      setReviewNotes('');
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Failed to update review status');
    } finally {
      setProcessingId(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You do not have permission to access the customer review dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Customer Review Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review and approve new customer signup requests
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'pending', label: 'Pending', count: reviews.filter(r => r.status === 'pending').length },
                  { key: 'approved', label: 'Approved', count: reviews.filter(r => r.status === 'approved').length },
                  { key: 'rejected', label: 'Rejected', count: reviews.filter(r => r.status === 'rejected').length },
                  { key: 'all', label: 'All', count: reviews.length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as 'all' | 'pending' | 'approved' | 'rejected')}
                    className={`${
                      filter === tab.key
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <span>{tab.label}</span>
                    <span className={`${
                      filter === tab.key ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                    } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'pending' ? 'No pending reviews at this time.' : `No ${filter} reviews found.`}
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          {/* User Avatar */}
                          <div className="flex-shrink-0">
                            {userProfiles[review.user_id]?.avatar_url ? (
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={userProfiles[review.user_id].avatar_url || ''}
                                alt="User avatar"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-600" />
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {userProfiles[review.user_id]?.preferred_name || userProfiles[review.user_id]?.name || 'Unknown User'}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <User className="h-4 w-4 mr-1" />
                                User ID: {review.user_id.slice(0, 8)}...
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(review.created_at)}
                              </div>
                            </div>
                            {review.household_id && households[review.household_id] && (
                              <p className="text-sm text-gray-500 mt-1">
                                Household: {households[review.household_id].name}
                                {households[review.household_id].address && (
                                  <span className="ml-2">
                                    • {households[review.household_id].city}, {households[review.household_id].state}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReviewAction(review.id, 'approved')}
                                disabled={processingId === review.id}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => setSelectedReview(review)}
                                disabled={processingId === review.id}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                          {review.review_notes && (
                            <button
                              onClick={() => setSelectedReview(review)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              View Notes
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedReview.status === 'pending' ? 'Reject Application' : 'Review Notes'}
              </h3>
              
              {selectedReview.status === 'pending' ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Rejecting {userProfiles[selectedReview.user_id]?.preferred_name || userProfiles[selectedReview.user_id]?.name || 'this user'}&apos;s application.
                    Please provide a reason for rejection:
                  </p>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                  />
                </>
              ) : (
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-2">Review Notes:</p>
                  <p className="bg-gray-50 p-3 rounded-md">
                    {selectedReview.review_notes || 'No notes provided.'}
                  </p>
                  {selectedReview.reviewed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on {formatDate(selectedReview.reviewed_at)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setReviewNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {selectedReview.status === 'pending' ? 'Cancel' : 'Close'}
                </button>
                {selectedReview.status === 'pending' && (
                  <button
                    onClick={() => handleReviewAction(selectedReview.id, 'rejected', reviewNotes)}
                    disabled={processingId === selectedReview.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {processingId === selectedReview.id ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
