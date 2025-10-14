# 🔧 Manual Restructure Steps

## Quick Commands (PowerShell)

```powershell
# Navigate to project
cd D:\SGU\CNPM\project\sgu_cnpm_foodfast

# 1. Delete duplicates
Remove-Item -Path "app-web\app-web" -Recurse -Force
Remove-Item -Path "app-web\admin-web" -Recurse -Force

# 2. Rename app-web to mobile
Rename-Item -Path "app-web" -NewName "mobile"

# 3. Create docs structure
New-Item -Path "docs" -ItemType Directory -Force
New-Item -Path "docs\mobile" -ItemType Directory -Force  
New-Item -Path "docs\admin" -ItemType Directory -Force
New-Item -Path "docs\database" -ItemType Directory -Force
New-Item -Path "docs\diagrams" -ItemType Directory -Force

# 4. Move docs
Copy-Item -Path "mobile\docs\*" -Destination "docs\mobile\" -Recurse
Copy-Item -Path "admin\docs\*" -Destination "docs\admin\" -Recurse
if (Test-Path "mobile\drawio") {
    Copy-Item -Path "mobile\drawio\*" -Destination "docs\diagrams\" -Recurse
}

# 5. Clean up
Remove-Item -Path "mobile\docs" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "admin\docs" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "mobile\drawio" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# 6. Verify
Get-ChildItem | Select-Object Name
```

---

## Verify New Structure

```powershell
tree /F /A
```

Should look like:
```
sgu_cnpm_foodfast
├── mobile/
├── admin/
├── docs/
├── README.md
└── .gitignore
```

---

## After Restructure

### 1. Update README.md

Change all references from `app-web` to `mobile`:

```markdown
# Before
cd app-web
npm install

# After  
cd mobile
npm install
```

### 2. Commit Changes

```bash
git add -A
git commit -m "refactor: restructure project - rename app-web to mobile, organize docs"
git push
```

### 3. Test Apps

```bash
# Test mobile
cd mobile
npm start

# Test admin
cd admin
npm run dev
```

---

## Done! ✅
