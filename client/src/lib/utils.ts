import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(time: string): string {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function calculateSleepHours(bedtime: string, wakeTime: string): number {
  const bedDate = new Date(`2024-01-01 ${bedtime}`);
  let wakeDate = new Date(`2024-01-01 ${wakeTime}`);
  
  // If wake time is earlier than bedtime, it's the next day
  if (wakeDate < bedDate) {
    wakeDate.setDate(wakeDate.getDate() + 1);
  }
  
  const diffMs = wakeDate.getTime() - bedDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
}
