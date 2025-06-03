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
      <h3 className="text-2xl font-heading font-bold text-purple-600 mb-6 flex items-center">
        <ShoppingCart className="text-purple-500 mr-3 h-6 w-6" />
        Grocery List 🛒
      </h3>
      
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-gray-800">Shopping List</h4>
          </div>
          
          <form onSubmit={handleAddItem} className="flex gap-3">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 rounded-xl border-pink-200 focus:border-pink-400"
            />
            <Input
              placeholder="Price ($)"
              type="number"
              step="0.01"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="w-28 rounded-xl border-pink-200 focus:border-pink-400"
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600 shadow-md rounded-xl px-6"
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
              <div className="text-lg font-script mb-2">No grocery items yet</div>
              <div className="text-sm">Add some items to get started!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {(groceryItems as any[]).map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-pink-100">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={(checked) => 
                      handleToggleItem(item.id, checked as boolean)
                    }
                    disabled={updateItemMutation.isPending}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                  />
                  <span className={`flex-1 font-medium ${
                    item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}>
                    {item.name}
                  </span>
                  {item.estimatedPrice && (
                    <span className="text-sm text-muted-foreground bg-white/60 rounded-lg px-2 py-1">
                      ${parseFloat(item.estimatedPrice).toFixed(2)}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteItemMutation.isPending}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {(groceryItems as any[]).length > 0 && (
            <div className="mt-6 pt-4 border-t border-pink-100">
              <div className="flex items-center justify-between text-sm bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
                <span className="text-muted-foreground font-medium">Estimated Total:</span>
                <span className="font-heading font-bold text-purple-700">
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
