# Phân tích & Hướng giải quyết nhiệm vụ FoodFast

Phân tích chi tiết 3 nhiệm vụ được giao, nguyên nhân gây lỗi và hướng giải quyết cụ thể.

---

## 1. Chưa đăng nhập vẫn có thể vào app để xem sản phẩm

### 📋 Tình trạng hiện tại
- **✅ ĐÃ FIX**: Project đã được setup để cho phép browsing không cần đăng nhập
- File `mobile/app/_layout.tsx` có comment rõ:
  ```tsx
  // ✅ Removed auto-fetch of auth user on app start
  // User can browse app without logging in
  // Auth will be fetched only when:
  // 1. User logs in (sign-in.tsx)
  // 2. User signs up (sign-up.tsx)
  // 3. User tries to place order (cart.tsx)
  ```
- Store `auth.store.ts` đã set `isLoading: false` thay vì `true`
- **🎯 ĐÃ XÓA** redirect cưỡng bức trong `(tabs)/_layout.tsx`

### 🎯 Hành động đã thực hiện
**✅ ĐÃ HOÀN THÀNH** - tính năng browsing không đăng nhập đã hoạt động:

1. **Xóa redirect cưỡng bức**:
   ```tsx
   // TRƯỚC: if(!isAuthenticated) return <Redirect href="/(auth)/sign-in" />
   // SAU: ✅ Allow browsing without login - user can view restaurants and menu
   ```

2. **Thêm guard cho Add to Cart**:
   ```tsx
   // Trong menu-detail.tsx
   if (!user) {
     Alert.alert(
       'Login Required',
       'Please login to add items to cart.',
       [
         { text: 'Cancel', style: 'cancel' },
         { text: 'Login', onPress: () => router.push('/(auth)/sign-in') }
       ]
     );
     return;
   }
   ```

3. **Profile tab hiển thị login option**:
   - Khi chưa đăng nhập: Hiển thị "Not Logged In" với nút "Sign In"
   - Khi đã đăng nhập: Hiển thị profile bình thường

**🎯 Flow hoạt động**:
- **Guest có thể**: Xem trang chủ, danh sách nhà hàng, chi tiết nhà hàng, chi tiết món ăn
- **Guest KHÔNG thể**: Add to cart, checkout, xem order history, đánh giá
- **Khi nào bắt buộc đăng nhập**: Add to cart, checkout, profile actions

---

## 2. Sửa review ở trang nhà hàng: hiển thị thông tin khách hàng (tên, avatar, time)

### 📋 Tình trạng hiện tại

**✅ ĐÃ CÓ CODE**: Hệ thống review đã được implement hoàn chỉnh

#### Code hiện có:
1. **API đầy đủ**: `mobile/lib/restaurant-reviews.ts`
   - `getRestaurantReviewsWithUserInfo()` - fetch reviews kèm user info
   - `createRestaurantReview()` - tạo review mới
   - Đã handle user info: name, avatar

2. **Component**: `mobile/components/rating/ReviewCard.tsx` 
   - Hiển thị review với user info

3. **Integration**: `mobile/app/restaurant-detail.tsx`
   - Import: `getRestaurantReviewsWithUserInfo, getRestaurantAverageRating`
   - State: `reviews`, `rating`
   - Function: `loadReviews()` được gọi trong useEffect

### 🔍 Nguyên nhân có thể gây lỗi

1. **User info missing** trong review:
   ```typescript
   // Trong getRestaurantReviewsWithUserInfo()
   const user = await databases.getDocument(
     appwriteConfig.databaseId,
     appwriteConfig.userCollectionId,
     userIdFromRelation  // ← Có thể null/undefined
   );
   ```

2. **Avatar không có** - fallback đã handle:
   ```typescript
   user: {
     name: user.name,
     avatar: user.avatar || null, // ← OK
   },
   ```

3. **Time format** - cần check ReviewCard component hiển thị $createdAt như thế nào

### 🎯 Hành động cần thiết

1. **Kiểm tra ReviewCard component**:
   ```bash
   # Đọc file này để xem format time
   mobile/components/rating/ReviewCard.tsx
   ```

2. **Test dữ liệu**:
   - Kiểm tra collection `reviews` có data không
   - Kiểm tra relationship `user` trong review documents
   - Kiểm tra user collection có `name`, `avatar` fields

