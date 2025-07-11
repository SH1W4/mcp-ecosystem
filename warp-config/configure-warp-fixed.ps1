# Configuração do Warp para MCP Ecosystem com GIDEN Integration
# Script corrigido sem caracteres problemáticos

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
    }
}

$warpConfigFile = "$warpConfigPath\config.json"
$warpConfig | ConvertTo-Json -Depth 10 | Out-File $warpConfigFile -Encoding UTF8
Write-Host "✅ Configuração Warp salva em: $warpConfigFile" -ForegroundColor Green

# Criar arquivo de comandos rápidos
$quickCommandsContent = @'
# MCP Ecosystem + GIDEN Quick Commands

## Gerenciamento
mcp start          # Inicia o MCP Ecosystem
mcp stop           # Para o MCP Ecosystem  
mcp status         # Verifica status
mcp migrate        # Migra MCPs antigos

## GIDEN
giden analyze      # Análise de código
giden optimize     # Otimiza workflow
giden health       # Verifica saúde
giden evolve       # Evolução do sistema

## Desenvolvimento
mcp dev start      # Modo desenvolvimento
mcp dev test       # Executa testes
mcp dev build      # Build do projeto

## Backup e Sync
mcp backup create  # Criar backup
mcp sync status    # Status de sync
'@

$quickCommandsFile = "$warpConfigPath\quick-commands.txt"
$quickCommandsContent | Out-File $quickCommandsFile -Encoding UTF8
Write-Host "✅ Comandos rápidos salvos" -ForegroundColor Green

# Script de inicialização
$startScript = @'
@echo off
echo ======================================
echo MCP ECOSYSTEM UNIFICADO + GIDEN
echo ======================================
echo.
cd /d "C:\Users\João\Desktop\PROJETOS\MCP_ECOSYSTEM"

echo Iniciando MCP Ecosystem...
start /B npm run ecosystem:start

timeout /t 3 /nobreak > nul

echo Sistema pronto para uso!
echo.
pause
'@

$startScriptFile = "$ecosystemPath\start-warp.bat"
$startScript | Out-File $startScriptFile -Encoding ASCII
Write-Host "✅ Script de inicialização criado" -ForegroundColor Green

# Registrar no Warp
$registryPath = "$env:APPDATA\Warp\mcp-registry.json"
$registryDir = Split-Path $registryPath -Parent
New-Item -ItemType Directory -Path $registryDir -Force | Out-Null

$registry = @{
    servers = @{
        "mcp-ecosystem-unified" = @{
            name = "mcp-ecosystem-unified"
            path = $ecosystemPath
            command = "node dist/mcp-server.js"
            autoStart = $true
        }
    }
}

$registry | ConvertTo-Json -Depth 10 | Out-File $registryPath -Encoding UTF8
Write-Host "✅ MCP registrado no Warp" -ForegroundColor Green

# Relatório final
Write-Host ""
Write-Host "📊 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Configurações salvas em: $warpConfigPath" -ForegroundColor Green
Write-Host "✅ MCP Server: mcp-ecosystem-unified" -ForegroundColor Green
Write-Host "✅ Comandos rápidos disponíveis" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para usar:" -ForegroundColor Yellow
Write-Host "  1. Reinicie o Warp" -ForegroundColor Cyan
Write-Host "  2. Execute: .\start-warp.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Configuração completa!" -ForegroundColor Magenta
