# Profile Component Architecture

## Component Hierarchy

```
ProfilePage (/owner/settings/profile)
├── ProfileHeader
│   ├── Avatar (circular with initials)
│   └── Owner Info Section
│       ├── Email
│       ├── Phone
│       ├── Plan
│       └── Join Date
├── GymInformationCard
│   ├── Gym Name
│   ├── Address
│   ├── Opening Time
│   ├── Closing Time
│   ├── Contact Number
│   ├── Website
│   └── GST Number
├── Subscription Plan Card
└── Account Stats Card

ProfileEditPage (/owner/settings/profile/edit)
└── GymEditForm
    ├── Gym Name Input (required)
    ├── Address Input
    ├── Opening Time Picker
    ├── Closing Time Picker
    ├── Contact Number Input
    ├── Website Input
    └── GST Number Input
```

## Component Details

### ProfileHeader Component

**Type**: Presentational Component (Read-Only)

**State**: None (fully controlled by props)

**Dependencies**:

- React Hooks: `useState` (for future avatar editing)
- UI Components: Card, CardContent
- Icons: Camera, Mail, Phone, Calendar

**Props**:

```typescript
interface ProfileHeaderProps {
  user?: User; // User object with email, phone, createdAt
  gymName?: string; // Gym name to display
  joinDate?: string; // ISO date string for join date
  onEditPhoto?: () => void; // Callback when edit photo clicked
}
```

**Key Features**:

- Derives user name from email (before @)
- Generates avatar initials from email
- Formats dates to "Mon YYYY" format
- Falls back to "?" if no email
- Responsive grid layout
- Icon-based information display

**Rendering Logic**:

```typescript
initials = email
  .split("@")[0]
  .split(".")
  .map((w) => w[0])
  .toUpperCase()
  .slice(0, 2);
```

### GymInformationCard Component

**Type**: Presentational Component (Read-Only + Action Button)

**State**: None (fully controlled by props)

**Dependencies**:

- UI Components: Card, CardHeader, CardTitle, CardContent, Button
- Icons: MapPin, Clock, Phone, Globe, FileText

**Props**:

```typescript
interface GymInformationCardProps {
  gymData?: {
    name?: string;
    address?: string;
    openingTime?: string; // "HH:MM" 24-hour format
    closingTime?: string; // "HH:MM" 24-hour format
    contactNumber?: string;
    website?: string;
    gstNumber?: string;
  };
  onEdit?: () => void; // Navigate to edit page
}
```

**Key Features**:

- Converts 24-hour time to 12-hour with AM/PM
- Makes website a clickable link
- Conditionally renders optional fields
- Clean icon-based layout
- Edit button with outline variant

**Time Formatting**:

```typescript
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};
```

### GymEditForm Component

**Type**: Interactive Form Component (Controlled Component)

**State**:

```typescript
{
  formData: {
    (name,
      address,
      openingTime,
      closingTime,
      contactNumber,
      website,
      gstNumber);
  }
  isLoading: boolean;
}
```

**Dependencies**:

- React Hooks: `useState`
- UI Components: Button, Input, Label
- Icons: Loader2
- Toast Library: sonner

**Props**:

```typescript
interface GymEditFormProps {
  initialData?: GymSettings;
  onSave?: (data: GymSettings) => Promise<void>;
  onCancel?: () => void;
}
```

**Key Features**:

- Controlled form inputs
- Real-time state updates on change
- Form validation (gym name required)
- Toast notifications for feedback
- Loading state during submission
- Error handling with try-catch
- Cancel button to revert changes

**Validation**:

- Gym name: required (non-empty string)
- All other fields: optional
- Website: URL validation (via HTML5 input type)
- Contact: tel input type

### ProfilePage Component

**Type**: Container/Page Component

**State**:

```typescript
{
  user: User | null,
  gymSettings: GymSettings | null,
  isLoading: boolean
}
```

**Side Effects**:

- `useEffect` on mount: Fetches user profile and gym settings

**Data Flow**:

```
1. Mount component
2. useEffect triggers
3. Fetch user profile from /api/auth/profile
4. Fetch gym settings from /api/settings/gym
5. Set state with fetched data
6. If gym settings fetch fails, use defaults
7. Set isLoading to false
8. Render with fetched data
```

