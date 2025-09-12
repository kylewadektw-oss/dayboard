import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user profile to debug
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">User Info:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile Data:</h2>
          {error && (
            <div className="bg-red-100 p-4 rounded mb-4">
              <p className="text-red-700">Error: {error.message}</p>
            </div>
          )}
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Role Check:</h2>
          <p>Profile Role: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{profile?.role || 'null/undefined'}</span></p>
          <p>Is Super Admin: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{profile?.role === 'super_admin' ? 'true' : 'false'}</span></p>
          
          {profile?.role !== 'super_admin' && (
            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <p className="text-yellow-800">
                Your role is not 'super_admin'. You need to update your profile in the Supabase dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
