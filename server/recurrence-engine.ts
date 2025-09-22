import { 
  WeeklyConfig, 
  NthWeekdayConfig, 
  QuarterlyConfig, 
  MonthlyDayConfig, 
  MoonPhaseConfig 
} from '../shared/schema';
import { moonPhaseService } from './moon-phase-service';

export interface RecurrencePattern {
  type: 'weekly' | 'nth_weekday' | 'quarterly' | 'monthly_day' | 'moon_phase';
  config: WeeklyConfig | NthWeekdayConfig | QuarterlyConfig | MonthlyDayConfig | MoonPhaseConfig;
}

export interface ScheduleOccurrence {
  date: Date;
  title: string;
  description?: string;
}

export class RecurrenceEngine {
  /**
   * Calculate the next occurrence(s) of a recurring schedule
   */
  async calculateNextOccurrences(
    pattern: RecurrencePattern,
    fromDate: Date = new Date(),
    maxOccurrences: number = 10
  ): Promise<ScheduleOccurrence[]> {
    switch (pattern.type) {
      case 'weekly':
        return this.calculateWeeklyOccurrences(pattern.config as WeeklyConfig, fromDate, maxOccurrences);
      
      case 'nth_weekday':
        return this.calculateNthWeekdayOccurrences(pattern.config as NthWeekdayConfig, fromDate, maxOccurrences);
      
      case 'quarterly':
        return this.calculateQuarterlyOccurrences(pattern.config as QuarterlyConfig, fromDate, maxOccurrences);
      
      case 'monthly_day':
        return this.calculateMonthlyDayOccurrences(pattern.config as MonthlyDayConfig, fromDate, maxOccurrences);
      
      case 'moon_phase':
        return await this.calculateMoonPhaseOccurrences(pattern.config as MoonPhaseConfig, fromDate, maxOccurrences);
      
      default:
        throw new Error(`Unsupported recurrence type: ${pattern.type}`);
    }
  }

  /**
   * Weekly recurrence: Every Monday, Tuesday, etc.
   */
  private calculateWeeklyOccurrences(
    config: WeeklyConfig,
    fromDate: Date,
    maxOccurrences: number
  ): ScheduleOccurrence[] {
    const occurrences: ScheduleOccurrence[] = [];
    const currentDate = new Date(fromDate);
    
    // Find the next occurrence of the specified day of week
    const targetDay = config.dayOfWeek;
    const currentDay = currentDate.getDay();
    
    let daysUntilTarget = (targetDay - currentDay + 7) % 7;
    if (daysUntilTarget === 0 && currentDate.getHours() >= (config.time ? parseInt(config.time.split(':')[0]) : 9)) {
      daysUntilTarget = 7; // If it's the same day but past the time, go to next week
    }
    
    currentDate.setDate(currentDate.getDate() + daysUntilTarget);
    
    // Set the time if specified
    if (config.time) {
      const [hours, minutes] = config.time.split(':').map(Number);
      currentDate.setHours(hours, minutes, 0, 0);
    }
    
    // Generate weekly occurrences
    for (let i = 0; i < maxOccurrences; i++) {
      occurrences.push({
        date: new Date(currentDate),
        title: `Weekly occurrence - ${this.getDayName(targetDay)}`,
        description: `Scheduled for every ${this.getDayName(targetDay)}${config.time ? ` at ${config.time}` : ''}`
      });
      
      currentDate.setDate(currentDate.getDate() + 7); // Next week
    }
    
    return occurrences;
  }

