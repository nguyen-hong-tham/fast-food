# 📋 Product Requirements Document (PRD)
## FoodFast - Frontend Developer Role (React Native + React.js)

---

## 📌 Document Information

| Field | Value |
|-------|-------|
| **Project** | FoodFast - Drone Delivery Food Ordering Platform |
| **Document Type** | Product Requirements Document (PRD) |
| **Target Role** | Frontend Developer (React Native + React.js) |
| **Version** | 1.0 |
| **Last Updated** | October 28, 2025 |
| **Status** | Active Development |

---

## 1. Problem Alignment

### 1.1. Stakeholder Problems

#### 👥 **Customers (Mobile App Users)**
**Problems:**
- Muốn đặt đồ ăn nhanh chóng với ít thao tác → **Cần UI/UX tối ưu với flow đơn giản**
- Không biết đơn hàng đang ở đâu → **Cần tracking realtime với bản đồ và ETA rõ ràng**
- Khó tìm món ăn phù hợp → **Cần tính năng search và filter thông minh**
- Lo lắng về thanh toán online → **Cần nhiều phương thức thanh toán (VNPay + COD)**
- Muốn xem review trước khi đặt → **Cần hệ thống đánh giá nhà hàng và món ăn**

#### 🏪 **Restaurant Owners (Web Portal Users)**
**Problems:**
- Nhận đơn hàng chậm, dễ bỏ sót → **Cần dashboard realtime với notification âm thanh**
- Khó quản lý menu và tồn kho → **Cần giao diện CRUD menu trực quan**
- Không hiểu insight kinh doanh → **Cần analytics dashboard với charts và reports**
- Setup nhà hàng phức tạp → **Cần onboarding flow đơn giản với map picker**

#### 🎛️ **System Administrators (Admin Dashboard Users)**
**Problems:**
- Khó duyệt nhà hàng mới → **Cần workflow approval rõ ràng**
- Không theo dõi được đơn hàng toàn hệ thống → **Cần monitoring dashboard tập trung**
- Quản lý drone thủ công → **Cần drone fleet management với telemetry**
- Thiếu báo cáo tổng quan → **Cần analytics với GMV, KPIs, trends**

#### 🚁 **Drone Delivery System**
**Problems:**
- Khách hàng không thấy drone đang bay → **Cần real-time tracking với 60-second simulation**
- Không có Proof of Delivery → **Cần QR scan hoặc photo confirmation**
- Xử lý offline khi mất kết nối → **Cần local storage và sync khi có mạng trở lại**

---

## 2. Solution Alignment

> **Định hướng giải pháp kỹ thuật và kiến trúc hệ thống**

### 2.1. System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐ │
│  │  📱 Customer     │    │  🏪 Restaurant   │    │  🎛️ Admin       │ │
│  │  Mobile App      │    │  Portal (Web)    │    │  Dashboard      │ │
│  │                  │    │                  │    │                 │ │
│  │  React Native    │    │  Next.js 14      │    │  React + Vite   │ │
│  │  • Expo 54       │    │  • App Router    │    │  • TypeScript   │ │
│  │  • NativeWind    │    │  • Server Comp   │    │  • TailwindCSS  │ │
│  │  • Zustand       │    │  • Zustand       │    │  • Recharts     │ │
│  │  • Expo Router   │    │  • React Hook    │    │  • Lucide Icons │ │
│  │                  │    │    Form          │    │                 │ │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬────────┘ │
│           │                       │                       │           │
│           │  API Calls            │  API Calls            │  API      │
│           │  Realtime Updates     │  Realtime Notif       │  Calls    │
│           │                       │                       │           │
└───────────┼───────────────────────┼───────────────────────┼───────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER (BaaS)                            │
│                     ┌─────────────────────────┐                        │
│                     │  ☁️ Appwrite Cloud      │                        │
│                     │  (Backend as a Service) │                        │
│                     └────────────┬────────────┘                        │
│                                  │                                     │
│  ┌───────────────────────────────┼──────────────────────────────┐    │
│  │                               │                               │    │
│  │  ┌────────────┐  ┌──────────┐│┌──────────┐  ┌─────────────┐ │    │
│  │  │ 🔐 Auth    │  │ 💾 DB    │││ 📦 Storage│  │ ⚡ Realtime │ │    │
│  │  │            │  │          │││           │  │             │ │    │
│  │  │ • Sessions │  │ • 16     │││ • Images  │  │ • WebSocket │ │    │
│  │  │ • Roles    │  │   Colls  │││ • CDN     │  │ • Events    │ │    │
│  │  │ • JWT      │  │ • Indexes│││ • Upload  │  │ • Broadcast │ │    │
│  │  └────────────┘  └──────────┘││           │  └─────────────┘ │    │
│  │                               │└──────────┘                   │    │
│  │  ┌────────────────────────────┴───────────────────────────┐  │    │
│  │  │ ⚙️ Cloud Functions                                      │  │    │
│  │  │ • Payment Webhooks (VNPay callback)                    │  │    │
│  │  │ • Email Notifications (Order confirmed)                │  │    │
│  │  │ • Drone Simulation Engine (60-second countdown)        │  │    │
│  │  │ • Analytics Aggregation (Daily reports)                │  │    │
│  │  └────────────────────────────────────────────────────────┘  │    │
│  └───────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
            │                       │                       │
            │  Webhooks             │  API Calls            │  Telemetry
            │  Redirects            │  Queries              │  Events
            │                       │                       │
            ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────┐ │
│  │ 💳 VNPay    │   │ 🗺️ Maps      │   │ 🔔 Firebase  │   │ 🚁 Drone│ │
│  │  Gateway    │   │  Provider    │   │  Cloud Msg   │   │ Service │ │
│  │             │   │              │   │              │   │         │ │
│  │ • Create    │   │ • Google     │   │ • Push       │   │ • Sim   │ │
│  │   Intent    │   │   Maps API   │   │   Notifs     │   │ • Tele- │ │
│  │ • Process   │   │ • Mapbox     │   │ • FCM Tokens │   │   metry │ │
│  │ • Webhook   │   │ • Tiles      │   │ • Topics     │   │ • PoD   │ │
│  │ • Refund    │   │ • Directions │   │              │   │         │ │
│  │             │   │ • ETA        │   │              │   │         │ │
│  └─────────────┘   └──────────────┘   └──────────────┘   └─────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            ▲
            │
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                     │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  💾 Appwrite Database (16 Collections)                       │    │
│  │                                                               │    │
│  │  • users           • restaurants      • menu_items           │    │
│  │  • categories      • orders           • order_items          │    │
│  │  • payments        • drones           • drone_events         │    │
│  │  • reviews         • notifications    • customizations       │    │
│  │  • menu_customizations  • addresses  • vouchers  • audit_logs│    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2. Data Flow Explanation

#### 🔄 **Flow 1: Customer Orders Food (Mobile App)**

```
┌──────────────┐
│ 1. Customer  │ Opens Mobile App
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│ 2. React Native App │ → API Call: GET /restaurants, GET /menu
│    (Expo + Zustand) │ ← Response: Restaurant list, Menu items
└──────┬──────────────┘
       │
       │ Browse → Add to Cart (Zustand state)
       │
       ▼
┌─────────────────────┐
│ 3. Checkout Screen  │ → API Call: POST /orders (create order)
└──────┬──────────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌──────────────┐
│ 4a. VNPay   │    │ 4b. COD      │
│ Payment     │    │ Payment      │
└──────┬──────┘    └──────┬───────┘
       │                  │
       │ Create Payment   │ Create Order
       │ Intent           │ Directly
       │                  │
       ▼                  │
┌──────────────────┐      │
│ VNPay Gateway    │      │
│ (User pays)      │      │
└──────┬───────────┘      │
       │                  │
       │ Webhook          │
       │ (success/fail)   │
       │                  │
       ▼                  ▼
┌─────────────────────────────────┐
│ 5. Appwrite Cloud Function      │
│    → Update Order Status         │
│    → Send Push Notification      │
│    → Trigger Realtime Event      │
└──────┬──────────────────────────┘
       │
       │ WebSocket Broadcast
       │
       ▼
┌─────────────────────┐
│ 6. Customer App     │ ← Realtime: Order confirmed ✅
│    Order Tracking   │ ← Realtime: Preparing...
│    Screen           │ ← Realtime: Drone en route 🚁
└─────────────────────┘
```

---

#### 🔄 **Flow 2: Restaurant Receives Order (Web Portal)**

