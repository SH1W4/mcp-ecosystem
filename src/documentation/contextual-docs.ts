/**
 * Contextual Documentation System
 * Baseado nos padrões do Context7
 * Implementa busca e recuperação de documentação contextual
 */

import { EventEmitter } from 'events';
import { SmartCache, DocumentationCache, SearchCache } from '../cache/smart-cache.js';
import { z } from 'zod';

export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  documentationUrl: string;
  trustScore: number;
  lastUpdated: Date;
  tags: string[];
  codeSnippets: number;
}

export interface DocumentationResult {
  content: string;
  source: string;
  relevance: number;
  metadata: {
    library: string;
    version: string;
    topic: string;
    tokens: number;
    lastUpdated: Date;
  };
}

export interface SearchOptions {
  query: string;
  context?: string;
  tokens?: number;
  libraries?: string[];
  topics?: string[];
  topic?: string;
  minRelevance?: number;
}

export interface DocumentationProvider {
  name: string;
  searchLibraries(query: string): Promise<LibraryInfo[]>;
  getDocumentation(libraryId: string, options: SearchOptions): Promise<DocumentationResult | null>;
  isAvailable(): Promise<boolean>;
}

/**
 * Sistema de documentação contextual inspirado no Context7
 */
export class ContextualDocumentationSystem extends EventEmitter {
  private providers: Map<string, DocumentationProvider> = new Map();
  private docCache: DocumentationCache;
  private searchCache: SearchCache;
  private libraryIndex: Map<string, LibraryInfo> = new Map();

  constructor() {
    super();
    this.docCache = new DocumentationCache();
    this.searchCache = new SearchCache();
    
    this.setupCacheEvents();
  }

  /**
   * Registra provedor de documentação
   */
  registerProvider(provider: DocumentationProvider): void {
    this.providers.set(provider.name, provider);
    this.emit('provider:registered', { name: provider.name });
  }

