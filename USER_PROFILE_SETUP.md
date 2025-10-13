# 👤 User Profile Collection - Complete Setup

## ✅ What's Been Implemented

Your app now collects **complete user profile information** during registration!

### Profile Fields Collected:

1. **Full Name** * (Required)
2. **Phone Number** (Optional)
3. **Date of Birth** (Optional)
4. **Location** (Optional - e.g., "Zürich, Schweiz")

All fields are stored in the `user_profiles` database table.

---

## 🚀 Quick Setup (2 Minutes)

### Step 1: Create the User Profiles Table

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new
   ```

2. **Copy all SQL** from `supabase/migrations/002_add_user_profiles.sql`

3. **Paste and click "Run"**

4. **Verify table created:**
   - Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor
   - You should see `user_profiles` table

---

## 📱 User Registration Flow

### Complete Registration Process:

```
Step 1: Enter Email
├─→ User enters: their.email@example.com
└─→ Clicks "Code an E-Mail senden"

Step 2: Verify OTP Code
├─→ User receives 6-digit code via email
├─→ Enters: 123456
└─→ Clicks "Code bestätigen"

Step 3: Complete Profile
├─→ Full Name * : Max Mustermann (Required)
├─→ Phone Number: +41 79 123 45 67 (Optional)
├─→ Date of Birth: 1990-05-15 (Optional)
├─→ Location: Zürich, Schweiz (Optional)
└─→ Clicks "Profil erstellen"

Result: User logged in with complete profile! ✅
```

---

## 🎨 Profile Form Features

### Required Fields:
- ✅ **Full Name** - Minimum 2 characters
- ✅ Marked with * (asterisk)
- ✅ Must be filled to proceed

### Optional Fields:
- **Phone Number** - Validated format (numbers, spaces, +, -, ( ) allowed)
- **Date of Birth** - Date picker, validates age (13-120 years)
- **Location** - Free text (city, country, etc.)

### Validation Rules:

**Name:**
- Minimum 2 characters
- Cannot be empty or whitespace

**Phone Number:**
- Optional, but if provided must be valid
- Accepts: `+41 79 123 45 67`, `079 123 45 67`, etc.
- Rejects: letters, special characters (except +, -, ( ), spaces)

**Date of Birth:**
- Optional, but if provided must be valid
- User must be at least 13 years old
- User must be less than 120 years old
- Cannot be a future date

**Location:**
- Optional, free text
- Can be city, country, or full address
- Examples: "Zürich", "Zürich, Schweiz", "Zürich, Switzerland"

---

## 💾 Database Storage

### Data Stored in `user_profiles` Table:

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY,           -- Links to auth.users
  full_name TEXT NOT NULL,            -- User's name
  phone_number TEXT,                  -- Phone (optional)
  date_of_birth DATE,                 -- Birthday (optional)
  location TEXT,                      -- Location (optional)
  avatar_url TEXT,                    -- Profile picture (future)
  bio TEXT,                           -- Bio (future)
  created_at TIMESTAMPTZ,             -- When profile was created
  updated_at TIMESTAMPTZ              -- Last update
);
```

### Example User Profile:

```json
{
  "user_id": "uuid-1234-5678",
  "full_name": "Max Mustermann",
  "phone_number": "+41 79 123 45 67",
  "date_of_birth": "1990-05-15",
  "location": "Zürich, Schweiz",
  "created_at": "2025-10-13T10:00:00Z",
  "updated_at": "2025-10-13T10:00:00Z"
}
```

### Also Stored in Auth Metadata:

```json
{
  "user_metadata": {
    "full_name": "Max Mustermann"
  }
}
```

This allows quick access to the name without querying the profiles table.

---

## 🧪 Test the Complete Flow

### 1. Open Your App
```
http://localhost:3000
```

### 2. Start Registration
- Click settings icon (⚙️)
- Enter your email
- Click "Code an E-Mail senden"

### 3. Verify Email
- Check your email for 6-digit code
- Enter the code
- Click "Code bestätigen"

### 4. Complete Profile
You'll see a form with 4 fields:

**Required:**
- ✅ **Vollständiger Name** *
  - Example: "Max Mustermann"

**Optional:**
- **Telefonnummer**
  - Example: "+41 79 123 45 67"

- **Geburtsdatum**
  - Click to open date picker
  - Select your birth date

- **Standort**
  - Example: "Zürich, Schweiz"

### 5. Submit Profile
- Click "Profil erstellen"
- Wait for confirmation
- You're logged in! ✅

---

## ✅ Verify Profile in Database

### Check Supabase Dashboard

