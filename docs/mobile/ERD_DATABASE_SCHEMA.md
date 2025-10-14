# 📊 Entity Relationship Diagram (ERD) - Fastfood Deli

## 🎯 DATABASE SCHEMA - HIỆN TẠI & ĐỀ XUẤT

---

## 1️⃣ CORE SCHEMA (Đang có)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FASTFOOD DELI DATABASE                          │
└─────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━┓
┃     User      ┃
┣━━━━━━━━━━━━━━━┫
┃ PK: $id       ┃
┃    accountId  ┃
┃    name       ┃
┃    email      ┃
┃    avatar     ┃
┃    phone      ┃
┃    address_home       ┃
┃    address_work       ┃
┃    address_home_label ┃
┃    address_work_label ┃
┗━━━━━━━━━━━━━━━┛
       │
       │ 1
       │
       │ n
       ▼
┏━━━━━━━━━━━━━━━━━━━━┓
┃     orders         ┃  ⚠️ CẦN HOÀN THIỆN!
┣━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id            ┃
┃ FK: userId         ┃  ← Relationship to User
┃     items          ┃  ← JSON array
┃     total          ┃
┃     status         ┃  ← Enum
┃     deliveryAddress     ┃
┃     deliveryAddressLabel┃
┃     phone          ┃
┃     notes          ┃
┃     createdAt      ┃
┃     updatedAt      ┃
┗━━━━━━━━━━━━━━━━━━━━┛
```

---

```
┏━━━━━━━━━━━━━━━━━┓
┃   categories    ┃
┣━━━━━━━━━━━━━━━━━┫
┃ PK: $id         ┃
┃     name        ┃
┃     description ┃
┗━━━━━━━━━━━━━━━━━┛
       │
       │ 1
       │
       │ n
       ▼
┏━━━━━━━━━━━━━━━━━━━━━┓
┃        menu         ┃
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id             ┃
┃     name            ┃
┃     description     ┃
┃     image_url       ┃
┃     price           ┃
┃     rating          ┃
┃     calories        ┃
┃     protein         ┃
┃ FK: categories      ┃  ← Relationship (Many to One)
┗━━━━━━━━━━━━━━━━━━━━━┛
       │
       │ n
       │
       │ 1
       ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     menu_customizations        ┃  (Junction Table)
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id                        ┃
┃ FK: menu                       ┃  ← Relationship to menu
┃ FK: customizations             ┃  ← Relationship to customizations
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
       │
       │ 1
       │
       │ n
       ▼
┏━━━━━━━━━━━━━━━━━━━━━┓
┃   customizations    ┃
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id             ┃
┃     name            ┃
┃     price           ┃
┃     type            ┃  ← Enum (topping, side, size)
┗━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 2️⃣ FULL ERD WITH RELATIONSHIPS (Detailed)

```
                            ┌──────────────────┐
                            │      User        │
                            │  - $id (PK)      │
                            │  - accountId     │
                            │  - name          │
                            │  - email         │
                            │  - avatar        │
                            │  - phone         │
                            │  - addresses     │
                            └────────┬─────────┘
                                     │
                            1        │        n
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
               ┌──────────────────┐    ┌─────────────────┐
               │     orders       │    │  reviews        │ (Optional)
               │  - $id (PK)      │    │  - $id (PK)     │
               │  - userId (FK)   │    │  - userId (FK)  │
               │  - items (JSON)  │    │  - menuId (FK)  │
               │  - total         │    │  - rating       │
               │  - status        │    │  - comment      │
               │  - address       │    │  - createdAt    │
               │  - phone         │    └─────────────────┘
               │  - notes         │
               │  - createdAt     │
               └──────────────────┘


    ┌────────────────┐         ┌───────────────────────┐         ┌──────────────────┐
    │  categories    │────────►│       menu            │◄────────│ customizations   │
    │  - $id (PK)    │  1    n │  - $id (PK)           │ n    1  │  - $id (PK)      │
    │  - name        │         │  - name               │         │  - name          │
    │  - description │         │  - description        │         │  - price         │
    └────────────────┘         │  - image_url          │         │  - type (Enum)   │
                               │  - price              │         └──────────────────┘
                               │  - rating             │                 ▲
                               │  - calories           │                 │
                               │  - protein            │                 │
                               │  - categories (FK)    │                 │
                               └───────────┬───────────┘                 │
                                           │                             │
                                      n    │    1                        │
                                           │                             │
                                           ▼                             │
                             ┌─────────────────────────────┐            │
                             │  menu_customizations        │            │
                             │  (Junction Table)           │────────────┘
                             │  - $id (PK)                 │  1      n
                             │  - menu (FK)                │
                             │  - customizations (FK)      │
                             └─────────────────────────────┘
```

---

## 3️⃣ RELATIONSHIPS MATRIX

| From Collection | To Collection | Relationship Type | Cardinality | Foreign Key |
|----------------|---------------|-------------------|-------------|-------------|
| **User** | orders | One-to-Many | 1:n | orders.userId |
| **User** | reviews | One-to-Many | 1:n | reviews.userId |
| **User** | favorites | One-to-Many | 1:n | favorites.userId |
| **categories** | menu | One-to-Many | 1:n | menu.categories |
| **menu** | menu_customizations | One-to-Many | 1:n | menu_customizations.menu |
| **customizations** | menu_customizations | One-to-Many | 1:n | menu_customizations.customizations |
| **menu** | customizations | Many-to-Many | n:n | via menu_customizations |
| **menu** | reviews | One-to-Many | 1:n | reviews.menuId |

