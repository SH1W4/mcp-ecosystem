# Script para migrar repositórios para MCP Academy
$ErrorActionPreference = 'Stop'

# Configurações
$ORG_NAME = "mcp-academy"
$REPOS = @{
    "mcp-academy" = @{
        description = "Central documentation and resources for MCP Academy"
        topics = "mcp,education,ai,documentation"
        dirs = @("docs", "README.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md")
    }
    "basic-starter" = @{
        description = "Starter kit for learning MCP development"
        topics = "mcp,starter-kit,education,tutorial"
        source = "academy/starters/basic-mcp-server"
    }
    "community-guidelines" = @{
        description = "Community guidelines and documentation for MCP Academy"
        topics = "community,guidelines,documentation,mcp"
        dirs = @("guidelines", "templates", "policies")
    }
}

# Funções auxiliares
function Write-Step {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Initialize-Repository {
    param(
        [string]$Name,
        [string]$Description,
        [string]$Topics
    )
    Write-Step "Initializing $Name"

    # Criar diretório se não existir
    if (-not (Test-Path $Name)) {
        New-Item -ItemType Directory -Path $Name | Out-Null
    }

    # Inicializar repositório
    Set-Location $Name
    
    if (-not (Test-Path ".git")) {
        git init
        git branch -M main
    }

    # Configurar remote
    $remoteUrl = "https://github.com/$ORG_NAME/$Name.git"
    git remote remove origin 2>$null
    git remote add origin $remoteUrl

    # Voltar ao diretório principal
    Set-Location ..
}

function Copy-SourceFiles {
    param(
        [string]$Name,
        [string]$Source
    )
    Write-Step "Copying files for $Name"
    
    if (Test-Path $Source) {
        Copy-Item -Path "$Source/*" -Destination $Name -Recurse -Force
    }
}

function Initialize-BasicFiles {
    param(
        [string]$Name,
        [string]$Description
    )
    Write-Step "Creating basic files for $Name"

    # README.md
    @"
# $Name

$Description

## About

This repository is part of the MCP Academy ecosystem, focused on teaching and developing distributed AI systems.

## Getting Started

TODO: Add getting started instructions

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting any changes.

## License

MIT - See [LICENSE](LICENSE) for details.
"@ | Set-Content -Path "$Name/README.md"

    # .gitignore
    @"
# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
.Python
env/
venv/
.env/
.venv/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Build
dist/
build/
*.tsbuildinfo

# Logs
logs/
*.log

# System
.DS_Store
Thumbs.db
"@ | Set-Content -Path "$Name/.gitignore"

    # LICENSE
    @"
MIT License

Copyright (c) 2025 MCP Academy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"@ | Set-Content -Path "$Name/LICENSE"
}

# Criar diretório temporário para migração
$tempDir = "temp_migration"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Set-Location $tempDir

try {
    # Processar cada repositório
    foreach ($repo in $REPOS.GetEnumerator()) {
        $name = $repo.Key
        $config = $repo.Value

        # Inicializar repositório
        Initialize-Repository -Name $name -Description $config.description -Topics $config.topics

        # Copiar arquivos fonte se especificado
        if ($config.source) {
            Copy-SourceFiles -Name $name -Source "../$($config.source)"
        }

        # Criar arquivos básicos
        Initialize-BasicFiles -Name $name -Description $config.description

        # Commit e push
        Set-Location $name
        git add -A
        git commit -m "Initial commit

- Adds basic repository structure
- Sets up documentation
- Configures development environment"
        Write-Host "`nRepository $name is ready to be pushed to GitHub" -ForegroundColor Green
        Write-Host "Run 'git push -u origin main' when ready`n"
        Set-Location ..
    }

    Write-Host "`nMigration prepared successfully!" -ForegroundColor Green
    Write-Host "Repositories are in: $((Get-Location).Path)" -ForegroundColor Yellow
    Write-Host "`nNext steps:"
    Write-Host "1. Review the generated files"
    Write-Host "2. Push each repository to GitHub"
    Write-Host "3. Configure branch protection and other settings"
} catch {
    Write-Host "Error during migration: $_" -ForegroundColor Red
} finally {
    # Voltar ao diretório original
    Set-Location ..
}

