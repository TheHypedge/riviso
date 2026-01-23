# GitHub Push Instructions

## Important: GitHub requires a Personal Access Token

GitHub no longer accepts account passwords for git operations. You need to create a Personal Access Token.

## Quick Steps:

### 1. Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Riviso Push Token"
4. Expiration: 90 days (or your choice)
5. **Check the "repo" scope** (full control of private repositories)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

### 2. Create Repository on GitHub
1. Go to: https://github.com/new
2. Repository name: `riviso`
3. Description: "AI-Driven Growth Intelligence Platform"
4. Choose Private or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 3. Push the Code

Run this command:
```bash
git push -u origin main
```

When prompted:
- **Username**: `thisisakhileshsoni`
- **Password**: [Paste your Personal Access Token here]

## Alternative: Use the Setup Script

Run the automated script:
```bash
./setup-github.sh
```

This script will guide you through the process step-by-step.

## Current Status

✅ Git repository initialized
✅ Initial commit created (185 files, 49,109 lines)
✅ Remote configured: https://github.com/thisisakhileshsoni/riviso.git
✅ Branch set to: main

Ready to push once you have your Personal Access Token!
