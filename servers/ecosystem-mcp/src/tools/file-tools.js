import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

export const fileTools = [
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to read',
        },
      },
      required: ['path'],
    },
    handler: async ({ path: filePath }) => {
      const content = await fs.readFile(filePath, 'utf-8');
      return { content };
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to write',
        },
        content: {
          type: 'string',
          description: 'Content to write to the file',
        },
      },
      required: ['path', 'content'],
    },
    handler: async ({ path: filePath, content }) => {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, path: filePath };
    },
  },
  {
    name: 'list_directory',
    description: 'List contents of a directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the directory',
        },
      },
      required: ['path'],
    },
    handler: async ({ path: dirPath }) => {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const contents = items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: path.join(dirPath, item.name),
      }));
      return { contents };
    },
  },
];

