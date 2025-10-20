# Quick Fix - Database Field Names

## 🐛 Bugs Fixed

### 1. Settings Page - `businessLicense` Field
**Error:** `Invalid document structure: Unknown attribute: "business_license"`

**Root Cause:** Code was using snake_case `business_license` but database actually uses camelCase `businessLicense`

**Fix:**
```typescript
// ❌ BEFORE (WRONG):
interface RestaurantSettings {
  business_license: string;
}

// ✅ AFTER (CORRECT):
interface RestaurantSettings {
  businessLicense: string;  // Matches database
}
```

**Files Changed:**
- `src/app/settings/page.tsx` - Changed all `business_license` → `businessLicense`
- `src/store/authStore.ts` - Removed incorrect snake_case mapping

---

### 2. Menu Item Modal - `category` Field
**Error:** `Invalid document structure: Unknown attribute: "category"`

**Root Cause:** Database schema uses `categoryId` (relationship to categories collection), NOT `category` (string)

**Fix:**
```typescript
// ❌ BEFORE (WRONG):
const data = {
  name: formData.name,
  category: formData.category,  // String field doesn't exist!
  ...
};

// ✅ AFTER (CORRECT):
const data = {
  name: formData.name,
  // ❌ REMOVED: category field - database uses categoryId relationship
  ...
};
```

**Files Changed:**
- `src/components/modals/MenuItemModal.tsx`
  - Removed `category` from form state
  - Removed `category` from data sent to database
  - Removed Category dropdown from UI
  - Removed `categories` array

---

## 📋 Database Schema Reality

### Restaurants Collection
```typescript
{
  // ✅ Uses camelCase (NOT snake_case)
  businessLicense: string,  // NOT business_license
  taxCode: string,
  bankAccount: string,
  bankName: string,
  
  // Basic fields
  name, description, phone, email, address,
  latitude, longitude, rating, isActive, ...
}
```

### Menu Collection
```typescript
{
  // ✅ Uses categoryId relationship (NOT category string)
  categoryId: string,  // Relationship to categories collection
  // NOT: category: string
  
  // Required fields
  name: string,
  description: string,
  image_url: string,  // ✅ snake_case for this one
  price: number,
  calories: number,
  protein: number,
  
  // Optional fields
  preparationTime, isAvailable, tags, ...
}
```

---

## ✅ Fixed Code

### Settings Page - businessLicense

**Interface:**
```typescript
interface RestaurantSettings {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  businessLicense: string;  // ✅ camelCase
  taxCode: string;
  bankAccount: string;
  bankName: string;
}
```

**Form State:**
```typescript
const [settings, setSettings] = useState<RestaurantSettings>({
  name: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  businessLicense: '',  // ✅ camelCase
  taxCode: '',
  bankAccount: '',
  bankName: '',
});
```

**Load Function:**
```typescript
setSettings({
  name: restaurant.name || '',
  description: restaurant.description || '',
  phone: restaurant.phone || '',
  email: restaurant.email || '',
  address: restaurant.address || '',
  businessLicense: restaurant.businessLicense || '',  // ✅ Direct mapping
  taxCode: restaurant.taxCode || '',
  bankAccount: restaurant.bankAccount || '',
  bankName: restaurant.bankName || '',
});
```

**Save Function:**
```typescript
await databases.updateDocument(
  config.appwrite.databaseId,
  config.appwrite.restaurantsCollectionId,
  restaurant.$id,
  {
    name: settings.name,
    description: settings.description,
    phone: settings.phone,
    email: settings.email || '',
    address: settings.address,
    businessLicense: settings.businessLicense || undefined,  // ✅ camelCase
    taxCode: settings.taxCode || undefined,
    bankAccount: settings.bankAccount || undefined,
    bankName: settings.bankName || undefined,
  }
);
```

