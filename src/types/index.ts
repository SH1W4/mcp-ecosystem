export interface BackupOptions {
  files?: string[];
  tags?: string[];
  compress?: boolean;
}

export interface SyncProvider {
  name: string;
  type: 'network' | 'cloud' | 'p2p' | 'git';
  config: Record<string, unknown>;
}

export interface SyncOptions {
  type: SyncProvider['type'];
  config?: Record<string, unknown>;
}

export interface UniversalBackup {
  createBackup(options: BackupOptions): Promise<string>;
  listBackups(filter?: { tags?: string[] }): Promise<string[]>;
  restoreBackup(id: string): Promise<void>;
}

export interface UniversalSync {
  addProvider(provider: SyncProvider): Promise<void>;
  listProviders(): SyncProvider[];
  connect(name: string): Promise<void>;
  sync(): Promise<void>;
  isConnected(): boolean;
}

export interface MCPEcosystem {
  getBackupModule(): UniversalBackup;
  getSyncModule(): UniversalSync;
}
