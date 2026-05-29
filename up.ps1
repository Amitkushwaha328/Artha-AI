param (
    [string]$Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "Staging all changes..." -ForegroundColor Blue
git add .

Write-Host "Committing with message: '$Message'..." -ForegroundColor Blue
git commit -m $Message

Write-Host "Pushing to GitHub..." -ForegroundColor Blue
git push origin Artha-AI

Write-Host "Done! Your changes are live on GitHub." -ForegroundColor Green
