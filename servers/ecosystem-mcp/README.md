# Ecosystem MCP Server

## Overview

The Ecosystem MCP Server is a universal Model Context Protocol (MCP) server that provides core functionality for the MCP Ecosystem. It offers file operations, system information, and command execution capabilities.

## Features

- 📁 **File Operations**: Read, write, and list directory contents
- 💻 **System Information**: Get detailed system information
- 🔧 **Command Execution**: Execute shell commands safely
- 🔌 **Extensible Architecture**: Easy to add new tools and capabilities
- 📊 **Comprehensive Logging**: Detailed logging for debugging

## Installation

```bash
cd servers/ecosystem-mcp
npm install
```

## Usage

### Start the Server

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

## Configuration

The server can be configured through environment variables:

- `NODE_ENV`: Set to `production` for production mode
- `LOG_LEVEL`: Set logging level (error, warn, info, debug)

## Available Tools

### File Operations
- `read_file`: Read file contents
- `write_file`: Write content to a file
- `list_directory`: List directory contents

### System Tools
- `get_system_info`: Get system information
- `execute_command`: Execute shell commands

## Integration with Warp

To use with Warp terminal, update your MCP configuration at `%APPDATA%\Warp\mcp_servers.json`:

```json
{
  "mcpServers": {
    "ecosystem-mcp": {
      "command": "node",
      "args": [
        "C:\\Users\\[YourUsername]\\Desktop\\PROJETOS\\MCP_ECOSYSTEM\\servers\\ecosystem-mcp\\src\\index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Development

### Project Structure

```
ecosystem-mcp/
├── src/
│   ├── index.js          # Main server entry point
│   ├── config/           # Configuration
│   ├── handlers/         # Request handlers
│   ├── tools/           # Tool implementations
│   └── utils/           # Utilities
├── package.json
└── README.md
```

### Adding New Tools

1. Create a new file in `src/tools/`
2. Export an array of tool definitions
3. Import and register in `src/handlers/tools.js`

## License

MIT

