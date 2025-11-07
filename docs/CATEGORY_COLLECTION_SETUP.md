# Category Collection Setup Guide

## 📋 Overview

Hướng dẫn chi tiết cách tạo và cấu hình **Category Collection** trong Appwrite để hỗ trợ phân loại menu items theo danh mục.

---

## ⚡ Quick Summary

### Attributes cần tạo thủ công:
1. ✅ `name` - String (100 chars, required)
2. ✅ `description` - String (500 chars, optional)
3. ✅ `displayOrder` - Integer (0-999, default: 0)
4. ✅ `isActive` - Boolean (default: true)

### Attributes tự động tạo bởi Relationship:
5. 🔗 `restaurants` - Relationship (auto-created khi setup relationship)

### Indexes:
- `restaurants_idx` - Index trên field `restaurants`
- `isActive_idx` - Index trên field `isActive`

### Relationships:
- **Categories ↔ Restaurants**: Two-way (many-to-one from categories view)
- **Menu ↔ Categories**: Two-way (many-to-one from menu view)

---

## 🎯 Mục đích

Category collection cho phép:
- Nhà hàng tạo nhiều danh mục món ăn (Appetizers, Main Courses, Drinks, Desserts, etc.)
- Mỗi menu item được gán vào một category cụ thể
- Khách hàng có thể lọc/xem menu theo từng category
- Quản lý và sắp xếp menu một cách có tổ chức

---

## 📊 Database Schema

### Collection Information
- **Collection Name**: `categories`
- **Collection ID**: `categories` (hoặc auto-generate)
- **Permissions**: Document-level permissions

### Attributes (Fields)

| Field Name | Type | Size/Range | Required | Default | Indexed | Description |
|------------|------|------------|----------|---------|---------|-------------|
| `name` | String | 100 | ✅ Yes | - | No | Tên danh mục (VD: "Món khai vị", "Món chính") |
| `description` | String | 500 | ❌ No | "" | No | Mô tả chi tiết về danh mục |
| `restaurants` | Relationship | - | ✅ Yes | - | ✅ Yes | Relationship đến collection `restaurants` (tự động tạo) |
| `displayOrder` | Integer | 0-999 | ❌ No | 0 | No | Thứ tự hiển thị (nhỏ hơn = hiển thị trước) |
| `isActive` | Boolean | - | ❌ No | true | ✅ Yes | Trạng thái active/inactive |

### Auto-generated Fields (Appwrite)
- `$id`: Document ID (auto)
- `$createdAt`: Timestamp (auto)
- `$updatedAt`: Timestamp (auto)
- `$permissions`: Array (auto)

---

## 🔧 Step-by-Step Setup trong Appwrite Console

### Step 1: Tạo Collection

1. Đăng nhập vào **Appwrite Console**: https://cloud.appwrite.io
2. Chọn Project của bạn: `sgu_cnpm_foodfast`
3. Vào **Databases** → Chọn database `68da5e73002cb68e70af`
4. Click **"Create Collection"**
5. Điền thông tin:
   ```
   Collection ID: categories
   Collection Name: Categories
   ```
6. Click **"Create"**

### Step 2: Thêm Attributes

> **⚠️ LƯU Ý QUAN TRỌNG:**  
> **KHÔNG** cần tạo attribute `restaurantId` thủ công!  
> Appwrite sẽ tự động tạo khi bạn thiết lập relationship ở Step 3.

#### 2.1. Attribute: `name`
```
Type: String
Key: name
Size: 100
Required: Yes (checked)
Default value: (leave empty)
Array: No
```
Click **"Create"**

#### 2.2. Attribute: `description`
```
Type: String
Key: description
Size: 500
Required: No (unchecked)
Default value: (leave empty)
Array: No
```
Click **"Create"**

#### 2.3. Attribute: `displayOrder`
```
Type: Integer
Key: displayOrder
Min: 0
Max: 999
Required: No (unchecked)
Default value: 0
Array: No
```
Click **"Create"**

