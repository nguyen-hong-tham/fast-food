import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, ID } from '@/lib/appwrite';
import { config } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Store } from 'lucide-react';

export default function SetupRestaurantPage() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: user?.email || '',
    latitude: 10.762622,
    longitude: 106.660172,
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!user?.accountId) {
        throw new Error('User not authenticated');
      }

      console.log('Creating restaurant');
      console.log('User accountId:', user.accountId);
      console.log('User document ID:', user.$id);

      // If ownerId is a relationship field in Appwrite, use user.$id (document ID)
      // If ownerId is a string field, use user.accountId
      const ownerIdValue = user.$id; // Use document ID for relationship

      // Create restaurant document with all required fields
      const newRestaurant = await databases.createDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        ID.unique(),
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          ownerId: ownerIdValue,
          latitude: formData.latitude,
          longitude: formData.longitude,
          isActive: true,
          rating: 1,
        }
      );

      console.log('Restaurant created:', newRestaurant.$id);
      console.log('Restaurant ownerId:', newRestaurant.ownerId);

      // Refresh auth to load the new restaurant
      await checkAuth();
      
      alert('Restaurant setup successful! Your restaurant is pending admin approval.');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to setup restaurant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Store className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Setup Your Restaurant</h1>
          <p className="mt-2 text-gray-600">
            Welcome! Let's get your restaurant registered on FoodFast.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
              placeholder="e.g., Banh Mi Saigon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
              placeholder="Tell customers about your restaurant..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="0901234567"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
              placeholder="123 Nguyen Hue, District 1, Ho Chi Minh City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Coordinates
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Get coordinates from Google Maps (right-click → copy coordinates)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="e.g., 10.762622"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="e.g., 106.660172"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> After submission, your restaurant will be pending admin approval. 
              You can complete additional details (logo, cover image, business info) in Settings after approval.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Store className="w-5 h-5 mr-2" />
                Setup Restaurant
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
