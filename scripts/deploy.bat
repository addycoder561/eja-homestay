@echo off
REM EJA Homestay Deployment Script for Windows
REM This script automates the deployment process to Vercel

echo 🚀 Starting EJA Homestay deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

echo [SUCCESS] Node.js version check passed: 
node --version

REM Check if environment variables are set
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo [WARNING] Environment variables not found. Please make sure they are set:
    echo   - NEXT_PUBLIC_SUPABASE_URL
    echo   - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo   - SUPABASE_SERVICE_ROLE_KEY (optional)
)

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    exit /b 1
)

REM Run linting
echo [INFO] Running linting...
call npm run lint
if errorlevel 1 (
    echo [WARNING] Linting failed, but continuing with deployment...
)

REM Run type checking
echo [INFO] Running type checking...
call npx tsc --noEmit
if errorlevel 1 (
    echo [WARNING] Type checking failed, but continuing with deployment...
)

REM Build the project
echo [INFO] Building the project...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed.
    exit /b 1
)

echo [SUCCESS] Build completed successfully!

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Vercel CLI not found. Installing...
    call npm install -g vercel
)

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
if "%1"=="--prod" (
    echo [INFO] Deploying to production...
    call vercel --prod
) else (
    echo [INFO] Deploying to preview...
    call vercel
)

if errorlevel 1 (
    echo [ERROR] Deployment failed.
    exit /b 1
)

echo [SUCCESS] Deployment completed successfully!
echo [INFO] Your application should be live at the URL provided above.

REM Optional: Run tests if they exist
findstr /C:"\"test\":" package.json >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Running tests...
    call npm test
)

echo.
echo [SUCCESS] 🎉 Deployment process completed!
echo.
echo [INFO] Next steps:
echo   1. Check your Vercel dashboard for deployment status
echo   2. Verify your environment variables are set correctly
echo   3. Test your application functionality
echo   4. Set up custom domain if needed
echo.
echo [INFO] For support, check the README.md file or create an issue in the repository.

pause
