# Script para ativar o ambiente MCP local
param (
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Verifica se já existe um ambiente MCP ativo
$mcpActive = $env:MCP_ACTIVE -eq "true"
if ($mcpActive -and -not $Force) {
    Write-Host "❌ Já existe um ambiente MCP ativo. Use -Force para sobrescrever." -ForegroundColor Red
    exit 1
}

# Define variáveis de ambiente
$env:MCP_ACTIVE = "true"
$env:MCP_ENV = "local"
$env:MCP_CONFIG = "C:\Users\João\Desktop\PROJETOS\MCP_ECOSYSTEM\config\local-environment.yaml"
$env:MCP_HOME = "C:\Users\João\Desktop\PROJETOS\MCP_ECOSYSTEM"

# Inicia o servidor MCP local
try {
    Write-Host "🔄 Iniciando ambiente MCP local..." -ForegroundColor Yellow
    
    # Carrega a configuração
    $config = Get-Content $env:MCP_CONFIG -Raw | ConvertFrom-Yaml
    
    # Inicia o servidor
    Set-Location $env:MCP_HOME
    npm run start:local

    Write-Host "✅ Ambiente MCP local ativado com sucesso!" -ForegroundColor Green
    Write-Host "📍 Configuração: $($env:MCP_CONFIG)" -ForegroundColor Cyan
    Write-Host "🏠 Home: $($env:MCP_HOME)" -ForegroundColor Cyan
    Write-Host "🔌 Servidor: $($config.server.host):$($config.server.port)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro ao ativar ambiente MCP local: $_" -ForegroundColor Red
    exit 1
}

