# Script de navegação rápida para MCP_ECOSYSTEM
param(
    [Parameter()]
    [string]$Component
)

$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = "MCP Navigator"

# Definir cores
$colors = @{
    Title = 'Cyan'
    Error = 'Red'
    Success = 'Green'
    Info = 'Yellow'
    Prompt = 'Magenta'
}

# Diretório base do MCP_ECOSYSTEM
$MCP_ROOT = $PSScriptRoot

function Show-MCPMenu {
    Clear-Host
    Write-Host "`n=== MCP Ecosystem Navigator ===" -ForegroundColor $colors.Title
    Write-Host "1. Servidor Principal (ecosystem-mcp)"
    Write-Host "2. AIDEN MCP"
    Write-Host "3. Core (Python/Rust)"
    Write-Host "4. Configurações"
    Write-Host "5. Documentação"
    Write-Host "6. Testes"
    Write-Host "7. Ferramentas"
    Write-Host "8. Status do Servidor"
    Write-Host "9. Verificar Configuração Warp"
    Write-Host "0. Sair"
    Write-Host "`nAtualmente em: $PWD" -ForegroundColor $colors.Info
}

function Navigate-To {
    param([string]$Path)
    
    $fullPath = Join-Path $MCP_ROOT $Path
    if (Test-Path $fullPath) {
        Set-Location $fullPath
        Write-Host "`nNavegando para: $fullPath" -ForegroundColor $colors.Success
        return $true
    } else {
        Write-Host "`nDiretório não encontrado: $Path" -ForegroundColor $colors.Error
        return $false
    }
}

function Show-ServerStatus {
    Write-Host "`nVerificando status do servidor MCP..." -ForegroundColor $colors.Info
    $processes = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
    $mcp_server = $processes | Where-Object {$_.CommandLine -like "*ecosystem-mcp*"}
    
    if ($mcp_server) {
        Write-Host "Servidor MCP está RODANDO (PID: $($mcp_server.Id))" -ForegroundColor $colors.Success
    } else {
        Write-Host "Servidor MCP NÃO está rodando" -ForegroundColor $colors.Error
    }
}

function Check-WarpConfig {
    $warpConfigPath = "$env:APPDATA\Warp\mcp_servers.json"
    Write-Host "`nVerificando configuração do Warp..." -ForegroundColor $colors.Info
    
    if (Test-Path $warpConfigPath) {
        $config = Get-Content $warpConfigPath -Raw
        Write-Host "Configuração encontrada:" -ForegroundColor $colors.Success
        Write-Host $config
    } else {
        Write-Host "Arquivo de configuração do Warp não encontrado!" -ForegroundColor $colors.Error
    }
}

function Start-MCPServer {
    $serverPath = Join-Path $MCP_ROOT "servers\ecosystem-mcp"
    if (Navigate-To "servers\ecosystem-mcp") {
        Write-Host "`nIniciando servidor MCP..." -ForegroundColor $colors.Info
        Start-Process npm -ArgumentList "start" -NoNewWindow
    }
}

# Loop principal
while ($true) {
    Show-MCPMenu
    $choice = Read-Host "`nEscolha uma opção"
    
    switch ($choice) {
        "1" {
            if (Navigate-To "servers\ecosystem-mcp") {
                Write-Host "`nComandos disponíveis:" -ForegroundColor $colors.Info
                Write-Host "npm start - Iniciar servidor"
                Write-Host "npm run dev - Modo desenvolvimento"
                Write-Host "npm test - Executar testes"
            }
        }
        "2" { Navigate-To "AIDEN_MCP" }
        "3" { 
            Navigate-To "core"
            Write-Host "`nComponentes disponíveis:" -ForegroundColor $colors.Info
            Write-Host "- Python: Gerenciamento de sessão"
            Write-Host "- Rust: Motor de regras"
        }
        "4" { Navigate-To "config" }
        "5" { Navigate-To "docs" }
        "6" { Navigate-To "tests" }
        "7" { Navigate-To "toolkit" }
        "8" { Show-ServerStatus }
        "9" { Check-WarpConfig }
        "0" { 
            Write-Host "`nSaindo do navegador MCP..." -ForegroundColor $colors.Info
            return 
        }
        default { Write-Host "`nOpção inválida!" -ForegroundColor $colors.Error }
    }
    
    Write-Host "`nPressione qualquer tecla para continuar..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

