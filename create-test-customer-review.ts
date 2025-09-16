/*
 * Test script to create a customer review entry for demonstration
 * This simulates a new user signup that needs approval
 */

import { createClient } from '@/utils/supabase/client';

async function createTestCustomerReview() {
  const supabase = createClient();

  // Get current user (should be an admin)
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('No user logged in');
    return;
  }

  // Create a test customer review entry
  const { data, error } = await supabase
    .from('customer_reviews')
    .insert({
      user_id: user.id,
      status: 'pending',
      review_notes: null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating test review:', error);
  } else {
    console.log('Test customer review created:', data);
  }
}

// For testing in browser console
if (typeof window !== 'undefined') {
  (
    window as Window & {
      createTestCustomerReview?: typeof createTestCustomerReview;
    }
  ).createTestCustomerReview = createTestCustomerReview;
}

export { createTestCustomerReview };
