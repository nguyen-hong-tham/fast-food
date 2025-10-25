# Payment Integration Guide & Troubleshooting

## Overview
This document covers the VNPay payment integration implementation, common errors, and troubleshooting steps for the FoodFast mobile application.

## Architecture

### Payment Flow
```
Cart → Checkout → Payment Method Selection → Order Creation → VNPay/COD Processing → Result
```

### Key Components
- **Checkout Screen**: Payment method selection and order creation
- **VNPay Integration**: WebView-based payment processing  
- **Database**: Order and payment status management
- **Error Handling**: Comprehensive error catching and user feedback

## Implementation Details

### 1. Payment Methods
Currently supported:
- **VNPay**: Vietnamese payment gateway (Credit cards, QR, E-wallets)
- **Cash on Delivery (COD)**: Pay upon delivery

### 2. Database Schema
```typescript
Order {
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  paymentMethod: 'vnpay' | 'cod';
  deliveryAddress: string;
  phone: string;
  notes?: string;
}
```

### 3. Status Management
- **COD Orders**: Start as 'pending', confirmed by restaurant
- **VNPay Orders**: Start as 'pending', updated after payment confirmation

## Common Errors & Solutions

### 1. Database Field Naming Errors
**Error**: `Unknown attribute: user`
```
AppwriteException: Invalid query: Unknown attribute: user
```

**Root Cause**: Database queries using incorrect field names

**Solution**: 
```typescript
// ❌ Wrong
Query.equal('user', userId)

// ✅ Correct  
Query.equal('userId', userId)
```

**Fix Applied In**: `mobile/lib/appwrite.ts` - `getUserOrders()` function

### 2. Payment Status Enum Validation
**Error**: `Invalid document structure: Attribute "status" has invalid format`

**Root Cause**: Order status not matching database enum constraints

**Solution**: Auto-assignment logic in `createOrderWithPayment()`
```typescript
const getInitialOrderStatus = (paymentMethod: string): string => {
    switch (paymentMethod) {
        case 'cod': return 'pending';    // COD: await confirmation
        case 'vnpay': return 'pending';  // VNPay: await payment
        default: return 'pending';       // fallback
    }
};
```

### 3. Cart Restaurant Conflicts
**Error**: Users could add items from multiple restaurants

**Solution**: Restaurant conflict detection in cart store
```typescript
// Check restaurant conflict before adding item
const currentRestaurantId = get().restaurantId;
if (currentRestaurantId && currentRestaurantId !== restaurantId) {
    // Show conflict alert and handle user choice
}
```

### 4. VNPay Payment Errors
**Error**: Payment URL generation fails or WebView navigation issues

**Common Causes**:
- Invalid VNPay credentials
- Network connectivity issues
- Malformed payment parameters

**Debugging Steps**:
1. Check VNPay configuration in `mobile/lib/appwrite.ts`
2. Verify network connectivity
3. Check payment URL format
4. Review WebView navigation logs

### 5. TypeScript Type Errors
**Error**: Property doesn't exist on type

**Solution**: Update type definitions in `mobile/type.d.ts`
```typescript
export interface User extends Models.Document {
  address_home?: string;  // Add missing fields
  address_home_label?: string;
  phone?: string;
}
```

## Best Practices

### 1. Error Handling
- Always wrap API calls in try-catch blocks
- Provide meaningful error messages to users
- Log errors for debugging but don't expose sensitive info
- Use loading states during async operations

### 2. Database Queries
- Use exact field names matching database schema
- Implement proper query filters and pagination
- Handle empty results gracefully
- Use TypeScript interfaces for type safety

### 3. Payment Processing
- Validate payment parameters before API calls
- Handle network timeouts and retries
- Implement proper status updates
- Provide clear user feedback throughout flow

### 4. State Management
- Clear cart after successful order creation
- Update order status after payment confirmation
- Handle concurrent operations properly
- Maintain consistent state across components

## Testing Checklist

### Cart & Checkout Flow
- [ ] Add items from single restaurant
- [ ] Handle restaurant conflict scenarios
- [ ] Navigate from cart to checkout
- [ ] Fill delivery information
- [ ] Select payment method

### Payment Processing
- [ ] COD order creation and status
- [ ] VNPay payment URL generation
- [ ] WebView payment processing
- [ ] Payment result handling
- [ ] Order status updates

### Error Scenarios
- [ ] Network connectivity issues
- [ ] Invalid payment parameters
- [ ] Database permission errors
- [ ] Malformed API responses
- [ ] User cancellation flows

## File Structure

### Core Files
- `mobile/app/checkout.tsx` - Main checkout screen
- `mobile/app/vnpay-payment.tsx` - VNPay WebView processing
- `mobile/app/payment-result.tsx` - Payment confirmation screen
- `mobile/lib/appwrite.ts` - API functions and database operations
- `mobile/store/cart.store.ts` - Cart state management
- `mobile/type.d.ts` - TypeScript type definitions

### Configuration
- VNPay credentials: Environment variables or config file
- Database schema: Appwrite console configuration
- Payment parameters: Defined in API helper functions

## Deployment Notes

### Environment Setup
1. Configure VNPay merchant credentials
2. Set up Appwrite database with proper schema
3. Configure proper permissions for database collections
4. Test payment flow in sandbox environment before production

### Production Considerations
- Use production VNPay endpoints
- Implement proper logging and monitoring
- Set up error tracking (Sentry, etc.)
- Configure proper HTTPS and security headers
- Test on multiple devices and network conditions

## Support & Maintenance

### Monitoring
- Track payment success/failure rates
- Monitor API response times
- Log critical errors for investigation
- Set up alerts for payment failures

### Updates
- Keep VNPay SDK/API integration updated
- Monitor for database schema changes
- Update error handling based on new scenarios
- Regularly test payment flows

## Contact & Resources

### Documentation
- [VNPay Developer Guide](https://sandbox.vnpayment.vn/apis/)
- [Appwrite Database Docs](https://appwrite.io/docs/databases)
- [React Native Navigation](https://reactnavigation.org/)

### Team Contacts
- Technical Lead: [Contact Info]
- Backend Developer: [Contact Info] 
- Mobile Developer: [Contact Info]

---
*Last Updated: October 22, 2025*
*Version: 1.0.0*