# Mobile App - Grouped Menu by Category (Jollibee Style)

## ✅ Changes Made

### Problem Identified:
- ❌ Categories không hiển thị trong mobile app
- ❌ Menu items không được group theo category
- ❌ UI không giống ví dụ Jollibee (categories làm sections, không phải filter)

### Solution Implemented:
- ✅ **Grouped Menu Layout** - Mỗi category là 1 section riêng
- ✅ **Sticky Category Tabs** - Tabs luôn hiển thị khi scroll
- ✅ **Scroll to Section** - Click category tab → tự động scroll đến section đó
- ✅ **Count per category** - Hiển thị số lượng món trong mỗi category

---

## 🎨 New UI Structure (Giống Jollibee)

```
┌─────────────────────────────────────────┐
│  Restaurant Header                      │
├─────────────────────────────────────────┤
│  [Our Menu (12)] [Reviews (5)]         │  ← Tabs
├─────────────────────────────────────────┤
│  Category Filter (Sticky Header)        │
│  [All] [Pizza (3)] [Pasta (4)] [...]   │  ← Horizontal scroll
├─────────────────────────────────────────┤
│                                         │
│  ━━━ Pizza ━━━━━━━━━━━━━━━━━━━━━━━━━  │  ← Category Section
│  ┌────────┐  ┌────────┐               │
│  │Item 1  │  │Item 2  │               │
│  └────────┘  └────────┘               │
│  ┌────────┐                            │
│  │Item 3  │                            │
│  └────────┘                            │
│                                         │
│  ━━━ Pasta ━━━━━━━━━━━━━━━━━━━━━━━━  │  ← Category Section
│  ┌────────┐  ┌────────┐               │
│  │Item 4  │  │Item 5  │               │
│  └────────┘  └────────┘               │
│  ┌────────┐  ┌────────┐               │
│  │Item 6  │  │Item 7  │               │
│  └────────┘  └────────┘               │
│                                         │
│  ━━━ Uncategorized ━━━━━━━━━━━━━━━━  │  ← Section cho món chưa phân loại
│  ┌────────┐                            │
│  │Item 8  │                            │
│  └────────┘                            │
└─────────────────────────────────────────┘
```

---

## 📝 Code Changes

### File: `mobile/app/restaurant-detail.tsx`

#### 1. New State Variables

```typescript
// Old approach - flat filtering
const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);

// New approach - grouped by category
const [groupedMenu, setGroupedMenu] = useState<GroupedMenu[]>([]);
const scrollViewRef = useRef<ScrollView>(null);
const sectionRefs = useRef<{ [key: string]: number }>({});
```

#### 2. Group Menu Items Logic

```typescript
useEffect(() => {
  const grouped: GroupedMenu[] = [];
  
  // Group items by categories
  categories.forEach((category) => {
    const items = menuItems.filter((item: any) => {
      const categoryId = typeof item.categories === 'string' 
        ? item.categories 
        : item.categories.$id;
      return categoryId === category.$id;
    });

    if (items.length > 0) {
      grouped.push({
        categoryId: category.$id,
        categoryName: category.name,
        items,
      });
    }
  });

  // Add uncategorized items
  const uncategorized = menuItems.filter((item: any) => !item.categories);
  if (uncategorized.length > 0) {
    grouped.push({
      categoryId: 'uncategorized',
      categoryName: 'Uncategorized',
      items: uncategorized,
    });
  }

  setGroupedMenu(grouped);
}, [menuItems, categories]);
```

#### 3. Scroll to Category Function

```typescript
const scrollToCategory = (categoryId: string) => {
  setSelectedCategory(categoryId);
  
  if (categoryId === 'all') {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    return;
  }

  const yOffset = sectionRefs.current[categoryId];
  if (yOffset !== undefined) {
    scrollViewRef.current?.scrollTo({ y: yOffset - 100, animated: true });
  }
};
```

#### 4. Category Tabs UI (Sticky Header)

```typescript
<ScrollView 
  ref={scrollViewRef}
  stickyHeaderIndices={[1]} // Make category tabs sticky
>
  <RestaurantHeader />
  
  {/* Sticky Category Tabs */}
  <View className="bg-white py-4">
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <TouchableOpacity onPress={() => scrollToCategory('all')}>
        <Text>All Items</Text>
      </TouchableOpacity>
      
      {groupedMenu.map((group) => (
        <TouchableOpacity onPress={() => scrollToCategory(group.categoryId)}>
          <Text>{group.categoryName} ({group.items.length})</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
  
  {/* Grouped Menu Sections */}
  {groupedMenu.map((group) => (
    <View 
      key={group.categoryId}
      onLayout={(event) => {
        sectionRefs.current[group.categoryId] = event.nativeEvent.layout.y;
      }}
    >
      <Text className="text-2xl font-bold">{group.categoryName}</Text>
      {group.items.map((item) => (
        <MenuCard item={item} />
      ))}
    </View>
  ))}
</ScrollView>
```

