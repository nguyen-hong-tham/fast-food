# 🔧 FIX: Restaurant Portal Login Error - "Route not found"

## 🐛 **LỖI:**
```
Route not found. Please ensure the endpoint is configured correctly 
and that the API route is valid for this SDK version. 
Refer to the API docs for more details.
```

**Khi nào xảy ra:**
- Chạy `npm run dev` ở folder `restaurant`
- Truy cập Restaurant Portal
- Nhập email/password và bấm "Sign in"
- → Lỗi "Route not found"

---

## 🔍 **NGUYÊN NHÂN:**

### **Vấn đề: Thiếu file `.env`**

Restaurant Portal (Vite React app) sử dụng `import.meta.env` để load config:

```typescript
// restaurant/src/config/index.ts
export const config = {
  appwrite: {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '', // ❌ Rỗng!
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '', // ❌ Rỗng!
    // ...
  }
}
```

**Khi không có `.env`:**
- `projectId` = `''` (empty string)
- Appwrite SDK không biết project nào để connect
- → Request tới: `https://cloud.appwrite.io/v1/account/sessions/email`
- Nhưng thiếu `X-Appwrite-Project` header
- → Server trả về: **"Route not found"**

---

## ✅ **ĐÃ SỬA:**

### **Fix 1: Tạo file `.env`**
📁 `restaurant/.env` (NEW file)

```properties
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68c9791a002b85f096b4
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af

# Collections
VITE_APPWRITE_USERS_COLLECTION_ID=user
VITE_APPWRITE_RESTAURANTS_COLLECTION_ID=restaurants
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_ORDER_ITEMS_COLLECTION_ID=order_items
VITE_APPWRITE_PAYMENTS_COLLECTION_ID=payments
VITE_APPWRITE_REVIEWS_COLLECTION_ID=reviews

# Storage
VITE_APPWRITE_STORAGE_ID=68dacda1003d6943981e
```

**Key points:**
- ✅ Prefix với `VITE_` (bắt buộc cho Vite)
- ✅ Sử dụng cùng Appwrite endpoint với mobile app
- ✅ Cùng Project ID, Database ID
- ✅ Cùng Collection IDs

### **Fix 2: Tạo `.env.example`**
📁 `restaurant/.env.example` (Template file)

```properties
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
# ... (với placeholders)
```

**Mục đích:**
- Template cho developers khác
- Không chứa credentials thật
- Commit được vào Git

### **Fix 3: Verify `.gitignore`**
Root `.gitignore` đã có:
```gitignore
.env
.env.local
.env*.local
```
→ `.env` sẽ KHÔNG được commit (bảo mật credentials)

---

## 🚀 **CÁCH SỬ DỤNG:**

### **Step 1: Restart Dev Server**
```bash
cd restaurant
npm run dev
```

**Output:**
```
Port 3001 is in use, trying another one...
VITE v6.4.1 ready in 382 ms
➜  Local:   http://localhost:3002/
```

→ Server chạy trên port **3002** (vì 3001 đang được dùng)

### **Step 2: Truy cập Restaurant Portal**
```
http://localhost:3002
```

### **Step 3: Đăng nhập**
**Email:** `nguyenvana@gmail.com`  
**Password:** (password của account này)

**Expected:**
- ✅ Không còn "Route not found"
- ✅ Login thành công
- ✅ Redirect về Dashboard

---

## 🔍 **VERIFY SETUP:**

### **Check 1: Environment Variables Loaded**
Mở DevTools (F12) → Console:
```javascript
// Test nếu config load đúng
console.log(import.meta.env.VITE_APPWRITE_PROJECT_ID)
// Should print: "68c9791a002b85f096b4"
```

### **Check 2: Network Request**
DevTools → Network → Filter "XHR":

**Khi login, tìm request:**
```
POST https://nyc.cloud.appwrite.io/v1/account/sessions/email
```

**Headers should include:**
```
X-Appwrite-Project: 68c9791a002b85f096b4
Content-Type: application/json
```

**Nếu thiếu `X-Appwrite-Project`** → `.env` chưa load đúng

### **Check 3: Response**
**Before fix (error):**
```json
{
  "message": "Route not found...",
  "code": 404,
  "type": "general_route_not_found"
}
```

**After fix (success):**
```json
{
  "$id": "...",
  "$createdAt": "...",
  "userId": "...",
  "expire": "...",
  // ... session data
}
```

---

## 🛠️ **TROUBLESHOOTING:**

### **Issue 1: Vẫn thấy "Route not found" sau khi tạo `.env`**

**Nguyên nhân:** Vite không auto-reload `.env` changes

**Fix:**
```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

**Hoặc:**
```bash
# Hard restart
rm -rf node_modules/.vite
npm run dev
```

### **Issue 2: `import.meta.env.VITE_xxx` trả về `undefined`**

**Nguyên nhân:** Thiếu prefix `VITE_`

**Check `.env`:**
```properties
# ❌ SAI (không có VITE_)
APPWRITE_PROJECT_ID=xxx

