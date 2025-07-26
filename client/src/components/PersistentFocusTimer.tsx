import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { 
  Play, 
  Square, 
  RotateCcw, 
  Focus, 
  Brain, 
  Zap, 
  Target,
  Timer
} from "lucide-react";
import { useUniversalTimer, TimerMode } from "../hooks/useUniversalTimer";
import { AuthGuard, AuthStatus } from "./AuthGuard";

interface PersistentFocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  timeBlock?: {
    title: string;
    duration: number; // in minutes
    category: string;
  };
}

export default function PersistentFocusTimer({ isOpen, onClose, timeBlock }: PersistentFocusTimerProps) {
  // Define timer modes configuration
  const timerModes: Record<string, TimerMode> = {
    focus: {
      id: "focus",
      name: "Focus Timer",
      icon: Focus,
      description: timeBlock?.duration ? `${timeBlock.duration} min focused work session` : "25 min focused work session",
      color: "from-blue-600 to-purple-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      duration: timeBlock?.duration || 25,
      shortBreak: 5,
      longBreak: 15,
      sessions: 4
    },
    pomodoro: {
      id: "pomodoro",
      name: "Pomodoro",
      icon: Timer,
      description: "25 min work + 5 min break cycles",
      color: "from-red-600 to-orange-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      duration: 25,
      shortBreak: 5,
      longBreak: 15,
      sessions: 4
    },
    deepwork: {
      id: "deepwork",
      name: "Deep Work",
      icon: Brain,
      description: "90 min deep focus + 20 min break",
      color: "from-green-600 to-teal-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      duration: 90,
      shortBreak: 20,
      longBreak: 30,
      sessions: 3
    },
    flowstate: {
      id: "flowstate",
      name: "Flow State",
      icon: Zap,
      description: "2 hour uninterrupted + 30 min break",
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      duration: 120,
      shortBreak: 30,
      longBreak: 60,
      sessions: 2
    },
    test: {
      id: "test",
      name: "Test Mode",
      icon: Target,
      description: "15 second sessions for quick testing",
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      duration: 0.25, // 15 seconds
      shortBreak: 0.1, // 6 seconds
      longBreak: 0.2, // 12 seconds
      sessions: 3
    }
  };

  // Use universal timer hook
  const {
    selectedMode,
    setSelectedMode,
    sessionTitle,
    setSessionTitle,
    activeSession,
    displayTime,
    startTimer,
    stopTimer,
    updateSessionTitle,
    formatTime,
    getProgress,
    isStarting,
    isStopping,
    isAuthenticated,
    isAdmin,
    authLoading
  } = useUniversalTimer(timerModes, isOpen);

  // Set initial session title from time block
  useEffect(() => {
    if (timeBlock?.title && !sessionTitle) {
      setSessionTitle(timeBlock.title);
    }
  }, [timeBlock?.title, sessionTitle, setSessionTitle]);

  const currentModeInfo = timerModes[selectedMode];

  // Debug logging
  useEffect(() => {
    console.log("🔍 PersistentFocusTimer state:", {
      isOpen,
      activeSession,
      isAuthenticated,
      isAdmin,
      authLoading,
      displayTime,
      selectedMode
    });
  }, [isOpen, activeSession, isAuthenticated, isAdmin, authLoading, displayTime, selectedMode]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-[#17111d] border-0 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Setup Focus Timer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Authentication Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Authentication Status</span>
            <AuthStatus />
          </div>

          {/* Active Session Indicator */}
          {activeSession && (
            <Card className={`${activeSession.isBreak 
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    activeSession.isBreak ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {activeSession.isBreak ? 'Break Time' : `Active Session: ${activeSession.title || activeSession.mode}`}
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    {activeSession.isBreak 
                      ? `Break ${activeSession.currentSession}/${activeSession.totalSessions}`
                      : `Session ${activeSession.currentSession}/${activeSession.totalSessions}`
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timer Mode Selection */}
          {!activeSession && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Timer Mode</label>
              <Select value={selectedMode} onValueChange={(value: string) => setSelectedMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(timerModes).map(([key, info]) => {
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

          {/* Session Title Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Session Title</label>
            <Input
              type="text"
              placeholder="What is being worked on?"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              onBlur={() => {
                if (activeSession) {
                  updateSessionTitle(sessionTitle);
                }
              }}
            />
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-4">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto">
              <Progress 
                value={getProgress()} 
                className="w-full h-full rounded-full" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold">
                    {formatTime(displayTime)}
                  </div>
                  {activeSession && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activeSession.isBreak ? 'Break' : 'Focus'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Session Progress */}
            {activeSession && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Session {activeSession.currentSession} of {activeSession.totalSessions}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <AuthGuard action="start and stop timers">
            <div className="flex justify-center space-x-3">
              {!activeSession ? (
                <Button 
                  onClick={startTimer}
                  disabled={isStarting || !sessionTitle.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-2 rounded-2xl font-medium shadow-lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isStarting ? "Starting..." : "Start Timer"}
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    console.log("🟥 Stop button clicked!");
                    stopTimer();
                  }}
                  disabled={isStopping}
                  variant="destructive"
                  className="px-8 py-2 rounded-2xl font-medium shadow-lg"
                >
                  <Square className="h-4 w-4 mr-2" />
                  {isStopping ? "Stopping..." : "Stop"}
                </Button>
              )}
              
              <Button 
                onClick={onClose}
                variant="outline"
                className="px-8 py-2 rounded-2xl font-medium"
              >
                Close
              </Button>
            </div>
          </AuthGuard>

          {/* Mode Info Display */}
          {!activeSession && currentModeInfo && (
            <Card className={currentModeInfo.bgColor}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <currentModeInfo.icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{currentModeInfo.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentModeInfo.duration} min work • {currentModeInfo.sessions} sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}