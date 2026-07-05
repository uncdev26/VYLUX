# Contributing to VYLUX

Thank you for your interest in contributing to VYLUX! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v9+)
- [Git](https://git-scm.com/)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/VYLUX.git
   cd VYLUX
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Create an issue** first to discuss the change
2. **Fork** the repository
3. **Create a branch** from `main`
4. **Make your changes** following our coding standards
5. **Write tests** for new functionality
6. **Update documentation** if needed
7. **Commit** using conventional commits
8. **Push** to your fork
9. **Open a Pull Request**

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add email verification
fix(api): resolve null pointer in user service
docs(readme): update installation instructions
test(forms): add unit tests for form validation
```

## Pull Request Process

1. Update the README.md if needed
2. Update documentation for new features
3. Ensure all tests pass
4. Request review from maintainers
5. Address review comments
6. Get approval and merge

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## Coding Standards

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use explicit types for function parameters
- Document complex logic with comments

### File Naming

- Components: `PascalCase.svelte`
- Services: `camelCase.ts`
- Types: `camelCase.ts`
- Tests: `*.test.ts`

### Code Style

- Use ESLint and Prettier
- Follow existing patterns
- Keep files focused and small
- Use meaningful variable names

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=@newlight/api

# Run tests in watch mode
npm test --watch
```

### Writing Tests

- Write unit tests for all new code
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms
- Include usage examples

### User Documentation

- Update README for new features
- Add API documentation
- Include screenshots for UI changes

## Questions?

Feel free to open an issue or reach out to the maintainers.

Thank you for contributing to VYLUX! 🚀
