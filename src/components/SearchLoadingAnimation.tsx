import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Search, MapPin, Calendar, Zap, Clock, TrendingUp } from 'lucide-react';

interface SearchLoadingAnimationProps {
  progress: string;
}

export function SearchLoadingAnimation({ progress }: SearchLoadingAnimationProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  const estimatedTime = 135; // 2.25 minutes (from backend phases)
  const phases = [
    { number: 1, name: 'Analyzing weather', duration: 5, icon: '🌤️' },
    { number: 2, name: 'Creating search strategy', duration: 15, icon: '🧠' },
    { number: 3, name: 'Searching web sources', duration: 60, icon: '🔍' },
    { number: 4, name: 'AI enhancement', duration: 45, icon: '🤖' },
    { number: 5, name: 'Finalizing results', duration: 10, icon: '📍' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1;

        // Calculate current phase based on elapsed time
        let cumulativeTime = 0;
        let phase = 1;
        for (const p of phases) {
          cumulativeTime += p.duration;
          if (next < cumulativeTime) {
            setCurrentPhase(p.number);
            break;
          }
          phase = p.number + 1;
        }
        if (phase > 5) setCurrentPhase(5);

        // Calculate progress percentage
        const percent = Math.min(100, (next / estimatedTime) * 100);
        setProgressPercent(percent);

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhaseInfo = phases.find(p => p.number === currentPhase) || phases[0];

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-md w-full mx-auto px-6 text-center">
        {/* Main Animation Container */}
        <div className="relative mb-8">
          {/* Spinning Circles */}
          <div className="relative w-32 h-32 mx-auto">
            {/* Outer circle */}
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-800 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full"></div>
            </div>

            {/* Middle circle */}
            <div className="absolute inset-4 rounded-full border-4 border-blue-200 dark:border-blue-800 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>

            {/* Inner circle */}
            <div className="absolute inset-8 rounded-full border-4 border-pink-200 dark:border-pink-800 animate-spin" style={{ animationDuration: '1.5s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-pink-500 rounded-full"></div>
            </div>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
                <div className="absolute inset-0 bg-purple-400 blur-xl opacity-50 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>

        {/* Progress Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white animate-pulse">
            AI is searching for events...
          </h2>

          {/* Timer and Phase */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(elapsedSeconds)} / ~{formatTime(estimatedTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
              <span>Phase {currentPhase}/5</span>
            </div>
          </div>

          {/* Current Phase */}
          <div className="flex items-center justify-center gap-2 text-lg font-medium text-gray-700 dark:text-gray-300 min-h-[32px]">
            <span className="text-2xl">{currentPhaseInfo.icon}</span>
            <span className="animate-fade-in">{currentPhaseInfo.name}</span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Progress Percentage */}
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(progressPercent)}% Complete
          </div>

          {/* Phase Timeline */}
          <div className="flex justify-between items-center mt-6 px-2">
            {phases.map((phase) => (
              <div key={phase.number} className="flex flex-col items-center gap-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${currentPhase === phase.number ? 'bg-purple-500 text-white scale-110 ring-4 ring-purple-200 dark:ring-purple-800' :
                    currentPhase > phase.number ? 'bg-green-500 text-white' :
                    'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                `}>
                  {currentPhase > phase.number ? '✓' : phase.number}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">{phase.icon}</span>
              </div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-purple-100 dark:border-purple-900">
              <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Multi-Source Search</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-blue-100 dark:border-blue-900">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">AI Enhancement</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-pink-100 dark:border-pink-900">
              <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Hidden Gems</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-purple-100 dark:border-purple-900">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Real-Time Data</p>
            </div>
          </div>

          {/* Fun fact */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 italic">
            💡 Did you know? We search 10+ sources simultaneously for the best results!
          </p>
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes fade-in {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-shimmer {
            animation: shimmer 2s infinite;
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
