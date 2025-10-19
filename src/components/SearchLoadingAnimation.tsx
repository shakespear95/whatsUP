import { Loader2, Sparkles, Search, MapPin, Calendar, Zap } from 'lucide-react';

interface SearchLoadingAnimationProps {
  progress: string;
}

export function SearchLoadingAnimation({ progress }: SearchLoadingAnimationProps) {
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
            KI durchsucht Events für dich...
          </h2>

          <div className="flex items-center justify-center gap-2 text-lg font-medium text-gray-700 dark:text-gray-300 min-h-[32px]">
            <span className="animate-fade-in">{progress}</span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 animate-shimmer"></div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-purple-100 dark:border-purple-900">
              <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Multi-Source Search</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-blue-100 dark:border-blue-900">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">KI-Verstärkung</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-pink-100 dark:border-pink-900">
              <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Lokale Geheimtipps</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-purple-100 dark:border-purple-900">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Echtzeit-Daten</p>
            </div>
          </div>

          {/* Fun fact */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 italic">
            💡 Wusstest du? Wir durchsuchen über 10+ Quellen gleichzeitig!
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
