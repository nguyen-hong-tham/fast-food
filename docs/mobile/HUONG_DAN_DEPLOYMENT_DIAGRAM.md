# Hướng Dẫn Vẽ Deployment Diagram - SGU Fastfood Deli

## Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Các Node Và Thiết Bị](#các-node-và-thiết-bị)
4. [Các Artifact](#các-artifact)
5. [Giao Thức Kết Nối](#giao-thức-kết-nối)
6. [Cách Vẽ Trên Draw.io](#cách-vẽ-trên-drawio)
7. [Ký Hiệu UML](#ký-hiệu-uml)

---

## Giới Thiệu

**Deployment Diagram** (Lược đồ triển khai) mô tả:
- Hạ tầng vật lý của hệ thống
- Các thiết bị phần cứng (devices/nodes)
- Phần mềm chạy trên từng thiết bị (artifacts)
- Cách thức giao tiếp giữa các thành phần

### So Sánh với Component Diagram:

| Đặc Điểm | Component Diagram | Deployment Diagram |
|----------|-------------------|-------------------|
| **Focus** | Cấu trúc logic phần mềm | Hạ tầng vật lý hệ thống |
| **Mô tả** | Components và dependencies | Devices, nodes và artifacts |
| **Góc nhìn** | Developer/Architect | DevOps/System Admin |
| **Trả lời** | "Phần mềm được tổ chức thế nào?" | "Phần mềm chạy ở đâu?" |

---

## Kiến Trúc Hệ Thống

### Tổng Quan 3 Tầng:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT DEVICES                        │
│  iOS   Android   Web Browser   Admin PC   POS Terminal  │
│   │       │           │            │          │          │
│   └───────┴───────────┴────────────┴──────────┘          │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                  NETWORK LAYER                           │
│              Internet / Cloud Network                    │
└───────────────────────┬─────────────────────────────────┘
                        │ API Calls
┌───────────────────────▼─────────────────────────────────┐
│              BACKEND SERVICES (Appwrite)                 │
│  App Server   Database   Storage   Auth Server          │
│      │           │          │           │                │
│   API/Logic   Collections  Files    JWT/OAuth           │
└─────────────────────────────────────────────────────────┘
```

---

## Các Node Và Thiết Bị

### 1️⃣ CLIENT DEVICES ZONE

Các thiết bị người dùng cuối sử dụng:

#### **A. iOS Device** 
```
<<device>>
iOS Device
- iPhone 12 trở lên
- iPad
- iOS 15+
- React Native App
```

**Đặc điểm:**
- Platform: iOS
- Runtime: React Native
- Storage: Local (AsyncStorage)
- Network: WiFi / Cellular

**Artifact chạy trên thiết bị:**
```
<<artifact>>
Fastfood Deli App (iOS)
- Built với Expo
- .ipa file
- Distributed via App Store
```

---

#### **B. Android Device** 
```
<<device>>
Android Device
- Android Phone
- Android Tablet
- Android 8.0+ (API 26+)
- React Native App
```

**Đặc điểm:**
- Platform: Android
- Runtime: React Native
- Storage: Local (AsyncStorage)
- Network: WiFi / Mobile Data

**Artifact chạy trên thiết bị:**
```
<<artifact>>
Fastfood Deli App (Android)
- Built với Expo
- .apk / .aab file
- Distributed via Google Play
```

---

#### **C. Web Browser** 
```
<<device>>
Web Browser
- Chrome, Firefox, Safari, Edge
- Desktop / Laptop
- Responsive Design
```

**Đặc điểm:**
- Platform: Web
- Runtime: Browser (V8/SpiderMonkey)
- Storage: localStorage / IndexedDB
- Network: WiFi / Ethernet

**Artifact chạy trên thiết bị:**
```
<<artifact>>
Web Application
- React Native Web
- Static HTML/CSS/JS
- Served via CDN
- PWA capable
```

---

#### **D. Admin PC** 
```
<<device>>
Admin PC
- Desktop Computer
- Windows / macOS / Linux
- Management Dashboard
```

**Đặc điểm:**
- Purpose: Administration
- Users: Store Managers, Admins
- Features: 
  - Menu management
  - Order tracking
  - User management
  - Analytics

**Artifact chạy trên thiết bị:**
```
<<artifact>>
Admin Dashboard
- Web-based Interface
- Appwrite Console Access
- Analytics Tools
```

---

#### **E. POS Terminal** 
```
<<device>>
POS Terminal
- Point of Sale System
- In-store Device
- Touch Screen
```

**Đặc điểm:**
- Location: Physical Store
- Purpose: In-store Orders
- Features:
  - Order taking
  - Payment processing
  - Receipt printing
  - Kitchen display

**Artifact chạy trên thiết bị:**
```
<<artifact>>
POS Software
- Order Management System
- Integrated with main system
- Offline capability
```

---

### 2️⃣ NETWORK LAYER

#### **Internet / Cloud Network** 
```
<<node>>
Internet / Cloud Network
- Global Network Infrastructure
- Protocols: HTTPS, WSS (WebSocket Secure)
- CDN: Content Delivery Network
```

**Đặc điểm:**
- Load Balancing
- SSL/TLS Encryption
- DDoS Protection
- Geographic Distribution

**Vai trò:**
- Kết nối clients với backend
- Đảm bảo bảo mật (HTTPS)
- Tối ưu tốc độ (CDN)
- High availability

---

### 3️⃣ BACKEND SERVICES ZONE (Appwrite Cloud)

#### **A. Application Server** 
```
<<device>>
Application Server
- Cloud Server Instance
- Docker Container
- Appwrite Runtime
```

**Specifications:**
- CPU: 4+ cores
- RAM: 8+ GB
- OS: Linux (Ubuntu/CentOS)
- Container: Docker

**Artifacts chạy trên server:**

1. **REST API**
```
<<artifact>>
REST API Service
- Appwrite SDK
- API Endpoints:
  - /account
  - /database
  - /storage
  - /functions
```

2. **Business Logic**
```
<<artifact>>
Business Logic
- Server Functions
- Validation Rules
- Business Rules
```

**Responsibilities:**
- Handle API requests
- Process business logic
- Coordinate with database/storage
- Session management

---

#### **B. Database Server** 
```
<<device>>
Database Server
- MariaDB / MySQL
- Cloud Managed Database
- ACID Compliant
```

**Specifications:**
- Engine: MariaDB 10.6+
- Storage: SSD
- Backup: Daily automated
- Replication: Master-Slave

**Artifact: Database Collections**
```
<<artifact>>
Database Collections:

1. users
   - accountId (primary key)
   - email
   - name
   - avatar
   - createdAt

2. menu
   - $id (primary key)
   - name
   - description
   - price
   - image
   - categoryId (foreign key)
   
3. categories
   - $id (primary key)
   - name
   - icon
   
4. orders
   - $id (primary key)
   - userId (foreign key)
   - items (JSON)
   - total
   - status
   - createdAt
   
5. customizations
   - $id (primary key)
   - name
   - price
   - type
   
6. menu_customizations
   - menuId (foreign key)
   - customizationId (foreign key)
```

---

#### **C. Storage Server** 
```
<<device>>
Storage Server
- File Storage System
- Object Storage (S3-compatible)
- CDN Integration
```

**Specifications:**
- Protocol: S3 API
- Redundancy: 3x replication
- CDN: CloudFlare/AWS CloudFront
- Max file size: 50MB

**Artifact: File Storage**
```
<<artifact>>
File Storage Structure:

/products/
  - burger-one.png
  - pizza-one.png
  - fries.png
  - ...
  
/avatars/
  - user-123-avatar.jpg
  - user-456-avatar.jpg
  
/assets/
  - logo.png
  - icons/
  - banners/
```

**Supported Formats:**
- Images: PNG, JPG, WebP
- Max size: 10MB per file
- Automatic optimization

---

#### **D. Authentication Server** 
```
<<device>>
Auth Server
- Authentication Service
- Authorization Service
- Session Management
```

**Specifications:**
- Protocol: OAuth 2.0
- Tokens: JWT (JSON Web Tokens)
- Session Storage: Redis
- Token Expiry: 24h

**Artifacts:**

1. **Auth Service**
```
<<artifact>>
Authentication Service
- Login/Logout
- Token Generation
- Token Validation
- Password Hashing (Bcrypt)
- OAuth Providers:
  - Google
  - Facebook
  - Apple
```

2. **Session Management**
```
<<artifact>>
Session Management
- Active Sessions Tracking
- Device Management
- Security Logs
- Suspicious Activity Detection
```

**Security Features:**
- Two-Factor Authentication (2FA)
- Email Verification
- Password Reset
- Brute Force Protection
- Rate Limiting

---

## Giao Thức Kết Nối

### 1. Client ↔ Internet (HTTPS)

```
Protocol: HTTPS (HTTP + TLS/SSL)
Port: 443
Encryption: TLS 1.3
```

**Luồng dữ liệu:**
```
Client Device
    │
    │ 1. DNS Lookup
    ├────────────────────→ DNS Server
    │                      "api.appwrite.io" → IP
    │
    │ 2. TLS Handshake
    ├────────────────────→ Load Balancer
    │ ←────────────────────  SSL Certificate
    │
    │ 3. HTTPS Request
    ├────────────────────→ API Gateway
    │    GET /v1/account
    │    Authorization: Bearer <token>
    │
    │ 4. Response
    │ ←────────────────────  200 OK
    │                        User Data (JSON)
```

---

### 2. Internet ↔ Backend (API Calls)

```
Protocol: REST API over HTTPS
Format: JSON
Authentication: JWT Bearer Token
```

**API Endpoints:**
```javascript
// Authentication
POST   /v1/account
POST   /v1/account/sessions/email
DELETE /v1/account/sessions/current

// Database
GET    /v1/databases/{databaseId}/collections/{collectionId}/documents
POST   /v1/databases/{databaseId}/collections/{collectionId}/documents
PUT    /v1/databases/{databaseId}/collections/{collectionId}/documents/{documentId}

// Storage
GET    /v1/storage/buckets/{bucketId}/files
POST   /v1/storage/buckets/{bucketId}/files
GET    /v1/storage/buckets/{bucketId}/files/{fileId}/view
```

---

### 3. App Server ↔ Database (SQL/TCP)

```
Protocol: MySQL Protocol over TCP
Port: 3306
Connection: Persistent Connection Pool
```

**Query Examples:**
```sql
-- Get Menu Items
SELECT * FROM menu 
WHERE categoryId = '123' 
AND active = true 
ORDER BY name;

-- Create Order
INSERT INTO orders (userId, items, total, status) 
VALUES ('user-123', '[...]', 59.99, 'pending');

-- Update User
UPDATE users 
SET name = 'John Doe', avatar = 'url' 
WHERE accountId = 'acc-123';
```

**Connection Pooling:**
- Min connections: 5
- Max connections: 20
- Idle timeout: 10 minutes

---

### 4. App Server ↔ Storage (File I/O)

```
Protocol: S3 API (HTTP REST)
Operations: PUT, GET, DELETE
Authentication: Access Key + Secret Key
```

**Operations:**
```javascript
// Upload File
PUT /bucket-id/products/burger.png
Content-Type: image/png
Content-Length: 245678

// Get File
GET /bucket-id/products/burger.png
Response: Binary Image Data

// Delete File
DELETE /bucket-id/products/old-image.png
```

---

### 5. Auth Server ↔ Database (User DB)

```
Protocol: SQL over TCP
Purpose: User Authentication & Authorization
```

**Auth Queries:**
```sql
-- Verify Login
SELECT * FROM users 
WHERE email = 'user@example.com';

-- Create Session
INSERT INTO sessions (userId, token, expiresAt, device) 
VALUES ('user-123', 'jwt-token', '2025-10-08', 'iPhone');

-- Validate Token
SELECT * FROM sessions 
WHERE token = 'jwt-token' 
AND expiresAt > NOW();
```

---

## 🎨 Cách Vẽ Trên Draw.io

### Bước 1: Mở File
1. Truy cập https://app.diagrams.net/
2. Open Existing Diagram
3. Chọn: `Fastfood-Deli_Deployment-Diagram.drawio`

### Bước 2: Hiểu Cấu Trúc

Diagram chia thành 3 zone:
- **Client Devices Zone** (màu xanh dương) - Thiết bị người dùng
- **Network Layer** (màu xanh lá) - Lớp mạng
- **Backend Services** (màu đỏ) - Hệ thống backend

### Bước 3: Các Hình Dạng (Shapes)

#### **Device/Node** - Hình khối 3D (Cube)
```
Sử dụng cho:
- Physical devices
- Servers
- Computers
- Mobile devices

Cách vẽ:
1. Kéo "Cube" từ thanh bên trái
2. Hoặc: Shape → Cube
3. Adjust size: 180x120
```

#### **Database** - Hình trụ (Cylinder)
```
Sử dụng cho:
- Database servers
- Storage systems
- Cache servers

Cách vẽ:
1. Kéo "Cylinder" từ thanh bên trái
2. Vertical orientation
3. Size: 180x180
```

#### **Network** - Hình lục giác (Hexagon)
```
Sử dụng cho:
- Network infrastructure
- Cloud services
- Communication layer

Cách vẽ:
1. Shape → Hexagon
2. Size: 300x80
```

#### **Artifact** - Hình chữ nhật (Rectangle)
```
Sử dụng cho:
- Software components
- Applications
- Services
- Files

Cách vẽ:
1. Rectangle tool
2. Add document icon (optional)
3. Size: 150x60
```

### Bước 4: Thêm Stereotypes

Format text cho các elements:

#### Device:
```
<<device>>
[Tên Thiết Bị]
Mô tả ngắn
```

#### Artifact:
```
<<artifact>>
[Tên Phần Mềm]
Chi tiết
```

#### Node:
```
<<node>>
[Tên Node]
Protocol/Details
```

### Bước 5: Vẽ Kết Nối

#### HTTPS Connection (Đường liền nét dày):
```
Style:
- Line: Solid (liền nét)
- Width: 2-3pt
- Arrow: None hoặc simple arrow
- Color: Black

Label: "HTTPS"
```

#### API Communication (Mũi tên khối):
```
Style:
- Line: Solid
- Width: 2pt
- Arrow: Block arrow (filled)
- Color: Black

Label: "API Calls", "REST API"
```

#### Internal Dependency (Đường đứt nét):
```
Style:
- Line: Dashed
- Width: 1.5pt
- Arrow: Open arrow
- Color: Black

Label: "SQL/TCP", "File I/O"
```

### Bước 6: Màu Sắc

#### Client Devices:
- Device: `#FFF2CC` (Vàng nhạt)
- Artifact: `#FFE6CC` (Cam nhạt)

#### Admin/Staff Devices:
- Device: `#E1D5E7` (Tím nhạt)
- Artifact: `#F8CECC` (Đỏ nhạt)

#### Network:
- `#B1DDF0` (Xanh dương nhạt)

#### Backend:
- Server: `#E1D5E7` (Tím nhạt)
- Database: `#DAE8FC` (Xanh dương nhạt)
- Artifact: `#FFE6CC` (Cam nhạt)

### Bước 7: Layout Tips

#### Alignment:
- Client devices: Cùng 1 hàng ngang
- Căn giữa theo trục dọc
- Khoảng cách đều: 40px

#### Layers:
- Top to bottom: Client → Network → Backend
- Spacing: 30-50px giữa các zones

#### Connections:
- Tránh chéo nhau
- Góc vuông 90 độ
- Label rõ ràng

---

## 📐 Ký Hiệu UML Deployment Diagram

### Stereotypes:

| Ký Hiệu | Ý Nghĩa | Ví Dụ |
|---------|---------|-------|
| `<<device>>` | Thiết bị vật lý | iPhone, Server |
| `<<node>>` | Nút xử lý | Cloud, Network |
| `<<artifact>>` | Sản phẩm phần mềm | App, Database |
| `<<execution environment>>` | Môi trường chạy | Browser, JVM |
| `<<communication path>>` | Đường truyền | HTTPS, TCP |

### Relationship Types:

| Ký Hiệu | Tên | Mô Tả | Khi Nào Dùng |
|---------|-----|-------|--------------|
| `━━` | Association | Kết nối vật lý | Device to Network |
| `--→` | Dependency | Phụ thuộc logic | App to Database |
| `━━→` | Communication | Giao tiếp | API Calls |
| `⊂━━` | Deployment | Deploy artifact lên node | App on Server |

### Node Types:

#### 1. **Device**
- Physical hardware
- Có khả năng xử lý
- Ví dụ: Server, PC, Phone

#### 2. **Execution Environment**
- Môi trường runtime
- Ví dụ: Browser, JVM, Container

#### 3. **Artifact**
- Software component
- Deployable unit
- Ví dụ: .apk, .exe, .jar

---

## 🔍 Phân Tích Chi Tiết Từng Luồng

### Luồng 1: User Login

```
1. User mở app trên iOS Device
   │
   ├─→ iOS App (React Native)
   │   - Hiển thị Login Screen
   │   - User nhập email/password
   │
2. App gửi request qua HTTPS
   │
   ├─→ Internet/Cloud Network
   │   - Mã hóa TLS
   │   - Route đến backend
   │
3. Request đến Auth Server
   │
   ├─→ Auth Server
   │   - Validate credentials
   │   - Query User Database
   │
4. Check database
   │
   ├─→ Database Server
   │   - SELECT * FROM users WHERE email = ?
   │   - Verify password hash
   │
5. Generate JWT Token
   │
   ├─→ Auth Server
   │   - Create JWT
   │   - Create session
   │
6. Return token to client
   │
   ├─→ Internet → iOS App
   │   - Store token locally
   │   - Redirect to Home Screen
```

---

### Luồng 2: Browse Menu

```
1. User vào Home Screen
   │
   ├─→ iOS App
   │   - Hiển thị loading
   │   - Call API getMenu()
   │
2. API Request
   │
   ├─→ Internet → App Server
   │   - GET /v1/databases/menu/documents
   │   - Authorization: Bearer <token>
   │
3. Query Database
   │
   ├─→ Database Server
   │   - SELECT * FROM menu WHERE active = true
   │   - JOIN categories
   │
4. Get Product Images
   │
   ├─→ Storage Server
   │   - Generate signed URLs
   │   - CDN cache check
   │
5. Return Data
   │
   ├─→ App Server → Internet → iOS App
   │   - JSON response with image URLs
   │   - App renders MenuCards
```

---

### Luồng 3: Add to Cart (Local)

```
1. User clicks "Add to Cart"
   │
   ├─→ iOS App (Local State)
   │   - Cart Store (Zustand)
   │   - addItem() function
   │   - Update UI
   │   - Badge counter++
   │
2. NO network call (offline capable)
   │
   ├─→ AsyncStorage (Local)
   │   - Persist cart data
   │   - Available after app restart
```

---

### Luồng 4: Checkout & Place Order

```
1. User clicks "Checkout"
   │
   ├─→ iOS App
   │   - Prepare order data
   │   - Calculate total
   │   - Payment info
   │
2. Send Order
   │
   ├─→ Internet → App Server
   │   - POST /v1/databases/orders/documents
   │   - Body: { userId, items, total, ... }
   │
3. Create Order Record
   │
   ├─→ Database Server
   │   - BEGIN TRANSACTION
   │   - INSERT INTO orders
   │   - UPDATE menu (stock count)
   │   - COMMIT
   │
4. Notify POS Terminal
   │
   ├─→ App Server → Internet → POS Device
   │   - WebSocket notification
   │   - New order alert
   │   - Print to kitchen
   │
5. Confirmation
   │
   ├─→ Internet → iOS App
   │   - Order successful
   │   - Clear cart
   │   - Show success screen
```

---

### Luồng 5: Admin Updates Menu

```
1. Admin logs in Admin PC
   │
   ├─→ Web Browser
   │   - Admin Dashboard
   │   - Appwrite Console
   │
2. Upload New Product Image
   │
   ├─→ Internet → App Server → Storage Server
   │   - POST /v1/storage/buckets/files
   │   - Multipart form data
   │   - Returns fileId
   │
3. Create Menu Item
   │
   ├─→ Internet → App Server → Database
   │   - POST /v1/databases/menu/documents
   │   - Body: { name, price, image: fileId, ... }
   │   - Returns documentId
   │
4. All clients auto-refresh
   │
   ├─→ Push notification / Polling
   │   - iOS App fetches new menu
   │   - Android App updates
   │   - Web refreshes
```

---

## 📊 Bảng Tổng Hợp

### Devices Summary:

| Device | OS/Platform | Purpose | Network | Artifact |
|--------|-------------|---------|---------|----------|
| iOS Device | iOS 15+ | Customer App | WiFi/4G | React Native App (.ipa) |
| Android Device | Android 8+ | Customer App | WiFi/4G | React Native App (.apk) |
| Web Browser | Any | Customer Web App | WiFi/Ethernet | React Web App (HTML/JS) |
| Admin PC | Windows/Mac | Management | Ethernet | Admin Dashboard |
| POS Terminal | Custom OS | In-store Orders | Ethernet | POS Software |

### Backend Servers Summary:

| Server | Type | Purpose | Specs | Protocol |
|--------|------|---------|-------|----------|
| App Server | Virtual Machine | API & Logic | 4 CPU, 8GB RAM | HTTPS/REST |
| Database Server | MariaDB | Data Storage | SSD, Replicated | MySQL Protocol |
| Storage Server | Object Storage | File Storage | S3-compatible | S3 API |
| Auth Server | Auth Service | Authentication | Redis Cache | OAuth 2.0 |

### Connection Summary:

| From | To | Protocol | Purpose | Encryption |
|------|----|----------|---------|------------|
| Client | Internet | HTTPS | API Requests | TLS 1.3 |
| Internet | Backend | HTTPS | Forward requests | TLS 1.3 |
| App Server | Database | TCP/SQL | Data queries | Internal network |
| App Server | Storage | HTTP | File operations | Internal network |
| Auth Server | Database | TCP/SQL | User auth | Internal network |

---

## 💡 Tips Vẽ Deployment Diagram Đẹp

### ✅ DO:
- Group related nodes into zones
- Use consistent spacing
- Label all connections clearly
- Use appropriate shapes (cube for device, cylinder for database)
- Show physical hardware characteristics
- Indicate protocols and ports
- Use colors to distinguish zones

### ❌ DON'T:
- Mix logical and physical views
- Clutter with too many details
- Cross connection lines unnecessarily
- Use too many colors
- Forget to label connections
- Make diagram too complex

---

## 🎯 Checklist Hoàn Thành

### Client Zone:
- [ ] iOS Device với React Native App
- [ ] Android Device với React Native App
- [ ] Web Browser với Web App
- [ ] Admin PC với Dashboard
- [ ] POS Terminal với POS Software

### Network Layer:
- [ ] Internet/Cloud Network node
- [ ] HTTPS connections từ clients
- [ ] API communication paths

### Backend Zone:
- [ ] Application Server với API artifacts
- [ ] Database Server với collections
- [ ] Storage Server với file storage
- [ ] Auth Server với auth service

### Connections:
- [ ] Clients → Internet (HTTPS)
- [ ] Internet → Servers (API)
- [ ] App Server → Database (SQL)
- [ ] App Server → Storage (File I/O)
- [ ] Auth Server → Database (User DB)

### Documentation:
- [ ] All nodes labeled
- [ ] All connections labeled with protocol
- [ ] Legend/Chú thích
- [ ] Title and description
- [ ] Color coding consistent

---

## Mẫu Mô Tả Trong Báo Cáo

### Giới Thiệu:
```
Hệ thống SGU Fastfood Deli được triển khai theo mô hình 
Client-Server với kiến trúc phân tán. Ứng dụng hỗ trợ 
đa nền tảng (iOS, Android, Web) và tích hợp với backend 
cloud-based (Appwrite) để đảm bảo tính mở rộng và 
khả dụng cao.
```

### Mô Tả Client Layer:
```
Lớp Client bao gồm 5 loại thiết bị:
1. iOS Device: iPhone/iPad chạy React Native app
2. Android Device: Phone/Tablet chạy React Native app  
3. Web Browser: Desktop/Laptop truy cập qua browser
4. Admin PC: Máy tính quản lý cho nhân viên
5. POS Terminal: Thiết bị tại quầy thu ngân

Tất cả thiết bị kết nối với backend qua HTTPS để 
đảm bảo bảo mật thông tin người dùng.
```

### Mô Tả Backend:
```
Backend sử dụng Appwrite - một BaaS (Backend as a Service) 
bao gồm 4 server chính:

1. Application Server: Xử lý API requests và business logic
2. Database Server: MariaDB lưu trữ dữ liệu người dùng, 
   menu, đơn hàng
3. Storage Server: Lưu trữ hình ảnh sản phẩm, avatar
4. Auth Server: Quản lý authentication và authorization

Các server giao tiếp với nhau qua internal network 
để đảm bảo hiệu suất cao.
```

---

## So Sánh Deployment Diagram vs Component Diagram

| Tiêu Chí | Component Diagram | Deployment Diagram |
|----------|-------------------|-------------------|
| **Mục đích** | Mô tả cấu trúc code | Mô tả hạ tầng vật lý |
| **Elements** | Components, Interfaces | Nodes, Devices, Artifacts |
| **Focus** | Software architecture | Hardware architecture |
| **Viewpoint** | Developer | DevOps/SysAdmin |
| **Level** | Logical | Physical |
| **Khi nào dùng** | Thiết kế phần mềm | Deployment planning |
| **Trả lời câu hỏi** | "Code tổ chức thế nào?" | "Code chạy ở đâu?" |

### Mối Quan Hệ:
- **Component** (từ Component Diagram) được đóng gói thành **Artifact**
- **Artifact** được deploy lên **Node/Device** (trong Deployment Diagram)

```
Component Diagram:              Deployment Diagram:
┌──────────────┐               ┌──────────────┐
│ Auth Store   │  ─ builds ─→  │  iOS App     │
│ (Component)  │      into     │  (Artifact)  │
└──────────────┘               └──────────────┘
                                      │
                                  deployed on
                                      │
                                      ▼
                               ┌──────────────┐
                               │ iOS Device   │
                               │   (Node)     │
                               └──────────────┘
```
