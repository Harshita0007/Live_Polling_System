#!/bin/bash

# Live Polling System - Vercel + Railway Deployment Helper
# This script helps you deploy your polling system using Vercel (frontend) and Railway (backend)

set -e

echo "🚀 Live Polling System - Vercel + Railway Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ] || [ ! -f "polling-backend/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking project structure..."
print_success "Project structure looks good!"

echo ""
echo "🎯 Vercel + Railway Deployment Guide"
echo "===================================="
echo ""
echo "📋 Railway Backend Setup:"
echo "1. Go to https://railway.app and sign up with GitHub"
echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
echo "3. Select your repository and choose 'polling-backend' as root directory"
echo "4. Add environment variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=5000"
echo "   - CLIENT_URL=https://your-frontend-url.vercel.app"
echo ""
echo "📋 Vercel Frontend Setup:"
echo "1. Go to https://vercel.com and sign up with GitHub"
echo "2. Click 'New Project' → Import from GitHub"
echo "3. Select your repository and set root directory to 'frontend'"
echo "4. Add environment variables:"
echo "   - REACT_APP_SERVER_URL=https://your-backend-url.railway.app"
echo "   - REACT_APP_SOCKET_URL=https://your-backend-url.railway.app"
echo ""
echo "📋 Final Step - Update CORS:"
echo "1. Copy your Vercel URL"
echo "2. Go back to Railway → Update CLIENT_URL with your Vercel URL"
echo "3. Railway will auto-redeploy"
echo ""

print_warning "Remember to update CLIENT_URL in Railway with your Vercel URL after deployment!"

echo ""
print_status "Next steps:"
echo "1. Deploy backend on Railway first"
echo "2. Deploy frontend on Vercel"
echo "3. Update CORS configuration"
echo "4. Test your deployment"
echo ""
print_success "Your polling system will be live in ~5-10 minutes! 🎉"