**Error Handling**:

- Catches errors in try-catch
- Displays toast error message
- Still renders with default values

**Navigation**:

- Click "Edit" on gym card → navigate to `/owner/settings/profile/edit`

### ProfileEditPage Component

**Type**: Container/Page Component

**State**:

```typescript
{
  gymSettings: GymSettings | null,
  isLoading: boolean
}
```

**Side Effects**:

- `useEffect` on mount: Fetches gym settings

**Data Flow**:

```
1. Mount component
2. useEffect triggers
3. Fetch gym settings from /api/settings/gym
4. Set state with fetched data
5. If fetch fails, use defaults
6. Display form with initial data
7. User submits form
8. PUT request to /api/settings/gym
9. On success: redirect to profile page
10. On error: stay on page, show error toast
```

**Error Handling**:

- Catches errors in try-catch
- Re-throws error to caller (GymEditForm)
- GymEditForm displays error toast

**Navigation**:

- Back button → go back to profile page
- Save changes → redirect to profile page
- Cancel → go back

## Data Flow

### Reading Profile Data

```
ProfilePage
  ↓
useEffect
  ├→ fetch /api/auth/profile
  │   ↓
  │   setUser(data.data)
  │
  └→ fetch /api/settings/gym
      ↓
      setGymSettings(data.data) || setGymSettings(defaults)
  ↓
Render ProfileHeader (passes user, gymName, joinDate)
Render GymInformationCard (passes gymData)
```

### Editing Gym Data

```
GymInformationCard Edit Button
  ↓
Navigate to /owner/settings/profile/edit
  ↓
ProfileEditPage mounts
  ↓
Fetch /api/settings/gym
  ↓
GymEditForm renders with initialData
  ↓
User modifies form
  ↓
handleChange updates local state
  ↓
User clicks "Save Changes"
  ↓
handleSubmit sends PUT /api/settings/gym
  ↓
On Success:
  ├→ Toast success message
  └→ Navigate to /owner/settings/profile
  ↓
On Error:
  └→ Toast error message
```

## Component Reusability

### ProfileHeader

- Reusable: High
- Can be used anywhere owner info needs to be displayed
- Fully controlled via props
- No internal state or side effects

### GymInformationCard

- Reusable: High
- Can display gym info in multiple places (dashboard, settings)
- Fully controlled via props
- Optional edit button

### GymEditForm

- Reusable: Medium
- Can be embedded in modals or different page layouts
- Self-contained form logic
- Requires onSave callback implementation

## Performance Considerations

### Optimization Strategies

1. **Memoization**: ProfileHeader and GymInformationCard are presentational and could benefit from React.memo()
2. **Data Fetching**: Profile data fetched on page load, could be cached in global state
3. **Form Validation**: Current validation happens on submit, could add real-time validation for UX improvement

### Potential Bottlenecks

1. **API Calls**: Each page makes 1-2 API calls on mount
2. **Loading State**: Full page spinner during initial load
3. **Form Submission**: Potential slow network on save

## Testing Considerations

### Unit Tests

- ProfileHeader: Verify initials generation, time formatting
- GymInformationCard: Verify field rendering, edit button callback
- GymEditForm: Verify validation, form state updates, API calls

### Integration Tests

- ProfilePage: Verify data fetching and rendering
- ProfileEditPage: Verify form submission and navigation
- End-to-end: Verify complete edit workflow

### Edge Cases

- Missing user data
- Missing gym settings
- Failed API calls
- Invalid time formats
- Empty optional fields
- Network timeout during form submission

## Accessibility

### Current Implementation

- Semantic HTML with labels
- Form inputs with proper types (time, tel, url)
- Icons paired with text labels
- Good color contrast
- Keyboard navigable forms

### Future Improvements

- ARIA labels for icons
- Focus management on modal open
- Error announcements for screen readers
- Loading state announcements

## Security Considerations

### Current Implementation

- No sensitive data in component state
- API calls use standard fetch with headers
- No inline script execution
- Proper error handling without exposing internals

### Best Practices

- Validate API responses
- Sanitize any user input display
- Use HTTPS for all API calls
- Implement proper authentication tokens
