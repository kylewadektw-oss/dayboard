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

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Volume2, VolumeX, History, BarChart3, RotateCcw, Sparkles, RefreshCw } from 'lucide-react';
import { useMagic8Ball } from '@/hooks/useMagic8Ball';
import { enhancedLogger, LogLevel } from '@/utils/logger';

// Types
type ThemeType = 'classic' | 'mystic' | 'retro' | 'neon' | 'galaxy' | 'minimalist';
type WidgetState = 'idle' | 'shaking' | 'revealing' | 'result';

interface Magic8BallQuestion {
  id: string;
  question: string;
  answer: string;
  theme: string;
  created_at: string;
  household_id: string;
  asked_by: string;
}

interface Magic8BallWidgetProps {
  householdId?: string;
  userId?: string;
  className?: string;
}

interface Stats {
  totalQuestions: number;
  todaysQuestions: number;
  weeklyQuestions: number;
  mostPopularTheme: string;
  mostActiveUser?: string;
  userCounts: Record<string, any>;
}

// Theme-specific answer sets
const THEME_ANSWERS = {
  classic: [
    "It is certain", "Reply hazy, try again", "Don't count on it",
    "It is decidedly so", "Ask again later", "My reply is no",
    "Without a doubt", "Better not tell you now", "My sources say no",
    "Yes definitely", "Cannot predict now", "Outlook not so good",
    "You may rely on it", "Concentrate and ask again", "Very doubtful",
    "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes"
  ],
  mystic: [
    "The stars align in your favor", "The crystal ball is cloudy", "Dark forces say no",
    "Ancient wisdom says yes", "The spirits are uncertain", "The moon speaks against it",
    "Mystical energies say absolutely", "Consult the oracle again", "The tarot reveals doubt",
    "The universe conspires for you", "Magical forces are at work", "The ethereal realm says no"
  ],
  retro: [
    "Totally rad!", "Like, no way dude", "Far out, yes!",
    "Not groovy, man", "Right on!", "Bogus idea",
    "Absolutely tubular!", "That's not cool", "Gnarly outcome ahead",
    "Radical possibility", "Heavy, man... no", "Righteous vibes say yes"
  ],
  neon: [
    "NEON GREEN YES!", "ELECTRIC BLUE NO", "PLASMA PINK MAYBE",
    "CYBER YELLOW ABSOLUTELY", "DIGITAL PURPLE NEGATIVE", "HOLOGRAM SAYS YES",
    "LASER BEAM CONFIRMS", "PIXEL PERFECT NO", "MATRIX SAYS PROCEED",
    "SYNTHWAVE APPROVED", "RETROWAVE DENIED", "VAPORWAVE UNCERTAIN"
  ],
  galaxy: [
    "The cosmos says yes", "Black hole of doubt", "Supernova of certainty",
    "Asteroid belt of maybe", "Galactic council approves", "Solar winds say no",
    "Nebula of possibility", "Meteor shower of doubt", "Planetary alignment says yes",
    "Starlight confirms", "Dark matter disagrees", "Milky Way says maybe"
  ],
  minimalist: [
    "Yes", "No", "Maybe", "Certainly", "Unlikely", "Possible",
    "Definitely", "Doubtful", "Absolutely", "Never", "Perhaps", "Indeed"
  ]
};

// Theme styling classes for the 8-ball container only
const getThemeClass = (theme: ThemeType): string => {
  const themes = {
    classic: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900',
    mystic: 'bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-900',
    retro: 'bg-gradient-to-br from-orange-800 via-red-700 to-pink-800',
    neon: 'bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700',
    galaxy: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
    minimalist: 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800'
  };
  return themes[theme] || themes.classic;
};

