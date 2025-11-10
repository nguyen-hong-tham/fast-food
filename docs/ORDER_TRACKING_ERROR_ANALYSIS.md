# 🔍 ORDER TRACKING ERROR ANALYSIS

## 📋 Tổng quan
Phân tích lỗi và vấn đề trong tính năng Order Tracking của mobile app FoodFast.

**Ngày phân tích:** November 9, 2025  
**File chính:** `mobile/app/order-tracking.tsx` (616 lines)  
**Components liên quan:**
- `mobile/components/tracking/DeliveryMap.tsx` (native)
- `mobile/components/tracking/DeliveryMap.web.tsx` (web)
- `mobile/components/tracking/StatusTimeline.tsx`
- `mobile/components/tracking/CountdownTimer.tsx`
- `mobile/lib/drone-simulator.ts`
- `mobile/lib/appwrite.ts`

---

## 🐛 CÁC LỖI ĐANG XẢY RA

### 1. **Text Rendering Error - React Native Web** ⚠️
**Severity:** HIGH  
**Platform:** Web only

#### Triệu chứng:
```
Error: Text strings must be rendered within a <Text> component
```

#### Nguyên nhân:
Trong file `order-tracking.tsx`, có nhiều nơi render text trực tiếp không wrap trong `<Text>`:

**Line 73 (loadOrder function):**
```tsx
if (!trackingOrderId) {
  setErrorMessage('Order not found');  // ⚠️ String assignment OK
  setLoading(false);
  return;
}
```
Đây không phải lỗi vì chỉ là assignment.

**Các vị trí có thể gây lỗi:**
1. **Template strings trong JSX** (nhiều nơi):
```tsx
{etaMinutes && `${minutes} - ${minutes + 4} mins`}
```
Phải wrap trong `<Text>`:
```tsx
{etaMinutes && <Text>{`${minutes} - ${minutes + 4} mins`}</Text>}
```

2. **Conditional rendering với string literals:**
```tsx
{order.status === 'delivered' ? 'Delivered' : 'Processing'}
```

#### Vị trí cụ thể cần sửa:
- Line 377-385: `getEtaText()` function return values
- Line 400-410: Debug overlay text rendering
- Line 420-430: Status cards với text
- Line 480-490: Drone phase descriptions

---

### 2. **Drone Simulation State Management Issues** 🚁
**Severity:** MEDIUM  
**Impact:** Drone position không update đúng, animation bị lag

#### Vấn đề:

**2.1. Multiple State Dependencies Causing Re-renders:**
```tsx
const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
const [hasRealtimeProgress, setHasRealtimeProgress] = useState(false);
const [currentPhase, setCurrentPhase] = useState<'to_restaurant' | 'to_customer' | 'idle'>('idle');
const [phaseProgress, setPhaseProgress] = useState<number>(0);
const [droneCoords, setDroneCoords] = useState<LatLng | null>(null);
const [dronePath, setDronePath] = useState<LatLng[]>([]);
const [etaMinutes, setEtaMinutes] = useState<number | undefined>(undefined);
const [countdownActive, setCountdownActive] = useState(false);
```

**Vấn đề:** 8 states riêng lẻ → 8 lần re-render cho mỗi update!

**2.2. useEffect Dependencies Conflict (Line 216-310):**
```tsx
useEffect(() => {
  if (!order) return;
  if (!restaurantCoords || !customerCoords) return;
  if (order.status === 'delivered' || order.status === 'cancelled') return;
  if (simulationState !== 'idle') return;  // ⚠️ Prevents re-simulation
  if (hasRealtimeProgress) return;         // ⚠️ Blocks simulation if realtime exists
  
  const shouldStartSimulation = 
    order.status === 'preparing' || 
    order.status === 'ready' || 
    order.status === 'delivering';
  
  if (!shouldStartSimulation) {
    console.log('⏸️ Simulation not triggered. Status:', order.status);
    return;
  }
  // ... simulation code
}, [order, restaurantCoords, customerCoords, simulationState, hasRealtimeProgress]);
```

**Vấn đề:**
- Nếu `hasRealtimeProgress = true`, simulation sẽ không bao giờ chạy lại
- Khi order status thay đổi từ `preparing` → `ready` → `delivering`, simulation không restart
- `simulationState` dependency tạo circular logic

---

