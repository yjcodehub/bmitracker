# API Reference

Base URL: `http://localhost:5000/api/v1`

## Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Self-register user (member, staff, owner) | Public |
| POST | `/auth/login` | Email/password login | Public |
| POST | `/auth/login/phone` | Phone + OTP login | Public |
| POST | `/auth/otp/send` | Send OTP | Public |
| POST | `/auth/otp/verify` | Verify OTP | Public |
| POST | `/auth/forgot-password` | Request reset link | Public |
| POST | `/auth/reset-password` | Reset with token | Public |
| POST | `/auth/refresh` | Refresh access token | Refresh cookie |
| POST | `/auth/logout` | Invalidate refresh token | Auth |
| GET | `/auth/me` | Current user profile | Auth |
| POST | `/auth/change-password` | Change user password | Auth |

## Members

> [!NOTE]
> **Member Role Constraints**: Users with the `member` role can only view (`GET /members/:id`) and update (`PUT /members/:id`) their own member record (where `:id` matches `req.user.memberId`). All other actions (list, create, delete, approve) return `403 Forbidden` for members.
> When updating, input is automatically sanitized to only allow editing personal fields (`fullName`, `contactNumber`, `age`, `gender`, `height`, `currentWeight`, `idealWeight`, `weightLossGoal`, `profilePhoto`).

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/members` | `members:read` | List members (paginated, filterable) |
| GET | `/members/:id` | `members:read` | Get member detail (Owner, Staff, or Self) |
| POST | `/members` | `members:create` | Create member |
| PUT | `/members/:id` | `members:update` | Update member details (Owner, Staff, or Self) |
| DELETE | `/members/:id` | `members:delete` | Soft-delete member |
| POST | `/members/:id/approve` | `members:approve` | Approve pending registration |
| GET | `/members/:id/history` | `members:read` | BMI + body analysis history |
| POST | `/members/:id/photo` | `members:update` | Upload profile photo |

### Query Parameters (GET /members)

- `page`, `limit` — pagination
- `search` — name, email, membership number
- `status` — `active`, `pending_approval`, `inactive`
- `trainerId` — filter by assigned trainer

## BMI Analysis

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/bmi` | `bmi:create` | Create analysis session |
| GET | `/bmi/:id` | `bmi:read` | Get single analysis |
| PUT | `/bmi/:id` | `bmi:update` | Update analysis |
| DELETE | `/bmi/:id` | `bmi:delete` | Delete analysis |
| GET | `/bmi/member/:memberId` | `bmi:read` | Member BMI history |
| POST | `/bmi/calculate` | `bmi:create` | Calculate BMI without saving |

### POST /bmi Body

```json
{
  "memberId": "ObjectId",
  "weight": 78.5,
  "bodyFatPercent": 22.5,
  "visceralFat": 9,
  "bmr": 1650,
  "bodyAge": 35,
  "totalBodyFat": 17.6,
  "trunkFat": 14.2,
  "armFat": 2.1,
  "legFat": 5.3,
  "muscleMass": 34.2,
  "dietPlanId": "ObjectId",
  "trainerNotes": "Optional notes"
}
```

## Reports

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/reports/generate` | `reports:create` | Generate PDF report |
| GET | `/reports/:id` | `reports:read` | Get report metadata |
| GET | `/reports/:id/download` | `reports:read` | Download PDF |
| POST | `/reports/:id/email` | `reports:email` | Email PDF to member |
| GET | `/reports/member/:memberId` | `reports:read` | List member reports |

## Diet Plans

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/diet-plans` | `diet:read` | List templates |
| POST | `/diet-plans` | `diet:create` | Create template |
| PUT | `/diet-plans/:id` | `diet:update` | Update template |
| DELETE | `/diet-plans/:id` | `diet:delete` | Delete template |

## Trainers

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/trainers` | `trainers:read` | List trainers |
| POST | `/trainers` | `trainers:create` | Create trainer |
| PUT | `/trainers/:id` | `trainers:update` | Update trainer |
| DELETE | `/trainers/:id` | `trainers:delete` | Deactivate trainer |

## Settings (Backoffice)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/settings` | `settings:read` | Get gym settings |
| PUT | `/settings/theme` | `settings:update` | Update theme |
| PUT | `/settings/bmi-rules` | `settings:update` | Update BMI classification |
| PUT | `/settings/body-rules` | `settings:update` | Update body composition rules |
| PUT | `/settings/email` | `settings:update` | Update email config |

## RBAC

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/roles` | `rbac:read` | List roles |
| POST | `/roles` | `rbac:create` | Create custom role |
| PUT | `/roles/:id` | `rbac:update` | Update role permissions |
| DELETE | `/roles/:id` | `rbac:delete` | Delete custom role |
| GET | `/permissions` | `rbac:read` | List all permissions |

## Staff Management

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/staff` | `staff:read` | List staff |
| POST | `/staff` | `staff:create` | Create staff account |
| PUT | `/staff/:id` | `staff:update` | Update staff |
| DELETE | `/staff/:id` | `staff:delete` | Deactivate staff |

## Analytics (Owner)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/analytics/dashboard` | `analytics:read` | Owner dashboard stats |
| GET | `/analytics/bmi-distribution` | `analytics:read` | BMI category chart data |
| GET | `/analytics/weight-trends` | `analytics:read` | Weight loss trends |
| GET | `/analytics/member-growth` | `analytics:read` | Registration trends |

## Audit Logs

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/audit-logs` | `audit:read` | List audit logs (paginated) |

## Export

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/export/members` | `export:read` | Export members Excel |
| GET | `/export/bmi/:memberId` | `export:read` | Export member BMI Excel |

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden / insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limited |
| 500 | Internal server error |
