#!/bin/bash
set -e
echo "========================================="
echo "COMPREHENSIVE BUILD TEST"
echo "========================================="
echo ""
echo "Step 1: Installing dependencies..."
npm install --quiet

echo ""
echo "Step 2: Building workspace packages..."
npm run build:packages

echo ""
echo "Step 3: Verifying package outputs..."
for pkg in shared-types ai-core ui-components; do
  if [ -d "packages/$pkg/dist" ]; then
    count=$(find "packages/$pkg/dist" -name "*.js" | wc -l | tr -d ' ')
    echo "  ✓ packages/$pkg/dist exists ($count JS files)"
  else
    echo "  ✗ packages/$pkg/dist MISSING"
    exit 1
  fi
done

echo ""
echo "Step 4: Building frontend..."
cd apps/frontend && npm run build

echo ""
echo "========================================="
echo "✅ ALL BUILDS SUCCESSFUL"
echo "========================================="
