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