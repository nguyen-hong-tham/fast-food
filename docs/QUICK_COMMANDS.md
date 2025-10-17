# 🚀 Quick Commands Cheat Sheet

> **Lưu file này để tra cứu nhanh các commands thường dùng**

---

## 📱 Mobile App Commands

### Setup & Run:
```bash
cd mobile
npm install                 # Install dependencies
npm start                   # Start Expo dev server
npm run android             # Run on Android emulator
npm run ios                 # Run on iOS simulator
npx expo start -c           # Clear cache and start
```

### Useful:
```bash
npx expo install [package]  # Install Expo-compatible package
npx expo prebuild           # Generate native code
npx ts-node lib/seed.ts     # Seed database with test data
```

---

## 💻 Admin Dashboard Commands

### Setup & Run:
```bash
cd admin
npm install                 # Install dependencies
npm run dev                 # Start dev server (http://localhost:5173)
npm run build               # Build for production
npm run preview             # Preview production build
```

### Useful:
```bash
npm run lint                # Check code quality
npm run type-check          # TypeScript type checking
```

---

## 🏪 Restaurant Portal Commands (Sau khi tạo)

### Setup & Run:
```bash
cd restaurant-portal
npm install                 # Install dependencies
npm run dev                 # Start dev server (http://localhost:3000)
npm run build               # Build for production
npm run start               # Start production server
```

---

## 🗄️ Database (Appwrite) Commands

### Appwrite CLI:
```bash
# Install Appwrite CLI
npm install -g appwrite

# Login
appwrite login

# Init project
appwrite init project

# Deploy functions
appwrite deploy function

# List collections
appwrite databases listCollections --databaseId=[database-id]
```

### SDK Examples (trong code):
```typescript
import { databases } from './lib/appwrite';

// Create document
await databases.createDocument(
  databaseId, 
  collectionId, 
  ID.unique(),
  { name: 'Test', price: 100 }
);

// List documents
await databases.listDocuments(
  databaseId,
  collectionId,
  [Query.equal('status', 'active')]
);

// Update document
await databases.updateDocument(
  databaseId,
  collectionId,
  documentId,
  { status: 'completed' }
);

// Delete document
await databases.deleteDocument(
  databaseId,
  collectionId,
  documentId
);
```

---

## 🔧 Git Commands

### Daily Workflow:
```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/[issue]-description

# During work
git status                  # Check changes
git add .                   # Stage all changes
git add [file]              # Stage specific file
git commit -m "feat: #[issue] - Description"

# Push to remote
git push origin [branch-name]

# If branch doesn't exist on remote yet
git push -u origin [branch-name]

# Update from main
git checkout main
git pull origin main
git checkout [your-branch]
git merge main              # Or: git rebase main
```

### Branch Management:
```bash
# List all branches
git branch -a

# Delete local branch
git branch -d [branch-name]

# Delete remote branch
git push origin --delete [branch-name]

# Switch branch
git checkout [branch-name]

# Rename branch
git branch -m [old-name] [new-name]
```

### Stash (Tạm lưu changes):
```bash
git stash                   # Save current changes
git stash list              # List all stashes
git stash pop               # Apply and remove stash
git stash apply             # Apply without removing
git stash drop              # Remove stash
```

### Undo Changes:
```bash
# Discard unstaged changes
git checkout -- [file]
git restore [file]

# Unstage file
git reset HEAD [file]

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert commit (create new commit)
git revert [commit-hash]
```

---

## 📦 NPM/Package Management

### Install:
```bash
npm install                 # Install all dependencies
npm install [package]       # Install package
npm install -D [package]    # Install dev dependency
npm install [package]@[version]  # Specific version
```

### Update:
```bash
npm update                  # Update all packages
npm update [package]        # Update specific package
npm outdated                # Check outdated packages
```

### Clean:
```bash
rm -rf node_modules package-lock.json
npm install                 # Reinstall everything
npm cache clean --force     # Clear npm cache
```

---

## 🧪 Testing Commands

### Run Tests:
```bash
# Unit tests
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- [file]          # Specific file

# E2E tests (Mobile)
npx detox build -c ios
npx detox test -c ios

# Coverage
npm test -- --coverage
```

---

## 🐛 Debugging Commands

### Mobile (Expo):
```bash
npx expo start              # Start with options menu
# Press 'r' to reload
# Press 'j' to open debugger
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Press 'c' to clear cache

# Debug specific
npx expo start --no-dev --minify  # Production mode
npx expo start --localhost         # Localhost only
npx expo start --tunnel            # Tunnel mode
```

### React DevTools:
```bash
npm install -g react-devtools
react-devtools                # Start DevTools
```

### Network Debugging:
```bash
# Mobile: Shake device → Debug Remote JS
# Or: Expo menu → Debug Remote JS
# Opens Chrome DevTools at http://localhost:19000/debugger-ui
```

---

## 📊 Database Queries (Appwrite)

### Query Helpers:
```typescript
import { Query } from 'appwrite';

// Equal
Query.equal('status', 'active')
Query.equal('categoryId', ['cat1', 'cat2'])

// Not equal
Query.notEqual('role', 'admin')

// Greater than / Less than
Query.greaterThan('price', 100)
Query.lessThan('stock', 10)

// Search
Query.search('name', 'burger')

// Order
Query.orderAsc('name')
Query.orderDesc('createdAt')

// Limit & Offset
Query.limit(20)
Query.offset(10)

// Combine queries
const queries = [
  Query.equal('restaurantId', restaurantId),
  Query.equal('isAvailable', true),
  Query.orderDesc('$createdAt'),
  Query.limit(50)
];

await databases.listDocuments(databaseId, menuCollectionId, queries);
```

