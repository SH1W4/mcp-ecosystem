// SAGE Integration - WARP Rules Client
// Based on WARP_SAGE_INTEGRATION warp_rules_client

import { EventEmitter } from 'events';
import { WarpConfig, ClientCredentials, DEFAULT_WARP_CONFIG } from '../types/Config';
import { Rule, RuleSet, RuleResult } from '../types/Rule';
import { AgentContext } from '../types/AgentContext';
import { WarpCache } from '../utils/Cache';
import { Logger } from '../utils/Logger';

export interface AuthToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  expires_at: number;
}

export interface WarpAPIResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  etag?: string;
  version?: string;
}

export class WarpRulesClient extends EventEmitter {
  private config: WarpConfig;
  private token: AuthToken | null = null;
  private cache: WarpCache;
  private logger: Logger;
  private isInitialized = false;
  private monitoringActive = false;
  private monitoringAbortController?: AbortController;

  constructor(config: WarpConfig) {
    super();
    this.config = { ...DEFAULT_WARP_CONFIG, ...config };
    this.cache = new WarpCache(this.config.cache_settings!);
    this.logger = new Logger('WarpRulesClient');
  }

  /**
   * Initialize the client - authenticate and setup monitoring
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing WARP Rules Client');

      if (this.config.credentials) {
        await this.authenticate();
      }

      this.isInitialized = true;
      this.emit('initialized');

      this.logger.info('WARP Rules Client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize WARP Rules Client', error);
      throw error;
    }
  }

  /**
   * Authenticate with WARP Rules API
   */
  private async authenticate(): Promise<void> {
    if (!this.config.credentials) {
      throw new Error('No credentials provided for authentication');
    }

    const response = await this.makeRequest<AuthToken>('/api/rules/v1/token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: this.config.credentials.client_id,
        client_secret: this.config.credentials.client_secret,
        username: this.config.credentials.username,
        password: this.config.credentials.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data) {
      this.token = {
        ...response.data,
        expires_at: Date.now() + response.data.expires_in * 1000,
      };
      this.logger.info('Authentication successful');
    } else {
      throw new Error(`Authentication failed: ${response.error}`);
    }
  }

  /**
   * Check if token needs refresh
   */
  private needsTokenRefresh(): boolean {
    if (!this.token) return true;

    const threshold = this.config.security?.token_refresh_threshold_ms || 300000;
    return this.token.expires_at - Date.now() < threshold;
  }

  /**
   * Refresh authentication token if needed
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.needsTokenRefresh()) {
      await this.authenticate();
    }
  }

  /**
   * Fetch rules from WARP API with caching support
   */
  async fetchRules(useCache = true): Promise<RuleSet> {
    await this.ensureAuthenticated();

    const cacheKey = 'rules_set';

    if (useCache && this.config.cache_settings?.enabled) {
      const cached = this.cache.get<RuleSet>(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached rules');
        return cached;
      }
    }

    const headers: Record<string, string> = {
      Authorization: `${this.token!.token_type} ${this.token!.access_token}`,
    };

    // Add ETag for conditional requests
    const cachedETag = this.cache.getMetadata(cacheKey)?.etag;
    if (cachedETag) {
      headers['If-None-Match'] = cachedETag;
    }

    const response = await this.makeRequest<RuleSet>('/api/rules/v1/rules', {
      headers,
    });

    if (response.status === 304) {
      // Not modified, return cached version
      const cached = this.cache.get<RuleSet>(cacheKey);
      if (cached) {
        this.logger.debug('Rules not modified, returning cached version');
        return cached;
      }
    }

    if (response.data) {
      // Cache the response with ETag
      if (this.config.cache_settings?.enabled) {
        this.cache.set(cacheKey, response.data, {
          etag: response.etag,
          version: response.version,
        });
      }

      this.logger.info(`Fetched ${response.data.count} rules from API`);
      return response.data;
    }

    throw new Error(`Failed to fetch rules: ${response.error}`);
  }

  /**
   * Fetch a specific rule by ID
   */
  async fetchRule(ruleId: string): Promise<Rule> {
    await this.ensureAuthenticated();

    const response = await this.makeRequest<Rule>(`/api/rules/v1/rules/${ruleId}`, {
      headers: {
        Authorization: `${this.token!.token_type} ${this.token!.access_token}`,
      },
    });

    if (response.data) {
      return response.data;
    }

    throw new Error(`Failed to fetch rule ${ruleId}: ${response.error}`);
  }

