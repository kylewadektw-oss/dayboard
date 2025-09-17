/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { memo, useState } from 'react';
import {
  Music,
  Calendar,
  MapPin,
  Users,
  Heart,
  Play,
  Plus,
  Search,
  Headphones,
  Mic,
  Volume2,
  Star,
  ExternalLink
} from 'lucide-react';

// Mock data for demonstration - would integrate with Spotify, Apple Music, Last.fm, Songkick APIs
const trendingMusic = [
  {
    id: 1,
    title: 'Flowers',
    artist: 'Miley Cyrus',
    album: 'Endless Summer Vacation',
    genre: 'Pop',
    duration: '3:22',
    artwork: '🌸',
    streamingLinks: {
      spotify: 'https://open.spotify.com/track/...',
      apple: 'https://music.apple.com/album/...',
      youtube: 'https://youtube.com/watch?v=...'
    }
  },
  {
    id: 2,
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    genre: 'Pop',
    duration: '3:20',
    artwork: '💜',
    streamingLinks: {
      spotify: 'https://open.spotify.com/track/...',
      apple: 'https://music.apple.com/album/...'
    }
  },
  {
    id: 3,
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    genre: 'Pop Rock',
    duration: '2:47',
    artwork: '🎭',
    streamingLinks: {
      spotify: 'https://open.spotify.com/track/...',
      apple: 'https://music.apple.com/album/...'
    }
  }
];

const familyPlaylists = [
  {
    id: 1,
    name: 'Family Road Trip',
    creator: 'Dad',
    songCount: 42,
    duration: '2h 35m',
    genre: 'Mixed',
    emoji: '🚗',
    lastUpdated: '2 days ago'
  },
  {
    id: 2,
    name: 'Morning Motivation',
    creator: 'Mom',
    songCount: 25,
    duration: '1h 22m',
    genre: 'Pop/Rock',
    emoji: '☀️',
    lastUpdated: '1 week ago'
  },
  {
    id: 3,
    name: 'Kids Dance Party',
    creator: 'Kids',
    songCount: 38,
    duration: '2h 8m',
    genre: 'Family Friendly',
    emoji: '🎉',
    lastUpdated: '3 days ago'
  }
];

const upcomingConcerts = [
  {
    id: 1,
    artist: 'Imagine Dragons',
    venue: 'Madison Square Garden',
    date: 'Feb 15, 2025',
    time: '8:00 PM',
    price: '$75 - $250',
    distance: '12 miles',
    genre: 'Rock',
    emoji: '🐉',
    ticketLink: 'https://ticketmaster.com/...'
  },
  {
    id: 2,
    artist: 'Billie Eilish',
    venue: 'Barclays Center',
    date: 'Feb 28, 2025',
    time: '7:30 PM',
    price: '$80 - $200',
    distance: '8 miles',
    genre: 'Alternative',
    emoji: '🎤',
    ticketLink: 'https://ticketmaster.com/...'
  },
  {
    id: 3,
    artist: 'Local Jazz Festival',
    venue: 'Central Park',
    date: 'Mar 5, 2025',
    time: '6:00 PM',
    price: 'Free',
    distance: '5 miles',
    genre: 'Jazz',
    emoji: '🎷',
    ticketLink: null
  }
];

const musicRecommendations = [
  {
    category: 'Based on Your Family&apos;s Listening',
    items: [
      {
        name: 'Ed Sheeran',
        type: 'Artist',
        reason: 'Similar to recent plays',
        emoji: '🎸'
      },
      {
        name: 'Uptown Funk',
        type: 'Song',
        reason: 'You love Bruno Mars',
        emoji: '🕺'
      },
      {
        name: 'Feel-Good Pop Hits',
        type: 'Playlist',
        reason: 'Matches your vibe',
        emoji: '✨'
      }
    ]
  },
  {
    category: 'Trending in Your Area',
    items: [
      {
        name: 'Local Indie Rock',
        type: 'Genre',
        reason: 'Popular nearby',
        emoji: '🎸'
      },
      {
        name: 'Coffee Shop Acoustic',
        type: 'Mood',
        reason: 'Trending locally',
        emoji: '☕'
      },
      {
        name: 'NYC Hip-Hop Scene',
        type: 'Scene',
        reason: 'Local artists',
        emoji: '🏙️'
      }
    ]
  }
];

