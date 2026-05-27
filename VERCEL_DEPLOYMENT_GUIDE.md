# 📦 Hướng Dẫn Deploy 3 Projects lên Vercel

## 📋 Mục lục
1. [Chuẩn bị](#chuẩn-bị)
2. [Option 1: Deploy từ Web Dashboard](#option-1-deploy-từ-web-dashboard-dễ-nhất)
3. [Option 2: Deploy bằng CLI](#option-2-deploy-bằng-cli)
4. [Environment Variables cho mỗi Project](#environment-variables-cho-mỗi-project)
5. [Kiểm tra sau Deploy](#kiểm-tra-sau-deploy)

---

## 🚀 Chuẩn Bị

### Bước 1: Tạo Vercel Account
1. Đăng ký tại https://vercel.com
2. Connect GitHub account
3. Import repo `fast-food`

### Bước 2: Lấy Appwrite Credentials
Cần lấy từ Appwrite Dashboard:
- `VITE_APPWRITE_ENDPOINT` (thường là `https://cloud.appwrite.io/v1`)
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`
- `VITE_APPWRITE_BUCKET_ID`
- `VITE_APPWRITE_*_COLLECTION_ID` (các collection IDs khác nhau)

---

## ✅ Option 1: Deploy từ Web Dashboard (Dễ nhất)

### 1️⃣ Deploy Project 1: Restaurant Portal

#### Bước 1: Tạo New Project
1. Vào https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Chọn repo `fast-food`

#### Bước 2: Cấu hình Project Settings
- **Project Name**: `foodfast-restaurant` (hoặc tùy ý)
- **Framework Preset**: `Vite`
- **Root Directory**: `restaurant`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Bước 3: Add Environment Variables

Click **"Environment Variables"** và thêm:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` | Appwrite endpoint |
| `VITE_APPWRITE_PROJECT_ID` | `your_project_id` | Lấy từ Appwrite Dashboard |
| `VITE_APPWRITE_DATABASE_ID` | `68da5e73002cb68e70af` | Database ID |
| `VITE_APPWRITE_BUCKET_ID` | `68dacda1003d6943981e` | Bucket ID |
| `VITE_APPWRITE_USER_COLLECTION_ID` | `user` | Collection ID |
| `VITE_APPWRITE_ORDERS_COLLECTION_ID` | `orders` | Collection ID |
| `VITE_APPWRITE_MENU_COLLECTION_ID` | `menu` | Collection ID |
| `VITE_APPWRITE_CATEGORIES_COLLECTION_ID` | `categories` | Collection ID |

#### Bước 4: Deploy
Click **"Deploy"** → Chờ build xong

**Kết quả**: 
- URL: `https://foodfast-restaurant.vercel.app`
- Auto redeploy khi push to `main` branch

---

### 2️⃣ Deploy Project 2: Admin Dashboard

#### Bước 1: Tạo New Project
1. Vào https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Chọn repo `fast-food` (lần này để tạo deployment mới)

#### Bước 2: Cấu hình Project Settings
- **Project Name**: `foodfast-admin`
- **Framework Preset**: `Vite`
- **Root Directory**: `admin`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Bước 3: Add Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | `your_project_id` |
| `VITE_APPWRITE_DATABASE_ID` | `68da5e73002cb68e70af` |
| `VITE_APPWRITE_BUCKET_ID` | `68dacda1003d6943981e` |
| `VITE_APPWRITE_USER_COLLECTION_ID` | `user` |
| `VITE_APPWRITE_ORDERS_COLLECTION_ID` | `orders` |
| `VITE_APPWRITE_MENU_COLLECTION_ID` | `menu` |
| `VITE_APPWRITE_CATEGORIES_COLLECTION_ID` | `categories` |
| `VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID` | `customizations` |
| `VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID` | `menu_customizations` |

#### Bước 4: Deploy
Click **"Deploy"**

**Kết quả**:
- URL: `https://foodfast-admin.vercel.app`

---

### 3️⃣ Deploy Project 3: Mobile Web

#### Bước 1: Tạo New Project
1. Vào https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Chọn repo `fast-food`

#### Bước 2: Cấu hình Project Settings
- **Project Name**: `foodfast-mobile`
- **Framework Preset**: `Expo` (hoặc chọn `Other` và input `npm run web`)
- **Root Directory**: `mobile`
- **Build Command**: `npm run build` (hoặc `expo export:web`)
- **Output Directory**: `dist` (hoặc `web-build` tùy Expo config)

#### Bước 3: Add Environment Variables

| Variable | Value |
|----------|-------|
| `EXPO_PUBLIC_APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` |
| `EXPO_PUBLIC_APPWRITE_PROJECT_ID` | `your_project_id` |
| `EXPO_PUBLIC_APPWRITE_DATABASE_ID` | `68da5e73002cb68e70af` |
| `EXPO_PUBLIC_APPWRITE_BUCKET_ID` | `68dacda1003d6943981e` |

#### Bước 4: Deploy
Click **"Deploy"**

**Kết quả**:
- URL: `https://foodfast-mobile.vercel.app`

---

## 🖥️ Option 2: Deploy bằng CLI (Nhanh hơn)

### Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### Đăng nhập vào Vercel
```bash
vercel login
```

### Deploy 3 Projects

#### Project 1: Restaurant
```bash
cd restaurant
vercel --prod --name=foodfast-restaurant
```

Nhập Environment Variables khi được hỏi hoặc thêm file `.env.production`:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
VITE_APPWRITE_BUCKET_ID=68dacda1003d6943981e
VITE_APPWRITE_USER_COLLECTION_ID=user
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
```

#### Project 2: Admin
```bash
cd ../admin
vercel --prod --name=foodfast-admin
```

File `.env.production`:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
VITE_APPWRITE_BUCKET_ID=68dacda1003d6943981e
VITE_APPWRITE_USER_COLLECTION_ID=user
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID=customizations
VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID=menu_customizations
```

#### Project 3: Mobile
```bash
cd ../mobile
vercel --prod --name=foodfast-mobile
```

File `.env.production`:
```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
EXPO_PUBLIC_APPWRITE_BUCKET_ID=68dacda1003d6943981e
```

---

## 📝 Environment Variables cho mỗi Project

### 🏢 Restaurant Portal (`restaurant/.env.production`)
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
VITE_APPWRITE_BUCKET_ID=68dacda1003d6943981e
VITE_APPWRITE_USER_COLLECTION_ID=user
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
```

### 👨‍💼 Admin Dashboard (`admin/.env.production`)
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
VITE_APPWRITE_BUCKET_ID=68dacda1003d6943981e
VITE_APPWRITE_USER_COLLECTION_ID=user
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID=customizations
VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID=menu_customizations
```

### 📱 Mobile Web (`mobile/.env.production`)
```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
EXPO_PUBLIC_APPWRITE_BUCKET_ID=68dacda1003d6943981e
```

---

## ✅ Kiểm tra sau Deploy

### 1. Xác minh URLs
Sau deploy, bạn sẽ có 3 URLs:

| Project | URL |
|---------|-----|
| Restaurant | https://foodfast-restaurant.vercel.app |
| Admin | https://foodfast-admin.vercel.app |
| Mobile | https://foodfast-mobile.vercel.app |

### 2. Kiểm tra Logs
Vercel Dashboard → Project → Deployments → Click deployment → View Logs

Tìm kiếm:
- ✅ "Build completed"
- ✅ Không có "ERROR" hoặc "FAIL"

### 3. Test Functionality
- Vào mỗi URL để kiểm tra layout load đúng
- Kiểm tra Console (F12) có errors không
- Test basic features (login, navigation)

### 4. CORS Issues?
Nếu gặp lỗi CORS, cần update Appwrite settings:
1. Vào Appwrite Dashboard
2. Settings → Domains
3. Thêm 3 Vercel domains:
   - `https://foodfast-restaurant.vercel.app`
   - `https://foodfast-admin.vercel.app`
   - `https://foodfast-mobile.vercel.app`

---

## 🔄 Cập nhật Code

Khi bạn push code lên `main` branch:
```bash
git add .
git commit -m "Update feature XYZ"
git push origin main
```

→ **Vercel tự động redeploy** tất cả 3 projects! 🎉

---

## 🆘 Troubleshooting

### Build Failed: "npm command not found"
**Giải pháp**: 
- Đảm bảo `package.json` ở đúng folder (root của project)
- Check lại "Root Directory" setting

### Environment Variable Error
**Giải pháp**:
- Double check tên variables (phải đúng case: `VITE_` hoặc `EXPO_PUBLIC_`)
- Xác minh giá trị không có khoảng trắng

### CORS Error từ Appwrite
**Giải pháp**:
- Add Vercel domain vào Appwrite settings
- Chờ 5 phút để Appwrite cache update

### Vercel cho phép Custom Domain?
**Có!** Sau deploy, bạn có thể:
1. Vào Project Settings
2. Add Custom Domain
3. Update DNS records

Ví dụ:
- `restaurant.yourdomain.com`
- `admin.yourdomain.com`
- `mobile.yourdomain.com`

---

## 📞 Liên hệ Hỗ Trợ

- **Vercel Support**: https://vercel.com/support
- **Appwrite Docs**: https://appwrite.io/docs
- **Community Discord**: https://discord.gg/appwrite

---

**Happy Deploying! 🚀**
