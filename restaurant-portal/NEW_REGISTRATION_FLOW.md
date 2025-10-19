# ✅ NEW REGISTRATION FLOW - Simplified Setup

> **Date:** October 19, 2025  
> **Version:** 2.0 - Simplified Registration

---

## 🎯 **Thay đổi quan trọng:**

### **Trước đây:**
```
Đăng ký → Fill cả account info + restaurant info (2 steps) → Login → Dashboard
```

### **Bây giờ:**
```
Đăng ký → Chỉ fill account info → Login → Setup Restaurant → Dashboard
```

---

## 🚀 **New Registration Flow:**

### **Phase 1: Account Registration** (Public)
```
1. User visits /register
2. Fill form:
   - Owner Name
   - Email
   - Password
   - Confirm Password
3. Click "Create Account"
4. System creates:
   ✅ Appwrite Auth account
   ✅ User document (role: 'restaurant')
   ❌ NO restaurant document yet
5. Redirect to /login
```

### **Phase 2: Login** (Public)
```
1. User visits /login
2. Enter credentials
3. Login successful
4. Check: Does user have restaurant?
   - NO → Redirect to /setup
   - YES → Redirect to /dashboard
```

### **Phase 3: Restaurant Setup** (After Login)
```
1. User redirected to /setup
2. See: "Welcome! Let's set up your restaurant"
3. Fill Step 1 - Basic Info:
   - Restaurant Name
   - Description
   - Address
   - Phone
   - Cuisine Types
4. Click "Next Step"
5. Step 2 - Review & Confirm
6. Click "Submit for Review"
7. System creates:
   ✅ Restaurant document (status: 'pending')
8. Show success screen
9. Auto-redirect to /dashboard after 3 seconds
```

### **Phase 4: Dashboard** (After Setup)
```
1. User sees dashboard
2. Dashboard checks restaurant status:
   - pending → Yellow banner "Pending Approval"
   - approved → Blue banner "Complete your profile"
   - rejected → Red banner with reason
   - active → Normal dashboard
```

---

## 📂 **Files Modified:**

### **1. `/app/register/page.tsx`** - Simplified
```typescript
// ❌ REMOVED:
- Step 2 form (restaurant details)
- Restaurant data state
- Restaurant document creation
- Progress bar (2 steps)

// ✅ KEPT:
- Step 1 form (account info only)
- User account creation
- User document creation
- Redirect to /login

// ✅ NEW:
- Single form (no steps)
- Button: "Create Account" (not "Next Step")
- Alert: "Please login and setup your restaurant"
```

### **2. `/app/setup/page.tsx`** - NEW PAGE
```typescript
// ✅ PURPOSE:
- Restaurant setup after login
- 2-step wizard
- Create restaurant document
- Submit for admin approval

// ✅ FEATURES:
- Step 1: Basic Info form
- Step 2: Review & Confirm
- Step 3: Success screen + auto-redirect
- Protected route (requires login)
- Redirects to /dashboard if already has restaurant
```

### **3. `/app/dashboard/page.tsx`** - Updated
```typescript
// ✅ CHANGES:
- New check: If no restaurant → Show "Set Up Restaurant" CTA
- Button redirects to /setup
- Better UI with icon and centered layout

// ❌ REMOVED:
- Old "No Restaurant Found" text-only message
```

---

## 🎨 **User Experience:**

### **Scenario 1: New User Registration**

**Step 1: Register Account**
```
Visit: http://localhost:3000/register

See: Simple form with 4 fields
  - Owner Name
  - Email
  - Password
  - Confirm Password

Fill and submit
↓
Alert: "Registration successful! Please login and setup your restaurant."
↓
Redirect to: /login
```

**Step 2: Login**
```
Visit: /login (auto-redirected)

Enter:
  - Email
  - Password

Login
↓
System checks: User has restaurant?
  - NO → Redirect to /setup
```

**Step 3: Setup Restaurant**
```
Visit: /setup (auto-redirected)

See: "Welcome to FoodFast! 🎉"
     "Let's set up your restaurant"

Step 1: Fill Basic Info
  - Restaurant Name: Cơm Sườn Ngon
  - Description: Cơm sườn thơm ngon...
  - Address: 123 Nguyễn Thị Thập, Q7
  - Phone: 0999111991
  - Cuisine: Vietnamese, Asian

Click: "Next Step"
↓
Step 2: Review & Confirm
  - Shows all info entered
  - Info box: "What happens next?"

Click: "Submit for Review"
↓
Step 3: Success Screen
  - "Restaurant Created Successfully! 🎉"
  - "Your restaurant has been submitted for review"
  - "Redirecting to dashboard..."
  
After 3 seconds:
↓
Redirect to: /dashboard
```