### 3. **Map Rendering Issues - Platform Specific** 🗺️
**Severity:** MEDIUM  
**Platform:** Native (MapView) và Web (Fallback)

#### 3.1. Web Version - Limited Functionality:
```tsx
// DeliveryMap.web.tsx
const DeliveryMapWeb: React.FC<DeliveryMapProps> = ({
  restaurant, customer, drone, path = [], etaMinutes,
}) => {
  return (
    <View className="h-64 bg-gray-100 rounded-xl justify-center items-center border border-gray-200">
      <Text className="text-sm text-gray-600 text-center px-4">
        Map view is not available on web. Please use the mobile app for real-time tracking.
      </Text>
      {/* ... */}
    </View>
  );
};
```

**Vấn đề:**
- ❌ Không có map thực sự trên web
- ❌ Chỉ hiển thị tọa độ dạng text
- ❌ Không có visual tracking

**Giải pháp đề xuất:**
- Sử dụng Google Maps JavaScript API cho web
- Hoặc dùng Leaflet.js (open source alternative)
- Hoặc iframe embed Google Maps

#### 3.2. Native Version - Coordinate Fitting Issues:
```tsx
// DeliveryMap.tsx - Line 52-68
useEffect(() => {
  if (!mapRef.current) return;
  if (coordinates.length === 0) return;

  const timer = setTimeout(() => {
    try {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
        animated: true,
      });
    } catch (error) {
      console.warn('Failed to fit coordinates:', error);
    }
  }, 500);  // ⚠️ Fixed delay - không responsive

  return () => clearTimeout(timer);
}, [coordinates]);
```

**Vấn đề:**
- Fixed 500ms delay có thể không đủ nếu map load chậm
- `fitToCoordinates` có thể fail silent
- Không có retry mechanism

---

### 4. **Real-time Subscription Race Conditions** 🔄
**Severity:** HIGH  
**Impact:** Order updates và drone events có thể bị miss hoặc duplicate

#### 4.1. Order Subscription (Line 152-174):
```tsx
useEffect(() => {
  if (!trackingOrderId) return;

  let isSubscribed = true;

  const unsubscribe = subscribeToOrder(trackingOrderId, (updated) => {
    if (!isSubscribed) return;
    
    try {
      setOrder((prev) => {
        const merged = { ...(prev || {}), ...updated } as Order;
        setItems(parseOrderItems(merged.items));  // ⚠️ Side effect in setState
        return merged;
      });
    } catch (error) {
      console.error('Error processing order update:', error);
    }
  });

  return () => {
    isSubscribed = false;
    try {
      unsubscribe?.();
    } catch (error) {
      console.error('Error unsubscribing from order:', error);
    }
  };
}, [trackingOrderId]);
```

**Vấn đề:**
- `setItems()` được gọi bên trong `setOrder()` callback → 2 state updates không atomic
- Race condition: `items` có thể outdated so với `order`
- Memory leak potential: unsubscribe có thể fail silent

#### 4.2. Drone Events Subscription (Line 176-214):
```tsx
useEffect(() => {
  if (!trackingOrderId) return;

  let isSubscribed = true;

  const unsubscribe = subscribeToDroneEvents(trackingOrderId, (event) => {
    if (!isSubscribed) return;
    
    try {
      if (event.latitude && event.longitude) {
        const coordinate = { latitude: event.latitude, longitude: event.longitude };
        setDroneCoords(coordinate);  // ⚠️ Update 1
        setDronePath((prev) => [...prev, coordinate]);  // ⚠️ Update 2
        setHasRealtimeProgress(true);  // ⚠️ Update 3 - blocks simulation!
      }

      if (event.eventType === 'landing') {
        setCountdownActive(false);  // ⚠️ Update 4
        setEtaMinutes(0);  // ⚠️ Update 5
      }
    } catch (error) {
      console.error('Error processing drone event:', error);
    }
  });

  return () => {
    isSubscribed = false;
    try {
      unsubscribe?.();
    } catch (error) {
      console.error('Error unsubscribing from drone events:', error);
    }
  };
}, [trackingOrderId]);
```

**Vấn đề nghiêm trọng:**
- 5 state updates trong 1 callback → 5 re-renders!
- `setDronePath((prev) => [...prev, coordinate])` có thể grow infinitely
- `setHasRealtimeProgress(true)` blocks simulation permanently (không reset khi cần)
- No error boundary cho subscription failures

