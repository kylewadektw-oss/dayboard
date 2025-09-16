/**
 * Entertainment Preferences Settings Component
 * Allows users to customize their entertainment recommendations
 */

'use client';

import { useState } from 'react';
import { useEntertainmentPreferences } from '@/hooks/useEntertainmentPreferences';
import { motion } from 'framer-motion';

interface PreferenceSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function PreferenceSection({
  title,
  icon,
  children,
  isOpen,
  onToggle
}: PreferenceSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ⌄
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200 p-6"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => toggleOption(option)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              selected.includes(option)
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EntertainmentPreferencesSettings() {
  const {
    preferences,
    updateMoviePreferences,
    updateMusicPreferences,
    updateEventPreferences,
    updateGamePreferences,
    resetPreferences,
    isLoading
  } = useEntertainmentPreferences();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    movies: true,
    music: false,
    events: false,
    games: false
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Entertainment Preferences
          </h1>
          <p className="text-gray-600 mt-1">
            Customize your recommendations and discovery experience
          </p>
        </div>

        <button
          onClick={resetPreferences}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Movies Preferences */}
      <PreferenceSection
        title="Movies & TV"
        icon="🎬"
        isOpen={openSections.movies}
        onToggle={() => toggleSection('movies')}
      >
        <div className="space-y-6">
          <MultiSelect
            label="Favorite Genres"
            options={[
              'Action',
              'Adventure',
              'Comedy',
              'Drama',
              'Horror',
              'Romance',
              'Sci-Fi',
              'Thriller',
              'Documentary',
              'Animation'
            ]}
            selected={preferences.movies.favoriteGenres}
            onChange={(genres) =>
              updateMoviePreferences({ favoriteGenres: genres })
            }
          />

          <MultiSelect
            label="Preferred Ratings"
            options={['G', 'PG', 'PG-13', 'R', 'NC-17', 'Not Rated']}
            selected={preferences.movies.preferredRatings}
            onChange={(ratings) =>
              updateMoviePreferences({ preferredRatings: ratings })
            }
          />

          <MultiSelect
            label="Streaming Services"
            options={[
              'Netflix',
              'Hulu',
              'Prime Video',
              'Disney+',
              'HBO Max',
              'Apple TV+',
              'Paramount+',
              'Peacock'
            ]}
            selected={preferences.movies.streamingServices}
            onChange={(services) =>
              updateMoviePreferences({ streamingServices: services })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Watch Time
            </label>
            <div className="flex space-x-3">
              {[
                { value: 'short', label: 'Short (< 90 min)' },
                { value: 'medium', label: 'Medium (90-150 min)' },
                { value: 'long', label: 'Long (> 150 min)' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    updateMoviePreferences({
                      watchTime: option.value as 'short' | 'medium' | 'long'
                    })
                  }
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    preferences.movies.watchTime === option.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PreferenceSection>

      {/* Music Preferences */}
      <PreferenceSection
        title="Music"
        icon="🎵"
        isOpen={openSections.music}
        onToggle={() => toggleSection('music')}
      >
        <div className="space-y-6">
          <MultiSelect
            label="Favorite Genres"
            options={[
              'Pop',
              'Rock',
              'Hip-Hop',
              'R&B',
              'Country',
              'Electronic',
              'Jazz',
              'Classical',
              'Alternative',
              'Indie'
            ]}
            selected={preferences.music.favoriteGenres}
            onChange={(genres) =>
              updateMusicPreferences({ favoriteGenres: genres })
            }
          />

          <MultiSelect
            label="Preferred Era"
            options={[
              '1960s',
              '1970s',
              '1980s',
              '1990s',
              '2000s',
              '2010s',
              '2020s'
            ]}
            selected={preferences.music.preferredEra}
            onChange={(era) => updateMusicPreferences({ preferredEra: era })}
          />

          <MultiSelect
            label="Streaming Services"
            options={[
              'Spotify',
              'Apple Music',
              'YouTube Music',
              'Amazon Music',
              'Pandora',
              'Tidal'
            ]}
            selected={preferences.music.streamingServices}
            onChange={(services) =>
              updateMusicPreferences({ streamingServices: services })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Discovery Mode
            </label>
            <div className="flex space-x-3">
              {[
                { value: 'similar', label: 'Similar to favorites' },
                { value: 'diverse', label: 'Diverse exploration' },
                { value: 'trending', label: "What's trending" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    updateMusicPreferences({
                      discoveryMode: option.value as
                        | 'similar'
                        | 'diverse'
                        | 'trending'
                    })
                  }
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    preferences.music.discoveryMode === option.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PreferenceSection>

      {/* Events Preferences */}
      <PreferenceSection
        title="Local Events"
        icon="🎪"
        isOpen={openSections.events}
        onToggle={() => toggleSection('events')}
      >
        <div className="space-y-6">
          <MultiSelect
            label="Event Categories"
            options={[
              'Music',
              'Food & Drink',
              'Arts',
              'Sports',
              'Technology',
              'Business',
              'Health',
              'Family',
              'Community',
              'Education'
            ]}
            selected={preferences.events.categories}
            onChange={(categories) => updateEventPreferences({ categories })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Maximum Distance: {preferences.events.maxDistance} miles
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={preferences.events.maxDistance}
              onChange={(e) =>
                updateEventPreferences({
                  maxDistance: parseInt(e.target.value)
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range: ${preferences.events.priceRange[0]} - $
              {preferences.events.priceRange[1]}
            </label>
            <div className="flex space-x-4">
              <input
                type="range"
                min="0"
                max="500"
                value={preferences.events.priceRange[0]}
                onChange={(e) =>
                  updateEventPreferences({
                    priceRange: [
                      parseInt(e.target.value),
                      preferences.events.priceRange[1]
                    ]
                  })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="500"
                value={preferences.events.priceRange[1]}
                onChange={(e) =>
                  updateEventPreferences({
                    priceRange: [
                      preferences.events.priceRange[0],
                      parseInt(e.target.value)
                    ]
                  })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <MultiSelect
            label="Time Preferences"
            options={['Morning', 'Afternoon', 'Evening', 'Weekend', 'Weekday']}
            selected={preferences.events.timePreferences}
            onChange={(times) =>
              updateEventPreferences({ timePreferences: times })
            }
          />
        </div>
      </PreferenceSection>

      {/* Games Preferences */}
      <PreferenceSection
        title="Games"
        icon="🎲"
        isOpen={openSections.games}
        onToggle={() => toggleSection('games')}
      >
        <div className="space-y-6">
          <MultiSelect
            label="Game Categories"
            options={[
              'Strategy',
              'Party',
              'Cooperative',
              'Competitive',
              'Puzzle',
              'Adventure',
              'Family',
              'Adult',
              'Quick',
              'Board Games'
            ]}
            selected={preferences.games.categories}
            onChange={(categories) => updateGamePreferences({ categories })}
          />

          <MultiSelect
            label="Player Count"
            options={['1', '2', '3', '4', '5', '6', '7', '8+']}
            selected={preferences.games.playerCount.map(String)}
            onChange={(counts) =>
              updateGamePreferences({
                playerCount: counts.map((c) => (c === '8+' ? 8 : parseInt(c)))
              })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Game Complexity
            </label>
            <div className="flex space-x-3">
              {[
                { value: 'simple', label: 'Simple & Easy' },
                { value: 'medium', label: 'Medium Challenge' },
                { value: 'complex', label: 'Complex & Strategic' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    updateGamePreferences({
                      complexity: option.value as
                        | 'simple'
                        | 'medium'
                        | 'complex'
                    })
                  }
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    preferences.games.complexity === option.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Game Length
            </label>
            <div className="flex space-x-3">
              {[
                { value: 'quick', label: 'Quick (< 30 min)' },
                { value: 'medium', label: 'Medium (30-90 min)' },
                { value: 'long', label: 'Long (> 90 min)' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    updateGamePreferences({
                      gameLength: option.value as 'quick' | 'medium' | 'long'
                    })
                  }
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    preferences.games.gameLength === option.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PreferenceSection>

      {/* Save confirmation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-sm text-green-700">
          ✅ Your preferences are automatically saved and will be used to
          personalize your recommendations
        </p>
      </div>
    </div>
  );
}
