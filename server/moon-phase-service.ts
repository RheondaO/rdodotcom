import axios from 'axios';

interface USNOPhaseData {
  phase: string;
  date: string;
  time: string;
}

interface USNOResponse {
  phasedata: USNOPhaseData[];
  apiversion: string;
  year: number;
}

interface MoonPhaseResult {
  phaseType: 'new_moon' | 'first_quarter' | 'full_moon' | 'last_quarter';
  date: Date;
  year: number;
  month: number;
  isMainPhase: boolean;
}

export class MoonPhaseService {
  private readonly USNO_BASE_URL = 'https://aa.usno.navy.mil/api';
  private readonly PHASE_MAPPING = {
    'New Moon': 'new_moon' as const,
    'First Quarter': 'first_quarter' as const, 
    'Full Moon': 'full_moon' as const,
    'Last Quarter': 'last_quarter' as const,
  };

  /**
   * Fetch moon phases for a specific year from US Naval Observatory
   */
  async getMoonPhasesForYear(year: number): Promise<MoonPhaseResult[]> {
    try {
      console.log(`🌙 Fetching moon phases for year ${year} from USNO API...`);
      
      const response = await axios.get<USNOResponse>(`${this.USNO_BASE_URL}/moon/phases/year`, {
        params: { year },
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Belle-Journal-Moon-Scheduler/1.0'
        }
      });

      const phases = response.data.phasedata.map(phase => {
        const phaseType = this.PHASE_MAPPING[phase.phase as keyof typeof this.PHASE_MAPPING];
        if (!phaseType) {
          console.warn(`⚠️ Unknown moon phase: ${phase.phase}`);
          return null;
        }

        // Parse the date and time from USNO format
        const dateTime = this.parseUSNODateTime(phase.date, phase.time, year);
        
        return {
          phaseType,
          date: dateTime,
          year,
          month: dateTime.getMonth() + 1,
          isMainPhase: true,
        };
      }).filter(Boolean) as MoonPhaseResult[];

      console.log(`✅ Retrieved ${phases.length} moon phases for ${year}`);
      return phases;
      
    } catch (error: any) {
      console.error(`❌ Failed to fetch moon phases for ${year}:`, error.message);
      
      // Fallback to calculated phases if API fails
      console.log('🔄 Falling back to calculated moon phases...');
      return this.getCalculatedMoonPhases(year);
    }
  }

  /**
   * Get moon phases for current year and next year (for scheduling ahead)
   */
  async getCurrentAndNextYearPhases(): Promise<MoonPhaseResult[]> {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const [currentPhases, nextPhases] = await Promise.all([
      this.getMoonPhasesForYear(currentYear),
      this.getMoonPhasesForYear(nextYear)
    ]);

    return [...currentPhases, ...nextPhases];
  }

  /**
   * Find the next occurrence of a specific moon phase type
   */
  getNextMoonPhase(phaseType: string, fromDate: Date = new Date()): Date | null {
    // This would use the stored moon phase data or calculate the next occurrence
    // For now, return a placeholder - this would be implemented with astronomical calculations
    const currentDate = new Date(fromDate);
    
    // Approximate lunar cycle is 29.53 days
    const lunarCycle = 29.53;
    const phasesPerCycle = 4;
    const daysPerPhase = lunarCycle / phasesPerCycle;

    // Simple approximation - would be replaced with accurate calculations
    switch (phaseType) {
      case 'new_moon':
        currentDate.setDate(currentDate.getDate() + Math.ceil(daysPerPhase));
        break;
      case 'first_quarter':
        currentDate.setDate(currentDate.getDate() + Math.ceil(daysPerPhase * 2));
        break;
      case 'full_moon':
        currentDate.setDate(currentDate.getDate() + Math.ceil(daysPerPhase * 3));
        break;
      case 'last_quarter':
        currentDate.setDate(currentDate.getDate() + Math.ceil(daysPerPhase * 4));
        break;
      default:
        return null;
    }

    return currentDate;
  }

  /**
   * Parse USNO date/time format to JavaScript Date
   */
  private parseUSNODateTime(dateStr: string, timeStr: string, year: number): Date {
    try {
      // USNO format: "13 Jan 2025" and "22:27"
      const [day, monthName] = dateStr.split(' ');
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const month = monthMap[monthName];
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Create UTC date
      return new Date(Date.UTC(year, month, parseInt(day), hours, minutes));
    } catch (error) {
      console.error('Error parsing USNO date/time:', { dateStr, timeStr, error });
      return new Date();
    }
  }

  /**
   * Fallback calculated moon phases using astronomical approximation
   */
  private getCalculatedMoonPhases(year: number): MoonPhaseResult[] {
    console.log(`🔢 Calculating approximate moon phases for ${year}...`);
    
    const phases: MoonPhaseResult[] = [];
    
    // Known New Moon reference: January 1, 2000 at 18:14 UTC
    const referenceNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
    const lunarMonth = 29.530588853; // Average lunar month in days
    
    // Calculate approximate New Moons for the year
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const endOfYear = new Date(Date.UTC(year, 11, 31));
    
    const daysSinceReference = (startOfYear.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const cyclesSinceReference = daysSinceReference / lunarMonth;
    const wholeCycles = Math.floor(cyclesSinceReference);
    
    // Generate phases for the year
    for (let cycle = wholeCycles; cycle <= wholeCycles + 13; cycle++) {
      const newMoonTime = referenceNewMoon.getTime() + (cycle * lunarMonth * 24 * 60 * 60 * 1000);
      const newMoonDate = new Date(newMoonTime);
      
      if (newMoonDate >= startOfYear && newMoonDate <= endOfYear) {
        // Add all four phases for this cycle
        const phaseInterval = lunarMonth / 4 * 24 * 60 * 60 * 1000;
        
        const phaseTypes = ['new_moon', 'first_quarter', 'full_moon', 'last_quarter'] as const;
        
        phaseTypes.forEach((phaseType, index) => {
          const phaseTime = newMoonTime + (index * phaseInterval);
          const phaseDate = new Date(phaseTime);
          
          if (phaseDate >= startOfYear && phaseDate <= endOfYear) {
            phases.push({
              phaseType,
              date: phaseDate,
              year,
              month: phaseDate.getMonth() + 1,
              isMainPhase: true,
            });
          }
        });
      }
    }
    
    console.log(`✅ Generated ${phases.length} calculated moon phases for ${year}`);
    return phases.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

// Singleton instance
export const moonPhaseService = new MoonPhaseService();