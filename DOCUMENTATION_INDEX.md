# Documentation Index

> **Complete guide to all Riviso platform documentation**

---

## 📚 Core Documentation

### 1. [README.md](README.md)
**Audience:** Everyone (stakeholders, developers, users)

**Contents:**
- 🎯 Product overview and value proposition
- 🏗️ Complete tech stack breakdown
- 📁 Monorepo project structure
- 🚀 Quick start guide (setup in 15 minutes)
- 🔐 Environment variables reference
- 💻 Local development instructions
- 🤖 AI architecture overview (Prompt System + CRO Engine)
- 🧪 Testing and deployment guide

**When to read:** First thing when joining the project

---

### 2. [docs/architecture.md](docs/architecture.md)
**Audience:** Backend developers, architects, DevOps

**Contents:**
- 📐 High-level system architecture diagram
- 🏗️ Infrastructure layers (Client, API, Data, External Services)
- 🔄 Service interactions and data flows
- 🤖 AI Prompt System detailed flow (Intent → Data → Response)
- 🎯 CRO Intelligence Engine logic (5 detection algorithms)
- 🔐 Security architecture (Auth, encryption, validation)
- 📊 Performance optimizations (caching, database, API)
- 📈 Scalability considerations

**When to read:** When understanding system design or before architectural changes

---

### 3. [docs/system-flow.md](docs/system-flow.md)
**Audience:** Full-stack developers, product managers

**Contents:**
- 🚀 Complete user journeys (onboarding, daily usage, deep dives)
- 📥 Data ingestion flows (SEO, SERP, Analytics)
- 🤖 AI query lifecycle (step-by-step with code samples)
- 🎯 CRO analysis flow (detection → recommendations → impact)
- ⚠️ Error handling and fallback strategies
- 🔄 State management patterns
- 🔁 Retry logic and resilience

**When to read:** When implementing new features or understanding data flows

---

### 4. [docs/onboarding.md](docs/onboarding.md)
**Audience:** New developers (frontend and backend)

**Contents:**
- 🎯 Day 1 setup guide (clone to running app)
- 📂 Folder structure walkthrough (backend, frontend, packages)
- 🛠️ How to add features (with complete examples)
- 🤖 How to extend AI prompts (step-by-step tutorial)
- 📋 Best practices and coding conventions
- 🔍 Debugging tips and tools
- 🎓 Learning resources
- ✅ Onboarding checklist

**When to read:** First day as a new developer

---

## 🤖 AI System Documentation

### 5. [AI_SYSTEM_FLOW.md](AI_SYSTEM_FLOW.md)
**Audience:** AI/ML developers, backend developers

**Contents:**
- Visual flow diagram of AI prompt processing
- Supported prompts (3 types)
- Intent classification logic
- Confidence scoring algorithm
- Mock data structure examples
- API documentation

---

### 6. [AI_IMPLEMENTATION_SUMMARY.md](AI_IMPLEMENTATION_SUMMARY.md)
**Audience:** Developers working on AI features

**Contents:**
- File structure for AI modules
- Implementation details for 3 core services
- Testing guide
- Production readiness checklist

---

### 7. [AI_PROMPT_SYSTEM.md](apps/backend/src/modules/ai/AI_PROMPT_SYSTEM.md)
**Audience:** Backend developers extending AI capabilities

**Contents:**
- System architecture
- Supported prompts with examples
- Intent classification
- Confidence scoring
- Data source mapping
- Mock data examples

---

## 🎯 CRO System Documentation

### 8. [CRO_INTELLIGENCE_ENGINE.md](CRO_INTELLIGENCE_ENGINE.md)
**Audience:** Developers working on CRO features

**Contents:**
- 5 detection algorithms explained
- Priority scoring formula
- Recommendation generation logic
- Impact calculation methodology
- Real-world examples

---

## 🎨 Frontend Documentation

### 9. [apps/frontend/FRONTEND_ARCHITECTURE.md](apps/frontend/FRONTEND_ARCHITECTURE.md)
**Audience:** Frontend developers

**Contents:**
- Next.js App Router structure
- Component organization
- State management
- API integration patterns

---

### 10. [apps/frontend/IMPLEMENTATION_GUIDE.md](apps/frontend/IMPLEMENTATION_GUIDE.md)
**Audience:** Frontend developers building UI

