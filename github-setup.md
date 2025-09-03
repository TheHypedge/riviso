# 🐙 GitHub Setup Guide for RIVISO

## Step 1: Create GitHub Repository

### 1.1 Create New Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `riviso`
   - **Description**: `Advanced SEO Analytics Platform - Comprehensive website audit and optimization tool`
   - **Visibility**: Public (recommended for open source)
   - **Initialize**: Don't check any boxes (we'll push existing code)

### 1.2 Get Repository URL
After creating, copy the repository URL (it will look like):
```
https://github.com/yourusername/riviso.git
```

## Step 2: Initialize Git and Push Code

### 2.1 Initialize Git Repository
```bash
# Navigate to your project directory
cd /Users/akhileshsoni/seo-audit

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: RIVISO SEO Analytics Platform

- Complete Next.js frontend with audit dashboard
- FastAPI backend with comprehensive SEO analysis
- Top Keywords analysis feature
- Real-time audit progress tracking
- Responsive design with Tailwind CSS
- Production-ready deployment configurations"
```

### 2.2 Connect to GitHub
```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/riviso.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Set Up Repository Settings

### 3.1 Repository Settings
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Configure the following:

**General:**
- Enable "Issues" for bug tracking
- Enable "Projects" for task management
- Enable "Wiki" for documentation
- Enable "Discussions" for community

**Branches:**
- Set `main` as default branch
- Add branch protection rules (optional)

### 3.2 Add Repository Topics
In the repository settings, add these topics:
- `seo`
- `analytics`
- `nextjs`
- `fastapi`
- `typescript`
- `python`
- `tailwindcss`
- `website-audit`

## Step 4: Create GitHub Actions (Optional)

### 4.1 Create Workflow Directory
```bash
mkdir -p .github/workflows
```

### 4.2 Create CI/CD Workflow
Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install pnpm
      run: npm install -g pnpm
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Install Python dependencies
      run: |
        cd services/audit-api
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        pnpm test
        cd services/audit-api && python -m pytest
    
    - name: Build frontend
      run: pnpm build
    
    - name: Lint code
      run: pnpm lint
```

## Step 5: Create Issue Templates

### 5.1 Bug Report Template
Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

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

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### 5.2 Feature Request Template
Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Step 6: Create Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## Step 7: Set Up Branch Protection

1. Go to repository Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators

## Step 8: Create Releases

### 8.1 Create First Release
1. Go to "Releases" in your repository
2. Click "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `RIVISO v1.0.0 - Initial Release`
5. Description:
```markdown
## 🎉 RIVISO v1.0.0 - Initial Release

### ✨ Features
- Complete SEO audit platform
- Real-time audit progress tracking
- Top Keywords analysis
- Responsive design
- Production-ready deployment

### 🚀 Getting Started
1. Clone the repository
2. Follow the setup instructions in README.md
3. Start auditing websites!

### 📊 What's Included
- Next.js frontend with TypeScript
- FastAPI backend with Python
- PostgreSQL database setup
- Docker configuration
- Hostinger deployment guide
```

## Step 9: Set Up GitHub Pages (Optional)

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (create this branch)
4. This will create a documentation site at `https://yourusername.github.io/riviso`

## Step 10: Community Guidelines

Create `CONTRIBUTING.md`:

```markdown
# Contributing to RIVISO

Thank you for your interest in contributing to RIVISO! 

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Code Style

- Use TypeScript for frontend code
- Follow PEP 8 for Python code
- Use meaningful commit messages
- Add comments for complex logic

## Reporting Issues

Please use the issue templates when reporting bugs or requesting features.
```

## 🎉 You're All Set!

Your RIVISO repository is now properly set up on GitHub with:
- ✅ Complete codebase pushed
- ✅ Proper documentation
- ✅ Issue and PR templates
- ✅ CI/CD pipeline (optional)
- ✅ Branch protection
- ✅ Community guidelines

**Next Steps:**
1. Share your repository with the community
2. Start accepting contributions
3. Deploy to production using the deployment guides
4. Monitor issues and pull requests

**Repository URL:** `https://github.com/yourusername/riviso`
