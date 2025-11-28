/**
 * Sync Module Types
 */

export type SyncDirection = 'push' | 'pull' | 'bidirectional';
export type ConflictResolution = 'latest-wins' | 'local-wins' | 'remote-wins' | 'manual' | 'merge';

export interface SyncConfig {
  direction: SyncDirection;
  autoSync: boolean;
  conflictResolution: ConflictResolution;
  syncInterval: number; // milliseconds
  providers: string[];
  selective?: {
    include: string[];
    exclude: string[];
  };
  bandwidth?: {
    maxUpload?: number;   // bytes per second
    maxDownload?: number; // bytes per second
  };
}

export interface SyncProvider {
  name: string;
  type: 'network' | 'cloud' | 'p2p' | 'git';
  connect(): Promise<ConnectionResult>;
  disconnect(): Promise<boolean>;
  push(data: any): Promise<PushResult>;
  pull(): Promise<PullResult>;
  sync(data: any, direction: SyncDirection): Promise<SyncResult>;
  getStatus?(): Promise<ProviderStatus>;
}

export interface ConnectionResult {
  connected: boolean;
  endpoint: string;
  latency?: number;
  error?: Error;
}

export interface PushResult {
  success: boolean;
  transferred: number; // bytes
  duration?: number;   // milliseconds
  error?: Error;
}

export interface PullResult {
  success: boolean;
  data: any;
  transferred?: number;
  duration?: number;
  error?: Error;
}

export interface SyncResult {
  success: boolean;
  conflicts: SyncConflict[];
  transferred?: {
    upload: number;
    download: number;
  };
  duration?: number;
  error?: Error;
}

export interface SyncConflict {
  id: string;
  path: string;
  type: 'file' | 'directory' | 'setting';
  local: {
    data: any;
    timestamp: Date;
    size: number;
    hash: string;
  };
  remote: {
    data: any;
    timestamp: Date;
    size: number;
    hash: string;
  };
}

export interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsResolved: number;
  dataTransferred: number; // total bytes
  lastSyncTime: Date | null;
  averageSyncDuration: number; // milliseconds
  duration?: number; // current sync duration
  success?: boolean; // current sync success status
}

export interface ProviderStatus {
  connected: boolean;
  lastSync?: Date;
  queuedItems?: number;
  health: 'healthy' | 'degraded' | 'offline';
}

// Real-time collaboration types
export interface CollaborationSession {
  id: string;
  projectId: string;
  participants: Participant[];
  startedAt: Date;
  type: 'live' | 'async';
}

export interface Participant {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'offline';
  cursor?: CursorPosition;
  selection?: SelectionRange;
}

export interface CursorPosition {
  file: string;
  line: number;
  column: number;
}

export interface SelectionRange {
  file: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
}

// Events
export interface SyncEvents {
  'sync:started': (projectId: string) => void;
  'sync:progress': (projectId: string, progress: number) => void;
  'sync:completed': (projectId: string, result: any) => void;
  'sync:failed': (projectId: string, error: Error) => void;
  'sync:needed': (projectId: string) => void;
  'conflicts:detected': (projectId: string, conflicts: SyncConflict[]) => void;
  'conflicts:resolved': (projectId: string, count: number) => void;
  'conflict:resolution-needed': (conflict: SyncConflict) => void;
  'conflict:resolved': (projectId: string, conflict: SyncConflict, resolution: any) => void;
  'provider:added': (providerName: string) => void;
  'provider:removed': (providerName: string) => void;
  'config:updated': (config: SyncConfig) => void;
  'collaboration:started': (session: CollaborationSession) => void;
  'collaboration:ended': (sessionId: string) => void;
  'participant:joined': (sessionId: string, participant: Participant) => void;
  'participant:left': (sessionId: string, participantId: string) => void;
}
