#!/usr/bin/env python3
"""
Script para analisar o projeto AIDEN usando Model Context Protocol (MCP)
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any
import subprocess

class AIDENProjectAnalyzer:
    """Analisador do projeto AIDEN usando conceitos MCP"""
    
    def __init__(self, project_path: Path):
        self.project_path = project_path
        self.analysis_results = {}
        
    def analyze_structure(self) -> Dict[str, Any]:
        """Analisa a estrutura do projeto"""
        structure = {
            "directories": [],
            "files": {
                "python": [],
                "typescript": [],
                "json": [],
                "markdown": [],
                "yaml": [],
                "other": []
            },
            "total_files": 0,
            "total_size": 0
        }
        
        for root, dirs, files in os.walk(self.project_path):
            # Ignorar diretórios virtuais e cache
            dirs[:] = [d for d in dirs if d not in ['.venv', 'venv', '__pycache__', '.git', 'node_modules']]
            
            rel_root = Path(root).relative_to(self.project_path)
            if str(rel_root) != '.':
                structure["directories"].append(str(rel_root))
            
            for file in files:
                file_path = Path(root) / file
                structure["total_files"] += 1
                
                try:
                    structure["total_size"] += file_path.stat().st_size
                    
                    # Categorizar por extensão
                    ext = file_path.suffix.lower()
                    rel_path = file_path.relative_to(self.project_path)
                    
                    if ext == '.py':
                        structure["files"]["python"].append(str(rel_path))
                    elif ext in ['.ts', '.tsx']:
                        structure["files"]["typescript"].append(str(rel_path))
                    elif ext == '.json':
                        structure["files"]["json"].append(str(rel_path))
                    elif ext == '.md':
                        structure["files"]["markdown"].append(str(rel_path))
                    elif ext in ['.yml', '.yaml']:
                        structure["files"]["yaml"].append(str(rel_path))
                    else:
                        structure["files"]["other"].append(str(rel_path))
                except:
                    pass
                    
        return structure
        
    def analyze_code_quality(self) -> Dict[str, Any]:
        """Analisa a qualidade do código"""
        quality = {
            "python_modules": 0,
            "test_coverage": "not_calculated",
            "documentation_files": 0,
            "api_endpoints": [],
            "integrations": [],
            "models": []
        }
        
        # Contar módulos Python
        quality["python_modules"] = len([f for f in self.analysis_results["structure"]["files"]["python"] 
                                       if not f.startswith("test")])
        
        # Contar documentação
        quality["documentation_files"] = len(self.analysis_results["structure"]["files"]["markdown"])
        
        # Identificar endpoints da API
        api_file = self.project_path / "app" / "backend" / "api" / "main.py"
        if api_file.exists():
            try:
                content = api_file.read_text(encoding='utf-8', errors='ignore')
                # Buscar por decoradores de rota
                import re
                routes = re.findall(r'@app\.(get|post|put|delete|patch)\("([^"]+)"', content)
                quality["api_endpoints"] = [{"method": method.upper(), "path": path} 
                                          for method, path in routes]
            except:
                pass
                
        # Identificar integrações
        integrations_dir = self.project_path / "app" / "integrations"
        if integrations_dir.exists():
            quality["integrations"] = [f.stem for f in integrations_dir.glob("*.py") 
                                     if f.stem != "__init__"]
            
        # Identificar modelos
        models_dir = self.project_path / "app" / "ml" / "models"
        if models_dir.exists():
            quality["models"] = [f.stem for f in models_dir.glob("*.py") 
                               if f.stem != "__init__"]
            
        return quality
        
    def analyze_dependencies(self) -> Dict[str, List[str]]:
        """Analisa as dependências do projeto"""
        dependencies = {
            "python": [],
            "npm": []
        }
        
        # Python dependencies
        req_file = self.project_path / "requirements.txt"
        if req_file.exists():
            try:
                content = req_file.read_text(encoding='utf-8', errors='ignore')
                dependencies["python"] = [line.strip() for line in content.splitlines() 
                                        if line.strip() and not line.startswith("#")]
            except:
                pass
                
        # NPM dependencies
        package_file = self.project_path / "app" / "frontend" / "package.json"
        if package_file.exists():
            try:
                package_data = json.loads(package_file.read_text(encoding='utf-8', errors='ignore'))
                dependencies["npm"] = list(package_data.get("dependencies", {}).keys())
            except:
                pass
                
        return dependencies
        
    def generate_mcp_config(self) -> Dict[str, Any]:
        """Gera configuração MCP para o projeto"""
        return {
            "name": "aiden-mcp-enhanced",
            "version": "2.0.0",
            "description": "Enhanced AIDEN with full MCP capabilities",
            "server": {
                "command": "python",
                "args": ["-m", "aiden.mcp.server"],
                "env": {
                    "AIDEN_HOME": str(self.project_path),
                    "PYTHONPATH": str(self.project_path)
                }
            },
            "tools": [
                {
                    "name": "analyze_code",
                    "description": "Analyze code and suggest improvements",
                    "parameters": {
                        "code": {"type": "string", "required": True},
                        "language": {"type": "string", "default": "python"}
                    }
                },
                {
                    "name": "generate_code",
                    "description": "Generate code based on specifications",
                    "parameters": {
                        "prompt": {"type": "string", "required": True},
                        "language": {"type": "string", "default": "python"},
                        "context": {"type": "object"}
                    }
                },
                {
                    "name": "optimize_performance",
                    "description": "Optimize code performance",
                    "parameters": {
                        "code": {"type": "string", "required": True}
                    }
                },
                {
                    "name": "manage_repository",
                    "description": "Manage GitHub repository tasks",
                    "parameters": {
                        "action": {"type": "string", "enum": ["create_issue", "create_pr", "analyze_repo"]},
                        "data": {"type": "object"}
                    }
                }
            ],
            "resources": {
                "memory": "2GB",
                "timeout": 300,
                "max_tokens": 100000
            }
        }
        
    def generate_report(self) -> str:
        """Gera relatório completo da análise"""
        report = ["# AIDEN Project Analysis Report (MCP Enhanced)\n"]
        
        # Estrutura
        structure = self.analysis_results["structure"]
        report.append("## Project Structure\n")
        report.append(f"- Total Directories: {len(structure['directories'])}")
        report.append(f"- Total Files: {structure['total_files']}")
        report.append(f"- Total Size: {structure['total_size'] / 1024 / 1024:.2f} MB\n")
        
        report.append("### File Distribution")
        for file_type, files in structure["files"].items():
            if files:
                report.append(f"- {file_type.capitalize()}: {len(files)} files")
        
        # Qualidade
        quality = self.analysis_results["quality"]
        report.append("\n## Code Quality Analysis\n")
        report.append(f"- Python Modules: {quality['python_modules']}")
        report.append(f"- Documentation Files: {quality['documentation_files']}")
        report.append(f"- API Endpoints: {len(quality['api_endpoints'])}")
        report.append(f"- Integrations: {len(quality['integrations'])}")
        report.append(f"- ML Models: {len(quality['models'])}\n")
        
        if quality["api_endpoints"]:
            report.append("### API Endpoints")
            for endpoint in quality["api_endpoints"]:
                report.append(f"- {endpoint['method']} {endpoint['path']}")
                
        # Dependências
        deps = self.analysis_results["dependencies"]
        report.append("\n## Dependencies\n")
        report.append(f"### Python ({len(deps['python'])} packages)")
        for dep in deps["python"][:10]:  # Primeiras 10
            report.append(f"- {dep}")
        if len(deps["python"]) > 10:
            report.append(f"- ... and {len(deps['python']) - 10} more")
            
        if deps["npm"]:
            report.append(f"\n### NPM ({len(deps['npm'])} packages)")
            for dep in deps["npm"][:10]:  # Primeiras 10
                report.append(f"- {dep}")
            if len(deps["npm"]) > 10:
                report.append(f"- ... and {len(deps['npm']) - 10} more")
                
        # MCP Enhancement
        report.append("\n## MCP Enhancement Recommendations\n")
        report.append("1. **Install MCP Server**: `pip install huggingface-hub[mcp]`")
        report.append("2. **Configure MCP**: Update `mcp_config.json` with enhanced configuration")
        report.append("3. **Implement Tools**: Add tool implementations in `app/mcp/tools/`")
        report.append("4. **GitHub Integration**: Add GIDEN module for GitHub operations")
        report.append("5. **Testing**: Implement MCP-specific tests")
        
        report.append("\n## Next Steps\n")
        report.append("1. Complete remaining 30% of implementation")
        report.append("2. Add authentication and security layers")
        report.append("3. Implement database models and migrations")
        report.append("4. Setup monitoring and logging")
        report.append("5. Deploy with Docker/Kubernetes")
        
        return "\n".join(report)
        
    def analyze(self):
        """Executa análise completa"""
        print("🔍 Analyzing AIDEN Project Structure...")
        self.analysis_results["structure"] = self.analyze_structure()
        
        print("🔍 Analyzing Code Quality...")
        self.analysis_results["quality"] = self.analyze_code_quality()
        
        print("🔍 Analyzing Dependencies...")
        self.analysis_results["dependencies"] = self.analyze_dependencies()
        
        print("🔍 Generating MCP Configuration...")
        self.analysis_results["mcp_config"] = self.generate_mcp_config()
        
        # Salvar configuração MCP aprimorada
        mcp_config_path = self.project_path / "mcp_config_enhanced.json"
        with open(mcp_config_path, 'w', encoding='utf-8') as f:
            json.dump(self.analysis_results["mcp_config"], f, indent=2)
        print(f"✅ Enhanced MCP config saved to: {mcp_config_path}")
        
        # Gerar relatório
        report = self.generate_report()
        report_path = self.project_path / "MCP_ANALYSIS_REPORT.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"✅ Analysis report saved to: {report_path}")
        
        return self.analysis_results


def main():
    """Função principal"""
    import sys
    
    if len(sys.argv) > 1:
        project_path = Path(sys.argv[1])
    else:
        project_path = Path(__file__).parent
    
    print(f"🚀 Starting MCP Analysis of AIDEN Project")
    print(f"📁 Project Path: {project_path}\n")
    
    analyzer = AIDENProjectAnalyzer(project_path)
    results = analyzer.analyze()
    
    print("\n✅ Analysis Complete!")
    print(f"📊 Total Files: {results['structure']['total_files']}")
    print(f"📊 Python Modules: {results['quality']['python_modules']}")
    print(f"📊 API Endpoints: {len(results['quality']['api_endpoints'])}")
    
    print("\n📋 Generated Files:")
    print("- mcp_config_enhanced.json")
    print("- MCP_ANALYSIS_REPORT.md")
    
    print("\n🎯 To use MCP with AIDEN:")
    print("1. Install: pip install huggingface-hub[mcp]")
    print("2. Run: huggingface-hub mcp server --config mcp_config_enhanced.json")


if __name__ == "__main__":
    main()

