/**
 * Core Types for MCP Ecosystem
 */

export interface ProjectConfig {
  id: string;
  name: string;
  path: string;
  language: 'typescript' | 'python' | 'csharp' | 'java' | 'mixed';
  framework?: string;
  vscode?: {
    extensions: string[];
    settings: Record<string, any>;
    snippets: any[];
  };
  git?: {
    remote?: string;
    branch?: string;
    hooks?: Record<string, string>;
  };
  node?: {
    version?: string;
    packageManager?: 'npm' | 'yarn' | 'pnpm';
  };
  python?: {
    version?: string;
    venv?: string;
    requirements?: string;
  };
  docker?: {
    compose?: string;
    dockerfile?: string;
  };
  testing?: {
    framework?: string;
    coverage?: number;
  };
  building?: {
    command?: string;
    outputDir?: string;
  };
  deployment?: {
    provider?: string;
    config?: any;
  };
}

export interface DevelopmentEnvironment {
  editors: {
    vscode?: VSCodeConfig;
    intellij?: IntelliJConfig;
  };
  tools: {
    git?: any;
    node?: any;
    python?: any;
    docker?: any;
  };
  automation: {
    tests?: any;
    builds?: any;
    deploys?: any;
  };
}

export interface VSCodeConfig {
  extensions: string[];
  settings: Record<string, any>;
  snippets: any[];
}

export interface IntelliJConfig {
  plugins: string[];
  settings: Record<string, any>;
}

export interface DevCapabilities {
  languages: {
    typescript: boolean;
    python: boolean;
    csharp: boolean;
    [key: string]: boolean;
  };
  tools: {
    testing: boolean;
    debugging: boolean;
    profiling: boolean;
    monitoring: boolean;
  };
  integrations: {
    vscode: boolean;
    git: boolean;
    docker: boolean;
    databases: string[];
  };
}

export interface EnvironmentAutomation {
  setup: {
    installDependencies(): Promise<void>;
    configureEditor(): Promise<void>;
    setupGitHooks(): Promise<void>;
  };
  maintenance: {
    updateDependencies(): Promise<void>;
    cleanupCache(): Promise<void>;
    backupConfig(): Promise<void>;
  };
  development: {
    startDevServer(): Promise<void>;
    runTests(): Promise<{ success: boolean; coverage: number }>;
    lint(): Promise<{ success: boolean; errors: any[] }>;
  };
}

export interface MetricsCollector {
  collectEnvironmentMetrics(): void;
  collectDevelopmentMetrics(): void;
  collectPerformanceMetrics(): void;
}

export interface ToolingIntegration {
  name: string;
  type: 'editor' | 'build' | 'test' | 'deploy' | 'monitor';
  config: any;
  enabled: boolean;
}

// Module Registry
export interface MCPModule {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  exports: any;
}

export interface ModuleRegistry {
  register(module: MCPModule): void;
  get(name: string): MCPModule | undefined;
  list(): MCPModule[];
  unregister(name: string): void;
}
