#!/usr/bin/env node

/**
 * MCP Ecosystem - Entry Point
 * 
 * Uma solução completa para desenvolvimento, gerenciamento e orquestração de servidores MCP
 * 
 * @author JX
 * @version 0.1.0
 */

import dotenv from 'dotenv';

import { Logger } from './shared/logger';
import { MCPEcosystem } from './core/ecosystem';
import { ConfigManager } from './shared/config';

// Load environment variables
dotenv.config();

const logger = Logger.getInstance();

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    logger.info('🚀 Inicializando MCP Ecosystem...');

    // Initialize configuration
    const config = ConfigManager.getInstance();
    await config.initialize();

    logger.info('📋 Configuração carregada');

    // Initialize the ecosystem
    const ecosystem = new MCPEcosystem(config.getConfig());
    await ecosystem.initialize();

    logger.info('🎯 MCP Ecosystem inicializado com sucesso');

    // Start the ecosystem
    await ecosystem.start();

    logger.info('✅ MCP Ecosystem em execução');

    // Handle graceful shutdown
    const handleShutdown = async (): Promise<void> => {
      logger.info('🛑 Iniciando shutdown do MCP Ecosystem...');
      try {
        await ecosystem.stop();
        logger.info('✅ MCP Ecosystem finalizado com sucesso');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Erro durante shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    process.on('uncaughtException', (error: Error) => {
      logger.error('❌ Uncaught Exception:', error);
      handleShutdown().catch(() => process.exit(1));
    });
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('❌ Unhandled Rejection:', reason);
      handleShutdown().catch(() => process.exit(1));
    });

  } catch (error) {
    logger.error('❌ Falha na inicialização do MCP Ecosystem:', error);
    process.exit(1);
  }
}

// Start the application only if this file is executed directly
if (require.main === module) {
  main().catch((error: Error) => {
    Logger.getInstance().error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

export { MCPEcosystem };

