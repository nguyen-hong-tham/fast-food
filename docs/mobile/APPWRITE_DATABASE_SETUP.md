# Hướng Dẫn Cấu Hình Appwrite Database cho Profile

## 🗄️ CẤU TRÚC DATABASE CẦN TẠO

### 1. Collection: `users` (ĐÃ CÓ - CẦN THÊM ATTRIBUTES)

Truy cập Appwrite Console → Databases → Collection `users`

#### **Attributes hiện tại:**
- `accountId` (string, required)
- `email` (string, required)
- `name` (string, required)
- `avatar` (string, optional)

#### **THÊM CÁC ATTRIBUTES SAU:**

```javascript
// Phone Number
{
  key: "phone",
  type: "string",
  size: 15,
  required: false,
  default: null
}

// Address 1 - Home
{
  key: "address_home",
  type: "string",
  size: 255,
  required: false,
  default: null
}

// Address 2 - Work
{
  key: "address_work",
  type: "string",
  size: 255,
  required: false,
  default: null
}

// Address 1 Label
{
  key: "address_home_label",
  type: "string",
  size: 50,
  required: false,
  default: "Home"
}

// Address 2 Label
{
  key: "address_work_label",
  type: "string",
  size: 50,
  required: false,
  default: "Work"
}

// Created At
{
  key: "createdAt",
  type: "datetime",
  required: false,
  default: null
}

// Updated At
{
  key: "updatedAt",
  type: "datetime",
  required: false,
  default: null
}
```

---

## 📝 HƯỚNG DẪN THÊM ATTRIBUTES TRÊN APPWRITE CONSOLE

### Bước 1: Đăng nhập Appwrite Console
```
https://cloud.appwrite.io/console
→ Chọn Project: sgu_fastfood_deli
→ Databases → [Your Database]
→ Collections → users
```

### Bước 2: Thêm từng Attribute

#### A. Thêm Phone Number:
1. Click **"Add Attribute"**
2. Chọn type: **String**
3. Key: `phone`
4. Size: `15`
5. Required: `No` (unchecked)
6. Array: `No` (unchecked)
7. Click **"Create"**

#### B. Thêm Address Home:
1. Click **"Add Attribute"**
2. Chọn type: **String**
3. Key: `address_home`
4. Size: `255`
5. Required: `No`
6. Click **"Create"**

#### C. Thêm Address Work:
1. Click **"Add Attribute"**
2. Chọn type: **String**
3. Key: `address_work`
4. Size: `255`
5. Required: `No`
6. Click **"Create"**

#### D. Thêm Address Home Label:
1. Click **"Add Attribute"**
2. Chọn type: **String**
3. Key: `address_home_label`
4. Size: `50`
5. Required: `No`
6. Default: `Home`
7. Click **"Create"**

#### E. Thêm Address Work Label:
1. Click **"Add Attribute"**
2. Chọn type: **String**
3. Key: `address_work_label`
4. Size: `50`
5. Required: `No`
6. Default: `Work`
7. Click **"Create"**

#### F. Thêm CreatedAt:
1. Click **"Add Attribute"**
2. Chọn type: **DateTime**
3. Key: `createdAt`
4. Required: `No`
5. Click **"Create"**

#### G. Thêm UpdatedAt:
1. Click **"Add Attribute"**
2. Chọn type: **DateTime**
3. Key: `updatedAt`
4. Required: `No`
5. Click **"Create"**

---

## 🔐 PERMISSIONS SETTINGS

Vào tab **Settings** của collection `users`:

### Read Access:
```
✅ Any user (authenticated)
```

### Write Access (Create):
```
✅ Users (để user tạo profile khi đăng ký)
```

### Update Access:
```
✅ User:{$id} (chỉ owner mới update được)
```

### Delete Access:
```
✅ Admin only
```

---

## 📊 CẤU TRÚC COLLECTION SAU KHI HOÀN THÀNH

```javascript
users Collection:
├── accountId (string, required) - Liên kết với Appwrite Account
├── email (string, required) - Email người dùng
├── name (string, required) - Tên đầy đủ
├── avatar (string, optional) - URL avatar
├── phone (string, optional) - Số điện thoại
├── address_home (string, optional) - Địa chỉ nhà
├── address_home_label (string, optional) - Nhãn địa chỉ 1
├── address_work (string, optional) - Địa chỉ công ty
├── address_work_label (string, optional) - Nhãn địa chỉ 2
├── createdAt (datetime, optional) - Ngày tạo
└── updatedAt (datetime, optional) - Ngày cập nhật
```

---

## 🎯 INDEXES (Optional - Tăng hiệu suất query)

Tạo các indexes sau:

### Index 1: Email Index
```
Key: email_index
Type: key
Attributes: email
Order: ASC
```

### Index 2: AccountId Index
```
Key: accountId_index
Type: key
Attributes: accountId
Order: ASC
```

---

## ✅ CHECKLIST

Sau khi hoàn thành, kiểm tra:

- [ ] Collection `users` có đầy đủ 10 attributes
- [ ] Permissions được set đúng
- [ ] Indexes được tạo (optional)
- [ ] Test tạo 1 document thử

---

## 🧪 TEST DATA MẪU

Tạo 1 document test:

```json
{
  "accountId": "test-account-123",
  "email": "adrian@jsmastery.com",
  "name": "Adrian Hajdin",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "+1 555 123 4567",
  "address_home": "123 Main Street, Springfield, IL 62704",
  "address_home_label": "Home",
  "address_work": "221B Rose Street, Foodville, FL 12345",
  "address_work_label": "Work",
  "createdAt": "2025-10-08T10:00:00.000Z",
  "updatedAt": "2025-10-08T10:00:00.000Z"
}
```

---

## 🚀 SAU KHI CẤU HÌNH XONG

1. Copy Collection ID của `users`
2. Paste vào `lib/appwrite.ts` → `userCollectionId`
3. Chạy lại app và test

---

**DONE! Database đã sẵn sàng cho Profile feature! 🎉**
