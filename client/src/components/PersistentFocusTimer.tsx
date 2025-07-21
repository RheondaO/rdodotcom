import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  Focus, 
  Brain, 
  Zap, 
  Coffee,
  Target,
  Timer
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface PersistentFocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  timeBlock?: {
    title: string;
    duration: number; // in minutes
    category: string;
  };
}

type TimerMode = 'focus' | 'pomodoro' | 'deepwork' | 'flowstate';

interface TimerSettings {
  focus: { duration: number; shortBreak: number; longBreak: number; sessions: number };
  pomodoro: { duration: number; shortBreak: number; longBreak: number; sessions: number };
  deepwork: { duration: number; shortBreak: number; longBreak: number; sessions: number };
  flowstate: { duration: number; shortBreak: number; longBreak: number; sessions: number };
}

interface TimerSession {
  id: string | number;
  notionId?: string;
  mode: string;
  title?: string;
  category?: string;
  totalDuration: number;
  remainingTime: number;
  currentSession: number;
  totalSessions: number;
  isBreak: boolean;
  isActive: boolean;
  isPaused: boolean;
  startedAt: string;
  pausedAt?: string | null;
  lastSync: string;
  totalFocusTime: number;
  completedSessions: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export default function PersistentFocusTimer({ isOpen, onClose, timeBlock }: PersistentFocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [localTimeLeft, setLocalTimeLeft] = useState(0);
  const queryClient = useQueryClient();

  const timerSettings: TimerSettings = {
    focus: { duration: timeBlock?.duration || 25, shortBreak: 5, longBreak: 15, sessions: 4 },
    pomodoro: { duration: 25, shortBreak: 5, longBreak: 15, sessions: 4 },
    deepwork: { duration: 90, shortBreak: 20, longBreak: 30, sessions: 3 },
    flowstate: { duration: 120, shortBreak: 30, longBreak: 60, sessions: 2 }
  };

  const modeInfo = {
    focus: {
      name: "Focus Timer",
      icon: Focus,
      description: "Custom duration based on your time block",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    pomodoro: {
      name: "Pomodoro",
      icon: Timer,
      description: "25min work + 5min break cycles",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    deepwork: {
      name: "Deep Work",
      icon: Brain,
      description: "90min focused sessions + longer breaks",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    flowstate: {
      name: "Flow State",
      icon: Zap,
      description: "2 hour uninterrupted sessions",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    }
  };

  const currentSettings = timerSettings[mode];
  const currentModeInfo = modeInfo[mode];
  const Icon = currentModeInfo.icon;

  // Get active timer session from server (public endpoint for viewing)
  const { data: activeSession, refetch: refetchActiveSession } = useQuery<TimerSession | null>({
    queryKey: ["/api/public/active-timer"],
    enabled: isOpen,
    refetchInterval: 1000, // Sync every second when modal is open
    staleTime: 0 // Always fetch fresh data
  });

  // Start new timer session (admin-only, use authenticated endpoint)
  const startTimerMutation = useMutation({
    mutationFn: async (timerData: any) => {
      const response = await apiRequest("POST", "/api/timer/start", timerData);
      return response.json();
    },
    onSuccess: (newSession) => {
      console.log("✅ Admin timer started successfully:", newSession);
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
    },
    onError: (error: any) => {
      console.error("❌ Admin timer start failed:", error);
    }
  });

  // Update timer session (pause/resume) (admin-only, use authenticated endpoint)
  const updateTimerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string | number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/timer/${id}`, updates);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("✅ Admin timer updated successfully:", result);
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
    }
  });

  // Stop timer session (admin-only, use authenticated endpoint)
  const stopTimerMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiRequest("DELETE", `/api/timer/${id}`);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("✅ Admin timer stopped successfully:", result);
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
    }
  });

  // Complete timer session (admin-only, use authenticated endpoint)
  const completeTimerMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiRequest("POST", `/api/timer/${id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
      playNotificationSound();
    }
  });

  // Sync local time with server data
  useEffect(() => {
    if (activeSession) {
      setLocalTimeLeft(activeSession.remainingTime);
      setMode(activeSession.mode as TimerMode);
    }
  }, [activeSession]);

  // Local countdown for smooth UI updates
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeSession?.isActive && !activeSession?.isPaused && localTimeLeft > 0) {
      interval = setInterval(() => {
        setLocalTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0 && activeSession) {
            // Timer completed
            completeTimerMutation.mutate(activeSession.id);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeSession?.isActive, activeSession?.isPaused, localTimeLeft, activeSession?.id]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC2Q2e/OfiwCJHfJ7+CTQQ0XZcn0v2AfAy+i5fepWxMGP5zR77RLEwczndTr0YggBlGh3u/UYRID');
    audio.play().catch(() => {}); // Ignore errors if sound fails
  };

  const startTimer = () => {
    if (activeSession) {
      // Resume existing timer
      updateTimerMutation.mutate({
        id: activeSession.id,
        updates: { isPaused: false, pausedAt: null }
      });
    } else {
      // Start new timer
      const sessionData = {
        mode,
        title: timeBlock?.title || `${currentModeInfo.name} Session`,
        category: timeBlock?.category || "General",
        totalDuration: currentSettings.duration * 60,
        remainingTime: currentSettings.duration * 60,
        currentSession: 1,
        totalSessions: currentSettings.sessions,
        isBreak: false,
        isActive: true,
        isPaused: false,
        totalFocusTime: 0,
        completedSessions: 0
      };
      
      startTimerMutation.mutate(sessionData);
    }
  };

  const pauseTimer = () => {
    if (activeSession) {
      updateTimerMutation.mutate({
        id: activeSession.id,
        updates: { isPaused: true, pausedAt: new Date().toISOString() }
      });
    }
  };

  const stopTimer = () => {
    if (activeSession) {
      stopTimerMutation.mutate(activeSession.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!activeSession) return 0;
    return ((activeSession.totalDuration - localTimeLeft) / activeSession.totalDuration) * 100;
  };

  const displayTime = activeSession ? localTimeLeft : currentSettings.duration * 60;
  const isRunning = activeSession?.isActive && !activeSession?.isPaused;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-[#17111d] border-0 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Persistent Focus Timer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Active Session Indicator */}
          {activeSession && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Active Session: {activeSession.title}</span>
                  <Badge variant="outline" className="ml-auto">
                    Session {activeSession.currentSession}/{activeSession.totalSessions}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timer Mode Selection */}
          {!activeSession && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Timer Mode</label>
              <Select value={mode} onValueChange={(value: TimerMode) => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modeInfo).map(([key, info]) => {
                    const ModeIcon = info.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <ModeIcon className="h-4 w-4" />
                          <span>{info.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentModeInfo.description}
              </p>
            </div>
          )}

          {/* Time Block Info */}
          {timeBlock && (
            <Card className={`${currentModeInfo.bgColor} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <div>
                    <h4 className="font-medium text-sm">{timeBlock.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {timeBlock.category} • {timeBlock.duration} minutes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className={`mx-auto w-48 h-48 rounded-full bg-gradient-to-r ${currentModeInfo.color} p-1`}>
              <div className="w-full h-full rounded-full bg-white dark:bg-[#17111d] flex items-center justify-center">
                <div className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatTime(displayTime)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {activeSession?.isBreak ? 'Break Time' : currentModeInfo.name}
                  </div>
                </div>
              </div>
            </div>

            <Progress value={getProgress()} className="w-full h-2" />
          </div>

          {/* Session Info */}
          {activeSession && (
            <div className="flex justify-between items-center text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">Session</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {activeSession.currentSession} / {activeSession.totalSessions}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">Focus Time</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {Math.floor(activeSession.totalFocusTime / 60)}h {activeSession.totalFocusTime % 60}m
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">Status</div>
                <Badge variant="outline" className={
                  isRunning 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }>
                  {isRunning ? 'Running' : 'Paused'}
                </Badge>
              </div>
            </div>
          )}

          {/* Timer Controls */}
          <div className="flex justify-center space-x-3">
            {!isRunning ? (
              <Button
                onClick={startTimer}
                disabled={startTimerMutation.isPending || updateTimerMutation.isPending}
                className={`bg-gradient-to-r ${currentModeInfo.color} text-white hover:opacity-90`}
              >
                <Play className="h-4 w-4 mr-2" />
                {activeSession ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                disabled={updateTimerMutation.isPending}
                variant="outline"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            {activeSession && (
              <Button 
                onClick={stopTimer} 
                disabled={stopTimerMutation.isPending}
                variant="outline"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
            
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </div>

          {/* Persistence Notice */}
          <Card className="bg-gray-50 dark:bg-gray-900/50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Timer persists across devices and browser sessions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}