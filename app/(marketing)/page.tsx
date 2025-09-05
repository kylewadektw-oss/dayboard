import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import Link from 'next/link';
import { 
  Calendar, 
  ChefHat, 
  ListTodo, 
  Users, 
  Timer, 
  Smartphone,
  Star,
  Shield,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default async function LandingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Your Family's
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Command Center</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Streamline your family life with beautiful meal planning, smart lists, project tracking, and time management—all designed for tablets and Echo Show devices.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-purple-700 hover:to-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all duration-200"
            >
              Start Your Free Trial
            </Link>
            <Link href="#features" className="text-sm font-semibold leading-6 text-gray-900 hover:text-purple-600 transition-colors">
              See Features <ArrowRight className="inline ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-4xl">
            <img
              src="/demo.png"
              alt="Family Command Center Dashboard"
              className="w-full rounded-2xl shadow-2xl border border-gray-200"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Everything You Need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for Busy Families
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From meal planning to project management, keep your family organized and connected with our comprehensive dashboard.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Meal Planning */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <ChefHat className="h-6 w-6 text-white" />
                  </div>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900">Smart Meal Planning</dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Plan weekly meals with drag-and-drop scheduling. Browse 50+ family-tested recipes with ratings and auto-generate grocery lists.</p>
                </dd>
              </div>

              {/* List Management */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <ListTodo className="h-6 w-6 text-white" />
                  </div>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900">Organized Lists</dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Manage grocery lists, todos, and shopping with real-time sync across all family devices. Stay organized effortlessly.</p>
                </dd>
              </div>

              {/* Family Coordination */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900">Family Coordination</dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Track everyone's schedules, assign tasks, and celebrate achievements. Keep your family connected and productive.</p>
                </dd>
              </div>

              {/* Project Management */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900">Project Tracking</dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Visual project management with progress tracking, built-in timers, and task breakdowns for family goals.</p>
                </dd>
              </div>

              {/* Time Management */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <Timer className="h-6 w-6 text-white" />
                  </div>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900">Time Tracking</dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Built-in timers for work sessions, productivity analytics, and schedule management for better work-life balance.</p>
                </dd>
              </div>

              {/* Device Optimized */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900">Device Optimized</dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Perfect for kitchen tablets and Echo Show devices. Beautiful, responsive design that works everywhere.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-24 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by Families Everywhere
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              See what families are saying about their Command Center experience.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Review 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg ring-1 ring-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-gray-900 text-lg leading-7 mb-6">
                "This has completely transformed how we manage our household. The meal planning alone saves us hours every week, and the kids love checking off their tasks!"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  SM
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Martinez</p>
                  <p className="text-sm text-gray-600">Mother of 3, Seattle</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg ring-1 ring-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-gray-900 text-lg leading-7 mb-6">
                "The tablet interface is perfect for our kitchen. We can plan meals while cooking and everyone can see what's coming up. Game changer!"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  JR
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Jennifer Rodriguez</p>
                  <p className="text-sm text-gray-600">Working Mom, Austin</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg ring-1 ring-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-gray-900 text-lg leading-7 mb-6">
                "Finally, a family organization system that actually works! The project tracking helps us tackle home improvements together as a team."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  DK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">David Kim</p>
                  <p className="text-sm text-gray-600">Father & Engineer, Portland</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Families Choose Us
            </h2>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:gap-12 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Privacy First</h3>
                <p className="mt-2 text-gray-600">Your family data stays secure with enterprise-grade encryption and privacy controls.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lightning Fast</h3>
                <p className="mt-2 text-gray-600">Optimized for speed with real-time sync across all your family devices.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Built with Love</h3>
                <p className="mt-2 text-gray-600">Created by a family, for families. We understand the challenges of modern parenting.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Always Improving</h3>
                <p className="mt-2 text-gray-600">Regular updates and new features based on real family feedback and needs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, Family-Friendly Pricing
            </p>
          </div>
          <div className="mt-16">
            <Pricing
              user={user}
              products={products ?? []}
              subscription={subscription}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Transform Your Family Life?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join thousands of families who've simplified their daily routines with our Command Center.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:from-purple-700 hover:to-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all duration-200"
              >
                Start Free Trial
              </Link>
              <Link href="#features" className="text-base font-semibold leading-7 text-gray-900 hover:text-purple-600 transition-colors">
                Learn More <ArrowRight className="inline ml-1 w-4 h-4" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
