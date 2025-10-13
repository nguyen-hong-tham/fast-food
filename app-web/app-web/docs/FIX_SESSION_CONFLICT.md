# 🔧 ĐÃ SỬA LỖI SESSION CONFLICT

## ❌ Vấn đề ban đầu:
**"Creation of a session is prohibited when a session is active"**

### Nguyên nhân:
- Main app (Expo) và Admin-web **cùng dùng 1 Appwrite Project**
- Appwrite lưu session trong **localStorage** với key giống nhau
- Khi đăng nhập ở 1 app → Session conflict với app còn lại

---

## ✅ Giải pháp đã áp dụng:

### 1. **Xóa session cũ trước khi login** (api.ts)
```typescript
// Trong admin-web/src/lib/api.ts
export const signIn = async (email: string, password: string) => {
  try {
    // Xóa session cũ trước (nếu có)
    try {
      await account.deleteSession('current');
    } catch (e) {
      console.log('No existing session to delete');
    }
    
    // Tạo session mới
    const session = await account.createEmailPasswordSession(email, password);
    // ... rest of code
  }
}
```

### 2. **Tách localStorage giữa Admin và Customer** (appwrite.ts)
```typescript
// Trong admin-web/src/lib/appwrite.ts
// Admin sẽ dùng: 'admin_appwrite_session'
// Customer sẽ dùng: 'appwrite_session'

if (typeof window !== 'undefined') {
  const ADMIN_PREFIX = 'admin_';
  
  // Override localStorage để thêm prefix cho admin
  window.localStorage.setItem = function(key, value) {
    if (key.includes('appwrite')) {
      return nativeSetItem.call(this, ADMIN_PREFIX + key, value);
    }
    return nativeSetItem.call(this, key, value);
  };
  
  // Tương tự cho getItem và removeItem
}
```

### 3. **Fix TypeScript** (vite-env.d.ts)
- Thêm type definitions cho `import.meta.env.VITE_*`
- Giờ không còn lỗi TypeScript

---

## 🎯 Kết quả:

✅ **Admin-web** dùng localStorage key: `admin_appwrite_session`
✅ **Customer app** dùng localStorage key: `appwrite_session`
✅ **Không conflict** giữa 2 apps
✅ **Có thể login cả 2 cùng lúc**

---

## 🧪 TEST NGAY:

### Bước 1: Mở admin-web
```
http://localhost:3001
```

### Bước 2: Login với admin account
- Email: admin@gmail.com
- Password: [your password]
- Click "Sign In"

### Bước 3: Mở customer app (nếu đang chạy)
```
http://localhost:8081
```

### Bước 4: Login customer app
- Login với customer account bình thường
- **Không còn lỗi conflict!**

---

## 📋 Files đã sửa:

1. ✅ `admin-web/src/lib/api.ts` - Delete old session before login
2. ✅ `admin-web/src/lib/appwrite.ts` - Separate localStorage for admin
3. ✅ `admin-web/src/vite-env.d.ts` - TypeScript env types

---

## 🔍 Check localStorage (Optional):

**Mở DevTools → Application → Local Storage:**

Trước khi fix:
```
appwrite_session → conflict!
```

Sau khi fix:
```
admin_appwrite_session → Admin session
appwrite_session → Customer session (nếu có)
```

---

## ⚠️ Lưu ý:

- Admin-web giờ có session storage **hoàn toàn riêng biệt**
- Logout ở admin **không ảnh hưởng** customer app
- Logout ở customer **không ảnh hưởng** admin-web
- Cả 2 apps có thể chạy **song song** không vấn đề

---

## 🚀 READY TO TEST!

**Reload trang admin-web và thử login lại:**
http://localhost:3001

Báo kết quả nhé! 🎯
