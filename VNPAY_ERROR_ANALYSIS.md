# VNPay Integration Error Analysis & Solutions

## Error Overview

**Primary Error**: `AppwriteException: Invalid document structure: Missing required attribute "userId"`

**Context**: Occurs when creating VNPay payment but not during Cash on Delivery orders.

## Root Cause Analysis

### Database Schema Mismatch
The `payments` collection in Appwrite database requires a `userId` field, but the `createVNPayPayment` function was not providing it.

```typescript
// ❌ Original - Missing userId
await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.paymentsCollectionId,
    ID.unique(),
    {
        secret,
        provider: 'vnpay',
        status: 'pending',
        amount: params.amount,
        currency: 'VND',
        // Missing: userId, orderId
    }
);
```

### Why COD Works But VNPay Fails?
- **COD**: Only creates order record (no payment record needed)
- **VNPay**: Creates both order AND payment records (payment requires userId)

## Solutions Applied

### 1. Fix VNPay Payment Creation Function

**File**: `mobile/lib/appwrite.ts`

```typescript
// ✅ Fixed - Include required fields
export const createVNPayPayment = async (params: VNPayPaymentRequest & { userId?: string }): Promise<VNPayPaymentResponse> => {
    try {
        // Generate payment URL
        const paymentUrl = await generateVNPayUrl(params);
        
        // Generate unique secret for this payment
        const secret = ID.unique();

        // Create payment document with ALL required fields
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.paymentsCollectionId,
            ID.unique(),
            {
                orderId: params.orderId,        // ✅ Added
                userId: params.userId || 'anonymous', // ✅ Added  
                secret,
                provider: 'vnpay',
                status: 'pending',
                amount: params.amount,
                currency: 'VND',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        return { paymentUrl, secret };
    } catch (e) {
        console.error('Error creating VNPay payment:', e);
        throw new Error(e as string);
    }
};
```

### 2. Update Checkout to Pass UserId

**File**: `mobile/app/checkout.tsx`

```typescript
// ✅ Pass userId when creating VNPay payment
const vnpayResponse = await createVNPayPayment({
  orderId: order.$id,
  userId: user.$id,           // ✅ Added
  amount: total,
  returnUrl: 'foodfast://payment-result',
  orderInfo: `Payment for order ${order.$id}`
});
```

## Database Schema Requirements

### Orders Collection
```json
{
  "userId": "string (required)",
  "restaurantId": "string (required)", 
  "total": "number (required)",
  "status": "enum (required)",
  "paymentMethod": "enum (required)",
  "deliveryAddress": "string (required)",
  "phone": "string (required)",
  "notes": "string (optional)"
}
```

### Payments Collection
```json
{
  "orderId": "string (required)",
  "userId": "string (required)",
  "provider": "string (required)",
  "status": "enum (required)", 
  "amount": "number (required)",
  "currency": "string (required)",
  "secret": "string (required)",
  "createdAt": "string (required)",
  "updatedAt": "string (required)"
}
```

## Testing Checklist

### Before Fix
- [ ] ❌ COD orders: ✅ Works
- [ ] ❌ VNPay orders: ❌ Fails with userId error

### After Fix  
- [ ] ✅ COD orders: ✅ Works
- [ ] ✅ VNPay orders: ✅ Should work

## Common Database Errors & Solutions

### 1. Missing Required Attribute Errors

**Pattern**: `Missing required attribute "fieldName"`

**Diagnosis Steps**:
1. Check Appwrite Console → Database → Collection → Attributes
2. Identify which fields are marked as "Required" 
3. Verify your `createDocument` call includes ALL required fields
4. Match field names exactly (case-sensitive)

**Solution Template**:
```typescript
// ❌ Wrong - Missing required fields
await databases.createDocument(collectionId, documentId, {
  field1: 'value1'
  // Missing required field2, field3
});

// ✅ Correct - Include all required fields  
await databases.createDocument(collectionId, documentId, {
  field1: 'value1',
  field2: 'required_value',     // ✅ Added
  field3: 'another_required'    // ✅ Added  
});
```

### 2. Field Name Mismatches

**Pattern**: `Unknown attribute "fieldName"`

**Common Causes**:
- Typos in field names
- Case sensitivity issues  
- Using old field names after schema changes

**Solution**:
```typescript
// ❌ Wrong field names
await databases.createDocument(collectionId, documentId, {
  user_id: userId,        // ❌ Should be 'userId'
  order_id: orderId       // ❌ Should be 'orderId'
});

// ✅ Correct field names
await databases.createDocument(collectionId, documentId, {
  userId: userId,         // ✅ Correct
  orderId: orderId        // ✅ Correct
});
```

