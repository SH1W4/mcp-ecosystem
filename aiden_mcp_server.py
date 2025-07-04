#!/usr/bin/env python3
"""
AIDEN MCP Server
Servidor MCP que expõe as capacidades avançadas do AIDEN através do Model Context Protocol
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from mcp.server import Server, Tool
from mcp.shared.models import (
    InitializeResult,
    InitializeRequestSchema,
    ListToolsResult,
    CallToolResult,
    TextContent,
    ToolInfo
)

# Adicionar o caminho do AIDEN ao sys.path
AIDEN_PATH = Path("C:/Users/João/Desktop/PROJETOS/AGENTES_IA/AIDEN_PROJECT/AIDEN_PROJECT")
if AIDEN_PATH.exists():
    sys.path.insert(0, str(AIDEN_PATH))

class AidenMCPServer:
    """Servidor MCP para o AIDEN"""
    
    def __init__(self):
        self.server = Server("aiden-mcp-server")
        self.aiden_initialized = False
        self.aiden_components = {}
        
        # Registrar handlers
        self.server.request_handlers["initialize"] = self.handle_initialize
        self.server.request_handlers["tools/list"] = self.handle_list_tools
        self.server.request_handlers["tools/call"] = self.handle_call_tool
        
    async def handle_initialize(self, request: InitializeRequestSchema) -> InitializeResult:
        """Inicializa o servidor AIDEN MCP"""
        try:
            # Tentar importar componentes do AIDEN
            await self._initialize_aiden_components()
            
            return InitializeResult(
                protocolVersion="0.1.0",
                serverInfo={
                    "name": "AIDEN MCP Server",
                    "version": "0.1.0",
                    "description": "Servidor MCP para o agente AIDEN com capacidades avançadas de IA"
                },
                capabilities={
                    "tools": {
                        "descriptions": True
                    }
                }
            )
        except Exception as e:
            print(f"Erro ao inicializar: {e}")
            raise
    
    async def _initialize_aiden_components(self):
        """Inicializa os componentes do AIDEN"""
        try:
            # Importar componentes principais
            from aiden_cli import (
                AidenCliConfig, 
                PredictionManager,
                AutoEvolutionManager,
                EonIntegrationManager
            )
            
            # Inicializar configuração
            self.aiden_components['config'] = AidenCliConfig()
            
            # Inicializar gerenciadores
            integration_manager = EonIntegrationManager(self.aiden_components['config'])
            self.aiden_components['integration'] = integration_manager
            self.aiden_components['prediction'] = PredictionManager(self.aiden_components['config'])
            self.aiden_components['evolution'] = AutoEvolutionManager(
                self.aiden_components['config'],
                integration_manager
            )
            
            self.aiden_initialized = True
            print("Componentes AIDEN inicializados com sucesso")
            
        except ImportError as e:
            print(f"Erro ao importar componentes AIDEN: {e}")
            # Modo fallback - funcionalidades limitadas
            self.aiden_initialized = False
    
    async def handle_list_tools(self, request: Dict[str, Any]) -> ListToolsResult:
        """Lista as ferramentas disponíveis do AIDEN"""
        tools = [
            ToolInfo(
                name="aiden_status",
                description="Verifica o status completo do sistema AIDEN",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            ),
            ToolInfo(
                name="aiden_predict",
                description="Executa uma predição usando o sistema AIDEN com contexto cognitivo opcional",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "input_data": {
                            "type": "object",
                            "description": "Dados de entrada para a predição"
                        },
                        "model": {
                            "type": "string",
                            "description": "Nome do modelo a usar (padrão: 'default')",
                            "default": "default"
                        },
                        "use_cognitive_context": {
                            "type": "boolean",
                            "description": "Se deve usar contexto cognitivo do EON",
                            "default": True
                        },
                        "confidence_threshold": {
                            "type": "number",
                            "description": "Limiar de confiança mínimo",
                            "default": 0.7
                        }
                    },
                    "required": ["input_data"]
                }
            ),
            ToolInfo(
                name="aiden_generate_code",
                description="Gera código Python automaticamente usando o sistema de autoprogramação",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["function", "class", "test"],
                            "description": "Tipo de código a gerar"
                        },
                        "name": {
                            "type": "string",
                            "description": "Nome da função/classe"
                        },
                        "description": {
                            "type": "string",
                            "description": "Descrição do que o código deve fazer"
                        },
                        "parameters": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Lista de parâmetros (para funções)"
                        },
                        "attributes": {
                            "type": "array",
                            "items": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "description": "Lista de atributos [nome, tipo] (para classes)"
                        }
                    },
                    "required": ["type", "name"]
                }
            ),
            ToolInfo(
                name="aiden_analyze_code",
                description="Analisa código existente e fornece métricas e sugestões",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "code": {
                            "type": "string",
                            "description": "Código a ser analisado"
                        },
                        "analysis_type": {
                            "type": "string",
                            "enum": ["complexity", "style", "performance", "security", "all"],
                            "description": "Tipo de análise a realizar",
                            "default": "all"
                        }
                    },
                    "required": ["code"]
                }
            ),
            ToolInfo(
                name="aiden_evolve",
                description="Dispara o processo de evolução automática do AIDEN",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "component": {
                            "type": "string",
                            "description": "Componente específico a evoluir (opcional)"
                        },
                        "depth": {
                            "type": "string",
                            "enum": ["incremental", "moderate", "deep"],
                            "description": "Profundidade da evolução",
                            "default": "incremental"
                        }
                    },
                    "required": []
                }
            ),
            ToolInfo(
                name="aiden_consciousness_state",
                description="Consulta o estado atual de consciência do AIDEN",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "include_history": {
                            "type": "boolean",
                            "description": "Se deve incluir histórico de estados",
                            "default": False
                        }
                    },
                    "required": []
                }
            )
        ]
        
        return ListToolsResult(tools=tools)
    
    async def handle_call_tool(self, request: Dict[str, Any]) -> CallToolResult:
        """Executa uma ferramenta específica do AIDEN"""
        tool_name = request.get("name")
        arguments = request.get("arguments", {})
        
        try:
            if tool_name == "aiden_status":
                result = await self._handle_status()
            elif tool_name == "aiden_predict":
                result = await self._handle_predict(arguments)
            elif tool_name == "aiden_generate_code":
                result = await self._handle_generate_code(arguments)
            elif tool_name == "aiden_analyze_code":
                result = await self._handle_analyze_code(arguments)
            elif tool_name == "aiden_evolve":
                result = await self._handle_evolve(arguments)
            elif tool_name == "aiden_consciousness_state":
                result = await self._handle_consciousness_state(arguments)
            else:
                raise ValueError(f"Ferramenta desconhecida: {tool_name}")
            
            return CallToolResult(
                content=[TextContent(text=json.dumps(result, indent=2, ensure_ascii=False))]
            )
            
        except Exception as e:
            return CallToolResult(
                content=[TextContent(text=f"Erro ao executar ferramenta: {str(e)}")]
            )
    
    async def _handle_status(self) -> Dict[str, Any]:
        """Verifica o status do sistema AIDEN"""
        if not self.aiden_initialized:
            return {
                "status": "limited",
                "message": "AIDEN não está completamente inicializado",
                "available_features": ["basic"]
            }
        
        try:
            integration_status = self.aiden_components['integration'].check_integration_status()
            evolution_status = self.aiden_components['evolution'].check_evolution_status()
            
            return {
                "status": "online",
                "aiden_initialized": True,
                "integration": integration_status,
                "evolution": evolution_status,
                "config": {
                    "environment": self.aiden_components['config'].config.get('ambiente'),
                    "autoprogramming_enabled": self.aiden_components['config'].config.get('autoprogramacao', {}).get('habilitado')
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _handle_predict(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Executa uma predição usando AIDEN"""
        if not self.aiden_initialized:
            return {"error": "AIDEN não está inicializado para predições"}
        
        try:
            input_data = arguments.get("input_data", {})
            model = arguments.get("model", "default")
            use_cognitive = arguments.get("use_cognitive_context", True)
            threshold = arguments.get("confidence_threshold", 0.7)
            
            result = self.aiden_components['prediction'].predict(
                input_data=input_data,
                model=model,
                use_cognitive_context=use_cognitive,
                confidence_threshold=threshold
            )
            
            return result
            
        except Exception as e:
            return {"error": f"Erro na predição: {str(e)}"}
    
    async def _handle_generate_code(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Gera código usando o sistema de autoprogramação"""
        try:
            # Importar o gerador de código
            from app.autoprogramming.code_generator import CodeGenerator
            
            generator = CodeGenerator()
            code_type = arguments.get("type", "function")
            name = arguments.get("name")
            description = arguments.get("description", "")
            
            if code_type == "function":
                parameters = arguments.get("parameters", [])
                result = generator.generate_function(
                    function_name=name,
                    parameters=parameters,
                    description=description
                )
            elif code_type == "class":
                attributes = arguments.get("attributes", [])
                result = generator.generate_class(
                    class_name=name,
                    attributes=attributes,
                    methods=[],
                    description=description
                )
            else:
                return {"error": f"Tipo de código não suportado: {code_type}"}
            
            return {
                "success": result.success,
                "code": result.code,
                "metadata": result.metadata,
                "error": result.error_message
            }
            
        except Exception as e:
            return {"error": f"Erro ao gerar código: {str(e)}"}
    
    async def _handle_analyze_code(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Analisa código existente"""
        try:
            # Importar o analisador de código
            from app.autoprogramming.code_analyzer import CodeAnalyzer
            
            analyzer = CodeAnalyzer()
            code = arguments.get("code", "")
            analysis_type = arguments.get("analysis_type", "all")
            
            result = analyzer.analyze_code(code, analysis_type)
            
            return {
                "analysis": result,
                "summary": f"Código analisado com {len(result.get('issues', []))} problemas encontrados"
            }
            
        except Exception as e:
            return {"error": f"Erro ao analisar código: {str(e)}"}
    
    async def _handle_evolve(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Dispara evolução do AIDEN"""
        if not self.aiden_initialized:
            return {"error": "AIDEN não está inicializado para evolução"}
        
        try:
            component = arguments.get("component")
            depth = arguments.get("depth", "incremental")
            
            result = self.aiden_components['evolution'].trigger_evolution(
                target_component=component,
                evolution_depth=depth
            )
            
            return result
            
        except Exception as e:
            return {"error": f"Erro na evolução: {str(e)}"}
    
    async def _handle_consciousness_state(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Consulta estado de consciência do AIDEN"""
        try:
            # Importar o sistema de consciência
            from app.eon_integration.aiden_consciousness import AidenConsciousness
            
            # Por enquanto, retornar um estado simulado
            return {
                "consciousness_level": "base",
                "metrics": {
                    "coherence": 0.85,
                    "awareness_depth": 0.75,
                    "processing_capacity": 0.80,
                    "evolution_rate": 0.65
                },
                "state": {
                    "awareness": "environmental",
                    "processing": "quantum_reactive",
                    "adaptation": "continuous"
                }
            }
            
        except Exception as e:
            return {"error": f"Erro ao consultar consciência: {str(e)}"}
    
    async def run(self):
        """Executa o servidor MCP"""
        import sys
        await self.server.run(
            sys.stdin.buffer,
            sys.stdout.buffer
        )

def main():
    """Função principal"""
    server = AidenMCPServer()
    asyncio.run(server.run())

if __name__ == "__main__":
    main()

