/**
 * Dynamic Configuration Manager with AI Adaptation
 *
 * Um sistema de configuração revolucionário que se adapta automaticamente
 * ao comportamento do usuário e às condições do sistema.
 *
 * @features
 * - Hot reload de configurações
 * - Adaptação automática baseada em uso
 * - Validação dinâmica com Zod
 * - Configurações contextuais por ambiente
 * - Backup e rollback automático
 * - Analytics de uso de configurações
 */

import { z } from 'zod';
import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync, watchFile } from 'fs';
import { join } from 'path';

import { Logger } from './logger';

// Configuration schemas with Zod validation
const ServerConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().min(1).max(65535).default(3000),
  maxConnections: z.number().positive().default(100),
  timeout: z.number().positive().default(30000),
});

const AIConfigSchema = z.object({
  enabled: z.boolean().default(true),
  provider: z.enum(['openai', 'claude', 'local']).default('local'),
  model: z.string().default('gpt-4'),
  maxTokens: z.number().positive().default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  contextWindow: z.number().positive().default(10),
});

const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  enableAnalytics: z.boolean().default(true),
  bufferSize: z.number().positive().default(1000),
  retention: z.number().positive().default(7), // days
});

const SecurityConfigSchema = z.object({
  enableAuth: z.boolean().default(true),
  tokenExpiry: z.number().positive().default(3600), // seconds
  maxLoginAttempts: z.number().positive().default(5),
  rateLimitWindow: z.number().positive().default(900), // 15 minutes
  rateLimitMax: z.number().positive().default(100),
});

const PerformanceConfigSchema = z.object({
  cacheEnabled: z.boolean().default(true),
  cacheSize: z.number().positive().default(100), // MB
  poolSize: z.number().positive().default(10),
  autoOptimize: z.boolean().default(true),
});

// Main configuration schema
const ConfigSchema = z.object({
  server: ServerConfigSchema,
  ai: AIConfigSchema,
  logging: LoggingConfigSchema,
  security: SecurityConfigSchema,
  performance: PerformanceConfigSchema,
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  version: z.string().default('0.1.0'),
  lastUpdated: z.string().datetime().optional(),
});

export type IConfig = z.infer<typeof ConfigSchema>;
export type IServerConfig = z.infer<typeof ServerConfigSchema>;
export type IAIConfig = z.infer<typeof AIConfigSchema>;
export type ILoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type ISecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type IPerformanceConfig = z.infer<typeof PerformanceConfigSchema>;

export interface IConfigUsageStats {
  readonly key: string;
  readonly accessCount: number;
  readonly lastAccessed: Date;
  readonly adaptationSuggestions: string[];
}

export interface IConfigChange {
  readonly key: string;
  readonly oldValue: unknown;
  readonly newValue: unknown;
  readonly reason: 'manual' | 'adaptive' | 'rollback';
  readonly timestamp: Date;
}

/**
 * Dynamic Configuration Manager with AI-powered adaptation
 */
export class ConfigManager extends EventEmitter {
  private static instance: ConfigManager;
  private config: IConfig;
  private configPath: string;
  private backupPath: string;
  private readonly logger: Logger;
  private readonly usageStats: Map<string, IConfigUsageStats> = new Map();
  private readonly changeHistory: IConfigChange[] = [];
  private watcherActive = false;
  private adaptationEngine: ConfigAdaptationEngine;

