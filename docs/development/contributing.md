# Contributing to MCP Ecosystem

First off, thank you for considering contributing to the MCP Ecosystem! 🎉

This document provides guidelines and important information for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Pull Requests](#pull-requests)
- [Code Style](#code-style)
- [Commits](#commits)
- [Testing](#testing)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Useful Resources](#useful-resources)

## 📜 Code of Conduct

This project follows a Code of Conduct that all contributors must observe. Please read [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md).

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

1. Check if the bug hasn't already been reported in [Issues](https://github.com/NEO-SH1W4/cognition-mcp/issues)
2. Use the bug issue template
3. Include detailed steps to reproduce
4. Provide environment information (OS, Node.js version, etc.)
5. Add relevant logs and screenshots
6. Include minimal code examples when possible

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment**
- OS: [e.g. Windows 11, macOS 13.0, Ubuntu 22.04]
- Node.js: [e.g. 18.17.0]
- MCP Ecosystem Version: [e.g. 0.1.0]

**Additional context**
Add any other context about the problem here.
```

### 💡 Suggesting Enhancements

1. First discuss the enhancement via issue or [Discussions](https://github.com/NEO-SH1W4/cognition-mcp/discussions)
2. Use the feature request template
3. Describe the problem your suggestion solves
4. Explain how your suggestion benefits the project
5. Include usage examples and mockups if applicable
6. Consider backward compatibility

**Enhancement Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 🔄 Pull Requests

### Process Overview

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Implement your changes
4. Add or update tests
5. Update documentation
6. Run tests and linting (`npm test`)
7. Commit using clear messages ([Conventional Commits](#commits))
8. Push to your branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### PR Checklist

Before submitting your PR, ensure you've completed:

- [ ] **Tests added/updated** - All new code has corresponding tests
- [ ] **Documentation updated** - README, docs, and code comments updated
- [ ] **Code formatted** - Prettier and ESLint rules applied
- [ ] **Types checked** - TypeScript compilation without errors
- [ ] **Changelog updated** - Add entry to CHANGELOG.md if needed
- [ ] **Version incremented** - If breaking changes or new features
- [ ] **100% coverage** - New code maintains or improves test coverage
- [ ] **Manual testing** - Verify changes work as expected

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## 💻 Code Style

### TypeScript

- Use TypeScript 5.3+
- Follow strict TypeScript configuration
- Use explicit types for all function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use `const` assertions where appropriate

```typescript
// Good
interface ServerConfig {
  readonly name: string;
  readonly port: number;
  readonly features: readonly string[];
}

function createServer(config: ServerConfig): Promise<MCPServer> {
  // Implementation
}

// Bad
type ServerConfig = {
  name: string;
  port: number;
  features: string[];
}

function createServer(config: any) {
  // Implementation
}
```

### Code Formatting

We use Prettier with the following configuration:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### ESLint Configuration

We extend AirBnB ESLint configuration with TypeScript support:

```json
{
  "extends": [
    "airbnb-base",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "import/prefer-default-export": "off"
  }
}
```

### Naming Conventions

- **Files**: kebab-case (`mcp-server.ts`, `rules-engine.ts`)
- **Classes**: PascalCase (`MCPServer`, `RulesEngine`)
- **Functions/Variables**: camelCase (`createServer`, `messageHandler`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_PORT`, `MAX_RETRIES`)
- **Interfaces**: PascalCase with descriptive names (`ServerConfig`, `MessageHandler`)

## 📝 Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/) standard:

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

### Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
# Simple feature
feat: add WebSocket transport support

# Feature with scope
feat(server): implement health check endpoint

# Bug fix with description
fix: resolve memory leak in connection pooling

# Breaking change
feat!: redesign Rules API for better performance

BREAKING CHANGE: Rules.evaluate() now returns Promise<RuleResult[]> instead of RuleResult
```

## ✅ Testing

### Testing Philosophy

- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Ensure performance requirements are met

### Testing Tools

- **Jest**: Primary testing framework
- **Supertest**: HTTP endpoint testing
- **MSW**: API mocking
- **Playwright**: E2E testing

### Test Structure

```typescript
// Example test file: mcp-server.test.ts
import { MCPServer } from '../src/server/mcp-server';

describe('MCPServer', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer({
      name: 'test-server',
      port: 0 // Use random port for testing
    });
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('start()', () => {
    it('should start server successfully', async () => {
      await expect(server.start()).resolves.not.toThrow();
      expect(server.isRunning()).toBe(true);
    });

    it('should throw error if port is already in use', async () => {
      // Test implementation
    });
  });
});
```

### Coverage Requirements

- **Minimum coverage**: 80% for all code
- **Critical paths**: 100% coverage required
- **New features**: Must include comprehensive tests
- **Bug fixes**: Must include regression tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- mcp-server.test.ts

# Run E2E tests
npm run test:e2e
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Docker (for integration tests)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/NEO-SH1W4/cognition-mcp.git
cd cognition-mcp

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Build the project
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

### Development Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run build:watch  # Build in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Run Prettier
npm run typecheck    # Run TypeScript type checking

# Testing
npm test             # Run all tests
npm run test:unit    # Run unit tests only
npm run test:e2e     # Run E2E tests
npm run test:coverage # Run tests with coverage

# Utilities
npm run clean        # Clean build artifacts
npm run docs         # Generate documentation
```

## 📁 Project Structure

```
mcp-ecosystem/
├── src/                     # Source code
│   ├── core/               # Core MCP functionality
│   │   ├── server.ts       # MCP server implementation
│   │   ├── protocol.ts     # Protocol handling
│   │   └── transport.ts    # Transport layer
│   ├── rules/              # Rules engine
│   │   ├── engine.ts       # Rules processing
│   │   ├── builder.ts      # Rule creation
│   │   └── types.ts        # Type definitions
│   ├── sage/               # SAGE integration
│   │   ├── client.ts       # WARP client
│   │   ├── manager.ts      # Integration manager
│   │   └── utils.ts        # Utilities
│   ├── server/             # Server framework
│   │   ├── framework.ts    # Base server framework
│   │   └── extensions.ts   # Extension system
│   └── shared/             # Shared utilities
│       ├── config.ts       # Configuration
│       ├── logger.ts       # Logging
│       └── types.ts        # Common types
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── docs/                  # Documentation
├── examples/              # Example implementations
├── scripts/               # Build and utility scripts
└── config/                # Configuration files
```

## 📚 Useful Resources

### Documentation
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### Project Links
- [Homepage](https://neo-sh1w4.github.io/cognition-mcp/)
- [Issues](https://github.com/NEO-SH1W4/cognition-mcp/issues)
- [Discussions](https://github.com/NEO-SH1W4/cognition-mcp/discussions)
- [Changelog](../../CHANGELOG.md)

### Community
- [GitHub Discussions](https://github.com/NEO-SH1W4/cognition-mcp/discussions) - General discussions
- [Discord Server](https://discord.gg/mcp-ecosystem) - Real-time chat (coming soon)

## ❓ Questions?

- Check existing [Issues](https://github.com/NEO-SH1W4/cognition-mcp/issues) and [Discussions](https://github.com/NEO-SH1W4/cognition-mcp/discussions)
- Open a new discussion for questions
- Contact maintainers via GitHub

## 🎯 Recognition

Contributors are recognized in:
- [Contributors](../../CONTRIBUTORS.md) file
- Release notes
- Project documentation

Thank you for contributing to the MCP Ecosystem! 🎉

---

> **Note**: This document is living and evolves with the project. Please suggest improvements via issues or pull requests.

