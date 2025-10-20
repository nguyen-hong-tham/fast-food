# Settings Page - Field Mapping Fix

## 🐛 Issues Fixed

### 1. **Unknown Attribute: "operatingHours"**
- **Problem:** Code was trying to save `operatingHours` field that doesn't exist in database
- **Solution:** Removed entire Operating Hours section from settings page

### 2. **Email Field Clarity**
- **Problem:** Confusing - email used for login vs. restaurant contact email
- **Solution:** 
  - Made restaurant email **optional** (not required)
  - Changed label to "Restaurant Contact Email"
  - Added helper text: "Public contact email for customers (different from your login email)"

### 3. **Field Name Mismatch**
- **Problem:** Using `businessLicense` (camelCase) in code but database likely has `business_license` (snake_case)
- **Solution:** Updated all field references to use `business_license`

## 📋 Database Schema (Actual Fields)

Based on Appwrite Console screenshot, `restaurants` collection has:

### Required Fields:
- ✅ `name` - string
- ✅ `description` - string
- ✅ `address` - string  
- ✅ `phone` - string
- ✅ `email` - string
- ✅ `latitude` - number (required)
- ✅ `longitude` - number (required)

### Optional Fields:
- `business_license` - string (snake_case)
- `taxCode` - string
- `bankAccount` - string
- `bankName` - string
- `rating` - number
- `totalRevenue` - number
- `isActive` - boolean
- `approvedAt` - datetime
- `ownerId` - relationship (One to many)

### Fields NOT in Database:
- ❌ `operatingHours` - was trying to save this, causing error
- ❌ `logo` - might exist, need to verify
- ❌ `coverImage` - might exist, need to verify

## 🔧 Code Changes

### 1. Updated Interface

```typescript
// settings/page.tsx
interface RestaurantSettings {
  // Basic Info (from database)
  name: string;
  description: string;
  phone: string;
  email: string;  // Optional - restaurant contact email
  address: string;
  
  // Business Info (optional fields)
  business_license: string;  // ✅ Changed to snake_case
  taxCode: string;
  bankAccount: string;
  bankName: string;
  // ❌ Removed operatingHours
}
```

### 2. Updated Form State

```typescript
const [settings, setSettings] = useState<RestaurantSettings>({
  name: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  business_license: '',  // ✅ snake_case
  taxCode: '',
  bankAccount: '',
  bankName: '',
  // ❌ No operatingHours
});
```

### 3. Updated Load Function

```typescript
const loadRestaurantData = () => {
  if (!restaurant) return;

  setSettings({
    name: restaurant.name || '',
    description: restaurant.description || '',
    phone: restaurant.phone || '',
    email: restaurant.email || '',  // Restaurant contact email (optional)
    address: restaurant.address || '',
    business_license: restaurant.businessLicense || '',  // Map from camelCase
    taxCode: restaurant.taxCode || '',
    bankAccount: restaurant.bankAccount || '',
    bankName: restaurant.bankName || '',
    // ❌ No operatingHours mapping
  });
};
```

### 4. Updated Save Function

```typescript
await databases.updateDocument(
  config.appwrite.databaseId,
  config.appwrite.restaurantsCollectionId,
  restaurant.$id,
  {
    name: settings.name,
    description: settings.description,
    phone: settings.phone,
    email: settings.email || '',  // Optional
    address: settings.address,
    business_license: settings.business_license || undefined,  // Optional, snake_case
    taxCode: settings.taxCode || undefined,  // Optional
    bankAccount: settings.bankAccount || undefined,  // Optional
    bankName: settings.bankName || undefined,  // Optional
    // ❌ No operatingHours
  }
);
```

### 5. Updated Email Field UI

```typescript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Restaurant Contact Email
  </label>
  <input
    type="email"
    value={settings.email}
    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
    className="..."
    placeholder="Optional - for customer inquiries"
  />
  <p className="mt-1 text-xs text-gray-500">
    Public contact email for customers (different from your login email)
  </p>
</div>
```

### 6. Removed Operating Hours Section

```typescript
// ❌ REMOVED ENTIRE SECTION:
{/* Operating Hours */}
<div className="bg-white rounded-lg shadow p-6">
  <h2>Operating Hours</h2>
  {/* ... 60+ lines of operating hours UI ... */}
</div>
```

## 📊 Settings Page Sections (After Fix)

### 1. **Basic Information**
- Restaurant Name * (required)
- Description * (required)
- Phone Number * (required)
- Restaurant Contact Email (optional) ✨ NEW LABEL
- Address * (required)

### 2. **Business Information**
- Business License Number (optional)
- Tax Code (optional)
- Bank Account Number (optional)
- Bank Name (optional)

### 3. **Removed**
- ❌ Operating Hours section (entire 7-day week interface)

## ✅ Email Field Explanation

### Two Different Emails:

**1. Owner Login Email** (Account email)
- Used during registration: `/register`
- Stored in `User` collection
- Used for authentication/login
- Cannot be changed in settings (security)
- Example: `owner@personal.com`

**2. Restaurant Contact Email** (Business email)
- Optional field in settings: `/settings`
- Stored in `Restaurant` collection
- Public-facing contact for customers
- Can be different from login email
- Example: `contact@restaurant.com`
- Helper text explains this clearly ✅

## 🎯 User Experience

### Before Fix:
- ❌ Error: "Unknown attribute: operatingHours"
- ❌ Cannot save settings
- ❌ Confusing email field (which email?)
- ❌ Large operating hours UI taking space

### After Fix:
- ✅ Settings save successfully
- ✅ Clear email field with explanation
- ✅ Only fields that exist in database
- ✅ Cleaner, focused UI

## 🧪 Testing Checklist

- [ ] **Load settings page** → Should load without errors
- [ ] **Update basic info** → Should save successfully
- [ ] **Leave email empty** → Should work (optional)
- [ ] **Fill email** → Should save restaurant contact email
- [ ] **Update business info** → Should save optional fields
- [ ] **Check database** → Verify `business_license` saved correctly
- [ ] **No operatingHours error** → Confirmed fixed

## 📝 Notes

### Field Naming Convention:
- **TypeScript (code)**: `camelCase` → `businessLicense`
- **Database (Appwrite)**: `snake_case` → `business_license`
- Need to map between these in save/load functions

### Future Improvements:
1. **Add Operating Hours** - if needed, create proper database field first
2. **Add Logo/Cover Image** upload functionality
3. **Validate business fields** format (license number, tax code)
4. **Add timezone** selection for restaurant location

## ⚠️ Breaking Changes

**For existing code:**
- `operatingHours` field no longer supported in settings
- Email field is now optional (was required before)
- `businessLicense` → `business_license` in database calls

## 🔄 Migration Needed

**If adding Operating Hours in future:**
1. Create `operating_hours` field in Appwrite database (type: string or JSON)
2. Define proper schema/format
3. Add UI back to settings page
4. Update Restaurant interface
5. Add mapping in authStore

**Current Status:** Operating Hours feature removed completely to match database schema.
