#!/bin/bash

# GitHub Repository Setup and Push Script
# This script will help you push your code to GitHub

GITHUB_USER="thisisakhileshsoni"
REPO_NAME="riviso"

echo "=========================================="
echo "GitHub Repository Setup"
echo "=========================================="
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "Remote 'origin' already exists:"
    git remote get-url origin
    echo ""
    read -p "Do you want to remove it and set a new one? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "Keeping existing remote."
    fi
fi

echo "Step 1: Create a Personal Access Token"
echo "--------------------------------------"
echo "GitHub no longer accepts passwords for git operations."
echo "You need to create a Personal Access Token:"
echo ""
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Name it: 'Riviso Push Token'"
echo "4. Select expiration: 90 days (or your preference)"
echo "5. Check the 'repo' scope (full control of private repositories)"
echo "6. Click 'Generate token'"
echo "7. COPY THE TOKEN IMMEDIATELY (you won't see it again!)"
echo ""
read -p "Press Enter when you have your token ready..."

echo ""
echo "Step 2: Create Repository on GitHub"
echo "-----------------------------------"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Description: 'AI-Driven Growth Intelligence Platform'"
echo "4. Choose Private or Public"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
read -p "Press Enter when the repository is created..."

echo ""
echo "Step 3: Add Remote and Push"
echo "----------------------------"
echo "Adding remote repository..."
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git 2>/dev/null || git remote set-url origin https://github.com/$GITHUB_USER/$REPO_NAME.git

echo ""
echo "Now pushing code to GitHub..."
echo "When prompted:"
echo "  Username: $GITHUB_USER"
echo "  Password: [Paste your Personal Access Token]"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ Successfully pushed to GitHub!"
    echo "=========================================="
    echo ""
    echo "Repository URL: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "✗ Push failed"
    echo "=========================================="
    echo ""
    echo "Common issues:"
    echo "1. Make sure you used a Personal Access Token (not password)"
    echo "2. Make sure the token has 'repo' scope"
    echo "3. Make sure the repository exists on GitHub"
    echo ""
    echo "Try running this script again or push manually:"
    echo "  git push -u origin main"
    echo ""
fi
