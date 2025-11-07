# Reviews Collection - Migration to Relationships

## 📋 Overview

Hướng dẫn migrate collection `reviews` từ việc dùng String IDs sang Relationships với các collections khác.

---

## 🔍 Current State (Trước khi migrate)

### Hiện tại có 3 fields kiểu String:
- ❌ `userId` - String (255)
- ❌ `restaurantId` - String (255)  
- ❌ `orderId` - String (255)

### Vấn đề:
- Không có referential integrity
- Không thể cascade delete
- Phải manually validate IDs
- Không thể populate/eager load data
- Query phức tạp hơn

---

## ✅ Target State (Sau khi migrate)

### Sẽ chuyển thành Relationships:
- ✅ `users` - Relationship → User collection
- ✅ `restaurants` - Relationship → Restaurants collection
- ✅ `orders` - Relationship → Orders collection

### Lợi ích:
- ✅ Referential integrity tự động
- ✅ Cascade delete options
- ✅ Easier queries
- ✅ Can populate related data
- ✅ Better data consistency

---

## 🔧 Migration Steps

### ⚠️ QUAN TRỌNG: Backup Data Trước!

```bash
# Export reviews collection trước khi migrate
# Trong Appwrite Console: Database → Reviews → Export
```

### Step 1: Tạo Backup Attributes (Temporary)

Trước khi xóa các String fields, tạo backup:

1. Vào collection `reviews`
2. Tạo 3 attributes backup:

```
Type: String
Key: userId_backup
Size: 255
Required: No
```

```
Type: String
Key: restaurantId_backup
Size: 255
Required: No
```

```
Type: String
Key: orderId_backup
Size: 255
Required: No
```

### Step 2: Copy Data to Backup Fields

Chạy script để copy data:

```javascript
import { databases, Query } from './appwrite';

async function backupReviewIds() {
  const reviews = await databases.listDocuments(
    'databaseId',
    'reviews',
    [Query.limit(500)] // Adjust limit as needed
  );

  for (const review of reviews.documents) {
    await databases.updateDocument(
      'databaseId',
      'reviews',
      review.$id,
      {
        userId_backup: review.userId,
        restaurantId_backup: review.restaurantId,
        orderId_backup: review.orderId,
      }
    );
  }

  console.log('✅ Backup completed for', reviews.total, 'reviews');
}

await backupReviewIds();
```

### Step 3: Xóa Old String Attributes

1. Vào collection `reviews` → Tab **"Attributes"**
2. Xóa 3 attributes:
   - Delete `userId`
   - Delete `restaurantId`
   - Delete `orderId`

> ⚠️ Chỉ xóa sau khi đã backup ở Step 2!

### Step 4: Tạo Relationships

#### 4.1. Relationship với User

1. Click **"Create column"** → **"Relationship"**
2. Chọn **"Two-way relationship"**
3. Cấu hình:

```
Related table: User (User)
Column key: users
Column key (related table): reviews

Relation: Many to many
```

4. Click **"Create"**

#### 4.2. Relationship với Restaurants

1. Click **"Create column"** → **"Relationship"**
2. Chọn **"Two-way relationship"**
3. Cấu hình:

```
Related table: restaurants (restaurants)
Column key: restaurants
Column key (related table): reviews

Relation: Many to many
```

4. Click **"Create"**

#### 4.3. Relationship với Orders

1. Click **"Create column"** → **"Relationship"**
2. Chọn **"Two-way relationship"**
3. Cấu hình:

```
Related table: orders (orders)
Column key: orders
Column key (related table): reviews

Relation: Many to many
```

4. Click **"Create"**

### Step 5: Restore Data với Relationships

```javascript
async function restoreReviewRelationships() {
  const reviews = await databases.listDocuments(
    'databaseId',
    'reviews',
    [Query.limit(500)]
  );

  for (const review of reviews.documents) {
    try {
      await databases.updateDocument(
        'databaseId',
        'reviews',
        review.$id,
        {
          users: review.userId_backup,
          restaurants: review.restaurantId_backup,
          orders: review.orderId_backup,
        }
      );
      console.log('✅ Restored review:', review.$id);
    } catch (error) {
      console.error('❌ Failed to restore review:', review.$id, error);
    }
  }

  console.log('✅ Restoration completed!');
}

await restoreReviewRelationships();
```

### Step 6: Verify Data

```javascript
async function verifyMigration() {
  const reviews = await databases.listDocuments(
    'databaseId',
    'reviews',
    [Query.limit(10)]
  );

  for (const review of reviews.documents) {
    console.log({
      reviewId: review.$id,
      userId: review.users?.$id,
      restaurantId: review.restaurants?.$id,
      orderId: review.orders?.$id,
      // Compare with backup
      userId_backup: review.userId_backup,
      restaurantId_backup: review.restaurantId_backup,
      orderId_backup: review.orderId_backup,
    });
  }
}

await verifyMigration();
```

