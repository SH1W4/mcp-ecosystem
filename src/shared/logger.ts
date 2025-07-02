/**
 * Intelligent Logger with AI Context
 *
 * Um sistema de logging revolucionário que não apenas registra eventos,
 * mas entende o contexto e fornece insights inteligentes sobre o sistema.
 *
 * @features
 * - Análise contextual de logs
 * - Detecção automática de padrões
 * - Sugestões proativas de otimização
 * - Correlação inteligente de eventos
 * - Alertas preditivos
 */

import winston from 'winston';
import { EventEmitter } from 'events';

export interface ILogContext {
  readonly userId?: string;
  readonly sessionId: string;
  readonly moduleId: string;
  readonly operationId?: string;
  readonly correlationId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ILogAnalytics {
  readonly pattern: string;
  readonly confidence: number;
  readonly suggestion: string;
  readonly severity: 'info' | 'warning' | 'error';
  readonly timestamp: Date;
}

export interface IIntelligentLogEntry {
  readonly level: string;
  readonly message: string;
  readonly context: ILogContext;
  readonly timestamp: Date;
  analytics?: ILogAnalytics;
  readonly stackTrace?: string;
}

/**
 * Intelligent Logger - Sistema de logging com IA contextual
 */
export class Logger extends EventEmitter {
  private static instance: Logger;
  private readonly winston: winston.Logger;
  private readonly logBuffer: IIntelligentLogEntry[] = [];
  private readonly maxBufferSize = 1000;
  private readonly analyticsEngine: LogAnalyticsEngine;

  private constructor() {
    super();
    this.winston = this.createWinstonLogger();
    this.analyticsEngine = new LogAnalyticsEngine();
    this.setupAnalytics();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log with intelligent context analysis
   */
  public info(message: string, context: Partial<ILogContext> = {}): void {
    this.log('info', message, context);
  }

  public warn(message: string, context: Partial<ILogContext> = {}): void {
    this.log('warn', message, context);
  }

  public error(
    message: string,
    error?: Error,
    context: Partial<ILogContext> = {}
  ): void {
    const fullContext = error ? { ...context, error: error.message } : context;
    this.log('error', message, fullContext, error?.stack);
  }

  public debug(message: string, context: Partial<ILogContext> = {}): void {
    this.log('debug', message, context);
  }

  /**
   * Core logging method with AI analysis
   */
  private log(
    level: string,
    message: string,
    partialContext: Partial<ILogContext>,
    stackTrace?: string
  ): void {
    const context = this.enrichContext(partialContext);
    const logEntry: IIntelligentLogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      ...(stackTrace && { stackTrace }),
    };

    // Add to buffer for analysis
    this.addToBuffer(logEntry);

    // Perform real-time analysis
    const analytics = this.analyticsEngine.analyze(logEntry, this.logBuffer);
    if (analytics) {
      logEntry.analytics = analytics;
      this.emit('analytics', analytics);
    }

    // Winston logging
    this.winston.log(level, message, {
      context,
      analytics,
      stackTrace,
    });

    // Emit events for reactive components
    this.emit('log', logEntry);
    this.emit(level, logEntry);
  }

  /**
   * Get log analytics and insights
   */
  public getAnalytics(timeWindow?: number): ILogAnalytics[] {
    return this.analyticsEngine.getInsights(this.logBuffer, timeWindow);
  }

  /**
   * Get correlated logs for debugging
   */
  public getCorrelatedLogs(correlationId: string): IIntelligentLogEntry[] {
    return this.logBuffer.filter(log => log.context.correlationId === correlationId);
  }

  /**
   * Enrich context with automatic data
   */
  private enrichContext(partial: Partial<ILogContext>): ILogContext {
    return {
      sessionId: partial.sessionId || this.generateSessionId(),
      moduleId: partial.moduleId || 'unknown',
      correlationId: partial.correlationId || this.generateCorrelationId(),
      timestamp: new Date().toISOString(),
      ...partial,
    } as ILogContext;
  }

