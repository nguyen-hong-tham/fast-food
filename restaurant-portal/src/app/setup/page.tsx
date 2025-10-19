'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { databases, ID } from '@/lib/appwrite';
import { config } from '@/config';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface RestaurantSetupData {
  // Basic Info (Step 1)
  name: string;
  description: string;
  address: string;
  phone: string;
  
  // Location (Step 2) - Can be added later with map picker
  latitude: number;
  longitude: number;
}

export default function SetupPage() {
  const router = useRouter();
  const { user, restaurant, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [setupData, setSetupData] = useState<RestaurantSetupData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    latitude: 10.762622, // Default: HCMC
    longitude: 106.660172,
  });

  // Check authentication and redirect logic
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // If authenticated and already has restaurant, redirect to dashboard
    if (!authLoading && isAuthenticated && restaurant) {
      router.push('/dashboard');
      return;
    }
  }, [authLoading, isAuthenticated, restaurant, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or already has restaurant
  if (!isAuthenticated || restaurant) {
    return null;
  }

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!user?.accountId) {
        throw new Error('User not found. Please login again.');
      }

      // Create restaurant document
      await databases.createDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        ID.unique(),
        {
          // Required fields (based on Appwrite schema)
          name: setupData.name,
          description: setupData.description,
          ownerId: user.accountId, // ✅ Use accountId to match query in authStore
          address: setupData.address,
          phone: setupData.phone,
          email: user.email,
          latitude: setupData.latitude,
          longitude: setupData.longitude,
          // status will use default value from Appwrite
        }
      );

      // Refresh auth store to load the new restaurant
      await checkAuth();

      // Success - show completion message
      setCurrentStep(3);
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Success - redirect after 3 seconds
  if (currentStep === 3) {
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-12 text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurant Created Successfully!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your restaurant <strong>{setupData.name}</strong> has been submitted for review.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700">
              <strong>What&apos;s next?</strong>
            </p>
            <p className="text-gray-600 mt-2">
              Our team will review your restaurant within 24-48 hours. You&apos;ll receive an email notification once approved.
            </p>
          </div>
          <p className="text-gray-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">FoodFast</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Set Up Your Restaurant</h2>
          <p className="mt-2 text-gray-600">
            Step {currentStep} of 2: {currentStep === 1 ? 'Basic Information' : 'Confirm & Submit'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-32 rounded-full ${currentStep >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`h-2 w-32 rounded-full ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={setupData.name}
                onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="e.g., Cơm Sườn Ngon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={setupData.description}
                onChange={(e) => setSetupData({ ...setupData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="Describe your restaurant and what makes it special..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be shown to customers when they browse restaurants
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={setupData.address}
                onChange={(e) => setSetupData({ ...setupData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="e.g., 123 Nguyễn Thị Thập, Quận 7, TP.HCM"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={setupData.phone}
                  onChange={(e) => setSetupData({ ...setupData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="0901234567"
                />
              </div>

            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Next Step
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Review & Submit */}
        {currentStep === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Review Your Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Restaurant Name</p>
                  <p className="font-medium text-gray-900">{setupData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{setupData.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">{setupData.description}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{setupData.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Your restaurant will be submitted for review</li>
                <li>Our team will review within 24-48 hours</li>
                <li>You&apos;ll receive an email notification</li>
                <li>Once approved, you can start adding menu items and receiving orders</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Restaurant...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit for Review
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
