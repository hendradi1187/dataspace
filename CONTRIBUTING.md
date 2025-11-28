# Contributing to Dataspace Platform

Thank you for interest in contributing to the Dataspace Platform! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start development: `npm run dev:up && npm run dev:cts`

## Development Workflow

### Branch Naming

- `feature/` - New features
- `bugfix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `chore/` - Build, dependencies, CI/CD

Example: `feature/add-metadata-validation`

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build, dependencies, CI/CD

Example:
```
feat(idp): add token revocation endpoint

Add endpoint for revoking authentication tokens.
Implements RFC 7009 token revocation specification.

Fixes #123
```

### Code Style

All code must pass:

```bash
# Linting
npm run lint

# Formatting
npm run fmt
```

These are enforced via pre-commit hooks.

## Testing

All changes must include tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- services/cts/idp/test/health.spec.ts

# Watch mode
npm test -- --watch
```

Test coverage requirements:
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

## Schema and Database Changes

### JSON Schema Changes

1. Create/update schema in `/schema/jsonschema/per-message/`
2. Update OpenAPI spec in `/schema/openapi/`
3. Regenerate types: `npm run gen:clients`
4. Add tests for schema validation

### Database Changes

1. Create DDL changes in `/db/ddl/`
2. Create migration in `/db/migrations/`
3. Follow naming: `NNN_description.sql`
4. Include rollback instructions
5. Test migrations: `npm run migrate:test`

Migration template:
```sql
-- Migration: NNN_description
-- Created: YYYY-MM-DD
-- Description: Brief description of changes

BEGIN;

-- Your SQL here

COMMIT;
```

## Pull Request Process

1. **Update your branch**: `git rebase main`

2. **Run full test suite**:
   ```bash
   npm run lint
   npm run fmt
   npm test
   npm run build
   ```

3. **Create descriptive PR title**: Follow conventional commits

4. **Fill PR template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Breaking change

   ## Related Issues
   Fixes #123

   ## Testing
   - [ ] Unit tests added
   - [ ] Integration tests added
   - [ ] Manual testing performed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

5. **Wait for review**: Address feedback promptly

6. **Squash and merge**: Once approved

## Service Development

When adding a new service or module:

### Directory Structure

```
services/my-service/
├── src/
│   ├── index.ts           # Service bootstrap
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── repositories/      # Data access
│   ├── models/            # Domain types
│   ├── validators/        # Input validation
│   ├── events/            # Event handlers
│   ├── config/            # Configuration
│   └── plugins/           # Fastify plugins
├── test/
│   ├── health.spec.ts
│   ├── routes.spec.ts
│   └── integration.spec.ts
├── package.json
└── tsconfig.json
```

### Required Files

- `src/index.ts` - Service bootstrap with `/health` endpoint
- `src/routes/` - Feature routes
- `src/config/` - Environment configuration
- `test/` - Unit and integration tests
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### Health Check Endpoint

Every service must expose:

```typescript
app.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    service: 'service-name',
    timestamp: new Date().toISOString(),
  };
});
```

## Documentation

### Code Comments

- Add comments for complex logic
- Use JSDoc for functions and classes
- Keep comments updated with code changes

### README Files

Each service should have `README.md` with:
- Service description
- Purpose and responsibilities
- Key endpoints
- Configuration options
- How to run and test

### Architecture Changes

Update `/docs/ARCHITECTURE.md` if:
- Adding/removing services
- Changing service boundaries
- Modifying data flow
- Updating technology stack

## Performance Guidelines

- Use prepared statements for database queries
- Implement pagination for list endpoints
- Cache frequently accessed data
- Monitor query performance
- Use connection pooling (already configured)

## Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation applied
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (validate and sanitize)
- [ ] CSRF protection
- [ ] Rate limiting (where applicable)
- [ ] Authentication/authorization checks
- [ ] Error messages don't leak sensitive info

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release with notes

## Getting Help

- **Questions**: Open a discussion in the repository
- **Bugs**: Create an issue with reproduction steps
- **Features**: Start with an RFC (Request for Comments) issue
- **Chat**: Join our community chat (if available)

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` (after first contribution)
- Release notes
- Project documentation

Thank you for contributing! 🚀