1. **View Auth User:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users
   ```
   - Click on your user
   - Check "User Metadata" → should show `full_name`

2. **View Profile Table:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor/user_profiles
   ```
   - You should see your profile row
   - All fields you entered should be there

### Check in Browser Console

```javascript
// Get current user profile
const { data: profile } = await window.supabase
  .from('user_profiles')
  .select('*')
  .single()

console.log('User Profile:', profile)

// Should show:
// {
//   user_id: "...",
//   full_name: "Max Mustermann",
//   phone_number: "+41 79 123 45 67",
//   date_of_birth: "1990-05-15",
//   location: "Zürich, Schweiz"
// }
```

---

## 🎯 What You Can Do With This Data

### Personalization:
- **Greet user by name** in the app
- **Show age-appropriate events** based on birthday
- **Recommend local events** based on location
- **Send SMS notifications** using phone number

### Example Use Cases:

**1. Personalized Greeting:**
```typescript
const profile = await getUserProfile()
return `Hallo ${profile.full_name}! 👋`
```

**2. Age-Appropriate Events:**
```typescript
const age = calculateAge(profile.date_of_birth)
if (age < 18) {
  // Show family-friendly events only
}
```

**3. Local Event Recommendations:**
```typescript
if (profile.location === 'Zürich') {
  // Prioritize Zürich events in search results
}
```

**4. SMS Notifications:**
```typescript
if (profile.phone_number) {
  // Send event reminders via SMS
}
```

---

## 🔐 Privacy & Security

### Data Protection:

✅ **Row Level Security (RLS)** - Users can only see their own profile
✅ **Encrypted Storage** - All data encrypted at rest
✅ **Secure Transport** - HTTPS only
✅ **Optional Fields** - Users control what they share
✅ **Validation** - All inputs validated before storage

### What Users Can Do:

- **View** their own profile
- **Update** their own profile
- **Delete** their account (cascades to profile)

### What Users Cannot Do:

- ❌ View other users' profiles
- ❌ Modify other users' data
- ❌ Access data without authentication

---

## 🛠️ API Functions Available

### Create/Update Profile:
```typescript
await createUserProfile({
  full_name: 'Max Mustermann',
  phone_number: '+41 79 123 45 67',
  date_of_birth: '1990-05-15',
  location: 'Zürich, Schweiz'
})
```

### Get Profile:
```typescript
const profile = await getUserProfile()
// Returns: UserProfile or null
```

### Update Metadata (for display name):
```typescript
await updateUserMetadata({
  full_name: 'New Name'
})
```

---

## 📊 Database Schema

### Full Schema with Relationships:

```
auth.users (Supabase managed)
    ├─→ user_profiles (1:1) ✅ NEW!
    │   ├─ full_name
    │   ├─ phone_number
    │   ├─ date_of_birth
    │   └─ location
    │
    ├─→ user_preferences (1:1)
    │   ├─ default_location
    │   ├─ default_radius
    │   └─ favorite_categories
    │
    └─→ user_saved_events (1:many)
        └─ saved event references
```

---

## 🎉 Success Checklist

After setup, you should be able to:

- [ ] Create user profiles table in Supabase
- [ ] Register with email + OTP code
- [ ] See profile form with 4 fields
- [ ] Enter name (required)
- [ ] Enter phone, birthday, location (optional)
- [ ] Submit profile successfully
- [ ] Profile appears in Supabase
- [ ] Profile data accessible via API
- [ ] Returning users skip profile form
- [ ] User name displays in settings

---

## 🚀 Next Steps

### Enhance Profile Features:

1. **Profile Picture Upload**
   - Add avatar_url support
   - Integrate with Supabase Storage

2. **Edit Profile Page**
   - Let users update their info
   - Add profile settings screen

3. **Profile Validation**
   - Email verification badge
   - Phone number verification (SMS)

4. **Use Profile Data**
   - Personalize event recommendations
   - Filter events by age/location
   - Send targeted notifications

---

## 🔗 Quick Links

- **Supabase SQL Editor**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new
- **User Profiles Table**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor/user_profiles
- **Auth Users**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users

---

## 📝 Summary

**What You Have:**
- ✅ Complete profile collection form
- ✅ Name, phone, birthday, location fields
- ✅ Smart validation (required/optional)
- ✅ Secure database storage
- ✅ Privacy-focused design

**What You Need:**
1. Run migration: `002_add_user_profiles.sql` (2 minutes)
2. Test profile creation
3. Start using profile data!

**Your user profiles are ready!** Run the migration and test the flow. 🎉
