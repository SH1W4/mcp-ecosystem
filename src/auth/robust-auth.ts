/**
 * Robust Authentication and Error Handling System
 * Baseado nos padrões do Context7
 * Implementa autenticação flexível e tratamento de erros granular
 */

import { EventEmitter } from 'events';
import { createHash, createHmac, randomBytes } from 'crypto';
import { z } from 'zod';

export interface AuthConfig {
  apiKeySecret: string;
  sessionSecret: string;
  tokenExpiry: number; // em ms
  maxRequestsPerMinute: number;
  enableRateLimit: boolean;
  enableEncryption: boolean;
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  permissions?: string[];
  error?: string;
  errorCode?: string;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: Date;
}

/**
 * Sistema de autenticação robusto inspirado no Context7
 */
export class RobustAuthSystem extends EventEmitter {
  private config: AuthConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private activeSessions: Map<string, { userId: string; expiresAt: number }> = new Map();
  private errorCounts: Map<string, number> = new Map();

  constructor(config: Partial<AuthConfig> = {}) {
    super();
    
    this.config = {
      apiKeySecret: process.env.API_KEY_SECRET || 'default-secret-key',
      sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
      tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
      maxRequestsPerMinute: 100,
      enableRateLimit: true,
      enableEncryption: true,
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Valida chave API (baseado no padrão Context7)
   */
  validateApiKey(apiKey: string): AuthResult {
    try {
      if (!apiKey) {
        return this.createError('MISSING_API_KEY', 'Chave API não fornecida', 401);
      }

      // Verificar formato básico
      if (!this.isValidApiKeyFormat(apiKey)) {
        return this.createError('INVALID_API_KEY_FORMAT', 'Formato de chave API inválido', 401);
      }

      // Verificar se é uma chave válida (implementação simplificada)
      if (!this.isValidApiKey(apiKey)) {
        return this.createError('INVALID_API_KEY', 'Chave API inválida', 401);
      }

      // Verificar rate limit
      if (this.config.enableRateLimit) {
        const rateLimitResult = this.checkRateLimit(apiKey);
        if (!rateLimitResult.success) {
          return this.createError('RATE_LIMIT_EXCEEDED', 'Limite de requisições excedido', 429);
        }
      }

      this.emit('auth:success', { apiKey, timestamp: new Date() });
      
      return {
        success: true,
        userId: this.extractUserIdFromApiKey(apiKey),
        permissions: this.getPermissionsForApiKey(apiKey)
      };
    } catch (error) {
      return this.createError('AUTH_VALIDATION_ERROR', `Erro na validação: ${error}`, 500);
    }
  }

  /**
   * Valida token de sessão
   */
  validateSessionToken(token: string): AuthResult {
    try {
      if (!token) {
        return this.createError('MISSING_SESSION_TOKEN', 'Token de sessão não fornecido', 401);
      }

      const session = this.activeSessions.get(token);
      if (!session) {
        return this.createError('INVALID_SESSION_TOKEN', 'Token de sessão inválido', 401);
      }

      if (Date.now() > session.expiresAt) {
        this.activeSessions.delete(token);
        return this.createError('SESSION_EXPIRED', 'Sessão expirada', 401);
      }

      this.emit('session:validated', { token, userId: session.userId });
      
      return {
        success: true,
        userId: session.userId,
        permissions: this.getPermissionsForUser(session.userId)
      };
    } catch (error) {
      return this.createError('SESSION_VALIDATION_ERROR', `Erro na validação da sessão: ${error}`, 500);
    }
  }

  /**
   * Cria nova sessão
   */
  createSession(userId: string): { token: string; expiresAt: number } {
    const token = this.generateSessionToken();
    const expiresAt = Date.now() + this.config.tokenExpiry;
    
    this.activeSessions.set(token, { userId, expiresAt });
    
    this.emit('session:created', { token, userId, expiresAt });
    
    return { token, expiresAt };
  }

  /**
   * Invalida sessão
   */
  invalidateSession(token: string): boolean {
    const existed = this.activeSessions.has(token);
    this.activeSessions.delete(token);
    
    if (existed) {
      this.emit('session:invalidated', { token });
    }
    
    return existed;
  }

  /**
   * Verifica rate limit
   */
  checkRateLimit(identifier: string): { success: boolean; info?: RateLimitInfo } {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${identifier}:${minute}`;
    
    const current = this.rateLimitStore.get(key);
    
    if (!current) {
      this.rateLimitStore.set(key, { count: 1, resetTime: (minute + 1) * 60000 });
      return { success: true };
    }
    
    if (current.count >= this.config.maxRequestsPerMinute) {
      return {
        success: false,
        info: {
          remaining: 0,
          resetTime: current.resetTime,
          limit: this.config.maxRequestsPerMinute
        }
      };
    }
    
    current.count++;
    return {
      success: true,
      info: {
        remaining: this.config.maxRequestsPerMinute - current.count,
        resetTime: current.resetTime,
        limit: this.config.maxRequestsPerMinute
      }
    };
  }

  /**
   * Cria erro estruturado
   */
  createError(code: string, message: string, statusCode: number, details?: any): AuthResult {
    const errorInfo: ErrorInfo = {
      code,
      message,
      statusCode,
      details,
      timestamp: new Date()
    };

    // Incrementar contador de erros
    const currentCount = this.errorCounts.get(code) || 0;
    this.errorCounts.set(code, currentCount + 1);

    this.emit('auth:error', errorInfo);
    
    return {
      success: false,
      error: message,
      errorCode: code
    };
  }

  /**
   * Trata erros HTTP de forma granular (baseado no Context7)
   */
  handleHttpError(error: any): ErrorInfo {
    if (error.code === 'ENOTFOUND') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Erro de rede: não foi possível conectar ao servidor',
        statusCode: 503,
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }

    if (error.code === 'ECONNREFUSED') {
      return {
        code: 'CONNECTION_REFUSED',
        message: 'Conexão recusada pelo servidor',
        statusCode: 503,
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }

    if (error.code === 'ETIMEDOUT') {
      return {
        code: 'TIMEOUT',
        message: 'Timeout na requisição',
        statusCode: 504,
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }

    if (error.status === 429) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente mais tarde',
        statusCode: 429,
        details: { retryAfter: error.headers?.['retry-after'] },
        timestamp: new Date()
      };
    }

    if (error.status === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Não autorizado. Verifique suas credenciais',
        statusCode: 401,
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }

    if (error.status === 404) {
      return {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado',
        statusCode: 404,
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }

    // Erro genérico
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Erro interno do servidor',
      statusCode: 500,
      details: { originalError: error.message },
      timestamp: new Date()
    };
  }

  /**
   * Valida formato da chave API
   */
  private isValidApiKeyFormat(apiKey: string): boolean {
    // Implementação básica - pode ser expandida
    return apiKey.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  /**
   * Valida chave API (implementação simplificada)
   */
  private isValidApiKey(apiKey: string): boolean {
    // Em produção, isso seria uma consulta ao banco de dados
    // Por agora, aceita qualquer chave com formato válido
    return this.isValidApiKeyFormat(apiKey);
  }

  /**
   * Extrai ID do usuário da chave API
   */
  private extractUserIdFromApiKey(apiKey: string): string {
    // Implementação simplificada
    return createHash('md5').update(apiKey).digest('hex').substring(0, 8);
  }

  /**
   * Obtém permissões da chave API
   */
  private getPermissionsForApiKey(apiKey: string): string[] {
    // Implementação simplificada
    return ['read', 'write', 'admin'];
  }

  /**
   * Obtém permissões do usuário
   */
  private getPermissionsForUser(userId: string): string[] {
    // Implementação simplificada
    return ['read', 'write'];
  }

  /**
   * Gera token de sessão
   */
  private generateSessionToken(): string {
    const randomPart = randomBytes(32).toString('hex');
    const timestamp = Date.now().toString(16);
    const hmac = createHmac('sha256', this.config.sessionSecret)
      .update(randomPart + timestamp)
      .digest('hex');
    
    return `${randomPart}.${timestamp}.${hmac}`;
  }

  /**
   * Inicia timer de limpeza
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
      this.cleanupRateLimitStore();
    }, 60000); // Limpeza a cada minuto
  }

  /**
   * Limpa sessões expiradas
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, session] of this.activeSessions.entries()) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.emit('sessions:cleaned', { count: cleaned });
    }
  }

  /**
   * Limpa store de rate limit
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    
    for (const [key, data] of this.rateLimitStore.entries()) {
      if (data.resetTime < now) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Obtém estatísticas de autenticação
   */
  getAuthStats(): {
    activeSessions: number;
    rateLimitEntries: number;
    errorCounts: Record<string, number>;
    config: AuthConfig;
  } {
    return {
      activeSessions: this.activeSessions.size,
      rateLimitEntries: this.rateLimitStore.size,
      errorCounts: Object.fromEntries(this.errorCounts),
      config: this.config
    };
  }

  /**
   * Destrói o sistema de autenticação
   */
  destroy(): void {
    this.activeSessions.clear();
    this.rateLimitStore.clear();
    this.errorCounts.clear();
    this.emit('auth:destroyed');
  }
}

/**
 * Middleware de autenticação para requisições HTTP
 */
export function createAuthMiddleware(authSystem: RobustAuthSystem) {
  return (req: any, res: any, next: any) => {
    const apiKey = extractApiKeyFromRequest(req);
    
    if (apiKey) {
      const result = authSystem.validateApiKey(apiKey);
      if (!result.success) {
        res.status(result.errorCode === 'RATE_LIMIT_EXCEEDED' ? 429 : 401)
           .json({ error: result.error, code: result.errorCode });
        return;
      }
      req.user = { userId: result.userId, permissions: result.permissions };
    }
    
    next();
  };
}

/**
 * Extrai chave API da requisição (baseado no Context7)
 */
function extractApiKeyFromRequest(req: any): string | undefined {
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
         extractHeaderValue(req.headers['Context7-API-Key']) ||
         extractHeaderValue(req.headers['context7-api-key']);
}
