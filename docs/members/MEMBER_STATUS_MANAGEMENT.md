# Member Status Management - Archive & Reactivate

## Overview

Updated Member CRUD system to support member archiving and reactivation. Members can now be archived (soft delete) and reactivated by changing their status without permanently deleting records.

## Changes Made

### 1. **MemberForm Component** (`src/components/members/MemberForm.tsx`)

- Added `status` field to form state
- Status is included in the payload when creating/updating members
- Added status dropdown selector (only visible in edit mode)
- Status options:
  - `active` - Active member
  - `inactive` - Inactive member
  - `pending_approval` - Awaiting approval
  - `archived` - Archived member

### 2. **Member Details Page** (`src/app/(dashboard)/owner/members/[id]/page.tsx`)

- Changed delete operation to archive operation
- Uses `PUT /members/:id` with `{ status: "archived" }` instead of `DELETE`
- Updated confirmation dialog text: "Archive member?" instead of "Delete member?"
- Updated button text: "Archive Member" instead of "Delete Member"
- Updated loading text: "Archiving..." instead of "Deleting..."

## Workflow

### Archive a Member

1. Navigate to member details page
2. Click "Archive Member" button
3. Confirm the action
4. Member status changes to `archived`
5. Member is still searchable and viewable

### Reactivate an Archived Member

1. Navigate to archived member details page
2. Click "Edit Member"
3. Change status from "archived" to "active" (or other status)
4. Click "Save Member"
5. Member is reactivated

## Database Behavior

- **Before**: Members were hard deleted from database
- **After**: Members are soft deleted by changing their status to "archived"
- Archived members remain in the database for audit trails and history
- Can be reactivated anytime by updating status

## API Integration

The implementation uses existing backend endpoints:

```
PUT /members/:id
{
  "status": "archived"  // or "active", "inactive", "pending_approval"
}
```

## Benefits

✅ **Data Integrity**: No permanent data loss
✅ **Audit Trail**: Complete history of all members
✅ **Flexibility**: Easy to reactivate members
✅ **Compliance**: Soft deletes meet data retention requirements
✅ **Recovery**: Accidental archiving can be undone

## Status Field Options

| Status             | Description                  |
| ------------------ | ---------------------------- |
| `active`           | Active member enrolled       |
| `inactive`         | Currently inactive/paused    |
| `pending_approval` | New member awaiting approval |
| `archived`         | Archived/former member       |

## Member Edit Form

When editing a member, the status dropdown appears with all available options:

```
Status *
┌─────────────────────┐
│ Active              │
│ Inactive            │
│ Pending Approval    │
│ Archived            │
└─────────────────────┘
```

## Testing

1. **Create Member**: Status defaults to `pending_approval`
2. **Approve Member**: Edit → Change status to `active` → Save
3. **Archive Member**: Click "Archive Member" button
4. **Reactivate Member**: Edit archived member → Change status to `active` → Save

## Build Status

✅ **Build: SUCCESSFUL** (All changes compiled without errors)

## User Experience

- Clear confirmation dialogs
- Immediate visual feedback
- Can recover from accidental archiving
- Maintains member history
- Better audit compliance
