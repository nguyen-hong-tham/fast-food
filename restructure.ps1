# 🔧 RESTRUCTURE PROJECT - Sắp Xếp Lại Cấu Trúc Project

Write-Host "🚀 Starting project restructure..." -ForegroundColor Cyan
Write-Host ""

# Set base path
$basePath = "D:\SGU\CNPM\project\sgu_cnpm_foodfast"
Set-Location $basePath

Write-Host "📁 Current directory: $basePath" -ForegroundColor Yellow
Write-Host ""

# Backup first (recommended)
Write-Host "💾 Step 1: Creating backup..." -ForegroundColor Green
$backupPath = "$basePath\.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (-not (Test-Path $backupPath)) {
    Write-Host "   Creating backup at: $backupPath" -ForegroundColor Gray
    # Note: Uncomment the line below to actually create backup
    # Copy-Item -Path $basePath -Destination $backupPath -Recurse -Exclude @('node_modules', '.git', '.expo')
    Write-Host "   ⚠️  Backup creation disabled by default. Uncomment in script to enable." -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Analyze current structure
Write-Host "🔍 Step 2: Analyzing current structure..." -ForegroundColor Green
$appWebPath = "$basePath\app-web"
$adminPath = "$basePath\admin"
$nestedAppWeb = "$appWebPath\app-web"
$nestedAdminWeb = "$appWebPath\admin-web"

Write-Host "   Checking paths:" -ForegroundColor Gray
Write-Host "   ✓ app-web: $(Test-Path $appWebPath)" -ForegroundColor $(if (Test-Path $appWebPath) { 'Green' } else { 'Red' })
Write-Host "   ✓ admin: $(Test-Path $adminPath)" -ForegroundColor $(if (Test-Path $adminPath) { 'Green' } else { 'Red' })
Write-Host "   ✓ app-web/app-web (nested): $(Test-Path $nestedAppWeb)" -ForegroundColor $(if (Test-Path $nestedAppWeb) { 'Yellow' } else { 'Gray' })
Write-Host "   ✓ app-web/admin-web (nested): $(Test-Path $nestedAdminWeb)" -ForegroundColor $(if (Test-Path $nestedAdminWeb) { 'Yellow' } else { 'Gray' })
Write-Host ""

# Step 3: Show proposed structure
Write-Host "📋 Step 3: Proposed new structure:" -ForegroundColor Green
Write-Host @"
   
   sgu_cnpm_foodfast/
   ├── mobile/              (from app-web/)
   ├── admin/               (keep as is)
   ├── docs/                (project documentation)
   ├── README.md
   └── .gitignore

"@ -ForegroundColor Cyan
Write-Host ""

# Step 4: Ask for confirmation
Write-Host "⚠️  WARNING: This will restructure your project!" -ForegroundColor Yellow
Write-Host "   - Rename 'app-web/' to 'mobile/'" -ForegroundColor Yellow
Write-Host "   - Remove nested 'app-web/app-web/' duplicate" -ForegroundColor Yellow
Write-Host "   - Remove nested 'app-web/admin-web/' (already have admin/)" -ForegroundColor Yellow
Write-Host "   - Clean up root directory" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host ""
    Write-Host "❌ Restructure cancelled by user." -ForegroundColor Red
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "🔄 Step 5: Starting restructure..." -ForegroundColor Green
Write-Host ""

# Step 5a: Handle nested duplicates
if (Test-Path $nestedAppWeb) {
    Write-Host "   🗑️  Removing nested app-web/app-web/ duplicate..." -ForegroundColor Yellow
    # Remove-Item -Path $nestedAppWeb -Recurse -Force
    Write-Host "   ⚠️  Manual action required: Delete 'app-web/app-web/' folder" -ForegroundColor Yellow
}

if (Test-Path $nestedAdminWeb) {
    Write-Host "   🗑️  Removing nested app-web/admin-web/ (duplicate of admin/)..." -ForegroundColor Yellow
    # Remove-Item -Path $nestedAdminWeb -Recurse -Force
    Write-Host "   ⚠️  Manual action required: Delete 'app-web/admin-web/' folder" -ForegroundColor Yellow
}

Write-Host ""

