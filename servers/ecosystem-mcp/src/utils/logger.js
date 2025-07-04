import winston from 'winston';
import chalk from 'chalk';
import { config } from '../config/index.js';

// Formato customizado para console
const prettyFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} `;
  
  // Colorir nível de log
  switch (level) {
    case 'error':
      msg += chalk.red(`[${level.toUpperCase()}]`);
      break;
    case 'warn':
      msg += chalk.yellow(`[${level.toUpperCase()}]`);
      break;
    case 'info':
      msg += chalk.blue(`[${level.toUpperCase()}]`);
      break;
    case 'debug':
      msg += chalk.gray(`[${level.toUpperCase()}]`);
      break;
    default:
      msg += `[${level.toUpperCase()}]`;
  }
  
  msg += ` ${message}`;
  
  // Adicionar metadata se existir
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Criar logger
export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    config.logging.format === 'pretty' ? prettyFormat : winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// Adicionar transporte de arquivo em produção
if (config.server.mode === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/ecosystem-mcp.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

