# git-safe-pull.ps1
git stash push -m "Auto backup before merging remote"
$timestamp = Get-Date -UFormat %s
$branchName = "my-local-backup-branch-$timestamp"
git checkout -b $branchName
git checkout main
git pull origin main
git checkout $branchName
git merge main
Write-Output "`n✅ You're now on '$branchName' with all remote changes merged in."