```
┌──────────────────┐
│ Restaurant Owner │ Logged in to Portal
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ Next.js Dashboard       │ ← Realtime: New order event
│ (Order Dashboard Page)  │ ← WebSocket: Order data
└────────┬────────────────┘
         │
         │ 🔊 Sound Notification: "New order!"
         │
         ▼
┌─────────────────────────┐
│ Order Card UI           │
│ • Customer name         │
│ • Order items           │
│ • Total amount          │
│ • Actions: Accept/Reject│
└────────┬────────────────┘
         │
         │ Click "Accept"
         │
         ▼
┌─────────────────────────┐
│ API Call:               │ → PATCH /orders/:id/status
│ updateOrderStatus()     │    { status: "confirmed" }
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Appwrite Updates DB     │
│ • Order status: preparing
│ • Timestamp: confirmedAt
│ • Broadcast event       │
└────────┬────────────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌────────────────┐    ┌───────────────────┐
│ Customer App   │    │ Admin Dashboard   │
│ ← Realtime     │    │ ← Realtime        │
│ "Confirmed"    │    │ Order updated     │
└────────────────┘    └───────────────────┘
```

---

#### 🔄 **Flow 3: Drone Delivery Simulation (Admin Dashboard)**

```
┌──────────────┐
│ Admin        │ Opens Drone Management Page
└──────┬───────┘
       │
       ▼
┌─────────────────────────┐
│ React Admin Dashboard   │ → API Call: GET /drones
│ (Drone Fleet Page)      │ ← Response: All drones + status
└──────┬──────────────────┘
       │
       │ Select Order → Assign Drone
       │
       ▼
┌─────────────────────────┐
│ API Call:               │ → POST /drones/:id/assign
│ assignDroneToOrder()    │    { orderId: "123" }
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Appwrite Cloud Function         │
│ startDroneSimulation()          │
│                                 │
│ for (let i = 0; i <= 60; i++) { │
│   setTimeout(() => {            │
│     const progress = i / 60;    │
│     const location =            │
│       interpolate(start, end,   │
│                   progress);    │
│     updateDroneLocation(        │
│       droneId, location         │
│     );                          │
│     broadcastDroneUpdate();     │
│   }, i * 1000);                 │
│ }                               │
└──────┬──────────────────────────┘
       │
       │ Every second (60 times)
       │
       ▼
┌─────────────────────────┐
│ WebSocket Broadcast     │ → Event: drone.location.updated
│                         │    { droneId, lat, lng, progress }
└──────┬──────────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌────────────────┐    ┌───────────────────┐
│ Customer App   │    │ Admin Dashboard   │
│ Order Tracking │    │ Drone Telemetry   │
│ • Map updates  │    │ • Real-time map   │
│ • ETA countdown│    │ • Progress bar    │
│ • "Arriving in │    │ • Battery level   │
│   30 secs"     │    │                   │
└────────────────┘    └───────────────────┘
       │
       │ After 60 seconds
       │
       ▼
┌─────────────────────────┐
│ Order Status:           │ → "delivered" ✅
│ Drone Status:           │ → "available" (idle)
│ Push Notification:      │ → "Your order has arrived!"
└─────────────────────────┘
```

---

### 2.3. Key Technical Components

#### 2.3.1. 📱 **React Native Mobile App (Customer)**

**Tech Stack:**
- **Framework**: React Native 0.81.4 (via Expo 54)
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind 4.2.1 (TailwindCSS for React Native)
- **State**: Zustand 5.0.8 (auth, cart, orders)
- **Backend SDK**: `react-native-appwrite` 0.14.0

**Core Features:**
```typescript
// State Management (Zustand)
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface CartStore {
  items: CartItemType[];
  addItem: (item: CartItemType) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId, quantity) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// API Integration (Appwrite SDK)
import { Client, Account, Databases, Storage } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Example API calls
export const getAllRestaurants = async () => {
  return await databases.listDocuments(
    DATABASE_ID,
    RESTAURANTS_COLLECTION_ID,
    [Query.equal('isActive', true)]
  );
};

export const createOrder = async (orderData: CreateOrderData) => {
  return await databases.createDocument(
    DATABASE_ID,
    ORDERS_COLLECTION_ID,
    ID.unique(),
    orderData
  );
};
```

**File Structure:**
```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── sign-in.tsx       # Login screen
│   │   └── sign-up.tsx       # Register screen
│   ├── (tabs)/
│   │   ├── index.tsx         # Home (restaurants list)
│   │   ├── cart.tsx          # Cart screen
│   │   ├── profile.tsx       # User profile
│   │   └── restaurants.tsx   # Restaurant discovery
│   ├── menu-detail.tsx       # Menu item details
│   ├── checkout.tsx          # Checkout flow
│   ├── payment-selection.tsx # Choose payment method
│   ├── order-tracking.tsx    # Real-time tracking
│   └── order-history.tsx     # Past orders
├── components/
│   ├── CartButton.tsx        # Cart badge button
│   ├── RestaurantCard.tsx    # Restaurant display
│   ├── MenuItemCard.tsx      # Menu item display
│   └── MapView.tsx           # Drone tracking map
├── lib/
│   ├── appwrite.ts           # Appwrite client setup
│   └── useAppwrite.ts        # Custom React hook
└── store/
    ├── authStore.ts          # Authentication state
    └── cartStore.ts          # Shopping cart state
```

---

#### 2.3.2. 🏪 **Next.js Restaurant Portal (Web)**

**Tech Stack:**
- **Framework**: Next.js 14.0.4 (App Router)
- **Styling**: TailwindCSS 3.4.0
- **State**: Zustand 4.4.7
- **Forms**: React Hook Form 7.49.2
- **Charts**: Recharts 2.10.3
- **Backend SDK**: `appwrite` 13.0.1

**Core Features:**
```typescript
// Authentication (Zustand + Appwrite)
interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Real-time Order Subscription
useEffect(() => {
  if (!restaurant) return;
  
  // Subscribe to new orders for this restaurant
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${ORDERS_COLLECTION_ID}.documents`,
    (response) => {
      const order = response.payload as Order;
      
      if (order.restaurantId === restaurant.$id) {
        // Play sound notification
        playSound('/sounds/new-order.mp3');
        
        // Add to order list
        setOrders(prev => [order, ...prev]);
        
        // Show toast notification
        toast.success('New order received!');
      }
    }
  );
  
  return () => unsubscribe();
}, [restaurant]);

// Update Order Status
const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  await databases.updateDocument(
    DATABASE_ID,
    ORDERS_COLLECTION_ID,
    orderId,
    { status, [`${status}At`]: new Date().toISOString() }
  );
};
```

**File Structure:**
```
restaurant-portal/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx      # Login page
│   │   ├── dashboard/
│   │   │   ├── page.tsx      # Dashboard overview
│   │   │   ├── menu/
│   │   │   │   └── page.tsx  # Menu management
│   │   │   ├── orders/
│   │   │   │   └── page.tsx  # Order dashboard
│   │   │   └── analytics/
│   │   │       └── page.tsx  # Analytics charts
│   │   └── setup-restaurant/
│   │       └── page.tsx      # Onboarding flow
│   ├── components/
│   │   ├── DashboardLayout.tsx  # Sidebar layout
│   │   ├── OrderCard.tsx        # Order display
│   │   ├── MenuItemForm.tsx     # CRUD form
│   │   └── MapPicker.tsx        # Location picker
│   ├── lib/
│   │   └── appwrite.ts          # Appwrite client
│   └── store/
│       └── authStore.ts         # Auth state
└── public/
    └── sounds/
        └── new-order.mp3        # Notification sound
```

---

#### 2.3.3. 🎛️ **React Admin Dashboard (Vite)**

**Tech Stack:**
- **Framework**: React 18.3.1 + Vite 6.0.3
- **Routing**: React Router DOM 6.28.0
- **Styling**: TailwindCSS 3.4.15
- **State**: Zustand 5.0.8
- **Charts**: Recharts 2.15.0
- **Icons**: Lucide React 0.468.0
- **Backend SDK**: `appwrite` 16.0.2

**Core Features:**
```typescript
// Admin-only Authentication
const signIn = async (email: string, password: string) => {
  await account.createEmailPasswordSession(email, password);
  
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    await account.deleteSession('current');
    throw new Error('Access denied. Admin privileges required.');
  }
  
  return user;
};

// Drone Simulation Control
const startDroneSimulation = async (orderId: string, droneId: string) => {
  const order = await getOrder(orderId);
  const restaurant = await getRestaurant(order.restaurantId);
  
  const startLocation = {
    lat: restaurant.latitude,
    lng: restaurant.longitude
  };
  const endLocation = {
    lat: order.deliveryLatitude,
    lng: order.deliveryLongitude
  };
  
  // 60-second simulation
  for (let step = 0; step <= 60; step++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const progress = step / 60;
    const currentLocation = interpolateLocation(
      startLocation,
      endLocation,
      progress
    );
    
    // Update drone location in database
    await updateDroneLocation(droneId, currentLocation);
    
    // Broadcast to all listening clients
    // (Appwrite Realtime handles this automatically)
  }
  
  // Mark order as delivered
  await updateOrderStatus(orderId, 'delivered');
};
```

**File Structure:**
```
admin/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx         # Admin login
│   │   ├── DashboardPage.tsx     # Overview + KPIs
│   │   ├── OrdersPage.tsx        # All orders monitoring
│   │   ├── CustomersPage.tsx     # User management
│   │   ├── DronesPage.tsx        # Drone fleet
│   │   └── AnalyticsPage.tsx     # System analytics
│   ├── components/
│   │   ├── Layout.tsx            # Admin layout
│   │   ├── DroneCard.tsx         # Drone status display
│   │   └── OrderTimeline.tsx     # Order status history
│   ├── lib/
│   │   ├── appwrite.ts           # Appwrite client
│   │   └── api.ts                # API functions
│   └── store/
│       └── authStore.ts          # Admin auth state
└── scripts/
    └── create-admin.js           # Create admin user
