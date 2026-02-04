# Riviso - Production Implementation Plan

**Status:** Assessment Complete | **Date:** January 26, 2026  
**Architect:** Principal Software Architect + Staff Engineers

---

## 📊 Current State Assessment

### ✅ Already Implemented

1. **Monorepo Structure**
   - ✅ `/apps/frontend` (Next.js App Router)
   - ✅ `/apps/backend` (NestJS)
   - ✅ `/packages/shared-types`
   - ✅ `/packages/ai-core`
   - ✅ `/packages/ui-components`
   - ✅ `/docs` (partial)

2. **Backend Modules**
   - ✅ Auth & Users (JWT + OAuth2)
   - ✅ SEO Analysis (On-Page + partial Technical)
   - ✅ Search Console Integration (OAuth + data fetching)
   - ✅ AI Agent (prompt system)
   - ✅ CRO Engine (basic)
   - ✅ Integrations (GSC, GA placeholders)
   - ✅ Notifications

3. **Frontend**
   - ✅ Dashboard Layout
   - ✅ Website Analyzer (On-Page + Off-Page tabs)
   - ✅ Search Console Dashboard (Insights, Performance, Links)
   - ✅ AI Assistant
   - ✅ Settings & Integrations

4. **Infrastructure**
   - ✅ Docker setup
   - ✅ TypeORM entities
   - ✅ Redis abstraction
   - ✅ OpenSearch abstraction

### ❌ Missing / Needs Enhancement

1. **Critical Gaps**
   - ❌ Technical SEO Engine (removed, needs rebuild)
   - ❌ Website Verification System (DNS/meta verification)
   - ❌ Plan & Entitlement Enforcement
   - ❌ Production-Grade Crawler Engine
   - ❌ PageSpeed Insights Integration
   - ❌ RBAC System
   - ❌ Audit Logging

2. **Documentation**
   - ⚠️ Partial architecture docs
   - ❌ Complete system-flow.md
   - ❌ Complete onboarding.md
   - ❌ Security model documentation

3. **Security & Compliance**
   - ⚠️ Basic auth implemented
   - ❌ Token security hardening
   - ❌ Rate limiting
   - ❌ Plan abuse prevention

---

## 🎯 Implementation Phases

### PHASE 1: Foundation Hardening (Week 1)
**Priority: CRITICAL**

#### 1.1 Website Entity & Verification
- [ ] Create `Website` entity with verification fields
- [ ] Implement DNS verification service
- [ ] Implement meta tag verification
- [ ] Website → GSC property mapping
- [ ] Backend validation for website ownership

#### 1.2 Plan & Entitlement System
- [ ] Create `Plan` entity (Free, Pro, Enterprise)
- [ ] Create `Entitlement` service
- [ ] Enforce website count limits
- [ ] Enforce API call quotas
- [ ] Audit logging for entitlement checks

#### 1.3 RBAC System
- [ ] Role definitions (Owner, Admin, Member, Viewer)
- [ ] Permission system
- [ ] Workspace-level permissions
- [ ] Website-level permissions

---

### PHASE 2: Crawler Engine (Week 2)
**Priority: CRITICAL**

#### 2.1 Production Crawler
- [ ] Respect robots.txt
- [ ] Rate limiting & politeness
- [ ] Queue-based architecture (Redis/Bull)
- [ ] Crawl graph storage
- [ ] Status code tracking
- [ ] Metadata extraction (titles, meta robots, canonicals, headers, links, schema, images, scripts)

#### 2.2 Crawl Data Storage
- [ ] HTML storage (object storage abstraction)
- [ ] Crawl graph in PostgreSQL
- [ ] Metadata indexing
- [ ] Incremental crawl support

---

### PHASE 3: Technical SEO Engine (Week 3)
**Priority: HIGH**

#### 3.1 Core Analyzers
- [ ] Crawlability Analyzer
- [ ] Indexability Analyzer
- [ ] Architecture Analyzer
- [ ] Performance Estimator
- [ ] Mobile Usability Checker
- [ ] Security Analyzer
- [ ] Schema Validator
- [ ] Sitemap Analyzer
- [ ] Duplication Detector
- [ ] Server Health Monitor
- [ ] Hreflang Validator

#### 3.2 Issue Reporting
- [ ] Standardized issue format
- [ ] Confidence scoring
- [ ] Affected pages tracking
- [ ] Severity classification

---

### PHASE 4: PageSpeed Insights Integration (Week 4)
**Priority: HIGH**

#### 4.1 PSI Service
- [ ] OAuth setup (if needed)
- [ ] API client
- [ ] Core Web Vitals extraction
- [ ] Performance diagnostics
- [ ] Mobile vs Desktop comparison
- [ ] Caching strategy
- [ ] Plan-based quotas

#### 4.2 Integration Points
- [ ] Technical SEO → Performance metrics
- [ ] CRO Engine → Performance data
- [ ] Dashboard display

---

### PHASE 5: Search Console Hardening (Week 5)
**Priority: MEDIUM**