---

## 🎯 Features Implemented

### 1. **Grouped Menu Display** ✅
- Mỗi category hiển thị như 1 section riêng biệt
- Section title to, bold (giống Jollibee)
- Menu items sắp xếp dưới category title

### 2. **Sticky Category Tabs** ✅
- Tabs luôn hiển thị ở top khi scroll
- Horizontal scrollable
- Active state highlighting
- Shows item count per category

### 3. **Scroll to Section** ✅
- Click category tab → auto scroll to that section
- Smooth animated scrolling
- Offset for header

### 4. **Uncategorized Items Handling** ✅
- Tự động group các món chưa có category
- Section "Uncategorized" ở cuối
- Không hiển thị nếu tất cả món đều có category

### 5. **Console Logging for Debug** ✅
```typescript
console.log('📂 Categories loaded:', data);
console.log('🍽️ Menu items loaded:', data);
console.log('📦 Grouped menu:', grouped);
```

---

## 🔍 Debugging Checklist

### Nếu categories không hiển thị:

1. **Check categories loaded:**
   - Open React Native Debugger
   - Check console for: `📂 Categories loaded:`
   - Verify data có items

2. **Check menu items loaded:**
   - Check console for: `🍽️ Menu items loaded:`
   - Verify items có field `categories`

3. **Check grouping:**
   - Check console for: `📦 Grouped menu:`
   - Verify groups được tạo đúng

4. **Check Appwrite relationship:**
   - Menu items phải có field `categories`
   - Value là string ID hoặc object có `$id`

---

## 📊 Data Flow

```
1. Load restaurant details
   ↓
2. Load categories (getRestaurantCategories)
   ↓  
3. Load menu items (getRestaurantMenu)
   ↓
4. Group menu items by category
   ├─ Loop through categories
   ├─ Filter items matching each category
   ├─ Create GroupedMenu objects
   └─ Add uncategorized items
   ↓
5. Render grouped sections
   ├─ Category tabs (sticky)
   └─ Category sections with items
   ↓
6. User clicks category tab
   ↓
7. Scroll to that section
```

---

## 🧪 Testing Steps

1. **Open mobile app** (Expo Go or development build)

2. **Navigate to restaurant detail** (click any restaurant)

3. **Verify categories loaded:**
   - Check console logs
   - Should see: `📂 Categories loaded: [...]`

4. **Check UI:**
   - ✅ Category tabs should appear below menu tab
   - ✅ Tabs should be horizontally scrollable
   - ✅ Should show "Pizza (2)", "Pasta (3)", etc.

5. **Click category tab:**
   - ✅ Should auto-scroll to that section
   - ✅ Tab should highlight

6. **Scroll manually:**
   - ✅ Category tabs should stick to top
   - ✅ Sections should appear in order

---

## 🐛 Common Issues & Solutions

### Issue 1: Categories not showing
**Cause**: Collection ID mismatch  
**Solution**: Check `.env` has correct `EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID`

### Issue 2: Items not grouped
**Cause**: Menu items missing `categories` field  
**Solution**: 
- Check menu items have relationship to categories
- Use restaurant portal to assign categories to menu items

### Issue 3: Scroll not working
**Cause**: Section refs not set  
**Solution**: 
- Check `onLayout` event is firing
- Verify `sectionRefs.current` has values

### Issue 4: "Uncategorized" showing for all items
**Cause**: `item.categories` is null/undefined  
**Solution**:
- Assign categories to menu items in restaurant portal
- Check Appwrite relationship is properly set

---

## 📱 Mobile .env Check

Ensure mobile app has categories collection ID:

```bash
# mobile/.env
EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=category
```

Note: Should match with what's in Appwrite Console!

---

## 🎉 Summary

### Before:
- ❌ Categories không hiển thị
- ❌ Menu items flat list
- ❌ Không thể scroll to category
- ❌ UI không giống Jollibee

### After:
- ✅ Categories hiển thị as sticky tabs
- ✅ Menu items grouped by category
- ✅ Click tab → scroll to section  
- ✅ UI giống Jollibee app
- ✅ Handles uncategorized items
- ✅ Shows count per category

---

**Version:** 2.0  
**Date:** November 8, 2025  
**Status:** ✅ Ready for Testing  
**File Changed:** `mobile/app/restaurant-detail.tsx` (backed up to `.backup.tsx`)
