import { 
  dailyEntries, 
  bills, 
  billPayments, 
  groceryItems,
  type DailyEntry, 
  type InsertDailyEntry,
  type Bill,
  type InsertBill,
  type BillPayment,
  type InsertBillPayment,
  type GroceryItem,
  type InsertGroceryItem
} from "@shared/schema";

export interface IStorage {
  // Daily Entries
  getDailyEntry(date: string): Promise<DailyEntry | undefined>;
  createOrUpdateDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  
  // Bills
  getAllBills(): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  deleteBill(id: number): Promise<void>;
  
  // Bill Payments
  getBillPaymentsForDate(date: string): Promise<BillPayment[]>;
  createBillPayment(payment: InsertBillPayment): Promise<BillPayment>;
  updateBillPayment(id: number, isPaid: boolean): Promise<BillPayment>;
  
  // Grocery Items
  getAllGroceryItems(): Promise<GroceryItem[]>;
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem>;
  deleteGroceryItem(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private dailyEntries: Map<string, DailyEntry> = new Map();
  private bills: Map<number, Bill> = new Map();
  private billPayments: Map<number, BillPayment> = new Map();
  private groceryItems: Map<number, GroceryItem> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with some default bills
    this.createBill({
      name: "Rent",
      amount: "1200.00",
      isAutoPay: true,
      dueDate: 1
    });
    this.createBill({
      name: "Utilities",
      amount: "150.00",
      isAutoPay: false,
      dueDate: 15
    });
    this.createBill({
      name: "Credit Card",
      amount: "300.00",
      isAutoPay: false,
      dueDate: 20
    });
  }

  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    return this.dailyEntries.get(date);
  }

  async createOrUpdateDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const existing = this.dailyEntries.get(entry.date);
    
    if (existing) {
      const updated: DailyEntry = {
        ...existing,
        ...entry,
        updatedAt: new Date()
      };
      this.dailyEntries.set(entry.date, updated);
      return updated;
    } else {
      const newEntry: DailyEntry = {
        id: this.currentId++,
        ...entry,
        waterIntake: entry.waterIntake || 0,
        exerciseCompleted: entry.exerciseCompleted || false,
        breakfastCompleted: entry.breakfastCompleted || false,
        lunchCompleted: entry.lunchCompleted || false,
        dinnerCompleted: entry.dinnerCompleted || false,
        napTaken: entry.napTaken || false,
        workHours: entry.workHours || "0",
        tvHours: entry.tvHours || "0",
        phoneHours: entry.phoneHours || "0",
        cashSavings: entry.cashSavings || "0",
        grocerySpent: entry.grocerySpent || "0",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dailyEntries.set(entry.date, newEntry);
      return newEntry;
    }
  }

  async getAllBills(): Promise<Bill[]> {
    return Array.from(this.bills.values());
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const newBill: Bill = {
      id: this.currentId++,
      ...bill,
      createdAt: new Date()
    };
    this.bills.set(newBill.id, newBill);
    return newBill;
  }

  async deleteBill(id: number): Promise<void> {
    this.bills.delete(id);
  }

  async getBillPaymentsForDate(date: string): Promise<BillPayment[]> {
    return Array.from(this.billPayments.values()).filter(payment => payment.date === date);
  }

  async createBillPayment(payment: InsertBillPayment): Promise<BillPayment> {
    const newPayment: BillPayment = {
      id: this.currentId++,
      ...payment,
      createdAt: new Date()
    };
    this.billPayments.set(newPayment.id, newPayment);
    return newPayment;
  }

  async updateBillPayment(id: number, isPaid: boolean): Promise<BillPayment> {
    const payment = this.billPayments.get(id);
    if (!payment) {
      throw new Error("Bill payment not found");
    }
    
    const updated = { ...payment, isPaid };
    this.billPayments.set(id, updated);
    return updated;
  }

  async getAllGroceryItems(): Promise<GroceryItem[]> {
    return Array.from(this.groceryItems.values());
  }

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const newItem: GroceryItem = {
      id: this.currentId++,
      ...item,
      isCompleted: item.isCompleted || false,
      createdAt: new Date()
    };
    this.groceryItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    const item = this.groceryItems.get(id);
    if (!item) {
      throw new Error("Grocery item not found");
    }
    
    const updated = { ...item, ...updates };
    this.groceryItems.set(id, updated);
    return updated;
  }

  async deleteGroceryItem(id: number): Promise<void> {
    this.groceryItems.delete(id);
  }
}

export const storage = new MemStorage();
