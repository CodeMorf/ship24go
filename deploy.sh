#!/usr/bin/env bash
set -e

APP_DIR="/www/wwwroot/ship24go.com"
cd "$APP_DIR"

echo "=========================================================="
echo "🚀 [Ship24Go Auto-Deploy] Starting deployment at $(date -u)"
echo "=========================================================="

# 1. Pull latest commits from GitHub main branch
echo "📥 1. Pulling latest code from origin/main..."
git fetch origin main
git merge origin/main --no-edit

VERSION=$(node -p "require('./package.json').version" 2>/dev/null || cat VERSION 2>/dev/null || echo "unknown")
GIT_HASH=$(git rev-parse --short HEAD)

echo "📌 Running version: v${VERSION} (${GIT_HASH})"

# 2. Build production frontend (Vite) and backend (esbuild)
echo "⚡ 2. Compiling production bundles (Vite + esbuild)..."
npm run build

# 3. Reload PM2 application zero-downtime
echo "🔄 3. Reloading PM2 service with updated environment..."
pm2 reload ship24go --update-env

# 4. Verification check
echo "🩺 4. Health check..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/public/brand || echo "000")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ [SUCCESS] Deployment completed successfully! Service is healthy (HTTP 200)."
    echo "[$(date -u)] DEPLOY SUCCESS: v${VERSION} (${GIT_HASH})" >> /www/wwwroot/ship24go.com/deployments.log
else
    echo "⚠️ [WARNING] Service responded with HTTP $HTTP_CODE on health check."
fi
echo "=========================================================="
