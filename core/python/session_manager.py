#!/usr/bin/env python3
"""
Cognition MCP - Session Manager
Portal Assimilador de Regras de Desenvolvimento

Automatiza o início e fim de sessões seguindo as Session Rules definidas.
"""

import asyncio
import json
import logging
import subprocess
import sys
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


@dataclass
class ToolVersion:
    """Representa a versão de uma ferramenta"""

    name: str
    version: str
    required_version: str
    is_valid: bool


@dataclass
class SessionReport:
    """Relatório de sessão"""

    start_time: datetime
    end_time: Optional[datetime]
    tools_validated: List[ToolVersion]
    files_modified: List[str]
    commits_made: List[str]
    issues_found: List[str]
    actions_taken: List[str]


class SessionManager:
    """
    Gerenciador de Sessões Inteligente

    Baseado nas Session Rules, automatiza:
    - Verificação de ferramentas
    - Salvamento de trabalho
    - Limpeza de ambiente
    - Resolução de problemas
    """

    def __init__(self, project_path: Optional[Path] = None):
        self.project_path = project_path or Path.cwd()
        self.logger = self._setup_logging()
        self.session_report = SessionReport(
            start_time=datetime.now(),
            end_time=None,
            tools_validated=[],
            files_modified=[],
            commits_made=[],
            issues_found=[],
            actions_taken=[],
        )

        # Requisitos mínimos das Session Rules
        self.tool_requirements = {
            "git": "2.40",
            "node": "18.0.0",
            "python": "3.10",
            "winget": None,  # Qualquer versão
        }

    def _setup_logging(self) -> logging.Logger:
        """Configura logging inteligente"""
        logger = logging.getLogger("cognition_mcp_session")
        logger.setLevel(logging.INFO)

        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "🧠 %(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

        return logger

    async def start_session(self) -> bool:
        """
        Inicia sessão seguindo Session Rules

        Returns:
            bool: True se sessão iniciada com sucesso
        """
        self.logger.info("🚀 Iniciando sessão Cognition MCP...")

        try:
            # 1. Verificação de Ferramentas (Session Rules §1)
            tools_ok = await self._validate_tools()

            # 2. Validação do Ambiente
            env_ok = await self._validate_environment()

            # 3. Carregamento de Configurações
            config_ok = await self._load_configurations()

            # 4. Inicialização do Monitoramento
            monitoring_ok = await self._setup_monitoring()

            if all([tools_ok, env_ok, config_ok, monitoring_ok]):
                self.logger.info("✅ Sessão iniciada com sucesso!")
                await self._record_action("Session started successfully")
                return True
            else:
                self.logger.error("❌ Falha ao iniciar sessão")
                return False

        except Exception as e:
            self.logger.error(f"❌ Erro durante inicialização: {e}")
            return False

    async def _validate_tools(self) -> bool:
        """Valida ferramentas conforme Session Rules"""
        self.logger.info("🔧 Validando ferramentas...")

        all_valid = True

        for tool, required_version in self.tool_requirements.items():
            try:
                version = await self._get_tool_version(tool)
                is_valid = (
                    self._check_version(version, required_version)
                    if required_version
                    else True
                )

                tool_version = ToolVersion(
                    name=tool,
                    version=version,
                    required_version=required_version or "any",
                    is_valid=is_valid,
                )

                self.session_report.tools_validated.append(tool_version)

                if is_valid:
                    self.logger.info(
                        f"✅ {tool}: {version} (req: {required_version or 'any'})"
                    )
                else:
                    self.logger.error(f"❌ {tool}: {version} < {required_version}")
                    all_valid = False
                    await self._fix_tool_issue(tool, version, required_version)

            except Exception as e:
                self.logger.error(f"❌ Erro ao verificar {tool}: {e}")
                self.session_report.issues_found.append(
                    f"Tool check failed: {tool} - {e}"
                )
                all_valid = False

        return all_valid

    async def _get_tool_version(self, tool: str) -> str:
        """Obtém versão de uma ferramenta"""
        try:
            if tool == "git":
                result = await self._run_command(["git", "--version"])
                return result.split()[-1] if result else "unknown"
            elif tool == "node":
                result = await self._run_command(["node", "--version"])
                return result.strip().lstrip("v") if result else "unknown"
            elif tool == "python":
                result = await self._run_command([sys.executable, "--version"])
                return result.split()[-1] if result else "unknown"
            elif tool == "winget":
                result = await self._run_command(["winget", "--version"])
                return result.strip() if result else "unknown"
            else:
                return "unknown"
        except:
            return "not_found"

    def _check_version(self, current: str, required: str) -> bool:
        """Compara versões (implementação simplificada)"""
        if current == "not_found" or current == "unknown":
            return False

        try:
            current_parts = [int(x) for x in current.split(".")]
            required_parts = [int(x) for x in required.split(".")]

            # Pad com zeros se necessário
            max_len = max(len(current_parts), len(required_parts))
            current_parts.extend([0] * (max_len - len(current_parts)))
            required_parts.extend([0] * (max_len - len(required_parts)))

            return current_parts >= required_parts
        except:
            return False

    async def _fix_tool_issue(self, tool: str, current: str, required: str):
        """Tenta corrigir problemas de ferramentas automaticamente"""
        self.logger.info(f"🔧 Tentando corrigir problema com {tool}...")

        if tool == "git" and current == "not_found":
            # Executar fix-git-admin.ps1 se disponível
            fix_script = Path.home() / "fix-git-admin.ps1"
            if fix_script.exists():
                await self._run_command(["powershell", "-File", str(fix_script)])
                await self._record_action(f"Executed Git fix script: {fix_script}")

        elif tool == "node" and current == "not_found":
            self.logger.warning(
                "📝 Node.js não encontrado. Considere instalar via winget ou nvm"
            )
            await self._record_action("Node.js installation recommended")

    async def _validate_environment(self) -> bool:
        """Valida ambiente de desenvolvimento"""
        self.logger.info("🌍 Validando ambiente...")

        checks = [
            self._check_git_repository(),
            self._check_package_files(),
            self._check_config_files(),
        ]

        results = await asyncio.gather(*checks, return_exceptions=True)
        return all(r is True for r in results if not isinstance(r, Exception))

    async def _check_git_repository(self) -> bool:
        """Verifica se estamos em um repositório Git"""
        git_dir = self.project_path / ".git"
        if git_dir.exists():
            self.logger.info("✅ Repositório Git detectado")
            return True
        else:
            self.logger.warning("⚠️  Não é um repositório Git")
            return True  # Não é crítico

    async def _check_package_files(self) -> bool:
        """Verifica arquivos de configuração do projeto"""
        package_files = [
            "package.json",
            "Cargo.toml",
            "pyproject.toml",
            "requirements.txt",
        ]
        found = False

        for file in package_files:
            if (self.project_path / file).exists():
                self.logger.info(f"✅ Encontrado: {file}")
                found = True

        if not found:
            self.logger.warning("⚠️  Nenhum arquivo de projeto encontrado")

        return True  # Não é crítico

    async def _check_config_files(self) -> bool:
        """Verifica arquivos de configuração"""
        config_files = [".prettierrc", ".eslintrc.js", "tsconfig.json"]

        for file in config_files:
            if (self.project_path / file).exists():
                self.logger.info(f"✅ Config encontrada: {file}")

        return True

    async def _load_configurations(self) -> bool:
        """Carrega configurações do projeto"""
        self.logger.info("⚙️  Carregando configurações...")

        # Carregar config do MCP se existir
        config_file = self.project_path / "config" / "mcp-ecosystem.json"
        if config_file.exists():
            try:
                with open(config_file, "r") as f:
                    config = json.load(f)
                self.logger.info("✅ Configuração MCP carregada")
                return True
            except Exception as e:
                self.logger.error(f"❌ Erro ao carregar config: {e}")
                return False

        return True

    async def _setup_monitoring(self) -> bool:
        """Configura monitoramento da sessão"""
        self.logger.info("📊 Configurando monitoramento...")
        # TODO: Implementar monitoramento em tempo real
        return True

    async def end_session(self, auto_commit: bool = True) -> SessionReport:
        """
        Finaliza sessão seguindo Session Rules

        Args:
            auto_commit: Se deve fazer commit automático

        Returns:
            SessionReport: Relatório da sessão
        """
        self.logger.info("🏁 Finalizando sessão...")

        try:
            # 1. Salvamento de Trabalho (Session Rules §2)
            if auto_commit:
                await self._save_work()

            # 2. Limpeza de Ambiente (Session Rules §3)
            await self._cleanup_environment()

            # 3. Atualização de Documentos
            await self._update_documentation()

            # 4. Finalização do Relatório
            self.session_report.end_time = datetime.now()

            self.logger.info("✅ Sessão finalizada com sucesso!")
            return self.session_report

        except Exception as e:
            self.logger.error(f"❌ Erro durante finalização: {e}")
            self.session_report.end_time = datetime.now()
            return self.session_report

    async def _save_work(self):
        """Salva trabalho pendente"""
        self.logger.info("💾 Salvando trabalho...")

        try:
            # git add -A && git commit -m "WIP: ..."
            await self._run_command(["git", "add", "-A"])

            commit_message = f"WIP: Session {datetime.now().strftime('%Y%m%d_%H%M%S')}"
            result = await self._run_command(["git", "commit", "-m", commit_message])

            if result:
                self.session_report.commits_made.append(commit_message)
                self.logger.info(f"✅ Commit realizado: {commit_message}")

                # git push
                await self._run_command(["git", "push"])
                self.logger.info("✅ Push realizado")

        except Exception as e:
            self.logger.error(f"❌ Erro ao salvar trabalho: {e}")

    async def _cleanup_environment(self):
        """Limpa ambiente conforme Session Rules"""
        self.logger.info("🧹 Limpando ambiente...")

        # Diretórios para limpeza
        cleanup_dirs = [
            "node_modules/.cache",
            "__pycache__",
            ".pytest_cache",
            "dist",
            "build",
            "target/debug",  # Rust
        ]

        for dir_path in cleanup_dirs:
            full_path = self.project_path / dir_path
            if full_path.exists():
                try:
                    import shutil

                    shutil.rmtree(full_path)
                    self.logger.info(f"🗑️  Removido: {dir_path}")
                    await self._record_action(f"Cleaned directory: {dir_path}")
                except Exception as e:
                    self.logger.warning(f"⚠️  Erro ao limpar {dir_path}: {e}")

    async def _update_documentation(self):
        """Atualiza documentação (TASKS.md, etc.)"""
        self.logger.info("📝 Atualizando documentação...")

        # Atualizar TASKS.md se existir
        tasks_file = self.project_path / "TASKS.md"
        if tasks_file.exists():
            # TODO: Implementar atualização inteligente do TASKS.md
            await self._record_action("Documentation updated")

    async def _record_action(self, action: str):
        """Registra ação no relatório"""
        self.session_report.actions_taken.append(
            f"{datetime.now().isoformat()}: {action}"
        )

    async def _run_command(self, command: List[str]) -> Optional[str]:
        """Executa comando de forma assíncrona"""
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.project_path,
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                return stdout.decode().strip()
            else:
                self.logger.error(f"Command failed: {' '.join(command)}")
                self.logger.error(f"Error: {stderr.decode().strip()}")
                return None

        except Exception as e:
            self.logger.error(f"Error running command {' '.join(command)}: {e}")
            return None

    def generate_report(self) -> Dict:
        """Gera relatório detalhado da sessão"""
        return {
            "session_report": asdict(self.session_report),
            "summary": {
                "duration": (
                    str(self.session_report.end_time - self.session_report.start_time)
                    if self.session_report.end_time
                    else "ongoing"
                ),
                "tools_validated": len(self.session_report.tools_validated),
                "commits_made": len(self.session_report.commits_made),
                "issues_found": len(self.session_report.issues_found),
                "actions_taken": len(self.session_report.actions_taken),
            },
        }


# CLI Interface
async def main():
    """Interface CLI para o Session Manager"""
    import argparse

    parser = argparse.ArgumentParser(description="Cognition MCP Session Manager")
    parser.add_argument(
        "command", choices=["start", "end", "status"], help="Comando a executar"
    )
    parser.add_argument("--project-path", type=Path, help="Caminho do projeto")
    parser.add_argument(
        "--no-commit", action="store_true", help="Não fazer commit automático"
    )

    args = parser.parse_args()

    session_manager = SessionManager(args.project_path)

    if args.command == "start":
        success = await session_manager.start_session()
        sys.exit(0 if success else 1)

    elif args.command == "end":
        auto_commit = not args.no_commit
        report = await session_manager.end_session(auto_commit)
        print(json.dumps(session_manager.generate_report(), indent=2))

    elif args.command == "status":
        print(json.dumps(session_manager.generate_report(), indent=2))


if __name__ == "__main__":
    asyncio.run(main())
