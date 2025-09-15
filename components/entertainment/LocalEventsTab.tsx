/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { memo, useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  Star,
  Search,
  Filter,
  Ticket,
  TreePine,
  Baby,
  Utensils,
  Palette,
  Music
} from 'lucide-react';

// Mock data for demonstration - would integrate with Eventbrite, Meetup, Facebook Events, etc.
const upcomingEvents = [
  {
    id: 1,
    title: "Spring Festival in the Park",
    category: "Festival",
    date: "April 15, 2025",
    time: "10:00 AM - 6:00 PM",
    location: "Central Park",
    distance: "2.3 miles",
    price: "Free",
    description: "Annual spring celebration with live music, food vendors, and family activities.",
    attendees: 250,
    emoji: "🌸",
    tags: ["Family-Friendly", "Outdoor", "Free"],
    organizer: "NYC Parks Department"
  },
  {
    id: 2,
    title: "Local Farmers Market",
    category: "Market",
    date: "Every Saturday",
    time: "8:00 AM - 2:00 PM", 
    location: "Town Square",
    distance: "1.1 miles",
    price: "Free Entry",
    description: "Fresh produce, artisanal goods, and local crafts from community vendors.",
    attendees: 150,
    emoji: "🥕",
    tags: ["Weekly", "Local", "Family-Friendly"],
    organizer: "Downtown Association"
  },
  {
    id: 3,
    title: "Kids Art Workshop",
    category: "Workshop",
    date: "April 8, 2025",
    time: "1:00 PM - 3:00 PM",
    location: "Community Center",
    distance: "0.8 miles",
    price: "$15 per child",
    description: "Creative art session for children ages 5-12 with professional instructors.",
    attendees: 24,
    emoji: "🎨",
    tags: ["Kids", "Creative", "Indoor"],
    organizer: "Arts Council"
  },
  {
    id: 4,
    title: "Food Truck Rally",
    category: "Food",
    date: "April 12, 2025", 
    time: "5:00 PM - 9:00 PM",
    location: "Riverside Park",
    distance: "3.2 miles",
    price: "Varies by vendor",
    description: "Over 20 gourmet food trucks featuring cuisines from around the world.",
    attendees: 400,
    emoji: "🚚",
    tags: ["Food", "Outdoor", "Evening"],
    organizer: "Food Truck Alliance"
  }
];

const eventCategories = [
  { id: 'all', name: 'All Events', icon: Calendar, count: 24 },
  { id: 'family', name: 'Family', icon: Users, count: 8 },
  { id: 'outdoor', name: 'Outdoor', icon: TreePine, count: 12 },
  { id: 'kids', name: 'Kids', icon: Baby, count: 6 },
  { id: 'food', name: 'Food', icon: Utensils, count: 5 },
  { id: 'arts', name: 'Arts', icon: Palette, count: 7 },
  { id: 'music', name: 'Music', icon: Music, count: 9 }
];

const savedEvents = [
  { 
    id: 1, 
    title: "Community Garden Workshop", 
    date: "April 20", 
    category: "Outdoor",
    reminder: "1 day before" 
  },
  { 
    id: 2, 
    title: "Family Movie Night", 
    date: "April 18", 
    category: "Family",
    reminder: "2 hours before" 
  },
  { 
    id: 3, 
    title: "Local Jazz Concert", 
    date: "April 25", 
    category: "Music",
    reminder: "1 day before" 
  }
];

const featuredEvents = [
  {
    id: 1,
    title: "Annual Street Fair",
    date: "May 1, 2025",
    image: "🎪",
    highlight: "50+ Local Vendors",
    category: "Festival"
  },
  {
    id: 2,
    title: "Science Museum Exhibit",
    date: "Ongoing",
    image: "🔬",
    highlight: "Interactive Displays",
    category: "Educational"
  },
  {
    id: 3,
    title: "Outdoor Concert Series",
    date: "Weekends in May",
    image: "🎵",
    highlight: "Free Admission",
    category: "Music"
  }
];

export const LocalEventsTab = memo(() => {
  const [activeSection, setActiveSection] = useState<'discover' | 'categories' | 'saved' | 'featured'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const sections = [
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'categories', label: 'Categories', icon: Filter },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'featured', label: 'Featured', icon: Star }
  ];

  const renderDiscoverSection = () => (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events, venues, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>This Week</option>
          <option>This Month</option>
          <option>Next Month</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>All Distances</option>
          <option>Under 1 mile</option>
          <option>Under 5 miles</option>
          <option>Under 10 miles</option>
        </select>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Upcoming Events</h3>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{event.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{event.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-blue-600">{event.price}</div>
                      <div className="text-xs text-gray-500 mt-1">{event.attendees} interested</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location} • {event.distance}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      {event.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Quick Event Suggestions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'This Weekend', icon: '📅', desc: 'Events happening soon' },
            { name: 'Free Events', icon: '🆓', desc: 'No cost activities' },
            { name: 'Kid-Friendly', icon: '👨‍👩‍👧‍👦', desc: 'Perfect for families' },
            { name: 'Outdoor Fun', icon: '🌳', desc: 'Fresh air activities' }
          ].map((suggestion) => (
            <button key={suggestion.name} className="text-left p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="text-lg mb-1">{suggestion.icon}</div>
              <div className="font-medium text-sm text-gray-900">{suggestion.name}</div>
              <div className="text-xs text-gray-600">{suggestion.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategoriesSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Filter className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse by Category</h3>
        <p className="text-gray-600">Find events that match your interests</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {eventCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm opacity-75 mt-1">{category.count} events</p>
            </button>
          );
        })}
      </div>

      {selectedCategory !== 'all' && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            {eventCategories.find(c => c.id === selectedCategory)?.name} Events
          </h4>
          <div className="grid gap-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-2xl">{event.emoji}</div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{event.title}</h5>
                  <p className="text-sm text-gray-600">{event.date} • {event.location}</p>
                </div>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSavedSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Events</h3>
        <p className="text-gray-600">Events you&apos;re interested in attending</p>
      </div>

      <div className="space-y-3">
        {savedEvents.map((event) => (
          <div key={event.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📅</div>
              <div>
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.date} • {event.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">
                Remind me: {event.reminder}
              </div>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
        <Search className="w-5 h-5 mx-auto mb-1" />
        Discover More Events to Save
      </button>
    </div>
  );

  const renderFeaturedSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Events</h3>
        <p className="text-gray-600">Highlighted community happenings</p>
      </div>

      <div className="grid gap-6">
        {featuredEvents.map((event) => (
          <div key={event.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{event.image}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-xl">{event.title}</h4>
                <p className="text-gray-600 mt-1">{event.date}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                    {event.highlight}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                    {event.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Learn More
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Save Event
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Ticket className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Event Notifications</h4>
            <p className="text-sm text-blue-700 mt-1">
              Get notified about new featured events and community happenings in your area
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as 'discover' | 'categories' | 'saved' | 'featured')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      {activeSection === 'discover' && renderDiscoverSection()}
      {activeSection === 'categories' && renderCategoriesSection()}
      {activeSection === 'saved' && renderSavedSection()}
      {activeSection === 'featured' && renderFeaturedSection()}
    </div>
  );
});

LocalEventsTab.displayName = 'LocalEventsTab';