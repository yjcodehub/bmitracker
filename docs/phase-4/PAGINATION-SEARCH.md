# Phase 4: Pagination & Search Documentation

This document describes the design and implementation of server-side search, filtering, and pagination across all list views in the BMI Tracker.

## 1. Overview
To ensure scalability and fast reload speeds, client-side list searching and filtering were migrated to **server-side operations**. Search and filter criteria are sent as query parameters to the backend, and results are returned as a paginated JSON response.

## 2. API Response Wrapper
All paginated GET list endpoints return the results wrapped in a standard pagination format:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

## 3. Paginated Endpoints & Controllers

| Endpoint | Query Parameters | Backend Controller | Description |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/members` | `page`, `limit`, `search`, `status`, `role` | `memberController.list` | Paginated search of gym members/staff |
| `GET /api/v1/trainers` | `page`, `limit`, `search`, `isActive` | `trainerController.list` | Paginated list of trainers |
| `GET /api/v1/diet-plans` | `page`, `limit`, `search`, `isTemplate`, `isVegetarian`, `isNonVegetarian` | `dietController.list` | Paginated list of diet templates |
| `GET /api/v1/reports` | `page`, `limit`, `search` | `reportController.listAll` | Paginated list of generated reports |
| `GET /api/v1/bmi/member/:memberId` | `page`, `limit` | `bmiController.getMemberHistory` | Paginated history of weigh-in records |

## 4. Reusable Frontend Pagination Control
A standard UI pagination bar is implemented in `src/components/ui/pagination.tsx`. It provides:
- Page number buttons with animations (scale and hover effects).
- Previous/Next controls that disable at page limits.
- Entries summary: "Showing 11 to 20 of 45 entries".
- Responsive scaling: collapses labels on mobile screens.

## 5. Filter Resets
On the frontend, whenever search queries or filters change, the page is programmatically reset to `1`, triggering a clean re-fetch of the first page from the API.
