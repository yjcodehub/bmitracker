# Profile Feature - API Integration Guide

## Overview

The Profile feature integrates with two main backend APIs:

1. User Profile API - Retrieve user information
2. Gym Settings API - Get and update gym information

## API Endpoints

### 1. Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Purpose**: Retrieve authenticated user's profile information

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response - Success (200)**:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "owner@fitnessgym.com",
    "phone": "+91-9876543210",
    "createdAt": "2025-06-15T10:30:00Z",
    "updatedAt": "2025-06-20T14:45:00Z",
    "role": "gym_owner"
  }
}
```

**Response - Error (401/403)**:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Implementation Notes**:

- Called on ProfilePage mount
- Used to populate ProfileHeader component
- Email field is required for avatar initials generation
- CreatedAt used for "Member Since" display

---

### 2. Get Gym Settings

**Endpoint**: `GET /api/settings/gym`

**Purpose**: Retrieve gym configuration and information

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response - Success (200)**:

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Veggainz Fitness Club",
    "address": "123 Main Street, Downtown, City, State 123456",
    "openingTime": "06:00",
    "closingTime": "22:00",
    "contactNumber": "+91-1234567890",
    "website": "https://veggainzfitness.com",
    "gstNumber": "27ABCDE1234F2Z5",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-06-15T11:00:00Z",
    "updatedAt": "2025-06-20T15:00:00Z"
  }
}
```

**Response - Not Found (404)**:

```json
{
  "success": false,
  "message": "Gym settings not found"
}
```

**Response - Error (500)**:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Implementation Notes**:

- Called on ProfilePage mount and ProfileEditPage mount
- If 404 returned, component uses default values
- Time fields always in 24-hour format (HH:MM)
- All fields except name are optional in response

---

### 3. Update Gym Settings

**Endpoint**: `PUT /api/settings/gym`

**Purpose**: Update gym configuration and information

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Veggainz Fitness Club",
  "address": "123 Main Street, Downtown, City, State 123456",
  "openingTime": "06:00",
  "closingTime": "22:00",
  "contactNumber": "+91-1234567890",
  "website": "https://veggainzfitness.com",
  "gstNumber": "27ABCDE1234F2Z5"
}
```

**Request Field Details**:
| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| name | string | Yes | 1-200 chars | Gym name/title |
| address | string | No | 0-500 chars | Physical address |
| openingTime | string | No | HH:MM format | 24-hour format |
| closingTime | string | No | HH:MM format | 24-hour format |
| contactNumber | string | No | Valid format | Phone number |
| website | string | No | Valid URL | Website URL |
| gstNumber | string | No | Valid format | India GST format |

**Response - Success (200)**:

```json
{
  "success": true,
  "message": "Gym settings updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Veggainz Fitness Club",
    "address": "123 Main Street, Downtown, City, State 123456",
    "openingTime": "06:00",
    "closingTime": "22:00",
    "contactNumber": "+91-1234567890",
    "website": "https://veggainzfitness.com",
    "gstNumber": "27ABCDE1234F2Z5",
    "updatedAt": "2025-06-21T16:30:00Z"
  }
}
```

**Response - Validation Error (400)**:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Gym name is required",
    "openingTime": "Invalid time format"
  }
}
```

**Response - Not Found (404)**:

```json
{
  "success": false,
  "message": "Gym settings not found"
}
```

**Response - Error (500)**:

```json
{
  "success": false,
  "message": "Failed to update gym settings"
}
```

**Implementation Notes**:

- Called from GymEditForm on "Save Changes" click
- All fields optional except name (must be non-empty)
- Time format must be HH:MM in 24-hour format
- Returns updated document with new timestamp
- Used by ProfileEditPage to handle success/error flow

---

## Frontend API Call Patterns

### Pattern 1: GET User Profile

**Location**: `frontend/src/app/(dashboard)/owner/settings/profile/page.tsx`

```typescript
const fetchProfileData = async () => {
  try {
    const userRes = await fetch("/api/auth/profile");
    if (!userRes.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await userRes.json();
    setUser(userData.data);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    toast.error("Failed to load profile data");
  }
};
```

### Pattern 2: GET Gym Settings

**Location**: `frontend/src/app/(dashboard)/owner/settings/profile/page.tsx`

```typescript
const settingsRes = await fetch("/api/settings/gym");
if (settingsRes.ok) {
  const settingsData = await settingsRes.json();
  setGymSettings(settingsData.data);
} else {
  // Set default values if not found
  setGymSettings({
    name: "My Gym",
    address: "",
    openingTime: "06:00",
    closingTime: "22:00",
    contactNumber: "",
    website: "",
    gstNumber: "",
  });
}
```

### Pattern 3: PUT Gym Settings

**Location**: `frontend/src/app/(dashboard)/owner/settings/profile/edit/page.tsx`

```typescript
const handleSave = async (data: GymSettings | undefined) => {
  try {
    const response = await fetch("/api/settings/gym", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save gym settings");
    }

    toast.success("Gym information updated successfully");
    router.push("/owner/settings/profile");
  } catch (error) {
    console.error("Error saving gym settings:", error);
    throw error;
  }
};
```

---

## Error Handling Strategy

### Profile Load Errors

1. **API returns 404**: Use default gym settings, continue rendering
2. **API returns 5xx**: Show error toast, use defaults
3. **Network error**: Show error toast, allow retry

### Profile Update Errors

1. **Validation errors**: Show field-level errors
2. **API returns 5xx**: Show generic error toast
3. **Network error**: Show timeout error

### Toast Notifications

```typescript
// Success
toast.success("Gym information updated successfully");

// Error
toast.error("Failed to load profile data");
toast.error("Failed to update gym information");

// Info
toast.info("Avatar upload feature coming soon");
```