#### 2.4. Attribute: `isActive`
```
Type: Boolean
Key: isActive
Required: No (unchecked)
Default value: true (checked)
Array: No
```
Click **"Create"**

### Step 3: Tạo Relationship với Restaurants

> **🔗 Bước này sẽ tự động tạo attribute `restaurants` (relationship field)**

1. Trong collection `categories`, chọn tab **"Attributes"**
2. Click **"Create column"** → Chọn **"Relationship"**
3. Chọn **"Two-way relationship"** (như hình bạn đã chụp)
4. Cấu hình như sau:

```
Related table: restaurants (restaurants)
Column key: restaurants
Column key (related table): categories

Relation: Many to many
```

**Chi tiết cấu hình:**

| Field | Value | Giải thích |
|-------|-------|------------|
| **Related table** | `restaurants (restaurants)` | Collection mà bạn muốn tạo relationship |
| **Column key** | `restaurants` | Tên attribute sẽ được tạo trong collection `categories` |
| **Column key (related table)** | `categories` | Tên attribute sẽ được tạo trong collection `restaurants` |
| **Relation** | Many to many | Chọn "Many to many" (Appwrite sẽ hiểu đây là many-to-one) |

5. Click **"Create more"** → **"Create"**

**✅ Kết quả sau khi tạo:**
- ✅ Attribute `restaurants` được tạo trong collection `categories` (type: Relationship)
- ✅ Attribute `categories` được tạo trong collection `restaurants` (type: Relationship)
- ✅ Bạn có thể query categories by restaurantId: `Query.equal('restaurants', restaurantId)`
- ✅ Access restaurant từ category: `category.restaurants.$id`

**⚠️ Lưu ý:**
- Appwrite sẽ tự động tạo và quản lý relationship field
- **KHÔNG** cần tạo thủ công field `restaurantId` kiểu String nữa
- Relationship field sẽ có type là `relationship`, không phải `string`

### Step 4: Tạo Indexes

Indexes giúp tăng tốc độ query.

> **⚠️ CHÚ Ý:**  
> Chỉ tạo index sau khi đã tạo xong relationship ở Step 3!

#### Index 1: `restaurants_idx`
```
Type: Key
Key: restaurants_idx
Attributes: restaurants
Order: ASC
```

#### Index 2: `isActive_idx`
```
Type: Key
Key: isActive_idx
Attributes: isActive
Order: ASC
```

### Step 5: Cấu hình Permissions

#### Document-level Permissions:
Vào **Settings** tab của collection, chọn **Permissions**:

**Create Documents:**
- Users with role: `users` (Any authenticated user)

**Read Documents:**
- Users with role: `users` (Any authenticated user)

**Update Documents:**
- Document owner (restaurant owner)

**Delete Documents:**
- Document owner (restaurant owner)

**Hoặc sử dụng Custom Permissions trong code:**
```javascript
// Khi tạo category
const category = await databases.createDocument(
  databaseId,
  'categories',
  ID.unique(),
  data,
  [
    Permission.read(Role.any()),
    Permission.update(Role.user(restaurantOwnerId)),
    Permission.delete(Role.user(restaurantOwnerId))
  ]
);
```

---

## 🔗 Relationships

### ✅ Relationship 1: Categories ↔ Restaurants (Đã tạo ở Step 3)

Relationship này đã được tạo ở **Step 3** của hướng dẫn setup, không cần làm gì thêm.

**Cách sử dụng trong code:**
```javascript
// Lấy categories của một restaurant
const categories = await databases.listDocuments(
  databaseId,
  'categories',
  [
    Query.equal('restaurants', restaurantId), // ← Dùng 'restaurants' (tên attribute)
    Query.equal('isActive', true)
  ]
);

// Tạo category mới
const category = await databases.createDocument(
  databaseId,
  'categories',
  ID.unique(),
  {
    name: 'Món chính',
    description: 'Các món ăn chính',
    restaurants: restaurantId, // ← Gán relationship
    displayOrder: 0,
    isActive: true
  }
);

// Access restaurantId từ category
console.log(category.restaurants.$id); // ← Restaurant ID
```

