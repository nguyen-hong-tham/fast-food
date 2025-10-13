# ⚠️ APPWRITE ORDERS COLLECTION - REQUIRED COLUMNS

## 📋 Columns cần có trong collection `orders`:

Để order flow hoạt động, collection **`orders`** cần có các columns sau:

### ✅ Required Columns:

| Column Name | Type | Required | Default | Description |
|-------------|------|----------|---------|-------------|
| `$id` | String | ✅ Auto | - | Document ID |
| `user` | String | ✅ Yes | - | User ID (relationship) |
| `items` | String | ✅ Yes | - | JSON string of order items |
| `total` | Float/Double | ✅ Yes | - | Total order amount |
| `status` | String | ✅ Yes | `pending` | Order status |
| `deliveryAddress` | String | ✅ Yes | - | Delivery address |
| `deliveryAddressLabel` | String | ❌ No | - | Address label (Home/Work/Custom) |
| `phone` | String | ✅ Yes | - | Contact phone |
| `recipientName` | String | ✅ Yes | - | **NEW** - Recipient name |
| `notes` | String | ❌ No | - | **NEW** - Order notes |
| `createdAt` | DateTime | ✅ Auto | now() | Order creation time |
| `updatedAt` | DateTime | ✅ Auto | now() | Last update time |

---

## 🔧 ADD MISSING COLUMNS:

### Bước 1: Mở Appwrite Console
```
https://nyc.cloud.appwrite.io/console/project-68c9791a002b85f096b4/databases/database-68da5e73002cb68e70af/collection-orders
```

### Bước 2: Add `recipientName` column

1. Click tab **"Columns"**
2. Click **"Add Column"**
3. Fill in:
   ```
   Column ID: recipientName
   Column Name: Recipient Name
   Type: String
   Size: 255
   Required: Yes
   Default: (empty)
   ```
4. Click **"Create"**

### Bước 3: Add `notes` column

1. Click **"Add Column"**
2. Fill in:
   ```
   Column ID: notes
   Column Name: Order Notes
   Type: String
   Size: 1000
   Required: No
   Default: (empty)
   ```
3. Click **"Create"**

### Bước 4: Verify existing columns

Check các columns sau có tồn tại và đúng type không:

- ✅ `user` → String (Relationship to user collection)
- ✅ `items` → String (JSON)
- ✅ `total` → Float or Double
- ✅ `status` → String
- ✅ `deliveryAddress` → String
- ✅ `deliveryAddressLabel` → String
- ✅ `phone` → String
- ✅ `createdAt` → DateTime
- ✅ `updatedAt` → DateTime

---

## 🎯 AFTER ADDING COLUMNS:

1. ✅ Columns added successfully
2. ✅ Permissions already set (from previous step)
3. ✅ Ready to test order flow!

---

## 🧪 TEST COMPLETE FLOW:

1. **Open app**: http://localhost:8081
2. **Add items to cart**
3. **Click "Order Now"**
4. **Confirmation modal appears** ✅
5. **Edit name/address/phone if needed**
6. **Add notes (optional)**
7. **Click "Confirm Order"**
8. **Order created successfully!** 🎉

---

**Sau khi add columns, test ngay và báo kết quả!** 🚀
