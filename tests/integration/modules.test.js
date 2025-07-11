"use strict";
/**
 * Integration tests for MCP Ecosystem modules
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ecosystem_1 = require("../../src/core/ecosystem");
const modules_1 = require("../../src/modules");
describe('MCP Ecosystem Module Integration', () => {
    let ecosystem;
    let moduleManager;
    beforeEach(() => {
        ecosystem = new ecosystem_1.MCPEcosystem('test-ecosystem');
        moduleManager = new modules_1.ModuleManager(ecosystem);
    });
    describe('Module Registration', () => {
        it('should register all modules successfully', async () => {
            await moduleManager.initializeModules();
            const modules = ecosystem.listModules();
            expect(modules).toContain('backup');
            expect(modules).toContain('sync');
        });
        it('should retrieve registered modules', async () => {
            await moduleManager.initializeModules();
            const backup = ecosystem.getModule('backup');
            const sync = ecosystem.getModule('sync');
            expect(backup).toBeInstanceOf(modules_1.UniversalBackup);
            expect(sync).toBeInstanceOf(modules_1.UniversalSync);
        });
    });
    describe('Module Status', () => {
        it('should provide module status information', async () => {
            await moduleManager.initializeModules();
            const status = moduleManager.getModuleStatus();
            expect(status.backup).toBeDefined();
            expect(status.backup.loaded).toBe(true);
            expect(status.backup.type).toBe('UniversalBackup');
            expect(status.sync).toBeDefined();
            expect(status.sync.loaded).toBe(true);
            expect(status.sync.type).toBe('UniversalSync');
        });
    });
    describe('Backup Module Integration', () => {
        let backup;
        beforeEach(async () => {
            await moduleManager.initializeModules();
            backup = ecosystem.getModule('backup');
        });
        it('should create and list backups', async () => {
            const backupResult = await backup.createBackup({
                files: ['test.txt'],
                tags: ['test']
            });
            expect(backupResult.id).toBeDefined();
            expect(backupResult.status).toBe('completed');
            const backups = await backup.listBackups({ tags: ['test'] });
            expect(backups.length).toBeGreaterThan(0);
        });
        it('should provide backup metrics', () => {
            const metrics = backup.getMetrics();
            expect(metrics).toHaveProperty('totalBackups');
            expect(metrics).toHaveProperty('totalSize');
            expect(metrics).toHaveProperty('averageBackupTime');
        });
    });
    describe('Sync Module Integration', () => {
        let sync;
        beforeEach(async () => {
            await moduleManager.initializeModules();
            sync = ecosystem.getModule('sync');
        });
        it('should manage sync providers', async () => {
            await sync.addProvider({
                name: 'test-provider',
                type: 'memory',
                config: {}
            });
            const providers = sync.listProviders();
            expect(providers).toContain('test-provider');
        });
        it('should provide sync metrics', () => {
            const metrics = sync.getMetrics();
            expect(metrics).toHaveProperty('totalSyncs');
            expect(metrics).toHaveProperty('conflicts');
            expect(metrics).toHaveProperty('lastSyncTime');
        });
    });
    describe('Module Interaction', () => {
        let backup;
        let sync;
        beforeEach(async () => {
            await moduleManager.initializeModules();
            backup = ecosystem.getModule('backup');
            sync = ecosystem.getModule('sync');
        });
        it('should allow modules to work together', async () => {
            // Create backup before sync
            const backupResult = await backup.createBackup({
                files: ['src/**/*.ts'],
                tags: ['pre-sync']
            });
            // Perform sync
            await sync.addProvider({
                name: 'test-sync',
                type: 'memory',
                config: {}
            });
            await sync.connect('test-sync');
            // Verify both modules are working
            expect(backupResult.status).toBe('completed');
            expect(sync.isConnected()).toBe(true);
        });
        it('should handle events between modules', async () => {
            const backupSpy = jest.fn();
            // Listen for sync events and trigger backup
            sync.on('sync:completed', async (event) => {
                const result = await backup.createBackup({
                    files: ['auto-backup'],
                    tags: ['automated']
                });
                backupSpy(result);
            });
            // Trigger sync
            await sync.sync();
            // Verify backup was triggered
            expect(backupSpy).toHaveBeenCalled();
        });
    });
    describe('Ecosystem Integration', () => {
        it('should emit module events to ecosystem', async () => {
            const eventSpy = jest.fn();
            ecosystem.on('module:registered', eventSpy);
            await moduleManager.initializeModules();
            expect(eventSpy).toHaveBeenCalledWith('backup');
            expect(eventSpy).toHaveBeenCalledWith('sync');
        });
        it('should integrate with ecosystem metrics', async () => {
            await moduleManager.initializeModules();
            const ecosystemMetrics = ecosystem.getMetrics();
            const moduleStatus = moduleManager.getModuleStatus();
            // Both should provide complementary information
            expect(ecosystemMetrics).toBeDefined();
            expect(moduleStatus).toBeDefined();
        });
    });
});
//# sourceMappingURL=modules.test.js.map