import { useAuthStore } from '@/store/authStore';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.name || 'Admin'}
          </h2>
          <p className="text-sm text-gray-500">
            Manage your restaurant from here
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
