# 📍 Location Feature - Quick Start

Get GPS-based location selection working in 5 minutes.

---

## ⚡ Setup (2 minutes)

### 1. Install Dependencies

```bash
cd mobile
npx expo install expo-location
```

### 2. Update app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow FoodFast to find nearby restaurants"
        }
      ]
    ]
  }
}
```

### 3. Update Appwrite User Collection

Add these fields in Appwrite Console → Users collection:

| Field | Type |
|-------|------|
| `latitude` | Float |
| `longitude` | Float |
| `city` | String |
| `district` | String |

---

## 🎯 Basic Usage (3 minutes)

### Get Current Location

```tsx
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

const { location, loading, getCurrentLocation } = useCurrentLocation();

useEffect(() => {
  getCurrentLocation();
}, []);

// Use location
console.log(location?.address); // "123 Nguyen Hue, District 1, HCM City"
```

### Open Location Picker

```tsx
import { router } from 'expo-router';

// From any screen
<TouchableOpacity onPress={() => router.push('/location-picker')}>
  <Text>Change Location</Text>
</TouchableOpacity>
```

### Search Locations

```tsx
import { useSearchLocation } from '@/hooks/useSearchLocation';

const { suggestions, setSearchQuery } = useSearchLocation();

<TextInput
  placeholder="Search location..."
  onChangeText={setSearchQuery}
/>

{suggestions.map(item => (
  <Text key={item.id}>{item.name}</Text>
))}
```

---

## ✅ Testing

```bash
cd mobile
npx expo start
```

1. Tap "DELIVER TO" on Home screen
2. Allow location permission
3. See current GPS address
4. Tap address → Opens location picker
5. Search for "Vinhomes" → See suggestions
6. Select location → Saved to profile

---

## 🐛 Troubleshooting

**Location not working?**
- Check phone GPS is enabled
- Grant location permission in app settings
- Restart Expo app

**No search results?**
- Check internet connection
- Try popular locations first (Vinhomes, Landmark 81)

**Android permission issues?**
```bash
cd mobile/android
./gradlew clean
cd ..
npx expo run:android
```

---

## 📚 Full Documentation

See [LOCATION_FEATURE_GUIDE.md](./LOCATION_FEATURE_GUIDE.md) for:
- Complete API reference
- Advanced usage examples
- Performance optimization
- Security best practices

---

**Ready to go!** 🚀

Your app now has GPS location detection, search, and automatic address selection.