### Step 7: Clean Up Backup Attributes

Sau khi verify thành công:

1. Vào collection `reviews` → Tab **"Attributes"**
2. Xóa 3 backup attributes:
   - Delete `userId_backup`
   - Delete `restaurantId_backup`
   - Delete `orderId_backup`

### Step 8: Update Indexes

Tạo indexes mới cho relationship fields:

```
Type: Key
Key: users_idx
Attributes: users
Order: ASC
```

```
Type: Key
Key: restaurants_idx
Attributes: restaurants
Order: ASC
```

```
Type: Key
Key: orders_idx
Attributes: orders
Order: ASC
```

---

## 📊 Final Schema

### Reviews Collection Attributes:

| Field Name | Type | Required | Indexed | Description |
|------------|------|----------|---------|-------------|
| `users` | Relationship | ✅ Yes | ✅ Yes | User who wrote the review |
| `restaurants` | Relationship | ✅ Yes | ✅ Yes | Restaurant being reviewed |
| `orders` | Relationship | ✅ Yes | ✅ Yes | Order related to review |
| `overallRating` | Integer | ✅ Yes | No | Overall rating (1-5) |
| `foodQuality` | Integer | ❌ No | No | Food quality rating |
| `deliverySpeed` | Integer | ❌ No | No | Delivery speed rating |
| `service` | Integer | ❌ No | No | Service rating |
| `comment` | String | ❌ No | No | Review comment (2000 chars) |
| `isVisible` | Boolean | ❌ No | ✅ Yes | Visibility status |
| `restaurantResponse` | String | ❌ No | No | Response from restaurant |

---

## 🔍 Updated Queries

### Before (Old way with String IDs):
```javascript
// Get reviews by userId
Query.equal('userId', 'user123')

// Get reviews by restaurantId
Query.equal('restaurantId', 'rest123')

// Get reviews by orderId
Query.equal('orderId', 'order123')
```

### After (New way with Relationships):
```javascript
// Get reviews by userId
Query.equal('users', userId)

// Get reviews by restaurantId
Query.equal('restaurants', restaurantId)

// Get reviews by orderId
Query.equal('orders', orderId)
```

### Populate related data:
```javascript
const reviews = await databases.listDocuments(
  databaseId,
  'reviews',
  [
    Query.equal('restaurants', restaurantId),
    Query.select(['$id', 'overallRating', 'comment', 'users', 'orders'])
  ]
);

// Access related data
reviews.documents.forEach(review => {
  console.log('User:', review.users.$id);
  console.log('Restaurant:', review.restaurants.$id);
  console.log('Order:', review.orders.$id);
});
```

---

## 💻 Code Updates Required

### Mobile App (`mobile/lib/reviews.ts`):

#### Before:
```typescript
const review = await databases.createDocument(
  appwriteConfig.databaseId,
  appwriteConfig.reviewsCollectionId,
  ID.unique(),
  {
    userId: userId,
    orderId: params.orderId,
    restaurantId: restaurantId,
    // ...other fields
  }
);
```

#### After:
```typescript
const review = await databases.createDocument(
  appwriteConfig.databaseId,
  appwriteConfig.reviewsCollectionId,
  ID.unique(),
  {
    users: userId,           // ← Changed
    orders: params.orderId,  // ← Changed
    restaurants: restaurantId, // ← Changed
    // ...other fields
  }
);
```

### Query Changes:

#### Before:
```typescript
Query.equal('userId', userId)
Query.equal('restaurantId', restaurantId)
Query.equal('orderId', orderId)
```

#### After:
```typescript
Query.equal('users', userId)
Query.equal('restaurants', restaurantId)
Query.equal('orders', orderId)
```

---

## 🧪 Testing Checklist

After migration, test:

- [ ] Create new review with relationships
- [ ] Query reviews by user
- [ ] Query reviews by restaurant
- [ ] Query reviews by order
- [ ] Update review
- [ ] Delete review
- [ ] Verify cascade delete (if configured)
- [ ] Check all mobile/web apps still work
- [ ] Verify restaurant portal displays reviews correctly

---

## 🚨 Rollback Plan

Nếu có vấn đề:

1. Restore từ backup data (exported ở đầu)
2. Xóa relationship attributes
3. Tạo lại String attributes (userId, restaurantId, orderId)
4. Import data từ backup

---

## 📞 Support

Nếu gặp vấn đề:

1. Check migration script logs
2. Verify all documents migrated successfully
3. Check relationship constraints
4. Review Appwrite Console errors

---

**Migration Version:** 1.0  
**Last Updated:** November 8, 2025  
**Estimated Time:** ~30 minutes for 1000 reviews
