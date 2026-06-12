# Profile Management Feature Documentation

## Overview

The Profile feature enables gym owners/administrators to view and manage their personal and gym information. This includes a comprehensive profile header with avatar, owner details, and a dedicated section for gym information management.

## Feature Components

### 1. Profile Header Section

**Location**: `frontend/src/components/profile/ProfileHeader.tsx`

**Displays**:

- Profile Avatar (Circular with initials fallback)
- Owner Full Name (derived from email)
- Gym Name
- Email Address
- Phone Number
- Membership Plan (Premium)
- Member Since (Join Date)

**Features**:

- Circular profile image with gradient background
- Initials displayed if no custom image
- Edit profile picture button (ready for future avatar upload)
- Clean card-based layout with icons
- Responsive design (single column mobile, two-column desktop)

**Props**:

```typescript
interface ProfileHeaderProps {
  user?: User;
  gymName?: string;
  joinDate?: string;
  onEditPhoto?: () => void;
}
```

### 2. Gym Information Card

**Location**: `frontend/src/components/profile/GymInformationCard.tsx`

**Displays**:

- Gym Name
- Address (if available)
- Opening Time (formatted as 12-hour format)
- Closing Time (formatted as 12-hour format)
- Contact Number (if available)
- Website (clickable link)
- GST Number (if available)

**Features**:

- Read-only display with organized layout
- Edit button to navigate to edit form
- Icon-based information display
- Smart time formatting (converts 24-hour to 12-hour with AM/PM)
- Responsive grid layout

**Props**:

```typescript
interface GymInformationCardProps {
  gymData?: {
    name?: string;
    address?: string;
    openingTime?: string;
    closingTime?: string;
    contactNumber?: string;
    website?: string;
    gstNumber?: string;
  };
  onEdit?: () => void;
}
```

### 3. Gym Edit Form

**Location**: `frontend/src/components/profile/GymEditForm.tsx`

**Fields**:

- Gym Name (required)
- Address (optional)
- Opening Time (time picker)
- Closing Time (time picker)
- Contact Number (tel input)
- Website (URL input)
- GST Number (optional)

**Features**:

- Form validation (gym name required)
- Toast notifications for feedback
- Loading state during submission
- Cancel button to revert changes
- Clean field layout with labels
- Error handling with user feedback

**Props**:

```typescript
interface GymEditFormProps {
  initialData?: {
    name?: string;
    address?: string;
    openingTime?: string;
    closingTime?: string;
    contactNumber?: string;
    website?: string;
    gstNumber?: string;
  };
  onSave?: (data: typeof initialData) => Promise<void>;
  onCancel?: () => void;
}
```

## Pages

### 1. Profile View Page

**Location**: `frontend/src/app/(dashboard)/owner/settings/profile/page.tsx`

**Route**: `/owner/settings/profile`

**Features**:

- Fetches user data from `/api/auth/profile`
- Fetches gym settings from `/api/settings/gym`
- Displays profile header with owner info
- Shows gym information card with edit button
- Additional info cards:
  - Subscription Plan (Premium, billing cycle, renewal date)
  - Account Stats (status, member since, account type)
- Loading state with spinner
- Error handling with toast notifications

**Data Flow**:

```
1. Component mounts
2. Fetch user profile
3. Fetch gym settings (or use defaults if not found)
4. Render UI with fetched data
5. User clicks "Edit" button on gym card
6. Navigate to edit page
```

### 2. Profile Edit Page

**Location**: `frontend/src/app/(dashboard)/owner/settings/profile/edit/page.tsx`

**Route**: `/owner/settings/profile/edit`

**Features**:

- Fetches current gym settings from `/api/settings/gym`
- Displays edit form with current values
- Back button to return to profile view
- Saves changes to `/api/settings/gym` (PUT request)
- Redirects to profile page on successful save
- Error handling with appropriate feedback

**Data Flow**:

```
1. Page loads
2. Fetch current gym settings
3. Display edit form with initial values
4. User makes changes
5. Click "Save Changes"
6. PUT request to /api/settings/gym
7. On success: toast message + redirect to profile
8. On error: toast error message + stay on page
```

## Component Exports

**Location**: `frontend/src/components/profile/index.ts`

Exports:

- `ProfileHeader`
- `GymInformationCard`
- `GymEditForm`

## Styling and Design

### Color Scheme

