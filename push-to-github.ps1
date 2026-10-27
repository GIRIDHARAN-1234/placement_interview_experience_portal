# Push to GitHub Helper Script
param(
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Please enter your GitHub repository URL (e.g. https://github.com/USERNAME/placement-portal.git)"
}

if (-not $RepoUrl) {
    Write-Error "Repository URL cannot be empty."
    exit 1
}

Write-Host "Configuring git remote..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $RepoUrl
git branch -M main

Write-Host "Pushing code to $RepoUrl..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS! Your code is now live on GitHub." -ForegroundColor Green
    Write-Host "Next step: Open Render.com and create a Web Service linked to this repository." -ForegroundColor Cyan
} else {
    Write-Host "`nPush failed. Please ensure you are logged into GitHub in your browser or terminal and the repository exists." -ForegroundColor Yellow
}
