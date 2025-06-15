
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface ReplitEnvironment {
  isReplit: boolean;
  replId?: string;
  replUrl?: string;
  gitRepo?: string;
  deploymentUrl?: string;
}

interface ReplitFileChange {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: Date;
  size?: number;
}

export function useReplitIntegration() {
  const [environment, setEnvironment] = useState<ReplitEnvironment>({ isReplit: false });
  const [fileChanges, setFileChanges] = useState<ReplitFileChange[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const detectReplitEnvironment = () => {
      const isReplit = !!(
        import.meta.env.VITE_REPL_ID || 
        window.location.hostname.includes('replit.app') ||
        window.location.hostname.includes('repl.co') ||
        document.querySelector('script[src*="replit"]')
      );

      if (isReplit) {
        const replId = import.meta.env.VITE_REPL_ID || extractReplIdFromUrl();
        const replUrl = window.location.origin;
        
        const env: ReplitEnvironment = {
          isReplit: true,
          replId,
          replUrl,
          gitRepo: `https://replit.com/@${replId}`,
          deploymentUrl: replUrl
        };

        setEnvironment(env);
        setIsConnected(true);

        // Initialize file monitoring
        startFileMonitoring();

        toast({
          title: "Replit Integration Active",
          description: `Connected to ${replId}`,
        });
      }
    };

    detectReplitEnvironment();
  }, []);

  const extractReplIdFromUrl = (): string => {
    const hostname = window.location.hostname;
    if (hostname.includes('replit.app')) {
      return hostname.split('.')[0];
    }
    return 'unknown-repl';
  };

  const startFileMonitoring = () => {
    // Monitor document changes that might indicate file editing in Replit
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Detect potential file changes
          const changeDetected = Array.from(mutation.addedNodes).some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node as Element).querySelector('[data-file]')
          );

          if (changeDetected) {
            recordFileChange({
              path: 'detected-file-change',
              type: 'modified',
              timestamp: new Date()
            });
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  };

  const recordFileChange = (change: ReplitFileChange) => {
    setFileChanges(prev => [change, ...prev.slice(0, 19)]); // Keep last 20
  };

  const getProjectData = () => {
    if (!environment.isReplit) return null;

    return {
      name: `${environment.replId} - Replit Project`,
      description: `Auto-detected Replit project: ${environment.replId}`,
      repositoryUrl: environment.gitRepo,
      deploymentUrl: environment.deploymentUrl,
      techStack: detectTechStack(),
      isReplitProject: true
    };
  };

  const detectTechStack = (): string[] => {
    const stack: string[] = [];
    
    // Check for common frameworks/languages based on URL patterns or page content
    if (document.querySelector('script[src*="react"]') || document.title.includes('React')) {
      stack.push('React');
    }
    if (document.querySelector('script[src*="vue"]') || document.title.includes('Vue')) {
      stack.push('Vue.js');
    }
    if (window.location.pathname.includes('node') || document.title.includes('Node')) {
      stack.push('Node.js');
    }
    if (document.querySelector('script[type="module"]')) {
      stack.push('TypeScript/ES6');
    }

    return stack.length > 0 ? stack : ['Web Development'];
  };

  return {
    environment,
    fileChanges,
    isConnected,
    getProjectData,
    recordFileChange
  };
}
