# Common Module

This directory contains shared utilities, interceptors, filters, and decorators used across the application.

## Contents

### Interceptors
- **LoggingInterceptor**: Logs all HTTP requests and responses with timing information

### Filters
- **HttpExceptionFilter**: Centralized exception handling with consistent error responses

### Decorators
- **ApiVersion**: Decorator for API versioning

### Guards (Existing)
- JWT authentication guards

## Usage

All common utilities are automatically applied at the global level in `main.ts`:

```typescript
// Global exception filter
app.useGlobalFilters(new HttpExceptionFilter());

// Global logging
app.useGlobalInterceptors(new LoggingInterceptor());

// API versioning
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```
