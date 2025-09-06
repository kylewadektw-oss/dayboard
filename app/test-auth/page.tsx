'use client';

export default function TestAuth() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Testing - Disabled</h1>
      
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        <strong className="font-bold">Notice:</strong>
        <span className="block sm:inline"> Google OAuth has been disabled for development. Authentication testing is no longer functional.</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <p className="text-gray-600 mb-4">
          All Google authentication functionality has been removed from this project to simplify the development process. 
          This includes OAuth providers, environment variables, and test endpoints.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Disabled Features:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Google OAuth sign-in functionality</li>
            <li>OAuth provider configuration in Supabase</li>
            <li>Client ID and secret environment variables</li>
            <li>Authentication callback handling</li>
            <li>Session management for OAuth users</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <p className="text-sm text-blue-800">
            <strong>For Future Development:</strong> Authentication can be re-implemented later when needed for production deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