- Primary: Orange (#FF6B35 in gradients)
- Background: Gradient (orange-50 to white)
- Text: Dark gray for primary, muted-foreground for secondary
- Status: Green for active

### Layout

- Maximum width: 4xl (56rem)
- Padding: 4-8 units (responsive)
- Card-based design
- Grid layouts for responsive design

### Icons Used

- `Camera` - Edit photo button
- `Mail` - Email icon
- `Phone` - Phone number icon
- `Calendar` - Date icon
- `MapPin` - Address icon
- `Clock` - Time icon
- `Globe` - Website icon
- `FileText` - GST number icon
- `ArrowLeft` - Back button
- `Loader2` - Loading spinner

## API Endpoints Required

### 1. Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Response**:

```json
{
  "data": {
    "email": "owner@gym.com",
    "phone": "+91-9876543210",
    "createdAt": "2025-06-15T10:30:00Z"
  }
}
```

### 2. Get Gym Settings

**Endpoint**: `GET /api/settings/gym`

**Response**:

```json
{
  "data": {
    "name": "Veggainz Fitness Club",
    "address": "123 Main St, City, State",
    "openingTime": "06:00",
    "closingTime": "22:00",
    "contactNumber": "+91-1234567890",
    "website": "https://gym.example.com",
    "gstNumber": "27ABCDE1234F2Z5"
  }
}
```

### 3. Update Gym Settings

**Endpoint**: `PUT /api/settings/gym`

**Request Body**:

```json
{
  "name": "Veggainz Fitness Club",
  "address": "123 Main St, City, State",
  "openingTime": "06:00",
  "closingTime": "22:00",
  "contactNumber": "+91-1234567890",
  "website": "https://gym.example.com",
  "gstNumber": "27ABCDE1234F2Z5"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Gym settings updated successfully",
  "data": { ... }
}
```

## User Workflows

### Viewing Profile

1. Navigate to `/owner/settings/profile`
2. View personal information in header
3. View gym details in gym information card
4. View subscription and account stats

### Editing Gym Information

1. From profile page, click "Edit" button on gym card
2. Navigate to `/owner/settings/profile/edit`
3. Update any gym details
4. Click "Save Changes"
5. On success, redirected to profile page
6. Success toast notification displayed

### Future: Uploading Profile Picture

1. Click camera icon on avatar
2. Select image file
3. Image uploads and displays
4. Toast confirmation

## Error Handling

### Profile Load Errors

- Generic error message: "Failed to load profile data"
- Toast notification displayed
- Page still renders with default values for gym settings

### Gym Settings Update Errors

- Generic error message: "Failed to update gym information"
- Form validation errors per field
- Toast notification on API errors
- User remains on edit page to retry

## Future Enhancements

1. **Avatar Upload**: Implement image upload functionality with cloud storage
2. **Profile Picture Editing**: Add image cropping and size adjustment
3. **Phone Number Validation**: Add phone number format validation
4. **Website Validation**: Verify website URL validity
5. **GST Number Format**: Add GST number format validation
6. **Gym Logo**: Add separate gym logo upload
7. **Working Days**: Add ability to set different hours for different days
8. **Holidays**: Add holiday dates where gym is closed
9. **Profile Photo History**: Keep track of previous profile pictures
10. **Email Verification**: Add email change with verification

## File Structure

```
frontend/src/
├── components/
│   └── profile/
│       ├── ProfileHeader.tsx
│       ├── GymInformationCard.tsx
│       ├── GymEditForm.tsx
│       └── index.ts
├── app/
│   └── (dashboard)/
│       └── owner/
│           └── settings/
│               └── profile/
│                   ├── page.tsx
│                   └── edit/
│                       └── page.tsx

Docs/
└── Profile/
    ├── README.md (this file)
    ├── COMPONENT_ARCHITECTURE.md
    ├── API_INTEGRATION.md
    ├── USER_WORKFLOWS.md
    ├── STYLING_GUIDE.md
    ├── TESTING_GUIDE.md
    └── DEPLOYMENT_CHECKLIST.md
```

## Notes

- All time formats use 24-hour for storage, 12-hour (AM/PM) for display
- Email is used to derive user's name (first part before @, replacing dots with spaces)
- Avatar uses initials fallback with orange gradient
- All responses include proper error handling and user feedback
- Component uses shadcn/ui for consistency with existing UI
- Toast notifications (via sonner library) for user feedback
