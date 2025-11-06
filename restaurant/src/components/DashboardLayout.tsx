import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Store
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, restaurant, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu',     href: '/dashboard/menu', icon: UtensilsCrossed },
    { name: 'Orders',   href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Analytics',href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-primary-500 to-secondary-500">
            <Store className="w-8 h-8 text-white mr-2" />
            <span className="text-xl font-bold text-white">FoodFast</span>
          </div>

          {/* Restaurant Info */}
          {restaurant && (
            <div className="p-4 border-b bg-orange-50">
              <p className="text-sm font-semibold text-gray-900">{restaurant.name}</p>
              <p className="text-xs text-gray-600">{user?.name || 'Restaurant Owner'}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
