import { Calendar, Plus, Trash2, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useState } from "react";
import { format, addDays } from "date-fns";
import type { Purchase, InsertPurchase } from "@shared/schema";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

interface PurchaseCalendarProps {}

export default function PurchaseCalendar({}: PurchaseCalendarProps) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [newPurchase, setNewPurchase] = useState<Partial<InsertPurchase>>({
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // Default to tomorrow
    price: '',
    itemName: '',
    itemUrl: '',
    category: '',
    notes: ''
  });

  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ['/api/purchases'],
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (data: InsertPurchase) => {
      return apiRequest('POST', '/api/purchases', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      setNewPurchase({
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // Reset to tomorrow
        price: '',
        itemName: '',
        itemUrl: '',
        category: '',
        notes: ''
      });
      setIsAddingPurchase(false);
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/purchases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
    },
  });

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPurchase.itemName?.trim() || !newPurchase.price?.trim()) return;

    createPurchaseMutation.mutate({
      date: newPurchase.date || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      price: newPurchase.price,
      itemName: newPurchase.itemName.trim(),
      itemUrl: newPurchase.itemUrl?.trim() || undefined,
      category: newPurchase.category?.trim() || undefined,
      notes: newPurchase.notes?.trim() || undefined,
    });
  };

  const handleDeletePurchase = (id: number) => {
    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Records can only be deleted when logged in as the admin. Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    deletePurchaseMutation.mutate(id);
  };

  const totalPlanned = purchases.reduce((sum, purchase) => {
    return sum + parseFloat(purchase.price || "0");
  }, 0);

  const sortedPurchases = purchases.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime() // Sort by upcoming dates first
  );

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:[background-color:#0c0910] backdrop-blur-sm shadow-lg border border-pink-200/50 dark:border-pink-800/50 rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-heading font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:text-white">
            <Calendar className="h-5 w-5" />
            Purchase Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:[background-color:#0c0910] backdrop-blur-sm shadow-lg border border-pink-200/50 dark:border-pink-800/50 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-heading font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:text-white">
            <Calendar className="h-5 w-5" />
            Purchase Planner
          </CardTitle>
          <Button
            onClick={() => setIsAddingPurchase(!isAddingPurchase)}
            className="bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-md rounded-xl px-4 py-2 hover:from-purple-500 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Plan Purchase
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAddingPurchase && (
          <form onSubmit={handleAddPurchase} className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-pink-100 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newPurchase.date}
                  onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                  className="rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newPurchase.price}
                  onChange={(e) => setNewPurchase({ ...newPurchase, price: e.target.value })}
                  className="rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="itemName" className="text-sm font-medium">Item Name</Label>
              <Input
                id="itemName"
                placeholder="Enter item name"
                value={newPurchase.itemName}
                onChange={(e) => setNewPurchase({ ...newPurchase, itemName: e.target.value })}
                className="rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="itemUrl" className="text-sm font-medium">Item URL (optional)</Label>
              <Input
                id="itemUrl"
                type="url"
                placeholder="https://..."
                value={newPurchase.itemUrl}
                onChange={(e) => setNewPurchase({ ...newPurchase, itemUrl: e.target.value })}
                className="rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category (optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Electronics, Clothing, Food"
                value={newPurchase.category}
                onChange={(e) => setNewPurchase({ ...newPurchase, category: e.target.value })}
                className="rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the purchase..."
                value={newPurchase.notes}
                onChange={(e) => setNewPurchase({ ...newPurchase, notes: e.target.value })}
                className="rounded-xl border-pink-200 dark:border-gray-600 focus:border-pink-400 dark:focus:border-pink-400"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-md rounded-xl px-6 hover:from-purple-500 hover:to-pink-600"
                disabled={createPurchaseMutation.isPending}
              >
                {createPurchaseMutation.isPending ? 'Planning...' : 'Plan Purchase'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddingPurchase(false)}
                className="rounded-xl border-pink-200 dark:border-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {sortedPurchases.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-lg font-script mb-2">No purchases planned yet</div>
            <div className="text-sm">Start planning your future purchases!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPurchases.map((purchase) => {
              const purchaseDate = new Date(purchase.date);
              const today = new Date();
              const isToday = purchaseDate.toDateString() === today.toDateString();
              const isPastDue = purchaseDate < today && !isToday;
              const isUpcoming = purchaseDate > today;
              
              return (
                <div key={purchase.id} className={`p-4 rounded-xl border ${
                  isPastDue 
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800' 
                    : isToday
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border-pink-100 dark:border-gray-600'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {(isPastDue || isToday) && (
                          <AlertCircle className={`h-4 w-4 ${
                            isPastDue ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                        )}
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{purchase.itemName}</h4>
                        {purchase.itemUrl && (
                          <a
                            href={purchase.itemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className={`${
                          isPastDue ? 'text-red-600 dark:text-red-400 font-medium' 
                          : isToday ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                          : ''
                        }`}>
                          {format(purchaseDate, 'MMM dd, yyyy')}
                          {isPastDue && ' (Past Due)'}
                          {isToday && ' (Today)'}
                        </span>
                        <span className="font-semibold text-purple-700 dark:text-purple-300">
                          ${parseFloat(purchase.price).toFixed(2)}
                        </span>
                        {purchase.category && (
                          <span className="bg-white/60 dark:bg-[#17111d]/60 rounded-lg px-2 py-1">
                            {purchase.category}
                          </span>
                        )}
                      </div>
                      {purchase.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{purchase.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePurchase(purchase.id)}
                      disabled={deletePurchaseMutation.isPending}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sortedPurchases.length > 0 && (
          <div className="mt-6 pt-4 border-t border-pink-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3">
              <span className="text-muted-foreground font-medium">Total Planned:</span>
              <span className="font-heading font-bold text-purple-700 dark:text-purple-300">
                ${totalPlanned.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}