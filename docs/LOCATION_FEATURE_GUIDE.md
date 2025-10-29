# 📍 Location Feature Guide

Complete guide for GPS-based location selection system in FoodFast mobile app.

## 📌 Overview

This feature replaces manual address entry with automatic GPS-based location detection, similar to modern food delivery apps (Grab, ShopeeFood). Users can:

- ✅ Auto-detect current GPS location
- 🔍 Search for locations with autocomplete
- 📍 Select popular locations (malls, landmarks)
- 💾 Save location to profile automatically
- 🚚 Use location for accurate delivery calculation

---

## 🏗️ Architecture

### **Core Files Created**

1. **`mobile/hooks/useCurrentLocation.ts`** (181 lines)
   - Auto-detects GPS location with permissions
   - Reverse geocoding (coordinates → address)
   - Fallback to HCM default location
   - Returns: `UserLocation` object with full address details

2. **`mobile/hooks/useSearchLocation.ts`** (254 lines)
   - Debounced search (500ms) for location autocomplete
   - Uses Expo Location geocoding (free, no API key needed)
   - Distance calculation from user location (Haversine formula)
   - Popular locations hardcoded for Vietnam

3. **`mobile/components/LocationPicker.tsx`** (262 lines)
   - Full UI component matching screenshot design
   - Search bar with real-time suggestions
   - Current location button with GPS indicator
   - Popular locations list (Vinhomes, Saigon Centre, etc.)

4. **`mobile/app/location-picker.tsx`** (81 lines)
   - Screen wrapper for LocationPicker component
   - Saves selected location to Appwrite user profile
   - Supports `returnScreen` and `saveToProfile` params
   - Navigation back with location data

### **Modified Files**

1. **`mobile/app/(tabs)/index.tsx`** (Home Screen)
   - Shows real GPS address instead of "District 7"
   - Opens location-picker when user taps address
   - Updates restaurant list based on real coordinates

2. **`mobile/app/(tabs)/profile.tsx`** (Profile Screen)
   - Displays current GPS location with "Change" button
   - Removes manual address input fields
   - "Add Location" button if no location set

3. **`mobile/app/checkout.tsx`** (Checkout Screen)
   - Uses GPS location for delivery address
   - "Change" button opens location-picker
   - Auto-calculates delivery fee based on real coordinates

---

## 🚀 Implementation

### **1. Install Dependencies**

Location feature uses `expo-location` package (already in dependencies):

```bash
cd mobile
npx expo install expo-location
```

### **2. Configure Permissions**

Add to `mobile/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow FoodFast to use your location to find nearby restaurants and calculate delivery."
        }
      ]
    ]
  }
}
```

### **3. Update Appwrite User Collection**

Add these attributes to `Users` collection in Appwrite Console:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | Float | No | GPS latitude coordinate |
| `longitude` | Float | No | GPS longitude coordinate |
| `city` | String | No | City name (e.g., "Ho Chi Minh City") |
| `district` | String | No | District name (e.g., "Quận 7") |
| `address_home` | String | No | Full address string |
| `address_home_label` | String | No | Label (e.g., "Home", "Office") |

---

## 📱 Usage Examples

### **1. Auto-Detect Location on Home Screen**

```tsx
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

const HomeScreen = () => {
  const { location, loading, getCurrentLocation } = useCurrentLocation();

  useEffect(() => {
    getCurrentLocation(); // Auto-detect on mount
  }, []);

  return (
    <TouchableOpacity onPress={() => router.push('/location-picker')}>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text>{location?.district || 'Select Location'}</Text>
      )}
    </TouchableOpacity>
  );
};
```

### **2. Search for Locations**

```tsx
import { useSearchLocation } from '@/hooks/useSearchLocation';

const SearchScreen = () => {
  const { 
    suggestions, 
    searchQuery,
    setSearchQuery,
    selectSuggestion 
  } = useSearchLocation();

  return (
    <>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search location..."
      />
      
      {suggestions.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          onPress={() => selectSuggestion(item)}
        >
          <Text>{item.name}</Text>
          <Text>{item.address}</Text>
          {item.distance && <Text>{item.distance} km</Text>}
        </TouchableOpacity>
      ))}
    </>
  );
};
```

### **3. Open Location Picker from Any Screen**

```tsx
// From Profile Screen (save to profile)
router.push('/location-picker?saveToProfile=true');

// From Checkout Screen (return with location data)
router.push('/location-picker?returnScreen=checkout');
```

### **4. Handle Location Selection**

```tsx
const CheckoutScreen = () => {
  const { 
    selectedAddress,
    selectedLatitude,
    selectedLongitude 
  } = useLocalSearchParams();

  useEffect(() => {
    if (selectedAddress) {
      setDeliveryAddress(selectedAddress);
      // Calculate delivery fee with real coordinates
      calculateDeliveryFee(selectedLatitude, selectedLongitude);
    }
  }, [selectedAddress]);
};
```

---

## 🎨 UI Components

### **LocationPicker Component Props**

```tsx
interface LocationPickerProps {
  onSelectLocation: (location: UserLocation) => void;
  initialLocation?: UserLocation;
}

// Usage
<LocationPicker
  onSelectLocation={(location) => {
    console.log('Selected:', location);
  }}
  initialLocation={currentLocation}
/>
```

### **UserLocation Type**

```tsx
interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  street?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}
```

### **LocationSuggestion Type**

