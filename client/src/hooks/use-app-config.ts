
import { useLocalStorage } from './use-local-storage';

interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'dashboard' | 'projects' | 'content';
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
  enableCaching: boolean;
  optimisticUpdates: boolean;
  refreshInterval: number; // in milliseconds
}

const defaultConfig: AppConfig = {
  theme: 'system',
  defaultView: 'dashboard',
  notifications: true,
  autoSave: true,
  compactMode: false,
  enableCaching: true,
  optimisticUpdates: true,
  refreshInterval: 60000 // 1 minute
};

export function useAppConfig() {
  const [config, setConfig] = useLocalStorage('belle-journal-config', defaultConfig);

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return { config, updateConfig };
}
