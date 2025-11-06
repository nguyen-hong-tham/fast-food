# 🔄 RATING SYSTEM - WORKFLOW DIAGRAM

## 📱 CUSTOMER FLOW (Mobile App)

```
┌─────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY                       │
└─────────────────────────────────────────────────────────────┘

1. PLACE ORDER
   ↓
   Order Status: pending → preparing → ready → delivering → delivered
   
2. VIEW ORDER HISTORY
   ↓
   [Order History Screen]
   ├─ Delivered Orders
   │  └─ Order #12345 (Status: delivered)
   │     ├─ Item 1: Burger [$10] → [Rate ⭐] Button
   │     ├─ Item 2: Fries [$5]  → [Rate ⭐] Button
   │     └─ Item 3: Coke [$3]   → [Rate ⭐] Button
   
3. CLICK "Rate" BUTTON
   ↓
   Check: hasUserReviewedItem(userId, orderId, menuItemId)
   ├─ YES → Show "Already Reviewed" alert
   └─ NO  → Navigate to Rating Screen
   
4. RATE & REVIEW
   ↓
   [Rating Input Screen]
   ├─ Select Stars (1-5) ⭐⭐⭐⭐⭐
   ├─ Write Comment (optional)
   ├─ Upload Photos (optional)
   └─ [Submit] Button
   
5. SUBMIT REVIEW
   ↓
   createReview(userId, restaurantId, {
     orderId,
     menuItemId,
     rating,
     comment,
     images
   })
   ↓
   [Success] → "Thank you for your review!"
   ↓
   Back to Order History
```

---

## 🏪 RESTAURANT FLOW (Portal)

```
┌─────────────────────────────────────────────────────────────┐
│                      RESTAURANT PORTAL                        │
└─────────────────────────────────────────────────────────────┘

1. LOGIN
   ↓
   [Restaurant Dashboard]
   ├─ Orders
   ├─ Menu
   ├─ Analytics
   └─ ⭐ Reviews (NEW!)
   
2. CLICK "Reviews"
   ↓
   Load Reviews:
   ├─ getRestaurantReviews(restaurantId)
   └─ getRestaurantReviewsSummary(restaurantId)
   
3. VIEW REVIEWS SUMMARY
   ↓
   ┌──────────────────────────────────────┐
   │  RATING SUMMARY                      │
   │                                      │
   │  4.5 ⭐⭐⭐⭐⭐                        │
   │  Based on 125 reviews                │
   │                                      │
   │  5★ ████████████████████░  (80)     │
   │  4★ ████████░░░░░░░░░░░░  (30)     │
   │  3★ ███░░░░░░░░░░░░░░░░░  (10)     │
   │  2★ █░░░░░░░░░░░░░░░░░░░  (3)      │
   │  1★ █░░░░░░░░░░░░░░░░░░░  (2)      │
   └──────────────────────────────────────┘
   
4. VIEW INDIVIDUAL REVIEWS
   ↓
   ┌──────────────────────────────────────┐
   │  👤 John Doe · 2 days ago  ✓Verified │
   │  ⭐⭐⭐⭐⭐                            │
   │  "Amazing burger! Best I've had..."   │
   │  📸 [Image] [Image]                   │
   │                                       │
   │  [Reply] Button                       │
   └──────────────────────────────────────┘
   
5. REPLY TO REVIEW
   ↓
   Click [Reply] → Show Reply Input
   ↓
   ┌──────────────────────────────────────┐
   │  💬 Reply to this review:            │
   │  ┌────────────────────────────────┐  │
   │  │ Thank you for your feedback!   │  │
   │  │ We're glad you enjoyed...      │  │
   │  └────────────────────────────────┘  │
   │  [Cancel]  [Post Reply]              │
   └──────────────────────────────────────┘
   
6. SUBMIT REPLY
   ↓
   replyToReview(reviewId, replyText)
   ↓
   [Success] → Reply appears under review
   ↓
   ┌──────────────────────────────────────┐
   │  👤 John Doe · 2 days ago            │
   │  ⭐⭐⭐⭐⭐                            │
   │  "Amazing burger! Best I've had..."   │
   │                                       │
   │  ┌────────────────────────────────┐  │
   │  │ 🏪 Restaurant's Response:      │  │
   │  │ "Thank you for your feedback..." │  │
   │  │ Replied 1 hour ago              │  │
   │  └────────────────────────────────┘  │
   └──────────────────────────────────────┘
```

---

## 🗄️ DATABASE STRUCTURE

```
┌────────────────────────────────────────────────────────────┐
│                      APPWRITE DATABASE                       │
└────────────────────────────────────────────────────────────┘

Collection: reviews
├─ Document ID: "review123"
├─ userId: "user456"          → Links to User collection
├─ orderId: "order789"        → Links to Orders collection
├─ restaurantId: "rest101"    → Links to Restaurants collection
├─ menuItemId: "menu202"      → Links to Menu collection
├─ rating: 5                  → Integer (1-5)
├─ comment: "Great food!"     → String (max 2000 chars)
├─ images: ["url1", "url2"]   → Array of URLs
├─ helpful: 12                → Number of helpful votes
├─ reply: "Thank you!"        → Restaurant's response
├─ repliedAt: "2024-11-06"    → DateTime
├─ isVerifiedPurchase: true   → Boolean badge
├─ status: "active"           → Enum: active/hidden/reported
├─ $createdAt: "2024-11-06"   → Auto timestamp
└─ $updatedAt: "2024-11-06"   → Auto timestamp

Indexes:
├─ menuItemId_idx     → Fast query by menu item
├─ restaurantId_idx   → Fast query by restaurant
├─ userId_idx         → Fast query by user
├─ rating_idx         → Sort by rating
└─ createdAt_idx      → Sort by date
```

