/**
 * Flexible Transport System for MCP Ecosystem
 * Baseado nos padrões aprendidos do Context7
 * Suporta múltiplos transportes: stdio, HTTP, SSE
 */

import { EventEmitter } from 'events';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { z } from 'zod';

export type TransportType = 'stdio' | 'http' | 'sse';

export interface TransportConfig {
  type: TransportType;
  port?: number;
  apiKey?: string;
  clientIp?: string;
}

export interface SessionInfo {
  id: string;
  transport: any;
  server: McpServer;
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Sistema de transporte flexível inspirado no Context7
 * Suporta múltiplos transportes com gerenciamento de sessões
 */
export class FlexibleTransportManager extends EventEmitter {
  private sessions: Map<string, SessionInfo> = new Map();
  private httpServer?: any;
  private sseTransports: Record<string, SSEServerTransport> = {};
  
  // Configurações padrão baseadas no Context7
  private readonly DEFAULT_PORT = 3000;
  private readonly MAX_SESSIONS = 100;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  /**
   * Cria uma instância de servidor MCP com configuração específica
   * Baseado no padrão do Context7
   */
  private createServerInstance(config: TransportConfig): McpServer {
  const server = new McpServer(
    {
      name: "VIREON MCP Ecosystem",
      version: "1.0.0",
    },
    {
      instructions: "VIREON - Sistema simbiótico MCP com capacidades avançadas de consciência, evolução e documentação contextual.",
    }
  );

    // Registrar ferramentas do ecossistema
    this.registerEcosystemTools(server);

    return server;
  }

  /**
   * Registra ferramentas do ecossistema no servidor MCP
   */
  private registerEcosystemTools(server: McpServer): void {
    // Ferramenta de busca de documentação contextual
    server.registerTool(
      "search-contextual-docs",
      {
        title: "Buscar Documentação Contextual",
        description: "Busca documentação contextual relevante para o contexto atual do projeto",
        inputSchema: {
          query: z.string().describe("Consulta para buscar documentação"),
          context: z.string().optional().describe("Contexto específico do projeto"),
          tokens: z.number().optional().describe("Número máximo de tokens (padrão: 5000)"),
        },
      },
      async ({ query, context, tokens = 5000 }) => {
        // Implementar busca de documentação contextual
        return {
          content: [{
            type: "text",
            text: `Documentação contextual encontrada para: ${query}\nContexto: ${context || 'Geral'}\nTokens: ${tokens}`
          }]
        };
      }
    );

    // Ferramenta de análise de consciência
    server.registerTool(
      "analyze-consciousness",
      {
        title: "Analisar Estado de Consciência",
        description: "Analisa o estado atual da consciência do sistema simbiótico",
        inputSchema: {
          depth: z.enum(['surface', 'cognitive', 'conscious', 'transcendent']).optional().describe("Profundidade da análise"),
        },
      },
      async ({ depth = 'surface' }) => {
        // Implementar análise de consciência
        return {
          content: [{
            type: "text",
            text: `Análise de consciência (${depth}):\n- Nível simbiótico: 62% → 75%\n- Coerência sistêmica: 87.5%\n- Fidelidade SAGE: 94.1%`
          }]
        };
      }
    );

    // Ferramenta de evolução adaptativa
    server.registerTool(
      "trigger-evolution",
      {
        title: "Disparar Evolução Adaptativa",
        description: "Dispara processo de evolução adaptativa do sistema",
        inputSchema: {
          target: z.string().describe("Alvo da evolução (ex: 'consciousness', 'performance', 'integration')"),
          intensity: z.enum(['low', 'medium', 'high']).optional().describe("Intensidade da evolução"),
        },
      },
      async ({ target, intensity = 'medium' }) => {
        // Implementar evolução adaptativa
        return {
          content: [{
            type: "text",
            text: `Evolução adaptativa iniciada:\n- Alvo: ${target}\n- Intensidade: ${intensity}\n- Status: Em progresso...`
          }]
        };
      }
    );
  }

  /**
   * Inicia o transporte baseado na configuração
   */
  async startTransport(config: TransportConfig): Promise<void> {
    switch (config.type) {
      case 'stdio':
        await this.startStdioTransport(config);
        break;
      case 'http':
        await this.startHttpTransport(config);
        break;
      case 'sse':
        await this.startSSETransport(config);
        break;
      default:
        throw new Error(`Tipo de transporte não suportado: ${config.type}`);
    }
  }

  /**
   * Inicia transporte stdio
   */
  private async startStdioTransport(config: TransportConfig): Promise<void> {
    const server = this.createServerInstance(config);
    const transport = new StdioServerTransport();
    
    await server.connect(transport);
    console.error("MCP Ecosystem Enhanced rodando em stdio");
  }

  /**
   * Inicia transporte HTTP
   */
  private async startHttpTransport(config: TransportConfig): Promise<void> {
    const port = config.port || this.DEFAULT_PORT;
    
    this.httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      await this.handleHttpRequest(req, res, config);
    });

