# 🔍 Fix Search Error - Fulltext Index Setup

## ❌ Error

```
AppwriteException: Searching by attribute "name" requires a fulltext index
```

## 🎯 Solution

You need to create a **Fulltext Index** on the `name` attribute in your **Menu Collection** in Appwrite.

---

## 📝 Step-by-Step Fix

### 1. Open Appwrite Console

1. Go to: https://cloud.appwrite.io/console
2. Login to your account
3. Select your project

### 2. Navigate to Menu Collection

1. Click **Databases** in the sidebar
2. Click on your database (e.g., "fastfood_deli")
3. Click on **menu** collection

### 3. Create Fulltext Index

1. Click on the **Indexes** tab
2. Click **Create Index** button
3. Fill in the form:

   ```
   Key: name_search
   Type: fulltext
   Attributes: name
   Orders: (leave empty)
   ```

4. Click **Create**

### 4. Wait for Index Creation

- Appwrite will create the index
- This may take a few seconds to a few minutes depending on your data size
- Status will show "Available" when ready

---

## ✅ Verification

After creating the index:

1. Go back to your app
2. Try searching for a food item (e.g., "burger", "pizza")
3. Search should now work without errors!

---

## 📊 What is a Fulltext Index?

A fulltext index allows Appwrite to perform text-based searches efficiently:

- **Without index:** Search queries fail
- **With index:** Fast and efficient text search
- **Use case:** Finding items by name, description, etc.

---

## 🔧 Alternative: Use `contains` instead of `search`

If you can't create an index, you can modify the search to use `contains` instead:

### Option 1: Edit `lib/appwrite.ts`

Change line 109 from:
```typescript
if(query) queries.push(Query.search('name', query));
```

To:
```typescript
if(query) queries.push(Query.contains('name', query));
```

**Note:** `contains` is slower but doesn't require an index.

---

## 🚀 Recommended Indexes for Better Performance

Create these indexes in your collections:

### Menu Collection
1. **name_search** (fulltext) - For searching by name ✅
2. **categories_index** (key) - For filtering by category
3. **price_index** (key) - For sorting by price

### Orders Collection
1. **userId_index** (key) - For fetching user orders
2. **status_index** (key) - For filtering by status
3. **createdAt_index** (key) - For sorting by date

---

## 🎉 Summary

**Problem:** Search requires fulltext index
**Solution:** Create fulltext index on `name` attribute in Menu collection
**Alternative:** Use `Query.contains()` instead of `Query.search()`

Once the index is created, your search feature will work perfectly! 🔍✨
