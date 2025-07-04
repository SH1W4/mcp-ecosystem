import { z } from 'zod';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Schema de configuração
const ConfigSchema = z.object({
  server: z.object({
    name: z.string().default('ecosystem-mcp'),
    version: z.string().default('1.0.0'),
    mode: z.enum(['development', 'production']).default('development'),
  }),
  features: z.object({
    fileOperations: z.boolean().default(true),
    systemInfo: z.boolean().default(true),
    processManagement: z.boolean().default(true),
    aiIntegration: z.boolean().default(true),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'pretty']).default('pretty'),
  }),
  limits: z.object({
    maxFileSize: z.number().default(10 * 1024 * 1024), // 10MB
    maxConcurrentOperations: z.number().default(10),
  }),
});

// Configuração padrão
const defaultConfig = {
  server: {
    name: 'ecosystem-mcp',
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development',
  },
  features: {
    fileOperations: true,
    systemInfo: true,
    processManagement: true,
    aiIntegration: true,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024,
    maxConcurrentOperations: 10,
  },
};

// Validar e exportar configuração
export const config = ConfigSchema.parse(defaultConfig);