```

---

### 2.4. Database Schema (Appwrite Collections)

#### 📊 **Core Collections (16 total)**

| Collection | Key Attributes | Purpose |
|-----------|---------------|---------|
| **users** | `accountId`, `email`, `name`, `role`, `avatar`, `phone` | All users (customers, restaurants, admins) |
| **restaurants** | `ownerId`, `name`, `address`, `latitude`, `longitude`, `status`, `rating` | Restaurant profiles |
| **categories** | `name`, `restaurantId`, `order`, `icon` | Menu categories (Breakfast, Lunch, etc.) |
| **menu_items** | `restaurantId`, `categoryId`, `name`, `price`, `imageUrl`, `isAvailable`, `stock` | Menu items with inventory |
| **customizations** | `name`, `type`, `options`, `price` | Customization options (size, toppings) |
| **menu_customizations** | `menuItemId`, `customizationId` | Link menu items ↔ customizations |
| **orders** | `customerId`, `restaurantId`, `status`, `total`, `paymentMethod`, `droneId` | Order records |
| **order_items** | `orderId`, `menuItemId`, `quantity`, `unitPrice`, `customizations`, `notes` | Order line items |
| **payments** | `orderId`, `provider`, `amount`, `status`, `transactionId`, `rawResponse` | Payment transactions |
| **drones** | `droneCode`, `status`, `currentLocation`, `batteryLevel`, `assignedOrderId` | Drone fleet |
| **drone_events** | `droneId`, `orderId`, `eventType`, `timestamp`, `location` | Telemetry logs |
| **reviews** | `orderId`, `customerId`, `restaurantId`, `rating`, `comment`, `createdAt` | Restaurant ratings |
| **notifications** | `targetId`, `type`, `title`, `body`, `isRead`, `sentAt` | Push notifications log |
| **vouchers** | `code`, `discount`, `minOrder`, `maxUses`, `expiresAt` | Discount codes |
| **addresses** | `userId`, `label`, `address`, `latitude`, `longitude`, `isDefault` | Saved addresses |
| **audit_logs** | `actorId`, `action`, `entity`, `before`, `after`, `timestamp` | System audit trail |

---

### 2.5. External Service Integrations

#### 💳 **VNPay Payment Gateway**

**Integration Flow:**
```typescript
// 1. Create Payment Intent (Mobile App)
const createVNPayPayment = async (orderData: {
  orderId: string;
  amount: number;
  returnUrl: string;
}) => {
  const response = await fetch(`${BACKEND_URL}/payments/vnpay/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  const { paymentUrl } = await response.json();
  
  // Redirect user to VNPay gateway
  return paymentUrl;
};

// 2. Handle Webhook (Backend - Appwrite Cloud Function)
export default async ({ req, res }) => {
  const webhookData = req.body;
  
  // Verify VNPay signature
  const isValid = verifyVNPaySignature(webhookData);
  
  if (!isValid) {
    return res.json({ error: 'Invalid signature' }, 400);
  }
  
  // Update order status
  const orderId = webhookData.vnp_TxnRef;
  const status = webhookData.vnp_ResponseCode === '00' ? 'paid' : 'failed';
  
  await databases.updateDocument(
    DATABASE_ID,
    ORDERS_COLLECTION_ID,
    orderId,
    { paymentStatus: status }
  );
  
  // Send notification
  if (status === 'paid') {
    await sendPushNotification(orderId, 'Payment successful! ✅');
  }
  
  return res.json({ success: true });
};
```

---

#### 🗺️ **Maps Provider (Google Maps / Mapbox)**

**Use Cases:**
1. **Restaurant Location Picker** (Portal onboarding)
2. **Delivery Address Input** (Mobile checkout)
3. **Drone Tracking Map** (Mobile order tracking)
4. **ETA Calculation** (Distance-based estimation)

**Example (React Native):**
```typescript
import MapView, { Marker, Polyline } from 'react-native-maps';

<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: order.restaurantLatitude,
    longitude: order.restaurantLongitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  {/* Restaurant marker */}
  <Marker
    coordinate={{
      latitude: order.restaurantLatitude,
      longitude: order.restaurantLongitude,
    }}
    title="Restaurant"
    pinColor="red"
  />
  
  {/* Drone marker (real-time) */}
  <Marker
    coordinate={{
      latitude: drone.currentLatitude,
      longitude: drone.currentLongitude,
    }}
    title="Drone 🚁"
    pinColor="blue"
  />
  
  {/* Customer marker */}
  <Marker
    coordinate={{
      latitude: order.deliveryLatitude,
      longitude: order.deliveryLongitude,
    }}
    title="Delivery Location"
    pinColor="green"
  />
  
  {/* Flight path */}
  <Polyline
    coordinates={dronePath}
    strokeColor="#0000FF"
    strokeWidth={3}
  />
</MapView>
```

---

#### 🔔 **Firebase Cloud Messaging (Push Notifications)**

**Setup:**
```typescript
// 1. Initialize FCM in Mobile App
import messaging from '@react-native-firebase/messaging';

// Request permission
const requestPermission = async () => {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
};

// Get FCM token
const getFCMToken = async () => {
  const token = await messaging().getToken();
  
  // Save token to user document in Appwrite
  await databases.updateDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    userId,
    { fcmToken: token }
  );
};

// 2. Send Notification (Backend - Appwrite Cloud Function)
import admin from 'firebase-admin';

const sendPushNotification = async (userId: string, message: string) => {
  const user = await databases.getDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    userId
  );
  
  if (!user.fcmToken) return;
  
  await admin.messaging().send({
    token: user.fcmToken,
    notification: {
      title: 'FoodFast',
      body: message,
    },
    data: {
      orderId: order.$id,
      type: 'order_update',
    },
  });
};
```

**Notification Triggers:**
- ✅ Order confirmed
- 🍳 Restaurant started preparing
- 🚁 Drone en route
- 📦 Order delivered
- ⭐ Please rate your order

---

### 2.6. Real-time Architecture

**Appwrite Realtime Channels:**

```typescript
// 1. Subscribe to Order Updates (Mobile App)
import { client } from './lib/appwrite';

useEffect(() => {
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${ORDERS_COLLECTION_ID}.documents.${orderId}`,
    (response) => {
      const updatedOrder = response.payload as Order;
      
      setOrder(updatedOrder);
      
      // Show toast notification
      if (updatedOrder.status === 'preparing') {
        showToast('Your food is being prepared! 🍳');
      } else if (updatedOrder.status === 'delivering') {
        showToast('Drone is on the way! 🚁');
      }
    }
  );
  
  return () => unsubscribe();
}, [orderId]);

// 2. Subscribe to Drone Location (Mobile + Admin)
useEffect(() => {
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${DRONES_COLLECTION_ID}.documents.${droneId}`,
    (response) => {
      const updatedDrone = response.payload as Drone;
      
      setDroneLocation({
        latitude: updatedDrone.currentLatitude,
        longitude: updatedDrone.currentLongitude,
      });
      
      // Animate map marker
      animateMarker(updatedDrone);
    }
  );
  
  return () => unsubscribe();
}, [droneId]);

// 3. Subscribe to New Orders (Restaurant Portal)
useEffect(() => {
  if (!restaurant) return;
  
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${ORDERS_COLLECTION_ID}.documents`,
    (response) => {
      const newOrder = response.payload as Order;
      
      // Filter orders for this restaurant only
      if (newOrder.restaurantId === restaurant.$id) {
        // Play sound
        playSound('/sounds/new-order.mp3');
        
        // Add to order list
        setOrders(prev => [newOrder, ...prev]);
      }
    }
  );
  
  return () => unsubscribe();
}, [restaurant]);
```

---

### 2.7. Security & Authentication

#### 🔐 **Role-Based Access Control (RBAC)**

```typescript
// User Roles
type UserRole = 'customer' | 'restaurant' | 'admin';