**Contents:**
- Code examples for common patterns
- Component implementation
- API integration examples

---

### 11. [apps/frontend/DESIGN_SYSTEM.md](apps/frontend/DESIGN_SYSTEM.md)
**Audience:** Frontend developers, designers

**Contents:**
- Color palette
- Typography scale
- Spacing system
- Component guidelines

---

### 12. [apps/frontend/FRONTEND_STATUS.md](apps/frontend/FRONTEND_STATUS.md)
**Audience:** Project managers, developers

**Contents:**
- Implementation checklist
- Feature status
- What's done vs. pending

---

## 🔧 Backend Documentation

### 13. [apps/backend/ARCHITECTURE.md](apps/backend/ARCHITECTURE.md)
**Audience:** Backend developers

**Contents:**
- Module structure
- Service organization
- Dependency injection
- API design patterns

---

### 14. [apps/backend/src/infrastructure/DATA_LAYER.md](apps/backend/src/infrastructure/DATA_LAYER.md)
**Audience:** Backend developers, database admins

**Contents:**
- Database schema
- Entity relationships
- Repository pattern
- OpenSearch integration
- Vector DB interface

---

## 🚀 Quick Navigation by Role

### **New Developer** (Start Here)
1. [README.md](README.md)
2. [docs/onboarding.md](docs/onboarding.md)
3. [docs/architecture.md](docs/architecture.md)
4. [docs/system-flow.md](docs/system-flow.md)

### **Frontend Developer**
1. [README.md](README.md)
2. [apps/frontend/FRONTEND_ARCHITECTURE.md](apps/frontend/FRONTEND_ARCHITECTURE.md)
3. [apps/frontend/IMPLEMENTATION_GUIDE.md](apps/frontend/IMPLEMENTATION_GUIDE.md)
4. [apps/frontend/DESIGN_SYSTEM.md](apps/frontend/DESIGN_SYSTEM.md)

### **Backend Developer**
1. [README.md](README.md)
2. [apps/backend/ARCHITECTURE.md](apps/backend/ARCHITECTURE.md)
3. [docs/architecture.md](docs/architecture.md)
4. [apps/backend/src/infrastructure/DATA_LAYER.md](apps/backend/src/infrastructure/DATA_LAYER.md)

### **AI/ML Engineer**
1. [README.md](README.md)
2. [AI_SYSTEM_FLOW.md](AI_SYSTEM_FLOW.md)
3. [AI_PROMPT_SYSTEM.md](apps/backend/src/modules/ai/AI_PROMPT_SYSTEM.md)
4. [AI_IMPLEMENTATION_SUMMARY.md](AI_IMPLEMENTATION_SUMMARY.md)

### **Product Manager / Stakeholder**
1. [README.md](README.md)
2. [docs/system-flow.md](docs/system-flow.md)
3. [FRONTEND_STATUS.md](apps/frontend/FRONTEND_STATUS.md)

### **DevOps Engineer**
1. [README.md](README.md)
2. [docs/architecture.md](docs/architecture.md)
3. [docker/docker-compose.yml](docker/docker-compose.yml)

---

## 📖 Documentation Standards

All documentation follows these principles:

- ✅ **Clear hierarchy** - Organized with headers and sections
- ✅ **Code examples** - Real, working code samples
- ✅ **Visual aids** - Diagrams and flow charts
- ✅ **Practical focus** - How-to guides, not just theory
- ✅ **Up-to-date** - Reflects current implementation
- ✅ **Searchable** - Use Cmd+F to find topics quickly

---

## 🔄 Keeping Docs Updated

When you make changes to the codebase:

- **Added new module?** → Update architecture.md
- **Changed data flow?** → Update system-flow.md
- **New feature?** → Add to README.md
- **Changed setup process?** → Update onboarding.md
- **New AI prompt?** → Update AI_PROMPT_SYSTEM.md
- **New CRO algorithm?** → Update CRO_INTELLIGENCE_ENGINE.md

---

## 💡 Contributing to Documentation

Found outdated info or want to improve docs?

1. Make changes to the relevant file
2. Test that examples still work
3. Submit a PR with `docs:` prefix
4. Tag for review

Example commit: `docs: update AI prompt examples`

---

**Last Updated:** January 2024
**Maintained By:** Riviso Engineering Team
