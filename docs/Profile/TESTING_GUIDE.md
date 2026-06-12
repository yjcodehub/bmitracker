# Profile Feature - Testing Guide

## Overview

Comprehensive testing guide for the Profile feature covering unit tests, integration tests, and end-to-end tests.

## Test Environment Setup

### Prerequisites

- Node.js environment configured
- Jest and React Testing Library installed
- Mock API server or MSW (Mock Service Worker)
- Test database with sample data

### Running Tests

```bash
# Run all profile tests
npm test -- Profile

# Run specific test file
npm test -- ProfileHeader.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Unit Tests

### 1. ProfileHeader Component Tests

**File**: `frontend/src/components/profile/__tests__/ProfileHeader.test.tsx`

```typescript
describe('ProfileHeader', () => {
  // Test rendering
  test('renders user information when provided', () => {
    const mockUser = {
      email: 'john.doe@example.com',
      phone: '+91-9876543210',
    };
    const { getByText } = render(
      <ProfileHeader user={mockUser} gymName="Test Gym" />
    );
    expect(getByText('john doe')).toBeInTheDocument();
    expect(getByText('+91-9876543210')).toBeInTheDocument();
  });

  // Test avatar initials
  test('generates correct initials from email', () => {
    const mockUser = { email: 'john.doe@example.com' };
    const { getByText } = render(<ProfileHeader user={mockUser} />);
    expect(getByText('JD')).toBeInTheDocument();
  });

  // Test fallback to question mark
  test('shows question mark when no email provided', () => {
    const { getByText } = render(<ProfileHeader />);
    expect(getByText('?')).toBeInTheDocument();
  });

  // Test date formatting
  test('formats join date correctly', () => {
    const mockUser = { email: 'test@example.com' };
    const { getByText } = render(
      <ProfileHeader user={mockUser} joinDate="2025-06-15T10:30:00Z" />
    );
    expect(getByText('Jun 2025')).toBeInTheDocument();
  });

  // Test edit photo callback
  test('calls onEditPhoto when camera button clicked', () => {
    const onEditPhoto = jest.fn();
    const { getByRole } = render(
      <ProfileHeader onEditPhoto={onEditPhoto} />
    );
    const editButton = getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(onEditPhoto).toHaveBeenCalled();
  });

  // Test missing optional fields
  test('handles missing phone number', () => {
    const mockUser = { email: 'test@example.com' };
    const { getByText } = render(<ProfileHeader user={mockUser} />);
    expect(getByText('Not set')).toBeInTheDocument();
  });
});
```

### 2. GymInformationCard Component Tests

**File**: `frontend/src/components/profile/__tests__/GymInformationCard.test.tsx`

```typescript
describe('GymInformationCard', () => {
  const mockGymData = {
    name: 'Veggainz Gym',
    address: '123 Main St',
    openingTime: '06:00',
    closingTime: '22:00',
    contactNumber: '+91-1234567890',
    website: 'https://gym.example.com',
    gstNumber: '27ABCDE1234F2Z5',
  };

  // Test rendering
  test('renders gym information when provided', () => {
    const { getByText } = render(
      <GymInformationCard gymData={mockGymData} />
    );
    expect(getByText('Veggainz Gym')).toBeInTheDocument();
    expect(getByText('123 Main St')).toBeInTheDocument();
    expect(getByText('6:00 AM')).toBeInTheDocument();
    expect(getByText('10:00 PM')).toBeInTheDocument();
  });

  // Test time formatting
  test('formats times correctly from 24-hour to 12-hour', () => {
    const { getByText } = render(
      <GymInformationCard
        gymData={{ openingTime: '06:00', closingTime: '22:00' }}
      />
    );
    expect(getByText('6:00 AM')).toBeInTheDocument();
    expect(getByText('10:00 PM')).toBeInTheDocument();
  });

  // Test edit button
  test('renders edit button and calls callback', () => {
    const onEdit = jest.fn();
    const { getByRole } = render(
      <GymInformationCard gymData={mockGymData} onEdit={onEdit} />
    );
    const editButton = getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalled();
  });

  // Test optional fields
  test('hides fields when data is not provided', () => {
    const { queryByText } = render(
      <GymInformationCard gymData={{ name: 'Gym' }} />
    );
    expect(queryByText('Address')).not.toBeInTheDocument();
  });

  // Test website link
  test('renders website as clickable link', () => {
    const { getByRole } = render(
      <GymInformationCard
        gymData={{ name: 'Gym', website: 'https://gym.com' }}
      />
    );
    const link = getByRole('link');
    expect(link).toHaveAttribute('href', 'https://gym.com');
  });

  // Test edge cases
  test('handles edge case times (midnight, noon)', () => {
    const { getByText } = render(
      <GymInformationCard
        gymData={{ openingTime: '00:00', closingTime: '12:00' }}
      />
    );
    expect(getByText('12:00 AM')).toBeInTheDocument();
    expect(getByText('12:00 PM')).toBeInTheDocument();
  });
});
```

### 3. GymEditForm Component Tests

**File**: `frontend/src/components/profile/__tests__/GymEditForm.test.tsx`

```typescript
describe('GymEditForm', () => {
  const mockInitialData = {
    name: 'Test Gym',
    address: '123 Main St',
    openingTime: '06:00',
    closingTime: '22:00',
    contactNumber: '+91-1234567890',
    website: 'https://gym.example.com',
    gstNumber: '27ABCDE1234F2Z5',
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test form rendering
  test('renders all form fields', () => {
    const { getByLabelText } = render(
      <GymEditForm initialData={mockInitialData} />
    );
    expect(getByLabelText(/gym name/i)).toBeInTheDocument();
    expect(getByLabelText(/address/i)).toBeInTheDocument();
    expect(getByLabelText(/opening time/i)).toBeInTheDocument();
    expect(getByLabelText(/closing time/i)).toBeInTheDocument();
  });

  // Test form input changes
  test('updates form state when inputs change', () => {
    const { getByLabelText } = render(
      <GymEditForm initialData={mockInitialData} />
    );
    const nameInput = getByLabelText(/gym name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Gym' } });
    expect(nameInput).toHaveValue('Updated Gym');
  });

  // Test form submission
  test('calls onSave with form data on submit', async () => {
    mockOnSave.mockResolvedValue(undefined);
    const { getByRole } = render(
      <GymEditForm initialData={mockInitialData} onSave={mockOnSave} />
    );
    const saveButton = getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const calledData = mockOnSave.mock.calls[0][0];
      expect(calledData.name).toBe(mockInitialData.name);
    });
  });

  // Test validation
  test('shows error when gym name is empty', async () => {
    mockOnSave.mockResolvedValue(undefined);
    const { getByRole, getByLabelText, getByText } = render(
      <GymEditForm onSave={mockOnSave} />
    );

    const nameInput = getByLabelText(/gym name/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    const saveButton = getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(getByText(/gym name is required/i)).toBeInTheDocument();
  });

  // Test cancel button
  test('calls onCancel when cancel button clicked', () => {
    const { getByRole } = render(
      <GymEditForm onCancel={mockOnCancel} />
    );
    const cancelButton = getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  // Test loading state
  test('disables submit button during loading', async () => {
    mockOnSave.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    const { getByRole, getByLabelText } = render(
      <GymEditForm initialData={mockInitialData} onSave={mockOnSave} />
    );

    const nameInput = getByLabelText(/gym name/i);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    const saveButton = getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
  });

  // Test error handling
  test('handles API errors gracefully', async () => {
    mockOnSave.mockRejectedValue(new Error('API Error'));
    const { getByRole, getByLabelText } = render(
      <GymEditForm initialData={mockInitialData} onSave={mockOnSave} />
    );

    const nameInput = getByLabelText(/gym name/i);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    const saveButton = getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
});
```

---

## Integration Tests

### 1. Profile Page Integration Test

**File**: `frontend/src/app/(dashboard)/owner/settings/profile/__tests__/page.integration.test.tsx`

```typescript
describe('ProfilePage Integration', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  test('loads and displays profile data on mount', async () => {
    const mockUserData = {
      email: 'owner@gym.com',
      phone: '+91-9876543210',
      createdAt: '2025-06-15T10:30:00Z',
    };

    const mockGymData = {
      name: 'Veggainz Gym',
      address: '123 Main St',
      openingTime: '06:00',
      closingTime: '22:00',
      contactNumber: '+91-1234567890',
      website: 'https://gym.com',
      gstNumber: '27ABCDE1234F2Z5',
    };

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUserData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGymData }),
      });

    const { getByText } = render(
      <ProfilePage />
    );

    await waitFor(() => {
      expect(getByText('Veggainz Gym')).toBeInTheDocument();
      expect(getByText('owner@gym.com')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(
      <ProfilePage />
    );

    await waitFor(() => {
      // Should still render with loading complete
      expect(getByText(/profile/i)).toBeInTheDocument();
    });
  });

  test('navigates to edit page when edit button clicked', async () => {
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
    }));

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { email: 'test@test.com' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { name: 'Test Gym' } }),
      });

    const { getByRole } = render(
      <ProfilePage />
    );

    await waitFor(() => {
      const editButton = getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      expect(mockPush).toHaveBeenCalledWith('/owner/settings/profile/edit');
    });
  });
});
```

### 2. Profile Edit Page Integration Test

**File**: `frontend/src/app/(dashboard)/owner/settings/profile/edit/__tests__/page.integration.test.tsx`

```typescript
describe('ProfileEditPage Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('loads gym settings and allows editing', async () => {
    const mockGymData = {
      name: 'Original Gym',
      openingTime: '06:00',
      closingTime: '22:00',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockGymData }),
    });

    const { getByLabelText } = render(
      <ProfileEditPage />
    );

    await waitFor(() => {
      const nameInput = getByLabelText(/gym name/i);
      expect(nameInput).toHaveValue('Original Gym');
    });
  });

  test('saves changes and navigates back', async () => {
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
    }));

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { name: 'Test Gym' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { getByRole, getByLabelText } = render(
      <ProfileEditPage />
    );

    await waitFor(() => {
      const nameInput = getByLabelText(/gym name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Gym' } });

      const saveButton = getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/owner/settings/profile');
    });
  });

  test('shows error on failed save', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { name: 'Test Gym' } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    const { getByRole, getByLabelText, getByText } = render(
      <ProfileEditPage />
    );

    await waitFor(() => {
      const nameInput = getByLabelText(/gym name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated' } });

      const saveButton = getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(getByText(/failed to update/i)).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Tests

### Complete User Flow Test

**File**: `frontend/__tests__/e2e/profile-flow.e2e.test.ts`

```typescript
describe("Profile Feature End-to-End", () => {
  test("Complete profile view and edit flow", async () => {
    // 1. Navigate to profile page
    await page.goto("/owner/settings/profile");

    // 2. Verify profile page loads
    await page.waitForSelector('h1:has-text("Profile")');

    // 3. Verify profile header displays
    const avatar = await page.$(".rounded-full");
    expect(avatar).toBeTruthy();

    // 4. Verify gym information displays
    const gymCard = await page.$("text=Gym Information");
    expect(gymCard).toBeTruthy();

    // 5. Click edit button
    await page.click('button:has-text("Edit")');

    // 6. Verify redirected to edit page
    await page.waitForURL("/owner/settings/profile/edit");

    // 7. Update gym name
    const nameInput = await page.$('input[id="name"]');
    await nameInput.fill("Updated Gym Name");

    // 8. Update opening time
    const openingInput = await page.$('input[id="openingTime"]');
    await openingInput.fill("05:30");

    // 9. Save changes
    await page.click('button:has-text("Save Changes")');

    // 10. Verify success notification
    await page.waitForSelector("text=updated successfully");

    // 11. Verify redirected back to profile
    await page.waitForURL("/owner/settings/profile");

    // 12. Verify updated data displays
    const updatedName = await page.$("text=Updated Gym Name");
    expect(updatedName).toBeTruthy();
  });

  test("Cancel edit without saving", async () => {
    await page.goto("/owner/settings/profile");
    await page.click('button:has-text("Edit")');

    const nameInput = await page.$('input[id="name"]');
    const originalValue = await nameInput.inputValue();

    await nameInput.fill("Temporary Change");
    await page.click('button:has-text("Cancel")');

    await page.waitForURL("/owner/settings/profile");

    // Verify changes not saved
    const gymName = await page.$("text=" + originalValue);
    expect(gymName).toBeTruthy();
  });
});
```

---

## Test Coverage Goals

| Component          | Target Coverage |
| ------------------ | --------------- |
| ProfileHeader      | 95%+            |
| GymInformationCard | 95%+            |
| GymEditForm        | 90%+            |
| ProfilePage        | 85%+            |
| ProfileEditPage    | 85%+            |
| Overall            | 90%+            |

---

## Manual Testing Checklist

### Before Deployment

#### Profile View

- [ ] Page loads without errors
- [ ] User profile displays correctly
- [ ] Avatar shows correct initials
- [ ] Gym information displays all fields
- [ ] Time displays in 12-hour format
- [ ] Edit button visible and clickable
- [ ] Subscription and stats cards display
- [ ] Mobile layout responsive
- [ ] Loading state shows spinner

#### Profile Edit

- [ ] Edit page loads with current data
- [ ] All form fields populate correctly
- [ ] Can edit each field
- [ ] Time picker works (opens on click)
- [ ] Can clear optional fields
- [ ] Validation shows error for empty name
- [ ] Save button submits form
- [ ] Cancel button returns to profile
- [ ] Success message displays
- [ ] Redirects to profile after save
- [ ] Mobile layout responsive

#### Error Scenarios

- [ ] Handle network timeout
- [ ] Handle 404 response
- [ ] Handle 500 response
- [ ] Handle invalid form data
- [ ] Handle missing optional fields
- [ ] Test with slow network (DevTools throttling)

#### Data Persistence

- [ ] Changes saved to database
- [ ] Profile page shows updated data
- [ ] Data persists after page refresh
- [ ] Data persists after logout/login

---

## Performance Testing

### Page Load Times

- Profile page should load in < 2 seconds
- Edit page should load in < 1 second
- Form submission should complete in < 3 seconds

### Network Performance

```bash
# Test with throttled network
# Chrome DevTools → Network tab → Throttle dropdown
# Test with: Fast 3G, Slow 3G, Offline
```

### Bundle Size Impact

- Profile components should add < 50KB to bundle
- Run: `npm run build -- --analyze`

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through all form fields
- [ ] Tab to buttons
- [ ] Enter submits form
- [ ] Escape cancels (future)

### Screen Reader Testing

- [ ] Use NVDA or JAWS
- [ ] All labels announced
- [ ] Error messages announced
- [ ] Form instructions clear

### Color Contrast

- [ ] Run axe DevTools
- [ ] Check WCAG AA compliance
- [ ] Verify in light and dark modes (future)

---

## Test Data

### Seed Data for Testing

```typescript
const seedProfileData = {
  user: {
    id: "507f1f77bcf86cd799439011",
    email: "owner@fitnessgym.com",
    phone: "+91-9876543210",
    createdAt: new Date("2025-01-15"),
  },
  gym: {
    name: "Veggainz Fitness Club",
    address: "123 Main Street, Downtown, City",
    openingTime: "06:00",
    closingTime: "22:00",
    contactNumber: "+91-1234567890",
    website: "https://veggainzfitness.com",
    gstNumber: "27ABCDE1234F2Z5",
  },
};
```

---

## Known Test Limitations

1. **Avatar Upload**: Not yet testable (feature in development)
2. **Email Verification**: Not included in current tests
3. **International Formats**: Using India format only
4. **Dark Mode**: Tests not covering dark mode styling
