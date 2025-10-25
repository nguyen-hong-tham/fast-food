# FoodFast Restaurant Portal (Vite + React)

This is the migrated version of the restaurant portal, rebuilt with **Vite + React + TypeScript** (matching the admin portal architecture).

## 🎯 Migration Status

### ✅ Completed
- ✅ Project structure and configuration (Vite, TypeScript, Tailwind CSS)
- ✅ Environment variables (.env with VITE_ prefix)
- ✅ Authentication store (Zustand with persistence)
- ✅ Appwrite integration (account, databases, storage)
- ✅ Login page
- ✅ Register page
- ✅ Setup page (2-step restaurant onboarding with location fields)
- ✅ Dashboard layout with sidebar navigation
- ✅ Protected routes and auth guards
- ✅ Basic dashboard page

### 🔄 TODO (To be migrated from Next.js version)
- ⏳ Full Menu page (add/edit/delete menu items)
- ⏳ Full Orders page (order management and status updates)
- ⏳ Full Analytics page (charts and statistics)
- ⏳ Full Settings page (restaurant info, location, logo, coverImage)
- ⏳ Additional shared components (modals, forms, etc.)

## 🚀 Tech Stack

- **Framework**: Vite 6.0.3
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.7.2
- **Routing**: React Router DOM 6.28.0
- **State Management**: Zustand 5.0.8
- **Styling**: Tailwind CSS 3.4.17
- **Backend**: Appwrite 16.0.2
- **Icons**: Lucide React 0.468.0

## 📦 Installation

```bash
cd restaurant-portal-react
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Server will start on: http://localhost:3001

## 🏗️ Build

```bash
npm run build
npm run preview
```

## 🔑 Environment Variables

Create a `.env` file (already exists) with:

```env
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_USERS_COLLECTION_ID=user
VITE_APPWRITE_RESTAURANTS_COLLECTION_ID=restaurants
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_ORDER_ITEMS_COLLECTION_ID=order_items
VITE_APPWRITE_PAYMENTS_COLLECTION_ID=payments
VITE_APPWRITE_REVIEWS_COLLECTION_ID=reviews
VITE_APPWRITE_STORAGE_ID=your_storage_id
```

## 📁 Project Structure

```
restaurant-portal-react/
├── src/
│   ├── pages/          # Page components (Login, Register, Setup, Dashboard, etc.)
│   ├── components/     # Reusable UI components (DashboardLayout, etc.)
│   ├── store/          # Zustand stores (authStore)
│   ├── lib/            # Appwrite client and utilities
│   ├── config/         # Configuration (environment variables)
│   ├── types/          # TypeScript interfaces
│   ├── App.tsx         # Main app with React Router
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── .env                # Environment variables
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies
```

## 🔐 Authentication Flow

1. **Login** (`/login`) - Email/password authentication
2. **Register** (`/register`) - Create account with restaurant owner role
3. **Setup** (`/setup`) - 2-step restaurant onboarding (only if no restaurant exists)
4. **Dashboard** (`/dashboard`) - Protected route (requires auth + restaurant)

## 🌟 Features

### Current Features
- ✅ Restaurant role-only access (other roles denied)
- ✅ Persistent auth state (localStorage)
- ✅ Restaurant location fields (latitude, longitude) for distance calculations
- ✅ Protected routes with redirect logic
- ✅ Setup flow for new restaurant owners
- ✅ Responsive sidebar navigation
- ✅ VND currency format (₫)

### Pending Migration
- Menu management (CRUD operations)
- Order management (status updates, details)
- Analytics dashboard (charts, statistics)
- Settings page (update restaurant info, images)

## 🔄 Differences from Next.js Version

| Feature | Next.js (Old) | Vite + React (New) |
|---------|---------------|-------------------|
| **Routing** | App Router (file-based) | React Router DOM |
| **SSR** | Yes | No (CSR) |
| **Env Prefix** | NEXT_PUBLIC_ | VITE_ |
| **Navigation** | useRouter (next/navigation) | useNavigate (react-router-dom) |
| **Link** | next/link | react-router-dom Link |
| **Port** | 3001 | 3001 |
| **Build Time** | Slower | Faster (Vite) |

## 📝 Migration Notes

- All currency displays use VND format: `toLocaleString('vi-VN')₫`
- Restaurant setup requires latitude/longitude (default: HCMC coordinates)
- Logo and coverImage use URL inputs (not file uploads)
- Auth persists user + restaurant to prevent redirect loops
- React Router v6 patterns used throughout

## 🐛 Known Issues

- TypeScript module resolution errors in VS Code (false positives - files exist and work at runtime)
- These will resolve after TypeScript server restart or IDE reload

## 📚 Next Steps

1. Migrate remaining pages (Menu, Orders, Analytics, Settings) from Next.js version
2. Test all CRUD operations for menu items
3. Test order status updates
4. Verify location-based features work with mobile app
5. Add comprehensive error handling and loading states
6. Consider adding more UI components from shadcn/ui or similar

## 🤝 Contributing

When migrating components from the old Next.js version:

1. Remove `'use client'` directive (not needed in Vite)
2. Change `useRouter` from `next/navigation` to `useNavigate` from `react-router-dom`
3. Change `<Link href>` to `<Link to>`
4. Update import paths to use `@/` alias
5. Test authentication flow
6. Verify VND currency format
7. Ensure responsive design

---

Built with ❤️ using Vite + React + TypeScript