---

### 5. **ETA Calculation Conflicts** ⏰
**Severity:** MEDIUM  
**Impact:** ETA display không consistent

#### Multiple ETA Sources:
```tsx
// Source 1: From simulation progress (Line 275-278)
const remainingTime = Math.max(0, (1 - progress) * (SIMULATION_DURATION / 60000));
setEtaMinutes(remainingTime);

// Source 2: From order.estimatedDeliveryTime (Line 311-315)
useEffect(() => {
  if (!order?.estimatedDeliveryTime) return;
  const etaMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
  setEtaMinutes(Math.max(0, etaMs / 60000));
}, [order?.estimatedDeliveryTime]);

// Source 3: From deliveryCalc hook (Line 373-376)
if (deliveryCalc?.estimatedTime) {
  const minutes = Math.floor(deliveryCalc.estimatedTime);
  return `${minutes} - ${minutes + 4} mins`;
}

// Source 4: Fallback hardcoded (Line 378)
return '19 - 23 mins';
```

**Vấn đề:**
- 4 nguồn ETA khác nhau → confusing logic
- Không có priority clear: Which source takes precedence?
- `order.estimatedDeliveryTime` có thể outdated (set lúc order creation)
- Simulation ETA và real ETA không sync

---

### 6. **Memory Leaks và Performance Issues** 💾

#### 6.1. Infinite Array Growth:
```tsx
setDronePath((prev) => [...prev, coordinate]);  // No limit!
```

Nếu simulation chạy 60s với 1.5s interval:
- 60 / 1.5 = 40 waypoints × 2 phases = 80 coordinates
- Mỗi coordinate = 2 floats (lat, lng) = 16 bytes
- Total: ~1.3KB per tracking session
- Với 1000 users: 1.3MB RAM + re-render cost

**Vấn đề:** Path array không bao giờ được clear, chỉ grow mãi

#### 6.2. Timer Cleanup Issues:
```tsx
// drone-simulator.ts - Line 105-122
for (let i = 0; i < waypointsToRestaurant.length; i += 1) {
  const point = waypointsToRestaurant[i];
  const progress = (i + 1) / waypointsToRestaurant.length;
  const speed = 45;

  await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
    orderId, speed,
    batteryLevel: Math.max(20, Math.floor(drone.batteryLevel - 0.3 * (i + 1))),
    altitude: 50,
  });

  onProgress?.({ 
    coordinate: point, 
    progress: progress * 0.3,
    phase: 'to_restaurant' 
  });

  await sleep(phase1Duration / phase1Steps);  // ⚠️ No cancellation!
}
```

**Vấn đề:**
- Simulation loop không có abort signal
- Nếu user navigate away, simulation vẫn chạy ngầm
- Database updates vẫn fire → waste resources
- `isMounted` flag (line 258) không được pass vào simulator

---

### 7. **Geocoding Fallback Chain Issues** 📍
**Severity:** LOW-MEDIUM  
**Impact:** Customer location có thể không chính xác

```tsx
// Line 110-148
useEffect(() => {
  if (!order?.deliveryAddress) return;

  let isActive = true;

  (async () => {
    try {
      // Try 1: Geocode address
      const geocoded = await Location.geocodeAsync(order.deliveryAddress);
      if (geocoded.length > 0 && isActive) {
        setCustomerCoords({ latitude: geocoded[0].latitude, longitude: geocoded[0].longitude });
        return;
      }
    } catch (err) {
      console.warn('Geocode failed, falling back to user location', err);
    }

    try {
      // Try 2: Get current position
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === 'granted') {
        const position = await Location.getCurrentPositionAsync({});
        if (isActive) {
          setCustomerCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
        return;
      }
    } catch (err) {
      console.warn('Location permission denied or not available', err);
    }

    // Try 3: Default coordinate
    if (isActive) {
      setCustomerCoords(DEFAULT_COORDINATE);  // ⚠️ Saigon center
    }
  })();

  return () => {
    isActive = false;
  };
}, [order?.deliveryAddress]);
```

**Vấn đề:**
1. Geocoding có thể sai nếu địa chỉ không chuẩn (typo, thiếu quận/thành phố)
2. Fallback về current location không hợp lý: User có thể ở nơi khác lúc track order
3. DEFAULT_COORDINATE (Trung tâm Sài Gòn) hoàn toàn không liên quan đến order
4. Không có caching: Mỗi lần component re-mount → geocode lại
5. No retry với exponential backoff