const Magic8BallWidgetComponent: React.FC<Magic8BallWidgetProps> = ({ 
  householdId, 
  userId, 
  className = '' 
}) => {
  // State management
  const [state, setState] = useState<WidgetState>('idle');
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isShakeEnabled, setIsShakeEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<Magic8BallQuestion[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    todaysQuestions: 0,
    weeklyQuestions: 0,
    mostPopularTheme: 'classic',
    mostActiveUser: undefined,
    userCounts: {}
  });

  // Refs
  const ballRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Custom hook
  const { saveQuestion } = useMagic8Ball();

  // Shake detection
  useEffect(() => {
    if (!isShakeEnabled || typeof window === 'undefined') return;

    let lastTime = 0;
    const shakeThreshold = 15;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();
      if (now - lastTime < 100) return; // Throttle

      const deltaX = Math.abs(event.acceleration?.x || 0);
      const deltaY = Math.abs(event.acceleration?.y || 0);
      const deltaZ = Math.abs(event.acceleration?.z || 0);

      if (deltaX + deltaY + deltaZ > shakeThreshold && state === 'idle' && question.trim()) {
        handleShake();
      }

      lastTime = now;
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, [isShakeEnabled, state, question]);

  // Sound generation
  const playSound = useCallback((type: 'shake' | 'reveal') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'shake') {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [soundEnabled]);

  // Confetti effect
  const triggerConfetti = useCallback(() => {
    if (!confettiRef.current) return;

    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const confettiContainer = confettiRef.current;

    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '0%';
      confetti.style.width = '6px';
      confetti.style.height = '6px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.animation = `confetti-fall ${2 + Math.random() * 2}s linear forwards`;

      confettiContainer.appendChild(confetti);

      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 4000);
    }
  }, []);

  // Get random answer
  const getRandomAnswer = useCallback((selectedTheme: ThemeType): string => {
    const answers = THEME_ANSWERS[selectedTheme];
    return answers[Math.floor(Math.random() * answers.length)];
  }, []);

  // Shake animation and logic
  const handleShake = useCallback(async () => {
    if (state !== 'idle' || !question.trim()) return;

    setState('shaking');
    playSound('shake');

    // Ball shake animation
    if (ballRef.current) {
      ballRef.current.style.animation = 'magic8ball-shake 1s ease-in-out';
    }

    setTimeout(() => {
      setState('revealing');
      playSound('reveal');

      setTimeout(() => {
        const answer = getRandomAnswer(theme);
        setCurrentAnswer(answer);
        setState('result');

        // Trigger confetti for positive answers
        if (answer.toLowerCase().includes('yes') || 
            answer.toLowerCase().includes('certain') || 
            answer.toLowerCase().includes('definitely')) {
          triggerConfetti();
        }

        // Save to database
        if (householdId && userId) {
          saveQuestion(question, answer, theme, householdId)
            .then(() => {
              fetchRecentQuestions();
              fetchStats();
            })
            .catch(console.error);
        }
      }, 1500);
    }, 1000);
  }, [state, question, theme, playSound, getRandomAnswer, triggerConfetti, householdId, userId, saveQuestion]);

  // Reset for new question
  const handleAskAgain = useCallback(() => {
    setState('idle');
    setQuestion('');
    setCurrentAnswer('');
    if (ballRef.current) {
      ballRef.current.style.animation = '';
    }
  }, []);

  // Random question generator
  const handleSurpriseQuestion = useCallback(() => {
    const questions = [
      "Will today be a good day?", "Should I try something new?", "Will my dreams come true?",
      "Is it time for a change?", "Will I be successful?", "Should I take a risk?",
      "Will I find what I'm looking for?", "Is now the right time?", "Will things work out?",
      "Should I follow my heart?", "Will I be happy?", "Is this the right choice?"
    ];
    setQuestion(questions[Math.floor(Math.random() * questions.length)]);
  }, []);

  // Fetch recent questions
  const fetchRecentQuestions = useCallback(async () => {
    if (!householdId) return;
    
    try {
      const response = await fetch(`/api/magic8ball?household_id=${householdId}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setRecentQuestions(data.questions || []);
      }
    } catch (error) {
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to fetch Magic 8-Ball history", "Magic8BallWidget", {
        error: error instanceof Error ? error.message : 'Unknown error',
        householdId
      });
    }
  }, [householdId]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!householdId) return;

    try {
      const response = await fetch(`/api/magic8ball?household_id=${householdId}&stats=true`);
      const data = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [householdId]);

  // Load data on mount
  useEffect(() => {
    if (householdId) {
      fetchRecentQuestions();
      fetchStats();
    }
  }, [householdId, fetchRecentQuestions, fetchStats]);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 relative overflow-hidden ${className}`}>
      {/* Header - matches other dashboard widgets */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xl">🎱</div>
          <h3 className="text-sm font-medium text-gray-600">Magic 8-Ball</h3>
          {isShakeEnabled && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Shake enabled</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>

          {/* Theme selector */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeType)}
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-600"
          >
            <option value="classic">Classic</option>
            <option value="mystic">Mystic</option>
            <option value="retro">Retro</option>
            <option value="neon">Neon</option>
            <option value="galaxy">Galaxy</option>
            <option value="minimalist">Minimal</option>
          </select>

          {/* Action buttons */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="View recent questions"
          >
            <History className="w-3 h-3" />
          </button>

          <button
            onClick={() => setShowStats(!showStats)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="View statistics"
          >
            <BarChart3 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Confetti container */}
      <div ref={confettiRef} className="absolute inset-0 pointer-events-none z-50"></div>

      {/* Main 8-Ball Container - This is where the magic happens! */}
      <div className={`${getThemeClass(theme)} rounded-xl p-4 mb-4 relative overflow-hidden`}>
        {/* Theme-specific background effects for the 8-ball container */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white">
          {/* Main 8-Ball Interface */}
          <div className="text-center mb-6">
            {state === 'idle' && (
              <div className="space-y-4 fade-in-up">
                {/* 8-Ball Visual */}
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <div 
                    ref={ballRef}
                    className="w-full h-full bg-gradient-to-b from-gray-800 to-black rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-600 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => question.trim() && handleShake()}
                  >
                    <div className="w-16 h-16 bg-gradient-to-b from-blue-900 to-purple-900 rounded-full flex items-center justify-center">
                      <div className="text-white text-xs font-bold">8</div>
                    </div>
                  </div>
                </div>

                {/* Question Input */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ask the Magic 8-Ball a question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                    onKeyPress={(e) => e.key === 'Enter' && question.trim() && handleShake()}
                    maxLength={200}
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleSurpriseQuestion}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm"
                    >
                      Surprise Me!
                    </button>
                    <button
                      onClick={handleShake}
                      disabled={!question.trim()}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Sparkles className="w-4 h-4 inline-block mr-2" />
                      Shake the Ball!
                    </button>
                  </div>
                </div>
                
                {isShakeEnabled && (
                  <div className="text-xs text-white/60 mt-2">
                    💡 Tip: On mobile, physically shake your device to activate!
                  </div>
                )}
              </div>
            )}

            {state === 'shaking' && (
              <div className="space-y-6">
                <div className="relative mx-auto w-32 h-32">
                  <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-600 animate-bounce">
                    <div className="w-16 h-16 bg-gradient-to-b from-blue-900 to-purple-900 rounded-full flex items-center justify-center">
                      <div className="text-white text-xs font-bold animate-spin">8</div>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-medium text-white/80 animate-pulse">
                  Consulting the spirits...
                </div>
              </div>
            )}

            {state === 'revealing' && (
              <div className="space-y-6">
                <div className="relative mx-auto w-32 h-32">
                  <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-600">
                    <div className="w-20 h-20 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full flex items-center justify-center p-2 animate-pulse">
                      <div className="text-white text-xs font-bold text-center leading-tight">
                        {currentAnswer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state === 'result' && (
              <div className="space-y-6">
                <div className="relative mx-auto w-32 h-32">
                  <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-600">
                    <div className="w-20 h-20 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full flex items-center justify-center p-2">
                      <div className="text-white text-xs font-bold text-center leading-tight">
                        {currentAnswer}
                      </div>
                    </div>
                  </div>
                  {/* Enhanced glowing effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {currentAnswer}
                  </div>
                  
                  <button
                    onClick={handleAskAgain}
                    className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 inline-block mr-2" />
                    Ask Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats and History panels - outside the themed container, using page styling */}
      {showStats && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="font-semibold mb-3 text-center text-gray-700">Family Magic Stats ✨</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-500">Total Questions</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{stats.todaysQuestions}</div>
              <div className="text-sm text-gray-500">Asked Today</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">{stats.weeklyQuestions}</div>
              <div className="text-sm text-gray-500">This Week</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-lg font-bold text-orange-600">{stats.mostPopularTheme}</div>
              <div className="text-sm text-gray-500">Popular Theme</div>
            </div>
          </div>
          {stats.mostActiveUser && (
            <div className="mt-3 text-center">
              <div className="text-sm text-gray-600">
                🏆 Most Curious: <span className="font-semibold text-yellow-600">{stats.mostActiveUser}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {showHistory && recentQuestions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-200">
          <h4 className="font-semibold mb-3 text-gray-700">Recent Questions 📚</h4>
          <div className="space-y-3">
            {recentQuestions.slice(0, 5).map((q, index) => (
              <div 
                key={q.id} 
                className="bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-gray-700 font-medium text-sm">"{q.question}"</div>
                <div className="text-blue-600 italic text-sm mt-1">→ {q.answer}</div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-gray-400 text-xs">
                    {new Date(q.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {q.theme}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {recentQuestions.length > 5 && (
            <div className="text-center mt-3">
              <div className="text-xs text-gray-500">... and {recentQuestions.length - 5} more</div>
            </div>
          )}
        </div>
      )}

      {!showStats && !showHistory && (
        <div className="text-center">
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isShakeEnabled}
                onChange={(e) => setIsShakeEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              Device Shake
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              Sound Effects
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// Export with memo for performance optimization
const Magic8BallWidget = memo(Magic8BallWidgetComponent);
export default Magic8BallWidget;