# Hướng Dẫn Cài Đặt Profile Feature - SGU Fastfood Deli

## 📋 Tổng Quan

Tài liệu này hướng dẫn bạn cấu hình và sử dụng tính năng Profile đã được implement.

---

## 🗄️ BƯỚC 1: CẤU HÌNH APPWRITE DATABASE

### 1.1. Đăng Nhập Appwrite Console

```
URL: https://cloud.appwrite.io/console
→ Chọn Project của bạn
→ Databases → Chọn Database hiện tại
→ Collections → "users"
```

### 1.2. Thêm Attributes Vào Collection "users"

Bạn cần thêm các attributes sau (nếu chưa có):

#### A. Phone Number
```
Type: String
Key: phone
Size: 15
Required: No
Default: null
```

**Cách thêm:**
1. Click "Add Attribute" trong collection users
2. Chọn type "String"
3. Điền Key: `phone`
4. Size: `15`
5. Bỏ check "Required"
6. Click "Create"

#### B. Address Home
```
Type: String
Key: address_home
Size: 255
Required: No
Default: null
```

#### C. Address Work
```
Type: String
Key: address_work
Size: 255
Required: No
Default: null
```

#### D. Address Home Label
```
Type: String
Key: address_home_label
Size: 50
Required: No
Default: "Home"
```

#### E. Address Work Label
```
Type: String
Key: address_work_label
Size: 50
Required: No
Default: "Work"
```

#### F. Created At
```
Type: DateTime
Key: createdAt
Required: No
Default: null
```

#### G. Updated At
```
Type: DateTime
Key: updatedAt
Required: No
Default: null
```

### 1.3. Cấu Hình Permissions

Vào tab "Settings" của collection "users":

**Read Permission:**
```
✅ Any (authenticated users can read)
```

**Create Permission:**
```
✅ Users (users can create their profile)
```

**Update Permission:**
```
✅ Document Owner (users can only update their own profile)
   Format: users/{$id}
```

**Delete Permission:**
```
✅ Admin only (hoặc không cho phép delete)
```

### 1.4. Verify Collection Structure

Sau khi hoàn thành, collection "users" phải có structure sau:

```javascript
users Collection:
├── $id (auto-generated)
├── accountId (string, required) - Đã có
├── email (string, required) - Đã có
├── name (string, required) - Đã có
├── avatar (string, optional) - Đã có
├── phone (string, optional) - ✨ MỚI THÊM
├── address_home (string, optional) - ✨ MỚI THÊM
├── address_home_label (string, optional) - ✨ MỚI THÊM
├── address_work (string, optional) - ✨ MỚI THÊM
├── address_work_label (string, optional) - ✨ MỚI THÊM
├── createdAt (datetime, optional) - ✨ MỚI THÊM
└── updatedAt (datetime, optional) - ✨ MỚI THÊM
```

---

## 📱 BƯỚC 2: CÀI ĐẶT CODE (ĐÃ HOÀN THÀNH)

### 2.1. Files Đã Được Tạo/Cập Nhật

✅ **Components:**
- `components/ProfileField.tsx` - Component hiển thị thông tin profile

✅ **Screens:**
- `app/(tabs)/profile.tsx` - Màn hình Profile hoàn chỉnh

✅ **Types:**
- `type.d.ts` - Đã cập nhật User interface và thêm UpdateUserParams

✅ **API Functions:**
- `lib/appwrite.ts` - Đã thêm `updateUser()` và `uploadAvatar()`

✅ **Constants:**
- `constants/index.ts` - Đã export `icons` object

---

## 🎨 BƯỚC 3: KIỂM TRA GIAO DIỆN

### 3.1. Chạy App

```bash
# Chạy trên iOS
npm run ios

# Chạy trên Android
npm run android

# Chạy trên Web
npm run web
```

### 3.2. Navigate Đến Profile

1. Đăng nhập vào app
2. Click vào tab "Profile" ở bottom navigation
3. Xem giao diện Profile

### 3.3. Giao Diện Profile Bao Gồm:

