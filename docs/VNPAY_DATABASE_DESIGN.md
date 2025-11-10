# VNPay Payment Integration - Database Design & Implementation Plan

## 📋 Tổng Quan

Document này thiết kế **database schema** và **implementation plan** đầy đủ cho hệ thống thanh toán VNPay trong FoodFast project, dựa trên cấu trúc database hiện tại và best practices.

---

## 🗄️ **DATABASE HIỆN TẠI**

### **Appwrite Configuration:**
```properties
Endpoint: https://nyc.cloud.appwrite.io/v1
Project ID: 68c9791a002b85f096b4
Database ID: 68da5e73002cb68e70af
```

### **Collections đã có:**
```
✅ user                    - User accounts
✅ orders                  - Order information
✅ order_items             - Order line items
✅ menu                    - Menu items
✅ category                - Food categories
✅ restaurants             - Restaurant info
✅ reviews                 - Customer reviews
✅ drones                  - Drone fleet
✅ drone_events            - Drone tracking events
✅ notifications           - Push notifications
❌ payments                - THIẾU - CẦN TẠO
```

---

## 🎯 **THIẾT KẾ PAYMENTS COLLECTION**

### **Collection Information:**
```yaml
Collection Name: Payments
Collection ID: payments
Database ID: 68da5e73002cb68e70af (foodfast-db)
```

### **Schema Design:**

| Attribute | Type | Size/Options | Required | Default | Array | Unique | Description |
|-----------|------|--------------|----------|---------|-------|--------|-------------|
| **orderId** | Relationship | → orders | ✅ Yes | - | ❌ No | ❌ No | Liên kết đến order (One-to-One) |
| **userId** | Relationship | → user | ✅ Yes | - | ❌ No | ❌ No | User thực hiện thanh toán (Many-to-One) |
| **vnp_TxnRef** | String | 128 chars | ✅ Yes | - | ❌ No | ✅ Yes | Transaction reference từ VNPay (unique) |
| **provider** | Enum | ['vnpay','cod','momo'] | ✅ Yes | 'vnpay' | ❌ No | ❌ No | Payment provider |
| **status** | Enum | ['pending','processing','success','failed','refunded'] | ✅ Yes | 'pending' | ❌ No | ❌ No | Payment status |
| **amount** | Integer | - | ✅ Yes | - | ❌ No | ❌ No | Số tiền (VND, không nhân 100) |
| **vnp_Amount** | Integer | - | ❌ No | - | ❌ No | ❌ No | Số tiền gửi VNPay (amount * 100) |
| **vnp_BankCode** | String | 20 chars | ❌ No | - | ❌ No | ❌ No | Mã ngân hàng (NCB, Vietcombank, etc.) |
| **vnp_BankTranNo** | String | 128 chars | ❌ No | - | ❌ No | ❌ No | Mã giao dịch ngân hàng |
| **vnp_CardType** | String | 20 chars | ❌ No | - | ❌ No | ❌ No | Loại thẻ (ATM, Credit, etc.) |
| **vnp_ResponseCode** | String | 5 chars | ❌ No | - | ❌ No | ❌ No | Response code từ VNPay (00=success) |
| **vnp_TransactionNo** | String | 128 chars | ❌ No | - | ❌ No | ❌ No | Transaction number từ VNPay |
| **vnp_TransactionStatus** | String | 5 chars | ❌ No | - | ❌ No | ❌ No | Transaction status từ VNPay |
| **vnp_PayDate** | String | 14 chars | ❌ No | - | ❌ No | ❌ No | Thời gian thanh toán (YYYYMMDDHHmmss) |
| **vnp_SecureHash** | String | 256 chars | ❌ No | - | ❌ No | ❌ No | Hash signature từ VNPay (để verify) |
| **errorMessage** | String | 500 chars | ❌ No | - | ❌ No | ❌ No | Error message nếu failed |
| **ipAddress** | String | 50 chars | ❌ No | '127.0.0.1' | ❌ No | ❌ No | IP address của user |
| **paymentUrl** | String | 1000 chars | ❌ No | - | ❌ No | ❌ No | VNPay payment URL (for logging) |
| **metadata** | String (JSON) | 2000 chars | ❌ No | '{}' | ❌ No | ❌ No | Extra data (JSON string) |
| **createdAt** | DateTime | - | ✅ Yes | NOW | ❌ No | ❌ No | Thời gian tạo payment |
| **updatedAt** | DateTime | - | ✅ Yes | NOW | ❌ No | ❌ No | Thời gian update cuối |
| **expiresAt** | DateTime | - | ❌ No | - | ❌ No | ❌ No | Thời gian hết hạn payment URL (15 phút) |

