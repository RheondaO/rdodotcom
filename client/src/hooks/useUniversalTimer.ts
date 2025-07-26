import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "./useAuth";

export interface TimerMode {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  bgColor: string;
  duration: number; // in minutes
  shortBreak: number;
  longBreak: number;
  sessions: number;
}

export interface TimerSession {
  id: string | number;
  mode: string;
  title: string;
  category: string;
  totalDuration: number;
  remainingTime: number;
  currentSession: number;
  totalSessions: number;
  isBreak: boolean;
  isActive: boolean;
  isPaused: boolean;
  startedAt: string;
  lastSync: string;
  totalFocusTime: number;
  completedSessions: number;
}

export function useUniversalTimer(
  modes: Record<string, TimerMode>,
  isOpen: boolean,
  onComplete?: () => void
) {
  const [selectedMode, setSelectedMode] = useState<string>(Object.keys(modes)[0]);
  const [sessionTitle, setSessionTitle] = useState("");
  const [activeSession, setActiveSession] = useState<TimerSession | null>(null);
  const [localTimeLeft, setLocalTimeLeft] = useState(0);
  
  const queryClient = useQueryClient();
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get authentication status
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  // Get active timer session from server
  const { data: serverActiveSession, refetch: refetchActiveSession } = useQuery<TimerSession | null>({
    queryKey: ["/api/public/active-timer"],
    enabled: isOpen,
    refetchInterval: 1000,
    staleTime: 0
  });

  // Sync server state with local state
  useEffect(() => {
    if (serverActiveSession && !activeSession) {
      setActiveSession(serverActiveSession);
    }
    if (!serverActiveSession && activeSession) {
      console.log("🗑️ Server shows no active session, clearing local state");
      setActiveSession(null);
      setLocalTimeLeft(0);
    }
  }, [serverActiveSession, activeSession]);

  // Universal session progression logic
  const getBreakDuration = (mode: string, currentSession: number, totalSessions: number): number => {
    const modeConfig = modes[mode];
    if (!modeConfig) return 5;
    
    // Long break after final session, short break otherwise
    return currentSession === totalSessions ? modeConfig.longBreak : modeConfig.shortBreak;
  };

  const getElapsedTime = (): number => {
    if (!activeSession?.startedAt) return 0;
    const startTime = new Date(activeSession.startedAt).getTime();
    const currentTime = Date.now();
    return Math.floor((currentTime - startTime) / 1000);
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC2Q2e/OfiwCJHfJ7+CTQQ0XZcn0v2AfAy+i5fepWxMGP5zR77RLEwczndTr0YggBlGh3u/UYRID');
    audio.play().catch(() => {});
  };

  // Universal session advancement
  const advanceSession = () => {
    if (!activeSession) return;

    const modeConfig = modes[activeSession.mode];
    if (!modeConfig) return;

    if (activeSession.isBreak) {
      // Break complete, start next work session
      if (activeSession.currentSession < activeSession.totalSessions) {
        const updates = {
          isBreak: false,
          currentSession: activeSession.currentSession + 1,
          startedAt: new Date().toISOString()
        };
        
        updateTimerMutation.mutate({
          id: activeSession.id,
          updates
        });
        
        setActiveSession((prev: TimerSession | null) => prev ? { ...prev, ...updates } : null);
        playNotificationSound();
      } else {
        // All sessions complete
        completeTimerMutation.mutate(activeSession.id);
      }
    } else {
      // Work session complete, start break
      if (activeSession.currentSession < activeSession.totalSessions) {
        const updates = {
          isBreak: true,
          startedAt: new Date().toISOString(),
          completedSessions: activeSession.completedSessions + 1
        };
        
        updateTimerMutation.mutate({
          id: activeSession.id,
          updates
        });
        
        setActiveSession((prev: TimerSession | null) => prev ? { ...prev, ...updates } : null);
        playNotificationSound();
      } else {
        // Final session complete
        completeTimerMutation.mutate(activeSession.id);
      }
    }
  };

  // Timer tick logic - universal for all modes
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && activeSession?.isActive && !activeSession?.isPaused) {
      interval = setInterval(() => {
        const elapsedTime = getElapsedTime();
        const modeConfig = modes[activeSession.mode];
        
        if (!modeConfig) return;

        const sessionDurationSeconds = activeSession.isBreak
          ? getBreakDuration(activeSession.mode, activeSession.currentSession, activeSession.totalSessions) * 60
          : modeConfig.duration * 60;

        if (elapsedTime >= sessionDurationSeconds) {
          advanceSession();
        } else {
          refetchActiveSession();
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen, activeSession?.isActive, activeSession?.currentSession, activeSession?.isBreak, refetchActiveSession]);

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async (timerData: any) => {
      // Check authentication before starting timer
      if (!isAuthenticated || !isAdmin) {
        throw new Error("401: Authentication required to start timers");
      }
      
      console.log("🔥 Starting timer:", timerData);
      const response = await apiRequest("POST", "/api/timer/start", timerData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Timer start failed');
      }
      
      return response.json();
    },
    onSuccess: (newSession) => {
      console.log("✅ Timer started successfully:", newSession);
      
      setActiveSession({
        ...newSession,
        isActive: true,
        isPaused: false,
        startedAt: new Date().toISOString(),
        lastSync: new Date().toISOString()
      });
      
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timer/active"] });
    },
    onError: (error: any) => {
      console.error("❌ Timer start failed:", error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes("401")) {
        alert("⚠️ Authentication Required!\n\nTo start timers, you need to be logged in as admin.\n\nPlease visit /admin and log in with your admin credentials, then try again.");
      } else {
        alert(`❌ Failed to start timer: ${error.message}`);
      }
    }
  });

  // Update timer mutation
  const updateTimerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string | number; updates: any }) => {
      console.log("🔧 Updating timer:", { id, updates });
      const response = await apiRequest("PATCH", `/api/timer/${id}`, updates);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("✅ Timer updated successfully:", result);
      if (activeSession && result.id === activeSession.id) {
        setActiveSession({ ...activeSession, ...result });
      }
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
    },
    onError: (error) => {
      console.error("❌ Update failed:", error);
    }
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: async (id: string | number) => {
      // Check authentication before stopping timer
      if (!isAuthenticated || !isAdmin) {
        throw new Error("401: Authentication required to stop timers");
      }
      
      console.log("🔴 Stopping timer:", id);
      const response = await apiRequest("DELETE", `/api/timer/${id}`);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("✅ Timer stopped successfully:", result);
      const finalElapsedTime = activeSession ? getElapsedTime() : 0;
      
      setActiveSession(null);
      setLocalTimeLeft(finalElapsedTime);
      setSessionTitle("");
      
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
    },
    onError: (error: any) => {
      console.error("❌ Stop failed:", error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes("401")) {
        alert("⚠️ Authentication Required!\n\nTo stop timers, you need to be logged in as admin.\n\nPlease visit /admin and log in with your admin credentials, then try again.");
      } else {
        alert(`❌ Failed to stop timer: ${error.message}`);
      }
    }
  });

  // Complete timer mutation
  const completeTimerMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiRequest("POST", `/api/timer/${id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ Timer completed successfully");
      setActiveSession(null);
      setLocalTimeLeft(0);
      setSessionTitle("");
      
      refetchActiveSession();
      queryClient.invalidateQueries({ queryKey: ["/api/public/active-timer"] });
      
      if (onComplete) {
        onComplete();
      }
    }
  });

  // Universal start function - works for any mode
  const startTimer = async () => {
    console.log("🟢 Starting timer for mode:", selectedMode);
    
    if (!activeSession) {
      const modeConfig = modes[selectedMode];
      const finalTitle = sessionTitle.trim() || `${modeConfig.name} Session`;
      
      const sessionData = {
        mode: selectedMode,
        title: finalTitle,
        category: "General",
        totalDuration: Math.floor(modeConfig.duration * 60),
        remainingTime: Math.floor(modeConfig.duration * 60),
        currentSession: 1,
        totalSessions: modeConfig.sessions,
        isBreak: false,
        isActive: true,
        isPaused: false,
        totalFocusTime: 0,
        completedSessions: 0
      };
      
      startTimerMutation.mutate(sessionData);
    }
  };

  // Universal stop function - works for any mode
  const stopTimer = async () => {
    console.log("🔴 Stopping timer");
    
    if (activeSession && !stopTimerMutation.isPending) {
      stopTimerMutation.mutate(activeSession.id);
    }
  };

  // Universal progress calculation
  const getProgress = () => {
    if (!activeSession) return 0;
    
    const modeConfig = modes[activeSession.mode];
    if (!modeConfig) return 0;
    
    const elapsedTime = getElapsedTime();
    const sessionDurationSeconds = activeSession.isBreak
      ? getBreakDuration(activeSession.mode, activeSession.currentSession, activeSession.totalSessions) * 60
      : modeConfig.duration * 60;
    
    return Math.min(100, (elapsedTime / sessionDurationSeconds) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = activeSession ? getElapsedTime() : localTimeLeft;

  return {
    // State
    selectedMode,
    setSelectedMode,
    sessionTitle,
    setSessionTitle,
    activeSession,
    displayTime,
    
    // Actions
    startTimer,
    stopTimer,
    updateSessionTitle: (newTitle: string) => {
      if (activeSession && newTitle.trim() !== activeSession.title) {
        updateTimerMutation.mutate({
          id: activeSession.id,
          updates: { title: newTitle.trim() }
        });
      }
    },
    
    // Utilities
    formatTime,
    getProgress,
    
    // Mutation states
    isStarting: startTimerMutation.isPending,
    isStopping: stopTimerMutation.isPending,
    isUpdating: updateTimerMutation.isPending,
    
    // Authentication status
    isAuthenticated,
    isAdmin,
    authLoading
  };
}