import { EventEmitter } from 'events';
import { MCPEcosystem } from '../../core/ecosystem';
import { 
  SyncConfig,
  SyncProvider,
  SyncMetrics,
  SyncDirection,
  ConflictResolution
} from './types';

/**
 * Universal Sync Module for MCP Ecosystem
 * 
 * Provides real-time synchronization capabilities for MCP projects
 * across multiple environments and devices, supporting:
 * - Bidirectional sync
 * - Conflict resolution
 * - Selective sync
 * - Multiple sync providers
 * - Real-time collaboration
 */
export class UniversalSync extends EventEmitter {
  private ecosystem: MCPEcosystem;
  private config!: SyncConfig;
  private providers: Map<string, SyncProvider>;
  private metrics!: SyncMetrics;
  private syncQueue: Map<string, any[]>;
  private activeSyncs: Set<string>;

  constructor(ecosystem: MCPEcosystem) {
    super();
    this.ecosystem = ecosystem;
    this.providers = new Map();
    this.syncQueue = new Map();
    this.activeSyncs = new Set();
    this.initializeModule();
  }

  /**
   * Initialize the sync module
   */
  private async initializeModule() {
    this.config = {
      direction: 'bidirectional',
      autoSync: true,
      conflictResolution: 'latest-wins',
      syncInterval: 30000, // 30 seconds
      providers: ['local'],
      selective: {
        include: ['*'],
        exclude: ['node_modules', '.git', '*.log']
      }
    };

    this.metrics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0,
      dataTransferred: 0,
      lastSyncTime: null,
      averageSyncDuration: 0
    };

