# Profile Management - User Workflows

## Workflow 1: Viewing Profile Information

### Primary Actor

Gym Owner/Administrator

### Goal

Access and review personal and gym information

### Preconditions

- User is logged in
- User has at least one gym registered
- User has navigated to the profile page

### Main Flow

1. **User navigates to profile page**
   - Route: `/owner/settings/profile`
   - Page displays loading spinner
   - System fetches user profile from backend

2. **Profile data loads**
   - User information displays in header:
     - Avatar with initials
     - Full name (derived from email)
     - Email address
     - Phone number
     - Membership plan
     - Join date
   - Gym information displays:
     - Gym name
     - Address
     - Operating hours (opening & closing time)
     - Contact number
     - Website
     - GST number
   - Additional stats display:
     - Current subscription plan
     - Billing cycle
     - Next renewal date
     - Account status
     - Member since
     - Account type

3. **User reviews information**
   - All information is read-only on this page
   - No edits possible without clicking edit button

### Alternative Flows

- **A1: Gym settings not found**
  - System uses default gym settings
  - User can proceed to edit page to create/update gym info

- **A2: User data fetch fails**
  - Error toast displayed: "Failed to load profile data"
  - Page still renders with available data
  - User can refresh or navigate back

### Post-Conditions

- User has viewed all profile information
- User can proceed to edit gym information if needed

---

## Workflow 2: Editing Gym Information

### Primary Actor

Gym Owner/Administrator

### Goal

Update gym details (name, address, hours, contact, website, GST number)

### Preconditions

- User is viewing the profile page
- User has access to gym information
- At least the gym name needs to be set

### Main Flow

1. **User initiates edit**
   - On profile page, user clicks "Edit" button on Gym Information card
   - Page navigates to `/owner/settings/profile/edit`

2. **Edit form loads**
   - Loading spinner displays while fetching current gym settings
   - Form populates with current gym data
   - All fields are editable text inputs (except time picker for hours)
   - Cancel button available to discard changes

3. **User updates fields**
   - User modifies any or all fields:
     - Gym Name (required field)
     - Address (optional)
     - Opening Time (time picker)
     - Closing Time (time picker)
     - Contact Number (tel input)
     - Website (URL input)
     - GST Number (optional)
   - Form state updates in real-time as user types

4. **User submits changes**
   - User clicks "Save Changes" button
   - Button enters loading state with spinner
   - Form is submitted to backend via PUT request

5. **Backend processes update**
   - API endpoint: `PUT /api/settings/gym`
   - Validates gym name (required)
   - Updates gym settings in database
   - Returns success response

6. **Success feedback**
   - Toast notification: "Gym information updated successfully"
   - Page automatically navigates back to profile page
   - Updated information displays immediately

### Alternative Flows

- **A1: Form validation fails**
  - Empty gym name detected
  - Toast error: "Gym name is required"
  - Form remains on edit page
  - User must enter gym name before saving

- **A2: API submission fails**
  - Network error or server error occurs
  - Toast error: "Failed to update gym information"
  - Loading state clears
  - User remains on edit page
  - User can retry submission

- **A3: User cancels edit**
  - User clicks "Cancel" button
  - All changes discarded
  - Page navigates back to profile page
  - Previous gym information unchanged

- **A4: User clicks back button**
  - User clicks back arrow in header
  - Navigates back to profile page
  - Changes are discarded

### Post-Conditions

- Gym information is updated in database
- Profile page reflects new information
- User receives confirmation notification

---

## Workflow 3: Uploading and Previewing Profile Picture

### Primary Actor

Gym Owner, Staff, or Member

### Goal

Upload, crop/adjust, and set a custom profile picture, and view the high-resolution photo in a lightbox modal.

### Preconditions

- User is viewing their Profile page.
- User has an image file (PNG, JPEG, WebP, max 2MB) on their device.

### Main Flow

1. **User initiates upload**
   - User clicks the Camera icon on the circular profile avatar.
   - Device file picker opens.

2. **User selects image**
   - User selects an image.
   - System validates size (must be under 2MB).
   - Image loads in the custom `ImageEditorDialog` viewport.

3. **User crops and adjusts photo**
   - User zooms/scales the image (1x to 3x).
   - User pans the image by dragging (drag & drop coordinates map to canvas space).
   - User adjusts brightness (50% to 150%) and contrast (50% to 150%).
   - User clicks "Apply Crop".

4. **Image updates and uploads**
   - System draws the adjusted image on a canvas, applies filters, and exports as a Base64 string.
   - System updates the database.
   - Profile avatar displays the updated picture.
   - Success toast displays.

5. **User previews high-resolution photo**
   - User clicks directly on the circular profile avatar.
   - A lightbox modal/overlay opens displaying the full cropped image.
   - User clicks the "X" close button or background overlay to close the preview.

### Status

✅ Fully implemented and active for Members, Owners, and Staff.

---

## Workflow 4: Navigating Between Profile Screens

### Page Navigation Map