---

## Data Transformation

### Time Format Transformation

**Frontend → Backend (Submission)**:

- Input: HTML time picker value "14:30"
- Submission: Sent as-is in 24-hour format

**Backend → Frontend (Display)**:

- Response: "14:30" (24-hour format)
- Display: Formatted to "2:30 PM" by GymInformationCard

```typescript
const formatTime = (time?: string) => {
  if (!time) return "N/A";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};
```

### User Name Derivation

**From Email → Display**:

- Email: "john.doe@company.com"
- Extracted: "john.doe"
- Transformed: "John Doe" (capitalize, replace dots with spaces)

```typescript
const fullName =
  user?.email
    ?.split("@")[0]
    ?.replace(/\./g, " ")
    .replace(/^\w/, (c) => c.toUpperCase()) || "Owner";
```

### Avatar Initials Generation

**From Email → Initials**:

- Email: "john.doe@company.com"
- Split by @: "john.doe"
- Split by dot: ["john", "doe"]
- Get first letters: ["J", "D"]
- Join: "JD"

```typescript
const initials =
  user?.email
    ?.split("@")[0]
    ?.split(".")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
```

---

## API Response Handling Checklist

### On GET /api/auth/profile

- [ ] Check response.ok before parsing
- [ ] Extract userData.data
- [ ] Verify email field exists
- [ ] Handle missing phone gracefully
- [ ] Use createdAt for join date
- [ ] Catch JSON parse errors

### On GET /api/settings/gym

- [ ] Handle 404 with defaults
- [ ] Check for undefined fields
- [ ] Validate time format
- [ ] Handle missing optional fields
- [ ] Set reasonable defaults

### On PUT /api/settings/gym

- [ ] Validate form before submit
- [ ] Show loading state
- [ ] Check response.ok
- [ ] Parse error response if !ok
- [ ] Show appropriate toast message
- [ ] Navigate on success
- [ ] Keep form on error for retry

---

## Request/Response Flow Diagram

```
ProfilePage Load
  ↓
useEffect
  ├→ fetch GET /api/auth/profile
  │   ├→ Success: setUser(data.data)
  │   └→ Error: toast.error + continue
  │
  └→ fetch GET /api/settings/gym
      ├→ Success: setGymSettings(data.data)
      ├→ 404: setGymSettings(defaults)
      └→ Error: setGymSettings(defaults)
        ↓
      setIsLoading(false)
        ↓
      Render with loaded data

User Clicks "Edit"
  ↓
Navigate to /owner/settings/profile/edit
  ↓
ProfileEditPage useEffect
  ├→ fetch GET /api/settings/gym
  │   ├→ Success: setGymSettings(data.data)
  │   └→ 404/Error: setGymSettings(defaults)
  ↓
  GymEditForm renders with initialData
  ↓
User Modifies Form & Clicks Save
  ↓
handleSubmit
  ├→ Validation check (name required)
  ├→ fetch PUT /api/settings/gym with body
  │   ├→ Success:
  │   │   ├→ toast.success
  │   │   └→ router.push profile page
  │   └→ Error:
  │       ├→ toast.error
  │       └→ re-throw error
  └→ GymEditForm catches error
      └→ toast.error (redundant but safe)
```

---

## Backend API Contract

### Required Endpoints Implementation

```typescript
// GET /api/auth/profile
router.get("/profile", authMiddleware, async (req, res) => {
  // Return authenticated user's profile
  // Required fields: id, email, phone, createdAt
});

// GET /api/settings/gym
router.get("/settings/gym", authMiddleware, async (req, res) => {
  // Return gym settings for authenticated user
  // Optional: all fields, handle 404 gracefully
});

// PUT /api/settings/gym
router.put("/settings/gym", authMiddleware, async (req, res) => {
  // Update gym settings
  // Validate: name required, times in HH:MM format
  // Return: updated settings object
});
```

---

## Testing API Integrations

### Manual Testing

1. Start backend server
2. Navigate to `/owner/settings/profile`
3. Open browser DevTools Network tab
4. Verify API calls made
5. Check response payloads
6. Test error scenarios (network tab throttling)

### API Testing Tools

- **Postman**: Test endpoints directly
- **Insomnia**: Alternative to Postman
- **Thunder Client**: VS Code extension

### Sample Postman Requests

**GET User Profile**:

```
GET http://localhost:3000/api/auth/profile
Authorization: Bearer <token>
```

**GET Gym Settings**:

```
GET http://localhost:3000/api/settings/gym
Authorization: Bearer <token>
```

**PUT Gym Settings**:

```
PUT http://localhost:3000/api/settings/gym
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Gym Name",
  "address": "New Address",
  "openingTime": "07:00",
  "closingTime": "23:00",
  "contactNumber": "+91-9876543210",
  "website": "https://example.com",
  "gstNumber": "27ABCDE1234F2Z5"
}
```

---

## Troubleshooting Guide

### Issue: Profile page shows "Failed to load profile data"

**Cause**: GET /api/auth/profile failing
**Solution**:

- Verify backend server running
- Check authentication token
- Verify user exists in database

### Issue: Gym settings not loading (shows defaults)

**Cause**: GET /api/settings/gym returns 404
**Solution**:

- This is normal - no gym settings exist yet
- User should edit to create settings
- Or create settings via backend

### Issue: Edit form won't submit

**Cause**: Validation failing (empty gym name) or network error
**Solution**:

- Ensure gym name field has value
- Check network tab for error
- Verify backend PUT endpoint implemented

### Issue: Changes don't persist after save

**Cause**:

- Request succeeded but page not refreshed
- Redirect not working
  **Solution**:
- Check network tab for 200 response
- Verify router.push() executing
- Check browser redirect capability