// Permission Checks
const checkPermission = (user: User, action: string, resource: string) => {
  const permissions = {
    customer: {
      orders: ['create', 'read'], // Can create and view own orders
      reviews: ['create', 'read'], // Can review restaurants
    },
    restaurant: {
      menu: ['create', 'read', 'update', 'delete'], // Full CRUD on own menu
      orders: ['read', 'update'], // Can view and update order status
      restaurant: ['read', 'update'], // Can update own profile
    },
    admin: {
      '*': ['*'], // Full access to everything
    },
  };
  
  const userPermissions = permissions[user.role];
  
  if (userPermissions['*']?.[0] === '*') return true; // Admin
  
  return userPermissions[resource]?.includes(action);
};

// Protected Route (React)
const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && user.role !== requiredRole) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
};
```

---

### 2.8. Offline Support & Data Persistence

#### 📱 **Mobile App (React Native)**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Persist Cart Data
const cartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set(state => ({
        items: [...state.items, item]
      })),
      // ... other actions
    }),
    {
      name: 'cart-storage',
      storage: AsyncStorage,
    }
  )
);

// 2. Cache Menu Data
const cacheMenuItems = async (restaurantId: string) => {
  const menuItems = await getMenuItems(restaurantId);
  
  await AsyncStorage.setItem(
    `menu_${restaurantId}`,
    JSON.stringify(menuItems)
  );
};

const getMenuItemsOffline = async (restaurantId: string) => {
  const cached = await AsyncStorage.getItem(`menu_${restaurantId}`);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fallback to API
  return await getMenuItems(restaurantId);
};

// 3. Queue Failed Requests
const queueFailedRequest = async (request: FailedRequest) => {
  const queue = await AsyncStorage.getItem('request_queue') || '[]';
  const requests = JSON.parse(queue);
  
  requests.push(request);
  
  await AsyncStorage.setItem('request_queue', JSON.stringify(requests));
};

// 4. Sync When Online
const syncQueuedRequests = async () => {
  const queue = await AsyncStorage.getItem('request_queue') || '[]';
  const requests = JSON.parse(queue);
  
  for (const request of requests) {
    try {
      await fetch(request.url, request.options);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
  
  // Clear queue
  await AsyncStorage.setItem('request_queue', '[]');
};

// Listen for network changes
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncQueuedRequests();
  }
});
```

---

### 2.9. Performance Optimization Strategies

#### ⚡ **Frontend Optimizations**

1. **Image Optimization**
```typescript
// Use Appwrite Storage CDN with compression
const getOptimizedImageUrl = (fileId: string, width: number) => {
  return storage.getFilePreview(
    BUCKET_ID,
    fileId,
    width,
    0, // height (auto)
    'center', // gravity
    85, // quality
    0, // border width
    'FFFFFF', // border color
    0, // border radius
    1, // opacity
    0, // rotation
    'FFFFFF', // background
    'webp' // output format
  );
};

// Usage
<Image
  source={{ uri: getOptimizedImageUrl(menuItem.imageId, 400) }}
  style={{ width: 200, height: 200 }}
/>
```

2. **Virtualized Lists**
```typescript
// React Native FlatList with optimization
<FlatList
  data={menuItems}
  renderItem={({ item }) => <MenuItemCard item={item} />}
  keyExtractor={item => item.$id}
  
  // Performance props
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  
  // Memoize item
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

3. **Debounced Search**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    searchRestaurants(debouncedQuery);
  }
}, [debouncedQuery]);
```

4. **React Query (Data Caching)**
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['restaurants'],
  queryFn: getAllRestaurants,
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  cacheTime: 10 * 60 * 1000,
});
```

---

### 2.10. Monitoring & Observability

#### 📊 **Error Tracking**

```typescript
// 1. Sentry Integration (Mobile)
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  await createOrder(orderData);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { orderData },
  });
}

// 2. Firebase Crashlytics (Mobile)
import crashlytics from '@react-native-firebase/crashlytics';

crashlytics().log('User clicked checkout button');
crashlytics().setUserId(user.$id);

// 3. Performance Monitoring
import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('load_restaurants');
await getAllRestaurants();
await trace.stop();
```

---

## 3. User Journey Narratives

### 3.1. 📱 Customer Journey (Mobile App)

#### Scenario: "Đặt món Pizza và theo dõi giao hàng bằng drone"

**Steps:**

1. **Discovery Phase**
   - Mở app → Tự động login nếu đã có session
   - Trang chủ (Home): Xem danh sách nhà hàng gần đây
   - Filters: Lọc theo cuisine, rating, delivery time
   - Search: Tìm kiếm "Pizza" → Hiển thị restaurants + menu items

2. **Browse & Select**
   - Chọn "Pizza Hut Restaurant" → Xem chi tiết
   - Xem menu với categories (Appetizers, Mains, Drinks)
   - Vào "Margherita Pizza" → Xem ảnh, mô tả, giá, reviews
   - Chọn size (Small/Medium/Large), thêm toppings
   - Nhập note: "Extra cheese, no onions"
   - Nhấn "Add to Cart" → Badge cart tăng số lượng

3. **Cart & Checkout**
   - Vào Cart screen → Xem list items, adjust quantity
   - Thấy subtotal, delivery fee, discount (nếu có)
   - Nhấn "Checkout"
   - Chọn/xác nhận delivery address (autofill từ profile)
   - Chọn payment method: **VNPay** hoặc **COD**

4. **Payment**
   - Nếu VNPay: Redirect to VNPay gateway → Nhập thông tin thẻ
   - Webhook callback → Order status: `pending` → `confirmed`
   - Nếu COD: Order được tạo ngay với status `pending`

5. **Order Tracking**
   - Realtime updates:
     - `confirmed` → Restaurant nhận đơn
     - `preparing` → Đang nấu (hiển thị countdown timer)
     - `ready` → Sẵn sàng cho drone
     - `delivering` → **Drone đang bay** 🚁
   - Màn hình Map: Hiển thị vị trị drone real-time
   - Countdown: "Arriving in 45 seconds..."
   - Push notification: "Your order is 10 seconds away!"

6. **Delivery Complete**
   - Status: `delivered`
   - Proof of Delivery: Drone chụp ảnh hoặc customer scan QR
   - Popup: "Rate your order"
   - Nhập rating (1-5 stars), comment
   - Order được lưu vào Order History

**Expected Time**: ~5-8 phút (từ browse đến order confirmed)

---

### 3.2. 🏪 Restaurant Owner Journey (Web Portal)

#### Scenario: "Onboarding nhà hàng mới và quản lý đơn hàng đầu tiên"

**Steps:**

1. **Registration & Setup** (First-time users)
   - Truy cập `restaurant.foodfast.vn`
   - Click "Register" → Form nhập:
     - Restaurant name, description
     - Owner email, phone
     - Business license number
   - Click "Submit" → Account created với role `restaurant`
   - Status: `pending` (chờ admin approve)
   - Email notification: "Your application is under review"

2. **Setup Restaurant Profile** (After approval)
   - Login lần đầu → Redirect to Setup flow
   - **Step 1**: Basic Info
     - Upload logo, cover image
     - Nhập address, phone, email
   - **Step 2**: Location Picker
     - Interactive map (Google Maps / Mapbox)
     - Pin location → Auto-fill latitude, longitude
     - Set delivery radius (km)
   - **Step 3**: Operating Hours
     - Set open/close time for each day
     - Mark closed days
   - Click "Complete Setup" → Redirect to Dashboard

3. **Menu Management**
   - Sidebar → "Menu" → Thấy empty state
   - Click "Add Category" → Create "Breakfast", "Lunch"
   - Click "Add Item" → Form:
     - Name, description, price
     - Upload image (drag & drop)
     - Select category
     - Set stock, availability toggle
   - Click "Save" → Item appears in list
   - Bulk actions: Import CSV, Export CSV

4. **Receiving Orders** (Dashboard)
   - Dashboard trang chủ:
     - Today's revenue chart
     - Total orders: 12 (8 completed, 2 preparing, 2 pending)
     - Best sellers widget
   - **🔔 SOUND NOTIFICATION**: "New order received!"
   - Order card appears với:
     - Customer name, order items, total
     - Delivery address
     - Action buttons: **Accept** / **Reject**
   - Click "Accept" → Order status: `confirmed`
   - Timer starts: "Expected prep time: 15 mins"

5. **Order Processing**
   - Order status: `confirmed` → `preparing`
   - Kitchen prepares food
   - Click "Ready for Delivery" → Status: `ready`
   - System auto-assigns drone
   - Realtime: Watch drone status change to `busy`
   - Order status: `delivering` → `delivered`
   - Customer rates → Restaurant receives notification

6. **Analytics Review** (End of day)
   - Navigate to "Analytics" page
   - View charts:
     - Revenue by day/week/month
     - Top 10 best-selling items
     - Order completion rate
     - Average rating
   - Export CSV for accounting

**Expected Time**: 
- Setup: ~10 phút
- Daily operations: Continuous monitoring

---

### 3.3. 🎛️ Admin Journey (Admin Dashboard)

#### Scenario: "Duyệt nhà hàng mới và quản lý drone fleet"

**Steps:**

1. **Restaurant Approval**
   - Login to `admin.foodfast.vn`
   - Dashboard overview:
     - Total restaurants: 45 (5 pending approval)
     - Total orders today: 234
     - Active drones: 12/15
   - Navigate to "Restaurants" → Filter: `status=pending`
   - Click restaurant → Review details:
     - Business license document
     - Owner info
     - Location on map
   - Actions: **Approve** / **Reject** (with reason)
   - Click "Approve" → Status: `approved`
   - Email sent to restaurant owner: "Congratulations! You can now start accepting orders."

2. **System-wide Order Monitoring**
   - Navigate to "Orders" page
   - View all orders across restaurants
   - Filters: Status, Restaurant, Date range
   - Realtime updates: New orders appear automatically
   - Click order → View details:
     - Customer info
     - Restaurant info
     - Drone assignment
     - Timeline: ordered → confirmed → preparing → delivering → delivered
   - Manual intervention: Reassign drone, cancel order

3. **Drone Fleet Management**
   - Navigate to "Drones" page
   - View all drones với status:
     - `available` (idle, ready)
     - `busy` (delivering order)
     - `maintenance` (offline)
     - `offline` (not connected)
   - Click "Add Drone" → Form:
     - Drone ID, model
     - Max payload, battery capacity
     - Initial location
   - Click "Save" → Drone added to fleet

4. **Drone Telemetry Dashboard**
   - Click drone → View realtime data:
     - Current location on map
     - Battery level: 87%
     - Altitude: 50m
     - Speed: 12 m/s
     - Assigned order: #ORD-1234
   - **Simulation Control** (60-second delivery):
     - Click "Start Simulation"
     - Countdown: 60 → 0 seconds
     - Drone icon moves on map (interpolated path)
     - Status updates: `delivering` → `delivered`
     - Log: "Order #ORD-1234 delivered successfully"

5. **Analytics & Reports**
   - Navigate to "Analytics" page
   - KPI Cards:
     - GMV (Gross Merchandise Value): ₫123,456,789
     - Total orders: 1,234
     - Conversion rate: 78%
     - Average order value: ₫99,999
   - Charts:
     - Revenue trend (line chart)
     - Orders by status (pie chart)
     - Top restaurants (bar chart)
     - Drone utilization (heatmap)
   - Export to CSV/PDF for reports

**Expected Time**: 
- Approval: ~5 phút/nhà hàng
- Monitoring: Continuous real-time

---

## 4. Goals & Success Metrics

### 4.1. Business Goals

| Goal | Target | Metric |
|------|--------|--------|
| **User Acquisition** | 10,000 active customers in 6 months | Monthly Active Users (MAU) |
| **Restaurant Onboarding** | 50 restaurants in 3 months | Restaurant sign-ups |
| **Order Volume** | 1,000 orders/day | Daily order count |
| **Revenue** | ₫100M GMV/month | Gross Merchandise Value |
| **Customer Satisfaction** | Average rating ≥ 4.5/5 | Review ratings |
| **Delivery Success** | ≥ 95% on-time delivery | Orders delivered within ETA |

### 4.2. Technical Goals

| Goal | Target | Measurement |
|------|--------|-------------|
| **Performance** | API response time < 500ms (p95) | Appwrite metrics |
| **Uptime** | ≥ 99.5% system availability | Monitoring logs |
| **Real-time Latency** | Drone tracking delay < 2 seconds | WebSocket metrics |
| **Payment Success** | ≥ 97% successful transactions | VNPay webhook logs |
| **Mobile Crash Rate** | < 1% crash-free sessions | Firebase Crashlytics |
| **Onboarding Time** | Restaurant setup < 10 minutes | User flow analytics |

### 4.3. User Experience Goals

**Customers:**
- Đặt hàng hoàn tất trong < 3 phút
- Hiển thị ETA chính xác (±30 giây)
- Push notification kịp thời (< 5 giây delay)

**Restaurant Owners:**
- Nhận đơn hàng mới < 2 giây
- CRUD menu item < 1 phút
- Dashboard load < 2 giây

**Admins:**
- Duyệt nhà hàng < 5 phút
- Monitor toàn bộ đơn hàng realtime
- Export reports < 10 giây

---

## 5. Features & Requirements

### 5.1. 📱 Customer Mobile App (React Native + Expo)

#### 5.1.1. Authentication & Onboarding ✅ **COMPLETED**

**Features:**
- [x] Sign up với email/password
- [x] Sign in với persistent session
- [x] Profile management (name, phone, avatar)
- [x] Edit profile với image upload
- [x] Logout functionality

**Screens:**
- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`
- `app/(tabs)/profile.tsx`
- `app/edit-profile.tsx`