```
┌─────────────────────────────────┐
│       Profile Header            │
├─────────────────────────────────┤
│                                 │
│     [Avatar with Edit Icon]     │
│                                 │
├─────────────────────────────────┤
│  👤 Full Name                   │
│     Adrian Hajdin               │
├─────────────────────────────────┤
│  ✉️  Email                      │
│     adrian@jsmastery.com        │
├─────────────────────────────────┤
│  📱 Phone number                │
│     +1 555 123 4567            │
├─────────────────────────────────┤
│  📍 Address 1 - (Home)          │
│     123 Main Street...          │
├─────────────────────────────────┤
│  📍 Address 2 - (Work)          │
│     221B Rose Street...         │
├─────────────────────────────────┤
│                                 │
│    [Edit Profile Button]        │
│                                 │
│    [🚪 Logout Button]           │
│                                 │
└─────────────────────────────────┘
```

---

## 🔧 BƯỚC 4: CẬP NHẬT DỮ LIỆU USER (MANUAL)

Vì hiện tại chưa có màn hình Edit Profile, bạn cần cập nhật dữ liệu user manual qua Appwrite Console:

### 4.1. Update User Document

1. Vào Appwrite Console
2. Databases → Collection "users"
3. Click vào document của user bạn đang đăng nhập
4. Click "Update Document"
5. Thêm/sửa các fields:

```json
{
  "phone": "+1 555 123 4567",
  "address_home": "123 Main Street, Springfield, IL 62704",
  "address_home_label": "Home",
  "address_work": "221B Rose Street, Foodville, FL 12345",
  "address_work_label": "Work"
}
```

6. Click "Update"
7. Reload app để thấy thay đổi

---

## 🚀 BƯỚC 5: THÊM EDIT PROFILE (OPTIONAL - FUTURE)

Để thêm chức năng chỉnh sửa profile, bạn cần:

### 5.1. Tạo Edit Profile Screen

```tsx
// app/(tabs)/edit-profile.tsx
import { useState } from 'react';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { updateUser } from '@/lib/appwrite';

// ... implementation
```

### 5.2. Cập Nhật Profile.tsx

```tsx
const handleEditProfile = () => {
    router.push('/(tabs)/edit-profile');
};
```

### 5.3. Tạo Form Fields

```tsx
<CustomInput
    label="Full Name"
    value={name}
    onChangeText={setName}
    placeholder="Enter your name"
/>

<CustomInput
    label="Phone"
    value={phone}
    onChangeText={setPhone}
    keyboardType="phone-pad"
    placeholder="+1 555 123 4567"
/>

<CustomInput
    label="Home Address"
    value={addressHome}
    onChangeText={setAddressHome}
    placeholder="123 Main Street..."
/>

<CustomInput
    label="Work Address"
    value={addressWork}
    onChangeText={setAddressWork}
    placeholder="456 Office Building..."
/>
```

### 5.4. Handle Save

```tsx
const handleSave = async () => {
    try {
        await updateUser({
            userId: user.$id,
            name,
            phone,
            address_home: addressHome,
            address_work: addressWork,
        });
        
        Alert.alert('Success', 'Profile updated successfully!');
        router.back();
    } catch (error) {
        Alert.alert('Error', 'Failed to update profile');
    }
};
```

---

## 📸 BƯỚC 6: THÊM UPLOAD AVATAR (OPTIONAL - FUTURE)

### 6.1. Install Image Picker

```bash
npx expo install expo-image-picker
```

### 6.2. Request Permissions

```tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
        Alert.alert('Permission denied!');
        return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (!result.canceled) {
        uploadImage(result.assets[0].uri);
    }
};
```

### 6.3. Upload to Appwrite

```tsx
import { uploadAvatar, updateUser } from '@/lib/appwrite';

const uploadImage = async (imageUri: string) => {
    try {
        // Convert URI to file
        const file = {
            uri: imageUri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
        };

        // Upload to Appwrite Storage
        const avatarUrl = await uploadAvatar(file);

        // Update user document
        await updateUser({
            userId: user.$id,
            avatar: avatarUrl,
        });

        Alert.alert('Success', 'Avatar updated!');
    } catch (error) {
        Alert.alert('Error', 'Failed to upload avatar');
    }
};
```

---

## 🧪 BƯỚC 7: TESTING

### 7.1. Test Cases

#### Test 1: View Profile
```
✅ Profile screen loads successfully
✅ User data displays correctly
✅ Avatar shows (or default avatar)
✅ All fields have proper icons
✅ Layout is responsive
```

