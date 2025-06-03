import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function GrocerySection() {
  const { toast } = useToast();
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const { data: groceryItems = [], isLoading } = useQuery({
    queryKey: ['/api/grocery-items'],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: { name: string; estimatedPrice?: string }) => {
      return apiRequest('POST', '/api/grocery-items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
      setNewItemName("");
      setNewItemPrice("");
      toast({
        title: "Success",
        description: "Grocery item added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add grocery item",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Grocery item deleted successfully",
      });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

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

  const totalEstimated = groceryItems.reduce((sum, item) => {
    return sum + parseFloat(item.estimatedPrice || "0");
  }, 0);

  if (isLoading) {
    return (
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <ShoppingCart className="text-secondary mr-3 h-5 w-5" />
          Grocery List
        </h3>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-neutral-cool">Loading...</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <ShoppingCart className="text-secondary mr-3 h-5 w-5" />
        Grocery List
      </h3>
      
      <Card className="bg-white shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Shopping List</h4>
          </div>
          
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Price ($)"
              type="number"
              step="0.01"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="w-24"
            />
            <Button 
              type="submit" 
              className="bg-secondary text-white hover:bg-secondary/90"
              disabled={createItemMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </form>
        </div>
        
        <CardContent className="p-6">
          {groceryItems.length === 0 ? (
            <div className="text-center text-neutral-cool py-8">
              No grocery items yet. Add some items to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {groceryItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 py-2">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={(checked) => 
                      handleToggleItem(item.id, checked as boolean)
                    }
                    disabled={updateItemMutation.isPending}
                  />
                  <span className={`flex-1 ${
                    item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}>
                    {item.name}
                  </span>
                  {item.estimatedPrice && (
                    <span className="text-sm text-neutral-cool">
                      ${parseFloat(item.estimatedPrice).toFixed(2)}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteItemMutation.isPending}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {groceryItems.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-cool">Estimated Total:</span>
                <span className="font-medium text-gray-900">
                  ${totalEstimated.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
