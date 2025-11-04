import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Calendar, Mail, MapPin, Phone, Search, Store, Star, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Restaurant {
  $id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  rating?: number;
  totalOrders?: number;
  isActive?: boolean;
  openTime?: string;
  closeTime?: string;
  latitude?: number;
  longitude?: number;
  $createdAt: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  useEffect(() => {
    loadRestaurants();
  }, []);
  
  useEffect(() => {
    filterRestaurants();
  }, [searchQuery, restaurants]);
  
  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_RESTAURANTS_COLLECTION_ID || 'restaurants',
        [
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );
      setRestaurants(response.documents as any);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterRestaurants = () => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = restaurants.filter(
      restaurant =>
        restaurant.name?.toLowerCase().includes(query) ||
        restaurant.address?.toLowerCase().includes(query) ||
        restaurant.phone?.toLowerCase().includes(query) ||
        restaurant.email?.toLowerCase().includes(query)
    );
    setFilteredRestaurants(filtered);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Restaurants Management</h1>
          <p className="text-gray-500 mt-2">View and manage restaurant partners</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
            <p className="text-sm text-gray-500">Total Restaurants</p>
            <p className="text-3xl font-bold text-gray-800">{restaurants.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {restaurants.filter(r => r.isActive !== false).length}
            </p>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, address, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Restaurants Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {restaurants.length === 0 ? 'No restaurants found' : 'No restaurants match your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <div
              key={restaurant.$id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                  {restaurant.imageUrl ? (
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{restaurant.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      restaurant.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {restaurant.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    {restaurant.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3">
                {restaurant.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 break-all line-clamp-2">{restaurant.address}</p>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{restaurant.phone}</p>
                  </div>
                )}
                {restaurant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 truncate">{restaurant.email}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Joined {new Date(restaurant.$createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Restaurant Details</h2>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="h-64 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl overflow-hidden">
                {selectedRestaurant.imageUrl ? (
                  <img
                    src={selectedRestaurant.imageUrl}
                    alt={selectedRestaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-24 h-24 text-white opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Restaurant Name</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedRestaurant.name}</p>
                </div>
                
                {selectedRestaurant.description && (
                  <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{selectedRestaurant.description}</p>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedRestaurant.isActive !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRestaurant.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {selectedRestaurant.rating && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-semibold text-gray-800">
                        {selectedRestaurant.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
                
                {selectedRestaurant.totalOrders !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedRestaurant.totalOrders}</p>
                  </div>
                )}
                
                {(selectedRestaurant.openTime || selectedRestaurant.closeTime) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Operating Hours</p>
                    <p className="text-gray-700">
                      {selectedRestaurant.openTime || '09:00'} - {selectedRestaurant.closeTime || '22:00'}
                    </p>
                  </div>
                )}
                
                {selectedRestaurant.address && (
                  <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </p>
                    <p className="text-gray-700">{selectedRestaurant.address}</p>
                  </div>
                )}
                
                {selectedRestaurant.phone && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </p>
                    <p className="text-gray-700">{selectedRestaurant.phone}</p>
                  </div>
                )}
                
                {selectedRestaurant.email && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <p className="text-gray-700 truncate">{selectedRestaurant.email}</p>
                  </div>
                )}
                
                {(selectedRestaurant.latitude && selectedRestaurant.longitude) && (
                  <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Coordinates</p>
                    <p className="text-gray-700 font-mono text-sm">
                      {selectedRestaurant.latitude.toFixed(6)}, {selectedRestaurant.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
                
                <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined Date
                  </p>
                  <p className="text-gray-700">
                    {new Date(selectedRestaurant.$createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