### Relationship 2: Menu → Categories (Many-to-One)

**Setup trong Appwrite Console:**

1. Vào collection `menu`
2. Chọn tab **"Attributes"**
3. Click **"Create column"** → Chọn **"Relationship"**
4. Chọn **"Two-way relationship"**
5. Cấu hình:
   ```
   Related table: categories
   Column key: categories (trong menu collection)
   Column key (related table): menuItems (trong categories collection)
   
   Relation: Many to many
   ```

6. Click **"Create"**

**Kết quả:**
- Attribute `categories` được tạo trong collection `menu`
- Attribute `menuItems` được tạo trong collection `categories`
- Mỗi menu item có thể link đến 1 category
- Mỗi category có thể chứa nhiều menu items

**Sử dụng trong code:**
```javascript
// Lấy menu items của một category
const menuItems = await databases.listDocuments(
  databaseId,
  'menu',
  [
    Query.equal('categories', categoryId), // ← Dùng 'categories'
    Query.equal('isAvailable', true)
  ]
);

// Gán menu item vào category
await databases.updateDocument(
  databaseId,
  'menu',
  menuItemId,
  {
    categories: categoryId // ← Gán relationship
  }
);
```

---

## 📝 Sample Data

### Example Category Documents:

#### Category 1: Appetizers
```json
{
  "$id": "cat_001",
  "name": "Món khai vị",
  "description": "Các món ăn nhẹ để khởi đầu bữa ăn",
  "restaurants": {
    "$id": "restaurant_123",
    "$collectionId": "restaurants",
    "$databaseId": "68da5e73002cb68e70af"
  },
  "displayOrder": 0,
  "isActive": true,
  "$createdAt": "2025-11-08T10:00:00.000Z",
  "$updatedAt": "2025-11-08T10:00:00.000Z"
}
```

#### Category 2: Main Courses
```json
{
  "$id": "cat_002",
  "name": "Món chính",
  "description": "Các món ăn chính phong phú và đa dạng",
  "restaurants": {
    "$id": "restaurant_123",
    "$collectionId": "restaurants",
    "$databaseId": "68da5e73002cb68e70af"
  },
  "displayOrder": 1,
  "isActive": true,
  "$createdAt": "2025-11-08T10:00:00.000Z",
  "$updatedAt": "2025-11-08T10:00:00.000Z"
}
```

#### Category 3: Drinks
```json
{
  "$id": "cat_003",
  "name": "Đồ uống",
  "description": "Nước giải khát, trà, cà phê, sinh tố",
  "restaurants": {
    "$id": "restaurant_123",
    "$collectionId": "restaurants",
    "$databaseId": "68da5e73002cb68e70af"
  },
  "displayOrder": 2,
  "isActive": true,
  "$createdAt": "2025-11-08T10:00:00.000Z",
  "$updatedAt": "2025-11-08T10:00:00.000Z"
}
```

#### Category 4: Desserts
```json
{
  "$id": "cat_004",
  "name": "Tráng miệng",
  "description": "Các món ngọt kết thúc bữa ăn hoàn hảo",
  "restaurants": {
    "$id": "restaurant_123",
    "$collectionId": "restaurants",
    "$databaseId": "68da5e73002cb68e70af"
  },
  "displayOrder": 3,
  "isActive": true,
  "$createdAt": "2025-11-08T10:00:00.000Z",
  "$updatedAt": "2025-11-08T10:00:00.000Z"
}
```

---

## 🔍 Common Queries

