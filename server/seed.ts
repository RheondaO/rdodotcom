import { storage } from './storage';
import { format, subDays, addDays } from 'date-fns';

const today = new Date();
const d = (offset: number) => format(offset >= 0 ? addDays(today, offset) : subDays(today, -offset), 'yyyy-MM-dd');

export async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // ─── HABITS ─────────────────────────────────────────────────────────────────
  const habitDefs = [
    { name: 'Morning Meditation', description: '10 min mindfulness practice', category: 'wellness', targetFrequency: 7, currentStreak: 14, longestStreak: 21, isActive: true },
    { name: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', category: 'health', targetFrequency: 7, currentStreak: 22, longestStreak: 30, isActive: true },
    { name: 'Exercise 30 Minutes', description: 'Cardio or strength training', category: 'fitness', targetFrequency: 5, currentStreak: 9, longestStreak: 18, isActive: true },
    { name: 'Read 20 Pages', description: 'Any book — personal development preferred', category: 'learning', targetFrequency: 7, currentStreak: 6, longestStreak: 45, isActive: true },
    { name: 'Journal Entry', description: 'Reflect on the day and set intentions', category: 'wellness', targetFrequency: 7, currentStreak: 11, longestStreak: 28, isActive: true },
    { name: 'No Social Media Before 9AM', description: 'Protect morning focus window', category: 'productivity', targetFrequency: 7, currentStreak: 5, longestStreak: 14, isActive: true },
    { name: 'Gratitude Practice', description: 'List 3 things to be grateful for', category: 'mental', targetFrequency: 7, currentStreak: 19, longestStreak: 32, isActive: true },
    { name: 'Take Vitamins', description: 'Vitamin D, Magnesium, Omega-3', category: 'health', targetFrequency: 7, currentStreak: 33, longestStreak: 60, isActive: true },
    { name: '10,000 Steps', description: 'Daily step goal', category: 'fitness', targetFrequency: 5, currentStreak: 4, longestStreak: 12, isActive: true },
    { name: 'Cold Shower', description: '2 min cold exposure after workout', category: 'wellness', targetFrequency: 5, currentStreak: 3, longestStreak: 7, isActive: true },
    { name: 'Meal Prep Sunday', description: 'Prepare meals for the week', category: 'health', targetFrequency: 1, currentStreak: 8, longestStreak: 12, isActive: true },
    { name: 'Screen-Free Wind Down', description: 'No screens 1hr before bed', category: 'sleep', targetFrequency: 7, currentStreak: 7, longestStreak: 21, isActive: true },
  ];
  const habits = await Promise.all(habitDefs.map(h => storage.createHabit(h)));
  console.log(`  ✓ Created ${habits.length} habits`);

  // Habit logs for the last 14 days
  const logs: Promise<any>[] = [];
  for (let day = 0; day < 14; day++) {
    const date = d(-day);
    for (const habit of habits) {
      const shouldComplete = Math.random() > 0.25; // ~75% completion rate
      if (shouldComplete) {
        logs.push(storage.createHabitLog({ habitId: habit.id, date, completed: true }));
      }
    }
  }
  await Promise.all(logs);
  console.log(`  ✓ Created habit logs`);

  // ─── GOALS ──────────────────────────────────────────────────────────────────
  const goalDefs = [
    { title: 'Run a Half Marathon', description: 'Complete 13.1 miles by end of year', category: 'fitness', targetValue: '13.1', currentValue: '8.4', unit: 'miles', targetDate: d(90), isCompleted: false },
    { title: 'Save $10,000 Emergency Fund', description: 'Build financial safety net', category: 'finance', targetValue: '10000', currentValue: '7250', unit: 'dollars', targetDate: d(120), isCompleted: false },
    { title: 'Read 24 Books This Year', description: '2 books per month', category: 'learning', targetValue: '24', currentValue: '14', unit: 'books', targetDate: d(150), isCompleted: false },
    { title: 'Lose 15 lbs', description: 'Reach goal weight through diet and exercise', category: 'health', targetValue: '15', currentValue: '9', unit: 'lbs', targetDate: d(60), isCompleted: false },
    { title: 'Launch Personal Brand', description: 'Grow to 1K followers on TikTok', category: 'content', targetValue: '1000', currentValue: '412', unit: 'followers', targetDate: d(75), isCompleted: false },
    { title: 'Meditate 200 Days', description: 'Consistency meditation practice', category: 'wellness', targetValue: '200', currentValue: '147', unit: 'days', targetDate: d(53), isCompleted: false },
    { title: 'Pay Off Credit Card', description: 'Eliminate $3,200 balance', category: 'finance', targetValue: '3200', currentValue: '1800', unit: 'dollars', targetDate: d(45), isCompleted: false },
    { title: 'Complete Online Course', description: 'Finish UI/UX design certification', category: 'learning', targetValue: '100', currentValue: '68', unit: 'percent', targetDate: d(30), isCompleted: false },
    { title: 'Drink 2L Water Daily for 30 Days', description: 'Hydration consistency challenge', category: 'health', targetValue: '30', currentValue: '30', unit: 'days', targetDate: d(-2), isCompleted: true },
    { title: 'Post Content 3x Per Week', description: 'Consistent content creation schedule', category: 'content', targetValue: '12', currentValue: '7', unit: 'posts', targetDate: d(21), isCompleted: false },
    { title: 'Build Morning Routine', description: 'Stick to 5AM routine for 60 days', category: 'wellness', targetValue: '60', currentValue: '38', unit: 'days', targetDate: d(22), isCompleted: false },
    { title: 'Increase Bench Press to 225 lbs', description: 'Strength training milestone', category: 'fitness', targetValue: '225', currentValue: '185', unit: 'lbs', targetDate: d(100), isCompleted: false },
  ];
  const goals = await Promise.all(goalDefs.map(g => storage.createGoal(g)));
  console.log(`  ✓ Created ${goals.length} goals`);

  // ─── TODOS ──────────────────────────────────────────────────────────────────
  const todoDefs = [
    { title: 'Review Q2 Analytics Report', description: 'Check engagement metrics across all platforms', priority: 'high', category: 'work', dueDate: d(0), isCompleted: false },
    { title: 'Schedule Dentist Appointment', priority: 'medium', category: 'health', dueDate: d(0), isCompleted: false },
    { title: 'Draft Blog Post: Morning Routines', description: '1,500 word post on productivity habits', priority: 'high', category: 'content', dueDate: d(0), isCompleted: true },
    { title: 'Grocery Shopping', description: 'Weekly essentials + meal prep ingredients', priority: 'medium', category: 'personal', dueDate: d(0), isCompleted: false },
    { title: 'Reply to Brand Collaboration Emails', priority: 'high', category: 'work', dueDate: d(0), isCompleted: true },
    { title: 'Update Budget Spreadsheet', priority: 'medium', category: 'finance', dueDate: d(1), isCompleted: false },
    { title: 'Record TikTok Video — Wellness Tips', priority: 'high', category: 'content', dueDate: d(1), isCompleted: false },
    { title: 'Call Mom', priority: 'low', category: 'personal', dueDate: d(1), isCompleted: false },
    { title: 'Finalize Content Calendar for July', priority: 'medium', category: 'content', dueDate: d(2), isCompleted: false },
    { title: 'Organize Digital Files', priority: 'low', category: 'personal', dueDate: d(2), isCompleted: false },
    { title: 'Research New Running Shoes', priority: 'low', category: 'fitness', dueDate: d(3), isCompleted: false },
    { title: 'Complete Online Course Module 8', priority: 'medium', category: 'learning', dueDate: d(3), isCompleted: false },
    { title: 'Batch Film Videos for Next Week', priority: 'high', category: 'content', dueDate: d(-1), isCompleted: true },
    { title: 'Send Invoice to Client', priority: 'high', category: 'work', dueDate: d(-1), isCompleted: true },
    { title: 'Meal Prep for the Week', priority: 'medium', category: 'health', dueDate: d(-1), isCompleted: true },
  ];
  await Promise.all(todoDefs.map(t => storage.createTodo(t)));
  console.log(`  ✓ Created ${todoDefs.length} todos`);

  // ─── DAILY ENTRIES ───────────────────────────────────────────────────────────
  const moods = ['great', 'good', 'okay', 'tired', 'anxious', 'energized'];
  const dailyDefs = Array.from({ length: 30 }, (_, i) => ({
    date: d(-i),
    waterIntake: Math.floor(Math.random() * 4) + 5,
    exerciseCompleted: Math.random() > 0.3,
    breakfastCompleted: Math.random() > 0.15,
    lunchCompleted: Math.random() > 0.1,
    dinnerCompleted: Math.random() > 0.2,
    sleepHours: (Math.floor(Math.random() * 25) / 10 + 5.5).toFixed(1),
    sleepQuality: Math.floor(Math.random() * 4) + 6,
    mood: moods[Math.floor(Math.random() * moods.length)],
    energyLevel: Math.floor(Math.random() * 4) + 5,
    stressLevel: Math.floor(Math.random() * 5) + 2,
    workHours: (Math.floor(Math.random() * 40) / 10 + 4).toFixed(1),
    focusSessionsCompleted: Math.floor(Math.random() * 4) + 1,
    dailyIncome: i < 5 ? (Math.random() > 0.6 ? (Math.floor(Math.random() * 300) + 50).toString() : '0') : '0',
    habitCompletions: JSON.stringify(habits.slice(0, Math.floor(Math.random() * 5) + 6).map(h => h.id)),
  }));
  await Promise.all(dailyDefs.map(e => storage.createOrUpdateDailyEntry(e)));
  console.log(`  ✓ Created ${dailyDefs.length} daily entries`);

  // ─── MEDICATIONS ─────────────────────────────────────────────────────────────
  const medicationDefs = [
    { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'daily', isActive: true },
    { name: 'Magnesium Glycinate', dosage: '400mg', frequency: 'daily', isActive: true },
    { name: 'Omega-3 Fish Oil', dosage: '1000mg', frequency: 'daily', isActive: true },
    { name: 'B12', dosage: '1000mcg', frequency: 'daily', isActive: true },
    { name: 'Probiotics', dosage: '10B CFU', frequency: 'daily', isActive: true },
    { name: 'Ashwagandha', dosage: '500mg', frequency: 'daily', isActive: true },
    { name: 'Iron Supplement', dosage: '18mg', frequency: 'twice_daily', isActive: false },
    { name: 'Zinc', dosage: '15mg', frequency: 'daily', isActive: true },
  ];
  await Promise.all(medicationDefs.map(m => storage.createMedication(m)));
  console.log(`  ✓ Created ${medicationDefs.length} medications`);

  // ─── TIME BLOCKS ─────────────────────────────────────────────────────────────
  const timeBlockDefs = [
    { title: 'Morning Routine & Workout', startTime: '05:00', endTime: '07:00', date: d(0), status: 'completed', color: '#10b981' },
    { title: 'Deep Work — Content Creation', startTime: '09:00', endTime: '11:00', date: d(0), status: 'active', color: '#6366f1' },
    { title: 'Email & Messages', startTime: '11:00', endTime: '11:30', date: d(0), status: 'active', color: '#f59e0b' },
    { title: 'Lunch Break', startTime: '12:00', endTime: '13:00', date: d(0), status: 'scheduled', color: '#84cc16' },
    { title: 'Admin & Planning', startTime: '13:00', endTime: '14:30', date: d(0), status: 'scheduled', color: '#06b6d4' },
    { title: 'Content Filming & Editing', startTime: '15:00', endTime: '17:00', date: d(0), status: 'scheduled', color: '#8b5cf6' },
    { title: 'Evening Walk', startTime: '17:30', endTime: '18:15', date: d(0), status: 'scheduled', color: '#10b981' },
    { title: 'Personal Development Reading', startTime: '20:00', endTime: '21:00', date: d(0), status: 'scheduled', color: '#ec4899' },
    { title: 'Wind Down & Sleep Prep', startTime: '22:00', endTime: '23:00', date: d(0), status: 'scheduled', color: '#64748b' },
    // Tomorrow
    { title: 'Morning Routine', startTime: '05:30', endTime: '07:00', date: d(1), status: 'scheduled', color: '#10b981' },
    { title: 'Strategy & Planning Session', startTime: '08:00', endTime: '10:00', date: d(1), status: 'scheduled', color: '#6366f1' },
    { title: 'Client Calls', startTime: '10:00', endTime: '12:00', date: d(1), status: 'scheduled', color: '#f59e0b' },
    // Yesterday
    { title: 'Morning Run', startTime: '06:00', endTime: '07:00', date: d(-1), status: 'completed', color: '#10b981' },
    { title: 'Content Batch Day', startTime: '09:00', endTime: '13:00', date: d(-1), status: 'completed', color: '#8b5cf6' },
    { title: 'Brand Outreach Emails', startTime: '14:00', endTime: '15:30', date: d(-1), status: 'completed', color: '#06b6d4' },
  ];
  await Promise.all(timeBlockDefs.map(tb => storage.createTimeBlock(tb)));
  console.log(`  ✓ Created ${timeBlockDefs.length} time blocks`);

  // ─── FOCUS SESSIONS ──────────────────────────────────────────────────────────
  const sessionTypes = ['focus', 'pomodoro', 'deep-work', 'flow'];
  const focusSessionDefs = Array.from({ length: 15 }, (_, i) => ({
    date: d(-Math.floor(i / 2)),
    sessionType: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
    duration: [25, 45, 60, 90][Math.floor(Math.random() * 4)],
    isCompleted: Math.random() > 0.1,
    taskDescription: ['Content writing', 'Video editing', 'Email responses', 'Planning', 'Learning', 'Admin work'][Math.floor(Math.random() * 6)],
  }));
  await Promise.all(focusSessionDefs.map(s => storage.createFocusSession(s)));
  console.log(`  ✓ Created ${focusSessionDefs.length} focus sessions`);

  // ─── MINI GAME BLOCKS (Content Studio) ───────────────────────────────────────
  const blockDefs = [
    { title: 'Daily Wellness Check-In', description: 'Morning energy and mood check', gameType: 'wellness', difficulty: 'easy', estimatedPlayTime: 5 },
    { title: 'Astro Daily Card', description: 'Astrological insights and affirmations', gameType: 'astrological', difficulty: 'easy', estimatedPlayTime: 3 },
    { title: 'Growth Mindset Challenge', description: 'Weekly mindset expansion prompt', gameType: 'educational', difficulty: 'medium', estimatedPlayTime: 10 },
    { title: 'This or That: Wellness Edition', description: 'Interactive wellness preference game', gameType: 'engagement', difficulty: 'easy', estimatedPlayTime: 2 },
    { title: 'Manifestation Board Builder', description: 'Create visual goal boards', gameType: 'creative', difficulty: 'medium', estimatedPlayTime: 15 },
    { title: 'Habit Streak Tracker', description: 'Track and celebrate streaks', gameType: 'wellness', difficulty: 'easy', estimatedPlayTime: 5 },
    { title: 'Moon Phase Journal', description: 'Lunar cycle journaling prompts', gameType: 'astrological', difficulty: 'easy', estimatedPlayTime: 7 },
    { title: 'Power Hour Planner', description: 'Focused productivity planning game', gameType: 'educational', difficulty: 'hard', estimatedPlayTime: 20 },
  ];
  const blocks = await Promise.all(blockDefs.map(b => storage.createMiniGameBlock(b)));
  console.log(`  ✓ Created ${blocks.length} mini game blocks`);

  // Performance insights for each block
  const platforms = ['TikTok', 'Instagram', 'Twitter'];
  const days = ['Monday', 'Wednesday', 'Friday'];
  const insightDefs: Promise<any>[] = [];
  for (const block of blocks) {
    for (const platform of platforms) {
      insightDefs.push(storage.createPerformanceInsights({
        miniGameBlockId: block.id,
        platform,
        dayOfWeek: days[Math.floor(Math.random() * days.length)],
        avgViews: Math.floor(Math.random() * 8000) + 1000,
        avgEngagement: Math.floor(Math.random() * 1200) + 200,
        bestPerformingTime: ['7:00 AM', '12:00 PM', '6:00 PM', '9:00 PM'][Math.floor(Math.random() * 4)],
        insights: `${platform} posts perform best in the morning with visual hooks`,
      }));
    }
  }
  await Promise.all(insightDefs);
  console.log(`  ✓ Created performance insights`);

  // ─── BILLS ───────────────────────────────────────────────────────────────────
  const billDefs = [
    { name: 'Rent', amount: '1450.00', isAutoPay: true, dueDate: 1 },
    { name: 'Electricity', amount: '87.50', isAutoPay: false, dueDate: 15 },
    { name: 'Internet', amount: '59.99', isAutoPay: true, dueDate: 10 },
    { name: 'Netflix', amount: '15.49', isAutoPay: true, dueDate: 12 },
    { name: 'Spotify', amount: '9.99', isAutoPay: true, dueDate: 8 },
    { name: 'Phone Bill', amount: '65.00', isAutoPay: true, dueDate: 20 },
    { name: 'Car Insurance', amount: '142.00', isAutoPay: false, dueDate: 5 },
    { name: 'Gym Membership', amount: '49.00', isAutoPay: true, dueDate: 1 },
    { name: 'Hulu', amount: '17.99', isAutoPay: true, dueDate: 18 },
    { name: 'Adobe Creative Cloud', amount: '54.99', isAutoPay: true, dueDate: 22 },
  ];
  const bills = await Promise.all(billDefs.map(b => storage.createBill(b)));
  // Bill payments for past 3 months
  for (const bill of bills) {
    for (let month = 1; month <= 3; month++) {
      await storage.createBillPayment({
        billId: bill.id,
        date: d(-month * 30),
        amount: bill.amount,
        isPaid: true,
      });
    }
  }
  console.log(`  ✓ Created ${bills.length} bills and payment history`);

  // ─── BUDGET CATEGORIES & EXPENSES ────────────────────────────────────────────
  const categoryDefs = [
    { name: 'Housing', budgetLimit: '1500', color: '#6366f1', icon: '🏠' },
    { name: 'Food & Groceries', budgetLimit: '400', color: '#10b981', icon: '🛒' },
    { name: 'Transportation', budgetLimit: '250', color: '#f59e0b', icon: '🚗' },
    { name: 'Entertainment', budgetLimit: '150', color: '#ec4899', icon: '🎬' },
    { name: 'Health & Fitness', budgetLimit: '200', color: '#06b6d4', icon: '💪' },
    { name: 'Subscriptions', budgetLimit: '100', color: '#8b5cf6', icon: '📱' },
    { name: 'Clothing', budgetLimit: '150', color: '#ef4444', icon: '👗' },
    { name: 'Personal Care', budgetLimit: '80', color: '#f97316', icon: '✨' },
  ];
  const categories = await Promise.all(categoryDefs.map(c => storage.createBudgetCategory(c)));

  const expenseNames: Record<string, string[]> = {
    'Food & Groceries': ['Whole Foods Market', 'Trader Joes', 'Farmers Market', 'Coffee Shop', 'DoorDash Order', 'Chipotle'],
    'Transportation': ['Gas Station', 'Uber Ride', 'Parking Fee', 'Car Wash', 'Metro Card'],
    'Entertainment': ['Movie Tickets', 'Concert Tickets', 'Bowling Night', 'Amazon Prime Video', 'Book Purchase'],
    'Health & Fitness': ['Vitamins & Supplements', 'Running Shoes', 'Yoga Mat', 'Workout Clothes', 'Massage'],
    'Clothing': ['ZARA', 'Target', 'H&M', 'Online Shopping'],
    'Personal Care': ['Skincare Products', 'Haircut', 'Manicure', 'Face Wash'],
  };

  const expenseDefs: Promise<any>[] = [];
  for (const cat of categories) {
    const names = expenseNames[cat.name] || ['Miscellaneous Expense'];
    const count = Math.floor(Math.random() * 6) + 4;
    for (let i = 0; i < count; i++) {
      expenseDefs.push(storage.createExpense({
        description: names[Math.floor(Math.random() * names.length)],
        amount: (Math.random() * 80 + 5).toFixed(2),
        categoryId: cat.id,
        date: d(-Math.floor(Math.random() * 30)),
        notes: Math.random() > 0.6 ? 'Weekly essential' : undefined,
      }));
    }
  }
  await Promise.all(expenseDefs);
  console.log(`  ✓ Created budget categories and ${expenseDefs.length} expenses`);

  // ─── GROCERY ITEMS ───────────────────────────────────────────────────────────
  const groceryItemDefs = [
    { name: 'Organic Spinach', estimatedPrice: '4.99', isCompleted: false },
    { name: 'Greek Yogurt (Plain)', estimatedPrice: '6.49', isCompleted: true },
    { name: 'Chicken Breast (2 lbs)', estimatedPrice: '12.99', isCompleted: false },
    { name: 'Avocados (4 pack)', estimatedPrice: '5.99', isCompleted: true },
    { name: 'Almond Milk', estimatedPrice: '4.29', isCompleted: false },
    { name: 'Brown Rice (5 lb bag)', estimatedPrice: '7.49', isCompleted: true },
    { name: 'Blueberries', estimatedPrice: '5.49', isCompleted: false },
    { name: 'Salmon Fillets', estimatedPrice: '14.99', isCompleted: false },
    { name: 'Sweet Potatoes', estimatedPrice: '3.99', isCompleted: true },
    { name: 'Black Beans (can)', estimatedPrice: '1.49', isCompleted: true },
    { name: 'Olive Oil', estimatedPrice: '8.99', isCompleted: false },
    { name: 'Eggs (dozen)', estimatedPrice: '5.49', isCompleted: false },
    { name: 'Mixed Berries (frozen)', estimatedPrice: '6.99', isCompleted: true },
    { name: 'Quinoa', estimatedPrice: '9.99', isCompleted: false },
    { name: 'Bananas', estimatedPrice: '1.89', isCompleted: true },
    { name: 'Kale', estimatedPrice: '3.49', isCompleted: false },
    { name: 'Cottage Cheese', estimatedPrice: '4.79', isCompleted: false },
    { name: 'Lemon (bag)', estimatedPrice: '3.99', isCompleted: false },
  ];
  await Promise.all(groceryItemDefs.map(g => storage.createGroceryItem(g)));
  console.log(`  ✓ Created ${groceryItemDefs.length} grocery items`);

  // ─── BLOG POSTS ──────────────────────────────────────────────────────────────
  const blogPostDefs = [
    { title: '10 Morning Habits That Changed My Life', content: 'Starting the day with intention is everything...', excerpt: 'The morning habits that took me from exhausted to energized.', status: 'published', type: 'blog', platform: 'Website', tags: '["wellness","morning","habits","productivity"]', publishedDate: d(-5), priority: 'high', wordCount: 1850, readingTime: 7, isAiGenerated: false },
    { title: 'My 30-Day Meditation Journey: What I Learned', content: 'Day 1 I thought I was failing...', excerpt: 'Honest reflections from 30 days of daily meditation practice.', status: 'published', type: 'blog', platform: 'Website', tags: '["meditation","mindfulness","mental health"]', publishedDate: d(-12), priority: 'high', wordCount: 2100, readingTime: 8, isAiGenerated: false },
    { title: 'The Truth About Manifestation (From Someone Who Tried Everything)', content: "Let's get real about the law of attraction...", excerpt: "What actually works and what's just pretty journaling.", status: 'published', type: 'blog', platform: 'Website', tags: '["manifestation","mindset","personal growth"]', publishedDate: d(-20), priority: 'medium', wordCount: 1650, readingTime: 6, isAiGenerated: false },
    { title: 'How I Budget on a Variable Income as a Creator', content: 'When your income changes every month...', excerpt: 'My exact system for managing finances with unpredictable income.', status: 'draft', type: 'blog', platform: 'Website', tags: '["finance","budgeting","creator economy"]', priority: 'high', wordCount: 980, readingTime: 4, isAiGenerated: false },
    { title: 'What Astrology Taught Me About Productivity', content: 'Before you write this off...', excerpt: 'Using lunar cycles to plan your workflow (it actually works).', status: 'review', type: 'blog', platform: 'Website', tags: '["astrology","productivity","planning"]', reviewDate: d(2), priority: 'medium', wordCount: 1400, readingTime: 5, isAiGenerated: false },
    { title: 'Hormone Health 101: What Every Woman Should Know', content: 'Nobody taught us this in school...', excerpt: 'The basics of hormonal health that changed how I eat, sleep, and exercise.', status: 'scheduled', type: 'blog', platform: 'Website', tags: '["health","hormones","wellness","women"]', scheduledDate: d(7), priority: 'high', wordCount: 2400, readingTime: 9, isAiGenerated: true },
    { title: '5 Habits That Are Silently Sabotaging Your Sleep', content: "You're probably doing at least two of these...", excerpt: 'The sneaky habits wrecking your rest and how to fix them tonight.', status: 'draft', type: 'blog', platform: 'Website', tags: '["sleep","habits","wellness"]', priority: 'medium', wordCount: 750, readingTime: 3, isAiGenerated: false },
    { title: 'How I Grew from 0 to 400 Followers in 60 Days', content: 'No viral moment, no bought followers...', excerpt: 'The exact strategy I used to build an engaged audience from scratch.', status: 'published', type: 'blog', platform: 'Website', tags: '["content creation","social media","growth"]', publishedDate: d(-8), priority: 'high', wordCount: 1700, readingTime: 6, isAiGenerated: false },
    { title: 'The 12-3-30 Workout Review: 6 Months Later', content: 'I stuck with it longer than expected...', excerpt: 'My honest review of the TikTok-famous treadmill workout after 6 months.', status: 'published', type: 'blog', platform: 'Website', tags: '["fitness","workout","review"]', publishedDate: d(-35), priority: 'low', wordCount: 1200, readingTime: 5, isAiGenerated: false },
    { title: 'Setting Goals That Actually Stick (The Anti-Vision-Board Method)', content: 'Vision boards are beautiful but...', excerpt: 'Why most goals fail and the system I use to actually follow through.', status: 'scheduled', type: 'blog', platform: 'Website', tags: '["goals","productivity","mindset"]', scheduledDate: d(14), priority: 'medium', wordCount: 1550, readingTime: 6, isAiGenerated: false },
  ];
  await Promise.all(blogPostDefs.map(p => storage.createBlogPost(p)));
  console.log(`  ✓ Created ${blogPostDefs.length} blog posts`);

  // ─── BLOG IDEAS ──────────────────────────────────────────────────────────────
  const blogIdeaDefs = [
    { title: 'Cycle Syncing Workout Guide', description: 'How to tailor workouts to your menstrual cycle phases', category: 'health', platform: 'Website', tags: '["fitness","hormones","women"]', priority: 'high', status: 'idea', estimatedReadTime: 8, targetAudience: 'Women 25-35' },
    { title: 'My Supplement Stack for 2026', description: 'Honest breakdown of what I actually take and why', category: 'wellness', platform: 'Website', tags: '["supplements","health","review"]', priority: 'medium', status: 'researching', estimatedReadTime: 5, targetAudience: 'Health-conscious adults' },
    { title: 'Digital Detox Weekend: What Happened', description: '48 hours without social media — my experience', category: 'wellness', platform: 'Website', tags: '["digital detox","mental health","social media"]', priority: 'medium', status: 'idea', estimatedReadTime: 6 },
    { title: 'How to Build a Content Batching System', description: 'Film and plan 30 days of content in one weekend', category: 'content', platform: 'Website', tags: '["content creation","productivity","creator"]', priority: 'high', status: 'outlined', estimatedReadTime: 7, targetAudience: 'Content creators' },
    { title: 'My Favorite Hormone-Friendly Recipes', description: 'Foods that support estrogen balance and energy', category: 'health', platform: 'Website', tags: '["nutrition","recipes","hormones","wellness"]', priority: 'low', status: 'idea', estimatedReadTime: 4 },
    { title: 'The Best Productivity Apps I Actually Use', description: 'No sponsored content — tools that genuinely help', category: 'productivity', platform: 'Website', tags: '["apps","productivity","tools"]', priority: 'medium', status: 'researching', estimatedReadTime: 5, targetAudience: 'Professionals and creators' },
    { title: 'Anxiety Management Without Medication: What Works for Me', description: 'Personal story and practical techniques', category: 'mental health', platform: 'Website', tags: '["anxiety","mental health","wellness"]', priority: 'high', status: 'idea', estimatedReadTime: 9, targetAudience: 'Adults dealing with anxiety' },
    { title: '6-Month Savings Challenge Results', description: 'How I saved $6K in 6 months on a creator income', category: 'finance', platform: 'Website', tags: '["savings","finance","challenge"]', priority: 'medium', status: 'outlined', estimatedReadTime: 5 },
  ];
  await Promise.all(blogIdeaDefs.map(i => storage.createBlogIdea(i)));
  console.log(`  ✓ Created ${blogIdeaDefs.length} blog ideas`);

  // ─── HEALTH VITALS ───────────────────────────────────────────────────────────
  const vitalDefs = Array.from({ length: 20 }, (_, i) => ({
    date: d(-i),
    heartRate: Math.floor(Math.random() * 20) + 60,
    systolic: Math.floor(Math.random() * 15) + 110,
    diastolic: Math.floor(Math.random() * 10) + 70,
    bloodPressure: `${Math.floor(Math.random() * 15) + 110}/${Math.floor(Math.random() * 10) + 70}`,
    weight: (Math.random() * 8 + 145).toFixed(1),
    temperature: (Math.random() * 1.5 + 97.5).toFixed(1),
    oxygenSaturation: Math.floor(Math.random() * 3) + 97,
    notes: i % 5 === 0 ? 'Felt rested and energized' : undefined,
  }));
  await Promise.all(vitalDefs.map(v => storage.createHealthVitals(v)));
  console.log(`  ✓ Created ${vitalDefs.length} health vital records`);

  // ─── SLEEP LOGS ──────────────────────────────────────────────────────────────
  const sleepLogDefs = Array.from({ length: 20 }, (_, i) => {
    const duration = (Math.random() * 2.5 + 6.0).toFixed(1);
    return {
      date: d(-i),
      bedtime: `${Math.floor(Math.random() * 2) + 22}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}`,
      wakeTime: `${Math.floor(Math.random() * 2) + 6}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}`,
      sleepDuration: duration,
      sleepQuality: Math.floor(Math.random() * 4) + 6,
      deepSleep: (parseFloat(duration) * 0.2).toFixed(1),
      remSleep: (parseFloat(duration) * 0.25).toFixed(1),
      lightSleep: (parseFloat(duration) * 0.55).toFixed(1),
      wakeCount: Math.floor(Math.random() * 3),
      notes: i % 6 === 0 ? 'Slept really well, no interruptions' : undefined,
    };
  });
  await Promise.all(sleepLogDefs.map(l => storage.createSleepLog(l)));
  console.log(`  ✓ Created ${sleepLogDefs.length} sleep logs`);

  // ─── WELLNESS JOURNAL ────────────────────────────────────────────────────────
  const journalEntries = Array.from({ length: 20 }, (_, i) => ({
    date: d(-i),
    moodScore: Math.floor(Math.random() * 4) + 6,
    energyLevel: Math.floor(Math.random() * 4) + 5,
    stressLevel: Math.floor(Math.random() * 5) + 2,
    gratitude: ['Grateful for my health', 'Thankful for sunny weather', 'Appreciating small wins', 'Grateful for supportive friends'][Math.floor(Math.random() * 4)],
    notes: [
      'Had a productive morning session, feeling focused.',
      'Energy dipped after lunch, need to watch carb intake.',
      'Great workout today, endorphins are real!',
      'Stressed about upcoming deadline but managing it well.',
      'Feeling really aligned with my goals today.',
    ][Math.floor(Math.random() * 5)],
    symptoms: i % 7 === 0 ? 'Mild headache' : undefined,
  }));
  await Promise.all(journalEntries.map(e => storage.createWellnessJournal(e)));
  console.log(`  ✓ Created ${journalEntries.length} wellness journal entries`);

  // ─── HEALTH & WELLNESS GOALS ─────────────────────────────────────────────────
  const hwGoalDefs = [
    { title: 'Reach Goal Weight (145 lbs)', category: 'weight', targetValue: '145', currentValue: '152', unit: 'lbs', targetDate: d(60), priority: 'high' },
    { title: 'Sleep 8 Hours Consistently', category: 'sleep', targetValue: '30', currentValue: '18', unit: 'days', targetDate: d(40), priority: 'medium' },
    { title: 'Lower Resting Heart Rate to 60 BPM', category: 'fitness', targetValue: '60', currentValue: '68', unit: 'bpm', targetDate: d(90), priority: 'medium' },
    { title: 'Build 21-Day Meditation Streak', category: 'mental', targetValue: '21', currentValue: '14', unit: 'days', targetDate: d(7), priority: 'high' },
    { title: 'Drink 2L Water Daily', category: 'nutrition', targetValue: '30', currentValue: '22', unit: 'days', targetDate: d(8), priority: 'medium' },
    { title: 'Complete 5K Race', category: 'fitness', targetValue: '5', currentValue: '3.8', unit: 'km', targetDate: d(30), priority: 'high' },
    { title: 'Stress Score Below 4', category: 'mental', targetValue: '4', currentValue: '5.2', unit: 'score', targetDate: d(45), priority: 'medium' },
    { title: 'No Alcohol for 30 Days', category: 'habit', targetValue: '30', currentValue: '30', unit: 'days', isCompleted: true, priority: 'high' },
    { title: 'Morning Workout 5x Per Week', category: 'fitness', targetValue: '20', currentValue: '13', unit: 'sessions', targetDate: d(35), priority: 'medium' },
    { title: 'Improve Sleep Quality Score to 8', category: 'sleep', targetValue: '8', currentValue: '6.8', unit: 'score', targetDate: d(50), priority: 'low' },
  ];
  await Promise.all(hwGoalDefs.map(g => storage.createHealthWellnessGoal(g)));
  console.log(`  ✓ Created ${hwGoalDefs.length} health & wellness goals`);

  console.log('✅ Demo data seeding complete!');
}