export const MusicTab = memo(() => {
  const [activeSection, setActiveSection] = useState<
    'discover' | 'playlists' | 'concerts' | 'recommendations'
  >('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'discover', label: 'Discover', icon: Music },
    { id: 'playlists', label: 'Playlists', icon: Heart },
    { id: 'concerts', label: 'Concerts', icon: Calendar },
    { id: 'recommendations', label: 'For You', icon: Star }
  ];

  const renderDiscoverSection = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Trending Songs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎵 Trending Now
        </h3>
        <div className="space-y-3">
          {trendingMusic.map((song) => (
            <div
              key={song.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">{song.artwork}</div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {song.title}
                    </h4>
                    <p className="text-gray-600 text-sm truncate">
                      {song.artist} • {song.album}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {song.genre}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {song.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Streaming Links */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                {Object.entries(song.streamingLinks).map(([platform]) => (
                  <button
                    key={platform}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {platform === 'spotify'
                      ? 'Spotify'
                      : platform === 'apple'
                        ? 'Apple'
                        : 'YouTube'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Services */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎧 Connect Your Music
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Spotify', emoji: '🎵', color: 'green' },
            { name: 'Apple Music', emoji: '🍎', color: 'red' },
            { name: 'YouTube Music', emoji: '📺', color: 'red' },
            { name: 'Pandora', emoji: '📻', color: 'blue' }
          ].map((service) => (
            <div
              key={service.name}
              className={`bg-${service.color}-50 border border-${service.color}-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="text-2xl mb-2">{service.emoji}</div>
              <h4 className="font-medium text-gray-900">{service.name}</h4>
              <p className="text-sm text-gray-600 mt-1">Connect</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlaylistsSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Headphones className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Family Playlists
        </h3>
        <p className="text-gray-600">
          Shared music collections for every occasion
        </p>
      </div>

      <div className="grid gap-4">
        {familyPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{playlist.emoji}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{playlist.name}</h4>
                <p className="text-sm text-gray-600">
                  Created by {playlist.creator}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{playlist.songCount} songs</span>
                  <span>•</span>
                  <span>{playlist.duration}</span>
                  <span>•</span>
                  <span>{playlist.genre}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-full">
                  <Play className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full">
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors">
        <Plus className="w-5 h-5 mx-auto mb-1" />
        Create New Family Playlist
      </button>
    </div>
  );

  const renderConcertsSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Mic className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upcoming Concerts
        </h3>
        <p className="text-gray-600">Live music events near you</p>
      </div>

      <div className="space-y-4">
        {upcomingConcerts.map((concert) => (
          <div
            key={concert.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{concert.emoji}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {concert.artist}
                </h4>
                <div className="space-y-1 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{concert.venue}</span>
                    <span className="text-gray-400">•</span>
                    <span>{concert.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{concert.date}</span>
                    <span className="text-gray-400">•</span>
                    <span>{concert.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>{concert.genre}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium">{concert.price}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {concert.ticketLink ? (
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Get Tickets
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    Free Event
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Interested
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Concert Notifications</h4>
            <p className="text-sm text-blue-700 mt-1">
              Get notified when your favorite artists announce shows in your
              area
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendationsSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Music Recommendations
        </h3>
        <p className="text-gray-600">
          Discover new music tailored to your family&apos;s taste
        </p>
      </div>

      {musicRecommendations.map((section, index) => (
        <div key={index} className="space-y-4">
          <h4 className="font-semibold text-gray-900">{section.category}</h4>
          <div className="grid gap-3">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="text-2xl">{item.emoji}</div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                  <p className="text-sm text-gray-600">
                    {item.type} • {item.reason}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Music className="w-5 h-5 text-purple-600" />
          <div>
            <h4 className="font-medium text-purple-900">Music Discovery</h4>
            <p className="text-sm text-purple-700 mt-1">
              Based on your listening history, we&apos;ll suggest new artists
              and songs your family might love
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
              onClick={() =>
                setActiveSection(
                  section.id as
                    | 'discover'
                    | 'playlists'
                    | 'concerts'
                    | 'recommendations'
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-100 text-green-700 border border-green-200'
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
      {activeSection === 'playlists' && renderPlaylistsSection()}
      {activeSection === 'concerts' && renderConcertsSection()}
      {activeSection === 'recommendations' && renderRecommendationsSection()}
    </div>
  );
});

MusicTab.displayName = 'MusicTab';