# Step 5b: Rename app-web to mobile
Write-Host "   📝 Renaming 'app-web/' to 'mobile/'..." -ForegroundColor Cyan
if (Test-Path $appWebPath) {
    $mobilePath = "$basePath\mobile"
    if (-not (Test-Path $mobilePath)) {
        # Rename-Item -Path $appWebPath -NewName "mobile"
        Write-Host "   ⚠️  Manual action required: Rename 'app-web' to 'mobile'" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  'mobile/' already exists. Please resolve manually." -ForegroundColor Red
    }
}

Write-Host ""

# Step 5c: Create docs folder at root
Write-Host "   📚 Creating root 'docs/' folder..." -ForegroundColor Cyan
$rootDocsPath = "$basePath\docs"
if (-not (Test-Path $rootDocsPath)) {
    New-Item -Path $rootDocsPath -ItemType Directory -Force | Out-Null
    Write-Host "   ✓ Created: docs/" -ForegroundColor Green
    
    # Move documentation files
    if (Test-Path "$appWebPath\docs") {
        Write-Host "   📄 Moving mobile docs to root docs/mobile/..." -ForegroundColor Gray
        New-Item -Path "$rootDocsPath\mobile" -ItemType Directory -Force | Out-Null
        # Copy-Item -Path "$appWebPath\docs\*" -Destination "$rootDocsPath\mobile\" -Recurse
        Write-Host "   ⚠️  Manual action: Copy 'app-web/docs/*' to 'docs/mobile/'" -ForegroundColor Yellow
    }
    
    if (Test-Path "$adminPath\docs") {
        Write-Host "   📄 Moving admin docs to root docs/admin/..." -ForegroundColor Gray
        New-Item -Path "$rootDocsPath\admin" -ItemType Directory -Force | Out-Null
        # Copy-Item -Path "$adminPath\docs\*" -Destination "$rootDocsPath\admin\" -Recurse
        Write-Host "   ⚠️  Manual action: Copy 'admin/docs/*' to 'docs/admin/'" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  docs/ already exists" -ForegroundColor Gray
}

Write-Host ""

# Step 5d: Clean up root directory
Write-Host "   🧹 Cleaning up root directory..." -ForegroundColor Cyan
$rootPackageLock = "$basePath\package-lock.json"
if (Test-Path $rootPackageLock) {
    Write-Host "   🗑️  Removing root package-lock.json (not needed)..." -ForegroundColor Yellow
    # Remove-Item -Path $rootPackageLock -Force
    Write-Host "   ⚠️  Manual action: Delete 'package-lock.json' at root" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Create .gitignore updates
Write-Host "📝 Step 6: Updating .gitignore..." -ForegroundColor Green
$gitignorePath = "$basePath\.gitignore"
$gitignoreContent = @"
# Node modules
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Build outputs
dist/
build/
.expo/
web-build/

# Logs
*.log

# TypeScript
*.tsbuildinfo

# Backup folders
.backup_*/

# Mobile specific
mobile/.expo/
mobile/dist/
mobile/web-build/

# Admin specific
admin/dist/
admin/node_modules/

"@

# Uncomment to write
# Set-Content -Path $gitignorePath -Value $gitignoreContent
Write-Host "   ⚠️  Manual action: Update .gitignore with new structure" -ForegroundColor Yellow

Write-Host ""

# Step 7: Summary
Write-Host "✅ Step 7: Restructure plan completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Manual Actions Required:" -ForegroundColor Cyan
Write-Host "   1. Delete 'app-web/app-web/' folder (nested duplicate)" -ForegroundColor Yellow
Write-Host "   2. Delete 'app-web/admin-web/' folder (already have admin/)" -ForegroundColor Yellow
Write-Host "   3. Rename 'app-web/' to 'mobile/'" -ForegroundColor Yellow
Write-Host "   4. Move 'app-web/docs/*' to 'docs/mobile/'" -ForegroundColor Yellow
Write-Host "   5. Move 'admin/docs/*' to 'docs/admin/'" -ForegroundColor Yellow
Write-Host "   6. Delete root 'package-lock.json'" -ForegroundColor Yellow
Write-Host "   7. Update imports in code (app-web → mobile)" -ForegroundColor Yellow
Write-Host ""

Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review the changes" -ForegroundColor Gray
Write-Host "   2. Test both mobile and admin apps" -ForegroundColor Gray
Write-Host "   3. Update README.md with new structure" -ForegroundColor Gray
Write-Host "   4. Commit changes to Git" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Done! Check the manual actions list above." -ForegroundColor Green
Write-Host ""

# Pause to see results
Read-Host "Press Enter to exit"
