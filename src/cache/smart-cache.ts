/**
 * Smart Cache System for MCP Ecosystem
 * Baseado nos padrões de performance do Context7
 * Implementa cache inteligente com TTL, invalidação e métricas
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  size: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  entryCount: number;
  hitRate: number;
}

export interface CacheConfig {
  maxSize: number; // Tamanho máximo em bytes
  maxEntries: number; // Número máximo de entradas
  defaultTtl: number; // TTL padrão em ms
  cleanupInterval: number; // Intervalo de limpeza em ms
  enableMetrics: boolean;
}

/**
 * Sistema de cache inteligente inspirado no Context7
 * Implementa estratégias avançadas de cache para performance
 */
export class SmartCache<T = any> extends EventEmitter {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private metrics: CacheMetrics;
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    super();
    
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 1000,
      defaultTtl: 5 * 60 * 1000, // 5 minutos
      cleanupInterval: 60 * 1000, // 1 minuto
      enableMetrics: true,
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      entryCount: 0,
      hitRate: 0
    };

    this.startCleanupTimer();
  }

  /**
   * Gera chave de cache baseada em parâmetros
   */
  public generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    const paramString = JSON.stringify(sortedParams);
    const hash = createHash('md5').update(paramString).digest('hex');
    return `${prefix}:${hash}`;
  }

  /**
   * Calcula tamanho aproximado de uma entrada
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Aproximação em bytes
    } catch {
      return 1024; // Tamanho padrão se não conseguir calcular
    }
  }

  /**
   * Armazena dados no cache
   */
  set(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
    } = {}
  ): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTtl,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags: options.tags || [],
      size: this.calculateSize(data)
    };

    // Verificar se precisa evictar entradas
    this.evictIfNeeded(entry.size);

    // Remover entrada existente se houver
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.metrics.totalSize -= existingEntry.size;
    }

    this.cache.set(key, entry);
    this.metrics.totalSize += entry.size;
    this.metrics.entryCount = this.cache.size;

    this.emit('cache:set', { key, size: entry.size, tags: entry.tags });
  }

  /**
   * Recupera dados do cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.metrics.hits++;
    this.updateHitRate();

    this.emit('cache:hit', { key, accessCount: entry.accessCount });
    return entry.data;
  }

  /**
   * Busca por tags
   */
  getByTags(tags: string[]): Array<{ key: string; data: T }> {
    const results: Array<{ key: string; data: T }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        if (Date.now() - entry.timestamp <= entry.ttl) {
          entry.accessCount++;
          entry.lastAccessed = Date.now();
          results.push({ key, data: entry.data });
        }
      }
    }

    return results;
  }

  /**
   * Remove entrada do cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.metrics.totalSize -= entry.size;
      this.metrics.entryCount = this.cache.size - 1;
      this.cache.delete(key);
      this.emit('cache:delete', { key, size: entry.size });
      return true;
    }
    return false;
  }

  /**
   * Invalida entradas por tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.delete(key);
        invalidated++;
      }
    }

    this.emit('cache:invalidate', { tags, count: invalidated });
    return invalidated;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const entryCount = this.cache.size;
    this.cache.clear();
    this.metrics.totalSize = 0;
    this.metrics.entryCount = 0;
    this.emit('cache:clear', { entryCount });
  }

  /**
   * Verifica se precisa evictar entradas
   */
  private evictIfNeeded(newEntrySize: number): void {
    // Verificar limite de tamanho
    if (this.metrics.totalSize + newEntrySize > this.config.maxSize) {
      this.evictBySize(newEntrySize);
    }

    // Verificar limite de entradas
    if (this.cache.size >= this.config.maxEntries) {
      this.evictByCount();
    }
  }

  /**
   * Evicta entradas por tamanho (LRU)
   */
  private evictBySize(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);

    let freedSpace = 0;
    for (const { key, entry } of entries) {
      if (freedSpace >= requiredSpace) break;
      
      this.delete(key);
      freedSpace += entry.size;
      this.metrics.evictions++;
    }
  }

  /**
   * Evicta entradas por contagem (LRU)
   */
  private evictByCount(): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);

    const toEvict = Math.ceil(this.cache.size * 0.1); // Evictar 10%
    for (let i = 0; i < toEvict; i++) {
      const { key } = entries[i];
      this.delete(key);
      this.metrics.evictions++;
    }
  }

  /**
   * Atualiza taxa de acerto
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  /**
   * Inicia timer de limpeza
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.emit('cache:cleanup', { cleaned, remaining: this.cache.size });
    }
  }

  /**
   * Obtém métricas do cache
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtém estatísticas detalhadas
   */
  getStats(): {
    metrics: CacheMetrics;
    config: CacheConfig;
    entries: Array<{
      key: string;
      age: number;
      accessCount: number;
      size: number;
      tags: string[];
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      accessCount: entry.accessCount,
      size: entry.size,
      tags: entry.tags
    }));

    return {
      metrics: this.getMetrics(),
      config: this.config,
      entries
    };
  }

  /**
   * Destrói o cache
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    this.emit('cache:destroyed');
  }
}

/**
 * Cache especializado para documentação contextual
 */
export class DocumentationCache extends SmartCache<string> {
  constructor() {
    super({
      maxSize: 50 * 1024 * 1024, // 50MB para documentação
      maxEntries: 500,
      defaultTtl: 10 * 60 * 1000, // 10 minutos para docs
      enableMetrics: true
    });
  }

  /**
   * Armazena documentação com tags contextuais
   */
  setDocumentation(
    libraryId: string,
    topic: string,
    content: string,
    ttl?: number
  ): void {
    const key = this.generateKey('doc', { libraryId, topic });
    const tags = ['documentation', libraryId, topic];
    
    this.set(key, content, { ttl, tags });
  }

  /**
   * Recupera documentação
   */
  getDocumentation(libraryId: string, topic: string): string | null {
    const key = this.generateKey('doc', { libraryId, topic });
    return this.get(key);
  }

  /**
   * Invalida documentação de uma biblioteca
   */
  invalidateLibrary(libraryId: string): number {
    return this.invalidateByTags(['documentation', libraryId]);
  }
}

/**
 * Cache especializado para resultados de busca
 */
export class SearchCache extends SmartCache<any> {
  constructor() {
    super({
      maxSize: 20 * 1024 * 1024, // 20MB para buscas
      maxEntries: 200,
      defaultTtl: 2 * 60 * 1000, // 2 minutos para buscas
      enableMetrics: true
    });
  }

  /**
   * Armazena resultado de busca
   */
  setSearchResult(query: string, results: any[], ttl?: number): void {
    const key = this.generateKey('search', { query });
    const tags = ['search', query.toLowerCase()];
    
    this.set(key, results, { ttl, tags });
  }

  /**
   * Recupera resultado de busca
   */
  getSearchResult(query: string): any[] | null {
    const key = this.generateKey('search', { query });
    return this.get(key);
  }
}
