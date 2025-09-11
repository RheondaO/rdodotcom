import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import PurchaseCalendar from "./PurchaseCalendar";


interface GrocerySectionProps {}

export default function GrocerySection({}: GrocerySectionProps = {}) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: groceryItems = [], isLoading } = useQuery({
    queryKey: ['/api/grocery-items'],
    refetchOnWindowFocus: true
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: { name: string; estimatedPrice?: string }) => {
      return apiRequest('POST', '/api/grocery-items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
      setNewItemName("");
      setNewItemPrice("");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      return apiRequest('PATCH', `/api/grocery-items/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/grocery-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive",
      });
      return;
    }

    createItemMutation.mutate({
      name: newItemName.trim(),
      estimatedPrice: newItemPrice || undefined,
    });
  };

  const handleToggleItem = (id: number, isCompleted: boolean) => {
    updateItemMutation.mutate({ id, isCompleted });
  };

  const handleDeleteItem = (id: number) => {
    deleteItemMutation.mutate(id);
  };

  const totalEstimated = Array.isArray(groceryItems) 
    ? groceryItems.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.estimatedPrice || "0");
      }, 0)
    : 0;

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Shopping & Grocery Management
            </h3>
            <p className="text-muted-foreground dark:text-gray-300 mt-1">
              Organize your grocery shopping and expense tracking
            </p>
          </div>
        </div>
        <Card className="bg-white/80 dark:[background-color:#0c0910] backdrop-blur-sm shadow-lg border border-pink-200/50 dark:border-pink-800/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Shopping & Grocery Management
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Organize your grocery shopping and expense tracking
          </p>
        </div>
      </div>
      
      <Card className="bg-white/80 dark:[background-color:#0c0910] backdrop-blur-sm shadow-lg border border-pink-200/50 dark:border-pink-800/50 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-pink-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:text-white">Shopping List</h4>
          </div>
          
          <form onSubmit={handleAddItem} className="flex gap-3">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
            />
            <Input
              placeholder="Price ($)"
              type="number"
              step="0.01"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="w-28 rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-md rounded-xl px-6 hover:from-purple-500 hover:to-pink-600"
              disabled={createItemMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </form>
        </div>
        
        <CardContent className="p-6">
          {(groceryItems as any[]).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-lg font-script mb-2">No shopping items yet</div>
              <div className="text-sm">Add some items to get started!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {(groceryItems as any[]).map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-pink-100 dark:border-gray-600">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={(checked) => 
                      handleToggleItem(item.id, checked as boolean)
                    }
                    disabled={updateItemMutation.isPending}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                  />
                  <span className={`flex-1 font-medium ${
                    item.isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {item.name}
                  </span>
                  {item.estimatedPrice && (
                    <span className="text-sm text-muted-foreground bg-white/60 dark:bg-[#17111d]/60 rounded-lg px-2 py-1">
                      ${parseFloat(item.estimatedPrice).toFixed(2)}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteItemMutation.isPending}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {(groceryItems as any[]).length > 0 && (
            <div className="mt-6 pt-4 border-t border-pink-100 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3">
                <span className="text-muted-foreground font-medium">Estimated Total:</span>
                <span className="font-heading font-bold text-purple-700 dark:text-purple-300">
                  ${totalEstimated.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <PurchaseCalendar />
      </div>
    </section>
  );
}
