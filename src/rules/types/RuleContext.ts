/**
 * Contexto para execução de regras no MCP_ECOSYSTEM
 */

export interface MCPRequest {
  method: string;
  params?: Record<string, any>;
  id?: string | number;
  jsonrpc: string;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number;
  jsonrpc: string;
}

export interface ToolExecutionContext {
  toolName: string;
  parameters: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface ResourceAccessContext {
  resourceUri: string;
  operation: 'read' | 'write' | 'delete' | 'list';
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface RuleExecutionContext {
  // MCP específico
  mcpRequest?: MCPRequest;
  mcpResponse?: MCPResponse;

  // Contexto de ferramenta
  toolContext?: ToolExecutionContext;

  // Contexto de recurso
  resourceContext?: ResourceAccessContext;

  // Contexto de sessão
  sessionId?: string;
  userId?: string;
  userRoles?: string[];

  // Contexto de ambiente
  environment: string; // 'dev', 'staging', 'prod'
  timestamp: Date;

  // Dados customizados
  customData?: Record<string, any>;

  // Metadados de execução
  executionMeta: {
    traceId: string;
    parentRuleId?: string;
    depth: number;
  };
}

export interface RuleContextBuilder {
  setMCPRequest(request: MCPRequest): RuleContextBuilder;
  setMCPResponse(response: MCPResponse): RuleContextBuilder;
  setToolContext(context: ToolExecutionContext): RuleContextBuilder;
  setResourceContext(context: ResourceAccessContext): RuleContextBuilder;
  setSession(sessionId: string, userId?: string, roles?: string[]): RuleContextBuilder;
  setEnvironment(env: string): RuleContextBuilder;
  setCustomData(data: Record<string, any>): RuleContextBuilder;
  build(): RuleExecutionContext;
}

export interface ContextValidator {
  validateMCPRequest(request: MCPRequest): boolean;
  validateToolContext(context: ToolExecutionContext): boolean;
  validateResourceContext(context: ResourceAccessContext): boolean;
  validateExecutionContext(context: RuleExecutionContext): boolean;
}
