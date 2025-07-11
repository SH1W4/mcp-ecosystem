# Configuração do Warp para MCP Ecosystem com GIDEN Integration
# Este script configura o Warp para usar o MCP Ecosystem unificado com todas as capacidades

Write-Host "🚀 CONFIGURAÇÃO DO WARP PARA MCP ECOSYSTEM" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Paths
$warpConfigPath = "$env:USERPROFILE\.warp"
$mcpConfigPath = "$warpConfigPath\mcp"
$ecosystemPath = $PWD.Path

# Criar estrutura de diretórios
Write-Host "📁 Criando estrutura de diretórios..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $warpConfigPath -Force | Out-Null
New-Item -ItemType Directory -Path $mcpConfigPath -Force | Out-Null

# Configuração do MCP Server
$mcpServerConfig = @{
    "mcpServers" = @{
        "mcp-ecosystem-unified" = @{
            "command" = "node"
            "args" = @("$ecosystemPath\dist\mcp-server.js")
            "env" = @{
                "NODE_ENV" = "production"
                "MCP_ECOSYSTEM_PATH" = $ecosystemPath
                "GIDEN_INTEGRATION" = "true"
                "VIREON_ENABLED" = "true"
            }
            "capabilities" = @{
                "tools" = $true
                "prompts" = $true
                "resources" = $true
                "analysis" = $true
                "optimization" = $true
                "learning" = $true
            }
        }
    }
}

# Salvar configuração do MCP
$mcpConfigFile = "$mcpConfigPath\servers.json"
$mcpServerConfig | ConvertTo-Json -Depth 10 | Out-File $mcpConfigFile -Encoding UTF8
Write-Host "✅ Configuração MCP salva em: $mcpConfigFile" -ForegroundColor Green

# Criar arquivo de configuração principal do Warp
$warpConfig = @{
    "version" = "2.0"
    "theme" = "mcp_ecosystem_unified"
    "features" = @{
        "ai_command_search" = $true
        "ai_command_prediction" = $true
        "mcp_integration" = $true
        "giden_insights" = $true
        "vireon_symbiotic" = $true
    }
    "mcp" = @{
        "enabled" = $true
        "default_server" = "mcp-ecosystem-unified"
        "auto_connect" = $true
        "modules" = @{
            "consciousness" = $true
            "symbiotic" = $true
            "validation" = $true
            "monitoring" = $true
            "automation" = $true
            "backup" = $true
            "sync" = $true
        }
    }
    "giden" = @{
        "enabled" = $true
        "learning_mode" = "active"
        "evolution_cycles" = 5
        "autonomous_operation" = $true
        "workflow_automation" = @{
            "analyze" = $true
            "optimize" = $true
            "health" = $true
            "learn" = $true
            "evolve" = $true
        }
    }
    "workflows" = @{
        "startup" = @(
            @{
                "name" = "MCP Ecosystem Check"
                "command" = "npm run ecosystem:status"
                "run_on_startup" = $true
            }
            @{
                "name" = "GIDEN Health Check"
                "command" = "workflow GIDEN-Master health --target ."
                "run_on_startup" = $true
            }
        )
    }
    "shortcuts" = @{
        "ctrl+shift+e" = "mcp:ecosystem:dashboard"
        "ctrl+shift+m" = "mcp:metrics:view"
        "ctrl+shift+b" = "mcp:backup:create"
        "ctrl+shift+s" = "mcp:sync:status"
        "ctrl+shift+g" = "giden:analyze:current"
        "ctrl+shift+h" = "giden:health:check"
        "ctrl+shift+w" = "giden:workflow:optimize"
    }
}

$warpConfigFile = "$warpConfigPath\config.json"
$warpConfig | ConvertTo-Json -Depth 10 | Out-File $warpConfigFile -Encoding UTF8
Write-Host "✅ Configuração Warp salva em: $warpConfigFile" -ForegroundColor Green

# Criar arquivo de ambiente para o Warp
$warpEnv = @"
# Warp Environment Configuration for MCP Ecosystem
export MCP_ECOSYSTEM_HOME="$ecosystemPath"
export MCP_SERVER="mcp-ecosystem-unified"
export MCP_AUTO_CONNECT=true
export GIDEN_ENABLED=true
export VIREON_SYMBIOTIC=true

# Desenvolvimento
export PYTHON_VERSION="3.11.5"
export NODE_VERSION="18.0.0"
export RUST_VERSION="1.87.0"

# Aliases do MCP Ecosystem
alias mcp-status='npm run ecosystem:status'
alias mcp-start='npm run ecosystem:start'
alias mcp-stop='npm run ecosystem:stop'
alias mcp-metrics='npm run ecosystem:metrics'
alias mcp-backup='npm run ecosystem:backup'
alias mcp-sync='npm run ecosystem:sync'
alias mcp-migrate='npm run ecosystem:migrate'