    await this.registerProviders();
    this.setupEventHandlers();
    
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  /**
   * Register sync providers
   */
  private async registerProviders() {
    // Local network sync
    this.providers.set('local', {
      name: 'local',
      type: 'network',
      async connect() {
        return { connected: true, endpoint: 'local://sync' };
      },
      async disconnect() {
        return true;
      },
      async push(data) {
        return { success: true, transferred: data.length };
      },
      async pull() {
        return { success: true, data: [] };
      },
      async sync(data, direction) {
        return { success: true, conflicts: [] };
      }
    });

    // Future providers
    // this.providers.set('cloud', new CloudSyncProvider());
    // this.providers.set('p2p', new P2PSyncProvider());
    // this.providers.set('git', new GitSyncProvider());
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers() {
    // React to ecosystem changes
    this.ecosystem.on('project:changed', (project) => {
      if (this.config.autoSync) {
        this.queueSync(project.id, 'push');
      }
    });

    this.ecosystem.on('environment:changed', (changes) => {
      this.emit('sync:needed', changes.projectId);
    });

    // Process sync queue
    setInterval(() => {
      this.processSyncQueue();
    }, 5000);
  }

  /**
   * Start automatic synchronization
   */
  private startAutoSync() {
    setInterval(async () => {
      const projects = await this.ecosystem.listProjects();
      for (const project of projects) {
        if (!this.activeSyncs.has(project.id)) {
          await this.syncProject(project.id);
        }
      }
    }, this.config.syncInterval);
  }

  /**
   * Sync a specific project
   */
  public async syncProject(
    projectId: string, 
    direction: SyncDirection = this.config.direction
  ): Promise<void> {
    if (this.activeSyncs.has(projectId)) {
      throw new Error(`Sync already in progress for project ${projectId}`);
    }

    this.activeSyncs.add(projectId);
    this.emit('sync:started', projectId);
    const startTime = Date.now();

    try {
      const project = await this.ecosystem.getEnvironment(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      const results = await Promise.all(
        this.config.providers.map(async (providerId) => {
          const provider = this.providers.get(providerId);
          if (!provider) {
            throw new Error(`Provider ${providerId} not found`);
          }

          await provider.connect();
          
          let result;
          switch (direction) {
            case 'push':
              result = await provider.push(project);
              break;
            case 'pull':
              result = await provider.pull();
              await this.applyPulledData(projectId, result.data);
              break;
            case 'bidirectional':
              result = await provider.sync(project, direction);
              await this.resolveConflicts(projectId, result.conflicts);
              break;
          }

          await provider.disconnect();
          return result;
        })
      );

      const duration = Date.now() - startTime;
      this.updateMetrics({
        duration: duration as any,
        success: true,
        dataTransferred: this.calculateDataTransferred(results)
      });

      this.emit('sync:completed', projectId, {
        duration,
        providers: results
      });

    } catch (error) {
      this.metrics.failedSyncs++;
      this.emit('sync:failed', projectId, error);
      throw error;
    } finally {
      this.activeSyncs.delete(projectId);
    }
  }

  /**
   * Queue a sync operation
   */
  private queueSync(projectId: string, direction: SyncDirection) {
    if (!this.syncQueue.has(projectId)) {
      this.syncQueue.set(projectId, []);
    }
    
    this.syncQueue.get(projectId)!.push({
      direction,
      timestamp: new Date(),
      data: null
    });
  }

  /**
   * Process queued sync operations
   */
  private async processSyncQueue() {
    for (const [projectId, queue] of this.syncQueue.entries()) {
      if (queue.length > 0 && !this.activeSyncs.has(projectId)) {
        const operation = queue.shift();
        await this.syncProject(projectId, operation.direction);
      }
    }
  }

  /**
   * Resolve sync conflicts
   */
  private async resolveConflicts(projectId: string, conflicts: any[]) {
    if (conflicts.length === 0) return;

    this.emit('conflicts:detected', projectId, conflicts);

    for (const conflict of conflicts) {
      let resolution;
      
      switch (this.config.conflictResolution) {
        case 'latest-wins':
          resolution = conflict.remote.timestamp > conflict.local.timestamp
            ? conflict.remote
            : conflict.local;
          break;
        
        case 'local-wins':
          resolution = conflict.local;
          break;
        
        case 'remote-wins':
          resolution = conflict.remote;
          break;
        
        case 'manual':
          resolution = await this.promptConflictResolution(conflict);
          break;
        
        case 'merge':
          resolution = await this.mergeConflict(conflict);
          break;
      }

      await this.applyResolution(projectId, conflict, resolution);
      this.metrics.conflictsResolved++;
    }

    this.emit('conflicts:resolved', projectId, conflicts.length);
  }

  /**
   * Apply pulled data to project
   */
  private async applyPulledData(projectId: string, data: any) {
    await this.ecosystem.updateEnvironment(projectId, data);
  }

  /**
   * Calculate total data transferred
   */
  private calculateDataTransferred(results: any[]): number {
    return results.reduce((total, result) => 
      total + (result.transferred || 0), 0
    );
  }

  /**
   * Update sync metrics
   */
  private updateMetrics(metrics: Partial<SyncMetrics>) {
    this.metrics.totalSyncs++;
    this.metrics.lastSyncTime = new Date();
    
    if ((metrics as any).success) {
      this.metrics.successfulSyncs++;
    }
    
    if (metrics.dataTransferred) {
      this.metrics.dataTransferred += metrics.dataTransferred;
    }
    
    if ((metrics as any).duration) {
      this.metrics.averageSyncDuration = 
        (this.metrics.averageSyncDuration * (this.metrics.totalSyncs - 1) + 
         (metrics as any).duration) / this.metrics.totalSyncs;
    }
  }

  /**
   * Prompt for manual conflict resolution
   */
  private async promptConflictResolution(conflict: any): Promise<any> {
    this.emit('conflict:resolution-needed', conflict);
    // Implementation would depend on UI integration
    return conflict.local; // Default to local for now
  }

  /**
   * Merge conflicting changes
   */
  private async mergeConflict(conflict: any): Promise<any> {
    // Implement intelligent merge logic
    // For now, simple merge preferring non-destructive changes
    return {
      ...conflict.local,
      ...conflict.remote,
      merged: true,
      mergedAt: new Date()
    };
  }

  /**
   * Apply conflict resolution
   */
  private async applyResolution(
    projectId: string, 
    conflict: any, 
    resolution: any
  ): Promise<void> {
    await this.ecosystem.updateEnvironment(projectId, resolution);
    this.emit('conflict:resolved', projectId, conflict, resolution);
  }

  /**
   * Public API
   */
  public async addProvider(provider: SyncProvider): Promise<void> {
    this.providers.set(provider.name, provider);
    this.emit('provider:added', provider.name);
  }

  public async removeProvider(providerName: string): Promise<void> {
    this.providers.delete(providerName);
    this.emit('provider:removed', providerName);
  }

  public configure(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config:updated', this.config);
    
    if (config.autoSync !== undefined) {
      if (config.autoSync) {
        this.startAutoSync();
      }
    }
  }

  public getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  public async forceSyncAll(): Promise<void> {
    const projects = await this.ecosystem.listProjects();
    await Promise.all(
      projects.map(project => this.syncProject(project.id))
    );
  }

  public getSyncStatus(projectId: string): boolean {
    return this.activeSyncs.has(projectId);
  }

  public getSyncQueue(): Map<string, any[]> {
    return new Map(this.syncQueue);
  }
}

// Export module factory
export function createSyncModule(ecosystem: MCPEcosystem): UniversalSync {
  return new UniversalSync(ecosystem);
}
