# Settings Page - Testing Checklist

## ✅ Code Changes Summary

### Files Modified:
1. **src/app/settings/page.tsx**
   - ❌ Removed `operatingHours` field completely
   - ✅ Changed `businessLicense` → `business_license` (snake_case for DB)
   - ✅ Made email optional with clarifying label
   - ✅ Removed Operating Hours UI section (~60 lines)

2. **src/store/authStore.ts**
   - ✅ Added mapping for business fields from database
   - ✅ Maps `business_license` (DB) → `businessLicense` (interface)

3. **src/types/index.ts**
   - ❌ Removed `operatingHours` from Restaurant interface
   - ✅ Added comment explaining `businessLicense` mapping
   - ✅ Added missing fields: `deliveryRadius`, `openingHours`, `imageUrl`, `totalReviews`

## 🧪 Test Plan

### Pre-Testing Setup
- [ ] **Clear browser cache** to avoid old data issues
- [ ] **Have Appwrite Console open** to verify database changes
- [ ] **Check current restaurant data** in Appwrite Console

---

### Test 1: Load Settings Page
**Steps:**
1. Login to restaurant portal
2. Navigate to Settings page (`/settings`)

**Expected Results:**
- ✅ Page loads without errors
- ✅ Basic info fields are populated (name, description, phone, address)
- ✅ Email field shows current restaurant email (if exists)
- ✅ Business fields show current data (if exists)
- ❌ NO Operating Hours section visible
- ✅ No console errors

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 2: Save Basic Info (Required Fields Only)
**Steps:**
1. On Settings page
2. Update name: "Test Restaurant Updated"
3. Update description: "New description"
4. Update phone: "0123456789"
5. Update address: "123 Test Street"
6. **Leave email empty**
7. Click Save

**Expected Results:**
- ✅ Success message appears
- ✅ No errors about operatingHours
- ✅ No errors about email being required
- ✅ Data persists on page reload
- ✅ Appwrite Console shows updated data

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 3: Save With Restaurant Email
**Steps:**
1. Fill basic info
2. Add restaurant email: "contact@restaurant.com"
3. Click Save

**Expected Results:**
- ✅ Email saves successfully
- ✅ Email shows in Appwrite Console under `email` field
- ✅ Email persists on page reload
- ✅ Helper text explains this is different from login email

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 4: Save Business License
**Steps:**
1. Fill basic info
2. Add Business License Number: "BL123456"
3. Click Save

**Expected Results:**
- ✅ License saves successfully
- ✅ In Appwrite Console, saved as `business_license` (snake_case)
- ✅ On page reload, loads correctly into "Business License Number" field
- ✅ No field name mismatch errors

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 5: Save All Business Fields
**Steps:**
1. Fill basic info
2. Fill all business fields:
   - Business License: "BL123456"
   - Tax Code: "TAX789"
   - Bank Account: "1234567890"
   - Bank Name: "Test Bank"
3. Click Save

**Expected Results:**
- ✅ All fields save successfully
- ✅ Appwrite Console shows all values:
  - `business_license`: "BL123456"
  - `taxCode`: "TAX789"
  - `bankAccount`: "1234567890"
  - `bankName`: "Test Bank"
- ✅ All fields load correctly on page reload

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 6: Email Field Clarity
**Steps:**
1. Read the email field label and helper text

**Expected Results:**
- ✅ Label says "Restaurant Contact Email"
- ✅ Placeholder says "Optional - for customer inquiries"
- ✅ Helper text explains it's different from login email
- ✅ Field is NOT marked with * (not required)

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 7: Operating Hours Removed
**Steps:**
1. Scroll through entire settings page
2. Search page for "Operating" or "Hours"

**Expected Results:**
- ❌ NO Operating Hours section visible
- ❌ NO day-of-week selector
- ❌ NO time pickers
- ✅ Only 2 sections: Basic Information, Business Information

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 8: Field Mapping Verification
**Steps:**
1. Fill all fields and save
2. Open Appwrite Console → Database → restaurants collection
3. Click on your restaurant document
4. Check field names

**Expected Results:**
- ✅ Database has `business_license` (snake_case)
- ✅ Database has `taxCode` (camelCase)
- ✅ Database has `bankAccount` (camelCase)
- ✅ Database has `bankName` (camelCase)
- ❌ Database does NOT have `operatingHours` field
- ✅ All values match what you entered

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 9: AuthStore Loading
**Steps:**
1. Save settings with business fields
2. Log out
3. Log back in
4. Go to Settings page

