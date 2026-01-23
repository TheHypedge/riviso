# Backend Architecture - Riviso

## Complete Modular Backend Structure

```
apps/backend/
├── src/
│   ├── main.ts                           # Application entry point
│   ├── app.module.ts                     # Root module
│   │
│   ├── common/                           # Shared utilities
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts   # Request/response logging
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Centralized error handling
│   │   └── decorators/
│   │       └── api-version.decorator.ts  # API versioning decorator
│   │
│   ├── modules/                          # Feature modules
│   │   │
│   │   ├── auth/                         # 🔐 Authentication & Authorization
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── guards/
│   │   │       └── jwt-auth.guard.ts
│   │   │
│   │   ├── user/                         # 👤 User Management
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── project/                      # 📁 Project/Workspace Management
│   │   │   ├── project.module.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── project.service.ts
│   │   │   ├── entities/
│   │   │   │   └── project.entity.ts
│   │   │   └── dto/
│   │   │       └── create-project.dto.ts
│   │   │
│   │   ├── seo/                          # 🔍 SEO Analysis
│   │   │   ├── seo.module.ts
│   │   │   ├── seo.controller.ts
│   │   │   └── seo.service.ts
│   │   │
│   │   ├── serp/                         # 📈 Keyword & SERP Tracking
│   │   │   ├── serp.module.ts
│   │   │   ├── serp.controller.ts
│   │   │   └── serp.service.ts
│   │   │
│   │   ├── competitor/                   # 🎯 Competitor Analysis
│   │   │   ├── competitor.module.ts
│   │   │   ├── competitor.controller.ts
│   │   │   └── competitor.service.ts
│   │   │
│   │   ├── cro/                          # 💡 CRO Intelligence
│   │   │   ├── cro.module.ts
│   │   │   ├── cro.controller.ts
│   │   │   └── cro.service.ts
│   │   │
│   │   ├── ai/                           # 🤖 AI Prompt Engine
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   └── dto/
│   │   │       └── ai-prompt.dto.ts
│   │   │
│   │   ├── integrations/                 # 🔗 Integrations (NEW)
│   │   │   ├── integrations.module.ts
│   │   │   ├── integrations.controller.ts
│   │   │   ├── integrations.service.ts
│   │   │   ├── services/
│   │   │   │   ├── google-analytics.service.ts
│   │   │   │   └── google-search-console.service.ts
│   │   │   └── dto/
│   │   │       └── connect-integration.dto.ts
│   │   │
│   │   ├── notifications/                # 🔔 Notifications (NEW)
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── services/
│   │   │   │   ├── email.service.ts
│   │   │   │   └── slack.service.ts
│   │   │   └── dto/
│   │   │       ├── create-notification.dto.ts
│   │   │       └── update-preferences.dto.ts
│   │   │
│   │   └── health/                       # 🏥 Health & Monitoring (NEW)
│   │       ├── health.module.ts
│   │       └── health.controller.ts
│   │
│   └── infrastructure/                    # Infrastructure services
│       ├── database/
│       │   └── database.module.ts
│       └── redis/
│           ├── redis.module.ts
│           └── redis.service.ts
│
├── Dockerfile
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## Module Responsibilities

### 1. Auth Module 🔐
**Responsibility**: User authentication and authorization

**Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

**Features**:
- JWT-based authentication
- Refresh token rotation
- Password hashing with bcrypt
- OAuth2 ready (Google, GitHub)
- Role-based access control (RBAC)

**Dependencies**: User module, JWT library

---

### 2. User Module 👤
**Responsibility**: User profile and account management

**Endpoints**:
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID

**Features**:
- User CRUD operations
- Profile management
- Avatar upload
- Account settings

**Dependencies**: None (core module)

---

### 3. Project Module 📁
**Responsibility**: Project/workspace management

**Endpoints**:
- `POST /api/projects` - Create project
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/:id/stats` - Get project statistics

**Features**:
- Multi-project workspaces
- Team member management
- Project settings
- Integration configuration

**Dependencies**: User module

---

### 4. SEO Module 🔍
**Responsibility**: SEO analysis and auditing

**Endpoints**:
- `POST /api/seo/audit` - Run SEO audit
- `GET /api/seo/audits/:projectId` - Get audits
- `GET /api/seo/audit/:id` - Get audit details

**Features**:
- Comprehensive SEO audits
- Technical SEO analysis
- On-page optimization checks
- Recommendation engine
- Issue prioritization

**Dependencies**: Project module

---

### 5. SERP Module 📈
**Responsibility**: Keyword tracking and SERP monitoring

**Endpoints**:
- `POST /api/serp/keywords` - Add keywords
- `GET /api/serp/keywords/:projectId` - List keywords
- `GET /api/serp/rankings/:keywordId` - Get ranking history
- `GET /api/serp/analysis/:keywordId` - Get keyword analysis

**Features**:
- Keyword tracking
- Rank monitoring
- SERP feature detection
- Trend analysis
- Opportunity scoring

**Dependencies**: Project module, External SERP APIs

---

### 6. Competitor Module 🎯
**Responsibility**: Competitor intelligence and analysis

**Endpoints**:
- `POST /api/competitors` - Add competitor
- `GET /api/competitors/:projectId` - List competitors
- `GET /api/competitors/:projectId/comparison` - Get comparison
- `GET /api/competitors/:projectId/gaps` - Get content gaps

