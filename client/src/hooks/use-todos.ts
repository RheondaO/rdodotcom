import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Todo, InsertTodo } from "@shared/schema";

export function useTodos(date: string) {
  return useQuery({
    queryKey: ['/api/todos', date],
    queryFn: () => apiRequest(`/api/todos/${date}`) as Promise<Todo[]>
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertTodo) => 
      apiRequest('/api/todos', { method: 'POST', body: data }) as Promise<Todo>,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', variables.dueDate] });
    }
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Todo> }) => 
      apiRequest(`/api/todos/${id}`, { method: 'PATCH', body: updates }) as Promise<Todo>,
    onSuccess: (todo) => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', todo.dueDate] });
    }
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Todo {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
}

export interface InsertTodo {
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
}

export function useTodos(date: string) {
  return useQuery({
    queryKey: ['/api/todos', date],
    queryFn: async () => {
      const response = await fetch(`/api/todos/${date}`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      return response.json() as Promise<Todo[]>;
    }
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
