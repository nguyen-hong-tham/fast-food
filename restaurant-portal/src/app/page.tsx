'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, restaurant } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'restaurant' && !restaurant) {
        // Restaurant owner without a restaurant → redirect to setup
        router.push('/setup');
      } else {
        // Authenticated with restaurant or other role → redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, restaurant, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
