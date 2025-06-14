import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";

import type { DailyEntry, InsertDailyEntry } from "@shared/schema";

export function useDailyData(date: string) {
  return useQuery<DailyEntry | null>({
    queryKey: ['/api/daily-entry', date],
    queryFn: async () => {
      const response = await fetch(`/api/daily-entry/${date}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily entry');
      }
      
      return response.json();
    },
  });
}

export function useUpdateDailyEntry() {
  return useMutation({
    mutationFn: async (data: InsertDailyEntry) => {
      return apiRequest('POST', '/api/daily-entry', data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/daily-entry', variables.date] 
      });
    },
  });
}
