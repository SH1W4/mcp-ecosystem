# MCP Ecosystem - Module Integration Guide

## Overview

The MCP Ecosystem now features a powerful modular architecture with integrated backup and synchronization capabilities. This guide explains how to use these modules together for a comprehensive development workflow.

## Architecture

```
MCP Ecosystem
├── Core
│   ├── MCPEcosystem (main orchestrator)
│   ├── ModuleManager (module lifecycle)
│   └── Types (shared interfaces)
└── Modules
    ├── UniversalBackup (backup management)
    └── UniversalSync (synchronization)
```

## Quick Start

```typescript
import { createEcosystem } from 'mcp-ecosystem';

// Create ecosystem with modules pre-initialized
const { ecosystem, backup, sync } = await createEcosystem('my-project');

// Use modules directly
await backup.createBackup({ files: ['src/**/*'] });
await sync.connect('git');
```

## Module Integration

### 1. Backup Module

The Universal Backup module provides:
- Multiple backup providers (filesystem, S3, Git)
- Automatic backup scheduling
- Compression and encryption
- Incremental backups
- Easy restore functionality

```typescript
// Configure backup
await backup.addProvider({
  name: 'project-backup',
  type: 'fs',
  config: {
    basePath: './backups',
    compress: true
  }
});

// Create backup
const result = await backup.createBackup({
  files: ['src/**/*.ts', 'package.json'],
  tags: ['release', 'v1.0.0']
});
```

### 2. Sync Module

The Universal Sync module features:
- Real-time bidirectional sync
- Multiple sync providers (Git, S3, FTP)
- Conflict resolution strategies
- Collaboration support
- Event-driven architecture

```typescript
// Configure sync
await sync.addProvider({
  name: 'git-sync',
  type: 'git',
  config: {
    remote: 'origin',
    branch: 'main',
    autoCommit: true
  }
});

// Start syncing
await sync.connect('git-sync');
await sync.sync();
```

### 3. Combined Workflows

#### Backup Before Deploy

```typescript
// Listen for deployment events
ecosystem.on('deploy:start', async () => {
  // Create pre-deployment backup
  const backup = ecosystem.getModule('backup');
  await backup.createBackup({
    files: ['**/*'],
    tags: ['pre-deploy', new Date().toISOString()]
  });
});
```

#### Auto-backup on Sync

```typescript
// Configure automatic backups on successful sync
sync.on('sync:completed', async (event) => {
  await backup.createBackup({
    files: event.files.map(f => f.path),
    tags: ['auto', 'post-sync']
  });
});
```

#### Collaborative Development

```typescript
// Start collaboration session
const session = await sync.startCollaboration('feature-development');

// Auto-backup on participant changes
sync.on('collaboration:change', async (event) => {
  if (event.type === 'file:modified') {
    await backup.createBackup({
      files: [event.file],
      tags: ['collab', event.participant.name]
    });
  }
});
```

## Advanced Integration

### Module Events

Both modules emit events that can be used for integration:

**Backup Events:**
- `backup:created` - When a backup is created
- `backup:restored` - When a backup is restored
- `backup:deleted` - When a backup is deleted
- `backup:error` - When an error occurs

**Sync Events:**
- `sync:started` - Sync operation started
- `sync:completed` - Sync operation completed
- `sync:conflict` - Conflict detected
- `sync:error` - Sync error occurred

### Cross-Module Communication

```typescript
// Example: Smart conflict resolution with backup
sync.on('sync:conflict', async (conflict) => {
  // Create backup of conflicted files
  const backupId = await backup.createBackup({
    files: conflict.files.map(f => f.path),
    tags: ['conflict', conflict.id]
  });
  
  // Store backup reference for potential rollback
  conflict.metadata.backupId = backupId;
});
```

### Module Metrics

Track module performance and usage:

```typescript
const moduleManager = new ModuleManager(ecosystem);
const status = moduleManager.getModuleStatus();

console.log('Backup Module:', status.backup.metrics);
console.log('Sync Module:', status.sync.metrics);
```

## Best Practices

1. **Always backup before major operations**
   ```typescript
   await backup.createBackup({ tags: ['pre-operation'] });
   await riskyOperation();
   ```

2. **Use tags for organization**
   ```typescript
   await backup.createBackup({
     tags: ['release', 'v2.0.0', 'production']
   });
   ```

3. **Configure automated workflows**
   ```typescript
   // Auto-backup every hour
   setInterval(() => {
     backup.createBackup({ tags: ['scheduled'] });
   }, 3600000);
   ```

4. **Monitor sync conflicts**
   ```typescript
   sync.on('sync:conflict', (conflict) => {
     console.log('Conflict detected:', conflict);
     // Implement resolution strategy
   });
   ```

## Troubleshooting

### Module Not Found
```typescript
// Ensure modules are initialized
await moduleManager.initializeModules();
```

### Sync Conflicts
```typescript
// Use manual conflict resolution
sync.config.conflictResolution = 'manual';
sync.on('sync:conflict', handleConflict);
```

### Backup Storage Issues
```typescript
// Check available space before backup
const stats = await backup.getStorageStats();
if (stats.available < stats.required) {
  await backup.cleanup({ olderThan: '30d' });
}
```

## API Reference

See individual module documentation:
- [Backup Module API](./api/backup.md)
- [Sync Module API](./api/sync.md)
- [Module Manager API](./api/module-manager.md)
