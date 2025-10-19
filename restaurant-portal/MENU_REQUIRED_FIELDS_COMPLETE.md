# Menu Item Required Fields - Complete Implementation

## 📋 Database Schema (Appwrite)

Based on Appwrite Console screenshot, the `menu` collection has these **required** fields:

### Required Fields:
1. ✅ `name` - string (size: 200)
2. ✅ `description` - string (size: 2200)
3. ✅ `image_url` - string
4. ✅ `price` - number
5. ✅ `calories` - number (Min: 0, Max: 10000)
6. ✅ `protein` - number (Min: 5, Max: 10000)

### Optional Fields:
- `isAvailable` - boolean (default: true)
- `restaurantId` - relationship (One to many)
- `rating` - number (Min: 0, Max: 5)
- `stock` - number (Min: 0)
- `soldCount` - number
- `categoryId` - relationship (Many to one)
- `$createdAt` - datetime
- `$updatedAt` - datetime

## 🔧 Implementation

### 1. **Updated MenuItem Interface**

```typescript
// src/types/index.ts
export interface MenuItem {
  $id: string;
  restaurantId: string;
  name: string;              // ✅ Required
  description: string;       // ✅ Required
  price: number;             // ✅ Required
  category: string;          
  image_url: string;         // ✅ Required
  calories: number;          // ✅ Required: 0-10000
  protein: number;           // ✅ Required: 5-10000
  isAvailable: boolean;      // Default: true
  preparationTime: number;   
  rating?: number;           // Optional: 0-5
  stock?: number;            // Optional: Min 0
  soldCount?: number;        // Optional
  tags?: string[];           // Optional
  $createdAt: string;
  $updatedAt: string;
}
```

### 2. **Updated Form State**

```typescript
// MenuItemModal.tsx
const [formData, setFormData] = useState({
  name: item?.name || '',
  description: item?.description || '',
  price: item?.price || 0,
  calories: item?.calories || 100,      // ✅ Added with default
  protein: item?.protein || 10,         // ✅ Added with default
  category: item?.category || 'main_course',
  preparationTime: item?.preparationTime || 15,
  isAvailable: item?.isAvailable ?? true,
  tags: item?.tags?.join(', ') || '',
});
```

### 3. **Updated Submission Data**

```typescript
const data = {
  restaurantId,
  name: formData.name,
  description: formData.description,
  price: Number(formData.price),
  calories: Number(formData.calories),    // ✅ Added
  protein: Number(formData.protein),      // ✅ Added
  category: formData.category,
  preparationTime: Number(formData.preparationTime),
  isAvailable: formData.isAvailable,
  tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
  image_url: imageUrl,
};
```

### 4. **New Form Fields**

```typescript
{/* Calories and Protein */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Calories (kcal) *
    </label>
    <input
      type="number"
      required
      min="0"
      max="10000"
      value={formData.calories}
      onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
      className="..."
      placeholder="250"
    />
    <p className="mt-1 text-xs text-gray-500">Energy content (0-10000 kcal)</p>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Protein (g) *
    </label>
    <input
      type="number"
      required
      min="5"
      max="10000"
      value={formData.protein}
      onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
      className="..."
      placeholder="15"
    />
    <p className="mt-1 text-xs text-gray-500">Protein content (5-10000g)</p>
  </div>
</div>
```

## ✅ Complete Form Fields

### Current Form Layout:

1. **Image Upload** (Required) ⭐
   - Visual upload area
   - Image preview
   - Validation warning

2. **Name** (Required) ⭐
   - Text input
   - Max 200 characters

3. **Description** (Required) ⭐
   - Textarea
   - Max 2200 characters

4. **Price** (Required) ⭐
   - Number input
   - Min: 0
   - Currency: VND (₫)

5. **Category** (Required) ⭐
   - Dropdown select
   - Options: Appetizers, Main Course, Desserts, Beverages, Sides

6. **Calories** (Required) ⭐ **NEW**
   - Number input
   - Min: 0, Max: 10000
   - Helper text

7. **Protein** (Required) ⭐ **NEW**
   - Number input
   - Min: 5, Max: 10000
   - Helper text

8. **Preparation Time** (Required) ⭐
   - Number input
   - Unit: minutes

9. **Availability** (Optional)
   - Checkbox
   - Default: checked

10. **Tags** (Optional)
    - Text input
    - Comma-separated

## 🎯 Validation Rules

### Frontend Validation:
```typescript
✅ Name: required, max 200 chars
✅ Description: required, max 2200 chars
✅ Image: required (for new items)
✅ Price: required, min 0
✅ Calories: required, min 0, max 10000
✅ Protein: required, min 5, max 10000
✅ Category: required, dropdown
✅ Preparation Time: required, number
✅ Availability: boolean (default true)
✅ Tags: optional, comma-separated
```

### Backend Validation (Appwrite):
- All required fields enforced by database schema
- Min/Max constraints checked
- Type validation (string, number, boolean)

## 📊 Testing Checklist

- [ ] **Create new menu item** with all required fields
- [ ] **Validate calories** - try < 0 and > 10000
- [ ] **Validate protein** - try < 5 and > 10000
- [ ] **Submit without image** - should show error
- [ ] **Submit without calories** - should show error
- [ ] **Submit without protein** - should show error
- [ ] **Edit existing item** - should load all fields
- [ ] **Update with new values** - should save correctly
- [ ] **View in menu list** - should display correctly

## 🚀 User Experience

### Visual Indicators:
- ✅ Red asterisk (*) on all required fields
- ✅ Helper text for min/max values
- ✅ Validation messages for errors
- ✅ Loading state during submission
- ✅ Success feedback after creation

### Default Values:
- Price: 0
- Calories: 100 (reasonable default)
- Protein: 10 (minimum allowed + 5)
- Category: Main Course
- Preparation Time: 15 minutes
- Availability: true (checked)

## 💡 Best Practices Implemented

1. **Clear Labels** - All fields have descriptive labels
2. **Required Indicators** - Red asterisks for required fields
3. **Helper Text** - Min/max ranges shown below inputs
4. **Sensible Defaults** - Reasonable starting values
5. **Type Safety** - TypeScript interfaces match database
6. **Validation** - Both frontend HTML5 and backend Appwrite
7. **Error Messages** - Clear feedback for validation failures
8. **Responsive Layout** - Grid layout for better space usage

## 📝 Notes

- **Calories field**: Common range is 50-1000 kcal per dish, but max set to 10000 for flexibility
- **Protein field**: Minimum 5g ensures at least some protein content
- **Category**: Using string enum instead of relationship for simplicity
- **Image**: Uploaded to Appwrite Storage, URL stored in database
- **Tags**: Stored as comma-separated string, converted to array on submit

## 🔄 Migration Path

### For existing menu items without calories/protein:
1. Option 1: Set default values (calories: 100, protein: 10)
2. Option 2: Require manual update by restaurant owners
3. Option 3: Import nutrition data from external API

**Recommended**: Option 1 (default values) for backward compatibility.

## ⚠️ Breaking Changes

**For existing menu items:** Need to add `calories` and `protein` fields or set defaults.

**Database migration needed:** Update all existing documents to include these fields.