**State Management:**
- Zustand store: `store/authStore.ts`
- Auto-restore session on app launch

---

#### 5.1.2. Restaurant Discovery & Search ✅ **COMPLETED**

**Features:**
- [x] Browse restaurants với grid/list view
- [x] Search restaurants by name
- [x] Filter by cuisine, rating, delivery time
- [x] View restaurant details (menu, reviews, hours)
- [x] Calculate distance from user location

**Screens:**
- `app/(tabs)/index.tsx` (Home)
- `app/(tabs)/restaurants.tsx`
- `app/restaurant-detail.tsx`

**APIs:**
```typescript
// lib/appwrite.ts
getAllRestaurants(filters?: RestaurantFilters)
getRestaurantById(id: string)
searchRestaurants(query: string)
```

---

#### 5.1.3. Menu Browsing & Ordering ✅ **COMPLETED**

**Features:**
- [x] View menu items by category
- [x] Menu item details (image, description, price)
- [x] Customizations (size, toppings)
- [x] Add to cart với quantity
- [x] Add notes per item
- [x] Cart badge với item count

**Screens:**
- `app/menu-detail.tsx`
- `app/cart.tsx`

**State Management:**
- Zustand store: `store/cartStore.ts`
- Cart persistence trong AsyncStorage

```typescript
interface CartStore {
  items: CartItemType[];
  addItem(item: CartItemType): void;
  removeItem(itemId: string): void;
  updateQuantity(itemId: string, quantity: number): void;
  clearCart(): void;
  getTotal(): number;
}
```

---

#### 5.1.4. Checkout & Payment 🔨 **IN PROGRESS**

**Features:**
- [x] Review cart items và subtotal
- [x] Enter/select delivery address
- [x] Choose payment method (VNPay / COD)
- [ ] Apply discount/promo codes
- [x] Calculate delivery fee
- [x] Show order summary

**Screens:**
- `app/checkout.tsx`
- `app/payment-selection.tsx`
- `app/vnpay-payment.tsx`
- `app/payment-result.tsx`

**Payment Flow:**
```typescript
// VNPay Integration
1. createVNPayPayment({ orderId, amount, returnUrl })
2. Open VNPay gateway in WebView
3. User completes payment
4. Webhook callback updates order status
5. Redirect to payment-result screen
6. Show success/failure message
```

**APIs:**
```typescript
createOrder(orderData: CreateOrderData): Promise<Order>
createVNPayPayment(paymentData): Promise<PaymentResult>
createCODPayment(orderId: string): Promise<Order>
verifyPayment(transactionId: string): Promise<boolean>
```

---

#### 5.1.5. Order Tracking ⏳ **PLANNED**

**Features:**
- [ ] Real-time order status updates
- [ ] Display drone location on map
- [ ] Show ETA countdown (60-second simulation)
- [ ] Push notifications at each status change
- [ ] Proof of Delivery (photo/QR scan)

**Screens:**
- `app/order-tracking.tsx` (NEW)

**Realtime Updates:**
```typescript
// Subscribe to order updates
subscribeToOrder(orderId: string, callback: (order: Order) => void)

// Subscribe to drone location
subscribeToDrone(droneId: string, callback: (location: Coordinates) => void)
```

**Status Flow:**
```
pending → confirmed → preparing → ready → delivering → delivered
```

---

#### 5.1.6. Order History & Reviews ✅ **COMPLETED**

**Features:**
- [x] View past orders với status
- [x] Filter by status (completed, cancelled)
- [x] View order details
- [ ] Reorder với same items
- [ ] Rate restaurant (1-5 stars)
- [ ] Write review comments

**Screens:**
- `app/order-history.tsx`
- `app/order-detail.tsx`

**APIs:**
```typescript
getUserOrders(userId: string): Promise<Order[]>
getOrderById(orderId: string): Promise<Order>
createReview(reviewData: CreateReviewData): Promise<Review>
```

---

### 5.2. 🏪 Restaurant Portal (Next.js 14)

#### 5.2.1. Authentication & Onboarding ✅ **COMPLETED**

**Features:**
- [x] Restaurant-only registration
- [x] Role-based access control (`role=restaurant`)
- [x] Login với email/password
- [x] Persistent auth state
- [x] Protected routes middleware

