/**
 * Module Registry for MCP Ecosystem
 * Central export point for all ecosystem modules
 */

// Import modules
import { UniversalBackup } from './backup';
import { UniversalSync } from './sync';

// Export modules
export { UniversalBackup } from './backup';
export { UniversalSync } from './sync';

// Export types
export * from './backup/types';
export * from './sync/types';

// Module registry function
export function registerAllModules(ecosystem: any): void {
  // Register backup module
  const backup = new UniversalBackup({
    defaultProvider: 'fs',
    autoBackup: {
      enabled: true,
      interval: 3600000, // 1 hour
      retention: {
        maxBackups: 10,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    }
  });
  ecosystem.registerModule('backup', backup);

  // Register sync module
  const sync = new UniversalSync({
    defaultProvider: 'git',
    autoSync: true,
    conflictResolution: 'manual',
    realtime: {
      enabled: true,
      reconnectAttempts: 5,
      reconnectDelay: 1000
    }
  });
  ecosystem.registerModule('sync', sync);

  console.log('✅ All modules registered successfully');
}

// Create module manager class
export class ModuleManager {
  private ecosystem: any;

  constructor(ecosystem: any) {
    this.ecosystem = ecosystem;
  }

  /**
   * Initialize all modules
   */
  async initializeModules(): Promise<void> {
    registerAllModules(this.ecosystem);
    
    // Initialize each module
    const modules = this.ecosystem.listModules();
    for (const moduleName of modules) {
      const module = this.ecosystem.getModule(moduleName);
      if (module && typeof module.initialize === 'function') {
        await module.initialize();
        console.log(`✅ Module '${moduleName}' initialized`);
      }
    }
  }

  /**
   * Get module status
   */
  getModuleStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    const modules = this.ecosystem.listModules();
    
    for (const moduleName of modules) {
      const module = this.ecosystem.getModule(moduleName);
      status[moduleName] = {
        loaded: !!module,
        type: module?.constructor?.name || 'unknown'
      };
      
      // Add module-specific status
      if (module && typeof module.getMetrics === 'function') {
        status[moduleName].metrics = module.getMetrics();
      }
    }
    
    return status;
  }
}