---

## 🔐 PERMISSIONS FLOW

```
┌────────────────────────────────────────────────────────────┐
│                    PERMISSION MATRIX                         │
└────────────────────────────────────────────────────────────┘

Action: CREATE REVIEW
├─ Who: Any authenticated user (role: "users")
├─ Condition: Must have placed order
└─ Validation: orderId must exist and be delivered

Action: READ REVIEWS
├─ Who: Anyone (role: "any")
└─ Public: Yes (for transparency)

Action: UPDATE REVIEW
├─ Case 1: User updating own review
│  ├─ Who: Review owner (userId === current user)
│  └─ Fields: rating, comment, images
│
└─ Case 2: Restaurant replying
   ├─ Who: Restaurant owner (restaurantId match)
   └─ Fields: reply, repliedAt only

Action: DELETE REVIEW
├─ Who: Review owner OR admin
└─ Soft delete: Update status = "hidden"
```

---

## 📊 CALCULATION LOGIC

```
┌────────────────────────────────────────────────────────────┐
│              AVERAGE RATING CALCULATION                      │
└────────────────────────────────────────────────────────────┘

Query: Get all reviews for menuItemId
├─ Filter: status = "active"
├─ Limit: 1000 (for accuracy)
└─ Calculate:
    
    totalReviews = documents.length
    sumRatings = Σ(review.rating for each review)
    averageRating = sumRatings / totalReviews
    roundedAverage = Math.round(averageRating * 10) / 10
    
    Example:
    ├─ Review 1: 5 stars
    ├─ Review 2: 4 stars  
    ├─ Review 3: 5 stars
    └─ Average = (5 + 4 + 5) / 3 = 4.7 ⭐

┌────────────────────────────────────────────────────────────┐
│              DISTRIBUTION CALCULATION                        │
└────────────────────────────────────────────────────────────┘

distribution = {
  5: count of 5-star reviews,
  4: count of 4-star reviews,
  3: count of 3-star reviews,
  2: count of 2-star reviews,
  1: count of 1-star reviews
}

percentage = (count / totalReviews) * 100

Example:
Total: 100 reviews
├─ 5★: 70 reviews → 70% bar width
├─ 4★: 20 reviews → 20% bar width
├─ 3★: 5 reviews  → 5% bar width
├─ 2★: 3 reviews  → 3% bar width
└─ 1★: 2 reviews  → 2% bar width
```

---

## 🚀 API ENDPOINTS (Helper Functions)

```typescript
// CREATE
createReview(userId, restaurantId, params)
  → POST /databases/{db}/collections/reviews/documents

// READ
getMenuItemReviews(menuItemId, limit, offset)
  → GET /databases/{db}/collections/reviews/documents
  → Query: menuItemId = X, status = active

getRestaurantReviews(restaurantId, limit, offset)
  → GET /databases/{db}/collections/reviews/documents
  → Query: restaurantId = X, status = active

getReviewsWithUserInfo(menuItemId, limit)
  → Multiple GET calls to fetch user data

// CALCULATE
getMenuItemAverageRating(menuItemId)
  → GET all reviews → Calculate average

getRestaurantReviewsSummary(restaurantId)
  → GET all reviews → Calculate summary stats

// UPDATE
updateReview(reviewId, data)
  → PATCH /databases/{db}/collections/reviews/documents/{id}

replyToReview(reviewId, reply)
  → PATCH /databases/{db}/collections/reviews/documents/{id}
  → Update: reply, repliedAt

// DELETE
deleteReview(reviewId)
  → DELETE /databases/{db}/collections/reviews/documents/{id}

// HELPER
hasUserReviewedItem(userId, orderId, menuItemId)
  → Check if review exists
```

---

## ✅ VALIDATION RULES

```
┌────────────────────────────────────────────────────────────┐
│                    INPUT VALIDATION                          │
└────────────────────────────────────────────────────────────┘

rating:
  ├─ Required: Yes
  ├─ Type: Integer
  ├─ Min: 1
  ├─ Max: 5
  └─ Error: "Rating must be between 1 and 5"

comment:
  ├─ Required: No
  ├─ Type: String
  ├─ MaxLength: 2000 characters
  └─ Sanitize: Strip HTML tags

images:
  ├─ Required: No
  ├─ Type: Array of URLs
  ├─ MaxCount: 5 images
  └─ Validate: Must be valid URLs

orderId:
  ├─ Required: Yes
  ├─ Validation: Order must exist
  ├─ Validation: Order must be delivered
  └─ Validation: User must be order owner

Duplicate Prevention:
  ├─ Check: hasUserReviewedItem()
  └─ Rule: 1 review per item per order
```

---

## 🎯 USE CASES

### ✅ Happy Path
```
1. Customer orders food
2. Order delivered successfully  
3. Customer rates item 5 stars
4. Review appears on menu
5. Restaurant replies "Thank you!"
6. Other customers see review & reply
```

### ❌ Edge Cases

**Case 1: User tries to review before delivery**
```
Status: Order is "preparing"
Action: Click "Rate" button
Result: ❌ Button disabled or hidden
Message: "Available after delivery"
```

**Case 2: User tries to review twice**
```
Status: Already reviewed this item
Action: Click "Rate" button
Result: ❌ Alert shown
Message: "You have already reviewed this item"
```

**Case 3: User submits review without rating**
```
Status: Rating = 0
Action: Click "Submit"
Result: ❌ Validation error
Message: "Please select a rating"
```

**Case 4: Restaurant tries to delete customer review**
```
Status: Review exists
Action: Restaurant attempts delete
Result: ❌ Permission denied
Note: Only customer or admin can delete
```

---

Made with ❤️ for FoodFast
