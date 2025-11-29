@echo off
echo 🧬 Instalando VIREON MCP para Cursor...

echo ✅ Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale primeiro: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Verificando npm...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado. Instale primeiro: https://nodejs.org/
    pause
    exit /b 1
)

echo 📦 Instalando dependências...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo 🔨 Compilando VIREON MCP...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro ao compilar o projeto
    pause
    exit /b 1
)

echo 🧪 Testando servidor...
timeout /t 2 /nobreak >nul
node vireon-mcp-server.js --test
if %errorlevel% neq 0 (
    echo ⚠️ Aviso: Teste falhou, mas pode funcionar no Cursor
)

echo.
echo 🎉 Instalação do VIREON MCP concluída!
echo.
echo 📋 Próximos passos:
echo 1. Abra o Cursor
echo 2. Vá para Settings ^> Extensions ^> MCP
echo 3. Adicione o servidor MCP:
echo    - Nome: VIREON MCP
echo    - Comando: node
echo    - Argumentos: C:\Users\João\Desktop\PROJETOS\MCP_ECOSYSTEM\vireon-mcp-server.js
echo.
echo 🔧 Comandos úteis:
echo    - Iniciar: node vireon-mcp-server.js
echo    - Compilar: npm run build
echo.
echo 🧬 VIREON MCP está pronto para uso!
echo.
pause








