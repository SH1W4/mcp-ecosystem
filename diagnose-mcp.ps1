# Script de diagnóstico do MCP
$ErrorActionPreference = 'Continue'

function Write-StatusLine {
    param(
        [string]$Component,
        [string]$Status,
        [string]$Color = 'White'
    )
    Write-Host ("{0,-30}" -f $Component) -NoNewline
    Write-Host " : " -NoNewline
    Write-Host $Status -ForegroundColor $Color
}

function Test-NodeVersion {
    try {
        $version = node --version
        if ($version -match "v(\d+)") {
            $majorVersion = [int]$Matches[1]
            if ($majorVersion -ge 18) {
                return @{Status = "OK ($version)"; Color = 'Green'}
            }
        }
        return @{Status = "Atualização necessária ($version)"; Color = 'Yellow'}
    } catch {
        return @{Status = "Não instalado"; Color = 'Red'}
    }
}

function Test-NPMDependencies {
    $paths = @(
        ".",
        "servers\ecosystem-mcp"
    )
    
    foreach ($path in $paths) {
        if (Test-Path (Join-Path $path "package.json")) {
            $packageJson = Get-Content (Join-Path $path "package.json") | ConvertFrom-Json
            $nodeModules = Test-Path (Join-Path $path "node_modules")
            
            Write-StatusLine "NPM ($path)" $(
                if ($nodeModules) { 
                    "OK ($(($packageJson.dependencies | Get-Member -MemberType NoteProperty).Count) deps)" 
                } else { 
                    "node_modules não encontrado" 
                }
            ) $(if ($nodeModules) { 'Green' } else { 'Red' })
        }
    }
}

function Test-MCPServer {
    $serverPath = "servers\ecosystem-mcp\src\index.js"
    if (Test-Path $serverPath) {
        try {
            $process = Start-Process node -ArgumentList $serverPath -NoNewWindow -PassThru
            Start-Sleep -Seconds 2
            if (-not $process.HasExited) {
                Stop-Process $process -Force
                return @{Status = "Iniciou com sucesso"; Color = 'Green'}
            }
        } catch {}
        return @{Status = "Falha ao iniciar"; Color = 'Red'}
    }
    return @{Status = "Arquivo não encontrado"; Color = 'Red'}
}

function Test-WarpConfig {
    $configPath = "$env:APPDATA\Warp\mcp_servers.json"
    if (Test-Path $configPath) {
        try {
            $config = Get-Content $configPath | ConvertFrom-Json
            if ($config.mcpServers.'ecosystem-mcp') {
                return @{Status = "Configurado"; Color = 'Green'}
            }
            return @{Status = "Configuração incompleta"; Color = 'Yellow'}
        } catch {
            return @{Status = "Configuração inválida"; Color = 'Red'}
        }
    }
    return @{Status = "Não encontrado"; Color = 'Red'}
}

# Cabeçalho
Write-Host "`n=== Diagnóstico MCP ===" -ForegroundColor Cyan
Write-Host "Executado em: $(Get-Date)`n"

# Verificar componentes
$components = @{
    "Node.js" = Test-NodeVersion
    "Servidor MCP" = Test-MCPServer
    "Configuração Warp" = Test-WarpConfig
}

foreach ($comp in $components.GetEnumerator()) {
    Write-StatusLine $comp.Key $comp.Value.Status $comp.Value.Color
}

# Verificar dependências NPM
Test-NPMDependencies

# Resumo
Write-Host "`nRecomendações:" -ForegroundColor Cyan
$needsAttention = $components.GetEnumerator() | Where-Object { $_.Value.Color -ne 'Green' }
if ($needsAttention) {
    foreach ($item in $needsAttention) {
        Write-Host "- $($item.Key): $($item.Value.Status)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Todos os componentes estão OK!" -ForegroundColor Green
}

Write-Host "`nPara mais detalhes, consulte MCP_ECOSYSTEM_GUIDE.md"