**Step 4: Dashboard**
```
Visit: /dashboard (auto-redirected)

See: Yellow banner
  "Pending Approval"
  "Your restaurant is under review..."
  "Complete your profile in Settings"
```

---

### **Scenario 2: Existing User Login**

```
Visit: /login
↓
Login
↓
System checks: User has restaurant?
  - YES → Redirect to /dashboard
  - NO → Redirect to /setup
```

---

## 🔒 **Route Protection:**

### **Public Routes:**
- `/register` - Anyone can access
- `/login` - Anyone can access

### **Protected Routes (Require Login):**
- `/setup` - Requires login, no restaurant
- `/dashboard` - Requires login
- `/settings` - Requires login
- `/menu` - Requires login
- `/orders` - Requires login

### **Route Logic:**
```typescript
// In /setup
if (!user) → redirect to /login
if (restaurant) → redirect to /dashboard

// In /dashboard
if (!user) → redirect to /login
if (!restaurant) → show "Set Up Restaurant" CTA

// In /register
if (user && !restaurant) → redirect to /setup
if (user && restaurant) → redirect to /dashboard
```

---

## 📊 **Database Changes:**

### **User Collection:**
```
Created during: /register
Fields:
  - accountId (link to Auth)
  - email
  - name
  - role: 'restaurant'
```

### **Restaurant Collection:**
```
Created during: /setup (AFTER login)
Fields:
  - name
  - ownerId (link to User)
  - address
  - phone
  - email
  - latitude, longitude
  - status: 'pending'
  - description (optional)
  - cuisineType (optional)
```

---

## ✅ **Benefits of New Flow:**

1. **Simpler Registration**
   - Only 4 fields to register
   - Faster user onboarding
   - Lower barrier to entry

2. **Better UX**
   - One task at a time
   - Clear next steps
   - Progressive disclosure

3. **Authenticated Setup**
   - Restaurant setup happens AFTER login
   - More secure
   - Can save progress (future enhancement)

4. **Flexible**
   - User can logout after registration
   - Can complete setup later
   - Can skip setup temporarily

---

## 🧪 **Testing Guide:**

### **Test 1: Full Registration Flow**
```bash
1. Visit /register
2. Fill: Name, Email, Password
3. Click "Create Account"
4. Should redirect to /login
5. Login with credentials
6. Should redirect to /setup
7. Fill restaurant info (Step 1)
8. Click "Next Step"
9. Review info (Step 2)
10. Click "Submit for Review"
11. See success screen
12. Auto-redirect to /dashboard
13. See "Pending Approval" banner
```

### **Test 2: Login Without Restaurant**
```bash
1. User already registered but didn't complete setup
2. Visit /login
3. Login
4. Should redirect to /setup
5. Complete setup
6. Should redirect to /dashboard
```

### **Test 3: Login With Restaurant**
```bash
1. User already has restaurant
2. Visit /login
3. Login
4. Should redirect to /dashboard directly
5. Should NOT see /setup page
```

---

## 📋 **Checklist:**

Registration:
- [ ] Can register with just account info
- [ ] No restaurant fields in registration
- [ ] Redirects to /login after success

Login:
- [ ] Can login successfully
- [ ] Redirects to /setup if no restaurant
- [ ] Redirects to /dashboard if has restaurant

Setup:
- [ ] Can access /setup after login
- [ ] Step 1: Fill basic info
- [ ] Step 2: Review info
- [ ] Step 3: Success + auto-redirect
- [ ] Restaurant document created with status='pending'

Dashboard:
- [ ] Shows "Set Up Restaurant" if no restaurant
- [ ] Shows "Pending Approval" banner after setup
- [ ] Can click "Settings" to update info

---

## 🚀 **What's Next:**

After completing setup:

1. **Settings Page** (`/settings`)
   - Update restaurant info
   - Add business license, tax code
   - Add bank account
   - Upload logo, cover image

2. **Menu Management** (`/menu`)
   - Add menu items
   - Set prices
   - Upload food images
   - Manage availability

3. **Order Management** (`/orders`)
   - View incoming orders
   - Accept/reject orders
   - Track order status

4. **Admin Approval** (Admin Portal)
   - Admin reviews restaurant
   - Approve or reject
   - Send email notification

---

## 📝 **Summary:**

**Old Flow:**
```
Register (Account + Restaurant) → Login → Dashboard
```

**New Flow:**
```
Register (Account Only) → Login → Setup Restaurant → Dashboard
```

**Benefits:**
- ✅ Simpler registration (4 fields vs 9 fields)
- ✅ Better UX (one task at a time)
- ✅ More secure (authenticated setup)
- ✅ More flexible (can skip setup temporarily)

---

**Status:** ✅ **IMPLEMENTED - Ready to Test!**