  /**
   * Busca bibliotecas por query
   */
  async searchLibraries(query: string, providerName?: string): Promise<LibraryInfo[]> {
    try {
      // Verificar cache primeiro
      const cachedResult = this.searchCache.getSearchResult(query);
      if (cachedResult) {
        this.emit('search:cache_hit', { query, provider: providerName });
        return cachedResult;
      }

      const results: LibraryInfo[] = [];
      
      if (providerName) {
        const provider = this.providers.get(providerName);
        if (provider) {
          const providerResults = await provider.searchLibraries(query);
          results.push(...providerResults);
        }
      } else {
        // Buscar em todos os provedores
        for (const provider of this.providers.values()) {
          try {
            const providerResults = await provider.searchLibraries(query);
            results.push(...providerResults);
          } catch (error) {
            console.error(`Erro ao buscar em ${provider.name}:`, error);
          }
        }
      }

      // Remover duplicatas e ordenar por relevância
      const uniqueResults = this.deduplicateResults(results);
      const sortedResults = this.sortByRelevance(uniqueResults, query);

      // Cachear resultado
      this.searchCache.setSearchResult(query, sortedResults);

      this.emit('search:completed', { 
        query, 
        resultsCount: sortedResults.length,
        provider: providerName 
      });

      return sortedResults;
    } catch (error) {
      this.emit('search:error', { query, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Obtém documentação contextual
   */
  async getDocumentation(
    libraryId: string, 
    options: SearchOptions
  ): Promise<DocumentationResult | null> {
    try {
      const cacheKey = `${libraryId}:${options.topic || 'general'}`;
      
      // Verificar cache primeiro
      const cachedDoc = this.docCache.getDocumentation(libraryId, options.topic || 'general');
      if (cachedDoc) {
        this.emit('docs:cache_hit', { libraryId, topic: options.topic });
        return this.parseCachedDocumentation(cachedDoc);
      }

      // Buscar em provedores
      let bestResult: DocumentationResult | null = null;
      let bestRelevance = 0;

      for (const provider of this.providers.values()) {
        try {
          const result = await provider.getDocumentation(libraryId, options);
          if (result && result.relevance > bestRelevance) {
            bestResult = result;
            bestRelevance = result.relevance;
          }
        } catch (error) {
          console.error(`Erro ao obter documentação de ${provider.name}:`, error);
        }
      }

      if (bestResult) {
        // Cachear resultado
        this.docCache.setDocumentation(
          libraryId, 
          options.topic || 'general', 
          JSON.stringify(bestResult)
        );

        this.emit('docs:retrieved', { 
          libraryId, 
          topic: options.topic,
          relevance: bestResult.relevance 
        });
      }

      return bestResult;
    } catch (error) {
      this.emit('docs:error', { libraryId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Busca documentação contextual baseada em contexto do projeto
   */
  async searchContextualDocumentation(
    context: string,
    options: Partial<SearchOptions> = {}
  ): Promise<DocumentationResult[]> {
    try {
      // Extrair palavras-chave do contexto
      const keywords = this.extractKeywords(context);
      
      // Buscar bibliotecas relevantes
      const libraries = await this.searchLibraries(keywords.join(' '));
      
      // Buscar documentação para cada biblioteca
      const results: DocumentationResult[] = [];
      
      for (const library of libraries.slice(0, 5)) { // Limitar a 5 bibliotecas
        try {
          const doc = await this.getDocumentation(library.id, {
            query: keywords.join(' '),
            context,
            tokens: options.tokens || 5000,
            minRelevance: 0.7
          });
          
          if (doc) {
            results.push(doc);
          }
        } catch (error) {
          console.error(`Erro ao obter documentação de ${library.name}:`, error);
        }
      }

      // Ordenar por relevância
      const sortedResults = results.sort((a, b) => b.relevance - a.relevance);

      this.emit('contextual:search_completed', { 
        context, 
        resultsCount: sortedResults.length 
      });

      return sortedResults;
    } catch (error) {
      this.emit('contextual:error', { context, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Obtém sugestões de documentação baseadas no contexto atual
   */
  async getContextualSuggestions(
    currentCode: string,
    cursorPosition: number,
    fileType: string
  ): Promise<DocumentationResult[]> {
    try {
      // Analisar contexto do código
      const context = this.analyzeCodeContext(currentCode, cursorPosition, fileType);
      
      // Buscar documentação relevante
      const results = await this.searchContextualDocumentation(context, {
        tokens: 3000,
        minRelevance: 0.8
      });

      this.emit('suggestions:generated', { 
        context, 
        suggestionsCount: results.length 
      });

      return results;
    } catch (error) {
      this.emit('suggestions:error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Invalida cache de documentação
   */
  invalidateCache(libraryId?: string): void {
    if (libraryId) {
      this.docCache.invalidateLibrary(libraryId);
      this.emit('cache:invalidated', { libraryId });
    } else {
      this.docCache.clear();
      this.searchCache.clear();
      this.emit('cache:cleared');
    }
  }

  /**
   * Obtém estatísticas do sistema
   */
  getStats(): {
    providers: number;
    cachedDocs: number;
    cachedSearches: number;
    libraryIndex: number;
    cacheMetrics: any;
  } {
    return {
      providers: this.providers.size,
      cachedDocs: this.docCache.getMetrics().entryCount,
      cachedSearches: this.searchCache.getMetrics().entryCount,
      libraryIndex: this.libraryIndex.size,
      cacheMetrics: {
        docCache: this.docCache.getMetrics(),
        searchCache: this.searchCache.getMetrics()
      }
    };
  }

  /**
   * Configura eventos do cache
   */
  private setupCacheEvents(): void {
    this.docCache.on('cache:hit', (data) => {
      this.emit('cache:doc_hit', data);
    });

    this.searchCache.on('cache:hit', (data) => {
      this.emit('cache:search_hit', data);
    });
  }

  /**
   * Remove duplicatas dos resultados
   */
  private deduplicateResults(results: LibraryInfo[]): LibraryInfo[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.id)) {
        return false;
      }
      seen.add(result.id);
      return true;
    });
  }

  /**
   * Ordena resultados por relevância
   */
  private sortByRelevance(results: LibraryInfo[], query: string): LibraryInfo[] {
    const queryLower = query.toLowerCase();
    
    return results.sort((a, b) => {
      // Priorizar correspondências exatas no nome
      const aNameMatch = a.name.toLowerCase().includes(queryLower);
      const bNameMatch = b.name.toLowerCase().includes(queryLower);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Priorizar por trust score
      if (a.trustScore !== b.trustScore) {
        return b.trustScore - a.trustScore;
      }
      
      // Priorizar por número de snippets
      return b.codeSnippets - a.codeSnippets;
    });
  }

  /**
   * Extrai palavras-chave do contexto
   */
  private extractKeywords(context: string): string[] {
    // Implementação simplificada - pode ser expandida com NLP
    const words = context
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Remover palavras comuns
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return words.filter(word => !stopWords.has(word));
  }

  /**
   * Analisa contexto do código
   */
  private analyzeCodeContext(code: string, cursorPosition: number, fileType: string): string {
    // Extrair contexto ao redor do cursor
    const lines = code.split('\n');
    const cursorLine = this.getLineFromPosition(code, cursorPosition);
    
    const startLine = Math.max(0, cursorLine - 5);
    const endLine = Math.min(lines.length - 1, cursorLine + 5);
    
    const contextLines = lines.slice(startLine, endLine + 1);
    const context = contextLines.join('\n');
    
    // Adicionar informações do tipo de arquivo
    return `${fileType} context:\n${context}`;
  }

  /**
   * Obtém linha a partir da posição do cursor
   */
  private getLineFromPosition(code: string, position: number): number {
    return code.substring(0, position).split('\n').length - 1;
  }

  /**
   * Parseia documentação do cache
   */
  private parseCachedDocumentation(cached: string): DocumentationResult {
    try {
      return JSON.parse(cached);
    } catch {
      // Fallback para texto simples
      return {
        content: cached,
        source: 'cache',
        relevance: 1.0,
        metadata: {
          library: 'unknown',
          version: 'unknown',
          topic: 'general',
          tokens: cached.length,
          lastUpdated: new Date()
        }
      };
    }
  }
}

/**
 * Provedor de documentação Context7
 */
export class Context7Provider implements DocumentationProvider {
  name = 'context7';
  private baseUrl = 'https://context7.com/api';

  async searchLibraries(query: string): Promise<LibraryInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return (data as any).results.map((result: any) => ({
        id: result.id,
        name: result.title,
        description: result.description,
        version: result.branch || 'latest',
        documentationUrl: `https://context7.com${result.id}`,
        trustScore: result.trustScore || 5,
        lastUpdated: new Date(result.lastUpdateDate),
        tags: result.tags || [],
        codeSnippets: result.totalSnippets || 0
      }));
    } catch (error) {
      console.error('Erro ao buscar bibliotecas no Context7:', error);
      return [];
    }
  }

  async getDocumentation(libraryId: string, options: SearchOptions): Promise<DocumentationResult | null> {
    try {
      const url = new URL(`${this.baseUrl}/v1/${libraryId.replace('/', '')}`);
      if (options.tokens) url.searchParams.set('tokens', options.tokens.toString());
      if (options.topic) url.searchParams.set('topic', options.topic);
      url.searchParams.set('type', 'txt');

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      if (!content || content === 'No content available') {
        return null;
      }

      return {
        content,
        source: 'context7',
        relevance: this.calculateRelevance(content, options.query),
        metadata: {
          library: libraryId,
          version: 'latest',
          topic: options.topic || 'general',
          tokens: content.length,
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      console.error('Erro ao obter documentação do Context7:', error);
      return null;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private calculateRelevance(content: string, query: string): number {
    if (!query) return 1.0;
    
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    
    const queryWords = queryLower.split(/\s+/);
    const matches = queryWords.filter(word => contentLower.includes(word)).length;
    
    return matches / queryWords.length;
  }
}
