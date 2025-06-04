import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Habit, HabitLog, InsertHabit, InsertHabitLog } from "@shared/schema";

export function useHabits() {
  return useQuery({
    queryKey: ['/api/habits'],
    queryFn: async () => {
      const response = await fetch('/api/habits');
      if (!response.ok) throw new Error('Failed to fetch habits');
      return response.json() as Promise<Habit[]>;
    }
  });
}

export function useHabitLog(habitId: number, date: string) {
  return useQuery({
    queryKey: ['/api/habit-logs', habitId, date],
    queryFn: async () => {
      const response = await fetch(`/api/habit-logs/${habitId}/${date}`);
      if (!response.ok) throw new Error('Failed to fetch habit logs');
      return response.json() as Promise<HabitLog[]>;
    }
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertHabit) => {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create habit');
      return response.json() as Promise<Habit>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
    }
  });
}

export function useCreateHabitLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertHabitLog) => {
      const response = await fetch('/api/habit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create habit log');
      return response.json() as Promise<HabitLog>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/habit-logs', variables.habitId, variables.date] 
      });
    }
  });
}