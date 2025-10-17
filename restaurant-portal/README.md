# FoodFast Restaurant Portal

Restaurant management portal built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ✅ **Authentication** - Secure login for restaurant owners
- 🍽️ **Menu Management** - Complete CRUD operations for menu items
- 📦 **Order Management** - Real-time order tracking and updates
- 📊 **Analytics Dashboard** - Revenue, sales, and performance metrics
- ⚙️ **Restaurant Settings** - Profile, hours, and configuration
- 📸 **Image Upload** - Integrated with Appwrite Storage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Appwrite project set up (see Phase 0 documentation)
- Database collections created

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your Appwrite credentials
```

3. **Run development server**:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the portal.

## Project Structure

```
restaurant-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── menu/           # Menu management
│   │   │   ├── orders/         # Order management
│   │   │   ├── analytics/      # Analytics
│   │   │   └── settings/       # Settings
│   │   ├── login/              # Login page
│   │   ├── register/           # Restaurant registration
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (redirect)
│   ├── components/             # React components
│   │   ├── layouts/            # Layout components
│   │   ├── forms/              # Form components
│   │   ├── ui/                 # UI components
│   │   └── providers/          # Context providers
│   ├── lib/                    # Library code
│   │   └── appwrite.ts         # Appwrite client config
│   ├── store/                  # Zustand stores
│   │   └── authStore.ts        # Authentication store
│   ├── types/                  # TypeScript types
│   │   └── index.ts            # Type definitions
│   └── config/                 # Configuration
│       └── index.ts            # App config
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Implementation

### 1. Authentication (#8)
- [x] Login page with email/password
- [x] Appwrite session management
- [x] Protected routes with authentication check
- [x] Auth state persistence with Zustand

### 2. Menu Management (#10)
- [ ] List all menu items with categories
- [ ] Create new menu items
- [ ] Edit existing items
- [ ] Delete items
- [ ] Toggle availability
- [ ] Image upload for items

### 3. Order Management (#11)
- [ ] Real-time order list
- [ ] Order detail view
- [ ] Status updates (confirm, preparing, ready, etc.)
- [ ] Order history and filtering

### 4. Analytics (#13)
- [ ] Revenue charts (daily, weekly, monthly)
- [ ] Top-selling items
- [ ] Order statistics
- [ ] Performance metrics

### 5. Restaurant Settings (#12)
- [ ] Restaurant profile management
- [ ] Operating hours configuration
- [ ] Contact information
- [ ] Delivery settings

## Environment Variables

See `.env.example` for required environment variables.

Key variables:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Appwrite API endpoint
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Your project ID
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` - Database ID
- Collection IDs for each collection type
- `NEXT_PUBLIC_APPWRITE_STORAGE_ID` - Storage bucket ID

## Development Workflow

1. Create a feature branch: `git checkout -b feature/[issue-number]-description`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create a Pull Request

## Phase 1 Issues Checklist

- [x] #7: Setup Next.js Restaurant Portal Project
- [ ] #8: Implement Authentication & Role Management
- [ ] #9: Create Restaurant Onboarding Flow
- [ ] #10: Build Menu Management (CRUD + Categories)
- [ ] #11: Implement Order Management Dashboard
- [ ] #12: Add Restaurant Profile & Settings
- [ ] #13: Create Analytics Dashboard (Revenue, Best Sellers)
- [ ] #14: Implement Image Upload for Menu Items

## Support

For issues or questions, refer to the main project documentation in `/docs`.

## License

This project is part of the FoodFast platform.