---

### 8. **Status Update Race Conditions** 🔄
**Severity:** MEDIUM  
**Impact:** UI status không sync với backend

#### Conflict giữa subscription và simulation:
```tsx
// Subscription updates order status (Line 158-165)
setOrder((prev) => {
  const merged = { ...(prev || {}), ...updated } as Order;
  setItems(parseOrderItems(merged.items));
  return merged;
});

// Simulation ALSO updates order status (drone-simulator.ts Line 127-134)
await databases.updateDocument(
  appwriteConfig.databaseId,
  appwriteConfig.ordersCollectionId,
  orderId,
  {
    status: 'ready',
    readyAt: new Date().toISOString(),
  }
);
```

**Scenario gây lỗi:**
1. Simulation set status = `ready` at T0
2. Appwrite subscription delay → arrives at T0+500ms
3. Meanwhile, user manually refresh → sees old status
4. Subscription callback fires → overwrites with old data
5. UI flickers: `preparing` → `ready` → `preparing` → `ready`

**Root cause:** No version control hoặc timestamp-based conflict resolution

---

## 🎯 HƯỚNG GIẢI QUYẾT

### Priority 1: Fix Critical Rendering Errors (Web)

#### Solution 1.1: Wrap all text in `<Text>` components
```tsx
// ❌ BEFORE
{etaMinutes && `${minutes} - ${minutes + 4} mins`}

// ✅ AFTER
{etaMinutes && <Text>{`${minutes} - ${minutes + 4} mins`}</Text>}
```

**Files to fix:**
- `order-tracking.tsx`: Lines 377, 385, 420, 430, 480, 490

#### Solution 1.2: Create reusable text formatter
```tsx
const SafeText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <Text className={className}>{children}</Text>;
};

// Usage
<SafeText className="text-sm text-gray-600">{getEtaText()}</SafeText>
```

---

### Priority 2: Refactor State Management

#### Solution 2.1: Consolidate simulation states với useReducer
```tsx
type SimulationState = {
  status: 'idle' | 'running' | 'completed';
  droneCoords: LatLng | null;
  dronePath: LatLng[];
  currentPhase: 'to_restaurant' | 'to_customer' | 'idle';
  phaseProgress: number;
  etaMinutes?: number;
  countdownActive: boolean;
  hasRealtimeProgress: boolean;
};

type SimulationAction =
  | { type: 'START_SIMULATION'; payload: { droneBaseCoords: LatLng; initialETA: number } }
  | { type: 'UPDATE_DRONE_POSITION'; payload: { coordinate: LatLng; progress: number; phase: string; eta: number } }
  | { type: 'COMPLETE_SIMULATION' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'RECEIVE_REALTIME_EVENT'; payload: { coordinate: LatLng; eventType?: string } };

const simulationReducer = (state: SimulationState, action: SimulationAction): SimulationState => {
  switch (action.type) {
    case 'START_SIMULATION':
      return {
        ...state,
        status: 'running',
        droneCoords: action.payload.droneBaseCoords,
        dronePath: [action.payload.droneBaseCoords],
        etaMinutes: action.payload.initialETA,
        countdownActive: true,
        currentPhase: 'to_restaurant',
      };
    
    case 'UPDATE_DRONE_POSITION':
      return {
        ...state,
        droneCoords: action.payload.coordinate,
        dronePath: [...state.dronePath, action.payload.coordinate].slice(-100), // Keep last 100 points
        currentPhase: action.payload.phase as any,
        phaseProgress: action.payload.progress * 100,
        etaMinutes: action.payload.eta,
      };
    
    case 'RECEIVE_REALTIME_EVENT':
      return {
        ...state,
        hasRealtimeProgress: true,
        droneCoords: action.payload.coordinate,
        dronePath: [...state.dronePath, action.payload.coordinate].slice(-100),
        ...(action.payload.eventType === 'landing' && {
          countdownActive: false,
          etaMinutes: 0,
        }),
      };
    
    case 'COMPLETE_SIMULATION':
      return {
        ...state,
        status: 'completed',
        countdownActive: false,
        etaMinutes: 0,
      };
    
    case 'RESET_SIMULATION':
      return {
        status: 'idle',
        droneCoords: null,
        dronePath: [],
        currentPhase: 'idle',
        phaseProgress: 0,
        etaMinutes: undefined,
        countdownActive: false,
        hasRealtimeProgress: false,
      };
    
    default:
      return state;
  }
};

// Usage
const [simulation, dispatchSimulation] = useReducer(simulationReducer, {
  status: 'idle',
  droneCoords: null,
  dronePath: [],
  currentPhase: 'idle',
  phaseProgress: 0,
  etaMinutes: undefined,
  countdownActive: false,
  hasRealtimeProgress: false,
});
```

