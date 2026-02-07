# Repository Cleanup Script
# Run this script to remove obsolete files and folders from Phase I and previous iterations.

Write-Host "Starting Repository Cleanup..." -ForegroundColor Cyan

# Folders to remove
$foldersByPath = @(
    "Phase 1",
    "history",
    "specs-history",
    "todo_app",
    "venv"
)

foreach ($folder in $foldersByPath) {
    if (Test-Path $folder) {
        Write-Host "Removing folder: $folder" -ForegroundColor Yellow
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Files to remove (Root)
$filesByPath = @(
    "APP_OVERVIEW.md",
    "Constitution.md",
    "DEMO_SCRIPT.md",
    "DEPLOYMENT_INSTRUCTIONS.md",
    "VERCEL_DEPLOYMENT_GUIDE.md",
    "STARTUP_GUIDE.md",
    "FINAL_SUMMARY.md",
    "FINAL_VERIFICATION.md",
    "comprehensive_test.py",
    "functional_test.py",
    "test_app.py",
    "test_backend.py",
    "test_comprehensive.py",
    "test_connectivity.py",
    "test_functionality.py",
    "todo_console.py"
)

# Remove task_*.md files (wildcard)
$taskFiles = Get-ChildItem -Path . -Filter "task_*.md" -ErrorAction SilentlyContinue
foreach ($file in $taskFiles) {
    Write-Host "Removing file: $($file.Name)" -ForegroundColor Yellow
    Remove-Item -Path $file.FullName -Force
}

foreach ($file in $filesByPath) {
    if (Test-Path $file) {
        Write-Host "Removing file: $file" -ForegroundColor Yellow
        Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "Your repository is now clean and ready for submission." -ForegroundColor Green