```
Dashboard
  ↓
  → Settings/Profile (/owner/settings/profile)
      ├→ Edit Button → Edit Profile (/owner/settings/profile/edit)
      │   ├→ Save Changes → Back to Profile
      │   ├→ Cancel → Back to Profile
      │   └→ Back Arrow → Back to Profile
      │
      ├→ Edit Photo → Avatar Upload & Cropping (ImageEditorDialog)
      │
      ├→ Click Avatar Image → Fullscreen Lightbox Photo Preview
      │
      └→ Back to Previous Page
```

### Routes Summary

| Route                          | Component       | Purpose                   |
| ------------------------------ | --------------- | ------------------------- |
| `/owner/profile`               | ProfilePage     | View owner profile details|
| `/staff/profile`               | ProfilePage     | View staff profile details|
| `/member/profile`              | ProfilePage     | View and edit member profile details, targets, password |
| `/owner/settings/profile`      | ProfilePage     | View gym info settings    |
| `/owner/settings/profile/edit` | ProfileEditPage | Edit gym information      |

---

## Workflow 5: Data Refresh

### When Data Refreshes

1. **Page Load**: Profile data fetched on component mount
2. **After Edit**: Data re-fetched from profile page after successful save
3. **Manual Refresh**: User can use browser refresh to reload data

### Caching Strategy

- No client-side caching currently
- All data fetched fresh from backend on page load
- Future optimization: implement global state management (Redux/Context)

---

## Workflow 6: Error Recovery

### Common Error Scenarios

**Scenario 1: Network Error During Profile Load**

- Toast error: "Failed to load profile data"
- Page shows partial data if available
- User can refresh page to retry

**Scenario 2: Gym Settings Not Found**

- System loads default gym settings
- User can navigate to edit page to create settings
- Submit will create new entry

**Scenario 3: Invalid Input During Edit**

- Form validation prevents submission
- Toast error with specific field message
- User corrects input and retries

**Scenario 4: Server Error on Save**

- Toast error: "Failed to update gym information"
- Form stays on edit page
- User can retry or discard changes

---

## Use Case: Gym Owner Onboarding

### Scenario

New gym owner completes registration and needs to set up profile.

### Steps

1. User logs in
2. Navigates to `/owner/settings/profile`
3. Sees profile header with default avatar
4. Views gym information section with empty/default fields
5. Clicks "Edit" to navigate to edit page
6. Fills in gym details:
   - Gym Name: "FitZone Gym"
   - Address: "123 Main St, City, State 12345"
   - Opening Time: "06:00"
   - Closing Time: "22:00"
   - Contact: "+91-9876543210"
   - Website: "www.fitzonegym.com"
   - GST: "27ABCDE1234F2Z5"
7. Clicks "Save Changes"
8. Receives success toast
9. Redirected to profile page
10. All gym information displays correctly

### Time Estimate

3-5 minutes for typical user

---

## Use Case: Updating Operating Hours

### Scenario

Gym owner needs to update gym operating hours.

### Steps

1. User on profile page
2. Sees current hours: 6:00 AM - 10:00 PM
3. Clicks "Edit" on gym information
4. Navigates to edit page
5. Changes:
   - Opening Time: 06:00 → 05:30
   - Closing Time: 22:00 → 23:00
6. Clicks "Save Changes"
7. Success notification displays
8. Profile page shows updated hours

### Time Estimate

1-2 minutes

---

## Use Case: Updating Contact Information

### Scenario

Gym moves to new location and needs to update address and phone.

### Steps

1. User navigates to profile page
2. Reviews gym information
3. Clicks "Edit"
4. Updates fields:
   - Address: "456 Park Ave, New City, State 54321"
   - Contact: "+91-1234567890"
5. Saves changes
6. Confirmation received
7. Profile displays new contact info

### Time Estimate

2-3 minutes

---

## Future Workflows

### Workflow 7: Profile Picture Upload

- Select image from device
- Crop/resize if needed
- Upload to cloud storage
- Display updated avatar

### Workflow 8: Email Change & Verification

- Request email change
- Enter new email address
- Verify with confirmation link
- Update profile with new email

### Workflow 9: Working Hours by Day

- Set different hours for each day
- Mark holidays as closed
- Show operating hours on gym page

### Workflow 10: Profile Settings Export

- Export profile data as PDF
- Email report to user
- Archive for compliance

---

## Performance Metrics

### Expected Load Times

- Profile Page Load: 1-2 seconds (including API calls)
- Edit Page Load: 1 second
- Form Submission: 1-3 seconds (network dependent)

### User Actions

- View Profile: ~10 seconds
- Edit Gym Info: ~3-5 minutes
- Update Single Field: ~1-2 minutes

---

## Accessibility Notes

### Current Implementation

✅ Semantic HTML with labels
✅ Keyboard navigable
✅ Form inputs with proper types
✅ Good color contrast

### For Users With

- **Screen Readers**: All content properly labeled
- **Keyboard Only**: All actions accessible via Tab and Enter
- **Low Vision**: Good contrast ratios (WCAG AA)
- **Motor Impairment**: Large clickable areas, generous spacing

---

## Mobile Considerations

### Responsive Layout

- Single column on mobile
- Two columns on tablet+
- Touch-friendly button sizes (44px minimum)
- Time picker uses native mobile time input

### Mobile Workflows

- Same workflows apply
- Optimized layout for smaller screens
- Touch gestures supported
- Form submission via keyboard or touch
