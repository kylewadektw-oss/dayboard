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

// 🚀 Performance Optimized Theme Configuration for Magic 8-Ball
// Memoized theme classes to prevent recreation on each render

export type ThemeType =
  | 'classic'
  | 'mystic'
  | 'retro'
  | 'neon'
  | 'galaxy'
  | 'minimalist';

// 🎯 Pre-computed theme configurations (no runtime calculation)
export const MAGIC_8_BALL_THEMES = {
  classic: {
    container: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
    name: 'Classic',
    primaryColor: 'from-blue-900 to-purple-900',
    textColor: 'text-white',
    description: 'Traditional mystical black 8-ball'
  },
  mystic: {
    container: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-black',
    name: 'Mystic',
    primaryColor: 'from-purple-600 to-pink-600',
    textColor: 'text-purple-100',
    description: 'Enchanted purple crystal ball'
  },
  retro: {
    container: 'bg-gradient-to-br from-orange-800 via-red-900 to-black',
    name: 'Retro',
    primaryColor: 'from-orange-500 to-red-500',
    textColor: 'text-orange-100',
    description: 'Vintage 70s disco ball'
  },
  neon: {
    container: 'bg-gradient-to-br from-green-900 via-cyan-900 to-black',
    name: 'Neon',
    primaryColor: 'from-green-400 to-cyan-400',
    textColor: 'text-green-100',
    description: 'Electric cyberpunk orb'
  },
  galaxy: {
    container: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
    name: 'Galaxy',
    primaryColor: 'from-indigo-500 to-purple-500',
    textColor: 'text-indigo-100',
    description: 'Cosmic starfield sphere'
  },
  minimalist: {
    container: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300',
    name: 'Minimal',
    primaryColor: 'from-gray-600 to-gray-700',
    textColor: 'text-gray-800',
    description: 'Clean modern design'
  }
} as const;

// 🚀 Memoized theme class generator
export const getThemeClass = (theme: ThemeType): string => {
  return (
    MAGIC_8_BALL_THEMES[theme]?.container ||
    MAGIC_8_BALL_THEMES.classic.container
  );
};

// 🎯 Pre-computed magic 8-ball answers (no runtime generation)
export const MAGIC_8_BALL_ANSWERS = [
  // Positive responses (40%)
  'It is certain',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',

  // Neutral responses (30%)
  'Cannot predict now',
  'Concentrate and ask again',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',

  // Negative responses (30%)
  'Very doubtful',
  "Don't bet on it",
  'Forget about it',
  'Not in your lifetime',
  'Absolutely not',
  'No way',
  "I wouldn't count on it",
  'Unlikely'
] as const;

// 🚀 Performance: Pre-computed random answer selector
export const getRandomAnswer = (): string => {
  const randomIndex = Math.floor(Math.random() * MAGIC_8_BALL_ANSWERS.length);
  return MAGIC_8_BALL_ANSWERS[randomIndex];
};

// 🎯 Pre-computed surprise questions (no runtime generation)
export const SURPRISE_QUESTIONS = [
  'Will today be a good day?',
  'Should I try something new?',
  'Will I learn something interesting today?',
  'Is now a good time to take a break?',
  'Should I call a friend today?',
  'Will I have a productive day?',
  'Is it time to start that project?',
  'Should I go outside today?',
  'Will I discover something cool today?',
  'Is today perfect for an adventure?',
  'Should I try a new recipe?',
  'Will I make someone smile today?',
  'Is it time to reorganize something?',
  'Should I listen to new music today?',
  "Will I have an 'aha!' moment today?"
] as const;

// 🚀 Performance: Pre-computed random question selector
export const getRandomSurpriseQuestion = (): string => {
  const randomIndex = Math.floor(Math.random() * SURPRISE_QUESTIONS.length);
  return SURPRISE_QUESTIONS[randomIndex];
};

// 🎯 Animation configurations (memoized)
export const ANIMATION_CONFIG = {
  shake: {
    duration: 1000,
    iterations: 'infinite',
    keyframes: [
      { transform: 'translate(0)' },
      { transform: 'translate(-2px, -2px)' },
      { transform: 'translate(2px, -2px)' },
      { transform: 'translate(-2px, 2px)' },
      { transform: 'translate(2px, 2px)' },
      { transform: 'translate(0)' }
    ]
  },
  reveal: {
    duration: 800,
    easing: 'ease-out',
    keyframes: [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1.05)' },
      { opacity: 1, transform: 'scale(1)' }
    ]
  },
  confetti: {
    count: 50,
    spread: 70,
    origin: { y: 0.6 }
  }
} as const;

// 🚀 Performance utilities for theme operations
export const themeUtils = {
  // Pre-computed theme validation
  isValidTheme: (theme: string): theme is ThemeType => {
    return theme in MAGIC_8_BALL_THEMES;
  },

  // Memoized theme list for dropdowns
  getThemeOptions: () =>
    Object.entries(MAGIC_8_BALL_THEMES).map(([key, value]) => ({
      value: key as ThemeType,
      label: value.name,
      description: value.description
    })),

  // Performance: Fast theme contrast detection
  isDarkTheme: (theme: ThemeType): boolean => {
    return theme !== 'minimalist';
  },

  // Optimized theme comparison
  getThemeStyle: (theme: ThemeType) =>
    MAGIC_8_BALL_THEMES[theme] || MAGIC_8_BALL_THEMES.classic
};

// 🎯 Sound configurations (pre-computed frequencies)
export const SOUND_CONFIG = {
  shake: { frequency: 220, duration: 100, type: 'sawtooth' as OscillatorType },
  reveal: { frequency: 440, duration: 200, type: 'sine' as OscillatorType },
  success: { frequency: 880, duration: 150, type: 'triangle' as OscillatorType }
} as const;

// 🚀 Performance: Memoized sound generator
export const createOptimizedSound = (
  config: (typeof SOUND_CONFIG)[keyof typeof SOUND_CONFIG]
) => {
  if (typeof window === 'undefined' || !window.AudioContext) return null;

  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = config.frequency;
    oscillator.type = config.type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + config.duration / 1000
    );

    return { oscillator, audioContext, duration: config.duration };
  } catch (error) {
    console.warn('Audio not supported:', error);
    return null;
  }
};

// 🎯 Export optimized constants for easy importing
export const PERFORMANCE_CONSTANTS = {
  CACHE_TTL: {
    HISTORY: 3 * 60 * 1000, // 3 minutes
    STATS: 10 * 60 * 1000, // 10 minutes
    THEMES: Infinity // Never expire (static data)
  },
  ANIMATION_DELAYS: {
    SHAKE_START: 100,
    REVEAL_START: 1100,
    CONFETTI_START: 1200
  },
  DEBOUNCE_DELAYS: {
    QUESTION_INPUT: 300,
    STATS_REFRESH: 1000,
    HISTORY_REFRESH: 500
  }
} as const;