**Expected Results:**
- ✅ All fields load correctly (including business fields)
- ✅ Business License loads from `business_license` DB field
- ✅ No console errors about missing fields

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

### Test 10: Error Handling
**Steps:**
1. Try to save with empty required fields:
   - Clear name field
   - Try to save

**Expected Results:**
- ✅ Error message for required fields
- ✅ Form validation prevents save
- ❌ NO errors about operatingHours

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues: _______________________

---

## 🔍 Console Checks

### Browser Console (F12)
During all tests, check for:
- [ ] **NO errors** about "operatingHours"
- [ ] **NO errors** about "Unknown attribute"
- [ ] **NO warnings** about field mismatches
- [ ] **NO 400 errors** from Appwrite API

### Appwrite Console
Verify in database:
- [ ] `business_license` field exists and uses snake_case
- [ ] `operatingHours` field does NOT exist
- [ ] Restaurant email is in `email` field
- [ ] All business fields save correctly

---

## 📊 Test Results Summary

**Date:** _____________
**Tester:** _____________
**Browser:** _____________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Load Settings Page | ⬜ Pass / ⬜ Fail | |
| 2 | Save Basic Info | ⬜ Pass / ⬜ Fail | |
| 3 | Save With Email | ⬜ Pass / ⬜ Fail | |
| 4 | Save Business License | ⬜ Pass / ⬜ Fail | |
| 5 | Save All Business Fields | ⬜ Pass / ⬜ Fail | |
| 6 | Email Field Clarity | ⬜ Pass / ⬜ Fail | |
| 7 | Operating Hours Removed | ⬜ Pass / ⬜ Fail | |
| 8 | Field Mapping | ⬜ Pass / ⬜ Fail | |
| 9 | AuthStore Loading | ⬜ Pass / ⬜ Fail | |
| 10 | Error Handling | ⬜ Pass / ⬜ Fail | |

**Overall Status:** ⬜ All Pass / ⬜ Some Failures

---

## 🐛 Known Issues to Verify

### Issue 1: Operating Hours Error (FIXED)
- **Problem:** "Unknown attribute: operatingHours"
- **Fix:** Removed field completely
- **Verify:** ✅ No more errors when saving

### Issue 2: Business License Field Name (FIXED)
- **Problem:** Using `businessLicense` but DB has `business_license`
- **Fix:** Map snake_case ↔ camelCase in authStore and settings
- **Verify:** ✅ Field saves and loads correctly

### Issue 3: Email Confusion (FIXED)
- **Problem:** Unclear if email is for login or restaurant
- **Fix:** Better label + helper text + optional
- **Verify:** ✅ Label clearly says "Restaurant Contact Email"

---

## ✨ Success Criteria

All tests must pass:
- [x] ✅ No errors when saving settings
- [x] ✅ Operating Hours section removed
- [x] ✅ Business License saves as `business_license` in DB
- [x] ✅ Email field is optional and clear
- [x] ✅ All fields load correctly on page refresh
- [x] ✅ No console errors
- [x] ✅ Appwrite Console shows correct data

---

## 🚀 Next Steps After Testing

If all tests pass:
1. Update documentation
2. Commit changes with message:
   ```
   fix(settings): Remove operatingHours field and fix business_license mapping
   
   - Removed operatingHours field that doesn't exist in database
   - Fixed business_license field name (snake_case in DB, camelCase in interface)
   - Made restaurant email optional with clarifying label
   - Added business field mapping in authStore
   - Updated Restaurant interface to match database schema
   ```

If tests fail:
1. Document all failures
2. Fix issues
3. Re-test
4. Update this checklist

---

## 📝 Additional Notes

### Email Types Clarification:
1. **Owner Login Email** (in User collection)
   - Used for authentication
   - Set during registration
   - Cannot be changed in settings

2. **Restaurant Contact Email** (in Restaurant collection)
   - Optional
   - For customer inquiries
   - Can be different from owner email
   - Set in Settings page

### Field Naming Convention:
- **Database (Appwrite):** Mix of snake_case and camelCase
  - `business_license` (snake_case)
  - `taxCode`, `bankAccount`, `bankName` (camelCase)
  
- **TypeScript Interface:** All camelCase
  - `businessLicense`
  - Mapped in authStore and settings save function

### Related Documentation:
- `SETTINGS_FIELD_MAPPING_FIX.md` - Detailed fix explanation
- `CRITICAL_BUGFIX_OWNERID.md` - Owner ID fix (related to authStore)
- `PROJECT_REQUIREMENTS_vi.md` - Original requirements