---

## 🔍 Search & Find in Code

### VS Code:
```bash
Ctrl/Cmd + P            # Quick file search
Ctrl/Cmd + Shift + F    # Search in all files
Ctrl/Cmd + F            # Find in current file
F12                     # Go to definition
Alt/Opt + F12           # Peek definition
Shift + F12             # Find all references
```

### Grep (Terminal):
```bash
# Find in files
grep -r "searchTerm" .
grep -r "TODO" src/

# Find files by name
find . -name "*.tsx"
find . -name "*appwrite*"

# Count lines of code
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

---

## 🚀 Deployment Commands

### Expo (Mobile):
```bash
# Build for app stores
eas build --platform ios
eas build --platform android
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Update OTA
eas update --branch production
```

### Next.js (Web):
```bash
# Build
npm run build

# Vercel deploy
vercel
vercel --prod

# Or manual
npm run build
npm run start               # Production server
```

---

## 📝 Documentation Commands

### Generate Docs:
```bash
# TypeDoc (TypeScript docs)
npm install -g typedoc
typedoc --out docs src/

# JSDoc
jsdoc -c jsdoc.json
```

---

## 🔒 Environment Variables

### Create .env files:
```bash
# Mobile (.env)
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Web (.env.local)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Load in code
import Constants from 'expo-constants';
const endpoint = Constants.expoConfig?.extra?.appwriteEndpoint;
```

---

## 🎨 Code Formatting

### Prettier:
```bash
npx prettier --write .      # Format all files
npx prettier --check .      # Check formatting
npx prettier --write "src/**/*.{ts,tsx}"  # Specific files
```

### ESLint:
```bash
npm run lint                # Check linting
npm run lint -- --fix       # Auto-fix issues
```

---

## 📊 Performance Monitoring

### Bundle Analysis (Web):
```bash
# Next.js
npm run build
ANALYZE=true npm run build

# Webpack Bundle Analyzer
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer stats.json
```

### Mobile Performance:
```bash
# Flipper (React Native debugger)
# Download from: https://fbflipper.com/

# Performance monitoring
npx expo install expo-performance
```

---

## 🗂️ File Operations

### Common patterns:
```bash
# Create multiple files
touch file1.ts file2.ts file3.ts

# Create nested directories
mkdir -p src/components/common/buttons

# Copy
cp source.ts destination.ts
cp -r source-dir/ destination-dir/

# Move/Rename
mv old-name.ts new-name.ts

# Remove
rm file.ts
rm -rf directory/           # Careful! No undo

# Find and replace in files
sed -i 's/oldText/newText/g' file.ts
# Or use VS Code: Ctrl/Cmd + Shift + H
```

---

## 🔄 Quick Fixes

### Port already in use:
```bash
# Find process
lsof -i :3000               # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 [PID]               # Mac/Linux
taskkill /PID [PID] /F      # Windows
```

### Clear caches:
```bash
# Expo
npx expo start -c

# Next.js
rm -rf .next
npm run dev

# npm
npm cache clean --force

# Clear Metro bundler (RN)
npx react-native start --reset-cache
```

### Fix TypeScript errors:
```bash
# Restart TS server (VS Code)
Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"

# Or
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Emulator/Simulator Commands

### iOS Simulator:
```bash
# List devices
xcrun simctl list devices

# Boot simulator
open -a Simulator

# Or specific device
xcrun simctl boot "iPhone 14 Pro"
```

### Android Emulator:
```bash
# List AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_5_API_33

# Or use Android Studio: Tools → AVD Manager
```

---

## 🎯 Productivity Tips

### Aliases (Add to ~/.bashrc or ~/.zshrc):
```bash
# Git
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gpl='git pull'
alias gco='git checkout'

# NPM
alias ni='npm install'
alias nid='npm install -D'
alias nr='npm run'
alias nrd='npm run dev'
alias nrb='npm run build'

# Navigation
alias mobile='cd ~/projects/sgu_cnpm_foodfast/mobile'
alias admin='cd ~/projects/sgu_cnpm_foodfast/admin'
alias portal='cd ~/projects/sgu_cnpm_foodfast/restaurant-portal'
```

### VS Code Snippets:
```json
// .vscode/snippets.json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "export default function ${1:ComponentName}() {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ]
  }
}
```

---

## 📚 Documentation Links (Quick Access)

- **Project Docs**: `docs/README.md`
- **Roadmap**: `docs/DEVELOPMENT_ROADMAP.md`
- **Issues**: `docs/GITHUB_ISSUES.md`
- **Database**: `docs/database/DATABASE_SCHEMA.md`
- **Getting Started**: `GETTING_STARTED.md`

---

## 🆘 Emergency Commands

### Something broke:
```bash
# Nuclear option (fixes 90% of issues)
rm -rf node_modules package-lock.json
npm install
npx expo start -c           # Mobile
npm run dev                 # Web

# Git: Start over from main
git stash                   # Save changes
git checkout main
git pull origin main
git checkout -b new-branch
git stash pop               # Restore changes
```

### Lost code?
```bash
# Check reflog
git reflog
git checkout [commit-hash]

# Recover deleted branch
git reflog
git checkout -b [branch-name] [commit-hash]
```

---

**Print this page and keep it handy! 📌**

**Last Updated**: October 17, 2025
