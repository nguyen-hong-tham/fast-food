# 🚀 Quick Start Guide - Restaurant Portal

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] Node.js 18+ installed
- [ ] Appwrite account and project created
- [ ] All database collections from Phase 0 created
- [ ] Storage bucket created for images

---

## Step 1: Installation (2 minutes)

```powershell
# Navigate to restaurant portal
cd restaurant-portal

# Install dependencies
npm install
```

---

## Step 2: Environment Configuration (3 minutes)

1. **Copy the environment template**:
```powershell
cp .env.example .env.local
```

2. **Get your Appwrite credentials** from [Appwrite Console](https://cloud.appwrite.io):
   - Project ID
   - Database ID
   - All Collection IDs
   - Storage Bucket ID

3. **Edit `.env.local`** with your credentials:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here

# Collection IDs
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_RESTAURANTS_COLLECTION_ID=restaurants
NEXT_PUBLIC_APPWRITE_MENU_COLLECTION_ID=menu
NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID=orders
NEXT_PUBLIC_APPWRITE_ORDER_ITEMS_COLLECTION_ID=order_items
NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=payments
NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=reviews

# Storage
NEXT_PUBLIC_APPWRITE_STORAGE_ID=your_storage_bucket_id
```

---

## Step 3: Run Development Server (1 minute)

```powershell
npm run dev
```

Portal will be available at: **http://localhost:3001**

---

## Step 4: Create Your First Restaurant Account (5 minutes)

1. **Open the portal**: http://localhost:3001
2. **Click "Register your restaurant"**
3. **Fill in account information**:
   - Owner name
   - Email
   - Password (min 8 characters)
4. **Fill in restaurant details**:
   - Restaurant name
   - Description
   - Address
   - Phone
   - Cuisine types
5. **Submit registration**
6. **Login with your credentials**

---

## Step 5: Setup Your Restaurant (10 minutes)

### A. Configure Settings
1. Go to **Settings** page
2. Update operating hours for each day
3. Set delivery radius
4. Toggle restaurant active status
5. Click **Save Settings**

### B. Add Menu Items
1. Go to **Menu** page
2. Click **Add Menu Item**
3. Fill in:
   - Name
   - Description
   - Price
   - Category
   - Preparation time
   - Upload image (optional)
4. Click **Add Item**
5. Repeat for all menu items

---

## Step 6: Test the Portal (5 minutes)

### Dashboard
- [ ] View statistics
- [ ] Check recent orders

### Menu
- [ ] Add a menu item
- [ ] Edit a menu item
- [ ] Delete a menu item
- [ ] Toggle availability
- [ ] Search items
- [ ] Filter by category

### Orders
- [ ] View orders (if any)
- [ ] Update order status
- [ ] Filter by status

### Analytics
- [ ] View revenue chart
- [ ] Check order volume
- [ ] See category distribution
- [ ] View top items

### Settings
- [ ] Update restaurant info
- [ ] Change operating hours
- [ ] Adjust delivery radius

---

## Common Issues & Solutions

### Issue: "Cannot connect to Appwrite"
**Solution**: Check your `.env.local` file:
- Verify endpoint URL is correct
- Ensure project ID matches your Appwrite project
- Check database ID is correct

### Issue: "Collection not found"
**Solution**: Make sure all collections from Phase 0 are created in Appwrite with the correct IDs.

### Issue: "Image upload failed"
**Solution**: 
- Create a storage bucket in Appwrite
- Set correct permissions (read/write)
- Add bucket ID to `.env.local`

### Issue: "Port 3001 already in use"
**Solution**: 
```powershell
# Change port in package.json
"dev": "next dev -p 3002"
```

### Issue: TypeScript errors
**Solution**: These are normal during setup. Run `npm install` and start the dev server.

---

## Production Build

When ready for production:

```powershell
# Build the application
npm run build

# Start production server
npm start
```

---

## File Structure Quick Reference

```
restaurant-portal/
├── src/app/              # Pages & routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/           # Login page
│   └── register/        # Registration
├── src/components/      # Reusable components
├── src/lib/            # Utilities & Appwrite
├── src/store/          # State management
├── src/types/          # TypeScript types
└── src/config/         # Configuration
```

---

## Key Features at a Glance

| Feature | Page | What You Can Do |
|---------|------|-----------------|
| 📊 Dashboard | `/dashboard` | View stats, recent orders |
| 🍽️ Menu | `/dashboard/menu` | Add, edit, delete menu items |
| 📦 Orders | `/dashboard/orders` | Manage orders, update status |
| 📈 Analytics | `/dashboard/analytics` | View charts and performance |
| ⚙️ Settings | `/dashboard/settings` | Configure restaurant |

---

## Next Steps

After setup:
1. ✅ Add all your menu items with images
2. ✅ Configure your operating hours
3. ✅ Set your delivery radius
4. ✅ Activate your restaurant
5. ✅ Test order flow with mobile app (Phase 2)
6. ✅ Monitor analytics daily

---

## Support

Need help?
- 📖 Read `README.md` for detailed documentation
- 📖 Check `SETUP_COMPLETE.md` for completion status
- 📖 Review `/docs` folder for project documentation
- 🐛 Check GitHub Issues for known problems

---

## Congratulations! 🎉

Your Restaurant Portal is now set up and ready to use. Start managing your restaurant efficiently with FoodFast!

**Total Setup Time**: ~20-30 minutes  
**Status**: ✅ Ready for Phase 2 Integration

---

Last Updated: October 18, 2025
