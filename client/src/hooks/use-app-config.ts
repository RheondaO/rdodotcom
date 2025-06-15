
import { useLocalStorage } from './use-local-storage';

interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'dashboard' | 'projects' | 'content';
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

const defaultConfig: AppConfig = {
  theme: 'system',
  defaultView: 'dashboard',
  notifications: true,
  autoSave: true,
  compactMode: false
};

export function useAppConfig() {
  const [config, setConfig] = useLocalStorage('belle-journal-config', defaultConfig);

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return { config, updateConfig };
}
