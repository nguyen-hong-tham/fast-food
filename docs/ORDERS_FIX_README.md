# 🚀 Hướng dẫn sửa lỗi Orders Collection - Quick Start

## 📋 Tổng quan

Bạn gặp 3 lỗi khi đặt hàng:
1. ❌ "Checkout error: Error: Invalid document structure"
2. ❌ "Error creating order: Invalid document structure"  
3. ❌ "Attribute 'status' has invalid format"

**Nguyên nhân chính:** Cấu hình collection `orders` trong Appwrite Console chưa đúng với code.

---

## ⚡ Quick Fix (3 bước nhanh)

### Bước 1: Cập nhật code ✅ (ĐÃ HOÀN TẤT)

File `mobile/lib/appwrite.ts` đã được sửa:
- ✅ Stringify `items` trước khi lưu
- ✅ Thêm field `paymentStatus`
- ✅ Thêm field `recipientName`
- ✅ Cải thiện logging để debug

**→ Bạn KHÔNG cần làm gì thêm với code**

---

### Bước 2: Cấu hình Appwrite Console ⚠️ (CẦN LÀM)

#### 2.1. Kiểm tra attribute `status`

1. Truy cập: https://cloud.appwrite.io
2. Vào: **Databases** → chọn database → collection **orders**
3. Click tab **Columns**
4. Click vào attribute **status**
5. Kiểm tra:
   - Type: **Enum** ✅
   - Elements: 7 giá trị (viết thường, không space):
     ```
     pending
     confirmed
     preparing
     ready
     delivering
     delivered
     cancelled
     ```
   - Default: `pending` ✅
   - Required: ☑️ Yes ✅
   - Array: ☐ No ✅

**Nếu sai → Click Edit (✏️) → Sửa lại → Update**

---

#### 2.2. Tăng size của attribute `items`

1. Click vào attribute **items**
2. Click Edit (✏️)
3. Đổi **Size**: từ `1000` → `10000`
4. Click **Update**

**Quan trọng:** Size phải đủ lớn để chứa JSON string của nhiều món ăn.

---

#### 2.3. Thêm attribute `paymentStatus` (nếu chưa có)

1. Click **Create attribute**
2. Select **Enum**
3. Attribute ID: `paymentStatus`
4. Elements (4 giá trị):
   ```
   pending
   paid
   failed
   refunded
   ```
5. Default: `pending`
6. Required: ☑️ Yes
7. Array: ☐ No
8. Click **Create**

---

#### 2.4. Thêm attribute `recipientName` (optional)

1. Click **Create attribute**
2. Select **String**
3. Attribute ID: `recipientName`
4. Size: `255`
5. Required: ☐ No
6. Array: ☐ No
7. Click **Create**

---

### Bước 3: Test lại app ✅

```powershell
cd mobile
npx expo start --clear
```

Thử đặt hàng:
1. Thêm món vào giỏ
2. Vào Checkout
3. Điền đầy đủ thông tin
4. Click "Place Order" hoặc "Pay with VNPay"

**Expected:** 
- ✅ Không có lỗi
- ✅ Order được tạo thành công
- ✅ Navigate đến payment-result (COD) hoặc payment-selection (VNPay)

---

## 📚 Tài liệu chi tiết

### Nếu bạn cần hướng dẫn chi tiết hơn:

1. **FIX_ORDERS_CHECKOUT_ERROR.md** 
   - Tổng hợp tất cả thay đổi
   - So sánh code cũ/mới
   - Checklist hoàn chỉnh

2. **APPWRITE_ORDERS_CONFIG.md**
   - Bảng tóm tắt tất cả attributes
   - Cấu trúc JSON của items
   - Troubleshooting

3. **APPWRITE_ORDERS_DETAILED_GUIDE.md**
   - Hướng dẫn từng bước chi tiết
   - Cách tạo từng attribute
   - Ví dụ cấu hình

4. **APPWRITE_ORDERS_VISUAL_GUIDE.md**
   - Hình ảnh minh họa ASCII
   - Giao diện Appwrite Console
   - So sánh trước/sau

---

## 🎯 Checklist tổng hợp

### Code (Đã hoàn tất)
- [x] ✅ Sửa `mobile/lib/appwrite.ts`
- [x] ✅ Stringify `items` field
- [x] ✅ Thêm `paymentStatus` = "pending"
- [x] ✅ Thêm `recipientName` = ""
- [x] ✅ Thêm logging chi tiết

### Appwrite Console (Cần làm)
- [ ] ⏳ Kiểm tra `status` enum (7 values)
- [ ] ⏳ Tăng `items` size (1000 → 10000)
- [ ] ⏳ Thêm `paymentStatus` enum (4 values)
- [ ] ⏳ Thêm `recipientName` string (optional)
- [ ] ⏳ Kiểm tra permissions

### Testing
- [ ] ⏳ Test đặt hàng COD
- [ ] ⏳ Test đặt hàng VNPay
- [ ] ⏳ Xem order trong Appwrite Console
- [ ] ⏳ Kiểm tra không có lỗi console

---

## ❓ FAQ

### Q1: Tôi không tìm thấy collection `orders` trong Appwrite?
**A:** Kiểm tra lại Database ID trong file `.env`:
```
EXPO_PUBLIC_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
```

### Q2: Tôi tạo attribute mới nhưng vẫn lỗi?
**A:** 
1. Đảm bảo attribute ID chính xác (phân biệt chữ hoa/thường)
2. Restart app sau khi thay đổi Appwrite
3. Clear cache: `npx expo start --clear`

### Q3: Làm sao biết Size của `items` đủ lớn?
**A:** 
- 1 món ăn ≈ 200-300 characters
- 10 món ≈ 2000-3000 characters
- Size 10000 = đủ cho ~30-40 món

### Q4: Tôi có cần xóa orders cũ không?
**A:** 
- Không bắt buộc
- Nhưng nên xóa để test sạch
- Appwrite Console → orders → Documents → Delete all

### Q5: Sau khi sửa, app vẫn lỗi?
**A:** Cung cấp thông tin sau:
1. Screenshot Appwrite Console (Columns tab)
2. Console logs đầy đủ
3. Dữ liệu `orderData` đang gửi

---

## 🔗 Links hữu ích

- [Appwrite Console](https://cloud.appwrite.io)
- [Appwrite Docs - Databases](https://appwrite.io/docs/products/databases)
- [Appwrite Docs - Enum Attributes](https://appwrite.io/docs/products/databases/collections#enum)

---

## 📞 Hỗ trợ

Nếu vẫn gặp khó khăn:
1. Đọc **FIX_ORDERS_CHECKOUT_ERROR.md** để hiểu rõ hơn
2. Xem **APPWRITE_ORDERS_VISUAL_GUIDE.md** để theo dõi từng bước
3. Kiểm tra lại tất cả checklist
4. Liên hệ qua GitHub Issues hoặc Discord

---

## ✅ Tóm tắt

**Đã làm:**
- ✅ Code đã được sửa
- ✅ Tài liệu đã được tạo

**Cần làm:**
1. ⏳ Vào Appwrite Console
2. ⏳ Kiểm tra/sửa attribute `status`
3. ⏳ Tăng size của `items` lên 10000
4. ⏳ Thêm `paymentStatus` và `recipientName`
5. ⏳ Test lại app

**Thời gian dự kiến:** 10-15 phút

Good luck! 🚀