### **Relationships:**

#### **1. payments → orders (One-to-One)**
```yaml
Relationship Type: One to One
Side: orderId (in payments)
Related Collection: orders
Related Attribute: payment (auto-created in orders)
On Delete: Set Null (khi xóa payment, order vẫn giữ)
```

#### **2. payments → user (Many-to-One)**
```yaml
Relationship Type: Many to One
Side: userId (in payments)
Related Collection: user
Related Attribute: payments (auto-created in user)
On Delete: Cascade (khi xóa user, xóa luôn payments)
```

### **Indexes:**
```yaml
1. vnp_TxnRef_idx:
   - Attribute: vnp_TxnRef
   - Type: Unique
   - Order: ASC
   - Purpose: Fast lookup by transaction ref

2. orderId_status_idx:
   - Attributes: [orderId, status]
   - Type: Fulltext
   - Order: ASC
   - Purpose: Query payments by order and status

3. status_createdAt_idx:
   - Attributes: [status, createdAt]
   - Type: Fulltext
   - Order: DESC
   - Purpose: List pending/failed payments by date

4. userId_createdAt_idx:
   - Attributes: [userId, createdAt]
   - Type: Fulltext
   - Order: DESC
   - Purpose: User payment history
```

### **Permissions:**

```yaml
Create:
  - Role: Users (any authenticated user)
  
Read:
  - Role: Users (owner only - via userId relationship)
  - Role: Team: Admins
  
Update:
  - Role: Team: Payment Processors (Appwrite Functions)
  - Role: Team: Admins
  
Delete:
  - Role: Team: Admins only
```

---

## 📊 **CẬP NHẬT ORDERS COLLECTION**

### **Thêm attributes mới:**

| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| **paymentStatus** | Enum | ['pending','paid','failed','refunded'] | ✅ Yes | 'pending' | Payment status (sync với payments) |
| **paymentMethod** | Enum | ['vnpay','cod','momo'] | ✅ Yes | 'cod' | Phương thức thanh toán |
| **payment** | Relationship | → payments | ❌ No | - | Liên kết đến payment record (One-to-One) |

### **Update schema:**
```typescript
// orders collection - CÓ SẴN
{
  $id: string,                    // Order ID
  userId: Relationship<User>,     // User đặt hàng
  restaurantId: Relationship<Restaurant>,
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled',
  
  // NEW FIELDS:
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',  // ← TẠO MỚI
  paymentMethod: 'vnpay' | 'cod' | 'momo',                    // ← TẠO MỚI
  payment: Relationship<Payment>,                              // ← TẠO MỚI
  
  totalAmount: number,
  deliveryAddress: string,
  deliveryLat: number,
  deliveryLng: number,
  phoneNumber: string,
  notes: string,
  createdAt: DateTime,
  updatedAt: DateTime,
  deliveryTime: DateTime
}
```

---

## 🔐 **VNPAY CREDENTIALS & ENVIRONMENT**

### **1. Đăng ký VNPay Sandbox:**

Truy cập: https://sandbox.vnpayment.vn/  
Đăng ký merchant account (miễn phí)

**Test credentials (VNPay Sandbox):**
```properties
VNPAY_TMN_CODE=2QXUI4J4
VNPAY_HASH_SECRET=RAOEXHYVSDDIIENYWSHE
VNPAY_API_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://your-domain.com/vnpay-return
```

### **2. Cập nhật .env files:**

**Mobile (.env):**
```properties
# Existing
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=68c9791a002b85f096b4
EXPO_PUBLIC_APPWRITE_DATABASE_ID=68da5e73002cb68e70af

# Collections (existing)
EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID=user
EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID=orders
EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID=menu

# NEW - Payments Collection
EXPO_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=payments

# NEW - VNPay Config (for display only, secret in Functions)
EXPO_PUBLIC_VNPAY_ENABLED=true
EXPO_PUBLIC_PAYMENT_TIMEOUT=900000  # 15 minutes in ms
```

