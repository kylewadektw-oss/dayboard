import Link from 'next/link';
import { 
  Calendar, 
  ChefHat, 
  ListTodo, 
  Users, 
  Timer, 
  Smartphone,
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Sparkles,
  Clock,
  Shield
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 sm:text-8xl leading-none">
            Your Household
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="mt-8 text-2xl leading-relaxed text-gray-700 max-w-4xl mx-auto font-light">
            Stop juggling apps, notes, and reminders. Dayboard consolidates everything your household needs 
            into one intelligent dashboard that actually works.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-5 text-xl font-bold text-white shadow-2xl hover:shadow-blue-500/25 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <PlayCircle className="w-6 h-6" />
              Get Started Now
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-5 text-xl font-semibold text-gray-800 hover:text-blue-600 transition-all duration-300 group"
            >
              Explore Features
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-base text-gray-600">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Privacy Protected</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Ready in Minutes</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="font-medium">No Credit Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No more switching between multiple apps. Dayboard brings all your household management tools together.
            </p>
          </div>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {/* Meal Planning */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 border border-orange-100">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Meal Planning</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Weekly meal planning with recipe suggestions, automatic grocery lists, and dietary preferences. 
                  Turn dinner decisions from stressful to seamless.
                </p>
                <div className="text-orange-600 font-semibold text-lg">
                  Recipe library included →
                </div>
              </div>
            </div>

            {/* Task Management */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border border-emerald-100">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <ListTodo className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Lists</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Grocery lists, to-dos, and household tasks that sync across all devices. 
                  Smart categorization and sharing keep everyone aligned.
                </p>
                <div className="text-emerald-600 font-semibold text-lg">
                  Real-time collaboration →
                </div>
              </div>
            </div>

            {/* Household Coordination */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-blue-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Household Sync</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Coordinate schedules, assign responsibilities, and track progress together. 
                  Perfect for roommates, couples, or multi-generational homes.
                </p>
                <div className="text-blue-600 font-semibold text-lg">
                  Built for any household →
                </div>
              </div>
            </div>

            {/* Project Tracking */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border border-purple-100">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Project Management</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Visual tracking for home improvements, seasonal tasks, and long-term goals. 
                  Break down big projects into manageable steps.
                </p>
                <div className="text-purple-600 font-semibold text-lg">
                  Visual progress tracking →
                </div>
              </div>
            </div>

            {/* Time & Focus */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 border border-rose-100">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Timer className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Focus & Productivity</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Built-in timers, productivity tracking, and focus sessions. 
                  Balance household responsibilities with personal goals.
                </p>
                <div className="text-rose-600 font-semibold text-lg">
                  Productivity insights →
                </div>
              </div>
            </div>

            {/* Multi-Device */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 border border-cyan-100">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Everywhere Access</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Optimized for phones, tablets, desktops, and smart displays. 
                  Your dashboard follows you wherever you need it most.
                </p>
                <div className="text-cyan-600 font-semibold text-lg">
                  All devices supported →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-black">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-3xl font-light text-white max-w-4xl mx-auto leading-relaxed">
              "Finally, a household management system that doesn't feel like work. 
              Dayboard eliminated the chaos and gave us our evenings back."
            </blockquote>
            <div className="mt-8 text-gray-300 text-xl">
              — Alex Chen, Software Engineer & Parent
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 sm:text-6xl mb-8">
            Ready to Take Control?
          </h2>
          <p className="text-2xl text-gray-700 mb-12 font-light">
            Join thousands who've transformed their household management with Dayboard.
          </p>
          
          <div className="mb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-6 text-2xl font-bold text-white shadow-2xl hover:shadow-blue-500/25 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-2"
            >
              <PlayCircle className="w-8 h-8" />
              Start Your Dashboard
            </Link>
            
            <p className="mt-8 text-lg text-gray-600">
              Free forever • No setup fees • Cancel anytime
            </p>
          </div>
          
          {/* Feature Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-700">
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-medium">Meal Planning</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-medium">Smart Lists</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-medium">Task Management</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-medium">Project Tracking</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
