# Trainer Management Documentation

This document outlines the technical implementation details for the **Trainer Management** module introduced in Phase 2.

## Overview
Trainer Management allows gym owners to configure trainers, specify their specialization, capture their contact details, toggle their active status, and link them to members in the gym.

---

## Database Schema
The trainer data is stored in the `Trainer` collection in MongoDB.

### Model Definition (`ITrainer`)
- `gymId` (ObjectId, ref: `Settings`): Identifies the gym settings this trainer belongs to.
- `name` (String, required): The trainer's full name.
- `email` (String, lowercase, optional): Contact email address.
- `phone` (String, optional): Contact phone number.
- `specialization` (String, optional): Area of expertise (e.g. Strength, Cardio, Yoga, CrossFit).
- `isActive` (Boolean, default: `true`): Deactivation flag to hide/show trainer in operations.

---

## API Endpoints

All endpoints are authenticated and mounted under `/api/trainers`.

| Method | Endpoint | Description | Permissions Required |
|--------|----------|-------------|----------------------|
| `GET` | `/` | List trainers (supports search, active filter, pagination) | `trainers:read` |
| `GET` | `/:id` | Get trainer details by ID | `trainers:read` |
| `POST` | `/` | Create new trainer (audited) | `trainers:create` |
| `PUT` | `/:id` | Update trainer details (audited) | `trainers:update` |
| `DELETE`| `/:id` | Hard delete trainer (audited) | `trainers:delete` |

---

## Frontend Integration

### 1. Trainer Management Panel (`/owner/settings/trainers`)
- **Path:** `frontend/src/app/(dashboard)/owner/settings/trainers/page.tsx`
- **Features:**
  - Search trainers dynamically.
  - Active/Inactive toggle directly from the list card.
  - Form dialog modal for adding and editing trainers (no page transitions required).
  - Confirmation before trainer deletion.

### 2. Member Assignment Integration
- **Form:** `frontend/src/components/members/MemberForm.tsx`
- **Features:**
  - Automatically fetches active trainers (`/trainers?isActive=true`).
  - Replaces the free-text `trainerName` input with a drop-down list of active trainers.
  - Saving a member stores both `trainerId` (for relational lookups) and `trainerName` (for quick listings).
