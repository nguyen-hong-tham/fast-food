import { useState, useEffect } from 'react';
import { databases, client } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Plane, Battery, MapPin, Clock, Package, RefreshCw } from 'lucide-react';
import { startDeliverySimulation } from '../lib/drone-delivery-simulator';

interface Order {
  $id: string;
  userId: string;
  restaurantId: any;
  total: number;
  status: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  droneId?: string;
  $createdAt: string;
}

interface Drone {
  $id: string;
  code: string;
  name: string;
  model: string;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  batteryLevel: number;
  currentLatitude?: number;
  currentLongitude?: number;
  homeLatitude?: number;
  homeLongitude?: number;
  maxPayload: number;
  currentPayload: number;
  maxRange: number;
}

interface DroneWithDistance extends Drone {
  distance: number;
  score: number;
}

export default function AssignDronePage() {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [availableDrones, setAvailableDrones] = useState<Drone[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchReadyOrders();
    fetchAvailableDrones();
    
    // Subscribe to realtime updates for orders
    const channel = `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID}.documents`;
    
    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = client.subscribe(channel, (response) => {
        try {
          const payload = response.payload as any;
          
          // If an order status changed to 'ready' and has no drone assigned
          if (payload?.status === 'ready' && !payload?.droneId) {
            console.log('New order ready for delivery:', payload.$id);
            
            // Show notification
            setNewOrderAlert(`New order #${payload.$id.slice(-8).toUpperCase()} ready for delivery!`);
            setTimeout(() => setNewOrderAlert(null), 5000);
            
            // Play notification sound (optional)
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUqjk77RgGwU7k9r0yHUpBSl+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBSh+zPLaizsKGGS56+mjUBELTKXh8LdjHAU2jdXzxnkpBQ==');
              audio.volume = 0.3;
              audio.play().catch(() => {}); // Silently fail if audio not allowed
            } catch (e) {
              // Ignore audio errors
            }
            
            fetchReadyOrders(); // Refresh the list
          }
          
          // If an order got assigned a drone or status changed from 'ready'
          if (payload?.droneId || payload?.status !== 'ready') {
            console.log('Order assigned or status changed:', payload.$id);
            fetchReadyOrders(); // Refresh the list
            fetchAvailableDrones(); // Also refresh drones (one became busy)
          }
        } catch (error) {
          console.error('Error processing order update:', error);
        }
      });
      
      console.log('Subscribed to order updates');
    } catch (error) {
      console.error('Error subscribing to orders:', error);
    }
    
    // Poll every 30 seconds as backup (increased from 10s)
    const interval = setInterval(() => {
      fetchReadyOrders();
      fetchAvailableDrones();
    }, 30000);
    
    return () => {
      clearInterval(interval);
      try {
        if (unsubscribe) {
          unsubscribe();
          console.log('Unsubscribed from order updates');
        }
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    };
  }, []);

  const fetchReadyOrders = async () => {
    try {
      setError(null);
      console.log('🔍 Fetching ready orders...');
      
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID,
        [
          Query.equal('status', 'ready'),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );
      
      console.log('📦 All ready orders from DB:', response.documents.length);
      
      // Filter out orders that already have a drone assigned (client-side)
      // Handle droneId as string, object (relationship), or null/undefined
      const ordersWithoutDrone = response.documents.filter((order: any) => {
        let hasDrone = false;
        
        if (order.droneId) {
          // If droneId is an object (relationship), check for $id
          if (typeof order.droneId === 'object' && order.droneId.$id) {
            hasDrone = true;
          }
          // If droneId is a string, check if it's not empty
          else if (typeof order.droneId === 'string' && order.droneId.trim() !== '') {
            hasDrone = true;
          }
        }
        
        console.log(`Order ${order.$id}: droneId=`, order.droneId, `hasDrone=${hasDrone}`);
        return !hasDrone;
      });
      
      console.log('✅ Orders ready for drone assignment:', ordersWithoutDrone.length);
      setReadyOrders(ordersWithoutDrone as any);
    } catch (error: any) {
      console.error('❌ Error fetching ready orders:', error);
      setError(`Failed to fetch orders: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableDrones = async () => {
    try {
      setError(null);
      const dronesCollectionId = import.meta.env.VITE_APPWRITE_DRONES_COLLECTION_ID;
      
      if (!dronesCollectionId) {
        throw new Error('VITE_APPWRITE_DRONES_COLLECTION_ID is not defined in .env file');
      }

      console.log('🔍 Fetching drones from collection:', dronesCollectionId);
      
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        dronesCollectionId,
        [
          Query.equal('status', 'available'),
          Query.greaterThanEqual('batteryLevel', 30),
          Query.limit(50)
        ]
      );
      
      console.log('✅ Fetched drones:', response.documents.length);
      setAvailableDrones(response.documents as any);
    } catch (error: any) {
      console.error('❌ Error fetching drones:', error);
      
      // More detailed error message
      if (error.code === 401) {
        setError('Authentication required. Please sign in again.');
      } else if (error.code === 403) {
        setError('Permission denied. Check collection permissions in Appwrite Console.');
      } else {
        setError(`Failed to fetch drones: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchReadyOrders(),
        fetchAvailableDrones()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate drone score for smart assignment
  const calculateDroneScore = (drone: Drone, order: Order): number => {
    const restaurantLat = typeof order.restaurantId === 'object' 
      ? order.restaurantId.latitude 
      : 10.762622;
    const restaurantLon = typeof order.restaurantId === 'object'
      ? order.restaurantId.longitude
      : 106.660172;

    const distance = calculateDistance(
      drone.currentLatitude || restaurantLat,
      drone.currentLongitude || restaurantLon,
      restaurantLat,
      restaurantLon
    );

    // Scoring weights
    const distanceScore = (1 / (distance + 1)) * 100 * 0.4;
    const batteryScore = drone.batteryLevel * 0.3;
    const payloadScore = ((drone.maxPayload - drone.currentPayload) / drone.maxPayload) * 100 * 0.2;
    const availabilityScore = (drone.status === 'available' ? 100 : 0) * 0.1;

    return distanceScore + batteryScore + payloadScore + availabilityScore;
  };

  // Get drones with distances for selected order
  const getDronesForOrder = (order: Order): DroneWithDistance[] => {
    const restaurantLat = typeof order.restaurantId === 'object' 
      ? order.restaurantId.latitude 
      : 10.762622;
    const restaurantLon = typeof order.restaurantId === 'object'
      ? order.restaurantId.longitude
      : 106.660172;

    return availableDrones.map(drone => {
      const distance = calculateDistance(
        drone.currentLatitude || restaurantLat,
        drone.currentLongitude || restaurantLon,
        restaurantLat,
        restaurantLon
      );
      
      const score = calculateDroneScore(drone, order);
      
      return { ...drone, distance, score };
    }).sort((a, b) => b.score - a.score); // Sort by best score first
  };

  // Manual assign selected drone
  const handleManualAssign = async (orderId: string, droneId: string) => {
    await assignDrone(orderId, droneId, 'manual');
  };

  // Core assignment function
  const assignDrone = async (
    orderId: string, 
    droneId: string, 
    type: 'auto' | 'manual'
  ) => {
    setIsAssigning(true);
    try {
      console.log(`🚁 Assigning drone ${droneId} to order ${orderId} (${type})`);

      // Get order details for simulation
      const order = readyOrders.find(o => o.$id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Get drone details for hub location
      const drone = availableDrones.find(d => d.$id === droneId);
      if (!drone) {
        throw new Error('Drone not found');
      }

      const restaurantLat = typeof order.restaurantId === 'object' 
        ? order.restaurantId.latitude 
        : 10.762622;
      const restaurantLng = typeof order.restaurantId === 'object'
        ? order.restaurantId.longitude
        : 106.660172;

      // Get hub location - use drone's home position, or current position, or default
      const hubLat = drone.homeLatitude || drone.currentLatitude || 10.762622;
      const hubLng = drone.homeLongitude || drone.currentLongitude || 106.660172;
      console.log('📍 Drone hub location:', hubLat, hubLng);

      // 1. Update order - assign drone AND change status to 'delivering'
      console.log('📝 Updating order with droneId:', droneId, typeof droneId);
      try {
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID,
          orderId,
          {
            droneId: droneId, // Just the ID string for relationship
            status: 'delivering', // ✅ Change status so order leaves "ready" list
            assignedAt: new Date().toISOString(),
          }
        );
        console.log('✅ Order updated successfully - status changed to delivering');
      } catch (orderError: any) {
        console.error('❌ Failed to update order:', orderError.message);
        throw orderError;
      }

      // 2. Update drone status only (skip assignedOrderId to avoid relationship issues)
      console.log('📝 Updating drone status...');
      try {
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_DRONES_COLLECTION_ID,
          droneId,
          {
            status: 'busy'
            // Removed assignedOrderId and location - may cause relationship errors
          }
        );
        console.log('✅ Drone updated successfully');
      } catch (droneError: any) {
        console.error('❌ Failed to update drone:', droneError.message);
        // Don't throw - order already updated, continue with simulation
      }

      // 3. Create drone event - DISABLED due to relationship issues
      // TODO: Fix drone events collection schema or remove relationship constraints

      // 4. 🚀 Start delivery simulation automatically
      const customerLat = order.deliveryLatitude || 10.75;
      const customerLng = order.deliveryLongitude || 106.65;
      
      console.log('🚀 Starting delivery simulation...');
      console.log(`📍 Route: Hub(${hubLat.toFixed(4)}, ${hubLng.toFixed(4)}) → Restaurant(${restaurantLat.toFixed(4)}, ${restaurantLng.toFixed(4)}) → Customer(${customerLat.toFixed(4)}, ${customerLng.toFixed(4)})`);
      
      try {
        startDeliverySimulation(
          orderId,
          droneId,
          restaurantLat,
          restaurantLng,
          customerLat,
          customerLng,
          hubLat,
          hubLng,
          (simulation) => {
            console.log(`📍 Drone ${simulation.phase} - Progress: ${simulation.progress.toFixed(0)}%`);
          },
          () => {
            console.log('✅ Delivery completed!');
          }
        );
        console.log('✅ Simulation started successfully');
      } catch (simError) {
        console.error('❌ Error starting simulation:', simError);
      }

      alert(`✅ Drone ${type === 'manual' ? 'manually' : 'automatically'} assigned successfully!\n\n🚁 Simulation will start when customer opens tracking.\nYou can monitor drone on the Drones page.`);
      
      // Refresh lists
      await fetchReadyOrders();
      await fetchAvailableDrones();
      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Error assigning drone:', error);
      alert(`Failed to assign drone: ${error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const getTimeSinceReady = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-orange-500" />
                Assign Delivery Drones
              </h1>
              <p className="text-gray-600 mt-2">
                Orders ready for delivery • Select drone manually for each order
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-2xl font-bold text-orange-500">
                  {readyOrders.length}
                </span>
                <span className="text-sm text-gray-600 ml-2">Ready Orders</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-2xl font-bold text-green-500">
                  {availableDrones.length}
                </span>
                <span className="text-sm text-gray-600 ml-2">Available Drones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                
                {error.includes('Permission denied') && (
                  <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800">
                    <p className="font-semibold mb-2">🔧 How to fix permissions:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Go to Appwrite Console → Databases → Your Database</li>
                      <li>Click on "drones" collection → Settings → Permissions</li>
                      <li>Add permission: Role: Any → Read ✓, Create ✓, Update ✓, Delete ✓</li>
                      <li>Or add role "users" with full permissions</li>
                      <li>Save and refresh this page</li>
                    </ol>
                  </div>
                )}
                
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-600 hover:text-red-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* New Order Alert */}
        {newOrderAlert && (
          <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-lg p-4 shadow-lg animate-pulse">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-green-900">🔔 New Order Alert</h3>
                <p className="mt-1 text-sm font-medium text-green-800">{newOrderAlert}</p>
              </div>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="flex-shrink-0 text-green-600 hover:text-green-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* No orders message */}
        {readyOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Orders Ready
            </h3>
            <p className="text-gray-600">
              Orders will appear here when restaurants mark them as ready for delivery.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {readyOrders.map(order => {
              const dronesForOrder = getDronesForOrder(order);
              const isExpanded = selectedOrder?.$id === order.$id;

              return (
                <div
                  key={order.$id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Order #{order.$id.slice(-8).toUpperCase()}
                          </h3>
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            READY
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getTimeSinceReady(order.$createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {order.deliveryAddress.slice(0, 50)}...
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {order.total.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedOrder(isExpanded ? null : order)}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Plane className="w-5 h-5" />
                        {isExpanded ? 'Hide Drones' : 'Select Drone to Assign'}
                      </button>
                    </div>

                    {/* Expanded: Show available drones */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Plane className="w-5 h-5 text-primary" />
                          Available Drones ({dronesForOrder.length})
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            - Sorted by best match (distance, battery, payload)
                          </span>
                        </h4>

                        {dronesForOrder.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No drones available at the moment
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {dronesForOrder.slice(0, 5).map((drone, index) => (
                              <div
                                key={drone.$id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    {index === 0 && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                                        BEST
                                      </span>
                                    )}
                                    <span className="font-semibold text-gray-900">
                                      {drone.code} - {drone.name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {drone.distance.toFixed(1)} km away
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Battery className="w-4 h-4" />
                                      {drone.batteryLevel}%
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Score: {drone.score.toFixed(0)}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    if (confirm(`Assign drone ${drone.code} to this order?\n\nDrone: ${drone.name}\nDistance: ${drone.distance.toFixed(1)}km\nBattery: ${drone.batteryLevel}%`)) {
                                      handleManualAssign(order.$id, drone.$id);
                                    }
                                  }}
                                  disabled={isAssigning}
                                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                                >
                                  <Plane className="w-4 h-4" />
                                  Assign This Drone
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
