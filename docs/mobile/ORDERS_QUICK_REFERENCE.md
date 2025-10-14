# ⚡ Quick Start: Tạo Orders Collection (Có Relationship)

## 🎯 10 Attributes Cần Tạo

### 1. userId ⭐ RELATIONSHIP
```
Type: Relationship
Related: User
Relationship: Many to One
Two Way: NO (one-way)
On Delete: Set Null
```

### 2. items
```
Type: String
Size: 10000
Required: Yes
```

### 3. total
```
Type: Float
Required: Yes
```

### 4. status
```
Type: Enum
Elements: pending, preparing, ready, delivering, completed, cancelled
Default: pending
Required: Yes
```

### 5. deliveryAddress
```
Type: String
Size: 500
Required: Yes
```

### 6. deliveryAddressLabel
```
Type: String
Size: 100
Required: No
```

### 7. phone
```
Type: String
Size: 20
Required: Yes
```

### 8. notes
```
Type: String
Size: 1000
Required: No
```

### 9. createdAt
```
Type: DateTime
Default: now()
Required: Yes
```

### 10. updatedAt
```
Type: DateTime
Default: now()
Required: Yes
```

---

## 🔐 Permissions

Settings → Permissions → Enable **"Document Security"**

Chọn: Users can read/create their own documents

---

## ✅ Done!

Xem hướng dẫn chi tiết trong:
- `HUONG_DAN_TAO_ORDERS_CO_HINH.md` - Từng bước có hình ảnh
- `RELATIONSHIP_EXPLAINED.md` - Giải thích Relationship
