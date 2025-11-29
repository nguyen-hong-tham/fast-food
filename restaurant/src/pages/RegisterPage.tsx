import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account, databases, ID } from '@/lib/appwrite';
import { config } from '@/config';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render register form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (accountData.password !== accountData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (accountData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Step 0: Delete any existing sessions first
      try {
        await account.deleteSessions();
      } catch (cleanupError) {
        // Ignore if no sessions exist
        console.log('No existing sessions to clear');
      }

      // Step 1: Create Appwrite Auth account
      const newUser = await account.create(
        ID.unique(),
        accountData.email,
        accountData.password,
        accountData.ownerName
      );

      // Step 2: Create session
      await account.createEmailPasswordSession(accountData.email, accountData.password);

      // Step 3: Create user document in database
      await databases.createDocument(
        config.appwrite.databaseId,
        config.appwrite.usersCollectionId,
        ID.unique(),
        {
          accountId: newUser.$id,
          email: accountData.email,
          name: accountData.ownerName,
          role: 'restaurant',
        }
      );

      // Success - redirect to setup restaurant (session is kept)
      alert('Registration successful! Please setup your restaurant information.');
      navigate('/setup-restaurant');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">FoodFast</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Restaurant Owner Registration</h2>
          <p className="mt-2 text-gray-600">
            Create your account to manage your restaurant
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name *
              </label>
              <input
                type="text"
                required
                value={accountData.ownerName}
                onChange={(e) => setAccountData({ ...accountData, ownerName: e.target.value })}
                className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="owner@restaurant.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={accountData.password}
                onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={accountData.confirmPassword}
                onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-4">
              <Link
                to="/login"
                className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
