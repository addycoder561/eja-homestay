#!/bin/bash

# EJA Homestay Deployment Script
# This script automates the deployment process to Vercel

set -e

echo "🚀 Starting EJA Homestay deployment..."

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
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_warning "Environment variables not found. Please make sure they are set:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY (optional)"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run linting
print_status "Running linting..."
npm run lint

# Run type checking
print_status "Running type checking..."
npx tsc --noEmit

# Build the project
print_status "Building the project..."
npm run build

print_success "Build completed successfully!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
if [ "$1" = "--prod" ]; then
    print_status "Deploying to production..."
    vercel --prod
else
    print_status "Deploying to preview..."
    vercel
fi

print_success "Deployment completed successfully!"
print_status "Your application should be live at the URL provided above."

# Optional: Run tests if they exist
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    print_status "Running tests..."
    npm test
fi

echo ""
print_success "🎉 Deployment process completed!"
echo ""
print_status "Next steps:"
echo "  1. Check your Vercel dashboard for deployment status"
echo "  2. Verify your environment variables are set correctly"
echo "  3. Test your application functionality"
echo "  4. Set up custom domain if needed"
echo ""
print_status "For support, check the README.md file or create an issue in the repository."