**Benefits:**
- ✅ 8 states → 1 state object → 1 re-render per update
- ✅ Atomic updates (all related states change together)
- ✅ Easier to debug (action log)
- ✅ Path array auto-limited to 100 points

---

### Priority 3: Fix Real-time Subscription Issues

#### Solution 3.1: Batch state updates
```tsx
useEffect(() => {
  if (!trackingOrderId) return;

  let isSubscribed = true;
  let updateQueue: DroneEvent[] = [];
  let flushTimer: NodeJS.Timeout | null = null;

  const flushUpdates = () => {
    if (updateQueue.length === 0) return;
    
    // Batch process all queued events
    const lastEvent = updateQueue[updateQueue.length - 1]; // Take latest
    
    if (lastEvent.latitude && lastEvent.longitude) {
      dispatchSimulation({
        type: 'RECEIVE_REALTIME_EVENT',
        payload: {
          coordinate: { latitude: lastEvent.latitude, longitude: lastEvent.longitude },
          eventType: lastEvent.eventType,
        },
      });
    }
    
    updateQueue = [];
  };

  const unsubscribe = subscribeToDroneEvents(trackingOrderId, (event) => {
    if (!isSubscribed) return;
    
    updateQueue.push(event);
    
    // Debounce: Flush after 100ms of no new events
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushUpdates, 100);
  });

  return () => {
    isSubscribed = false;
    if (flushTimer) clearTimeout(flushTimer);
    flushUpdates(); // Flush remaining
    try {
      unsubscribe?.();
    } catch (error) {
      console.error('Error unsubscribing from drone events:', error);
    }
  };
}, [trackingOrderId]);
```

**Benefits:**
- ✅ Multiple events in quick succession → 1 state update
- ✅ Reduces re-renders by ~80%
- ✅ Smoother animation (no jitter from individual updates)

#### Solution 3.2: Add error boundary
```tsx
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Caught error:', error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) return <>{fallback}</>;
  return <>{children}</>;
};

// Usage
<ErrorBoundary 
  fallback={
    <View className="flex-1 items-center justify-center">
      <Text className="text-red-500">Something went wrong with tracking</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-blue-500 mt-4">Go Back</Text>
      </TouchableOpacity>
    </View>
  }
>
  <DeliveryMap {...mapProps} />
</ErrorBoundary>
```

---

### Priority 4: Improve ETA Logic

#### Solution 4.1: Single source of truth với priority system
```tsx
const getEtaMinutes = (): number | undefined => {
  // Priority 1: Live simulation ETA (most accurate during active delivery)
  if (simulation.status === 'running' && simulation.etaMinutes !== undefined) {
    return simulation.etaMinutes;
  }
  
  // Priority 2: Real-time drone event ETA
  if (simulation.hasRealtimeProgress && order?.estimatedDeliveryTime) {
    const etaMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
    return Math.max(0, etaMs / 60000);
  }
  
  // Priority 3: Delivery calculation from coordinates
  if (deliveryCalc?.estimatedTime) {
    return deliveryCalc.estimatedTime;
  }
  
  // Priority 4: Order's stored estimate
  if (order?.estimatedDeliveryTime) {
    const etaMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
    return Math.max(0, etaMs / 60000);
  }
  
  // Priority 5: Fallback default
  return 20; // 20 minutes default
};

const getEtaText = () => {
  const minutes = getEtaMinutes();
  if (minutes === undefined) return 'Calculating...';
  
  const min = Math.floor(minutes);
  const max = min + 4;
  return `${min} - ${max} mins`;
};
```

---

### Priority 5: Add Simulation Cancellation