---

## 4️⃣ EXTENDED SCHEMA (Optional Collections)

### A. Reviews System
```
┏━━━━━━━━━━━━━━━━━━━━┓
┃     reviews        ┃
┣━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id            ┃
┃ FK: userId         ┃  → User
┃ FK: menuId         ┃  → menu
┃     rating         ┃  (1-5)
┃     comment        ┃
┃     createdAt      ┃
┗━━━━━━━━━━━━━━━━━━━━┛

Relationships:
- User (1) ─── (n) reviews
- menu (1) ─── (n) reviews
```

---

### B. Favorites System
```
┏━━━━━━━━━━━━━━━━━━━━┓
┃    favorites       ┃
┣━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id            ┃
┃ FK: userId         ┃  → User
┃ FK: menuId         ┃  → menu
┃     createdAt      ┃
┗━━━━━━━━━━━━━━━━━━━━┛

Relationships:
- User (1) ─── (n) favorites
- menu (1) ─── (n) favorites
```

---

### C. Coupons System
```
┏━━━━━━━━━━━━━━━━━━━━┓
┃     coupons        ┃
┣━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id            ┃
┃     code           ┃  (unique)
┃     discount       ┃
┃     discountType   ┃  (Enum: %, fixed)
┃     minOrder       ┃
┃     maxDiscount    ┃
┃     expiryDate     ┃
┃     isActive       ┃
┃     usageLimit     ┃
┃     usedCount      ┃
┗━━━━━━━━━━━━━━━━━━━━┛
```

---

### D. Notifications System
```
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃   notifications      ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id              ┃
┃ FK: userId           ┃  → User
┃     title            ┃
┃     message          ┃
┃     type             ┃  (Enum)
┃     isRead           ┃
┃ FK: relatedOrderId   ┃  → orders (optional)
┃     createdAt        ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

Relationships:
- User (1) ─── (n) notifications
- orders (1) ─── (n) notifications
```

---

### E. Order Tracking
```
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃   order_tracking     ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ PK: $id              ┃
┃ FK: orderId          ┃  → orders
┃     status           ┃  (Enum)
┃     location         ┃
┃     note             ┃
┃     timestamp        ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

Relationships:
- orders (1) ─── (n) order_tracking
```

---

## 5️⃣ DATA FLOW DIAGRAM

### Order Creation Flow:
```
User
  │
  │ (1) Browse Menu
  ▼
menu + categories
  │
  │ (2) Select Items + Customizations
  ▼
menu_customizations ─→ customizations
  │
  │ (3) Add to Cart (Local State)
  ▼
Cart (Zustand Store)
  │
  │ (4) Checkout
  ▼
Create Document in orders
  │
  │ items = JSON.stringify([
  │   {menuItemId, name, price, quantity, customizations}
  │ ])
  │
  ▼
orders.userId ─→ User (Relationship)
```

---

## 6️⃣ INDEXES (Recommended)

### User Collection:
```
- accountId (unique)
- email (unique)
```

### orders Collection:
```
- userId (key) ← For getUserOrders()
- status (key) ← For filtering
- createdAt (key, DESC) ← For sorting
```

### menu Collection:
```
- categories (key) ← For filtering by category
- name (fulltext) ← For search
```

### reviews Collection (if implemented):
```
- menuId (key) ← For getMenuReviews()
- userId (key) ← For getUserReviews()
```

---

## 7️⃣ CASCADE RULES

### On User Delete:
```
orders.userId → Set Null (keep order history)
reviews.userId → Cascade (delete user's reviews)
favorites.userId → Cascade (delete user's favorites)
```

### On menu Delete:
```
menu_customizations.menu → Cascade (delete relations)
reviews.menuId → Cascade (delete menu reviews)
favorites.menuId → Cascade (delete from favorites)
```

### On Category Delete:
```
menu.categories → Set Null (menu becomes uncategorized)
```

---

## 🎯 SUMMARY

### ✅ Implemented (Đã có):
- User
- menu
- categories
- customizations
- menu_customizations

### ⚠️ Needs Completion (Cần hoàn thiện):
- **orders** - Thiếu 10 attributes!

### 💡 Optional (Tùy chọn):
- reviews
- favorites
- coupons
- notifications
- order_tracking
- addresses
- payment_methods

---

## 📚 NORMALIZATION LEVEL

Current schema: **3NF (Third Normal Form)**

✅ **1NF**: No repeating groups
✅ **2NF**: No partial dependencies
✅ **3NF**: No transitive dependencies

**Junction Table** (menu_customizations) properly handles Many-to-Many relationship.

---

## 🔐 DATA INTEGRITY RULES

### Primary Keys:
- All tables have `$id` as PK (UUID)
- Auto-generated by Appwrite

### Foreign Keys:
- Enforced via Relationships
- Cascading deletes configured
- Referential integrity guaranteed

### Constraints:
- Required fields validated
- Enum values restricted
- Min/Max values on numbers
- String length limits

---

**Xem chi tiết implementation trong:**
- `HUONG_DAN_TAO_ORDERS_CO_HINH.md`
- `DATABASE_ANALYSIS_AND_RECOMMENDATIONS.md`
