import { useQuery } from "@tanstack/react-query";
import { Timer, Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TimerSession {
  id: string | number;
  mode: string;
  title: string;
  totalDuration: number;
  remainingTime: number;
  isActive: boolean;
  isPaused: boolean;
  currentSession?: number;
  totalSessions?: number;
}

export function ActiveTimerDisplay() {
  const { data: activeTimer, isLoading, isFetched, error } = useQuery<TimerSession | null>({
    queryKey: ["/api/public/active-timer"],
    queryFn: async () => {
      const response = await fetch("/api/public/active-timer");
      if (!response.ok) {
        throw new Error("Failed to fetch active timer");
      }
      return response.json();
    },
    refetchInterval: 1000, // Update every second for countdown
    refetchOnWindowFocus: true,
  });

  // Debug logging to see what's happening
  console.log("🔄 ActiveTimerDisplay render:", { 
    activeTimer: activeTimer ? { id: activeTimer.id, title: activeTimer.title, mode: activeTimer.mode, remainingTime: activeTimer.remainingTime } : null,
    isLoading, 
    isFetched, 
    error: error?.message,
    hasData: !!activeTimer 
  });

  // Only show loading state on initial load, not on refetches
  if (isLoading && !isFetched) {
    return (
      <Card className="p-4 bg-white dark:bg-[#17111d] border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Timer className="h-5 w-5 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Checking for active timer...</span>
        </div>
      </Card>
    );
  }

  // Debug logging for production troubleshooting
  if (isFetched && !activeTimer) {
    console.log("🔍 ActiveTimerDisplay: No active timer found", { error, debugInfo: { queryKey: "/api/public/active-timer" } });
  }

  if (!activeTimer) {
    return null; // Don't show anything if no active timer
  }

  // Format remaining time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((activeTimer.totalDuration - activeTimer.remainingTime) / activeTimer.totalDuration) * 100;

  // Get mode specific styling
  const getModeStyles = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'pomodoro':
        return {
          gradient: 'from-red-500 to-orange-500',
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-300'
        };
      case 'deepwork':
        return {
          gradient: 'from-purple-500 to-indigo-500',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-700 dark:text-purple-300'
        };
      case 'flowstate':
        return {
          gradient: 'from-cyan-500 to-blue-500',
          bg: 'bg-cyan-50 dark:bg-cyan-900/20',
          text: 'text-cyan-700 dark:text-cyan-300'
        };
      default: // focus
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-300'
        };
    }
  };

  const styles = getModeStyles(activeTimer.mode);

  return (
    <Card className={`p-4 border-2 ${styles.bg} border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${styles.gradient} flex items-center justify-center`}>
              {activeTimer.isPaused ? (
                <Play className="h-5 w-5 text-white" />
              ) : (
                <Timer className="h-5 w-5 text-white animate-pulse" />
              )}
            </div>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-300 dark:text-gray-600"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                className={`${styles.text} transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${styles.text}`}>
                {activeTimer.title}
              </h3>
              {activeTimer.isPaused && (
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                  PAUSED
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="capitalize font-medium">{activeTimer.mode}</span>
              {activeTimer.totalSessions && activeTimer.totalSessions > 1 && (
                <span>Session {activeTimer.currentSession}/{activeTimer.totalSessions}</span>
              )}
              {/* Cross-device sync indicator */}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${typeof activeTimer.id === 'string' && activeTimer.id.length > 10 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-xs">
                  {typeof activeTimer.id === 'string' && activeTimer.id.length > 10 ? 'Synced' : 'Local'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-mono font-bold ${styles.text}`}>
            {formatTime(activeTimer.remainingTime)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            of {formatTime(activeTimer.totalDuration)}
          </div>
        </div>
      </div>
    </Card>
  );
}