**Appwrite Functions (Environment Variables):**
```properties
# Appwrite Config
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=68c9791a002b85f096b4
APPWRITE_DATABASE_ID=68da5e73002cb68e70af
APPWRITE_API_KEY=your_api_key_here  # API Key with database access

# Collections
ORDERS_COLLECTION_ID=orders
PAYMENTS_COLLECTION_ID=payments

# VNPay Credentials
VNPAY_TMN_CODE=2QXUI4J4
VNPAY_HASH_SECRET=RAOEXHYVSDDIIENYWSHE
VNPAY_API_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Return URL (public URL của function hoặc FE)
VNPAY_RETURN_URL=https://your-public-domain.com/vnpay-return
# Hoặc nếu dùng localtunnel:
# VNPAY_RETURN_URL=https://abc123.loca.lt/vnpay-return

# Frontend URL (để redirect sau khi xử lý)
FRONTEND_URL=https://your-frontend.com
# Hoặc localtunnel:
# FRONTEND_URL=https://abc123.loca.lt
```

---

## 🛠️ **APPWRITE FUNCTIONS IMPLEMENTATION**

### **Function 1: createVNPayPayment**

**Purpose:** Generate VNPay payment URL với secure hash

**Runtime:** Node.js 18.0  
**Trigger:** HTTP Request  
**Method:** POST  
**Endpoint:** `/functions/create-vnpay-payment/executions`

**Environment Variables:**
```
APPWRITE_ENDPOINT
APPWRITE_PROJECT_ID
APPWRITE_DATABASE_ID
APPWRITE_API_KEY
ORDERS_COLLECTION_ID
PAYMENTS_COLLECTION_ID
VNPAY_TMN_CODE
VNPAY_HASH_SECRET
VNPAY_API_URL
VNPAY_RETURN_URL
```

**Request Body:**
```json
{
  "orderId": "674c1234567890abcdef1234",
  "userId": "674c0987654321fedcba9876",
  "amount": 150000,
  "ipAddress": "192.168.1.1"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
  "vnp_TxnRef": "PAY1730876543210",
  "expiresAt": "2025-11-10T10:30:00Z"
}
```

**Implementation:**
```javascript
// functions/create-vnpay-payment/src/index.js
import { Client, Databases, ID, Query } from 'node-appwrite';
import crypto from 'crypto';

export default async ({ req, res, log, error }) => {
  try {
    // 1. Parse request
    const { orderId, userId, amount, ipAddress = '127.0.0.1' } = JSON.parse(req.body);
    
    // 2. Validate input
    if (!orderId || !userId || !amount) {
      return res.json({ error: 'Missing required fields' }, 400);
    }
    
    // 3. Initialize Appwrite
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    const databases = new Databases(client);
    
    // 4. Verify order exists and is pending
    const order = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.ORDERS_COLLECTION_ID,
      orderId
    );
    
    if (!order) {
      return res.json({ error: 'Order not found' }, 404);
    }
    
    if (order.paymentStatus === 'paid') {
      return res.json({ error: 'Order already paid' }, 400);
    }
    
    // 5. Check for existing pending payment
    const existingPayments = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.PAYMENTS_COLLECTION_ID,
      [
        Query.equal('orderId', orderId),
        Query.equal('status', 'pending')
      ]
    );
    
    if (existingPayments.total > 0) {
      // Return existing payment URL
      const payment = existingPayments.documents[0];
      return res.json({
        success: true,
        paymentUrl: payment.paymentUrl,
        vnp_TxnRef: payment.vnp_TxnRef,
        expiresAt: payment.expiresAt
      });
    }
    
    // 6. Generate unique transaction reference
    const vnp_TxnRef = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const createDate = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // 7. Build VNPay parameters
    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: (amount * 100).toString(), // VNPay expects VND * 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expiresAt.toISOString().replace(/[-:T]/g, '').slice(0, 14)
    };
    
    // 8. Sort parameters alphabetically
    const sortedParams = Object.keys(vnpParams)
      .sort()
      .map(key => `${key}=${encodeURIComponent(vnpParams[key])}`)
      .join('&');
    
    // 9. Generate secure hash (HMAC SHA512)
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
    const signed = hmac.update(Buffer.from(sortedParams, 'utf-8')).digest('hex');
    
    // 10. Build payment URL
    const paymentUrl = `${process.env.VNPAY_API_URL}?${sortedParams}&vnp_SecureHash=${signed}`;
    
    // 11. Create payment record in database
    const payment = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.PAYMENTS_COLLECTION_ID,
      ID.unique(),
      {
        orderId,
        userId,
        vnp_TxnRef,
        provider: 'vnpay',
        status: 'pending',
        amount,
        vnp_Amount: amount * 100,
        ipAddress,
        paymentUrl,
        vnp_SecureHash: signed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        metadata: JSON.stringify(vnpParams)
      }
    );
    
    // 12. Update order payment method
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.ORDERS_COLLECTION_ID,
      orderId,
      {
        paymentMethod: 'vnpay',
        paymentStatus: 'pending',
        updatedAt: new Date().toISOString()
      }
    );
    
    log('Payment created successfully:', vnp_TxnRef);
    
    // 13. Return response
    return res.json({
      success: true,
      paymentUrl,
      vnp_TxnRef,
      expiresAt: expiresAt.toISOString(),
      paymentId: payment.$id
    });
    
  } catch (err) {
    error('Error creating VNPay payment:', err);
    return res.json({ error: err.message || 'Internal server error' }, 500);
  }
};
```

