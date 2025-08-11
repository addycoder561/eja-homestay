@echo off
REM Batch file to push code to GitHub
REM Usage: push-to-github.bat [commit-message] [branch]

echo 🚀 Starting GitHub Push Process...
echo.

REM Check if PowerShell is available
powershell -Command "Get-Command" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell is not available!
    echo Please install PowerShell or use Git commands manually.
    pause
    exit /b 1
)

REM Execute the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0push-to-github.ps1" %*

REM Pause to show results
pause
