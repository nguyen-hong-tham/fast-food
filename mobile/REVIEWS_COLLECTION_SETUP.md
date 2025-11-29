# Reviews Collection Setup Guide

## ⚠️ Issue
The `reviews` collection either doesn't exist in Appwrite or has incorrect schema/attributes.

Current error:
```
Invalid query: Attribute not found in schema: restaurantId
```

## 📋 Required Setup in Appwrite Console

### Step 1: Create Reviews Collection

1. Go to Appwrite Console → Database `692a85350000a4fc97b3`
2. Create new collection with ID: `reviews`
3. Set permissions:
   - **Create**: Any (allow users to create reviews)
   - **Read**: Any (public can read reviews)
   - **Update**: Users (only author can update their review)
   - **Delete**: Users (only author can delete their review)

### Step 2: Add Attributes

Add the following attributes to the `reviews` collection:

#### Required Attributes

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| `userId` | String | 255 | ✅ Yes | - | ❌ No |
| `orderId` | String | 255 | ✅ Yes | - | ❌ No |
| `restaurantId` | String | 255 | ✅ Yes | - | ❌ No |
| `overallRating` | Integer | - | ✅ Yes | - | ❌ No |
| `isVisible` | Boolean | - | ✅ Yes | true | ❌ No |

#### Optional Attributes

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| `menuItemId` | String | 255 | ❌ No | null | ❌ No |
| `foodQuality` | Integer | - | ❌ No | null | ❌ No |
| `deliverySpeed` | Integer | - | ❌ No | null | ❌ No |
| `service` | Integer | - | ❌ No | null | ❌ No |
| `comment` | String | 5000 | ❌ No | null | ❌ No |
| `restaurantResponse` | String | 5000 | ❌ No | null | ❌ No |
| `images` | String | 1000 | ❌ No | null | ✅ Yes |
| `helpful` | Integer | - | ❌ No | 0 | ❌ No |
| `reply` | String | 5000 | ❌ No | null | ❌ No |
| `repliedAt` | DateTime | - | ❌ No | null | ❌ No |
| `status` | String | 50 | ❌ No | 'active' | ❌ No |

### Step 3: Create Indexes (for better query performance)

1. Index on `restaurantId` (for querying restaurant reviews)
2. Index on `userId` (for querying user's reviews)
3. Index on `orderId` (for checking if order was reviewed)
4. Index on `menuItemId` (for menu item reviews)
5. Index on `overallRating` (for filtering by rating)
6. Index on `isVisible` (for filtering visible reviews)

### Step 4: Validation Rules

Add these validation rules in Appwrite Console:

- `overallRating`: Min: 1, Max: 5
- `foodQuality`: Min: 1, Max: 5
- `deliverySpeed`: Min: 1, Max: 5
- `service`: Min: 1, Max: 5
- `status`: Enum: ['active', 'hidden', 'reported']

## 🔧 After Setup

Once the collection is properly configured:

1. Go to `mobile/lib/restaurant-reviews.ts`
2. Uncomment the disabled query code in:
   - `getRestaurantReviews()`
   - `getRestaurantAverageRating()`
   - `getFilteredRestaurantReviews()`
   - `createRestaurantReview()`
   - `getUserReviewForOrder()`

3. Restart the Expo dev server:
   ```bash
   cd mobile
   npx expo start --clear
   ```

## ✅ Verification

Test by:
1. Completing an order
2. Leaving a review for the restaurant
3. Viewing reviews on restaurant detail page
4. Checking that average rating updates correctly

## 📝 Notes

- The schema uses **string IDs** for relationships, not Appwrite relationship fields
- This is simpler and more flexible than using Appwrite's built-in relationships
- Reviews are soft-deleted using `isVisible` flag
- `status` field allows for moderation (active/hidden/reported)