---

### **Function 2: vnpayReturnHandler**

**Purpose:** Handle VNPay callback, verify signature, update payment & order status

**Runtime:** Node.js 18.0  
**Trigger:** HTTP Request (GET)  
**Method:** GET  
**Endpoint:** `/functions/vnpay-return/executions`  
**Public:** ✅ Yes (VNPay cần access)

**Query Parameters (từ VNPay):**
```
vnp_Amount=15000000
vnp_BankCode=NCB
vnp_BankTranNo=VNP01234567
vnp_CardType=ATM
vnp_OrderInfo=Thanh+toan+don+hang+123
vnp_PayDate=20251110103000
vnp_ResponseCode=00
vnp_TmnCode=2QXUI4J4
vnp_TransactionNo=14123456
vnp_TransactionStatus=00
vnp_TxnRef=PAY1730876543210
vnp_SecureHash=abc123def456...
```

**Implementation:**
```javascript
// functions/vnpay-return/src/index.js
import { Client, Databases, Query } from 'node-appwrite';
import crypto from 'crypto';

export default async ({ req, res, log, error }) => {
  try {
    // 1. Get query parameters
    const params = req.query;
    log('VNPay callback received:', JSON.stringify(params));
    
    // 2. Extract and remove secure hash
    const vnp_SecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    
    // 3. Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // 4. Generate checksum
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
    const checksum = hmac.update(Buffer.from(sortedParams, 'utf-8')).digest('hex');
    
    // 5. Verify signature
    if (checksum !== vnp_SecureHash) {
      log('Invalid signature!');
      return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error&message=Invalid+signature`);
    }
    
    // 6. Initialize Appwrite
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    const databases = new Databases(client);
    
    // 7. Find payment by vnp_TxnRef
    const payments = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.PAYMENTS_COLLECTION_ID,
      [Query.equal('vnp_TxnRef', params.vnp_TxnRef)]
    );
    
    if (payments.total === 0) {
      log('Payment not found:', params.vnp_TxnRef);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error&message=Payment+not+found`);
    }
    
    const payment = payments.documents[0];
    const orderId = payment.orderId;
    
    // 8. Check response code
    const isSuccess = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';
    const newStatus = isSuccess ? 'success' : 'failed';
    
    // 9. Update payment record
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.PAYMENTS_COLLECTION_ID,
      payment.$id,
      {
        status: newStatus,
        vnp_ResponseCode: params.vnp_ResponseCode,
        vnp_TransactionNo: params.vnp_TransactionNo,
        vnp_TransactionStatus: params.vnp_TransactionStatus,
        vnp_BankCode: params.vnp_BankCode || null,
        vnp_BankTranNo: params.vnp_BankTranNo || null,
        vnp_CardType: params.vnp_CardType || null,
        vnp_PayDate: params.vnp_PayDate,
        errorMessage: isSuccess ? null : getErrorMessage(params.vnp_ResponseCode),
        updatedAt: new Date().toISOString()
      }
    );
    
    // 10. Update order status
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.ORDERS_COLLECTION_ID,
      orderId,
      {
        paymentStatus: isSuccess ? 'paid' : 'failed',
        status: isSuccess ? 'confirmed' : 'pending',
        updatedAt: new Date().toISOString()
      }
    );
    
    log(`Payment ${newStatus}:`, params.vnp_TxnRef);
    
    // 11. Redirect to frontend result page
    const redirectUrl = `${process.env.FRONTEND_URL}/payment-result?` +
      `status=${isSuccess ? 'success' : 'failed'}` +
      `&orderId=${orderId}` +
      `&amount=${payment.amount}` +
      `&txnRef=${params.vnp_TxnRef}` +
      `&message=${encodeURIComponent(isSuccess ? 'Payment successful' : getErrorMessage(params.vnp_ResponseCode))}`;
    
    return res.redirect(redirectUrl, 302);
    
  } catch (err) {
    error('Error processing VNPay callback:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error&message=${encodeURIComponent(err.message)}`, 302);
  }
};

