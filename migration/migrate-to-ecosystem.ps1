# MCP Ecosystem Migration Script
# Migra MCPs ativos para o MCP Ecosystem unificado

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MCP ECOSYSTEM MIGRATION TOOL" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurações
$migrationConfig = Get-Content ".\migration\mcp-migration-config.json" | ConvertFrom-Json
$backupPath = ".\migration\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Função para criar backup
function Backup-MCPData {
    param($mcpInfo)
    
    Write-Host "📦 Fazendo backup de $($mcpInfo.name)..." -ForegroundColor Yellow
    
    $backupDir = Join-Path $backupPath $mcpInfo.name.Replace(" ", "_")
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Salvar informações do processo
    $mcpInfo | ConvertTo-Json | Out-File "$backupDir\process-info.json"
    
    # Copiar configurações se existirem
    if (Test-Path "$($mcpInfo.path)\config") {
        Copy-Item -Path "$($mcpInfo.path)\config" -Destination "$backupDir\config" -Recurse -Force
    }
    
    Write-Host "✅ Backup concluído: $backupDir" -ForegroundColor Green
}

# Função para parar MCP gradualmente
function Stop-MCPGracefully {
    param($processId, $name)
    
    Write-Host "⏹️  Parando $name (PID: $processId)..." -ForegroundColor Yellow
    
    try {
        # Enviar sinal de término gracioso
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            $process.CloseMainWindow() | Out-Null
            Start-Sleep -Seconds 2
            
            # Se ainda estiver rodando, forçar parada
            if (!$process.HasExited) {
                Stop-Process -Id $processId -Force
            }
            Write-Host "✅ $name parado com sucesso" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Processo $name já não está ativo" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erro ao parar $name: $_" -ForegroundColor Red
    }
}

# 1. FASE DE BACKUP
Write-Host "`n📋 FASE 1: BACKUP DOS MCPs ATIVOS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

foreach ($mcp in $migrationConfig.migrationPlan.currentMCPs) {
    Backup-MCPData -mcpInfo $mcp
}

# 2. FASE DE CONFIGURAÇÃO DO ECOSYSTEM
Write-Host "`n⚙️  FASE 2: CONFIGURANDO MCP ECOSYSTEM" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Criar arquivo de configuração unificada
$ecosystemConfig = @{
    name = "MCP Ecosystem Unified"
    version = "2.0.0"
    modules = @{
        # Módulos do VIREON
        consciousness = @{
            enabled = $true
            source = "vireon"
            config = @{
                level = 4
                autoEvolution = $true
                metacognitive = $true
            }
        }
        symbiotic = @{
            enabled = $true
            source = "vireon"
            config = @{
                integrationDepth = "deep"
                bidirectional = $true
                realtime = $true
            }
        }
        validation = @{
            enabled = $true
            source = "vireon"
            config = @{
                continuous = $true
                depth = "quantum"
                autoCorrect = $true
            }
        }
        # Módulos do GUARDRIVE
        monitoring = @{
            enabled = $true
            source = "guardrive"
            config = @{
                metrics = @("cpu", "memory", "disk", "network")
                interval = 5000
                retention = "7d"
            }
        }
        health = @{
            enabled = $true
            source = "guardrive"
            config = @{
                checks = @("system", "services", "dependencies")
                alerting = $true
                autoRemediation = $true
            }
        }
        automation = @{
            enabled = $true
            source = "guardrive"
            config = @{
                ci = @{
                    provider = "github-actions"
                    triggers = @("push", "pull_request", "schedule")
                }
                cd = @{
                    strategy = "blue-green"
                    environments = @("dev", "staging", "production")
                }
            }
        }
    }
    integrations = @{
        ide = @("vscode", "intellij", "pycharm")
        vcs = @("git", "github")
        cloud = @("aws", "azure", "gcp")
    }
}

$ecosystemConfig | ConvertTo-Json -Depth 10 | Out-File ".\config\ecosystem-unified.json"
Write-Host "✅ Configuração do Ecosystem criada" -ForegroundColor Green