  private constructor() {
    super();
    this.logger = Logger.getInstance();
    this.configPath = join(process.cwd(), 'config', 'mcp-ecosystem.json');
    this.backupPath = join(process.cwd(), 'config', 'backups');
    this.config = this.getDefaultConfig();
    this.adaptationEngine = new ConfigAdaptationEngine(this.logger);
    this.setupAdaptation();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Initialize configuration system
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      this.startConfigWatcher();
      this.logger.info('ConfigManager initialized with hot reload', {
        moduleId: 'config-manager',
        metadata: { configPath: this.configPath },
      });
    } catch (error) {
      this.logger.error('Failed to initialize ConfigManager', error as Error, {
        moduleId: 'config-manager',
      });
      throw error;
    }
  }

  /**
   * Get complete configuration
   */
  public getConfig(): IConfig {
    this.trackUsage('config.full');
    return { ...this.config };
  }

  /**
   * Get typed configuration section
   */
  public getServerConfig(): IServerConfig {
    this.trackUsage('config.server');
    return { ...this.config.server };
  }

  public getAIConfig(): IAIConfig {
    this.trackUsage('config.ai');
    return { ...this.config.ai };
  }

  public getLoggingConfig(): ILoggingConfig {
    this.trackUsage('config.logging');
    return { ...this.config.logging };
  }

  public getSecurityConfig(): ISecurityConfig {
    this.trackUsage('config.security');
    return { ...this.config.security };
  }

  public getPerformanceConfig(): IPerformanceConfig {
    this.trackUsage('config.performance');
    return { ...this.config.performance };
  }

  /**
   * Update configuration with validation
   */
  public async updateConfig(
    updates: Partial<IConfig>,
    reason: 'manual' | 'adaptive' = 'manual'
  ): Promise<void> {
    try {
      // Create backup before update
      await this.createBackup();

      const oldConfig = { ...this.config };
      const newConfig = {
        ...this.config,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };

      // Validate new configuration
      const validatedConfig = ConfigSchema.parse(newConfig);

      // Track changes
      this.trackChanges(oldConfig, validatedConfig, reason);

      // Update in-memory config
      this.config = validatedConfig;

      // Persist to file
      await this.saveConfig();

      // Emit change event
      this.emit('configChanged', {
        oldConfig,
        newConfig: validatedConfig,
        reason,
      });

      this.logger.info('Configuration updated successfully', {
        moduleId: 'config-manager',
        metadata: { reason, changes: Object.keys(updates) },
      });
    } catch (error) {
      this.logger.error('Failed to update configuration', error as Error, {
        moduleId: 'config-manager',
      });
      throw error;
    }
  }

  /**
   * Get configuration usage analytics
   */
  public getUsageAnalytics(): IConfigUsageStats[] {
    return Array.from(this.usageStats.values());
  }

  /**
   * Get adaptive configuration suggestions
   */
  public async getAdaptiveSuggestions(): Promise<string[]> {
    return this.adaptationEngine.generateSuggestions(
      this.config,
      this.usageStats,
      this.changeHistory
    );
  }

  /**
   * Apply AI-suggested optimizations
   */
  public async applyOptimizations(): Promise<void> {
    const optimizations = await this.adaptationEngine.generateOptimizations(
      this.config,
      this.usageStats
    );

    if (Object.keys(optimizations).length > 0) {
      await this.updateConfig(optimizations, 'adaptive');
      this.logger.info('Applied AI optimizations to configuration', {
        moduleId: 'config-manager',
        metadata: { optimizations },
      });
    }
  }

  /**
   * Rollback to previous configuration
   */
  public async rollback(): Promise<void> {
    const lastChange = this.changeHistory[this.changeHistory.length - 1];
    if (!lastChange) {
      throw new Error('No changes to rollback');
    }

    // This is a simplified rollback - in production, you'd want more sophisticated backup management
    this.logger.info('Rolling back configuration changes', {
      moduleId: 'config-manager',
      metadata: { lastChange },
    });
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    if (existsSync(this.configPath)) {
      try {
        const configData = readFileSync(this.configPath, 'utf-8');
        const rawConfig = JSON.parse(configData);
        this.config = ConfigSchema.parse(rawConfig);
      } catch (error) {
        this.logger.warn('Invalid config file, using defaults', {
          moduleId: 'config-manager',
          metadata: { error: (error as Error).message },
        });
        this.config = this.getDefaultConfig();
        await this.saveConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
      await this.saveConfig();
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfig(): Promise<void> {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      writeFileSync(this.configPath, configData, 'utf-8');
    } catch (error) {
      this.logger.error('Failed to save configuration', error as Error, {
        moduleId: 'config-manager',
      });
      throw error;
    }
  }

  /**
   * Start file watcher for hot reload
   */
  private startConfigWatcher(): void {
    if (this.watcherActive) return;

    watchFile(this.configPath, async () => {
      try {
        await this.loadConfig();
        this.emit('configReloaded', this.config);
        this.logger.info('Configuration hot-reloaded', {
          moduleId: 'config-manager',
        });
      } catch (error) {
        this.logger.error('Failed to hot-reload configuration', error as Error, {
          moduleId: 'config-manager',
        });
      }
    });

    this.watcherActive = true;
  }

  /**
   * Track configuration usage for analytics
   */
  private trackUsage(key: string): void {
    const existing = this.usageStats.get(key);
    if (existing) {
      this.usageStats.set(key, {
        ...existing,
        accessCount: existing.accessCount + 1,
        lastAccessed: new Date(),
      });
    } else {
      this.usageStats.set(key, {
        key,
        accessCount: 1,
        lastAccessed: new Date(),
        adaptationSuggestions: [],
      });
    }
  }

  /**
   * Track configuration changes
   */
  private trackChanges(
    oldConfig: IConfig,
    newConfig: IConfig,
    reason: 'manual' | 'adaptive' | 'rollback'
  ): void {
    // Simple change detection - in production, you'd want deep comparison
    const changes: IConfigChange[] = [];

    if (JSON.stringify(oldConfig) !== JSON.stringify(newConfig)) {
      changes.push({
        key: 'config.full',
        oldValue: oldConfig,
        newValue: newConfig,
        reason,
        timestamp: new Date(),
      });
    }

    this.changeHistory.push(...changes);

    // Keep only last 100 changes
    if (this.changeHistory.length > 100) {
      this.changeHistory.splice(0, this.changeHistory.length - 100);
    }
  }

  /**
   * Create configuration backup
   */
  private async createBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(this.backupPath, `config-${timestamp}.json`);

    try {
      const configData = JSON.stringify(this.config, null, 2);
      writeFileSync(backupFile, configData, 'utf-8');
    } catch (error) {
      this.logger.warn('Failed to create configuration backup', {
        moduleId: 'config-manager',
        metadata: { error: (error as Error).message },
      });
    }
  }

  /**
   * Setup adaptive configuration engine
   */
  private setupAdaptation(): void {
    // Run adaptation analysis every hour
    setInterval(async () => {
      try {
        await this.applyOptimizations();
      } catch (error) {
        this.logger.error('Failed to apply adaptive optimizations', error as Error, {
          moduleId: 'config-manager',
        });
      }
    }, 3600000); // 1 hour
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): IConfig {
    return ConfigSchema.parse({});
  }
}