### 3. Data Type Mismatches  

**Pattern**: `Invalid document structure: Attribute "fieldName" has invalid format`

**Common Issues**:
- String vs Number type mismatches
- Enum value not in allowed list
- Invalid date format

**Solutions**:
```typescript
// ❌ Type mismatches
{
  amount: "100.50",           // ❌ String, should be Number
  status: "PENDING",          // ❌ Wrong enum case
  createdAt: new Date()       // ❌ Date object, should be ISO string
}

// ✅ Correct types
{
  amount: 100.50,             // ✅ Number
  status: "pending",          // ✅ Correct enum value
  createdAt: new Date().toISOString() // ✅ ISO string
}
```

## Prevention Strategies

### 1. Type Safety
```typescript
// Define interfaces matching database schema
interface PaymentData {
  orderId: string;
  userId: string;
  provider: 'vnpay' | 'cod';
  status: 'pending' | 'paid' | 'failed';
  amount: number;
  currency: string;
}

// Use interface for type checking
const createPayment = async (data: PaymentData) => {
  return await databases.createDocument(collectionId, ID.unique(), data);
};
```

### 2. Validation Helpers
```typescript
const validatePaymentData = (data: any): PaymentData => {
  const required = ['orderId', 'userId', 'provider', 'status', 'amount'];
  
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return data as PaymentData;
};
```

### 3. Development Testing
```typescript
// Test data creation in isolation
const testCreatePayment = async () => {
  try {
    const testData = {
      orderId: 'test-order-123',
      userId: 'test-user-456', 
      provider: 'vnpay',
      status: 'pending',
      amount: 100000,
      currency: 'VND',
      secret: 'test-secret',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.paymentsCollectionId,
      ID.unique(),
      testData
    );
    
    console.log('✅ Payment creation test passed:', result);
  } catch (error) {
    console.error('❌ Payment creation test failed:', error);
  }
};
```

## Debugging Steps

### When VNPay Payment Fails

1. **Check Console Logs**
   - Look for "Error creating VNPay payment" messages
   - Identify specific Appwrite error details

2. **Verify Database Schema**
   ```bash
   # In Appwrite Console
   Database → payments collection → Attributes tab
   # Verify all required fields are present
   ```

3. **Test with Minimal Data**
   ```typescript
   // Try creating payment with only required fields
   const minimalPayment = {
     orderId: 'test',
     userId: 'test', 
     provider: 'vnpay',
     status: 'pending',
     amount: 1000,
     currency: 'VND'
   };
   ```

4. **Compare with Working COD Flow**
   - COD only creates order, no payment record
   - VNPay creates both order AND payment
   - Isolate which step fails

### Log Analysis

**Success Pattern (COD)**:
```
Checkout success: Order created with COD
Navigating to payment result
```

**Failure Pattern (VNPay)**:
```
Checkout error: AppwriteException: Invalid document structure: Missing required attribute "userId"
Error creating VNPay payment: [error details]
```

## Recovery Actions

If payment creation fails but order was created:

1. **Manual Order Cleanup**
   ```typescript
   // Delete orphaned order if payment fails
   await databases.deleteDocument(
     appwriteConfig.databaseId,
     appwriteConfig.ordersCollectionId, 
     orderId
   );
   ```

2. **User Notification**
   ```typescript
   Alert.alert(
     'Payment Setup Failed',
     'Unable to process payment. Your order was not created. Please try again.',
     [{ text: 'OK' }]
   );
   ```

3. **Retry Mechanism**
   ```typescript
   const createOrderWithRetry = async (orderData: OrderData, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await createOrderWithPayment(orderData);
       } catch (error) {
         console.log(`Attempt ${i + 1} failed:`, error);
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
       }
     }
   };
   ```

## Future Improvements

### 1. Better Error Handling
- Specific error messages for different failure types
- User-friendly error descriptions
- Automatic retry for transient failures

### 2. Transaction Safety
- Wrap order + payment creation in transaction
- Rollback on partial failures
- Ensure data consistency

### 3. Monitoring & Alerts
- Track payment failure rates
- Alert on database schema changes
- Monitor VNPay API health

---

**Last Updated**: October 22, 2025  
**Error Status**: ✅ RESOLVED  
**Next Action**: Test both COD and VNPay flows