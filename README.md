# 🚀 RIVISO - Advanced SEO Analytics Platform

A comprehensive SEO audit and analytics platform built with Next.js and FastAPI, featuring real-time website analysis, detailed reporting, and actionable insights.

![RIVISO Logo](https://via.placeholder.com/400x100/4F46E5/FFFFFF?text=RIVISO)

## ✨ Features

- **🔍 Comprehensive SEO Audits**: Analyze on-page, technical, and content optimization
- **📊 Real-time Analytics**: Live progress tracking during audit execution
- **🎯 Top Keywords Analysis**: Discover ranking keywords with search volume and difficulty
- **⚡ Fast & Reliable**: Optimized crawling and analysis engine
- **📱 Responsive Design**: Beautiful, mobile-first user interface
- **🔒 Secure**: Built with security best practices
- **📈 Actionable Insights**: Prioritized recommendations for SEO improvements

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for performance optimization
- **Deployment**: Docker-ready with production configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- pnpm (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/riviso.git
   cd riviso
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   cd services/audit-api
   pip install -e .
   cd ../..
   ```

3. **Start infrastructure**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

4. **Run database migrations**
   ```bash
   cd services/audit-api
   source venv/bin/activate
   alembic upgrade head
   cd ../..
   ```

5. **Start development servers**
   ```bash
   make dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
riviso/
├── apps/
│   └── web/                 # Next.js frontend application
├── packages/
│   └── shared/              # Shared TypeScript types and utilities
├── services/
│   └── audit-api/           # FastAPI backend service
├── infra/
│   ├── docker-compose.yml   # Development infrastructure
│   └── env/                 # Environment configurations
├── scripts/
│   └── setup.sh            # Automated setup script
└── docs/                   # Documentation
```

## 🛠️ Development

### Available Scripts

```bash
# Development
make dev              # Start all development servers
make build            # Build all applications
make test             # Run all tests
make lint             # Run linting
make format           # Format code

# Database
make migrate          # Run database migrations
make migrate-create   # Create new migration

# Infrastructure
make docker-up        # Start local infrastructure
make docker-down      # Stop local infrastructure
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/riviso

# API
API_HOST=0.0.0.0
API_PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Option 1: Hostinger (Recommended for beginners)

1. **Prepare deployment files**
   ```bash
   ./hostinger-deploy.sh
   ```

2. **Upload to Hostinger**
   - Upload `hostinger-deploy/` contents to `public_html`
   - Set up MySQL database
   - Configure environment variables

3. **Configure domain**
   - Point riviso.com to your hosting
   - Enable SSL certificate

### Option 2: Vercel + Railway

1. **Deploy Frontend to Vercel**
   ```bash
   # Connect GitHub repo to Vercel
   # Deploy apps/web folder
   ```

2. **Deploy Backend to Railway**
   ```bash
   # Connect GitHub repo to Railway
   # Deploy services/audit-api folder
   ```

### Option 3: Docker

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 API Documentation

The API documentation is available at `/docs` when running the backend server.

### Key Endpoints

- `POST /audits/` - Create a new SEO audit
- `GET /audits/{id}` - Get audit results
- `GET /health` - Health check endpoint

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test suites
cd services/audit-api && python -m pytest
cd apps/web && pnpm test
```

## 📈 Performance

- **Frontend**: Optimized with Next.js static generation
- **Backend**: Async FastAPI with connection pooling
- **Database**: Indexed queries and efficient migrations
- **Caching**: Redis for session and result caching

## 🔒 Security

- Input validation with Pydantic
- SQL injection protection with SQLAlchemy
- CORS configuration
- Rate limiting
- Environment-based secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Create a [GitHub issue](https://github.com/yourusername/riviso/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/yourusername/riviso/discussions)

## 🎯 Roadmap

- [ ] Advanced keyword research tools
- [ ] Competitor analysis features
- [ ] Automated reporting and alerts
- [ ] Multi-language support
- [ ] API rate limiting and quotas
- [ ] Advanced caching strategies

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [FastAPI](https://fastapi.tiangolo.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for the SEO community**