#### Solution 5.1: AbortController pattern
```tsx
// drone-simulator.ts
export const simulateDroneFlight = async ({
  orderId,
  restaurantCoords,
  customerCoords,
  droneId,
  duration = 60000,
  phase = 'full',
  onProgress,
  abortSignal, // NEW parameter
}: SimulationOptions & { abortSignal?: AbortSignal }) => {
  const drone = await ensureDrone(orderId, droneId);
  
  const checkAbort = () => {
    if (abortSignal?.aborted) {
      throw new Error('Simulation aborted');
    }
  };
  
  // Phase 1
  for (let i = 0; i < waypointsToRestaurant.length; i += 1) {
    checkAbort(); // Check before each step
    
    const point = waypointsToRestaurant[i];
    // ... existing code
    await sleep(phase1Duration / phase1Steps);
  }
  
  // Phase 2
  checkAbort();
  for (let i = 0; i < waypointsToCustomer.length; i += 1) {
    checkAbort();
    // ... existing code
  }
};

// order-tracking.tsx
useEffect(() => {
  // ... existing checks
  
  const abortController = new AbortController();
  let isMounted = true;

  simulateDroneFlight({
    orderId: order.$id,
    restaurantCoords,
    customerCoords,
    droneId: order.droneId,
    duration: SIMULATION_DURATION,
    abortSignal: abortController.signal, // Pass signal
    onProgress: ({ coordinate, progress, phase }) => {
      if (!isMounted) return;
      // ... existing code
    },
  })
    .then(() => {
      if (!isMounted) return;
      dispatchSimulation({ type: 'COMPLETE_SIMULATION' });
    })
    .catch((err) => {
      if (err.message === 'Simulation aborted') {
        console.log('✅ Simulation cancelled cleanly');
        return;
      }
      console.error('Drone simulation failed', err);
      if (!isMounted) return;
      dispatchSimulation({ type: 'RESET_SIMULATION' });
    });

  return () => {
    isMounted = false;
    abortController.abort(); // Cancel simulation on unmount
  };
}, [order, restaurantCoords, customerCoords, simulation.status, simulation.hasRealtimeProgress]);
```

---

### Priority 6: Implement Web Map with Google Maps

#### Solution 6.1: Add Google Maps to web version
```tsx
// components/tracking/DeliveryMap.web.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export interface DeliveryMapProps {
  restaurant?: { latitude: number; longitude: number } | null;
  customer?: { latitude: number; longitude: number } | null;
  drone?: { latitude: number; longitude: number } | null;
  path?: { latitude: number; longitude: number }[];
  etaMinutes?: number;
}

const DeliveryMapWeb: React.FC<DeliveryMapProps> = ({
  restaurant,
  customer,
  drone,
  path = [],
  etaMinutes,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ restaurant?: any; customer?: any; drone?: any }>({});
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.google) {
        console.error('Google Maps not loaded');
        return;
      }

      const center = restaurant || customer || { latitude: 10.762622, longitude: 106.660172 };
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: center.latitude, lng: center.longitude },
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add markers
      if (restaurant) {
        markersRef.current.restaurant = new window.google.maps.Marker({
          position: { lat: restaurant.latitude, lng: restaurant.longitude },
          map: mapInstanceRef.current,
          title: 'Restaurant',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#FE8C00',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });
      }

      if (customer) {
        markersRef.current.customer = new window.google.maps.Marker({
          position: { lat: customer.latitude, lng: customer.longitude },
          map: mapInstanceRef.current,
          title: 'Customer',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });
      }

      // Fit bounds
      if (restaurant && customer) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: restaurant.latitude, lng: restaurant.longitude });
        bounds.extend({ lat: customer.latitude, lng: customer.longitude });
        mapInstanceRef.current.fitBounds(bounds);
      }
    };

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [restaurant, customer]);

  // Update drone marker
  useEffect(() => {
    if (!mapInstanceRef.current || !drone) return;

    if (markersRef.current.drone) {
      markersRef.current.drone.setPosition({ lat: drone.latitude, lng: drone.longitude });
    } else {
      markersRef.current.drone = new window.google.maps.Marker({
        position: { lat: drone.latitude, lng: drone.longitude },
        map: mapInstanceRef.current,
        title: 'Drone',
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIwIiB5PSIyMCIgZm9udC1zaXplPSIyMCI+8J+agTwvdGV4dD48L3N2Zz4=',
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
      });
    }
  }, [drone]);

  // Update path polyline
  useEffect(() => {
    if (!mapInstanceRef.current || path.length === 0) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new window.google.maps.Polyline({
      path: path.map(p => ({ lat: p.latitude, lng: p.longitude })),
      geodesic: true,
      strokeColor: '#2563EB',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: mapInstanceRef.current,
    });
  }, [path]);

  return (
    <View style={{ height: 350, width: '100%', borderRadius: 24, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {etaMinutes !== undefined && (
        <View style={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          borderRadius: 12, 
          padding: 12 
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            ETA: {Math.floor(etaMinutes)} min
          </Text>
        </View>
      )}
    </View>
  );
};

export default DeliveryMapWeb;
```

