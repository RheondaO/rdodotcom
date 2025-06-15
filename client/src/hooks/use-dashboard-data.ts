
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
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute for live updates
  });
}