```tsx
interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number; // km from user location
  isPopular?: boolean;
}
```

---

## 🧪 Testing Checklist

### **iOS Testing**

```bash
cd mobile
npx expo run:ios
```

- [ ] Location permission prompt appears on first launch
- [ ] Home screen shows actual GPS address (not "District 7")
- [ ] Tapping address opens location-picker
- [ ] Search suggestions appear after typing
- [ ] "Current Location" button detects GPS
- [ ] Selected location saves to Appwrite
- [ ] Profile shows saved location
- [ ] Checkout uses real coordinates for delivery

### **Android Testing**

```bash
cd mobile
npx expo run:android
```

- [ ] Location permission prompt appears
- [ ] GPS detection works correctly
- [ ] Search with Vietnamese addresses (e.g., "Võng Xoay")
- [ ] Popular locations display correctly
- [ ] Back navigation works properly

### **Edge Cases**

- [ ] No GPS signal → Falls back to default HCM location
- [ ] Permission denied → Shows "Enable Location" message
- [ ] Empty search → Shows popular locations
- [ ] No internet → Uses cached location
- [ ] Slow network → Shows loading indicator

---

## 🔧 Troubleshooting

### **Issue: Location permission denied**

**Solution:**
```tsx
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert(
    'Permission Denied',
    'Please enable location in Settings to use this feature',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() }
    ]
  );
}
```

### **Issue: GPS takes too long**

**Solution:** Add timeout and fallback:
```tsx
const location = await Promise.race([
  Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 10000)
  )
]);
```

### **Issue: Search returns no results**

**Cause:** Expo geocoding has limited data for some areas.

**Solution:** Add more popular locations:
```tsx
const popularLocations = [
  {
    name: 'Your Custom Location',
    latitude: 10.8231,
    longitude: 106.6297,
    address: 'Full address here',
  },
  // ... more locations
];
```

### **Issue: Distance calculation incorrect**

**Cause:** Haversine formula assumes spherical Earth.

**Solution:** For very accurate distances, use Google Distance Matrix API:
```tsx
const response = await fetch(
  `https://maps.googleapis.com/maps/api/distancematrix/json?` +
  `origins=${lat1},${lng1}&destinations=${lat2},${lng2}&key=${API_KEY}`
);
```

---

## 📊 Performance Optimization

### **1. Debounce Search Input**

Already implemented with 500ms debounce in `useSearchLocation`:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (debouncedQuery.trim()) {
      searchLocations(debouncedQuery);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [debouncedQuery]);
```

### **2. Cache Location Data**

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save location to cache
await AsyncStorage.setItem('lastLocation', JSON.stringify(location));

// Load from cache
const cached = await AsyncStorage.getItem('lastLocation');
if (cached) {
  setLocation(JSON.parse(cached));
}
```

### **3. Limit Search Results**

Already limited to top 5 results:

```tsx
const sortedResults = results
  .sort((a, b) => (a.distance || 0) - (b.distance || 0))
  .slice(0, 5); // Only return top 5 closest
```

---

## 🌍 Internationalization

### **Adding Multi-language Support**

```tsx
// Create i18n/location.json
{
  "en": {
    "current_location": "Current Location",
    "search_placeholder": "Search for a location...",
    "popular_locations": "Popular Locations",
    "change": "Change"
  },
  "vi": {
    "current_location": "Vị trí hiện tại",
    "search_placeholder": "Tìm kiếm địa điểm...",
    "popular_locations": "Địa điểm phổ biến",
    "change": "Thay đổi"
  }
}
```

---

## 🔐 Privacy & Security

### **1. Location Data Handling**

- ✅ **Only when needed**: Request location only when user opens location-picker
- ✅ **User consent**: Show clear permission prompt
- ✅ **No tracking**: Don't store location history
- ✅ **Secure storage**: Save in Appwrite with proper permissions

### **2. Appwrite Permissions**

Set collection permissions for `Users` collection:

```javascript
// Read: User can read their own data
Permission.read(Role.user(userId))

// Update: User can update their own location
Permission.update(Role.user(userId))
```

---

## 📈 Future Enhancements

### **Phase 2 Features**

1. **Multiple Saved Addresses**
   - "Home", "Office", "Favorite" locations
   - Quick select from saved addresses

2. **Map View**
   - Show delivery area on map
   - Drag marker to adjust location
   - Visualize delivery radius

3. **Address Autocomplete API**
   - Integrate Google Places API
   - More accurate suggestions
   - International support

4. **Recent Locations**
   - Show last 5 used addresses
   - Quick access to frequent locations

5. **Delivery Zone Validation**
   - Check if address is in delivery area
   - Show "Out of delivery zone" message
   - Suggest nearest available restaurant

---

## 🎯 Best Practices

1. **Always show loading state** when getting location
2. **Provide fallback** if GPS fails
3. **Validate coordinates** before saving to database
4. **Show clear error messages** to users
5. **Test on real devices**, not just simulators
6. **Cache location** to avoid repeated API calls
7. **Respect user privacy** - only request when needed

---

## 📞 Support

For issues or questions:
- Check `/mobile/hooks/useCurrentLocation.ts` for GPS logic
- Check `/mobile/hooks/useSearchLocation.ts` for search implementation
- See Expo Location docs: https://docs.expo.dev/versions/latest/sdk/location/

---

**Last Updated:** 2024-01-10
**Version:** 1.0.0
**Author:** FoodFast Development Team
