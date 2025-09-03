# RIVISO Analytics API

FastAPI service for comprehensive SEO analytics and website optimization.

## Features

- **Comprehensive SEO Analysis**: 12+ built-in SEO rules covering on-page, technical, and content optimization
- **Security-First Design**: SSRF protection, content validation, and secure URL handling
- **Background Processing**: Asynchronous job processing with retry logic
- **Extensible Architecture**: Plugin-based rules engine and provider system
- **Production Ready**: Structured logging, monitoring, and health checks

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (for local development)

### Installation

1. **Install dependencies**
   ```bash
   pip install -e .
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure**
   ```bash
   docker-compose -f ../../infra/docker-compose.yml up -d
   ```

4. **Run migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start the API**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### API Documentation

Once running, visit:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Development

### Running Tests

```bash
pytest
```

### Code Quality

```bash
# Format code
black .
ruff --fix .

# Type checking
mypy .

# Linting
ruff check .
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Architecture

### Core Components

- **Audit Engine**: Main orchestration for SEO analysis
- **Rules Engine**: Extensible system for SEO rule evaluation
- **Security Validator**: URL and content security validation
- **Fetcher**: Secure HTTP client with rate limiting
- **Parser**: HTML content parsing and extraction
- **Scoring Engine**: Score calculation and recommendations

### Providers

- **Performance**: PageSpeed Insights integration
- **Backlinks**: Ahrefs API integration
- **SERP**: Bing Search API integration

### Workers

- **Job Runner**: Background processing of audit tasks
- **Queue System**: PostgreSQL-based job queue with retry logic

## Configuration

Key environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/seo_audit

# Security
SECRET_KEY=your-secret-key

# Audit Settings
MAX_AUDIT_URLS=5
AUDIT_TIMEOUT=300
MAX_REDIRECTS=5

# Observability
SENTRY_DSN=your-sentry-dsn
OTEL_SERVICE_NAME=seo-audit-api
```

## Deployment

### Docker

```bash
docker build -t seo-audit-api .
docker run -p 8000:8000 seo-audit-api
```

### Cloud Run

```bash
gcloud run deploy seo-audit-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## API Endpoints

### Audits

- `POST /audits/` - Create new audit
- `GET /audits/{id}` - Get audit by ID
- `GET /audits/` - List audits with pagination
- `DELETE /audits/{id}` - Delete audit

### Health

- `GET /health/` - Basic health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check
- `GET /health/detailed` - Detailed health information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
