# Contributing to Cognition MCP

🎉 Thank you for your interest in contributing to Cognition MCP! This project aims to revolutionize the MCP ecosystem through intelligent automation and seamless integration.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Search existing issues before creating new ones
- Use the bug report template
- Include reproduction steps and environment details
- Add relevant labels and screenshots

### ✨ Feature Requests
- Check if the feature aligns with our roadmap
- Use the feature request template
- Describe the use case and expected behavior
- Consider implementation complexity

### 🔧 Code Contributions
- Fork the repository
- Create a feature branch from `main`
- Follow our coding standards
- Write tests for new functionality
- Update documentation as needed

## 📋 Development Setup

### Prerequisites
- Node.js ≥ 18.0.0
- Python ≥ 3.10
- Rust ≥ 1.70.0
- Git ≥ 2.40

### Quick Start
```bash
# Clone your fork
git clone https://github.com/yourusername/cognition-mcp.git
cd cognition-mcp

# Install dependencies
npm install
pip install -r core/python/requirements.txt
cd core/rust && cargo build

# Run tests
npm test
cargo test
python -m pytest core/python/tests/

# Start development
npm run dev
```

## 🎯 Coding Standards

### TypeScript/JavaScript
- Use TypeScript strict mode
- Follow ESLint + Prettier configuration
- Prefer async/await over Promises
- Use descriptive variable names
- Add JSDoc comments for public APIs

### Python
- Follow PEP 8 style guide
- Use Black formatter (line length 88)
- Use type hints consistently
- Write docstrings in Google style
- Use pytest for testing

### Rust
- Follow rustfmt formatting
- Use clippy for linting
- Prefer explicit error handling
- Write comprehensive tests
- Document public APIs

## 🌿 Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages
Follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

feat(core): add intelligent session management
fix(rust): resolve memory leak in rules engine
docs(api): update authentication examples
test(python): add integration tests for session manager
```

### Pull Request Process
1. **Update your branch** with latest `main`
2. **Run all tests** and ensure they pass
3. **Update documentation** if needed
4. **Fill out PR template** completely
5. **Request review** from maintainers
6. **Address feedback** promptly

## 🧪 Testing Requirements

### Unit Tests
- Minimum 80% code coverage
- Test both happy path and edge cases
- Mock external dependencies
- Use descriptive test names

### Integration Tests
- Test component interactions
- Use real configurations when possible
- Verify error handling
- Test performance implications

### End-to-End Tests
- Test complete user workflows
- Verify system behavior
- Test across different environments
- Document test scenarios

## 📚 Documentation

### Code Documentation
- JSDoc for TypeScript/JavaScript
- Docstrings for Python
- Rustdoc for Rust
- Include examples in documentation

### User Documentation
- Update README.md for new features
- Add to docs/ directory for detailed guides
- Include code examples
- Keep documentation current

## 🔍 Code Review Process

### As a Contributor
- Respond to feedback constructively
- Make requested changes promptly
- Ask questions if requirements unclear
- Update tests and docs as needed

### As a Reviewer
- Be constructive and helpful
- Focus on code quality and maintainability
- Check for security implications
- Verify test coverage
- Ensure documentation is updated

## 🎨 Design Principles

Our code should follow these principles:

1. **Modularity** - Components should be loosely coupled
2. **Scalability** - Design for growth and performance
3. **Observability** - Include logging and metrics
4. **Security** - Security by design
5. **Developer Experience** - Intuitive and well-documented

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor Discord
- Eligible for early access features

## ❓ Need Help?

- 💬 **Discord**: [Cognition MCP Community](https://discord.gg/cognition-mcp)
- 📧 **Email**: contributors@cognition-mcp.dev
- 📋 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Report bugs via GitHub Issues

## 📜 Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

---

**Thank you for contributing to the future of MCP development! 🚀**