  /**
   * Nth weekday: 2nd Monday, 4th Sunday, First Friday, etc.
   */
  private calculateNthWeekdayOccurrences(
    config: NthWeekdayConfig,
    fromDate: Date,
    maxOccurrences: number
  ): ScheduleOccurrence[] {
    const occurrences: ScheduleOccurrence[] = [];
    const currentDate = new Date(fromDate);
    
    // Start from the beginning of current month
    currentDate.setDate(1);
    
    for (let i = 0; i < maxOccurrences; i++) {
      const occurrence = this.findNthWeekdayInMonth(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        config.weekNumber,
        config.dayOfWeek
      );
      
      if (occurrence && occurrence >= fromDate) {
        if (config.time) {
          const [hours, minutes] = config.time.split(':').map(Number);
          occurrence.setHours(hours, minutes, 0, 0);
        }
        
        const weekText = config.weekNumber === -1 ? 'Last' : 
                        config.weekNumber === 1 ? '1st' :
                        config.weekNumber === 2 ? '2nd' :
                        config.weekNumber === 3 ? '3rd' : '4th';
        
        occurrences.push({
          date: new Date(occurrence),
          title: `${weekText} ${this.getDayName(config.dayOfWeek)} of month`,
          description: `Scheduled for ${weekText} ${this.getDayName(config.dayOfWeek)} of every month${config.time ? ` at ${config.time}` : ''}`
        });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return occurrences.filter(o => o.date >= fromDate);
  }

  /**
   * Quarterly recurrence
   */
  private calculateQuarterlyOccurrences(
    config: QuarterlyConfig,
    fromDate: Date,
    maxOccurrences: number
  ): ScheduleOccurrence[] {
    const occurrences: ScheduleOccurrence[] = [];
    const currentDate = new Date(fromDate);
    
    // Find the current quarter and the target month within that quarter
    const currentQuarter = Math.floor(currentDate.getMonth() / 3);
    const quarterStartMonth = currentQuarter * 3;
    const targetMonth = quarterStartMonth + (config.monthInQuarter - 1);
    
    // Set to the target month and day
    currentDate.setMonth(targetMonth);
    currentDate.setDate(config.dayOfMonth);
    
    // If this date has already passed, move to next quarter
    if (currentDate < fromDate) {
      currentDate.setMonth(currentDate.getMonth() + 3);
    }
    
    if (config.time) {
      const [hours, minutes] = config.time.split(':').map(Number);
      currentDate.setHours(hours, minutes, 0, 0);
    }
    
    for (let i = 0; i < maxOccurrences; i++) {
      occurrences.push({
        date: new Date(currentDate),
        title: `Quarterly occurrence`,
        description: `Scheduled for ${this.getMonthName(config.monthInQuarter)} month of each quarter, day ${config.dayOfMonth}${config.time ? ` at ${config.time}` : ''}`
      });
      
      // Move to next quarter (3 months)
      currentDate.setMonth(currentDate.getMonth() + 3);
    }
    
    return occurrences;
  }

  /**
   * Monthly day recurrence: 1st, 2nd, 3rd, 7th, 14th day of month
   */
  private calculateMonthlyDayOccurrences(
    config: MonthlyDayConfig,
    fromDate: Date,
    maxOccurrences: number
  ): ScheduleOccurrence[] {
    const occurrences: ScheduleOccurrence[] = [];
    const currentDate = new Date(fromDate);
    
    // Set to the target day of current month
    currentDate.setDate(config.dayOfMonth);
    
    // If this date has already passed this month, move to next month
    if (currentDate < fromDate) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    if (config.time) {
      const [hours, minutes] = config.time.split(':').map(Number);
      currentDate.setHours(hours, minutes, 0, 0);
    }
    
    for (let i = 0; i < maxOccurrences; i++) {
      // Handle months that don't have enough days (e.g., February 30th)
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), config.dayOfMonth);
      
      if (targetDate.getDate() === config.dayOfMonth) {
        if (config.time) {
          const [hours, minutes] = config.time.split(':').map(Number);
          targetDate.setHours(hours, minutes, 0, 0);
        }
        
        occurrences.push({
          date: new Date(targetDate),
          title: `Monthly occurrence - Day ${config.dayOfMonth}`,
          description: `Scheduled for the ${this.getOrdinal(config.dayOfMonth)} day of every month${config.time ? ` at ${config.time}` : ''}`
        });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return occurrences;
  }

  /**
   * Moon phase recurrence: Full Moon, New Moon, etc.
   */
  private async calculateMoonPhaseOccurrences(
    config: MoonPhaseConfig,
    fromDate: Date,
    maxOccurrences: number
  ): Promise<ScheduleOccurrence[]> {
    const occurrences: ScheduleOccurrence[] = [];
    
    try {
      // Get moon phases for current and next year
      const allPhases = await moonPhaseService.getCurrentAndNextYearPhases();
      
      // Filter phases that match our criteria and are in the future
      const matchingPhases = allPhases.filter(phase => {
        const phaseDate = new Date(phase.date);
        
        // Apply offset if specified
        if (config.offsetDays) {
          phaseDate.setDate(phaseDate.getDate() + config.offsetDays);
        }
        
        return phaseDate >= fromDate && config.phaseTypes.includes(phase.phaseType);
      });
      
      // Sort by date and take the requested number of occurrences
      matchingPhases.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      for (let i = 0; i < Math.min(maxOccurrences, matchingPhases.length); i++) {
        const phase = matchingPhases[i];
        const scheduleDate = new Date(phase.date);
        
        // Apply offset
        if (config.offsetDays) {
          scheduleDate.setDate(scheduleDate.getDate() + config.offsetDays);
        }
        
        // Set time if specified
        if (config.time) {
          const [hours, minutes] = config.time.split(':').map(Number);
          scheduleDate.setHours(hours, minutes, 0, 0);
        }
        
        const phaseNames = {
          'new_moon': 'New Moon',
          'first_quarter': 'First Quarter',
          'full_moon': 'Full Moon',
          'last_quarter': 'Last Quarter',
          'waxing_crescent': 'Waxing Crescent',
          'waxing_gibbous': 'Waxing Gibbous',
          'waning_gibbous': 'Waning Gibbous',
          'waning_crescent': 'Waning Crescent'
        };
        
        const offsetText = config.offsetDays ? 
          (config.offsetDays > 0 ? ` +${config.offsetDays} days` : ` ${config.offsetDays} days`) : '';
        
        occurrences.push({
          date: scheduleDate,
          title: `${phaseNames[phase.phaseType]} occurrence`,
          description: `Scheduled for ${phaseNames[phase.phaseType]}${offsetText}${config.time ? ` at ${config.time}` : ''}`
        });
      }
      
    } catch (error) {
      console.error('Error calculating moon phase occurrences:', error);
      // Fallback to simple monthly schedule if moon phase API fails
      return this.calculateMonthlyDayOccurrences(
        { dayOfMonth: 15, time: config.time },
        fromDate,
        maxOccurrences
      );
    }
    
    return occurrences;
  }

  /**
   * Helper: Find the Nth occurrence of a weekday in a month
   */
  private findNthWeekdayInMonth(year: number, month: number, weekNumber: number, dayOfWeek: number): Date | null {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    if (weekNumber === -1) {
      // Last occurrence - work backwards from end of month
      const lastDayOfWeek = lastDay.getDay();
      const daysToSubtract = (lastDayOfWeek - dayOfWeek + 7) % 7;
      return new Date(year, month, lastDay.getDate() - daysToSubtract);
    } else {
      // Nth occurrence - work forwards from start of month
      const firstDayOfWeek = firstDay.getDay();
      const daysToAdd = (dayOfWeek - firstDayOfWeek + 7) % 7;
      const nthOccurrence = new Date(year, month, 1 + daysToAdd + ((weekNumber - 1) * 7));
      
      // Check if this date exists in the month
      return nthOccurrence.getMonth() === month ? nthOccurrence : null;
    }
  }

  /**
   * Helper functions
   */
  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  private getMonthName(monthInQuarter: number): string {
    const names = ['first', 'second', 'third'];
    return names[monthInQuarter - 1];
  }

  private getOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
}

// Singleton instance
export const recurrenceEngine = new RecurrenceEngine();