  /**
   * Send rule application results back to WARP API
   */
  async sendResults(results: RuleResult[], agentContext: AgentContext): Promise<void> {
    await this.ensureAuthenticated();

    const payload = {
      results,
      agent_info: {
        agent_id: agentContext.agent_id,
        session_id: agentContext.session_id,
        environment: agentContext.environment,
        timestamp: new Date().toISOString(),
        context_version: agentContext.metadata.version,
      },
    };

    const response = await this.makeRequest('/api/rules/v1/results', {
      method: 'POST',
      headers: {
        Authorization: `${this.token!.token_type} ${this.token!.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status >= 400) {
      throw new Error(`Failed to send results: ${response.error}`);
    }

    this.logger.info(`Sent ${results.length} rule results to WARP API`);
  }

  /**
   * Start monitoring for rule updates via Server-Sent Events
   */
  async startMonitoring(): Promise<void> {
    if (this.monitoringActive) {
      this.logger.warn('Monitoring already active');
      return;
    }

    if (!this.config.monitoring?.enabled) {
      this.logger.info('Monitoring disabled in configuration');
      return;
    }

    await this.ensureAuthenticated();

    this.monitoringActive = true;
    this.monitoringAbortController = new AbortController();

    if (this.config.monitoring.stream_type === 'sse') {
      await this.startSSEMonitoring();
    } else if (this.config.monitoring.stream_type === 'polling') {
      this.startPollingMonitoring();
    }
  }

  /**
   * Stop monitoring for rule updates
   */
  stopMonitoring(): void {
    this.monitoringActive = false;

    if (this.monitoringAbortController) {
      this.monitoringAbortController.abort();
      this.monitoringAbortController = undefined;
    }

    this.logger.info('Monitoring stopped');
  }

  /**
   * Start Server-Sent Events monitoring
   */
  private async startSSEMonitoring(): Promise<void> {
    const url = `${this.config.api_url}/api/rules/v1/rules/stream`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `${this.token!.token_type} ${this.token!.access_token}`,
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: this.monitoringAbortController!.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      this.logger.info('SSE monitoring started');
      this.emit('monitoring:started');

      const decoder = new TextDecoder();

      while (this.monitoringActive) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        this.handleSSEChunk(chunk);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.logger.error('SSE monitoring error', error);
        this.emit('monitoring:error', error);

        // Attempt reconnection if configured
        if (this.config.monitoring?.auto_reconnect) {
          setTimeout(() => this.startSSEMonitoring(), 5000);
        }
      }
    }
  }

  /**
   * Handle SSE data chunks
   */
  private handleSSEChunk(chunk: string): void {
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          this.handleRuleUpdate(data);
        } catch (error) {
          this.logger.error('Failed to parse SSE data', error);
        }
      }
    }
  }

  /**
   * Start polling-based monitoring
   */
  private startPollingMonitoring(): void {
    const interval = this.config.monitoring?.poll_interval_ms || 30000;

    const poll = async () => {
      if (!this.monitoringActive) return;

      try {
        const rules = await this.fetchRules(true);
        // Check if version changed
        const cachedVersion = this.cache.getMetadata('rules_set')?.version;
        if (cachedVersion && rules.version !== cachedVersion) {
          this.handleRuleUpdate({ type: 'rules_updated', data: rules });
        }
      } catch (error) {
        this.logger.error('Polling error', error);
      }

      if (this.monitoringActive) {
        setTimeout(poll, interval);
      }
    };

    poll();
    this.logger.info(`Polling monitoring started (interval: ${interval}ms)`);
  }

  /**
   * Handle rule update notifications
   */
  private handleRuleUpdate(update: any): void {
    this.logger.info('Received rule update', update);

    // Invalidate cache to force fresh fetch
    this.cache.delete('rules_set');

    // Emit event for listeners
    this.emit('rules:updated', update);
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<WarpAPIResponse<T>> {
    const url = `${this.config.api_url}${endpoint}`;
    const retryPolicy = this.config.retry_policy!;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryPolicy.max_retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          timeout: this.config.timeout_ms,
        });

        const result: WarpAPIResponse<T> = {
          status: response.status,
          etag: response.headers.get('ETag') || undefined,
          version: response.headers.get('X-Rules-Version') || undefined,
        };

        if (response.ok) {
          if (response.status !== 204) {
            result.data = await response.json();
          }
        } else {
          const errorText = await response.text();
          result.error = errorText || `HTTP ${response.status}`;

          // Check if we should retry this status
          if (
            retryPolicy.retry_on_status?.includes(response.status) &&
            attempt < retryPolicy.max_retries
          ) {
            await this.delay(this.calculateBackoff(attempt, retryPolicy));
            continue;
          }
        }

        return result;
      } catch (error: any) {
        lastError = error;

        if (attempt < retryPolicy.max_retries) {
          await this.delay(this.calculateBackoff(attempt, retryPolicy));
          continue;
        }
      }
    }

    return {
      status: 0,
      error: lastError?.message || 'Request failed after all retries',
    };
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoff(attempt: number, policy: any): number {
    const { backoff_strategy, base_delay_ms, max_delay_ms = 30000 } = policy;

    let delay = base_delay_ms;

    if (backoff_strategy === 'exponential') {
      delay = base_delay_ms * Math.pow(2, attempt);
    } else if (backoff_strategy === 'linear') {
      delay = base_delay_ms * (attempt + 1);
    }

    return Math.min(delay, max_delay_ms);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get client status information
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      authenticated: !!this.token,
      monitoring: this.monitoringActive,
      token_expires_at: this.token?.expires_at,
      cache_stats: this.cache.getStats(),
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopMonitoring();
    this.cache.clear();
    this.removeAllListeners();
    this.logger.info('WARP Rules Client disposed');
  }
}
