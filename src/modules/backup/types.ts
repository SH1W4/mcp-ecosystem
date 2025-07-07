/**
 * Backup Module Types
 */

export type BackupStrategy = 'full' | 'incremental' | 'differential';

export interface BackupConfig {
  strategy: BackupStrategy;
  compression: boolean;
  encryption: boolean;
  retention: RetentionPolicy;
  exclude: string[];
  providers: string[];
  autoBackup?: boolean;
  schedule?: string; // cron pattern
}

export interface RetentionPolicy {
  daily: number;   // Number of daily backups to keep
  weekly: number;  // Number of weekly backups to keep
  monthly: number; // Number of monthly backups to keep
  yearly?: number; // Number of yearly backups to keep
}

export interface BackupMetrics {
  totalBackups: number;
  totalSize: number;
  lastBackupTime: Date | null;
  averageBackupTime: number;
  compressionRatio: number;
  successRate: number;
}

export interface BackupProvider {
  name: string;
  type: 'filesystem' | 'cloud' | 'network';
  backup(data: any, options: BackupConfig): Promise<BackupResult>;
  restore(backupId: string, options: RestoreOptions): Promise<RestoreResult>;
  list(projectId?: string): Promise<BackupInfo[]>;
  delete?(backupId: string): Promise<boolean>;
  verify?(backupId: string): Promise<boolean>;
}

export interface BackupResult {
  success: boolean;
  location: string;
  size?: number;
  duration?: number;
  error?: Error;
}

export interface RestoreOptions {
  backupId: string;
  provider?: string;
  validate?: boolean;
  targetPath?: string;
  overwrite?: boolean;
  selective?: string[]; // Selective restore paths
}

export interface RestoreResult {
  success: boolean;
  data: any;
  restoredFiles?: number;
  duration?: number;
  error?: Error;
}

export interface BackupInfo {
  id: string;
  projectId: string;
  timestamp: Date;
  type: BackupStrategy;
  size: number;
  provider: string;
  location: string;
  metadata?: Record<string, any>;
}

export interface BackupSchedule {
  id: string;
  projectId: string;
  pattern: string; // cron pattern
  strategy: BackupStrategy;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

// Cloud provider specific types
export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
}

export interface AzureConfig {
  accountName: string;
  accountKey?: string;
  containerName: string;
  sasToken?: string;
}

export interface GCSConfig {
  bucketName: string;
  projectId: string;
  keyFilename?: string;
  credentials?: any;
}

// Events
export interface BackupEvents {
  'backup:started': (projectId: string) => void;
  'backup:progress': (projectId: string, progress: number) => void;
  'backup:completed': (projectId: string, metrics: any) => void;
  'backup:failed': (projectId: string, error: Error) => void;
  'backup:deleted': (backupId: string) => void;
  'restore:started': (projectId: string) => void;
  'restore:progress': (projectId: string, progress: number) => void;
  'restore:completed': (projectId: string) => void;
  'restore:failed': (projectId: string, error: Error) => void;
  'config:updated': (config: BackupConfig) => void;
  'schedule:created': (schedule: BackupSchedule) => void;
  'schedule:removed': (scheduleId: string) => void;
}
