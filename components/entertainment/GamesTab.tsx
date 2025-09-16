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
  Gamepad2,
  Users,
  Clock,
  Star,
  Play,
  Plus,
  Search,
  Trophy,
  Puzzle,
  Dice6,
  Zap,
  Brain,
  Heart,
  Calendar,
  Target
} from 'lucide-react';

// Mock data for demonstration - would integrate with BoardGameGeek, Steam, app stores, etc.
const boardGames = [
  {
    id: 1,
    title: 'Codenames',
    category: 'Board Game',
    players: '2-8 players',
    duration: '15-30 min',
    difficulty: 'Easy',
    rating: 4.8,
    emoji: '🕵️',
    description:
      'Team-based word game where you give one-word clues to help teammates identify their agents.',
    ages: '14+',
    owned: true,
    lastPlayed: '2 weeks ago'
  },
  {
    id: 2,
    title: 'Ticket to Ride',
    category: 'Board Game',
    players: '2-5 players',
    duration: '30-60 min',
    difficulty: 'Medium',
    rating: 4.6,
    emoji: '🚂',
    description:
      'Railway adventure where players collect train cards to claim railway routes across the country.',
    ages: '8+',
    owned: true,
    lastPlayed: '1 month ago'
  },
  {
    id: 3,
    title: 'Azul',
    category: 'Board Game',
    players: '2-4 players',
    duration: '30-45 min',
    difficulty: 'Medium',
    rating: 4.7,
    emoji: '🎨',
    description: 'Beautiful tile-laying game inspired by Portuguese azulejos.',
    ages: '8+',
    owned: false,
    wishlist: true
  }
];

const digitalGames = [
  {
    id: 1,
    title: 'Jackbox Party Pack',
    category: 'Party Game',
    players: '3-8 players',
    platform: 'Any device',
    rating: 4.9,
    emoji: '🎉',
    description:
      'Collection of hilarious party games that everyone can play using their phones.'
  },
  {
    id: 2,
    title: 'Among Us',
    category: 'Social Deduction',
    players: '4-10 players',
    platform: 'Mobile/PC',
    rating: 4.5,
    emoji: '👾',
    description:
      'Work together to find the impostor among your crew before they eliminate everyone.'
  },
  {
    id: 3,
    title: 'Minecraft',
    category: 'Sandbox',
    players: '1-8 players',
    platform: 'All platforms',
    rating: 4.7,
    emoji: '⛏️',
    description: 'Build, explore, and survive in procedurally generated worlds.'
  }
];

const quickActivities = [
  {
    id: 1,
    name: '20 Questions',
    category: 'No Equipment',
    players: '2+ players',
    time: '5-15 min',
    emoji: '❓',
    description:
      'Classic guessing game where one person thinks of something and others ask yes/no questions.'
  },
  {
    id: 2,
    name: 'Two Truths and a Lie',
    category: 'Icebreaker',
    players: '3+ players',
    time: '10-20 min',
    emoji: '🤔',
    description:
      'Each person tells three statements about themselves - two true, one false.'
  },
  {
    id: 3,
    name: 'Story Building',
    category: 'Creative',
    players: '2+ players',
    time: '10-30 min',
    emoji: '📚',
    description:
      'Take turns adding one sentence to create a collaborative story.'
  },
  {
    id: 4,
    name: 'Charades',
    category: 'Acting',
    players: '4+ players',
    time: '15-30 min',
    emoji: '🎭',
    description: 'Act out words or phrases without speaking while others guess.'
  }
];

const gameNights = [
  {
    id: 1,
    date: 'Friday, Jan 19',
    theme: 'Family Game Night',
    games: ['Codenames', 'Ticket to Ride'],
    attendees: ['Mom', 'Dad', 'Kids'],
    snacks: 'Pizza & Soda',
    status: 'planned'
  },
  {
    id: 2,
    date: 'Saturday, Jan 27',
    theme: 'Friends Game Night',
    games: ['Jackbox Games', 'Among Us'],
    attendees: ['Couple Friends', 'College Friends'],
    snacks: 'Snack mix & Beer',
    status: 'planned'
  }
];

const achievements = [
  {
    id: 1,
    title: 'Game Night Host',
    description: 'Hosted 5 game nights',
    earned: true,
    emoji: '🏆'
  },
  {
    id: 2,
    title: 'Strategy Master',
    description: 'Won 10 strategy games',
    earned: true,
    emoji: '🧠'
  },
  {
    id: 3,
    title: 'Social Butterfly',
    description: 'Played with 20 different people',
    earned: false,
    emoji: '🦋'
  },
  {
    id: 4,
    title: 'Quick Draw',
    description: 'Completed 50 quick activities',
    earned: false,
    emoji: '⚡'
  }
];

