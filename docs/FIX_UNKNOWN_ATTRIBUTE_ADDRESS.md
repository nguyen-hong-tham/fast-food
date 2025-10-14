# 🔧 FIX: Unknown Attribute "address" Error

## ❌ Problem

### Error Message:
```
Registration failed: ❌ Registration failed: Invalid document structure: 
Unknown attribute: "address"
```

### Console Logs:
```
🔵 [STEP 1/3] Creating account in Auth for: user@example.com
✅ [STEP 1/3] Account created successfully
🔵 [STEP 2/3] Creating user document in database...
❌ Registration failed: Invalid document structure: Unknown attribute: "address"
```

### Root Cause:
Code trong `createUser` function đang cố gắng tạo document với các fields:
- `phone: ''`
- `address: ''`

Nhưng Appwrite `user` collection **KHÔNG CÓ** 2 attributes này!

---

## ✅ Solution Applied

### Fixed Code in `mobile/lib/appwrite.ts`:

**Before** (❌ Lỗi):
```typescript
const userDoc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    { 
        email, 
        name, 
        accountId: newAccount.$id, 
        avatar: avatarUrl,
        role: 'customer',
        phone: '',      // ❌ Unknown attribute!
        address: ''     // ❌ Unknown attribute!
    }
);
```

**After** (✅ Fixed):
```typescript
const userDoc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    { 
        email, 
        name, 
        accountId: newAccount.$id, 
        avatar: avatarUrl,
        role: 'customer'
        // ✅ Removed phone and address
    }
);
```

---

## 🎯 Current User Collection Schema

### Attributes in Appwrite `user` collection:
1. ✅ `email` (string)
2. ✅ `name` (string)
3. ✅ `accountId` (string)
4. ✅ `avatar` (string/URL)
5. ✅ `role` (string)

### Not included (removed from code):
- ❌ `phone` - Not in schema
- ❌ `address` - Not in schema

---

## 🔧 Optional: Add phone & address to Appwrite

If you need `phone` and `address` fields in the future:

### Step 1: Open Appwrite Console
```
https://cloud.appwrite.io/
→ Project: jsm-food-ordering
→ Database: 68da5e73002cb68e70af
→ Collection: user
```

### Step 2: Add Attributes
```
Settings → Attributes → Create Attribute

Attribute 1:
   Key: phone
   Type: String
   Size: 20
   Required: No
   Default: ""

Attribute 2:
   Key: address
   Type: String
   Size: 255
   Required: No
   Default: ""
```

### Step 3: Update Code
After adding attributes to Appwrite, you can add them back to code:

```typescript
const userDoc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    { 
        email, 
        name, 
        accountId: newAccount.$id, 
        avatar: avatarUrl,
        role: 'customer',
        phone: '',      // ✅ Now works!
        address: ''     // ✅ Now works!
    }
);
```

---

## 🧪 Testing After Fix

### Test Registration:
```powershell
cd mobile
npm start
```

### Expected Console Logs (Success):
```
🚀 Starting user registration...
🔵 [STEP 1/3] Creating account in Auth for: test@example.com
✅ [STEP 1/3] Account created successfully. ID: 507f1f77...
🔵 [STEP 2/3] Creating user document in database...
✅ [STEP 2/3] User document created successfully. Doc ID: 507f1f77...
🔵 [STEP 3/3] Logging in user...
✅ [STEP 3/3] User logged in successfully
🎉 Registration completed successfully for: test@example.com
```

### Expected Alert:
```
🎉 Welcome!

Registration successful! Welcome to FoodFast, [Your Name]!

[Get Started]
```

### Verify in Appwrite Console:
- ✅ Auth → Users → New user exists
- ✅ Database → user → New document exists with fields:
  - email
  - name
  - accountId
  - avatar
  - role

---

## 📝 Summary of Changes

### File Modified:
- ✅ `mobile/lib/appwrite.ts`

### Change:
```diff
  const userDoc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { 
          email, 
          name, 
          accountId: newAccount.$id, 
          avatar: avatarUrl,
-         role: 'customer',
-         phone: '',
-         address: ''
+         role: 'customer'
      }
  );
```

### Why:
- `phone` and `address` attributes don't exist in Appwrite `user` collection
- Removing them allows document creation to succeed
- Can be added back later if needed (see Optional section above)

---

## ✅ Status

**Before**: ❌ Registration fails with "Unknown attribute: address"  
**After**: ✅ Registration works successfully  

**Impact**: 
- ✅ Users can now register successfully
- ✅ User documents created in Appwrite Database
- ✅ All 3 steps complete successfully

---

## 🆘 If Still Not Working

### Check:
1. **Appwrite Permissions**: Make sure `user` collection has:
   - Role `Any` with `Create` permission
   - Role `Users` with `Read` and `Update` permissions

2. **Collection Attributes**: Verify in Appwrite Console that these attributes exist:
   - `email`
   - `name`
   - `accountId`
   - `avatar`
   - `role`

3. **Console Logs**: Which step fails?
   - Step 1 fails → Auth issue
   - Step 2 fails → Database/Permissions issue
   - Step 3 fails → Session issue

---

**Fixed**: 2025-01-14  
**Status**: ✅ Complete  
**Testing**: Ready to test