3. **Debug console**:
   ```tsx
   const loadReviews = async () => {
     try {
       const reviewsData = await getRestaurantReviewsWithUserInfo(id, 50);
       console.log('Reviews data:', reviewsData); // ← Add debug
       setReviews(reviewsData);
     } catch (error) {
       console.error('Error fetching reviews:', error);
     }
   };
   ```

4. **Nếu thiếu time format**:
   ```tsx
   // Trong ReviewCard.tsx
   <Text className="text-sm text-gray-400">
     {formatDistanceToNow(new Date(review.$createdAt), { addSuffix: true })}
   </Text>
   ```

---

## 3. Sửa thanh toán VNPay: cho nó hoạt động (PHẦN QUAN TRỌNG NHẤT)

### 📋 Tình trạng hiện tại

**❌ MOCK IMPLEMENTATION**: Hiện tại chỉ là UI fake, không thanh toán thật

#### Code hiện có:
1. **Mock trong `mobile/lib/appwrite.ts`**:
   ```typescript
   // Line 979: generateVNPayUrl() - FAKE URL
   const baseUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
   
   // Line 1019: createVNPayPayment() - NO REAL PAYMENT
   // Line 1058: processVNPayCallback() - NO VERIFICATION
   ```

2. **Checkout flow**: `mobile/app/checkout.tsx`
   ```typescript
   if (selectedPaymentMethod === 'cod') {
     // COD works fine
   } else {
     // VNPay: treat same as COD - just create order ← WRONG!
     clearCart();
     router.replace('/payment-result');
   }
   ```

### 🔥 Nguyên nhân core issue

1. **Không có real VNPay integration**
2. **Không có payment verification**
3. **Không có webhook handling**
4. **Không có secure signature**

### 🎯 Hướng giải quyết VNPay Payment (DETAILED ROADMAP)

#### **PHASE 1: Setup VNPay Account & Credentials**

1. **Đăng ký VNPay sandbox**:
   - Website: https://sandbox.vnpayment.vn
   - Lấy: `TMN_CODE`, `HASH_SECRET`, `URL`

2. **Environment variables**:
   ```env
   VNPAY_TMN_CODE=your_terminal_code
   VNPAY_HASH_SECRET=your_secret_key
   VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNPAY_RETURN_URL=your_app_deep_link
   ```

#### **PHASE 2: Server-side Implementation** (Quan trọng nhất)

**⚠️ VNPay YÊU CẦU SERVER-SIDE** vì:
- Secret key không được expose trên client
- Signature calculation cần bảo mật
- Webhook verification cần server

**Option A: Appwrite Functions** (Khuyên dùng)
```javascript
// functions/vnpay-payment/index.js
const crypto = require('crypto');

exports.main = async (req, res) => {
  const { amount, orderId, orderInfo } = req.body;
  
  // 1. Generate VNPay URL with real signature
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_Amount: amount * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    vnp_IpAddr: req.headers['x-forwarded-for'] || '127.0.0.1',
    vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, '')
  };
  
  // 2. Sort params và tạo signature
  const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
    result[key] = vnp_Params[key];
    return result;
  }, {});
  
  const signData = Object.keys(sortedParams)
    .map(key => `${key}=${sortedParams[key]}`)
    .join('&');
  
  const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
  const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  const paymentUrl = `${process.env.VNPAY_URL}?${signData}&vnp_SecureHash=${signature}`;
  
  return res.json({ paymentUrl });
};
```

**Option B: Express.js API** (Nếu có backend riêng)
```javascript
// api/vnpay/create-payment
app.post('/vnpay/create-payment', (req, res) => {
  // Same logic as above
});

app.get('/vnpay/callback', (req, res) => {
  // Verify signature và update order status
});
```

#### **PHASE 3: Client Integration**

1. **Update `mobile/lib/appwrite.ts`**:
   ```typescript
   export const createVNPayPayment = async (params: VNPayPaymentRequest) => {
     try {
       // Call server function thay vì mock
       const response = await databases.createExecution(
         'vnpay-payment-function-id',
         JSON.stringify({
           amount: params.amount,
           orderId: params.orderId,
           orderInfo: params.orderInfo
         })
       );
       
       const result = JSON.parse(response.response);
       return {
         success: true,
         paymentUrl: result.paymentUrl,
         transactionId: params.orderId
       };
     } catch (error) {
       console.error('VNPay payment error:', error);
       throw error;
     }
   };
   ```

