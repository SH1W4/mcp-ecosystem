"use strict";
/**
 * Example: Module Integration in MCP Ecosystem
 * Demonstrates how to use backup and sync modules together
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ecosystem_1 = require("../src/core/ecosystem");
const modules_1 = require("../src/modules");
async function main() {
    console.log('🚀 MCP Ecosystem - Module Integration Example\n');
    // Initialize ecosystem
    const ecosystem = new ecosystem_1.MCPEcosystem('module-integration-demo');
    // Create module manager
    const moduleManager = new modules_1.ModuleManager(ecosystem);
    // Initialize all modules
    await moduleManager.initializeModules();
    console.log('\n📦 Loaded Modules:', ecosystem.listModules());
    // Get backup and sync modules
    const backup = ecosystem.getModule('backup');
    const sync = ecosystem.getModule('sync');
    // Example 1: Backup project before sync
    console.log('\n📥 Example 1: Backup Before Sync');
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
    const backupResult = await backup.createBackup({
        files: ['src/**/*.ts', 'package.json', 'tsconfig.json'],
        tags: ['pre-sync', 'module-integration']
    });
    console.log('✅ Backup created:', backupResult.id);
    // Example 2: Sync with conflict detection
    console.log('\n🔄 Example 2: Smart Sync with Conflict Resolution');
    // Configure sync provider
    await sync.addProvider({
        name: 'git-sync',
        type: 'git',
        config: {
            remote: 'origin',
            branch: 'main',
            autoCommit: true
        }
    });
    // Connect and sync
    await sync.connect('git-sync');
    // Simulate file changes
    const syncResult = await sync.push({
        files: [
            {
                path: 'src/modules/example.ts',
                content: '// Example module',
                hash: 'abc123'
            }
        ]
    });
    console.log('✅ Sync completed:', syncResult);
    // Example 3: Real-time collaboration
    console.log('\n👥 Example 3: Real-time Collaboration');
    // Enable real-time sync
    const session = await sync.startCollaboration('module-dev-session');
    console.log('✅ Collaboration session started:', session.id);
    // Simulate participant joining
    await sync.joinCollaboration(session.id, {
        id: 'dev-1',
        name: 'Developer 1',
        role: 'editor'
    });
    // Example 4: Module metrics and status
    console.log('\n📊 Example 4: Module Status and Metrics');
    const moduleStatus = moduleManager.getModuleStatus();
    console.log('Module Status:', JSON.stringify(moduleStatus, null, 2));
    // Get individual metrics
    console.log('\nBackup Metrics:', backup.getMetrics());
    console.log('Sync Metrics:', sync.getMetrics());
    // Example 5: Automated backup on sync
    console.log('\n🤖 Example 5: Automated Backup on Sync');
    // Set up event listener for automated backup
    sync.on('sync:completed', async (event) => {
        console.log('Sync completed, creating automatic backup...');
        const autoBackup = await backup.createBackup({
            files: event.files.map(f => f.path),
            tags: ['auto', 'post-sync', `sync-${event.timestamp}`]
        });
        console.log('✅ Automatic backup created:', autoBackup.id);
    });
    // Trigger sync to demonstrate
    await sync.sync();
    // Example 6: Restore from backup
    console.log('\n♻️ Example 6: Restore from Backup');
    // List available backups
    const backups = await backup.listBackups({
        tags: ['module-integration']
    });
    console.log(`Found ${backups.length} backups`);
    if (backups.length > 0) {
        // Restore latest backup
        const latestBackup = backups[0];
        const restoreResult = await backup.restoreBackup(latestBackup.id, {
            targetPath: './restored',
            overwrite: false
        });
        console.log('✅ Backup restored:', restoreResult);
    }
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await sync.disconnect();
    console.log('\n✨ Module integration example completed!');
}
// Run example
main().catch(console.error);
//# sourceMappingURL=module-integration.js.map