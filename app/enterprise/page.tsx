'use client';

import { 
  Code2, 
  Smartphone, 
  Cloud, 
  Shield, 
  ArrowRight, 
  Star,
  CheckCircle,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Globe,
  Settings,
  Database,
  Monitor,
  Heart,
  Award,
  Mail
} from 'lucide-react';

export default function BentLoLabsLanding() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Company Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
            <Code2 className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Software Design & Development
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl leading-tight">
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              BentLo Labs
            </span>
            Software Design Group
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-xl leading-relaxed text-gray-700 max-w-3xl mx-auto">
            We craft <strong>intelligent software solutions</strong> that solve real-world problems. 
            From household management platforms to enterprise applications, 
            we build <strong>production-ready software</strong> that actually works.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://dayboard.bentlolabs.com"
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-blue-500/25 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Rocket className="w-5 h-5" />
              See Our Work
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-4 text-lg font-semibold text-gray-800 hover:text-blue-600 transition-all duration-300 group"
            >
              <Mail className="w-5 h-5" />
              Start a Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Enterprise Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-500" />
              <span>Cloud-Native Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Production Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Full-Stack Solutions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Software Portfolio
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real applications solving real problems. Here&apos;s what we&apos;ve built and deployed.
            </p>
          </div>

          {/* Flagship Product - Dayboard */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 mb-12 border border-blue-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium mb-4">
                  <Star className="w-4 h-4 mr-1" />
                  Flagship Product
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Dayboard: Household Command Center
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  A comprehensive household management platform that unifies meal planning, 
                  task coordination, project tracking, and family organization into a single, 
                  intelligent dashboard.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Production Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Multi-User Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Real-Time Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Mobile Responsive</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href="https://dayboard.bentlolabs.com"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    View Live Demo
                  </a>
                  <a
                    href="https://dayboard.bentlolabs.com/signin"
                    className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Try Free
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Built with Modern Tech Stack
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Next.js 15</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>React 19</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>TypeScript</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span>Supabase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Tailwind CSS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Vercel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Future Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Enterprise Data Platform
              </h3>
              <p className="text-gray-700 mb-4">
                Advanced analytics and business intelligence platform for enterprise clients, 
                featuring real-time dashboards and custom reporting.
              </p>
              <div className="text-purple-600 font-semibold">
                In Development
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Mobile-First Solutions
              </h3>
              <p className="text-gray-700 mb-4">
                Native mobile applications and progressive web apps designed for 
                optimal mobile user experience and offline functionality.
              </p>
              <div className="text-emerald-600 font-semibold">
                Planning Phase
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Development Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From concept to deployment, we provide end-to-end software development 
              services tailored to your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Custom Software Development */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Custom Software Development
              </h3>
              <p className="text-gray-700 mb-6">
                Full-stack web applications, mobile apps, and enterprise software 
                solutions built with modern technologies and best practices.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>React & Next.js Applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Database Design & Architecture</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>API Development & Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cloud Deployment & DevOps</span>
                </li>
              </ul>
            </div>

            {/* Technical Consulting */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Technical Consulting
              </h3>
              <p className="text-gray-700 mb-6">
                Strategic technology guidance, architecture planning, and technical 
                audits to help you make informed decisions about your software projects.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Technology Stack Selection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Architecture & Design Review</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Performance Optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Security Assessment</span>
                </li>
              </ul>
            </div>

            {/* Maintenance & Support */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Maintenance & Support
              </h3>
              <p className="text-gray-700 mb-6">
                Ongoing support, updates, and maintenance services to keep your 
                applications running smoothly and securely.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 Monitoring & Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Regular Updates & Patches</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Bug Fixes & Improvements</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Feature Enhancement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose BentLo Labs?
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                We&apos;re not just another development agency. We&apos;re a boutique software design group 
                that focuses on building exceptional, production-ready applications that solve 
                real-world problems.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Production-First Approach
                    </h3>
                    <p className="text-gray-600">
                      We build applications that are deployed and used by real users, 
                      not just demos or prototypes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Quality & Craftsmanship
                    </h3>
                    <p className="text-gray-600">
                      Every line of code is written with care, following best practices 
                      and modern development standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Long-term Partnership
                    </h3>
                    <p className="text-gray-600">
                      We believe in building lasting relationships and providing 
                      ongoing support for all our projects.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Our Process
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Discovery & Planning</div>
                    <div className="text-gray-600 text-sm">Understanding your needs and goals</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Design & Architecture</div>
                    <div className="text-gray-600 text-sm">Creating scalable and maintainable solutions</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Development & Testing</div>
                    <div className="text-gray-600 text-sm">Building with quality and performance in mind</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Deployment & Support</div>
                    <div className="text-gray-600 text-sm">Launch and ongoing maintenance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Let&apos;s discuss how we can help bring your software ideas to life with 
              our expertise and proven track record.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">
                Get in Touch
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Email</div>
                    <a 
                      href="mailto:developer@bentlolabs.com" 
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      developer@bentlolabs.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Portfolio</div>
                    <a 
                      href="https://dayboard.bentlolabs.com" 
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      dayboard.bentlolabs.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Live Demo</div>
                    <a 
                      href="https://dayboard.bentlolabs.com/signin" 
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Try Dayboard Free
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Project Consultation
                </h4>
                <p className="text-gray-300 mb-4">
                  Schedule a free 30-minute consultation to discuss your project requirements, 
                  timeline, and how we can help achieve your goals.
                </p>
                <a
                  href="mailto:developer@bentlolabs.com?subject=Project Consultation Request"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Schedule Consultation
                </a>
              </div>
            </div>

            {/* Project Types */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">
                Project Types We Excel At
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Web Applications
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Full-stack web applications with modern frameworks, databases, 
                    and cloud deployment.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Enterprise Software
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Business management systems, data analytics platforms, 
                    and workflow automation tools.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    API Development
                  </h4>
                  <p className="text-gray-300 text-sm">
                    RESTful APIs, GraphQL services, and third-party integrations 
                    with proper documentation.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Mobile-First Solutions
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Progressive web apps and responsive designs optimized 
                    for mobile devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">BentLo Labs</h3>
              <p className="text-gray-400">Software Design Group</p>
            </div>
            
            <div className="flex items-center gap-8">
              <a 
                href="mailto:developer@bentlolabs.com" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
              <a 
                href="https://dayboard.bentlolabs.com" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Portfolio
              </a>
              <a 
                href="https://dayboard.bentlolabs.com/signin" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Try Dayboard
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 BentLo Labs LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