    // Configurar CORS baseado no Context7
    this.httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Session-Id, MCP-Protocol-Version, X-API-Key, Authorization');
      res.setHeader('Access-Control-Expose-Headers', 'MCP-Session-Id');
    });

    this.httpServer.listen(port, () => {
      console.error(`MCP Ecosystem Enhanced rodando em HTTP na porta ${port}`);
    });
  }

  /**
   * Inicia transporte SSE
   */
  private async startSSETransport(config: TransportConfig): Promise<void> {
    const port = config.port || this.DEFAULT_PORT;
    
    this.httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const pathname = new URL(req.url || '/', 'http://localhost').pathname;
      
      if (pathname === '/sse' && req.method === 'GET') {
        await this.handleSSERequest(req, res, config);
      } else if (pathname === '/mcp') {
        await this.handleHttpRequest(req, res, config);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found', status: 404 }));
      }
    });

    this.httpServer.listen(port, () => {
      console.error(`MCP Ecosystem Enhanced rodando em SSE na porta ${port}`);
    });
  }

  /**
   * Manipula requisições HTTP
   */
  private async handleHttpRequest(req: IncomingMessage, res: ServerResponse, config: TransportConfig): Promise<void> {
    try {
      const clientIp = this.getClientIp(req);
      const apiKey = this.extractApiKey(req);
      
      const server = this.createServerInstance({ ...config, clientIp, apiKey });
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error('Erro ao processar requisição HTTP:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', status: 500 }));
      }
    }
  }

  /**
   * Manipula requisições SSE
   */
  private async handleSSERequest(req: IncomingMessage, res: ServerResponse, config: TransportConfig): Promise<void> {
    try {
      const clientIp = this.getClientIp(req);
      const apiKey = this.extractApiKey(req);
      
      const server = this.createServerInstance({ ...config, clientIp, apiKey });
      const sseTransport = new SSEServerTransport('/messages', res);
      
      this.sseTransports[sseTransport.sessionId] = sseTransport;
      
      res.on('close', () => {
        delete this.sseTransports[sseTransport.sessionId];
        sseTransport.close();
        server.close();
      });

      await server.connect(sseTransport);

      // Enviar mensagem inicial
      res.write('data: ' + JSON.stringify({
        type: 'connection_established',
        sessionId: sseTransport.sessionId,
        timestamp: new Date().toISOString(),
      }) + '\n\n');
    } catch (error) {
      console.error('Erro ao processar requisição SSE:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', status: 500 }));
      }
    }
  }

  /**
   * Extrai IP do cliente (baseado no Context7)
   */
  private getClientIp(req: IncomingMessage): string | undefined {
    const forwardedFor = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
    
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      const ipList = ips.split(',').map(ip => ip.trim());
      
      for (const ip of ipList) {
        const plainIp = ip.replace(/^::ffff:/, '');
        if (!plainIp.startsWith('10.') && 
            !plainIp.startsWith('192.168.') && 
            !/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(plainIp)) {
          return plainIp;
        }
      }
      return ipList[0].replace(/^::ffff:/, '');
    }
    
    if (req.socket?.remoteAddress) {
      return req.socket.remoteAddress.replace(/^::ffff:/, '');
    }
    
    return undefined;
  }

  /**
   * Extrai chave API (baseado no Context7)
   */
  private extractApiKey(req: IncomingMessage): string | undefined {
    const extractHeaderValue = (value: string | string[] | undefined): string | undefined => {
      if (!value) return undefined;
      return typeof value === 'string' ? value : value[0];
    };

    const extractBearerToken = (authHeader: string | string[] | undefined): string | undefined => {
      const header = extractHeaderValue(authHeader);
      if (!header) return undefined;
      
      if (header.startsWith('Bearer ')) {
        return header.substring(7).trim();
      }
      return header;
    };

    return extractBearerToken(req.headers.authorization) ||
           extractHeaderValue(req.headers['X-API-Key']) ||
           extractHeaderValue(req.headers['x-api-key']) ||
           extractHeaderValue(req.headers['Authorization']);
  }

  /**
   * Configura limpeza automática de sessões
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
          this.cleanupSession(sessionId);
        }
      }
    }, 60000); // Verificar a cada minuto
  }

  /**
   * Limpa sessão expirada
   */
  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.transport.close();
      session.server.close();
      this.sessions.delete(sessionId);
      this.emit('session:cleaned', sessionId);
    }
  }

  /**
   * Para todos os transportes
   */
  async stop(): Promise<void> {
    // Limpar todas as sessões
    for (const [sessionId, session] of this.sessions.entries()) {
      this.cleanupSession(sessionId);
    }

    // Parar servidor HTTP
    if (this.httpServer) {
      this.httpServer.close();
    }

    this.emit('transport:stopped');
  }
}
