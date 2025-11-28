/**
 * MCP Ecosystem - Main Entry Point
 * A comprehensive development ecosystem with modular architecture
 * Enhanced with Context7 patterns and symbiotic capabilities
 */

// Core exports
export { MCPEcosystem } from './core/ecosystem';
export * from './core/types';

// VIREON ecosystem exports (baseado no Context7)
export { VIREONMCPEcosystem, createVIREONEcosystem, createEnhancedEcosystem } from './integration/enhanced-ecosystem';
export { FlexibleTransportManager, TransportType, TransportConfig } from './transport/flexible-transport';
export { SmartCache, DocumentationCache, SearchCache } from './cache/smart-cache';
export { RobustAuthSystem, AuthConfig, createAuthMiddleware } from './auth/robust-auth';
export { ContextualDocumentationSystem, Context7Provider } from './documentation/contextual-docs';

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

// Symbiotic module exports
// export { SymbioticModule } from './modules/symbiotic';
export * from './modules/symbiotic/types';

// Version
export const VERSION = '1.0.0';

// Quick start function (legacy)
export async function createEcosystem(name: string = 'default'): Promise<any> {
  const { MCPEcosystem } = await import('./core/ecosystem');
  const { ModuleManager } = await import('./modules');
  
  const ecosystem = MCPEcosystem.getInstance();
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

// VIREON quick start function (recomendado)
export async function createVIREONQuick(config?: {
  transport?: 'stdio' | 'http' | 'sse';
  port?: number;
  enableContext7?: boolean;
}): Promise<any> {
  const { createVIREONEcosystem } = await import('./integration/enhanced-ecosystem');
  
  return createVIREONEcosystem({
    transport: {
      type: config?.transport || 'stdio',
      port: config?.port || 3000
    },
    documentation: {
      enableContext7: config?.enableContext7 ?? true,
      enableLocalDocs: true
    }
  });
}

// Alias para compatibilidade
export const createEnhancedEcosystemQuick = createVIREONQuick;
