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

interface FocusTimerProps {
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

export default function FocusTimer({ isOpen, onClose, timeBlock }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSession, setCurrentSession] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

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

  // Initialize timer based on mode
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(currentSettings.duration * 60); // Convert to seconds
      setCurrentSession(1);
      setIsBreak(false);
      setIsRunning(false);
      setTotalFocusTime(0);
    }
  }, [mode, isOpen, currentSettings.duration]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      // Just completed a work session
      setTotalFocusTime(prev => prev + currentSettings.duration);
      
      if (currentSession >= currentSettings.sessions) {
        // All sessions complete
        playNotificationSound();
        return;
      }
      
      // Start break
      setIsBreak(true);
      const breakDuration = (currentSession % currentSettings.sessions === 0) 
        ? currentSettings.longBreak 
        : currentSettings.shortBreak;
      setTimeLeft(breakDuration * 60);
    } else {
      // Just completed a break
      setIsBreak(false);
      setCurrentSession(prev => prev + 1);
      setTimeLeft(currentSettings.duration * 60);
    }
    
    playNotificationSound();
  };

  const playNotificationSound = () => {
    // Browser notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC2Q2e/OfiwCJHfJ7+CTQQ0XZcn0v2AfAy+i5fepWxMGP5zR77RLEwczndTr0YggBlGh3u/UYRID');
    audio.play().catch(() => {}); // Ignore errors if sound fails
  };

  const startTimer = () => {
    setIsRunning(true);
    if (!startTime) {
      setStartTime(new Date());
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentSettings.duration * 60);
    setCurrentSession(1);
    setIsBreak(false);
    setTotalFocusTime(0);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = isBreak 
      ? ((currentSession % currentSettings.sessions === 0) ? currentSettings.longBreak : currentSettings.shortBreak) * 60
      : currentSettings.duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-[#17111d] border-0 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Focus Timer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Timer Mode Selection */}
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
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isBreak ? 'Break Time' : currentModeInfo.name}
                  </div>
                </div>
              </div>
            </div>

            <Progress value={getProgress()} className="w-full h-2" />
          </div>

          {/* Session Info */}
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">Session</div>
              <div className="text-gray-500 dark:text-gray-400">
                {currentSession} / {currentSettings.sessions}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">Focus Time</div>
              <div className="text-gray-500 dark:text-gray-400">
                {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
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

          {/* Timer Controls */}
          <div className="flex justify-center space-x-3">
            {!isRunning ? (
              <Button
                onClick={startTimer}
                className={`bg-gradient-to-r ${currentModeInfo.color} text-white hover:opacity-90`}
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                variant="outline"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            <Button onClick={resetTimer} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button onClick={onClose} variant="ghost">
              <Square className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          {/* Mode-specific tips */}
          <Card className="bg-gray-50 dark:bg-gray-900/50 border-0">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Tips for {currentModeInfo.name}</h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {mode === 'focus' && (
                  <>
                    <p>• Customize duration based on your task</p>
                    <p>• Take breaks when you need them</p>
                  </>
                )}
                {mode === 'pomodoro' && (
                  <>
                    <p>• Work for 25 minutes, then take a 5-minute break</p>
                    <p>• After 4 cycles, take a longer 15-minute break</p>
                  </>
                )}
                {mode === 'deepwork' && (
                  <>
                    <p>• 90-minute sessions match natural ultradian rhythms</p>
                    <p>• Longer breaks help maintain energy levels</p>
                  </>
                )}
                {mode === 'flowstate' && (
                  <>
                    <p>• 2-hour sessions for complex, creative work</p>
                    <p>• Minimize interruptions during these sessions</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}