export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Profile</h1>
          <p className="text-gray-600">Manage your family&apos;s information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Family Members */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Family Members</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Parent 1 */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">M</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Mom</h3>
                      <p className="text-sm text-gray-600">Primary Admin</p>
                      <p className="text-xs text-gray-500">mom@family.com</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                  </div>

                  {/* Parent 2 */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">D</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Dad</h3>
                      <p className="text-sm text-gray-600">Admin</p>
                      <p className="text-xs text-gray-500">dad@family.com</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                  </div>

                  {/* Child */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-600">E</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Emma</h3>
                      <p className="text-sm text-gray-600">Child (Age 5)</p>
                      <p className="text-xs text-gray-500">Daycare: Little Stars Academy</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>

                <button className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  + Add Family Member
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Preferences
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" defaultChecked />
                        <span className="ml-2 text-sm text-gray-600">Daily schedule updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" defaultChecked />
                        <span className="ml-2 text-sm text-gray-600">Meal plan reminders</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                        <span className="ml-2 text-sm text-gray-600">Project deadline alerts</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme Preference
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                      <option>Light Mode</option>
                      <option>Dark Mode</option>
                      <option>Auto (System)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                    </select>
                  </div>
                </div>

                <button className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <span className="font-semibold text-gray-900">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Tasks</span>
                  <span className="font-semibold text-gray-900">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="font-semibold text-gray-900">45</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  📧 Export Family Data
                </button>
                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  🔒 Privacy Settings
                </button>
                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  📱 Mobile App Setup
                </button>
                <button className="w-full bg-red-100 text-red-700 p-3 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
