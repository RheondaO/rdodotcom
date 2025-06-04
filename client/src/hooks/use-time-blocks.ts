
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface TimeBlock {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  createdAt: Date;
}

export interface InsertTimeBlock {
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  status?: string;
}

export function useTimeBlocks(date: string) {
  return useQuery({
    queryKey: ['/api/time-blocks', date],
    queryFn: async () => {
      const response = await fetch(`/api/time-blocks/${date}`);
      if (!response.ok) throw new Error('Failed to fetch time blocks');
      return response.json() as Promise<TimeBlock[]>;
    }
  });
}

export function useCreateTimeBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTimeBlock) => {
      const response = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create time block');
      return response.json() as Promise<TimeBlock>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-blocks', variables.date] });
    }
  });
}
