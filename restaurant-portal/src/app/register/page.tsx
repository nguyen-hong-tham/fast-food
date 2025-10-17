'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, ID } from '@/lib/appwrite';
import { config } from '@/config';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
  });

  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    cuisineTypes: '',
  });

  const handleStep1Submit = (e: React.FormEvent) => {
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

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Create account
      await account.create(
        ID.unique(),
        accountData.email,
        accountData.password,
        accountData.ownerName
      );

      // Login
      await account.createEmailSession(accountData.email, accountData.password);

      // Get current user
      const user = await account.get();

      // Create user document
      await databases.createDocument(
        config.appwrite.databaseId,
        config.appwrite.usersCollectionId,
        user.$id,
        {
          email: accountData.email,
          name: accountData.ownerName,
          role: 'restaurant_owner',
        }
      );

      // Create restaurant document
      const restaurant = await databases.createDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        ID.unique(),
        {
          name: restaurantData.name,
          ownerId: user.$id,
          description: restaurantData.description,
          address: restaurantData.address,
          phone: restaurantData.phone,
          email: accountData.email,
          status: 'pending',
          cuisineTypes: restaurantData.cuisineTypes.split(',').map(t => t.trim()),
          latitude: 10.762622, // Default to Ho Chi Minh City
          longitude: 106.660172,
          deliveryRadius: 5,
          isActive: false,
          openingHours: {
            monday: { open: '09:00', close: '22:00' },
            tuesday: { open: '09:00', close: '22:00' },
            wednesday: { open: '09:00', close: '22:00' },
            thursday: { open: '09:00', close: '22:00' },
            friday: { open: '09:00', close: '22:00' },
            saturday: { open: '09:00', close: '22:00' },
            sunday: { open: '09:00', close: '22:00' },
          },
        }
      );

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">FoodFast</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Restaurant Registration</h2>
          <p className="mt-2 text-gray-600">
            Step {step} of 2: {step === 1 ? 'Account Information' : 'Restaurant Details'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-24 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`h-2 w-24 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Step 1: Account Information */}
        {step === 1 && (
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-4">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Link>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Restaurant Details */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={restaurantData.name}
                onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="My Amazing Restaurant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={restaurantData.description}
                onChange={(e) => setRestaurantData({ ...restaurantData, description: e.target.value })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell customers about your restaurant..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={restaurantData.address}
                onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123 Main Street, District 1, HCMC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={restaurantData.phone}
                onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0901234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Types * (comma-separated)
              </label>
              <input
                type="text"
                required
                value={restaurantData.cuisineTypes}
                onChange={(e) => setRestaurantData({ ...restaurantData, cuisineTypes: e.target.value })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Vietnamese, Asian, Fast Food"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                📋 Your restaurant will be reviewed by our team. You&apos;ll receive an email within 24-48 hours regarding approval status.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
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
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