### 1. Lấy tất cả categories của một restaurant
```javascript
import { databases, Query } from './appwrite';

const categories = await databases.listDocuments(
  databaseId,
  'categories',
  [
    Query.equal('restaurants', restaurantId), // ← Dùng 'restaurants' (relationship field)
    Query.equal('isActive', true),
    Query.orderAsc('displayOrder'),
    Query.orderAsc('name')
  ]
);
```

### 2. Lấy menu items theo category
```javascript
const menuItems = await databases.listDocuments(
  databaseId,
  'menu',
  [
    Query.equal('categories', categoryId), // ← Dùng 'categories' (relationship field)
    Query.equal('isAvailable', true)
  ]
);
```

### 3. Lấy categories với số lượng menu items
```javascript
// Lấy categories
const categories = await getRestaurantCategories('restaurant_123');

// Đếm menu items cho mỗi category
const categoriesWithCount = await Promise.all(
  categories.map(async (category) => {
    const items = await databases.listDocuments(
      databaseId,
      'menu',
      [
        Query.equal('categoryId', category.$id),
        Query.limit(0) // Chỉ lấy count, không cần documents
      ]
    );
    
    return {
      ...category,
      menuCount: items.total
    };
  })
);
```

---

## ✅ Validation Rules

### Business Logic Validation:

1. **Name uniqueness per restaurant:**
   - Không cho phép 2 categories cùng tên trong 1 restaurant
   - Check trong code trước khi create

2. **Cannot delete category with menu items:**
   - Phải di chuyển hoặc xóa hết menu items trước
   - Hoặc chuyển sang soft delete (isActive = false)

3. **DisplayOrder uniqueness:**
   - Mỗi category nên có displayOrder khác nhau
   - Tự động reorder khi thêm/xóa category

4. **Restaurant ownership:**
   - Chỉ restaurant owner mới có thể CRUD categories của mình

---

## 🚀 Testing Checklist

Sau khi setup xong, test các scenarios sau:

- [ ] Tạo category mới thành công
- [ ] Update category name/description
- [ ] Reorder categories (change displayOrder)
- [ ] Toggle isActive (soft delete)
- [ ] Query categories by restaurantId
- [ ] Query active categories only
- [ ] Query categories with menu count
- [ ] Prevent delete category with menu items
- [ ] Hard delete empty category
- [ ] Assign menu item to category
- [ ] Filter menu by category
- [ ] Handle uncategorized menu items

---

## 🔒 Security Considerations

1. **Validate restaurantId:**
   - Luôn verify user là owner của restaurant trước khi cho phép CRUD

2. **Input sanitization:**
   - Sanitize name và description để tránh XSS
   - Limit string length theo quy định

3. **Rate limiting:**
   - Giới hạn số lượng categories mỗi restaurant có thể tạo (VD: max 20)

4. **Soft delete preferred:**
   - Nên dùng soft delete (isActive = false) thay vì hard delete
   - Giữ lại data history

---

## 📞 Support

Nếu gặp vấn đề trong quá trình setup:

1. Check Appwrite Console logs
2. Verify collection ID và attribute names match code
3. Check permissions configuration
4. Review indexes are created properly

---

## 🔄 Migration Script (Optional)

Nếu đã có menu items, cần migrate để thêm default category:

```javascript
// Script để tạo "Uncategorized" category cho mỗi restaurant
async function migrateExistingMenuItems() {
  // 1. Lấy tất cả restaurants
  const restaurants = await databases.listDocuments(databaseId, 'restaurants');
  
  // 2. Tạo "Uncategorized" category cho mỗi restaurant
  for (const restaurant of restaurants.documents) {
    await databases.createDocument(
      databaseId,
      'categories',
      ID.unique(),
      {
        name: 'Chưa phân loại',
        description: 'Menu items chưa được phân loại',
        restaurants: restaurant.$id, // ← Dùng relationship
        displayOrder: 999,
        isActive: true
      }
    );
  }
  
  console.log('Migration completed!');
}
```

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Author:** FoodFast Development Team
