
import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  goals: any[];
  habits: any[];
  todaysTodos: any[];
  projects: any[];
  dailyEntry: any;
  timeBlocks: any[];
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['/api/dashboard/data'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/data');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    staleTime: 10000, // Consider data fresh for 10 seconds (reduced from 30)
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