**Pages:**
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/SetupRestaurantPage.tsx`

**Auth Flow:**
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  login(email, password): Promise<void>;
  logout(): Promise<void>;
  checkAuth(): Promise<void>;
}
```

---

#### 5.2.2. Restaurant Setup (2-Step Onboarding) ✅ **COMPLETED**

**Features:**
- [x] Step 1: Basic info (name, description, contact)
- [x] Step 2: Location picker (map with pin)
- [x] Auto-fill latitude, longitude
- [x] Upload logo, cover image
- [x] Set delivery radius
- [x] Status: `pending` → admin approval

**Pages:**
- `src/pages/SetupRestaurantPage.tsx`

**Map Integration:**
```typescript
// Use Google Maps JavaScript API or Mapbox
<MapPicker
  onLocationSelect={(lat, lng, address) => {
    setFormData({ ...formData, latitude: lat, longitude: lng, address });
  }}
/>
```

---

#### 5.2.3. Menu Management (CRUD) ✅ **COMPLETED**

**Features:**
- [x] List all menu items với grid view
- [x] Create new menu item
- [x] Edit existing item
- [x] Delete item (soft delete)
- [x] Upload item image (drag & drop)
- [x] Set price, stock, availability
- [x] Category management
- [x] Bulk import/export CSV

**Pages:**
- `src/pages/MenuPage.tsx`
- `src/pages/AddMenuItemPage.tsx` (modal)

**APIs:**
```typescript
// lib/api.ts (Restaurant Portal)
getRestaurantMenuItems(restaurantId: string): Promise<MenuItem[]>
createMenuItem(data: CreateMenuItemData): Promise<MenuItem>
updateMenuItem(id: string, data: UpdateMenuItemData): Promise<MenuItem>
deleteMenuItem(id: string): Promise<void>
uploadMenuItemImage(file: File): Promise<string> // Returns image URL
```

**Form Schema:**
```typescript
interface MenuItemForm {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageFile?: File;
  isAvailable: boolean;
  stock: number;
  tags?: string[]; // e.g., "spicy", "vegan"
}
```

---

#### 5.2.4. Order Dashboard (Real-time) 🔨 **IN PROGRESS**

**Features:**
- [x] View incoming orders realtime
- [x] Sound notification khi có đơn mới
- [x] Order cards với customer info, items, total
- [ ] Action buttons: Accept / Reject
- [ ] Update order status: preparing → ready
- [ ] Timer: Expected prep time countdown
- [ ] Filter orders by status
- [ ] View order details modal

**Pages:**
- `src/pages/OrdersPage.tsx`
- `src/pages/DashboardPage.tsx`

**Realtime Subscription:**
```typescript
// Subscribe to new orders for this restaurant
subscribeToRestaurantOrders(restaurantId: string, callback: (order: Order) => void)

// Play sound on new order
useEffect(() => {
  const audio = new Audio('/sounds/notification.mp3');
  if (newOrder) audio.play();
}, [newOrder]);
```

**APIs:**
```typescript
getRestaurantOrders(restaurantId: string, status?: OrderStatus): Promise<Order[]>
updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
acceptOrder(orderId: string): Promise<Order>
rejectOrder(orderId: string, reason: string): Promise<Order>
```

---

#### 5.2.5. Analytics Dashboard ⏳ **PLANNED**

**Features:**
- [ ] Today's revenue chart (line chart)
- [ ] Total orders by status (pie chart)
- [ ] Top 10 best-selling items (bar chart)
- [ ] Average order value (KPI card)
- [ ] Customer satisfaction rating
- [ ] Order completion rate
- [ ] Export reports (CSV/PDF)

**Pages:**
- `src/pages/AnalyticsPage.tsx`

**Charts:**
```typescript
// Use recharts library
import { LineChart, BarChart, PieChart } from 'recharts';

interface AnalyticsData {
  revenue: { date: string; amount: number }[];
  topItems: { name: string; sales: number }[];
  ordersByStatus: { status: string; count: number }[];
}
```

**APIs:**
```typescript
getRestaurantAnalytics(restaurantId: string, dateRange: DateRange): Promise<AnalyticsData>
getRevenueChart(restaurantId: string, period: 'day' | 'week' | 'month'): Promise<RevenueData[]>
getTopSellingItems(restaurantId: string, limit: number): Promise<MenuItem[]>
```

---

#### 5.2.6. Settings & Profile ⏳ **PLANNED**

**Features:**
- [ ] Update restaurant info (name, description, phone)
- [ ] Change logo, cover image
- [ ] Update operating hours
- [ ] Set delivery radius
- [ ] Toggle availability (open/closed)
- [ ] Bank account info (for payouts)
- [ ] Change password

**Pages:**
- `src/pages/SettingsPage.tsx`

---

### 5.3. 🎛️ Admin Dashboard (React + Vite)

#### 5.3.1. Authentication ✅ **COMPLETED**

**Features:**
- [x] Admin-only login (`role=admin`)
- [x] Session management
- [x] Protected routes
- [x] Logout functionality

**Pages:**
- `src/pages/LoginPage.tsx`

**Auth Store:**
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null; // Must have role='admin'
  isAuthenticated: boolean;
  signIn(email, password): Promise<void>;
  signOut(): Promise<void>;
  checkAuth(): Promise<void>;
}
```

---

#### 5.3.2. Dashboard Overview ✅ **COMPLETED**

**Features:**
- [x] KPI cards (Total Orders, Revenue, Customers)
- [x] Recent orders list
- [x] Charts: Revenue trend, Orders by status
- [x] Quick actions

**Pages:**
- `src/pages/DashboardPage.tsx`

---

#### 5.3.3. Restaurant Management ⏳ **PLANNED**

**Features:**
- [ ] List all restaurants với status filter
- [ ] Approve/reject pending restaurants
- [ ] View restaurant details (owner, menu, analytics)
- [ ] Suspend/activate restaurant
- [ ] Manual verification notes
- [ ] Send notification to restaurant

**Pages:**
- `src/pages/RestaurantsPage.tsx` (NEW)

**APIs:**
```typescript
getAllRestaurants(filters?: { status?: RestaurantStatus }): Promise<Restaurant[]>
approveRestaurant(id: string, note?: string): Promise<Restaurant>
rejectRestaurant(id: string, reason: string): Promise<Restaurant>
suspendRestaurant(id: string, reason: string): Promise<Restaurant>
activateRestaurant(id: string): Promise<Restaurant>
```

**Approval Workflow:**
```
1. Restaurant registers → status: 'pending'
2. Admin reviews business license, info
3. Admin clicks "Approve" → status: 'approved'
4. Email sent to restaurant owner
5. Restaurant can now login and accept orders
```

---

#### 5.3.4. Order Monitoring (System-wide) ✅ **COMPLETED**

**Features:**
- [x] View ALL orders across all restaurants
- [x] Filter by status, restaurant, date
- [x] Search by order ID, customer name
- [x] View order timeline
- [ ] Manual status override
- [ ] Reassign drone
- [ ] Cancel order với refund

**Pages:**
- `src/pages/OrdersPage.tsx`

**APIs:**
```typescript
getAllOrders(limit?: number): Promise<Order[]>
getOrderById(orderId: string): Promise<Order>
updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
cancelOrder(orderId: string, reason: string, refund: boolean): Promise<Order>
```

---

#### 5.3.5. Drone Fleet Management 🔨 **IN PROGRESS**

**Features:**
- [x] List all drones với status
- [x] Add new drone
- [ ] Edit drone info (model, payload, battery)
- [ ] Set drone status (available, maintenance, offline)
- [ ] View drone telemetry (realtime)
- [ ] Manual drone assignment to order
- [ ] Maintenance schedule

**Pages:**
- `src/pages/DronesPage.tsx`

**Drone Status:**
```typescript
type DroneStatus = 'available' | 'busy' | 'maintenance' | 'offline';

interface Drone {
  $id: string;
  droneCode: string;
  model: string;
  status: DroneStatus;
  currentLocation: { lat: number; lng: number };
  batteryLevel: number; // 0-100
  maxPayload: number; // kg
  assignedOrderId?: string;
  lastMaintenanceAt?: string;
}
```

**APIs:**
```typescript
getAllDrones(): Promise<Drone[]>
createDrone(data: CreateDroneData): Promise<Drone>
updateDrone(id: string, data: UpdateDroneData): Promise<Drone>
assignDroneToOrder(droneId: string, orderId: string): Promise<Drone>
getDroneTelemetry(droneId: string): Promise<DroneTelemetry>
```

---

#### 5.3.6. Drone Simulation Control ⏳ **PLANNED**

**Features:**
- [ ] Start/stop simulation for order
- [ ] Set simulation duration (default: 60 seconds)
- [ ] View drone path on map
- [ ] Real-time progress bar
- [ ] Auto-update order status when delivered
- [ ] Log delivery events

**Pages:**
- `src/pages/DroneSimulationPage.tsx` (NEW)

**Simulation Engine:**
```typescript
interface SimulationConfig {
  orderId: string;
  droneId: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  duration: number; // seconds (default: 60)
}