**Setup:**
1. Add Google Maps API key to `.env`:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Enable APIs in Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API (already used)

---

### Priority 7: Add Geocoding Cache

#### Solution 7.1: Cache geocoding results
```tsx
// lib/geocoding-cache.ts
interface CachedLocation {
  coords: { latitude: number; longitude: number };
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const geocodeCache = new Map<string, CachedLocation>();

export const geocodeWithCache = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  // Check cache
  const cached = geocodeCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Geocode cache hit:', address);
    return cached.coords;
  }

  // Geocode
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length > 0) {
      const coords = { latitude: results[0].latitude, longitude: results[0].longitude };
      geocodeCache.set(address, { coords, timestamp: Date.now() });
      return coords;
    }
  } catch (error) {
    console.warn('Geocode failed:', error);
  }

  return null;
};

// Usage in order-tracking.tsx
const customerCoords = await geocodeWithCache(order.deliveryAddress);
if (customerCoords) {
  setCustomerCoords(customerCoords);
  return;
}
```

---

## 📊 TESTING CHECKLIST

### Unit Tests:
- [ ] `parseOrderItems()` with various input formats
- [ ] `getEtaMinutes()` priority logic
- [ ] `simulationReducer()` all action types
- [ ] `geocodeWithCache()` cache hit/miss

### Integration Tests:
- [ ] Order subscription updates UI correctly
- [ ] Drone events update map markers
- [ ] Simulation cancels on unmount
- [ ] Multiple simultaneous subscriptions don't conflict

### E2E Tests:
- [ ] Place order → Track → See drone animation
- [ ] Order status changes reflect in UI
- [ ] Navigate away → Return → Tracking resumes
- [ ] Network disconnect → Reconnect → Data syncs

### Performance Tests:
- [ ] Render time < 500ms
- [ ] Memory usage < 50MB
- [ ] FPS > 30 during animation
- [ ] Battery drain < 5% per 10 minutes

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Critical Fixes (2-3 days)
1. ✅ Fix text rendering errors (wrap all strings in `<Text>`)
2. ✅ Consolidate state management với useReducer
3. ✅ Add simulation cancellation với AbortController
4. ✅ Fix drone path array growth (limit to 100 points)

### Phase 2: Performance (2-3 days)
5. ✅ Batch real-time subscription updates
6. ✅ Add error boundaries
7. ✅ Implement ETA priority system
8. ✅ Add geocoding cache

### Phase 3: Features (3-4 days)
9. ✅ Implement Google Maps for web
10. ✅ Add retry logic for failed subscriptions
11. ✅ Improve map camera animation
12. ✅ Add debug panel (removable in production)

### Phase 4: Testing & Polish (2-3 days)
13. ✅ Write unit tests
14. ✅ E2E testing
15. ✅ Performance profiling
16. ✅ Documentation update

**Total estimated time:** 9-13 days

---

## 🔗 RELATED FILES TO REVIEW

1. `mobile/type.d.ts` - Check Order, DroneEvent, Drone types
2. `mobile/lib/api-helpers.ts` - Check drone-related API calls
3. `mobile/app/order-detail.tsx` - Similar order display logic
4. `mobile/app/checkout.tsx` - Where orders are created
5. `restaurant/src/pages/Orders.tsx` - Restaurant side status updates

---

## 📝 NOTES

- Consider switching to **React Query** for data fetching (caching, retry, refetch logic built-in)
- Explore **Zustand** instead of multiple useState/useReducer for global state
- Add **Sentry** for production error tracking
- Consider **Firebase Realtime Database** as alternative to Appwrite subscriptions (lower latency)
- Implement **Service Worker** for web to enable offline tracking

---

**Document version:** 1.0  
**Last updated:** November 9, 2025  
**Author:** AI Assistant Analysis
