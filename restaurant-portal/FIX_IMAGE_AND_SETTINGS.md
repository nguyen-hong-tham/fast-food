# Fix Image Hostname & Settings Debug

## 🐛 Issues Fixed

### 1. Next.js Image Error - Hostname Not Configured
**Error:** 
```
Error: Invalid src prop (https://nyc.cloud.appwrite.io/v1/storage/...) 
on `next/image`, hostname "nyc.cloud.appwrite.io" is not configured 
under images in your `next.config.js`
```

**Location:** Menu page when adding/displaying items with images

**Root Cause:**
- Appwrite storage URL: `https://nyc.cloud.appwrite.io/...`
- Next.js config only had: `cloud.appwrite.io`
- Missing subdomain: `nyc.cloud.appwrite.io`

**Solution:**
Add the NYC subdomain to `next.config.js`:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cloud.appwrite.io',
      'nyc.cloud.appwrite.io',  // ✅ Added
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'nyc.cloud.appwrite.io',  // ✅ Added
      },
    ],
  },
}

module.exports = nextConfig
```

**Important:** After changing `next.config.js`, you MUST restart the dev server!

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

---

### 2. Settings Page - "Invalid relationship value, array given"
**Error:** 
```
Failed to save settings: Invalid relationship value. 
Must be either a document ID or a document, array given.
```

**Possible Causes:**
1. Sending empty string `''` for optional fields
2. Sending `undefined` explicitly
3. Field type mismatch (string vs array)
4. Whitespace-only values

**Solutions Applied:**

#### A. Only Send Non-Empty Values
```typescript
const updateData: any = {
  name: settings.name.trim(),
  description: settings.description.trim(),
  phone: settings.phone.trim(),
  address: settings.address.trim(),
};

// Only add optional fields if they have actual values
if (settings.email && settings.email.trim()) {
  updateData.email = settings.email.trim();
}
if (settings.businessLicense && settings.businessLicense.trim()) {
  updateData.businessLicense = settings.businessLicense.trim();
}
// ... same for other optional fields
```

#### B. Debug Logging
Added console logs to see exactly what's being sent:
```typescript
console.log('📤 Sending update data:', updateData);
console.log('📤 Data types:', Object.entries(updateData)
  .map(([k, v]) => `${k}: ${typeof v}`).join(', '));
```

---

## 🧪 Testing Steps

### Test 1: Menu Item Image Display
1. **Refresh browser** at http://localhost:3001
2. Go to **Menu** page
3. **Add new menu item** with image
4. Upload image from device
5. Click "Add Item"

**Expected Result:**
- ✅ Image uploads successfully
- ✅ Image displays in menu list
- ✅ NO "hostname not configured" error

**If Error Still Occurs:**
- Check browser console for actual URL
- Verify URL starts with `https://nyc.cloud.appwrite.io`
- Make sure dev server was restarted after config change

---

### Test 2: Settings Page Save
1. Go to **Settings** page
2. **Open Browser DevTools** (F12)
3. Go to **Console** tab
4. Fill form with data from screenshot:
   - Name: "cơm suốn"
   - Description: "bán cơm suốn"
   - Phone: "0899932768"
   - Email: "nguyenvana@gmail.com"
   - Address: "123 cao thắng"
   - Business License: "123"
   - Tax Code: "123"
   - Bank Account: "3"
   - Bank Name: "12312"
5. Click **"Save Settings"**
6. **Check console logs:**
   - Look for `📤 Sending update data: {...}`
   - Look for `📤 Data types: ...`

**Expected Console Output:**
```
📤 Sending update data: {
  name: "cơm suốn",
  description: "bán cơm suốn",
  phone: "0899932768",
  address: "123 cao thắng",
  email: "nguyenvana@gmail.com",
  businessLicense: "123",
  taxCode: "123",
  bankAccount: "3",
  bankName: "12312"
}
📤 Data types: name: string, description: string, phone: string, ...
```

**If Success:**
- ✅ Green success message appears
- ✅ Data saved in Appwrite Console
- ✅ No errors in console

**If Error Still Occurs:**
1. **Screenshot the console logs** - send to me
2. **Check the error message** - what field is problematic?
3. **Go to Appwrite Console:**
   - Database → restaurants collection
   - Find your restaurant document
   - Check which fields are relationships (arrow icon)
4. **Report back:**
   - Which field(s) are relationships?
   - What's the exact error message?

---

## 🔍 Debug Checklist

### If Menu Image Error Persists:
- [ ] Server was restarted after next.config.js change?
- [ ] Browser was hard-refreshed (Ctrl+Shift+R)?
- [ ] Check actual image URL in error message
- [ ] Verify URL matches pattern in config

### If Settings Error Persists:
- [ ] Check console logs for data being sent
- [ ] Verify all values are strings (not arrays)
- [ ] Check Appwrite Console for field types
- [ ] Look for relationship fields (have arrow icon)
- [ ] Try saving with only required fields first
- [ ] Then add optional fields one by one

---

## 📊 Common Appwrite Field Types

### String Field:
```
name: string
description: string
phone: string
```
✅ Can be empty string or text value

### Relationship Field:
```
ownerId: relationship (One to many)
categoryId: relationship (Many to one)
```
❌ Cannot be empty string - must be:
- Valid document ID: `"673abc123def"`
- Or omitted from update data entirely

### How to Identify in Console:
- **String field:** Shows `T` icon
- **Relationship field:** Shows `🔗` arrow icon
- **Number field:** Shows `#` icon
- **Boolean field:** Shows `⊙` icon

---

## 🚀 Expected Results

### After Fixes:
1. **Menu Page:**
   - Images load and display correctly
   - No hostname errors
   - Can add items with images

2. **Settings Page:**
   - Can save all fields
   - Success message appears
   - Data persists in database
   - No relationship errors

---

## 📝 Next Steps

**If Tests Pass:**
1. ✅ Remove debug console.logs (optional)
2. ✅ Test complete workflow end-to-end
3. ✅ Ready to add more features!

**If Tests Fail:**
1. 🔍 Screenshot console logs
2. 🔍 Screenshot Appwrite Console fields
3. 🔍 Copy exact error message
4. 📧 Send me all info for further debugging

---

## 💡 Pro Tips

### Appwrite Best Practices:
1. **Check field types first** before coding
2. **Never send empty strings** for relationships
3. **Always trim string values** to avoid whitespace issues
4. **Use conditional inclusion** for optional fields
5. **Log data before sending** to API for debugging

### Next.js Image Best Practices:
1. **Always configure domains** in next.config.js
2. **Use wildcard patterns** for subdomains if needed:
   ```javascript
   remotePatterns: [
     {
       protocol: 'https',
       hostname: '**.appwrite.io',  // Matches any subdomain
     },
   ]
   ```
3. **Restart server** after config changes
4. **Hard refresh browser** to clear cache

---

## 🎯 Status

**Fixed:**
- ✅ Next.js image hostname configuration
- ✅ Settings save logic with proper validation
- ✅ Debug logging added for troubleshooting

**Pending Verification:**
- ⏳ Test menu image display
- ⏳ Test settings save with debug logs
- ⏳ Identify exact cause if error persists

**Ready to Test!** 🚀