// Interpolate drone position every second
startSimulation(config: SimulationConfig) {
  const path = calculatePath(config.startLocation, config.endLocation);
  const steps = config.duration;
  
  for (let i = 0; i <= steps; i++) {
    setTimeout(() => {
      const currentPosition = interpolate(path, i / steps);
      updateDroneLocation(config.droneId, currentPosition);
      
      if (i === steps) {
        completeDelivery(config.orderId);
      }
    }, i * 1000);
  }
}
```

---

#### 5.3.7. Analytics & Reports ⏳ **PLANNED**

**Features:**
- [ ] GMV (Gross Merchandise Value) chart
- [ ] Total orders trend
- [ ] Conversion rate
- [ ] Top performing restaurants
- [ ] Drone utilization rate
- [ ] Average delivery time
- [ ] Customer retention
- [ ] Export reports (CSV/PDF)

**Pages:**
- `src/pages/AnalyticsPage.tsx`

**KPIs:**
```typescript
interface SystemAnalytics {
  gmv: number; // Total revenue
  totalOrders: number;
  conversionRate: number; // %
  avgOrderValue: number;
  totalCustomers: number;
  activeRestaurants: number;
  droneUtilization: number; // %
  avgDeliveryTime: number; // seconds
}
```

---

#### 5.3.8. User Management ✅ **COMPLETED**

**Features:**
- [x] List all users (customers, restaurants, admins)
- [x] Filter by role
- [x] Search by name, email
- [ ] View user details (orders, reviews)
- [ ] Ban/unban user
- [ ] Reset password
- [ ] Change user role

**Pages:**
- `src/pages/CustomersPage.tsx`

**APIs:**
```typescript
getAllUsers(limit?: number): Promise<User[]>
updateUserRole(userId: string, role: UserRole): Promise<User>
banUser(userId: string, reason: string): Promise<User>
unbanUser(userId: string): Promise<User>
resetUserPassword(userId: string): Promise<void>
```

---

### 5.4. 🚁 Drone Delivery System

#### 5.4.1. 60-Second Simulation ⏳ **PLANNED**

**Features:**
- [ ] Configurable delivery duration (default: 60s)
- [ ] Real-time WebSocket updates
- [ ] Interpolated path calculation
- [ ] Map visualization (restaurant → customer)
- [ ] Progress indicators (percentage, ETA)
- [ ] Auto-complete order on arrival

**Technical Implementation:**
```typescript
// Backend Cloud Function
export const simulateDroneDelivery = async (orderId: string) => {
  const order = await getOrder(orderId);
  const restaurant = await getRestaurant(order.restaurantId);
  const customer = await getUser(order.customerId);
  
  const startLocation = { lat: restaurant.latitude, lng: restaurant.longitude };
  const endLocation = { lat: customer.latitude, lng: customer.longitude };
  
  const duration = 60; // seconds
  const interval = 1000; // ms
  
  for (let step = 0; step <= duration; step++) {
    const progress = step / duration;
    const currentLocation = interpolate(startLocation, endLocation, progress);
    
    // Update drone location in realtime
    await updateDroneLocation(order.droneId, currentLocation);
    
    // Broadcast to clients via WebSocket
    broadcastDroneUpdate(order.droneId, { location: currentLocation, progress });
    
    await delay(interval);
  }
  
  // Mark order as delivered
  await updateOrderStatus(orderId, 'delivered');
  
  // Send push notification
  await sendNotification(order.customerId, 'Your order has arrived!');
};
```

---

#### 5.4.2. Telemetry Dashboard ⏳ **PLANNED**

**Features:**
- [ ] Real-time drone location
- [ ] Battery level indicator
- [ ] Altitude, speed, heading
- [ ] Assigned order info
- [ ] Flight path history
- [ ] Event logs (takeoff, waypoints, landing)

**Data Schema:**
```typescript
interface DroneTelemetry {
  droneId: string;
  timestamp: Date;
  location: { lat: number; lng: number; altitude: number };
  speed: number; // m/s
  heading: number; // degrees
  batteryLevel: number; // %
  status: 'idle' | 'flying' | 'landing' | 'returning';
  assignedOrderId?: string;
}
```

---

## 6. Non-Functional Requirements

### 6.1. Performance

| Requirement | Target | Measurement |
|------------|--------|-------------|
| **API Response Time** | < 500ms (p95) | Appwrite metrics |
| **Page Load Time** | < 2 seconds | Lighthouse score |
| **Real-time Latency** | < 2 seconds | WebSocket ping |
| **Image Load Time** | < 1 second | CDN performance |
| **Search Results** | < 500ms | Database query time |

### 6.2. Scalability

- **Horizontal Scaling**: Appwrite Cloud auto-scales
- **Database**: Support 100k+ documents per collection
- **Concurrent Users**: 1,000+ simultaneous users
- **Storage**: Unlimited via Appwrite Storage + CDN

### 6.3. Security

- [x] HTTPS only (all environments)
- [x] Role-based access control (RBAC)
- [x] Input validation & sanitization
- [x] Secure password hashing (Appwrite Auth)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting (API calls)
- [ ] PII encryption (credit cards via VNPay)

### 6.4. Reliability

- **Uptime**: ≥ 99.5%
- **Error Handling**: Graceful fallbacks
- **Offline Support**: 
  - Mobile: Cache menu, cart data
  - Sync when network restored
- **Backup**: Appwrite automatic daily backups

### 6.5. Monitoring & Logging

- **Error Tracking**: 
  - Mobile: Firebase Crashlytics
  - Web: Sentry
- **Analytics**: 
  - Mobile: Firebase Analytics
  - Web: Google Analytics 4
- **Logs**: 
  - Backend: Appwrite Console Logs
  - Structured logging với timestamps
- **Alerts**: 
  - Payment failures
  - API downtime
  - High error rates

### 6.6. Accessibility

- **WCAG 2.1 Level AA compliance** (web portals)
- **Semantic HTML** (proper heading hierarchy)
- **Keyboard navigation** (all actions accessible)
- **Screen reader support** (ARIA labels)
- **Color contrast** (minimum 4.5:1 ratio)

### 6.7. Browser & Device Support

**Mobile App:**
- iOS 13+ (iPhone 6s and newer)
- Android 8.0+ (API level 26+)

**Web Portals:**
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

---

## 7. Technical Constraints

### 7.1. Backend Limitations

- **Appwrite Cloud**:
  - Database: 10GB storage (free tier)
  - Storage: 2GB (free tier)
  - Realtime connections: 500 concurrent
  - Functions: 150k executions/month
  - **Solution**: Upgrade to Pro plan as needed

### 7.2. External Service Dependencies

- **VNPay Gateway**:
  - Sandbox for testing
  - Production requires business registration
  - Transaction fee: ~1.5%
  
- **Maps API**:
  - Google Maps: $200 free credit/month
  - Mapbox: 100k map loads/month free
  - **Solution**: Use Mapbox for cost efficiency

- **Firebase Cloud Messaging**:
  - Free unlimited notifications
  - Requires Firebase project setup

### 7.3. Development Environment

**Required:**
- Node.js 18+
- npm 9+
- Expo CLI (for mobile)
- VS Code (recommended IDE)

**Optional:**
- Xcode (for iOS development)
- Android Studio (for Android development)

---

## 8. Development Phases & Priorities

### Phase 0: Foundation ✅ **COMPLETED** (Week 1)
- [x] Database schema design (16 collections)
- [x] Appwrite setup & configuration
- [x] Authentication implementation (all roles)
- [x] Project structure & tooling

### Phase 1: Restaurant Portal MVP ✅ **COMPLETED** (Week 2-3)
- [x] Restaurant authentication
- [x] Onboarding flow (2-step setup)
- [x] Menu management (CRUD)
- [x] Basic order dashboard

### Phase 2: Customer Mobile MVP 🔨 **IN PROGRESS** (Week 4-6)
- [x] Customer authentication
- [x] Restaurant discovery & search
- [x] Menu browsing & cart
- [x] Basic checkout flow
- [ ] **VNPay payment integration** (current focus)
- [ ] Order tracking (realtime)
- [ ] Push notifications

### Phase 3: Admin Dashboard 🔨 **IN PROGRESS** (Week 7-9)
- [x] Admin authentication
- [x] Dashboard overview
- [x] Order monitoring
- [x] Customer management
- [x] Basic drone management
- [ ] **Restaurant approval workflow** (current focus)
- [ ] **Drone simulation engine** (current focus)

### Phase 4: Advanced Features ⏳ **PLANNED** (Week 10-12)
- [ ] Review & rating system
- [ ] Analytics dashboards (all platforms)
- [ ] Promotion codes & discounts
- [ ] Restaurant insights
- [ ] System-wide reports

### Phase 5: Optimization & Testing ⏳ **PLANNED** (Week 13-14)
- [ ] Performance optimization
- [ ] Security audit
- [ ] E2E testing (Detox for mobile, Playwright for web)
- [ ] Load testing
- [ ] Accessibility audit

### Phase 6: Production Launch ⏳ **PLANNED** (Week 15-16)
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation finalization
- [ ] Training materials
- [ ] Post-launch support

---

## 9. API Reference

### 9.1. Authentication

```typescript
// Mobile & Web (All platforms)
signUp(email: string, password: string, name: string): Promise<User>
signIn(email: string, password: string): Promise<Session>
signOut(): Promise<void>
getCurrentUser(): Promise<User | null>
updateProfile(userId: string, data: ProfileUpdateData): Promise<User>
```

### 9.2. Restaurants

```typescript
// Public
getAllRestaurants(filters?: RestaurantFilters): Promise<Restaurant[]>
getRestaurantById(id: string): Promise<Restaurant>
searchRestaurants(query: string): Promise<Restaurant[]>