export const GamesTab = memo(() => {
  const [activeSection, setActiveSection] = useState<
    'collection' | 'digital' | 'activities' | 'nights'
  >('collection');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'collection', label: 'Collection', icon: Puzzle },
    { id: 'digital', label: 'Digital', icon: Gamepad2 },
    { id: 'activities', label: 'Activities', icon: Zap },
    { id: 'nights', label: 'Game Nights', icon: Calendar }
  ];

  const renderCollectionSection = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search board games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">12</div>
          <div className="text-sm text-orange-700">Owned Games</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">5</div>
          <div className="text-sm text-blue-700">Wishlist</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-sm text-green-700">Played This Month</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">23</div>
          <div className="text-sm text-purple-700">Total Hours</div>
        </div>
      </div>

      {/* Board Games Collection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎲 Board Game Collection
        </h3>
        <div className="space-y-4">
          {boardGames.map((game) => (
            <div
              key={game.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{game.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {game.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {game.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{game.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{game.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      <span>{game.difficulty}</span>
                    </div>
                    <span>Ages {game.ages}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      {game.owned ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          ✓ Owned
                        </span>
                      ) : game.wishlist ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          ♡ Wishlist
                        </span>
                      ) : null}
                      {game.lastPlayed && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          Last played: {game.lastPlayed}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200">
                        <Play className="w-4 h-4 inline mr-1" />
                        Play Now
                      </button>
                      {!game.owned && (
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                          <Heart className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors">
        <Plus className="w-5 h-5 mx-auto mb-1" />
        Add New Game to Collection
      </button>
    </div>
  );

  const renderDigitalSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Gamepad2 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Digital Games
        </h3>
        <p className="text-gray-600">
          Video games and digital party games for all devices
        </p>
      </div>

      <div className="grid gap-4">
        {digitalGames.map((game) => (
          <div
            key={game.id}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{game.emoji}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{game.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{game.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>👥 {game.players}</span>
                  <span>📱 {game.platform}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{game.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Launch Game
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  How to Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">Gaming Platforms</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Steam', 'Xbox Game Pass', 'Nintendo Switch', 'Mobile Games'].map(
            (platform) => (
              <div
                key={platform}
                className="text-center p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-lg mb-1">
                  {platform === 'Steam'
                    ? '🎮'
                    : platform === 'Xbox Game Pass'
                      ? '🎯'
                      : platform === 'Nintendo Switch'
                        ? '🕹️'
                        : '📱'}
                </div>
                <div className="font-medium text-sm text-gray-900">
                  {platform}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderActivitiesSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quick Activities
        </h3>
        <p className="text-gray-600">
          No-equipment games you can play anywhere, anytime
        </p>
      </div>

      <div className="grid gap-4">
        {quickActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{activity.emoji}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                <p className="text-gray-600 text-sm mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>👥 {activity.players}</span>
                  <span>⏱️ {activity.time}</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    {activity.category}
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">
                <Play className="w-4 h-4 inline mr-1" />
                Start Game
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-3">
          🎯 Random Activity Generator
        </h4>
        <p className="text-sm text-yellow-800 mb-3">
          Can&apos;t decide what to play? Let us pick a perfect activity for
          your group!
        </p>
        <button className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium">
          <Dice6 className="w-4 h-4 inline mr-2" />
          Generate Random Activity
        </button>
      </div>
    </div>
  );

  const renderGameNightsSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-gold-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Game Nights & Achievements
        </h3>
        <p className="text-gray-600">
          Plan game nights and track your gaming accomplishments
        </p>
      </div>

      {/* Planned Game Nights */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">
          📅 Upcoming Game Nights
        </h4>
        <div className="space-y-3">
          {gameNights.map((night) => (
            <div
              key={night.id}
              className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{night.theme}</h5>
                <span className="text-sm font-medium text-orange-700">
                  {night.date}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    Games: {night.games.join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    Attendees: {night.attendees.join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Snacks: {night.snacks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">
          🏆 Gaming Achievements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.earned
                  ? 'bg-gold-50 border-gold-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{achievement.emoji}</div>
                <div className="flex-1">
                  <h5
                    className={`font-medium ${
                      achievement.earned ? 'text-gold-900' : 'text-gray-700'
                    }`}
                  >
                    {achievement.title}
                  </h5>
                  <p
                    className={`text-sm ${
                      achievement.earned ? 'text-gold-700' : 'text-gray-600'
                    }`}
                  >
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <div className="text-gold-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors">
        <Calendar className="w-5 h-5 mx-auto mb-1" />
        Plan New Game Night
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
                  section.id as
                    | 'collection'
                    | 'digital'
                    | 'activities'
                    | 'nights'
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
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
      {activeSection === 'collection' && renderCollectionSection()}
      {activeSection === 'digital' && renderDigitalSection()}
      {activeSection === 'activities' && renderActivitiesSection()}
      {activeSection === 'nights' && renderGameNightsSection()}
    </div>
  );
});

GamesTab.displayName = 'GamesTab';