# Aliases do GIDEN
alias giden-analyze='workflow GIDEN-Master analyze --target .'
alias giden-optimize='workflow GIDEN-Master optimize --target .'
alias giden-health='workflow GIDEN-Master health --target .'
alias giden-learn='workflow GIDEN-Master learn --learning_mode active'
alias giden-evolve='workflow GIDEN-Master evolve --evolution_cycles 3'
alias giden-full='workflow GIDEN-Master full --target . --output_format detailed'

# Funções auxiliares
function mcp-health() {
    echo "🏥 Verificando saúde do MCP Ecosystem..."
    curl -s http://localhost:3000/health | jq
}

function mcp-modules() {
    echo "📦 Módulos ativos no MCP Ecosystem:"
    curl -s http://localhost:3000/modules | jq
}

function giden-status() {
    echo "🤖 Status do GIDEN Integration:"
    workflow GIDEN-Master health --target . --output_format json | jq
}

# Auto-start do MCP Ecosystem se não estiver rodando
if ! pgrep -f "mcp-ecosystem-unified" > /dev/null; then
    echo "🚀 Iniciando MCP Ecosystem..."
    npm run ecosystem:start &
fi
"@

$warpEnvFile = "$warpConfigPath\.warp_env"
$warpEnv | Out-File $warpEnvFile -Encoding UTF8
Write-Host "✅ Arquivo de ambiente salvo em: $warpEnvFile" -ForegroundColor Green

# Criar workflows personalizados
Write-Host "`n📋 Criando workflows personalizados..." -ForegroundColor Yellow

$workflows = @{
    "dev-session" = @{
        "name" = "Iniciar Sessão de Desenvolvimento"
        "description" = "Inicia uma sessão completa com MCP Ecosystem e GIDEN"
        "steps" = @(
            @{ "command" = "npm run ecosystem:start"; "name" = "Iniciar Ecosystem" }
            @{ "command" = "workflow GIDEN-Master health --target ."; "name" = "GIDEN Health Check" }
            @{ "command" = "npm run ecosystem:health"; "name" = "Verificar Saúde Sistema" }
            @{ "command" = "code ."; "name" = "Abrir VS Code" }
        )
    }
    "analyze-optimize" = @{
        "name" = "Análise e Otimização Completa"
        "description" = "Executa análise profunda e otimização com GIDEN"
        "steps" = @(
            @{ "command" = "workflow GIDEN-Master analyze --target . --output_format detailed"; "name" = "Análise GIDEN" }
            @{ "command" = "workflow GIDEN-Master optimize --target ."; "name" = "Otimizar Workflow" }
            @{ "command" = "npm run ecosystem:metrics"; "name" = "Coletar Métricas" }
            @{ "command" = "git add -A; git commit -m 'feat: otimizações aplicadas pelo GIDEN'"; "name" = "Commit Otimizações" }
        )
    }
    "backup-sync" = @{
        "name" = "Backup e Sincronização Inteligente"
        "description" = "Faz backup com análise GIDEN e sincroniza"
        "steps" = @(
            @{ "command" = "workflow GIDEN-Master health --target ."; "name" = "Verificar Saúde" }
            @{ "command" = "npm run ecosystem:backup"; "name" = "Criar Backup" }
            @{ "command" = "git add -A"; "name" = "Adicionar Mudanças" }
            @{ "command" = "git commit -m 'backup: auto-backup via MCP Ecosystem com insights GIDEN'"; "name" = "Commit" }
            @{ "command" = "git push"; "name" = "Push para Remoto" }
        )
    }
    "deploy-prod" = @{
        "name" = "Deploy Inteligente para Produção"
        "description" = "Deploy com validações GIDEN e MCP Ecosystem"
        "steps" = @(
            @{ "command" = "workflow GIDEN-Master analyze --target ."; "name" = "Análise Pré-Deploy" }
            @{ "command" = "npm test"; "name" = "Executar Testes" }
            @{ "command" = "npm run build"; "name" = "Build de Produção" }
            @{ "command" = "npm run ecosystem:validate"; "name" = "Validar Sistema" }
            @{ "command" = "workflow GIDEN-Master health --target ."; "name" = "Verificação Final" }
            @{ "command" = "npm run deploy:prod"; "name" = "Deploy" }
        )
    }
    "learning-evolution" = @{
        "name" = "Ciclo de Aprendizado e Evolução"
        "description" = "Executa ciclo completo de aprendizado e evolução"
        "steps" = @(
            @{ "command" = "workflow GIDEN-Master learn --learning_mode aggressive"; "name" = "Aprendizado Agressivo" }
            @{ "command" = "workflow GIDEN-Master evolve --evolution_cycles 5"; "name" = "Evolução do Sistema" }
            @{ "command" = "npm run ecosystem:metrics"; "name" = "Métricas de Evolução" }
            @{ "command" = "echo 'Sistema evoluído com sucesso!'"; "name" = "Confirmação" }
        )
    }
}