// Restaurant Portal
createRestaurant(data: CreateRestaurantData): Promise<Restaurant>
updateRestaurant(id: string, data: UpdateRestaurantData): Promise<Restaurant>

// Admin
approveRestaurant(id: string): Promise<Restaurant>
rejectRestaurant(id: string, reason: string): Promise<Restaurant>
```

### 9.3. Menu Items

```typescript
// Public
getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]>
getMenuItemById(id: string): Promise<MenuItem>

// Restaurant Portal
createMenuItem(data: CreateMenuItemData): Promise<MenuItem>
updateMenuItem(id: string, data: UpdateMenuItemData): Promise<MenuItem>
deleteMenuItem(id: string): Promise<void>
uploadMenuItemImage(file: File): Promise<string>
```

### 9.4. Orders

```typescript
// Customer
createOrder(orderData: CreateOrderData): Promise<Order>
getUserOrders(userId: string): Promise<Order[]>
getOrderById(orderId: string): Promise<Order>

// Restaurant Portal
getRestaurantOrders(restaurantId: string, status?: OrderStatus): Promise<Order[]>
updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
acceptOrder(orderId: string): Promise<Order>
rejectOrder(orderId: string, reason: string): Promise<Order>

// Admin
getAllOrders(limit?: number): Promise<Order[]>
cancelOrder(orderId: string, reason: string): Promise<Order>
```

### 9.5. Payments

```typescript
// Customer
createVNPayPayment(paymentData: VNPayPaymentData): Promise<PaymentResult>
createCODPayment(orderId: string): Promise<Order>
verifyPayment(transactionId: string): Promise<boolean>

// Webhook (Backend)
handleVNPayWebhook(webhookData: VNPayWebhook): Promise<void>
```

### 9.6. Drones

```typescript
// Admin
getAllDrones(): Promise<Drone[]>
createDrone(data: CreateDroneData): Promise<Drone>
updateDrone(id: string, data: UpdateDroneData): Promise<Drone>
assignDroneToOrder(droneId: string, orderId: string): Promise<Drone>
getDroneTelemetry(droneId: string): Promise<DroneTelemetry>
startSimulation(orderId: string, duration: number): Promise<void>
```

### 9.7. Realtime Subscriptions

```typescript
// WebSocket / Firestore Listeners
subscribeToOrder(orderId: string, callback: (order: Order) => void): Unsubscribe
subscribeToDrone(droneId: string, callback: (location: Coordinates) => void): Unsubscribe
subscribeToRestaurantOrders(restaurantId: string, callback: (order: Order) => void): Unsubscribe
```

---

## 10. UI/UX Guidelines

### 10.1. Design System

**Colors:**
- Primary: `#FF6B6B` (Coral Red)
- Secondary: `#4ECDC4` (Turquoise)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)
- Neutral: Gray scale (50-900)

**Typography:**
- Font: Inter (web), System fonts (mobile)
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Small: Regular, 12px

**Spacing:**
- Base unit: 4px
- Components: 8px, 16px, 24px, 32px

**Components:**
- Buttons: Rounded corners (8px), shadow on hover
- Cards: Elevated, 16px padding, 12px border radius
- Inputs: Border, focus ring, error states

### 10.2. Responsive Design

**Mobile (< 768px):**
- Single column layout
- Bottom navigation bar
- Full-width cards
- Collapsible filters

**Tablet (768px - 1024px):**
- Two-column grid
- Sidebar navigation
- Floating action buttons

**Desktop (> 1024px):**
- Multi-column grid
- Persistent sidebar
- Hover states
- Keyboard shortcuts

---

## 11. Testing Strategy

### 11.1. Unit Testing

**Tools:**
- Jest (JavaScript testing)
- React Testing Library (component testing)

**Coverage Target:** 70%

**Examples:**
```typescript
// Test cart store
test('addItem increases cart count', () => {
  const store = useCartStore.getState();
  store.addItem({ id: '1', name: 'Pizza', price: 100, quantity: 1 });
  expect(store.items.length).toBe(1);
  expect(store.getTotal()).toBe(100);
});
```

### 11.2. Integration Testing

**Tools:**
- Playwright (web)
- Detox (mobile)

**Scenarios:**
- Login flow
- Order creation end-to-end
- Payment completion
- Realtime updates

### 11.3. E2E Testing

**Critical User Journeys:**
1. Customer: Sign up → Browse → Order → Track → Review
2. Restaurant: Setup → Add menu → Receive order → Update status
3. Admin: Approve restaurant → Monitor orders → Manage drones

---

## 12. Deployment & DevOps

### 12.1. Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| **Development** | Local development | localhost |
| **Staging** | Pre-production testing | staging.foodfast.vn |
| **Production** | Live users | foodfast.vn |

### 12.2. CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Lint code
    - Run tests
    - Build apps
    - Deploy to Vercel (web)
    - Build mobile with EAS
```

### 12.3. Monitoring

- **Uptime**: Uptime Robot (1-minute checks)
- **Errors**: Sentry (error tracking)
- **Performance**: Lighthouse CI (web vitals)
- **Analytics**: Google Analytics 4

---

## 13. Documentation Deliverables

### 13.1. Technical Docs

- [x] Database schema (16 collections)
- [x] API reference
- [x] Component library (Storybook)
- [ ] Deployment guide
- [ ] Troubleshooting playbook

### 13.2. User Guides

- [ ] Customer app tutorial
- [ ] Restaurant portal guide
- [ ] Admin dashboard manual

### 13.3. Developer Onboarding

- [x] README.md (getting started)
- [x] CONTRIBUTING.md (code standards)
- [ ] Architecture decision records (ADRs)

---

## 14. Success Criteria

### 14.1. Launch Checklist

**Technical:**
- [ ] All critical features completed
- [ ] Test coverage ≥ 70%
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Mobile apps published (App Store, Play Store)

**Business:**
- [ ] 10 restaurants onboarded
- [ ] 100 test orders completed
- [ ] Payment gateway approved
- [ ] Terms of service finalized
- [ ] Customer support ready

**Operational:**
- [ ] Monitoring dashboards live
- [ ] On-call rotation established
- [ ] Incident response plan documented
- [ ] Backup & recovery tested

---

## 15. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| VNPay approval delay | High | Medium | Use COD fallback during testing |
| Appwrite limits exceeded | High | Low | Monitor usage, upgrade plan early |
| Drone simulation latency | Medium | Medium | Optimize WebSocket, use Redis caching |
| Restaurant onboarding friction | Medium | High | Simplify form, add tooltips, video guide |
| Mobile app crashes | High | Low | Extensive testing, Crashlytics monitoring |

---

## 16. Future Enhancements

### Post-Launch (Month 3-6)

- [ ] Loyalty program (points, rewards)
- [ ] Subscription plans (free delivery)
- [ ] Multi-city support
- [ ] Advanced route optimization
- [ ] CRM integration (email campaigns)
- [ ] Accounting integration (QuickBooks)
- [ ] AI chatbot support
- [ ] Voice ordering
- [ ] Scheduled orders
- [ ] Group orders

---

## 17. Contact & Support

**Project Team:**
- **Product Owner**: [TBD]
- **Tech Lead**: [TBD]
- **Frontend Lead**: [Your Name]
- **Backend Lead**: [TBD]
- **QA Lead**: [TBD]

**Resources:**
- GitHub Repo: `phatle224/sgu_cnpm_foodfast`
- Documentation: `/docs`
- Figma Designs: [TBD]
- Slack Channel: #foodfast-dev

---

**Last Updated**: October 28, 2025  
**Document Version**: 1.0  
**Status**: ✅ Active Development

---

_This PRD is a living document and will be updated as requirements evolve._