// Helper function for error messages
function getErrorMessage(responseCode) {
  const errorMessages = {
    '01': 'Giao dịch chưa hoàn tất',
    '02': 'Giao dịch bị lỗi',
    '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
    '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
    '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
    '07': 'Giao dịch bị nghi ngờ gian lận',
    '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
    '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Đã hết hạn chờ thanh toán',
    '12': 'Thẻ/Tài khoản bị khóa',
    '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
    '24': 'Khách hàng hủy giao dịch',
    '51': 'Tài khoản không đủ số dư',
    '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
    '75': 'Ngân hàng thanh toán đang bảo trì',
    '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định',
    '99': 'Lỗi không xác định'
  };
  
  return errorMessages[responseCode] || 'Lỗi không xác định';
}
```

---

## 📱 **MOBILE APP UPDATES**

### **1. Update lib/appwrite.ts:**

```typescript
// mobile/lib/appwrite.ts

// Add to appwriteConfig
export const appwriteConfig = {
  // ... existing config ...
  paymentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID || "payments",
};

// Update createVNPayPayment to call Appwrite Function
export const createVNPayPayment = async (params: {
  orderId: string;
  userId: string;
  amount: number;
}): Promise<{ paymentUrl: string; vnp_TxnRef: string; expiresAt: string }> => {
  try {
    // Get current session to include auth token
    const session = await account.get();
    
    // Call Appwrite Function
    const response = await fetch(
      `${appwriteConfig.endpoint}/functions/create-vnpay-payment/executions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': appwriteConfig.projectId,
          'X-Appwrite-JWT': session.$id, // Auth token
        },
        body: JSON.stringify({
          orderId: params.orderId,
          userId: params.userId,
          amount: params.amount,
          ipAddress: '127.0.0.1' // Will be replaced by function with real IP
        })
      }
    );
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create payment');
    }
    
    return {
      paymentUrl: data.paymentUrl,
      vnp_TxnRef: data.vnp_TxnRef,
      expiresAt: data.expiresAt
    };
    
  } catch (error) {
    console.error('Error creating VNPay payment:', error);
    throw error;
  }
};

// Add function to check payment status
export const getPaymentStatus = async (vnp_TxnRef: string) => {
  try {
    const payments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.paymentsCollectionId,
      [Query.equal('vnp_TxnRef', vnp_TxnRef)]
    );
    
    if (payments.total === 0) {
      return null;
    }
    
    return payments.documents[0];
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};
```

### **2. Update payment-selection.tsx:**

```typescript
// mobile/app/payment-selection.tsx

const handleProceedPayment = async () => {
  if (!selectedMethod || !orderId) return;

  try {
    setProcessing(true);

    if (selectedMethod === 'vnpay') {
      // Call Appwrite Function to create payment
      const { paymentUrl, vnp_TxnRef, expiresAt } = await createVNPayPayment({
        orderId,
        userId: user.$id,
        amount: orderAmount
      });

      // Navigate to VNPay WebView
      router.push({
        pathname: '/vnpay-payment' as any,
        params: {
          paymentUrl,
          vnp_TxnRef,
          orderId,
          amount: amount,
          expiresAt
        }
      });
      return;
    }
    
    // COD logic remains same
    // ...
    
  } catch (error) {
    console.error('Payment error:', error);
    if (isWeb) {
      showToast(error.message || 'Failed to process payment', 'error');
    } else {
      Alert.alert('Payment Error', error.message || 'Failed to process payment');
    }
  } finally {
    setProcessing(false);
  }
};
```

### **3. Update vnpay-payment.tsx:**

```typescript
// mobile/app/vnpay-payment.tsx

const VNPayPaymentScreen = () => {
  const { paymentUrl, vnp_TxnRef, orderId, amount, expiresAt } = useLocalSearchParams<{
    paymentUrl: string;
    vnp_TxnRef: string;
    orderId: string;
    amount: string;
    expiresAt: string;
  }>();
  
  const [processing, setProcessing] = useState(false);
  const [checking, setChecking] = useState(false);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    openPaymentBrowser();
  }, []);

  const openPaymentBrowser = async () => {
    try {
      setProcessing(true);

      if (!paymentUrl) {
        throw new Error('Payment URL not provided');
      }

      // Open VNPay in browser
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: '#f59e0b',
      });

      // After browser closes, check payment status
      await checkPaymentStatus();

    } catch (error) {
      console.error('Error opening payment browser:', error);
      Alert.alert('Payment Error', 'Failed to open payment page');
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      setChecking(true);
      
      // Poll payment status (VNPay might take a few seconds to update)
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const payment = await getPaymentStatus(vnp_TxnRef);
        
        if (payment && payment.status !== 'pending') {
          if (payment.status === 'success') {
            // Clear cart
            clearCart();
            
            // Navigate to success
            router.replace({
              pathname: '/payment-result' as any,
              params: {
                success: 'true',
                method: 'vnpay',
                orderId,
                amount,
                txnRef: vnp_TxnRef,
                message: 'Payment completed successfully'
              }
            });
          } else {
            // Navigate to failure
            router.replace({
              pathname: '/payment-result' as any,
              params: {
                success: 'false',
                method: 'vnpay',
                orderId,
                amount,
                txnRef: vnp_TxnRef,
                message: payment.errorMessage || 'Payment failed'
              }
            });
          }
          return;
        }
        
        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
      
      // Timeout - payment still pending
      Alert.alert(
        'Payment Pending',
        'Your payment is being processed. Please check your order history.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error) {
      console.error('Error checking payment status:', error);
      Alert.alert('Error', 'Failed to verify payment status');
    } finally {
      setChecking(false);
    }
  };

  // Remove demo buttons in production
  // Only show retry and cancel options

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* UI remains similar but without demo buttons */}
      {/* Add loading state while checking payment */}
    </SafeAreaView>
  );
};
```

---

## 🌐 **LOCALTUNNEL SETUP**

### **Tại sao cần Localtunnel?**

VNPay cần **public HTTPS URL** để callback. Localhost không thể nhận callback từ internet.

### **Setup:**

```bash
# Terminal 1: Start mobile app
cd mobile
npm run web  # Runs on http://localhost:8082

# Terminal 2: Create tunnel
npx localtunnel --port 8082 --subdomain foodfast-payment

# Output:
# your url is: https://foodfast-payment.loca.lt
```

### **Configure Functions:**

```properties
# Trong Appwrite Function Environment Variables
VNPAY_RETURN_URL=https://foodfast-payment.loca.lt/vnpay-return
FRONTEND_URL=https://foodfast-payment.loca.lt
```

### **Important:**
- Localtunnel URL chỉ dùng cho testing
- Production cần domain thật (Vercel, Netlify, custom domain)

---

## 🔄 **PAYMENT FLOW DIAGRAM**

```
┌─────────────┐
│   User      │
│  Clicks Pay │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  FE: payment-selection.tsx      │
│  - User chọn VNPay              │
│  - Call createVNPayPayment()    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Appwrite Function:             │
│  createVNPayPayment             │
│  1. Tạo payment record (pending)│
│  2. Generate vnp_TxnRef         │
│  3. Build params + hash         │
│  4. Return paymentUrl           │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  FE: vnpay-payment.tsx          │
│  - Open WebBrowser              │
│  - User redirect to VNPay       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  VNPay Sandbox                  │
│  - User nhập thông tin thẻ     │
│  - User confirm payment         │
│  - VNPay process transaction    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  VNPay Callback                 │
│  GET https://your-domain.com/   │
│      vnpay-return?params...     │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Appwrite Function:             │
│  vnpayReturnHandler             │
│  1. Verify vnp_SecureHash       │
│  2. Update payment status       │
│  3. Update order status         │
│  4. Redirect to FE result page  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  FE: payment-result.tsx         │
│  - Show success/failure         │
│  - Clear cart if success        │
│  - Navigate to order-history    │
└─────────────────────────────────┘
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Database Setup**
- [ ] Tạo `payments` collection trong Appwrite Console
- [ ] Add 25 attributes theo schema
- [ ] Setup 2 relationships (orderId, userId)
- [ ] Tạo 4 indexes (vnp_TxnRef, orderId_status, status_createdAt, userId_createdAt)
- [ ] Configure permissions (Users create/read, Functions update)
- [ ] Update `orders` collection: add paymentStatus, paymentMethod, payment relationship
- [ ] Test database với dummy data

### **Phase 2: VNPay Registration**
- [ ] Đăng ký VNPay Sandbox account
- [ ] Lấy TMN Code và Hash Secret
- [ ] Test credentials với VNPay docs

### **Phase 3: Appwrite Functions**
- [ ] Tạo Function: `create-vnpay-payment`
  - [ ] Add environment variables
  - [ ] Deploy code
  - [ ] Test với Postman
  - [ ] Verify payment record tạo thành công
  - [ ] Verify payment URL hợp lệ

- [ ] Tạo Function: `vnpay-return-handler`
  - [ ] Add environment variables
  - [ ] Enable public access
  - [ ] Deploy code
  - [ ] Test với mock VNPay callback
  - [ ] Verify hash validation
  - [ ] Verify database updates

### **Phase 4: Mobile App Updates**
- [ ] Update `.env` với PAYMENTS_COLLECTION_ID
- [ ] Update `lib/appwrite.ts`:
  - [ ] Add paymentsCollectionId
  - [ ] Rewrite createVNPayPayment() gọi function
  - [ ] Add getPaymentStatus()
- [ ] Update `payment-selection.tsx`:
  - [ ] Call new createVNPayPayment()
  - [ ] Handle errors
- [ ] Update `vnpay-payment.tsx`:
  - [ ] Implement checkPaymentStatus()
  - [ ] Remove demo buttons
  - [ ] Add loading states
- [ ] Test end-to-end flow

### **Phase 5: Localtunnel & Testing**
- [ ] Install localtunnel: `npm i -g localtunnel`
- [ ] Start tunnel: `lt --port 8082 --subdomain foodfast-payment`
- [ ] Update Function env vars với tunnel URL
- [ ] Test complete flow:
  - [ ] Create order
  - [ ] Select VNPay
  - [ ] Open payment URL
  - [ ] Complete payment on sandbox
  - [ ] Verify callback works
  - [ ] Verify order status updated
  - [ ] Verify cart cleared
  - [ ] Check payment record in database

### **Phase 6: Error Handling**
- [ ] Test timeout scenario (15 min expiry)
- [ ] Test duplicate payment prevention
- [ ] Test invalid signature
- [ ] Test network failures
- [ ] Test payment cancellation
- [ ] Add proper error messages

### **Phase 7: Production Prep**
- [ ] Replace localtunnel với real domain
- [ ] Switch từ Sandbox sang Production credentials
- [ ] Remove all console.logs
- [ ] Add monitoring/logging
- [ ] Security audit
- [ ] Performance testing

---

## 🎯 **KẾT LUẬN**

### **Ưu điểm của thiết kế này:**

1. ✅ **Secure:** Hash verification trên server, không expose secret key
2. ✅ **Scalable:** Dễ dàng thêm payment providers khác (Momo, ZaloPay)
3. ✅ **Traceable:** Mọi transaction đều có audit trail trong database
4. ✅ **Reliable:** Idempotent (không duplicate payments)
5. ✅ **User-friendly:** Automatic status checking, clear error messages

### **Thời gian ước tính:**

| Phase | Thời gian | Độ khó |
|-------|-----------|--------|
| Database Setup | 1-2 giờ | ⭐⭐ |
| VNPay Registration | 30 phút | ⭐ |
| Appwrite Functions | 4-5 giờ | ⭐⭐⭐⭐ |
| Mobile Updates | 2-3 giờ | ⭐⭐⭐ |
| Testing | 2-3 giờ | ⭐⭐⭐ |
| **Total** | **10-14 giờ** | - |

### **Chi phí:**

- VNPay Sandbox: **FREE**
- VNPay Production: 1.5-2% transaction fee
- Appwrite Cloud: Free tier đủ dùng
- Localtunnel: Free

---

## 📚 **TÀI LIỆU THAM KHẢO**

1. **VNPay API Docs:** https://sandbox.vnpayment.vn/apis/docs/
2. **Appwrite Functions:** https://appwrite.io/docs/functions
3. **Appwrite Database:** https://appwrite.io/docs/databases
4. **Localtunnel:** https://github.com/localtunnel/localtunnel

---

**Generated:** November 10, 2025  
**Version:** 1.0  
**Status:** 🟢 Ready for Implementation