#### 5.1 Security & Validation
- [ ] Website → Property mapping validation
- [ ] Token security (no raw tokens in frontend)
- [ ] Request validation (website_id required)
- [ ] Audit logging for GSC calls

#### 5.2 Data Completeness
- [ ] All GSC endpoints implemented
- [ ] Error handling
- [ ] Rate limit compliance

---

### PHASE 6: CRO Engine Enhancement (Week 6)
**Priority: MEDIUM**

#### 6.1 Data Integration
- [ ] GA4 integration (mock → real)
- [ ] Search Console data
- [ ] PageSpeed Insights data
- [ ] Page intent detection

#### 6.2 Detection Algorithms
- [ ] Funnel drop-off detection
- [ ] High traffic / low conversion detection
- [ ] Mobile vs desktop gap detection
- [ ] Performance-conversion correlation
- [ ] Intent mismatch detection

#### 6.3 Output Format
- [ ] CRO issues
- [ ] Priority scoring
- [ ] Expected uplift estimates
- [ ] Affected pages

---

### PHASE 7: AI Agent Enhancement (Week 7)
**Priority: MEDIUM**

#### 7.1 Rule-First Architecture
- [ ] Deterministic rule engine
- [ ] LLM only for explanation
- [ ] Confidence scoring
- [ ] Reference tracking (no hallucinations)

#### 7.2 Supported Questions
- [ ] "Why is traffic down?"
- [ ] "What should I fix first?"
- [ ] "Why users not converting?"
- [ ] "Which pages hurt performance?"

---

### PHASE 8: Frontend Completion (Week 8)
**Priority: MEDIUM**

#### 8.1 Missing Pages
- [ ] Technical SEO Dashboard (rebuild)
- [ ] PageSpeed Insights Dashboard
- [ ] Enhanced CRO Insights
- [ ] Workspace Management

#### 8.2 UX Enhancements
- [ ] Loading states
- [ ] Empty states
- [ ] Tooltips explaining metrics
- [ ] "Data source" labels
- [ ] Executive-friendly views

---

### PHASE 9: Documentation (Week 9)
**Priority: HIGH**

#### 9.1 Core Docs
- [ ] Complete `README.md`
- [ ] Complete `architecture.md`
- [ ] Complete `system-flow.md`
- [ ] Complete `onboarding.md`
- [ ] Security model documentation

#### 9.2 Developer Docs
- [ ] API documentation
- [ ] Module architecture
- [ ] How to add features
- [ ] How AI works
- [ ] Best practices

---

### PHASE 10: Security & Performance (Week 10)
**Priority: CRITICAL**

#### 10.1 Security Hardening
- [ ] Token encryption
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

#### 10.2 Performance
- [ ] Caching strategy
- [ ] Database indexing
- [ ] Query optimization
- [ ] Frontend optimization
- [ ] CDN setup

---

### PHASE 11: Testing & Validation (Week 11)
**Priority: CRITICAL**

#### 11.1 Testing
- [ ] Unit tests (critical paths)
- [ ] Integration tests
- [ ] E2E tests (key flows)
- [ ] Performance tests

#### 11.2 Validation
- [ ] Architecture review
- [ ] Security review
- [ ] Performance review
- [ ] SEO correctness review
- [ ] AI trust review

---

### PHASE 12: Production Readiness (Week 12)
**Priority: CRITICAL**

#### 12.1 Final Deliverables
- [ ] Known limitations document
- [ ] Phase-2 roadmap
- [ ] Scaling plan
- [ ] Deployment guide
- [ ] Monitoring setup

---

## 🚀 Immediate Next Steps

1. **Create Website Entity & Verification System** (Start Now)
2. **Implement Plan & Entitlement System** (Start Now)
3. **Rebuild Technical SEO Engine** (After verification)
4. **Enhance Crawler Engine** (Parallel)

---

## 📝 Implementation Notes

### Core Principles (Non-Negotiable)
1. **Rules detect truth** - All data must come from real sources
2. **AI explains truth** - LLM only explains, never invents
3. **No hallucinated data** - All AI responses must reference real signals
4. **System controls entitlements** - Never trust client-side limits
5. **Google APIs validate** - Use APIs to validate, not replace logic

### Technical Constraints
- No external SEO vendors
- No hard-coded secrets
- No raw Google tokens in frontend
- No AI hallucinations
- No plan abuse loopholes
- No vague code

---

## 📊 Progress Tracking

- [ ] Phase 1: Foundation Hardening
- [ ] Phase 2: Crawler Engine
- [ ] Phase 3: Technical SEO Engine
- [ ] Phase 4: PageSpeed Insights
- [ ] Phase 5: Search Console Hardening
- [ ] Phase 6: CRO Engine Enhancement
- [ ] Phase 7: AI Agent Enhancement
- [ ] Phase 8: Frontend Completion
- [ ] Phase 9: Documentation
- [ ] Phase 10: Security & Performance
- [ ] Phase 11: Testing & Validation
- [ ] Phase 12: Production Readiness

---

**Last Updated:** January 26, 2026  
**Next Review:** After Phase 1 completion
