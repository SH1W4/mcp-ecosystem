/**
 * MCP Ecosystem - Main Entry Point
 * A comprehensive development ecosystem with modular architecture
 */

// Core exports
export { MCPEcosystem } from './core/ecosystem';
export * from './core/types';

// Module exports
export { 
  ModuleManager, 
  UniversalBackup, 
  UniversalSync,
  registerAllModules 
} from './modules';
export * from './modules/backup/types';
export * from './modules/sync/types';

// Re-export modules namespace for convenience
import * as modules from './modules';
export { modules };

// Version
export const VERSION = '1.0.0';

// Quick start function
export async function createEcosystem(name: string = 'default'): Promise<any> {
  const { MCPEcosystem } = await import('./core/ecosystem');
  const { ModuleManager } = await import('./modules');
  
  const ecosystem = new MCPEcosystem(name);
  const moduleManager = new ModuleManager(ecosystem);
  
  // Initialize modules
  await moduleManager.initializeModules();
  
  return {
    ecosystem,
    moduleManager,
    backup: ecosystem.getModule('backup'),
    sync: ecosystem.getModule('sync')
  };
}
