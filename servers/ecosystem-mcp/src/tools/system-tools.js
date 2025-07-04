import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const systemTools = [
  {
    name: 'get_system_info',
    description: 'Get system information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      return {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        uptime: os.uptime(),
        hostname: os.hostname(),
      };
    },
  },
  {
    name: 'execute_command',
    description: 'Execute a shell command',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Command to execute',
        },
        cwd: {
          type: 'string',
          description: 'Working directory (optional)',
        },
      },
      required: ['command'],
    },
    handler: async ({ command, cwd }) => {
      try {
        const { stdout, stderr } = await execAsync(command, { cwd });
        return {
          success: true,
          stdout,
          stderr,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stdout: error.stdout,
          stderr: error.stderr,
        };
      }
    },
  },
];