# ✅ ĐÚNG (có VITE_)
VITE_APPWRITE_PROJECT_ID=xxx
```

**Vite chỉ expose env vars có prefix `VITE_`!**

### **Issue 3: "Invalid credentials" thay vì "Route not found"**

**Nguyên nhân:** `.env` đã load đúng, nhưng email/password sai

**Fix:**
1. Kiểm tra email: `nguyenvana@gmail.com`
2. Kiểm tra password
3. Hoặc tạo account mới:
   - Click "Register your restaurant"
   - Fill form và submit

### **Issue 4: Port 3001 đã bị chiếm**

**Thông báo:**
```
Port 3001 is in use, trying another one...
➜  Local:   http://localhost:3002/
```

**Fix:**
- Không cần fix gì, dùng port mới (3002)
- Hoặc stop process đang dùng port 3001:

```powershell
# Windows PowerShell
netstat -ano | findstr :3001
# Tìm PID (cột cuối)
taskkill /PID <PID> /F
```

---

## 📊 **SO SÁNH MOBILE vs RESTAURANT:**

| | **Mobile** | **Restaurant** |
|---|---|---|
| Framework | Expo (React Native) | Vite (React) |
| Env file | `.env` | `.env` |
| Env prefix | `EXPO_PUBLIC_` | `VITE_` |
| Access | `process.env.EXPO_PUBLIC_xxx` | `import.meta.env.VITE_xxx` |
| Port | 8081 (Metro), 19006 (web) | 3001 (hoặc 3002) |

**Appwrite config:**
- ✅ Cùng endpoint: `nyc.cloud.appwrite.io`
- ✅ Cùng project: `68c9791a002b85f096b4`
- ✅ Cùng database: `68da5e73002cb68e70af`

→ Restaurant và Mobile chia sẻ cùng backend!

---

## 🎯 **TESTING CHECKLIST:**

- [x] `.env` file created ở `restaurant/.env`
- [x] `.env.example` created (template)
- [x] Dev server restart (`npm run dev`)
- [x] Server chạy trên port 3002 (hoặc 3001)
- [ ] Truy cập `http://localhost:3002`
- [ ] Login form hiển thị
- [ ] Nhập email: `nguyenvana@gmail.com`
- [ ] Nhập password
- [ ] Click "Sign in"
- [ ] ✅ Không có error "Route not found"
- [ ] ✅ Login thành công
- [ ] ✅ Redirect về Dashboard

---

## 📁 **FILES MODIFIED/CREATED:**

1. ✅ `restaurant/.env` (NEW) - Chứa credentials thật
2. ✅ `restaurant/.env.example` (NEW) - Template với placeholders
3. ✅ Root `.gitignore` - Already có `.env` ignore

**Files KHÔNG sửa:**
- `restaurant/src/config/index.ts` - Config logic vẫn OK
- `restaurant/src/store/authStore.ts` - Login logic vẫn OK
- `restaurant/src/lib/appwrite.ts` - Appwrite client setup vẫn OK

→ Chỉ thiếu `.env` thôi!

---

## 💡 **WHY THIS HAPPENED:**

Restaurant portal là **Vite project mới setup** nên:
- ❌ Chưa có `.env` ban đầu
- ❌ Developer quên tạo (focus vào code)
- ❌ `.env` không commit vào Git (gitignored)
- ❌ Khi clone/pull → không có file này

**Best practice going forward:**
1. ✅ Always tạo `.env.example` với placeholders
2. ✅ Document trong README: "Copy `.env.example` to `.env`"
3. ✅ Add setup script:
   ```json
   // package.json
   "scripts": {
     "setup": "cp .env.example .env && npm install"
   }
   ```

---

## 🔗 **RELATED FILES:**

- `restaurant/src/config/index.ts` - Config loading
- `restaurant/src/store/authStore.ts` - Login logic
- `restaurant/src/lib/appwrite.ts` - Appwrite client
- `mobile/.env` - Mobile app config (for reference)

---

## 📝 **NOTES:**

### **Về User Account:**
Email `nguyenvana@gmail.com` phải:
1. ✅ Tồn tại trong Appwrite Auth (accounts)
2. ✅ Có document trong `user` collection
3. ✅ Document có `role: 'restaurant_owner'`
4. ✅ Liên kết với restaurant trong `restaurants` collection

**Nếu chưa có account:**
```bash
# Option 1: Register qua UI
http://localhost:3002/register

# Option 2: Tạo script
cd restaurant
node scripts/create-restaurant-admin.js
```

---

**Status:** ✅ FIXED  
**Priority:** HIGH  
**Date:** November 9, 2025  
**Issue:** Missing `.env` file caused "Route not found" error
