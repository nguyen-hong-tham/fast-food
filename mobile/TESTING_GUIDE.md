# 🧪 VNPay Payment Testing Guide

## Prerequisites
1. Make sure Appwrite backend is running and configured
2. Have restaurants and menu items in database
3. Mobile app running via `npm start` in mobile folder

## Test Scenarios

### 1. **Cart Management Tests**
- [ ] Add items to cart from menu
- [ ] Increase/decrease quantity
- [ ] Remove items from cart
- [ ] Clear entire cart
- [ ] Try adding items from different restaurants (should show alert)

### 2. **Checkout Flow Tests**
- [ ] Navigate from cart to checkout
- [ ] Fill delivery information
- [ ] Validate required fields (address, phone)
- [ ] Test with empty cart (should prevent checkout)
- [ ] Test without login (should prompt sign in)

### 3. **Payment Method Tests**

#### **Cash on Delivery (COD)**
- [ ] Select COD payment method
- [ ] Confirm payment
- [ ] Verify order created in database
- [ ] Check cart is cleared after success
- [ ] Navigate to payment result screen

#### **VNPay Payment**
- [ ] Select VNPay payment method
- [ ] Open VNPay WebView screen
- [ ] Test "Simulate Success" button
- [ ] Test "Simulate Failure" button  
- [ ] Check payment status updates in database
- [ ] Verify cart clearing on success
- [ ] Test navigation back to payment selection

### 4. **Payment Result Tests**
- [ ] Success result screen shows correct info
- [ ] Failure result screen shows retry options
- [ ] "Track Your Order" navigation works
- [ ] "Back to Home" navigation works
- [ ] Order ID and amount display correctly

### 5. **Error Handling Tests**
- [ ] Network failure during payment
- [ ] Invalid payment data
- [ ] Database connection issues
- [ ] App navigation during payment process

## Database Verification

Check these collections in Appwrite Console:
- **orders**: New orders with correct status
- **order_items**: Items with customizations
- **payments**: Payment records with correct method
- **User cart**: Should be empty after successful payment

## Debug Tools

### Console Logs
Check browser console for:
- Payment API responses
- Error messages
- Navigation events

### Network Tab
Monitor API calls to:
- `/orders` endpoints
- `/payments` endpoints
- VNPay URL generation

## Common Issues & Solutions

### Issue: Cart not clearing
**Solution**: Check `clearCart()` is called after successful payment

### Issue: VNPay WebView not opening
**Solution**: Verify `expo-web-browser` is installed and imported correctly

### Issue: Order not created
**Solution**: Check user authentication and required fields validation

### Issue: Payment status not updating
**Solution**: Verify `updateOrderPaymentStatus()` function calls

## Test Data Examples

### Sample Order Data
```json
{
  "userId": "user123",
  "restaurantId": "rest456", 
  "total": 150000,
  "items": [
    {
      "menuItemId": "item789",
      "name": "Burger Deluxe",
      "price": 75000,
      "quantity": 2
    }
  ],
  "deliveryAddress": "123 Nguyen Van Linh, District 7, HCMC",
  "phone": "0901234567"
}
```

### VNPay Test Parameters
- **Amount**: 150000 (150,000 VND)
- **Order Info**: "Payment for order ORDER_ID"
- **Return URL**: "foodfast://payment-result"

## Success Criteria

✅ **Payment Integration Successful When:**
1. User can complete full checkout flow
2. Orders created correctly in database
3. Payment status tracked properly
4. Cart management works smoothly
5. Error handling provides good UX
6. Navigation flows work as expected