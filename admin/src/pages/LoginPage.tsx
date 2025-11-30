import { useAuthStore } from '@/store/authStore';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Provide more specific error messages
      let errorMessage = '';
      
      if (err.message?.includes('Rate limit')) {
        errorMessage = '⚠️ Too many login attempts. Please wait 15-30 minutes and try again.\n\nIf you need immediate access, please contact support.';
      } else if (err.message?.includes('CORS') || err.message?.includes('blocked')) {
        errorMessage = '🔒 CORS Error: The admin portal URL is not configured in Appwrite.\n\nPlease add "localhost" (port 3002) to Platform Settings in Appwrite Console.';
      } else if (err.message?.includes('Access denied') || err.message?.includes('admin privileges')) {
        errorMessage = '🚫 Access Denied: This account does not have admin privileges.\n\nOnly admin accounts can access this portal.';
      } else if (err.message?.includes('Invalid credentials') || err.message?.includes('email or password')) {
        errorMessage = '❌ Invalid email or password. Please check your credentials and try again.';
      } else if (err.message?.includes('network') || err.message?.includes('Failed to fetch')) {
        errorMessage = '📡 Network Error: Unable to connect to the server.\n\nPlease check your internet connection.';
      } else {
        errorMessage = err.message || '❌ Login failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Fastfood Deli</h1>
          <p className="text-gray-500 mt-2">Admin Dashboard</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                
                {/* CORS Help */}
                {error.includes('CORS') && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">🔧 How to fix CORS error:</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://cloud.appwrite.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">Appwrite Console</a></li>
                      <li>Select your project → <strong>Settings</strong> → <strong>Platforms</strong></li>
                      <li>Click <strong>Add Platform</strong> → Choose <strong>Web App</strong></li>
                      <li>Enter: Hostname = <code className="bg-gray-100 px-1 rounded">localhost</code>, Port = <code className="bg-gray-100 px-1 rounded">3002</code></li>
                      <li>Save and refresh this page</li>
                    </ol>
                  </div>
                )}
                
                {/* Rate Limit Help */}
                {error.includes('Rate limit') && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">⏱️ What to do:</p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      <li>Wait 15-30 minutes before trying again</li>
                      <li>Clear browser cache and cookies</li>
                      <li>Avoid multiple rapid login attempts</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
        
        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            This is an admin-only area. Only users with admin privileges can access this dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
