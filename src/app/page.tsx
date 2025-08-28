import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">📋 Dayboard</div>
          <Link 
            href="/signin" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Family's Command Center
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Organize calendars, meals, grocery lists, weather, and family updates 
            into one elegant dashboard. Built for modern families who want to stay connected.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/signin" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Get Started
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg border border-gray-300"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Link href="/dashboard" className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Dashboard</h3>
            <p className="text-gray-600">Get a quick overview of weather, calendar, dinner plans, and grocery lists all in one place.</p>
          </Link>

          <Link href="/meals" className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Meal Planning</h3>
            <p className="text-gray-600">Plan your family meals, save recipes, and automatically add ingredients to your grocery list.</p>
          </Link>

          <Link href="/lists" className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Lists</h3>
            <p className="text-gray-600">Manage grocery lists, todos, and checklists with intelligent categorization and sharing.</p>
          </Link>

          <Link href="/daycare" className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">🎒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Daycare Updates</h3>
            <p className="text-gray-600">Stay connected with your child's day through photos, reports, and real-time updates.</p>
          </Link>

          <Link href="/work" className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Work Integration</h3>
            <p className="text-gray-600">Balance work and family life with integrated calendars, tasks, and project management.</p>
          </Link>

          <Link href="/profile" className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Family Profiles</h3>
            <p className="text-gray-600">Manage household members, preferences, and stay connected with family updates.</p>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to organize your family life?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Join thousands of families who have simplified their daily routines with Dayboard.
          </p>
          <Link 
            href="/signin" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-lg font-semibold mb-2">📋 Dayboard</div>
          <p className="text-gray-400">Your family's command center, beautifully designed.</p>
        </div>
      </footer>
    </div>
  );
}
