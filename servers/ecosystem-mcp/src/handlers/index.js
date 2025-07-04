import { setupToolHandlers } from './tools.js';
import { setupResourceHandlers } from './resources.js';
import { setupPromptHandlers } from './prompts.js';
import { logger } from '../utils/logger.js';

export async function setupHandlers(server) {
  logger.info('Setting up handlers...');
  
  try {
    // Configurar handlers de ferramentas
    await setupToolHandlers(server);
    logger.debug('Tool handlers configured');
    
    // Configurar handlers de recursos
    await setupResourceHandlers(server);
    logger.debug('Resource handlers configured');
    
    // Configurar handlers de prompts
    await setupPromptHandlers(server);
    logger.debug('Prompt handlers configured');
    
    logger.info('All handlers configured successfully');
  } catch (error) {
    logger.error('Failed to setup handlers:', error);
    throw error;
  }
}

