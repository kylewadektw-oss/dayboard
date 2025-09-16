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
  Film,
  Clock,
  MapPin,
  Star,
  Calendar,
  Plus,
  Play,
  Heart,
  Search,
  Filter,
  Users,
  Popcorn
} from 'lucide-react';

// Mock data for demonstration - in real app, this would come from APIs like TMDB, Fandango, etc.
const trendingMovies = [
  {
    id: 1,
    title: 'Guardians of the Galaxy Vol. 3',
    rating: 8.5,
    genre: 'Action, Adventure, Comedy',
    duration: '2h 30m',
    poster: '🦝',
    description:
      'The final chapter in the beloved trilogy follows Peter Quill and the team...',
    theaters: ['AMC Valley View', 'Regal Cinemas', 'Century Theaters'],
    showtimes: ['2:30 PM', '5:45 PM', '8:30 PM'],
    streaming: ['Disney+', 'Prime Video (Rent)']
  },
  {
    id: 2,
    title: 'Spider-Man: Across the Spider-Verse',
    rating: 9.1,
    genre: 'Animation, Action, Adventure',
    duration: '2h 20m',
    poster: '🕷️',
    description: 'Miles Morales catapults across the Multiverse...',
    theaters: ['AMC Valley View', 'Century Theaters'],
    showtimes: ['1:15 PM', '4:00 PM', '7:15 PM', '10:00 PM'],
    streaming: ['Netflix', 'Apple TV (Rent)']
  },
  {
    id: 3,
    title: 'The Little Mermaid',
    rating: 7.8,
    genre: 'Family, Fantasy, Musical',
    duration: '2h 15m',
    poster: '🧜‍♀️',
    description:
      'The beloved Disney classic comes to life in this live-action adaptation...',
    theaters: ['Regal Cinemas', 'Century Theaters'],
    showtimes: ['12:30 PM', '3:15 PM', '6:00 PM', '8:45 PM'],
    streaming: ['Disney+']
  }
];

const familyWatchlist = [
  { id: 1, title: 'Finding Nemo', addedBy: 'Mom', priority: 'High' },
  { id: 2, title: 'The Incredibles 2', addedBy: 'Kids', priority: 'Medium' },
  { id: 3, title: 'Toy Story 4', addedBy: 'Dad', priority: 'Low' }
];

const upcomingMovieNights = [
  {
    id: 1,
    date: 'Fri, Jan 19',
    movie: 'Family Movie Night',
    attendees: ['Mom', 'Dad', 'Kids'],
    snacks: 'Popcorn & Hot Chocolate',
    location: 'Living Room'
  },
  {
    id: 2,
    date: 'Sat, Jan 27',
    movie: 'Date Night',
    attendees: ['Mom', 'Dad'],
    theater: 'AMC Valley View',
    time: '7:30 PM'
  }
];

export const MoviesTab = memo(() => {
  const [activeSection, setActiveSection] = useState<
    'discover' | 'theaters' | 'watchlist' | 'nights'
  >('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'discover', label: 'Discover', icon: Film },
    { id: 'theaters', label: 'Theaters', icon: MapPin },
    { id: 'watchlist', label: 'Watchlist', icon: Heart },
    { id: 'nights', label: 'Movie Nights', icon: Calendar }
  ];

  const renderDiscoverSection = () => (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search movies, actors, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Trending Movies */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔥 Trending Now
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{movie.poster}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {movie.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{movie.rating}</span>
                    <span className="text-sm text-gray-500">
                      • {movie.duration}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{movie.genre}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {movie.description}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200">
                      <Plus className="w-3 h-3" />
                      Watchlist
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200">
                      <Calendar className="w-3 h-3" />
                      Plan Night
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streaming Services */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📺 Now Streaming
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Netflix', 'Disney+', 'Prime Video', 'Apple TV+'].map((service) => (
            <div
              key={service}
              className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-2xl mb-2">
                {service === 'Netflix'
                  ? '🎬'
                  : service === 'Disney+'
                    ? '🏰'
                    : service === 'Prime Video'
                      ? '📦'
                      : '🍎'}
              </div>
              <h4 className="font-medium text-gray-900">{service}</h4>
              <p className="text-sm text-gray-600 mt-1">Browse catalog</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTheatersSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Local Theaters & Showtimes
        </h3>
        <p className="text-gray-600">Find movie times at theaters near you</p>
      </div>

      <div className="grid gap-4">
        {[
          'AMC Valley View 16',
          'Regal Cinemas Downtown',
          'Century Theaters Plaza'
        ].map((theater, index) => (
          <div
            key={theater}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{theater}</h4>
                <p className="text-sm text-gray-600">
                  📍{' '}
                  {index === 0
                    ? '2.1 miles away'
                    : index === 1
                      ? '3.5 miles away'
                      : '4.2 miles away'}
                </p>
              </div>
              <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200">
                Get Directions
              </button>
            </div>

            <div className="space-y-2">
              {trendingMovies.slice(0, 2).map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between py-2 border-t border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{movie.poster}</span>
                    <div>
                      <p className="font-medium text-sm">{movie.title}</p>
                      <p className="text-xs text-gray-600">{movie.duration}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {movie.showtimes.slice(0, 3).map((time) => (
                      <button
                        key={time}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWatchlistSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Family Watchlist
        </h3>
        <p className="text-gray-600">Movies everyone wants to watch together</p>
      </div>

      <div className="space-y-3">
        {familyWatchlist.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎬</div>
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">Added by {item.addedBy}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  item.priority === 'High'
                    ? 'bg-red-100 text-red-700'
                    : item.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {item.priority}
              </span>
              <button className="p-2 text-gray-400 hover:text-purple-600">
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors">
        <Plus className="w-5 h-5 mx-auto mb-1" />
        Add Movie to Watchlist
      </button>
    </div>
  );

  const renderMovieNightsSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Popcorn className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Planned Movie Nights
        </h3>
        <p className="text-gray-600">Upcoming family movie experiences</p>
      </div>

      <div className="space-y-4">
        {upcomingMovieNights.map((night) => (
          <div
            key={night.id}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{night.movie}</h4>
              <span className="text-sm font-medium text-purple-700">
                {night.date}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  Attendees: {night.attendees.join(', ')}
                </span>
              </div>

              {night.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{night.location}</span>
                </div>
              )}

              {night.theater && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {night.theater} at {night.time}
                  </span>
                </div>
              )}

              {night.snacks && (
                <div className="flex items-center gap-2">
                  <Popcorn className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{night.snacks}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors">
        <Calendar className="w-5 h-5 mx-auto mb-1" />
        Plan New Movie Night
      </button>
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
              onClick={() =>
                setActiveSection(
                  section.id as 'discover' | 'theaters' | 'watchlist' | 'nights'
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
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
      {activeSection === 'theaters' && renderTheatersSection()}
      {activeSection === 'watchlist' && renderWatchlistSection()}
      {activeSection === 'nights' && renderMovieNightsSection()}
    </div>
  );
});

MoviesTab.displayName = 'MoviesTab';