#### Test 2: Logout
```
✅ Click Logout button
✅ Confirmation alert appears
✅ Logout successful
✅ Redirects to Sign In screen
✅ Cannot access Profile when logged out
```

#### Test 3: Empty State
```
✅ When not logged in, show "Not Logged In" message
✅ "Sign In" button works
✅ Redirects to sign-in screen
```

### 7.2. Test Data Mẫu

Tạo user với data đầy đủ để test:

```json
{
  "accountId": "test-account-123",
  "email": "test@example.com",
  "name": "Adrian Hajdin",
  "avatar": "https://ui-avatars.com/api/?name=Adrian+Hajdin",
  "phone": "+1 555 123 4567",
  "address_home": "123 Main Street, Springfield, IL 62704",
  "address_home_label": "Home",
  "address_work": "221B Rose Street, Foodville, FL 12345",
  "address_work_label": "Work",
  "createdAt": "2025-10-08T10:00:00.000Z",
  "updatedAt": "2025-10-08T10:00:00.000Z"
}
```

---

## 🎨 STYLING REFERENCE

### Colors Used:
```css
Primary: #FE8C00 (Orange)
Dark: #181C2E
Gray: #878787
White: #FFFFFF
Error: #F14141
```

### Custom Classes (NativeWind):
```css
.profile-avatar - Avatar container với border
.profile-edit - Edit icon button
.profile-field - Field container
.profile-field__icon - Icon container
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: User data không hiển thị
**Solution:**
```typescript
// Check nếu user đã login
console.log('User:', user);

// Verify Appwrite connection
console.log('Appwrite Config:', appwriteConfig);

// Check Auth Store
const { user, isAuthenticated } = useAuthStore();
console.log('Auth State:', { user, isAuthenticated });
```

### Issue 2: Avatar không load
**Solution:**
```typescript
// Check avatar URL
console.log('Avatar URL:', user.avatar);

// Use default fallback
source={
    user.avatar 
        ? { uri: user.avatar } 
        : images.avatar
}
```

### Issue 3: Permissions denied
**Solution:**
1. Vào Appwrite Console
2. Collection "users" → Settings → Permissions
3. Ensure "Any" has Read access
4. Ensure users have Update access for their own documents

---

## ✅ CHECKLIST HOÀN THÀNH

### Database Setup:
- [ ] Đã thêm attribute `phone`
- [ ] Đã thêm attribute `address_home`
- [ ] Đã thêm attribute `address_home_label`
- [ ] Đã thêm attribute `address_work`
- [ ] Đã thêm attribute `address_work_label`
- [ ] Đã thêm attribute `createdAt`
- [ ] Đã thêm attribute `updatedAt`
- [ ] Đã set permissions đúng

### Code Implementation:
- [x] Component ProfileField đã tạo
- [x] Screen Profile đã implement
- [x] Types đã update
- [x] API functions đã thêm
- [x] Icons đã export

### Testing:
- [ ] Profile screen hiển thị đúng
- [ ] Logout function hoạt động
- [ ] Empty state hiển thị khi chưa login
- [ ] Responsive trên iOS
- [ ] Responsive trên Android
- [ ] Responsive trên Web

---

## 📚 NEXT STEPS

### Phase 1: Edit Profile (1-2 tuần)
- [ ] Tạo Edit Profile screen
- [ ] Add form validation
- [ ] Implement update functionality
- [ ] Add loading states

### Phase 2: Avatar Upload (1 tuần)
- [ ] Install expo-image-picker
- [ ] Add image picker functionality
- [ ] Upload to Appwrite Storage
- [ ] Update user avatar

### Phase 3: Additional Features
- [ ] Order history
- [ ] Favorite items
- [ ] Delivery addresses management
- [ ] Notifications preferences

---

## 🆘 SUPPORT

Nếu gặp vấn đề, check:

1. **Appwrite Console Logs**: Console → Functions → Logs
2. **React Native Logs**: `npx react-native log-android` hoặc `log-ios`
3. **Network Tab**: Xem API calls có thành công không
4. **Redux DevTools**: Check Auth Store state

---

**DONE! Profile feature đã sẵn sàng! 🎉**

Happy Coding! 😊
