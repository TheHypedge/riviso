#!/bin/bash

# Quick GitHub Push Script
# This will authenticate and push your code

echo "=========================================="
echo "Pushing Riviso to GitHub"
echo "=========================================="
echo ""

# Option 1: Use GitHub CLI (Recommended)
if command -v gh &> /dev/null; then
    echo "GitHub CLI detected. Using it to create repo and push..."
    echo ""
    echo "You'll need to authenticate with GitHub CLI:"
    echo "1. Run: gh auth login"
    echo "2. Follow the prompts to authenticate"
    echo "3. Then run this script again, or run:"
    echo ""
    echo "   gh repo create riviso --private --source=. --remote=origin --push"
    echo ""
    read -p "Do you want to authenticate now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh auth login
        if [ $? -eq 0 ]; then
            echo ""
            echo "Creating repository and pushing..."
            gh repo create riviso --private \
                --description "AI-Driven Growth Intelligence Platform" \
                --source=. \
                --remote=origin \
                --push
            exit $?
        fi
    fi
fi

# Option 2: Manual push with Personal Access Token
echo ""
echo "Manual Push Method:"
echo "-------------------"
echo ""
echo "1. Create a Personal Access Token:"
echo "   https://github.com/settings/tokens"
echo "   - Click 'Generate new token (classic)'"
echo "   - Name: 'Riviso Push Token'"
echo "   - Check 'repo' scope"
echo "   - Generate and COPY the token"
echo ""
echo "2. Create repository on GitHub:"
echo "   https://github.com/new"
echo "   - Name: riviso"
echo "   - Private or Public (your choice)"
echo "   - DO NOT initialize with files"
echo ""
echo "3. Push using token:"
echo "   git push -u origin main"
echo "   Username: thisisakhileshsoni"
echo "   Password: [Your Personal Access Token]"
echo ""