**Features**:
- Competitor tracking
- Keyword overlap analysis
- Content gap identification
- Strengths/weaknesses comparison
- Benchmarking

**Dependencies**: Project module, SERP module

---

### 7. CRO Module 💡
**Responsibility**: Conversion rate optimization intelligence

**Endpoints**:
- `GET /api/cro/insights/:projectId` - Get CRO insights
- `GET /api/cro/dashboard/:projectId` - Get CRO dashboard
- `POST /api/cro/analyze` - Analyze page
- `GET /api/cro/recommendations/:insightId` - Get recommendations

**Features**:
- High-traffic/low-conversion detection
- AI-powered recommendations
- A/B test management
- Impact projection
- Funnel analysis

**Dependencies**: Project module, Analytics integrations, AI module

---

### 8. AI Module 🤖
**Responsibility**: AI-powered data querying and insights

**Endpoints**:
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/sessions/:userId` - Get chat sessions
- `GET /api/ai/session/:sessionId` - Get session details
- `GET /api/ai/templates` - Get prompt templates

**Features**:
- Natural language querying
- Context-aware responses
- Multi-source data aggregation
- Prompt orchestration
- LLM provider abstraction (OpenAI/Anthropic)

**Dependencies**: All analysis modules, @riviso/ai-core package

---

### 9. Integrations Module 🔗 (NEW)
**Responsibility**: Third-party service integrations

**Endpoints**:
- `GET /api/integrations/:projectId` - Get integrations
- `POST /api/integrations/connect` - Connect integration
- `DELETE /api/integrations/:projectId/:type` - Disconnect
- `POST /api/integrations/google-analytics/oauth` - GA OAuth
- `POST /api/integrations/search-console/oauth` - GSC OAuth
- `GET /api/integrations/:projectId/sync-status` - Get sync status

**Features**:
- Google Analytics integration
- Google Search Console integration
- OAuth2 flow management
- Credential storage (encrypted)
- Data synchronization
- Webhook management

**Dependencies**: Project module

---

### 10. Notifications Module 🔔 (NEW)
**Responsibility**: Notification delivery and preferences

**Endpoints**:
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/send` - Send notification (admin)

**Features**:
- Email notifications
- Slack notifications
- In-app notifications
- Preference management
- Alert triggers (ranking changes, SEO issues, etc.)
- Weekly reports

**Dependencies**: User module, Email service, Slack service

---

### 11. Health Module 🏥 (NEW)
**Responsibility**: System health monitoring and metrics

**Endpoints**:
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe
- `GET /api/health/metrics` - Application metrics

**Features**:
- Health checks (memory, disk, dependencies)
- Kubernetes-ready probes
- Performance metrics
- Uptime monitoring
- Resource usage tracking

**Dependencies**: @nestjs/terminus

---

## Global Features

### ✅ Global Validation Pipe
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
);
```

### ✅ Centralized Error Handling
```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

### ✅ Logging Interceptor
```typescript
app.useGlobalInterceptors(new LoggingInterceptor());
```

### ✅ API Versioning
```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
  prefix: 'api/v',
});
```

### ✅ Swagger Documentation
- Available at `/api/docs`
- All endpoints documented
- Request/response schemas
- Bearer auth support

---

## Example Code Patterns

### Controller Pattern
```typescript
@Controller('resource')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Get()
  @ApiOperation({ summary: 'Get resources' })
  async findAll(@Request() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create resource' })
  async create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }
}
```

### Service Pattern
```typescript
@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
    private otherService: OtherService,
  ) {}

  async findAll(userId: string): Promise<Resource[]> {
    // Business logic
  }

  async create(dto: CreateDto): Promise<Resource> {
    // Business logic with error handling
    try {
      // ...
    } catch (error) {
      throw new BadRequestException('Error message');
    }
  }
}
```

### DTO Pattern
```typescript
export class CreateDto {
  @ApiProperty({ example: 'value' })
  @IsString()
  @MinLength(3)
  field: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  optionalField?: number;
}
```

---

## Dependency Injection Flow

```
Controller
    ↓ (inject)
Service
    ↓ (inject)
Repository / External Service
    ↓
Database / API
```

---

## Error Response Format

All errors return consistent structure:
```json
{
  "success": false,
  "error": {
    "code": "BadRequest",
    "message": "Validation failed",
    "timestamp": "2026-01-22T10:30:00.000Z",
    "path": "/api/resource",
    "method": "POST"
  }
}
```

---

## Success Response Format

All successful responses:
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## Key Design Principles

1. **Single Responsibility**: Each module handles one domain
2. **Dependency Injection**: Loose coupling, easy testing
3. **Separation of Concerns**: Controllers → Services → Repositories
4. **Type Safety**: Full TypeScript with strict mode
5. **Validation**: DTOs with class-validator
6. **Documentation**: Swagger for all endpoints
7. **Error Handling**: Centralized exception filter
8. **Logging**: Request/response logging interceptor
9. **Scalability**: Modular architecture ready for microservices
10. **Security**: JWT auth, input validation, rate limiting ready

---

## Running the Backend

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# With Docker
docker-compose up backend
```

Access:
- API: http://localhost:4000/api
- Docs: http://localhost:4000/api/docs
- Health: http://localhost:4000/api/health

---

**All modules include mock data responses and are ready for database integration.**
