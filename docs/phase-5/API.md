# Phase 5 API Endpoint Specifications

All endpoints below require user authentication headers (`Authorization: Bearer <Token>`) and check for relevant RBAC permission claims.

---

## Gym settings Configs

### 1. Theme Configuration
- **GET** `/api/v1/settings/theme`
  - *Permission:* `settings:read`
  - *Response:* `200 OK`
    ```json
    {
      "success": true,
      "data": {
        "primaryColor": "#F97316",
        "secondaryColor": "#0A0A0A",
        "gymName": "FitZone Gym",
        "footerText": "Powered by BMI Tracker Pro",
        "logo": "/uploads/logo-12345.png"
      }
    }
    ```
- **PUT** `/api/v1/settings/theme`
  - *Permission:* `settings:update`
  - *Body:* JSON mapping `GymTheme` fields.
  - *Response:* `200 OK`

### 2. Branding Logo Upload
- **POST** `/api/v1/settings/logo`
  - *Permission:* `settings:update`
  - *Body:* Multi-part Form Data with a single file field `logo`.
  - *Response:* `200 OK` returns `{ logoUrl: "/uploads/logo-<timestamp>.<ext>" }`.

### 3. BMI Classification Guideline Rules
- **GET** `/api/v1/settings/bmi-rules`
  - *Permission:* `settings:read`
  - *Response:* `200 OK` list of active classification ranges.
- **PUT** `/api/v1/settings/bmi-rules`
  - *Permission:* `settings:update`
  - *Body:* `{ "bmiRules": [ ... ] }`

### 4. Body Composition Metric Ranges
- **GET** `/api/v1/settings/body-rules`
  - *Permission:* `settings:read`
- **PUT** `/api/v1/settings/body-rules`
  - *Permission:* `settings:update`

### 5. SMTP Configs & Connection Check
- **GET** `/api/v1/settings/email`
  - *Permission:* `settings:read`
- **PUT** `/api/v1/settings/email`
  - *Permission:* `settings:update`
- **POST** `/api/v1/settings/email/test`
  - *Permission:* `settings:update`
  - *Body:* `{ "smtpHost", "smtpPort", "smtpUser", "smtpPassword" }`
  - *Response:* `200 OK` on valid connection verification; `400 Bad Request` with error details on SMTP failure.

---

## Staff Account Directory

- **GET** `/api/v1/staff`
  - *Query Params:* `page`, `limit`, `search`
  - *Permission:* `staff:read`
  - *Response:* Paginated array of Users with populated role and profile details.
- **POST** `/api/v1/staff`
  - *Permission:* `staff:create`
  - *Body:* `{ fullName, email, phone, password, roleId }`
- **GET** `/api/v1/staff/:id`
  - *Permission:* `staff:read`
- **PUT** `/api/v1/staff/:id`
  - *Permission:* `staff:update`
- **DELETE** `/api/v1/staff/:id`
  - *Permission:* `staff:delete`

---

## RBAC Configuration

- **GET** `/api/v1/rbac/roles`
  - *Permission:* `rbac:read`
- **POST** `/api/v1/rbac/roles`
  - *Permission:* `rbac:create`
  - *Body:* `{ name, description, permissionIds }`
- **GET** `/api/v1/rbac/roles/:id`
  - *Permission:* `rbac:read`
- **PUT** `/api/v1/rbac/roles/:id`
  - *Permission:* `rbac:update`
- **DELETE** `/api/v1/rbac/roles/:id`
  - *Permission:* `rbac:delete`
- **GET** `/api/v1/rbac/permissions`
  - *Permission:* `rbac:read`

---

## Operations Audit Logging

- **GET** `/api/v1/audit`
  - *Query Params:* `page`, `limit`, `userId`, `action`, `resource`, `startDate`, `endDate`
  - *Permission:* `audit:read`
  - *Response:* Paginated activity logs including request headers, IP address, user agents, and parameters.