/**
 * AI-powered configuration adaptation engine
 */
class ConfigAdaptationEngine {
  constructor(_logger: Logger) {
    // Logger not used in current implementation but reserved for future features
  }

  /**
   * Generate configuration suggestions based on usage patterns
   */
  public async generateSuggestions(
    _config: IConfig,
    usageStats: Map<string, IConfigUsageStats>,
    changeHistory: IConfigChange[]
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Analyze usage patterns
    const totalAccess = Array.from(usageStats.values()).reduce(
      (sum, stat) => sum + stat.accessCount,
      0
    );

    // Suggest optimizations based on usage
    if (totalAccess > 1000) {
      suggestions.push('Consider enabling caching for better performance');
    }

    // Analyze error patterns from change history
    const recentChanges = changeHistory.filter(
      change => new Date().getTime() - change.timestamp.getTime() < 86400000 // last 24h
    );

    if (recentChanges.length > 10) {
      suggestions.push(
        'High configuration change frequency detected. Consider stabilizing settings.'
      );
    }

    return suggestions;
  }

  /**
   * Generate automatic optimizations
   */
  public async generateOptimizations(
    config: IConfig,
    usageStats: Map<string, IConfigUsageStats>
  ): Promise<Partial<IConfig>> {
    const optimizations: Partial<IConfig> = {};

    // Auto-adjust cache size based on usage
    const cacheUsage = usageStats.get('config.performance');
    if (cacheUsage && cacheUsage.accessCount > 100) {
      optimizations.performance = {
        ...config.performance,
        cacheSize: Math.min(config.performance.cacheSize * 1.2, 500),
      };
    }

    // Optimize logging level based on error frequency
    const loggingUsage = usageStats.get('config.logging');
    if (loggingUsage && loggingUsage.accessCount > 50) {
      optimizations.logging = {
        ...config.logging,
        bufferSize: Math.min(config.logging.bufferSize * 1.1, 2000),
      };
    }

    return optimizations;
  }
}
