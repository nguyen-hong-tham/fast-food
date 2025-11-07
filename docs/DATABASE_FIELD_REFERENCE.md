# Database Field Reference

## Current Field Structure (Updated: 2025-11-08)

This document clarifies which fields to use in queries for each collection.

---

## ✅ Category Collection (`category`)

### Query Fields:
- **`restaurant`** - Relationship field to restaurants collection
  - Use: `Query.equal('restaurant', restaurantId)`
  - Type: Relationship (one-to-many)
  - Auto-created by Appwrite relationship

### Example:
```typescript
const categories = await databases.listDocuments(
  databaseId,
  'category',
  [Query.equal('restaurant', restaurantId)]
);
```

---

## ⚠️ Menu Collection (`menu`)

### Query Fields:
- **`restaurantId`** - Manual string field (NOT a relationship)
  - Use: `Query.equal('restaurantId', restaurantId)`
  - Type: String
  - Status: Legacy field, still in use

- **`categories`** - Relationship field to category collection
  - Use: `Query.equal('categories', categoryId)`
  - Type: Relationship (many-to-one)
  - Status: ✅ Active and working

### Example:
```typescript
// Get menu items for a restaurant
const menu = await databases.listDocuments(
  databaseId,
  'menu',
  [
    Query.equal('restaurantId', restaurantId),  // ← Manual field
    Query.equal('categories', categoryId)       // ← Relationship field
  ]
);

// Get uncategorized items
const uncategorized = await databases.listDocuments(
  databaseId,
  'menu',
  [
    Query.equal('restaurantId', restaurantId),  // ← Manual field
    Query.isNull('categories')                  // ← Relationship field
  ]
);
```

---

## ⚠️ Reviews Collection (`reviews`)

### Query Fields:
- **`restaurantId`** - Manual string field (NOT a relationship)
  - Use: `Query.equal('restaurantId', restaurantId)`
  - Type: String
  - Status: Legacy field, still in use

- **`userId`** - Manual string field (NOT a relationship)
  - Use: `Query.equal('userId', userId)`
  - Type: String
  - Status: Legacy field, still in use

- **`orderId`** - Manual string field (NOT a relationship)
  - Use: `Query.equal('orderId', orderId)`
  - Type: String
  - Status: Legacy field, still in use

### Example:
```typescript
const reviews = await databases.listDocuments(
  databaseId,
  'reviews',
  [
    Query.equal('restaurantId', restaurantId),  // ← Manual field
    Query.equal('isVisible', true)
  ]
);
```

---

## 📋 Summary Table

| Collection | Field Name | Field Type | Status | Query Syntax |
|------------|------------|------------|--------|--------------|
| category | `restaurant` | Relationship | ✅ Active | `Query.equal('restaurant', id)` |
| menu | `restaurantId` | String | ⚠️ Legacy | `Query.equal('restaurantId', id)` |
| menu | `categories` | Relationship | ✅ Active | `Query.equal('categories', id)` |
| reviews | `restaurantId` | String | ⚠️ Legacy | `Query.equal('restaurantId', id)` |
| reviews | `userId` | String | ⚠️ Legacy | `Query.equal('userId', id)` |
| reviews | `orderId` | String | ⚠️ Legacy | `Query.equal('orderId', id)` |

---

## 🔄 Migration Status

### ✅ Migrated to Relationships:
- Category → Restaurant relationship
- Menu → Category relationship

### ⏳ Pending Migration:
- Menu → Restaurant relationship (still using `restaurantId` string)
- Reviews → Restaurant relationship (still using `restaurantId` string)
- Reviews → User relationship (still using `userId` string)
- Reviews → Order relationship (still using `orderId` string)

---

## 🎯 Current Implementation

### Mobile App (`mobile/lib/`)

**categories.ts:**
- ✅ Uses `restaurant` for category queries (relationship)
- ✅ Uses `restaurantId` for menu queries (manual field)
- ✅ Uses `categories` for menu category filter (relationship)

**restaurant-reviews.ts:**
- ✅ Uses `restaurantId` for review queries (manual field)

**appwrite.ts:**
- ✅ Uses `restaurantId` for menu queries (manual field)
- ✅ Uses `categories` for menu category filter (relationship)

### Restaurant Portal (`restaurant/src/lib/`)

**categories.ts:**
- ✅ Uses `restaurant` for category queries (relationship)
- ✅ Uses `categories` for menu queries (relationship)

---

## 📝 Notes

1. **Why the inconsistency?**
   - Categories collection was created with relationships from the start
   - Menu and Reviews collections existed before relationships were added
   - Partial migration: only category relationship was added to menu

2. **Should we migrate?**
   - Not urgent - current system works
   - Migration requires:
     - Add relationship fields in Appwrite console
     - Update all queries in codebase
     - Test thoroughly
     - No data loss (relationship can coexist with manual field)

3. **Query differences:**
   - Relationship fields: Auto-populated by Appwrite
   - Manual fields: Developer must maintain consistency
   - Both work for queries, relationships enable better data integrity

---

Last updated: 2025-11-08
