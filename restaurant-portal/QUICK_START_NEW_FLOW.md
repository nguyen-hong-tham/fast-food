# ⚡ Quick Start - Test New Registration Flow

## 🎯 **What Changed:**

**Before:** Register with restaurant details → Login → Dashboard  
**Now:** Register account only → Login → Setup restaurant → Dashboard

---

## 🚀 **Test Registration:**

### **Step 1: Start Server**
```powershell
cd restaurant-portal
npm run dev
```

### **Step 2: Register Account**
```
Visit: http://localhost:3000/register

Fill:
  Owner Name: Nguyễn Văn A
  Email: test@restaurant.com
  Password: 12345678
  Confirm Password: 12345678

Click: "Create Account"

Expected:
  ✅ Alert: "Registration successful! Please login and setup your restaurant."
  ✅ Redirect to: /login
```

### **Step 3: Login**
```
Visit: /login (auto-redirected)

Fill:
  Email: test@restaurant.com
  Password: 12345678

Click: "Sign In"

Expected:
  ✅ Login successful
  ✅ Auto-redirect to: /setup (because no restaurant yet)
```

### **Step 4: Setup Restaurant (Step 1 - Basic Info)**
```
Visit: /setup (auto-redirected)

See: "Welcome to FoodFast! 🎉"
     "Set Up Your Restaurant"
     "Step 1 of 2: Basic Information"

Fill:
  Restaurant Name: Cơm Sườn Ngon
  Description: Cơm sườn thơm ngon, giá cả phải chăng
  Address: 123 Nguyễn Thị Thập, Quận 7, TP.HCM
  Phone: 0999111991
  Cuisine Types: Vietnamese, Asian

Click: "Next Step"

Expected:
  ✅ Move to Step 2
```

### **Step 5: Setup Restaurant (Step 2 - Review)**
```
See: "Review Your Information"
  - All info displayed correctly
  - Info box: "What happens next?"

Click: "Submit for Review"

Expected:
  ✅ Success screen appears
  ✅ Message: "Restaurant Created Successfully! 🎉"
  ✅ "Your restaurant Cơm Sườn Ngon has been submitted for review"
  ✅ Auto-redirect after 3 seconds
```

### **Step 6: Dashboard**
```
Visit: /dashboard (auto-redirected)

See:
  ✅ Welcome message: "Welcome back, Cơm Sườn Ngon!"
  ✅ Yellow banner: "Pending Approval"
  ✅ Banner text: "Your restaurant is under review..."
  ✅ Stats cards (all showing 0 for now)
```

---

## ✅ **Verify in Appwrite:**

### **User Collection:**
```
1. Go to Appwrite Console
2. Database → app → user
3. Find: email = test@restaurant.com
4. Check:
   ✅ accountId: [some ID]
   ✅ email: test@restaurant.com
   ✅ name: Nguyễn Văn A
   ✅ role: restaurant
```

### **Restaurant Collection:**
```
1. Database → app → restaurants
2. Find: email = test@restaurant.com
3. Check:
   ✅ name: Cơm Sườn Ngon
   ✅ status: pending
   ✅ ownerId: [matches accountId]
   ✅ description: Cơm sườn thơm ngon...
   ✅ address: 123 Nguyễn Thị Thập...
   ✅ phone: 0999111991
   ✅ cuisineType: Vietnamese, Asian
```

---

## 🧪 **Additional Tests:**

### **Test: Login Again (With Restaurant)**
```
1. Logout
2. Login again with test@restaurant.com
3. Expected:
   ✅ Auto-redirect to /dashboard (NOT /setup)
   ✅ See "Pending Approval" banner
```

### **Test: Direct Access to /setup**
```
1. While logged in with restaurant
2. Visit: http://localhost:3000/setup
3. Expected:
   ✅ Auto-redirect to /dashboard
   ✅ Cannot access /setup if already has restaurant
```

### **Test: Access /setup Without Login**
```
1. Logout
2. Visit: http://localhost:3000/setup
3. Expected:
   ✅ Redirect to /login
   ✅ Protected route works
```

---

## 📊 **Test Results Template:**

```
=== NEW REGISTRATION FLOW TEST ===

Date: [today]

✅ Step 1: Register Account
  - Form displayed: [ ] Yes [ ] No
  - Submitted successfully: [ ] Yes [ ] No
  - Redirected to /login: [ ] Yes [ ] No

✅ Step 2: Login
  - Login successful: [ ] Yes [ ] No
  - Redirected to /setup: [ ] Yes [ ] No

✅ Step 3: Setup Restaurant - Step 1
  - Form displayed: [ ] Yes [ ] No
  - Filled all fields: [ ] Yes [ ] No
  - Clicked "Next Step": [ ] Yes [ ] No

✅ Step 4: Setup Restaurant - Step 2
  - Review screen displayed: [ ] Yes [ ] No
  - Info correct: [ ] Yes [ ] No
  - Submitted successfully: [ ] Yes [ ] No

✅ Step 5: Success Screen
  - Success message shown: [ ] Yes [ ] No
  - Auto-redirected: [ ] Yes [ ] No

✅ Step 6: Dashboard
  - Dashboard displayed: [ ] Yes [ ] No
  - "Pending Approval" banner: [ ] Yes [ ] No

✅ Appwrite Verification:
  - User document created: [ ] Yes [ ] No
  - Restaurant document created: [ ] Yes [ ] No
  - role = "restaurant": [ ] Yes [ ] No
  - status = "pending": [ ] Yes [ ] No

✅ Additional Tests:
  - Login again → dashboard: [ ] Yes [ ] No
  - /setup redirects if has restaurant: [ ] Yes [ ] No
  - /setup protected without login: [ ] Yes [ ] No

Overall Result: [ ] All Pass [ ] Some Failed

Errors (if any):
"""
[paste errors here]
"""
```

---

## 🎉 **Expected Results:**

✅ Registration simpler (4 fields only)  
✅ Login redirects correctly  
✅ Setup wizard works smoothly  
✅ Success screen shows and auto-redirects  
✅ Dashboard shows "Pending Approval" banner  
✅ Documents created correctly in Appwrite  

---

## 🔄 **Flow Diagram:**

```
┌─────────────────┐
│   /register     │  4 fields only
│   (Public)      │  No restaurant info
└────────┬────────┘
         │ Submit
         ▼
┌─────────────────┐
│   Success       │  "Please login"
│   Alert         │
└────────┬────────┘
         │ Redirect
         ▼
┌─────────────────┐
│   /login        │  Enter credentials
│   (Public)      │
└────────┬────────┘
         │ Login
         ▼
    ┌────┴────┐
    │ Has     │
    │ Rest?   │
    └──┬───┬──┘
       │   │
    NO │   │ YES
       │   │
       ▼   ▼
  ┌────────────┐  ┌────────────┐
  │  /setup    │  │ /dashboard │
  │ (Protected)│  │ (Protected)│
  └──────┬─────┘  └────────────┘
         │ Step 1
         ▼
  ┌─────────────┐
  │ Basic Info  │  Fill restaurant details
  └──────┬──────┘
         │ Next
         ▼
  ┌─────────────┐
  │ Review      │  Confirm info
  └──────┬──────┘
         │ Submit
         ▼
  ┌─────────────┐
  │ Success     │  Auto-redirect
  └──────┬──────┘
         │ 3 seconds
         ▼
  ┌─────────────┐
  │ /dashboard  │  Pending banner
  └─────────────┘
```

---

**Status:** ✅ **Ready to test!**

Run server and follow steps above. Report results with template!
