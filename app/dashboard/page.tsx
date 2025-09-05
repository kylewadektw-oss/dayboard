import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser, hasPermission } from '@/utils/auth-helpers/permissions';

export default async function DashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/signin');
  }

  const userProfile = await getCurrentUser();
  const canViewDashboard = await hasPermission('dashboard');

  if (!canViewDashboard) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600">You don't have permission to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.full_name}!</p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Role: {userProfile?.role?.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Tasks</h3>
          <p className="text-2xl font-bold text-gray-900">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Meal Plans</h3>
          <p className="text-2xl font-bold text-gray-900">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Projects</h3>
          <p className="text-2xl font-bold text-gray-900">2</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Family Members</h3>
          <p className="text-2xl font-bold text-gray-900">4</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
            <div className="text-blue-600 font-medium">Add Task</div>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
            <div className="text-green-600 font-medium">Plan Meal</div>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
            <div className="text-purple-600 font-medium">New Project</div>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
            <div className="text-orange-600 font-medium">Add Note</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Sarah completed "Grocery Shopping"</span>
            <span className="text-gray-400 text-sm">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">New meal plan added for this week</span>
            <span className="text-gray-400 text-sm">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Project "Home Renovation" updated</span>
            <span className="text-gray-400 text-sm">1 day ago</span>
          </div>
        </div>
      </div>

      {/* Development Note */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-1">Development Mode</h3>
        <p className="text-sm text-yellow-700">
          This dashboard is currently using mock data. The user role system is active with {userProfile?.role} permissions.
          Run the database migration to enable full functionality.
        </p>
      </div>
    </div>
  );
}