# 3. FASE DE MIGRAÇÃO GRADUAL
Write-Host "`n🔄 FASE 3: MIGRAÇÃO GRADUAL" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

$response = Read-Host "Deseja parar os MCPs ativos agora? (S/N)"
if ($response -eq 'S' -or $response -eq 's') {
    foreach ($mcp in $migrationConfig.migrationPlan.currentMCPs) {
        Stop-MCPGracefully -processId $mcp.processId -name $mcp.name
        Start-Sleep -Seconds 1
    }
} else {
    Write-Host "⚠️  MCPs mantidos ativos. Execute este script novamente quando estiver pronto." -ForegroundColor Yellow
}

# 4. FASE DE ATIVAÇÃO DO ECOSYSTEM
Write-Host "`n🚀 FASE 4: ATIVANDO MCP ECOSYSTEM" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Criar script de inicialização
$startupScript = @'
// MCP Ecosystem Unified Startup
import { MCPEcosystem } from './src/core/ecosystem.js';
import { ModuleManager } from './src/modules/index.js';
import ecosystemConfig from './config/ecosystem-unified.json' assert { type: 'json' };

async function startUnifiedEcosystem() {
    console.log('🚀 Iniciando MCP Ecosystem Unificado...\n');
    
    // Inicializar ecosystem
    const ecosystem = new MCPEcosystem(ecosystemConfig.name);
    
    // Inicializar módulos
    const moduleManager = new ModuleManager(ecosystem);
    await moduleManager.initializeModules();
    
    // Carregar configurações dos módulos
    for (const [moduleName, moduleConfig] of Object.entries(ecosystemConfig.modules)) {
        if (moduleConfig.enabled) {
            console.log(`📦 Carregando módulo: ${moduleName} (fonte: ${moduleConfig.source})`);
            const module = ecosystem.getModule(moduleName);
            if (module) {
                await module.configure(moduleConfig.config);
            }
        }
    }
    
    console.log('\n✅ MCP Ecosystem Unificado iniciado com sucesso!');
    console.log('📊 Módulos ativos:', ecosystem.listModules());
    
    // Manter o servidor rodando
    process.on('SIGINT', async () => {
        console.log('\n⏹️  Parando MCP Ecosystem...');
        await ecosystem.shutdown();
        process.exit(0);
    });
}

startUnifiedEcosystem().catch(console.error);
'@

$startupScript | Out-File ".\start-unified-ecosystem.js" -Encoding UTF8

# Criar comando de inicialização
$startCommand = @"
@echo off
echo ======================================
echo MCP ECOSYSTEM UNIFICADO
echo ======================================
echo.
cd /d "$PWD"
node start-unified-ecosystem.js
pause
"@

$startCommand | Out-File ".\start-ecosystem.bat" -Encoding ASCII

Write-Host "✅ Scripts de inicialização criados" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 MIGRAÇÃO PREPARADA!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o MCP Ecosystem unificado, execute:" -ForegroundColor Yellow
Write-Host "  .\start-ecosystem.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou via npm:" -ForegroundColor Yellow
Write-Host "  npm run ecosystem:start" -ForegroundColor Cyan
Write-Host ""

# 5. RELATÓRIO FINAL
Write-Host "📊 RELATÓRIO DE MIGRAÇÃO" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "✅ Backup criado em: $backupPath" -ForegroundColor Green
Write-Host "✅ Configuração unificada: .\config\ecosystem-unified.json" -ForegroundColor Green
Write-Host "✅ Script de inicialização: .\start-ecosystem.bat" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 MCPs migrados:" -ForegroundColor Yellow
foreach ($mcp in $migrationConfig.migrationPlan.currentMCPs) {
    Write-Host "   - $($mcp.name)" -ForegroundColor Blue
}
Write-Host ""
Write-Host "✨ Migração concluída!" -ForegroundColor Magenta
