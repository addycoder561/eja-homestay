# PowerShell Script to Push Code to GitHub
# Usage: .\scripts\push-to-github.ps1

param(
    [string]$CommitMessage = "",
    [string]$Branch = "main",
    [switch]$Force = $false,
    [switch]$SkipBuild = $false
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-GitRepository {
    try {
        $gitStatus = git status 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
        return $false
    }
    catch {
        return $false
    }
}

function Test-GitRemote {
    param([string]$RemoteName = "origin")
    try {
        $remotes = git remote -v 2>&1
        if ($remotes -match $RemoteName) {
            return $true
        }
        return $false
    }
    catch {
        return $false
    }
}

# Main execution
Write-ColorOutput "🚀 Starting GitHub Push Process..." $Blue
Write-ColorOutput "=====================================" $Blue

# Check if Git is installed
Write-ColorOutput "📋 Checking Git installation..." $Yellow
if (-not (Test-Command "git")) {
    Write-ColorOutput "❌ Git is not installed or not in PATH!" $Red
    Write-ColorOutput "Please install Git from: https://git-scm.com/" $Red
    exit 1
}
Write-ColorOutput "✅ Git is installed" $Green

# Check if we're in a Git repository
Write-ColorOutput "📋 Checking if this is a Git repository..." $Yellow
if (-not (Test-GitRepository)) {
    Write-ColorOutput "❌ This directory is not a Git repository!" $Red
    Write-ColorOutput "Please run 'git init' first or navigate to a Git repository." $Red
    exit 1
}
Write-ColorOutput "✅ This is a Git repository" $Green

# Check if remote origin exists
Write-ColorOutput "📋 Checking for remote origin..." $Yellow
if (-not (Test-GitRemote "origin")) {
    Write-ColorOutput "❌ No remote 'origin' found!" $Red
    Write-ColorOutput "Please add a remote origin first:" $Red
    Write-ColorOutput "git remote add origin <your-github-repo-url>" $Red
    exit 1
}
Write-ColorOutput "✅ Remote origin found" $Green

# Get current branch
$currentBranch = git branch --show-current 2>&1
Write-ColorOutput "📋 Current branch: $currentBranch" $Yellow

# Check if we need to switch branches
if ($currentBranch -ne $Branch) {
    Write-ColorOutput "📋 Switching to branch: $Branch" $Yellow
    git checkout $Branch 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to switch to branch: $Branch" $Red
        Write-ColorOutput "Creating new branch: $Branch" $Yellow
        git checkout -b $Branch 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Failed to create branch: $Branch" $Red
            exit 1
        }
    }
    Write-ColorOutput "✅ Switched to branch: $Branch" $Green
}

# Check for uncommitted changes
Write-ColorOutput "📋 Checking for uncommitted changes..." $Yellow
$status = git status --porcelain 2>&1
if ($status) {
    Write-ColorOutput "📝 Found uncommitted changes:" $Yellow
    Write-ColorOutput $status $Yellow
    
    # Build the project if not skipped
    if (-not $SkipBuild) {
        Write-ColorOutput "🔨 Building the project..." $Yellow
        npm run build 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Build failed! Please fix the errors before pushing." $Red
            exit 1
        }
        Write-ColorOutput "✅ Build completed successfully" $Green
    }
    
    # Add all changes
    Write-ColorOutput "📋 Adding all changes to staging..." $Yellow
    git add . 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to add changes to staging" $Red
        exit 1
    }
    Write-ColorOutput "✅ Changes added to staging" $Green
    
    # Get commit message
    if (-not $CommitMessage) {
        $CommitMessage = Read-Host "📝 Enter commit message"
        if (-not $CommitMessage) {
            $CommitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        }
    }
    
    # Commit changes
    Write-ColorOutput "📋 Committing changes..." $Yellow
    git commit -m $CommitMessage 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to commit changes" $Red
        exit 1
    }
    Write-ColorOutput "✅ Changes committed with message: '$CommitMessage'" $Green
} else {
    Write-ColorOutput "📋 No uncommitted changes found" $Green
}

# Check if we need to pull latest changes
Write-ColorOutput "📋 Checking for remote changes..." $Yellow
git fetch origin 2>&1
$localCommit = git rev-parse HEAD 2>&1
$remoteCommit = git rev-parse origin/$Branch 2>&1

if ($localCommit -ne $remoteCommit) {
    Write-ColorOutput "📋 Remote has new changes. Pulling latest..." $Yellow
    git pull origin $Branch 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to pull latest changes" $Red
        Write-ColorOutput "You may need to resolve conflicts manually." $Red
        exit 1
    }
    Write-ColorOutput "✅ Latest changes pulled successfully" $Green
} else {
    Write-ColorOutput "✅ Local branch is up to date" $Green
}

# Push to GitHub
Write-ColorOutput "📋 Pushing to GitHub..." $Yellow
if ($Force) {
    Write-ColorOutput "⚠️  Using force push (--force-with-lease)" $Yellow
    git push origin $Branch --force-with-lease 2>&1
} else {
    git push origin $Branch 2>&1
}

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "❌ Failed to push to GitHub" $Red
    Write-ColorOutput "This might be due to:" $Red
    Write-ColorOutput "1. Authentication issues" $Red
    Write-ColorOutput "2. Network connectivity problems" $Red
    Write-ColorOutput "3. Remote branch protection rules" $Red
    Write-ColorOutput "4. Conflicts that need to be resolved" $Red
    exit 1
}

Write-ColorOutput "✅ Successfully pushed to GitHub!" $Green
Write-ColorOutput "=====================================" $Blue
Write-ColorOutput "🎉 Your code is now live on GitHub!" $Green
Write-ColorOutput "Branch: $Branch" $Blue
Write-ColorOutput "Commit: $CommitMessage" $Blue

# Show the remote URL
$remoteUrl = git remote get-url origin 2>&1
if ($remoteUrl) {
    Write-ColorOutput "Repository: $remoteUrl" $Blue
}

Write-ColorOutput "=====================================" $Blue
