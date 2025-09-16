import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SecurityDashboard from '@/components/security/SecurityDashboard';

export default async function SecurityDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  // Check if user is admin (you might want to add an admin check here)
  // For now, any authenticated user can access this dashboard

  return (
    <div className="min-h-screen bg-gray-50">
      <SecurityDashboard />
    </div>
  );
}
