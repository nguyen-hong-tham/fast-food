# Quick Setup Guide - Profile Feature

## 🚀 TÓM TẮT NHANH

### BƯỚC 1: Cập nhật Appwrite Database (5 phút)

Vào Appwrite Console → Collection "users" → Thêm 7 attributes:

```
1. phone (string, 15, optional)
2. address_home (string, 255, optional)
3. address_work (string, 255, optional)
4. address_home_label (string, 50, optional, default: "Home")
5. address_work_label (string, 50, optional, default: "Work")
6. createdAt (datetime, optional)
7. updatedAt (datetime, optional)
```

### BƯỚC 2: Code đã sẵn sàng ✅

Các files sau đã được tạo/cập nhật:
- ✅ `components/ProfileField.tsx`
- ✅ `app/(tabs)/profile.tsx`
- ✅ `type.d.ts` (User interface updated)
- ✅ `lib/appwrite.ts` (updateUser, uploadAvatar functions)
- ✅ `constants/index.ts` (icons exported)

### BƯỚC 3: Update user data thủ công

Vào Appwrite Console → Users collection → Click vào user document:

```json
{
  "phone": "+1 555 123 4567",
  "address_home": "123 Main Street, Springfield, IL 62704",
  "address_home_label": "Home",
  "address_work": "221B Rose Street, Foodville, FL 12345",
  "address_work_label": "Work"
}
```

### BƯỚC 4: Chạy App

```bash
npm run ios    # hoặc
npm run android # hoặc
npm run web
```

Navigate đến Profile tab → Xem kết quả!

---

## 🎨 GIAO DIỆN PROFILE

```
┌─────────────────────────────┐
│        Profile              │
│                             │
│      [Avatar Photo]         │
│         [✏️ Edit]           │
│                             │
│  👤 Adrian Hajdin          │
│  ✉️  adrian@jsmastery.com  │
│  📱 +1 555 123 4567        │
│  📍 123 Main Street...     │
│  📍 221B Rose Street...    │
│                             │
│    [Edit Profile]           │
│    [🚪 Logout]             │
│                             │
└─────────────────────────────┘
```

---

## 🔍 FEATURES HOÀN THÀNH

✅ Hiển thị thông tin user đầy đủ
✅ Avatar với edit button
✅ Phone number field
✅ 2 địa chỉ (Home & Work)
✅ Logout functionality
✅ Empty state khi chưa login
✅ Responsive design
✅ Loading states

---

## 🚧 FUTURE FEATURES (Chưa làm)

- [ ] Edit Profile screen
- [ ] Upload/Change avatar
- [ ] Add more addresses
- [ ] Order history
- [ ] Favorites

---

## 📱 TEST NGAY

1. Đăng nhập vào app
2. Click tab "Profile"
3. Xem thông tin hiển thị
4. Test logout

---

## 🐛 NẾU CÓ LỖI

**User data không hiển thị?**
→ Check Appwrite Console có data chưa

**Avatar không load?**
→ Check avatar URL hoặc dùng default

**Không logout được?**
→ Check Auth Store và Appwrite session

---

**Chi tiết đầy đủ:** Xem file `PROFILE_FEATURE_SETUP.md`

**DONE! 🎉**