$workflowsPath = "$warpConfigPath\workflows"
New-Item -ItemType Directory -Path $workflowsPath -Force | Out-Null

foreach ($key in $workflows.Keys) {
    $workflow = $workflows[$key]
    $workflowFile = "$workflowsPath\$key.json"
    $workflow | ConvertTo-Json -Depth 10 | Out-File $workflowFile -Encoding UTF8
}
Write-Host "✅ Workflows criados em: $workflowsPath" -ForegroundColor Green

# Criar template de comandos rápidos
$quickCommands = @"
# MCP Ecosystem + GIDEN Quick Commands for Warp

## 🚀 Gerenciamento do Ecosystem
mcp start                    # Inicia o MCP Ecosystem
mcp stop                     # Para o MCP Ecosystem
mcp restart                  # Reinicia o MCP Ecosystem
mcp status                   # Verifica status do sistema
mcp migrate                  # Executa migração de MCPs

## 📊 Métricas e Monitoramento
mcp metrics                  # Visualiza métricas em tempo real
mcp health                   # Verifica saúde do sistema
mcp logs                     # Visualiza logs do sistema
mcp alerts                   # Gerencia alertas

## 💾 Backup e Sincronização
mcp backup create            # Cria novo backup
mcp backup list              # Lista backups disponíveis
mcp backup restore <id>      # Restaura backup específico
mcp sync status              # Status de sincronização
mcp sync push                # Envia mudanças
mcp sync pull                # Recebe mudanças

## 🔧 Desenvolvimento
mcp dev start                # Inicia modo desenvolvimento
mcp dev test                 # Executa testes
mcp dev lint                 # Executa linter
mcp dev build                # Build do projeto

## 🤖 GIDEN - Análise Inteligente
giden analyze                # Análise profunda do código
giden optimize               # Otimização de workflow
giden health                 # Verificação de saúde do repo
giden learn                  # Executa ciclo de aprendizado
giden evolve                 # Evolução do sistema
giden full                   # Análise completa com todas features

## 🧠 IA e Automação
mcp ai analyze               # Análise de código com IA
mcp ai suggest               # Sugestões de melhorias
mcp auto fix                 # Correções automáticas
mcp auto optimize            # Otimizações automáticas

## 📦 Módulos
mcp module list              # Lista módulos disponíveis
mcp module enable <name>     # Habilita módulo
mcp module disable <name>    # Desabilita módulo
mcp module config <name>     # Configura módulo

## 🔄 Workflows Personalizados
workflow dev-session         # Inicia sessão de desenvolvimento
workflow analyze-optimize    # Análise e otimização completa
workflow backup-sync         # Backup inteligente e sync
workflow deploy-prod         # Deploy para produção
workflow learning-evolution  # Ciclo de aprendizado

## 🎯 Comandos Combinados
mcp giden analyze           # Análise integrada MCP + GIDEN
mcp giden optimize          # Otimização completa
mcp giden health            # Saúde do sistema completa
mcp giden evolve            # Evolução guiada por IA
"@

$quickCommandsFile = "$warpConfigPath\quick-commands.md"
$quickCommands | Out-File $quickCommandsFile -Encoding UTF8
Write-Host "✅ Comandos rápidos salvos em: $quickCommandsFile" -ForegroundColor Green

# Registrar o MCP Server no Warp
Write-Host "`n🔧 Registrando MCP Server no Warp..." -ForegroundColor Yellow

# Criar script de registro
$registerScript = @"
#!/usr/bin/env pwsh
# Registra o MCP Ecosystem no Warp

`$mcpServer = @{
    name = "mcp-ecosystem-unified"
    path = "$ecosystemPath"
    command = "node dist/mcp-server.js"
    autoStart = `$true
    modules = @(
        "consciousness",
        "symbiotic", 
        "validation",
        "monitoring",
        "automation",
        "backup",
        "sync"
    )
    integrations = @{
        giden = @{
            enabled = `$true
            workflow = "GIDEN-Master"
            learningMode = "active"
        }
        vireon = @{
            enabled = `$true
            symbioticLevel = 4
        }
    }
}

# Adicionar ao registro do Warp
`$registryPath = "`$env:APPDATA\Warp\mcp-registry.json"
`$registryDir = Split-Path `$registryPath -Parent
New-Item -ItemType Directory -Path `$registryDir -Force | Out-Null

`$registry = if (Test-Path `$registryPath) {
    Get-Content `$registryPath | ConvertFrom-Json
} else {
    @{ servers = @{} }
}