2. **Update checkout flow**:
   ```typescript
   // mobile/app/checkout.tsx
   if (selectedPaymentMethod === 'vnpay') {
     const paymentResponse = await createVNPayPayment({
       amount: total,
       orderId: order.$id,
       orderInfo: `Payment for order ${order.$id}`
     });
     
     if (paymentResponse.success) {
       // Open VNPay URL in browser/webview
       if (Platform.OS === 'web') {
         window.open(paymentResponse.paymentUrl, '_self');
       } else {
         // Use Linking or WebBrowser
         await WebBrowser.openBrowserAsync(paymentResponse.paymentUrl);
       }
     }
   }
   ```

#### **PHASE 4: Deep Link & Callback Handling**

1. **Setup Deep Link** (mobile):
   ```json
   // app.json
   {
     "expo": {
       "scheme": "foodfast",
       "android": {
         "intentFilters": [
           {
             "action": "VIEW",
             "data": [
               {
                 "scheme": "foodfast",
                 "host": "payment-result"
               }
             ]
           }
         ]
       }
     }
   }
   ```

2. **Handle callback**:
   ```typescript
   // mobile/app/payment-result.tsx
   useEffect(() => {
     const handleDeepLink = (url: string) => {
       const params = new URLSearchParams(url.split('?')[1]);
       const vnp_ResponseCode = params.get('vnp_ResponseCode');
       
       if (vnp_ResponseCode === '00') {
         // Payment success
         setPaymentStatus('success');
       } else {
         // Payment failed
         setPaymentStatus('failed');
       }
     };
     
     // Listen for deep links
     const subscription = Linking.addEventListener('url', ({ url }) => {
       handleDeepLink(url);
     });
     
     return () => subscription?.remove();
   }, []);
   ```

#### **PHASE 5: Security & Verification**

1. **Server webhook** để verify payment:
   ```javascript
   // functions/vnpay-webhook/index.js
   exports.main = async (req, res) => {
     const { vnp_ResponseCode, vnp_TxnRef, vnp_SecureHash } = req.body;
     
     // 1. Verify signature
     const isValidSignature = verifyVNPaySignature(req.body);
     if (!isValidSignature) {
       return res.status(400).json({ error: 'Invalid signature' });
     }
     
     // 2. Update order status trong Appwrite
     if (vnp_ResponseCode === '00') {
       await databases.updateDocument(
         databaseId,
         ordersCollectionId,
         vnp_TxnRef,
         { status: 'paid', paymentStatus: 'completed' }
       );
     } else {
       await databases.updateDocument(
         databaseId,
         ordersCollectionId,
         vnp_TxnRef,
         { status: 'cancelled', paymentStatus: 'failed' }
       );
     }
     
     return res.json({ success: true });
   };
   ```

#### **PHASE 6: Testing Strategy**

1. **Unit tests**: Mock VNPay responses
2. **Integration tests**: Sandbox environment
3. **E2E tests**: Full payment flow
4. **Error handling**: Network failures, invalid signatures

### 🚨 Lưu ý quan trọng

1. **KHÔNG BAO GIỜ** để secret key trong client code
2. **LUÔN LUÔN** verify signature từ VNPay
3. **SỬ DỤNG** webhook để confirm payment, không tin tưởng client callback
4. **HANDLE** edge cases: network timeout, user cancel, duplicate payments
5. **LOG** tất cả transactions cho debugging

### 📅 Timeline ước tính

- **Phase 1-2**: 2-3 ngày (setup account, implement server functions)
- **Phase 3-4**: 2-3 ngày (client integration, deep links)
- **Phase 5-6**: 1-2 ngày (security, testing)

**Total: ~1 tuần** cho full VNPay integration

---

## 🎯 Tổng kết & Ưu tiên

1. **KHÔNG CẦN**: Browsing không đăng nhập (đã hoạt động)
2. **KIỂM TRA**: Review hiển thị user info (có thể chỉ cần debug data)  
3. **QUAN TRỌNG**: VNPay payment (cần implement từ đầu, server-side required)

**Thứ tự ưu tiên**: VNPay > Review > Browse testing

VNPay là phần phức tạp nhất vì cần hiểu về payment gateway, security, và server-side implementation.