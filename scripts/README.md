# GitHub Push Scripts

This directory contains scripts to automate the process of pushing code to GitHub.

## Files

- `push-to-github.ps1` - PowerShell script with full functionality
- `push-to-github.bat` - Batch file wrapper for easier execution

## Usage

### Method 1: Using the Batch File (Recommended)

```bash
# Basic usage - will prompt for commit message
.\scripts\push-to-github.bat

# With commit message
.\scripts\push-to-github.bat "Add new features"

# With commit message and branch
.\scripts\push-to-github.bat "Fix bug" develop
```

### Method 2: Using PowerShell Directly

```powershell
# Basic usage
.\scripts\push-to-github.ps1

# With parameters
.\scripts\push-to-github.ps1 -CommitMessage "Add new features" -Branch "main"

# Force push (use with caution)
.\scripts\push-to-github.ps1 -CommitMessage "Force update" -Force

# Skip build process
.\scripts\push-to-github.ps1 -CommitMessage "Quick fix" -SkipBuild
```

## Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `CommitMessage` | string | Commit message for the changes | Prompts user if empty |
| `Branch` | string | Target branch to push to | "main" |
| `Force` | switch | Use force push (--force-with-lease) | false |
| `SkipBuild` | switch | Skip the build process | false |

## Features

✅ **Automatic Checks:**
- Git installation verification
- Repository validation
- Remote origin check
- Branch management

✅ **Build Integration:**
- Automatic `npm run build` before push
- Build failure detection
- Option to skip build

✅ **Smart Git Operations:**
- Automatic staging of changes
- Commit message handling
- Pull latest changes before push
- Conflict detection

✅ **Error Handling:**
- Comprehensive error messages
- Exit codes for automation
- User-friendly feedback

✅ **Safety Features:**
- Force push protection
- Conflict resolution guidance
- Authentication error detection

## Prerequisites

1. **Git installed** and in PATH
2. **PowerShell** (comes with Windows 10/11)
3. **GitHub repository** set up with remote origin
4. **Authentication** configured (SSH key or Personal Access Token)

## Setup

### 1. Initialize Git Repository (if not already done)
```bash
git init
git remote add origin https://github.com/yourusername/your-repo.git
```

### 2. Configure Git (if not already done)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Set up Authentication
- **SSH Key**: Add your SSH key to GitHub
- **Personal Access Token**: Use token as password when prompted

## Examples

### Quick Push
```bash
.\scripts\push-to-github.bat "Update admin dashboard"
```

### Development Branch
```bash
.\scripts\push-to-github.bat "Add new features" develop
```

### Force Push (use carefully)
```powershell
.\scripts\push-to-github.ps1 -CommitMessage "Reset branch" -Force
```

### Skip Build for Quick Fixes
```powershell
.\scripts\push-to-github.ps1 -CommitMessage "Fix typo" -SkipBuild
```

## Troubleshooting

### Common Issues

1. **"Git is not installed"**
   - Install Git from https://git-scm.com/
   - Add Git to your system PATH

2. **"No remote origin found"**
   - Add remote: `git remote add origin <your-repo-url>`

3. **"Authentication failed"**
   - Set up SSH key or Personal Access Token
   - Configure Git credentials

4. **"Build failed"**
   - Fix build errors before pushing
   - Use `-SkipBuild` flag if build is not needed

5. **"Push rejected"**
   - Pull latest changes first
   - Resolve any conflicts
   - Use force push only if necessary

### Manual Git Commands

If the script fails, you can use these manual commands:

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your commit message"

# Pull latest
git pull origin main

# Push
git push origin main
```

## Security Notes

- Never commit sensitive information (API keys, passwords)
- Use `.gitignore` to exclude sensitive files
- Review changes before pushing
- Use force push only when absolutely necessary

## Support

If you encounter issues:
1. Check the error messages in the script output
2. Verify your Git configuration
3. Ensure your GitHub repository is properly set up
4. Check your network connectivity