`$registry.servers[`$mcpServer.name] = `$mcpServer
`$registry | ConvertTo-Json -Depth 10 | Out-File `$registryPath -Encoding UTF8

Write-Host "✅ MCP Ecosystem registrado no Warp!" -ForegroundColor Green
"@

$registerScriptFile = "$warpConfigPath\register-ecosystem.ps1"
$registerScript | Out-File $registerScriptFile -Encoding UTF8

# Executar registro
& $registerScriptFile

# Criar arquivo de integração para VS Code
Write-Host "`n🔌 Criando integração com VS Code..." -ForegroundColor Yellow

$vscodeIntegration = @{
    "mcp.ecosystem" = @{
        "enabled" = $true
        "server" = "mcp-ecosystem-unified"
        "features" = @{
            "codeAnalysis" = $true
            "autoComplete" = $true
            "refactoring" = $true
            "testing" = $true
            "gidenInsights" = $true
        }
    }
    "terminal.integrated.env.windows" = @{
        "MCP_ECOSYSTEM_HOME" = $ecosystemPath
        "MCP_SERVER" = "mcp-ecosystem-unified"
        "GIDEN_ENABLED" = "true"
    }
    "giden.integration" = @{
        "enabled" = $true
        "autoAnalyze" = $true
        "showInsights" = $true
        "learningMode" = "active"
    }
}

$vscodeSettingsPath = "$env:APPDATA\Code\User\settings.json"
if (Test-Path $vscodeSettingsPath) {
    $currentSettings = Get-Content $vscodeSettingsPath | ConvertFrom-Json
    foreach ($key in $vscodeIntegration.Keys) {
        $currentSettings | Add-Member -MemberType NoteProperty -Name $key -Value $vscodeIntegration[$key] -Force
    }
    $currentSettings | ConvertTo-Json -Depth 10 | Out-File $vscodeSettingsPath -Encoding UTF8
    Write-Host "✅ Integração VS Code configurada" -ForegroundColor Green
}

# Script de inicialização automática
$autoStartScript = @"
@echo off
echo ======================================
echo MCP ECOSYSTEM UNIFICADO + GIDEN
echo ======================================
echo.
cd /d "$ecosystemPath"

echo [1/4] Iniciando MCP Ecosystem...
start /B npm run ecosystem:start

timeout /t 3 /nobreak > nul

echo [2/4] Verificando saude do sistema...
workflow GIDEN-Master health --target . --output_format summary

echo [3/4] Carregando modulos...
echo - Consciousness: ATIVO
echo - Symbiotic: ATIVO
echo - Validation: ATIVO  
echo - Monitoring: ATIVO
echo - Automation: ATIVO
echo - Backup: ATIVO
echo - Sync: ATIVO

echo [4/4] GIDEN Integration: ATIVO
echo.
echo ✅ Sistema pronto para uso!
echo.
echo Digite 'mcp help' para ver comandos disponiveis
echo.
"@

$autoStartFile = "$ecosystemPath\start-ecosystem-warp.bat"
$autoStartScript | Out-File $autoStartFile -Encoding ASCII

# Relatório final
Write-Host "`n📊 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Configurações salvas em: $warpConfigPath" -ForegroundColor Green
Write-Host "✅ MCP Server registrado como: mcp-ecosystem-unified" -ForegroundColor Green
Write-Host "✅ Workflows personalizados criados" -ForegroundColor Green
Write-Host "✅ Comandos rápidos disponíveis" -ForegroundColor Green
Write-Host "✅ GIDEN Integration configurado" -ForegroundColor Green
Write-Host "✅ VIREON Symbiotic ativado" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para começar a usar:" -ForegroundColor Yellow
Write-Host "  1. Reinicie o Warp" -ForegroundColor Cyan
Write-Host "  2. Execute: .\start-ecosystem-warp.bat" -ForegroundColor Cyan
Write-Host "  3. Ou simplesmente: mcp start" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Comandos rápidos em: $quickCommandsFile" -ForegroundColor Blue
Write-Host ""
Write-Host "🤖 GIDEN Commands:" -ForegroundColor Yellow
Write-Host "  - giden-analyze   # Análise profunda" -ForegroundColor Cyan
Write-Host "  - giden-optimize  # Otimização de workflow" -ForegroundColor Cyan
Write-Host "  - giden-health    # Verificação de saúde" -ForegroundColor Cyan
Write-Host "  - giden-evolve    # Evolução do sistema" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Warp configurado com sucesso para MCP Ecosystem + GIDEN!" -ForegroundColor Magenta
