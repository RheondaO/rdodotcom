import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import type { Todo, InsertTodo } from "@shared/schema";

export function useTodos(date: string) {
  return useQuery({
    queryKey: ['/api/todos', date],
    queryFn: async () => {
      const response = await fetch(`/api/todos/${date}`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      return response.json() as Promise<Todo[]>;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTodo) => {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create todo');
      return response.json() as Promise<Todo>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', variables.dueDate] });
    }
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Todo> }) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update todo');
      return response.json() as Promise<Todo>;
    },
    onSuccess: (todo) => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', todo.dueDate] });
    }
  });
}