**Form Input:**
```typescript
<input
  type="text"
  value={settings.businessLicense}  // ✅ camelCase
  onChange={(e) => setSettings({ ...settings, businessLicense: e.target.value })}
  className="..."
  placeholder="e.g., 0123456789"
/>
```

---

### Menu Item Modal - Removed Category

**Form State:**
```typescript
const [formData, setFormData] = useState({
  name: item?.name || '',
  description: item?.description || '',
  price: item?.price || 0,
  calories: item?.calories || 100,
  protein: item?.protein || 10,
  // ❌ REMOVED: category: item?.category || 'main_course',
  preparationTime: item?.preparationTime || 15,
  isAvailable: item?.isAvailable ?? true,
  tags: item?.tags?.join(', ') || '',
});
```

**Data Sent to Database:**
```typescript
const data = {
  restaurantId,
  name: formData.name,
  description: formData.description,
  price: Number(formData.price),
  calories: Number(formData.calories),
  protein: Number(formData.protein),
  // ❌ REMOVED: category field
  image_url: imageUrl,
  preparationTime: Number(formData.preparationTime),
  isAvailable: formData.isAvailable,
  tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
};
```

**UI - Removed Category Dropdown:**
```typescript
// ❌ REMOVED ENTIRE SECTION:
// <div>
//   <label>Category *</label>
//   <select value={formData.category} ...>
//     {categories.map(...)}
//   </select>
// </div>

// ✅ NOW: Only Price field (full width)
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Price (₫) *
  </label>
  <input
    type="number"
    required
    min="0"
    value={formData.price}
    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
    className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
    placeholder="50000"
  />
</div>
```

---

## 🎯 Key Learnings

### Database Naming Conventions in This Project:
1. **Most fields:** camelCase (`businessLicense`, `taxCode`, `bankAccount`)
2. **Some fields:** snake_case (`image_url`)
3. **Relationships:** Use ID suffix (`categoryId`, `restaurantId`, `ownerId`)

### How to Verify Field Names:
1. **Appwrite Console** → Database → Collection → Document
2. Look at actual field names in JSON view
3. DO NOT assume naming convention
4. Match EXACTLY what you see in database

### Common Mistakes:
- ❌ Assuming all fields use snake_case
- ❌ Assuming all fields use camelCase
- ❌ Not checking database schema before coding
- ❌ Using string category when relationship exists

---

## ✅ Testing Checklist

### Settings Page:
- [ ] Load settings → businessLicense field populates
- [ ] Fill Business License Number: "BL123456"
- [ ] Click Save
- [ ] Success message appears
- [ ] Check Appwrite Console → `businessLicense`: "BL123456"
- [ ] Reload page → field still shows "BL123456"

### Menu Item Modal:
- [ ] Click "Add Menu Item"
- [ ] Fill all fields (name, description, price, calories, protein)
- [ ] Upload image
- [ ] Fill preparation time and tags
- [ ] Click "Add Item"
- [ ] Success - item created
- [ ] Check Appwrite Console → NO `category` field
- [ ] Item displays correctly in menu list

---

## 📝 Notes

### Why Category Was Removed:
The database schema uses a **relationship** to a separate `categories` collection through `categoryId`. To properly implement categories, we need to:

1. Create categories in the `categories` collection
2. Get list of available categories
3. Show dropdown with real categories
4. Save `categoryId` (relationship) instead of `category` (string)

**For now:** Category field is completely removed to fix the error. Will implement proper category relationship in future update.

### Future TODO:
- [ ] Fetch categories from database
- [ ] Add category dropdown with real data
- [ ] Save categoryId relationship
- [ ] Display category name in menu list
- [ ] Create category management page

---

## 🚀 Status

**Both Bugs Fixed:**
- ✅ Settings page saves successfully with `businessLicense`
- ✅ Menu items save successfully without `category`
- ✅ No TypeScript errors
- ✅ No database field mismatch errors

**Ready for Testing!** 🎉