  /**
   * Add log to circular buffer
   */
  private addToBuffer(entry: IIntelligentLogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  /**
   * Setup analytics engine listeners
   */
  private setupAnalytics(): void {
    this.on('analytics', (analytics: ILogAnalytics) => {
      if (analytics.severity === 'error') {
        this.winston.error(`🤖 AI Alert: ${analytics.suggestion}`, { analytics });
      } else if (analytics.severity === 'warning') {
        this.winston.warn(`🤖 AI Insight: ${analytics.suggestion}`, { analytics });
      }
    });
  }

  /**
   * Create Winston logger instance
   */
  private createWinstonLogger(): winston.Logger {
    return winston.createLogger({
      level: process.env['LOG_LEVEL'] || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/mcp-ecosystem.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * AI-powered log analytics engine
 */
class LogAnalyticsEngine {
  private readonly patterns: Map<string, number> = new Map();
  private readonly thresholds = {
    errorSpike: 5, // errors per minute
    performanceDrop: 1000, // ms
    unusualPattern: 0.8, // confidence threshold
  };

  /**
   * Analyze log entry and provide insights
   */
  public analyze(
    entry: IIntelligentLogEntry,
    history: IIntelligentLogEntry[]
  ): ILogAnalytics | undefined {
    // Error spike detection
    if (entry.level === 'error') {
      const recentErrors = this.getRecentErrors(history, 60000); // last minute
      if (recentErrors.length >= this.thresholds.errorSpike) {
        return {
          pattern: 'error_spike',
          confidence: 0.9,
          suggestion: `Detected ${recentErrors.length} errors in the last minute. Consider investigating the root cause.`,
          severity: 'error',
          timestamp: new Date(),
        };
      }
    }

    // Performance pattern detection
    const performanceInsight = this.analyzePerformance(entry, history);
    if (performanceInsight) {
      return performanceInsight;
    }

    // Pattern frequency analysis
    const patternInsight = this.analyzePatterns(entry, history);
    if (patternInsight) {
      return patternInsight;
    }

    return undefined;
  }

  /**
   * Get comprehensive insights
   */
  public getInsights(
    logs: IIntelligentLogEntry[],
    timeWindow = 3600000 // 1 hour
  ): ILogAnalytics[] {
    const insights: ILogAnalytics[] = [];
    const cutoff = new Date(Date.now() - timeWindow);
    const recentLogs = logs.filter(log => log.timestamp >= cutoff);

    // Error rate analysis
    const errorRate = this.calculateErrorRate(recentLogs);
    if (errorRate > 0.1) {
      insights.push({
        pattern: 'high_error_rate',
        confidence: Math.min(errorRate * 2, 1),
        suggestion: `Error rate is ${(errorRate * 100).toFixed(1)}%. Consider reviewing error logs.`,
        severity: errorRate > 0.3 ? 'error' : 'warning',
        timestamp: new Date(),
      });
    }

    return insights;
  }

  private getRecentErrors(
    history: IIntelligentLogEntry[],
    timeWindow: number
  ): IIntelligentLogEntry[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return history.filter(log => log.level === 'error' && log.timestamp >= cutoff);
  }

  private analyzePerformance(
    entry: IIntelligentLogEntry,
    _history: IIntelligentLogEntry[]
  ): ILogAnalytics | undefined {
    // Look for performance-related keywords
    if (
      entry.message.toLowerCase().includes('slow') ||
      entry.message.toLowerCase().includes('timeout') ||
      entry.message.toLowerCase().includes('performance')
    ) {
      return {
        pattern: 'performance_issue',
        confidence: 0.8,
        suggestion: 'Performance issue detected. Consider profiling the operation.',
        severity: 'warning',
        timestamp: new Date(),
      };
    }

    return undefined;
  }

  private analyzePatterns(
    entry: IIntelligentLogEntry,
    _history: IIntelligentLogEntry[]
  ): ILogAnalytics | undefined {
    const messageKey = entry.message.substring(0, 50); // First 50 chars
    const count = (this.patterns.get(messageKey) || 0) + 1;
    this.patterns.set(messageKey, count);

    if (count >= 10) {
      return {
        pattern: 'repeated_message',
        confidence: Math.min(count / 20, 1),
        suggestion: `Message pattern repeated ${count} times. Consider investigating the source.`,
        severity: count > 20 ? 'warning' : 'info',
        timestamp: new Date(),
      };
    }

    return undefined;
  }

  private calculateErrorRate(logs: IIntelligentLogEntry[]): number {
    if (logs.length === 0) return 0;
    const errorCount = logs.filter(log => log.level === 'error').length;
    return errorCount / logs.length;
  }
}
