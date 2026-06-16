# Phase 4: Analytics and Dashboards Documentation

This document describes the design, implementation, and endpoints used for the modern, interactive dashboards and charts built in Phase 4 of the BMI Tracker application.

## 1. Overview
We integrated **Recharts** into the React/Next.js frontend to visualize key gym performance indicators, user trends, and biological metrics. Visual styling uses curated HSL palettes matching a modern, transition-based design language.

## 2. Dashboards by Role

### Owner Dashboard
- **Stat Cards**: Dynamic summary widgets for:
  - Total Members
  - Active Members
  - Today's Analyses
  - Monthly Analyses
  - Total Staff
  - Recent Registrations (with quick approval controls)
- **Charts Section**:
  - **BMI Category Distribution**: Pie chart showing percentage shares of Underweight, Normal, Overweight, Obese, etc.
  - **Weight Loss Trends**: Area chart displaying historical weight changes over 30 days.
  - **Member Growth**: Bar chart displaying monthly registrations (e.g., last 6 months).

### Staff Dashboard
- **Today's Analytics Overview**: Stats showing total members, pending approvals, and today's analyses.
- **Recent Analyses**: Feed of recent member weigh-ins with quick detail navigation.
- **Quick Actions**: Hotlinks for adding a BMI record, adding a member, or approving members.

### Member Dashboard
- **Current Stats Card Grid**: Displaying current weight, current BMI, classification, and goal progress.
- **Interactive Progress Charts**: Tabbed area chart component combining four metrics:
  - Weight Progress (kg)
  - BMI Progress
  - Body Fat %
  - Muscle Mass (kg)

## 3. Analytics API Endpoints

All analytics routes require user authentication and proper permissions:

| Endpoint | Method | RBAC Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/analytics/dashboard` | GET | `analytics:read` | Returns owner dashboard statistics |
| `/api/v1/analytics/staff-dashboard` | GET | `members:read` | Returns staff dashboard statistics |
| `/api/v1/analytics/bmi-distribution` | GET | `analytics:read` | Returns BMI category counts for aggregation |
| `/api/v1/analytics/weight-trends` | GET | `analytics:read` | Returns average weight trends over past N days |
| `/api/v1/analytics/member-growth` | GET | `analytics:read` | Returns monthly member registrations (fixed casting bug) |
| `/api/v1/bmi/member/:memberId` | GET | `bmi:read` | Returns individual history for member progress charts |

## 4. Key Implementation Details
- **MongoDB Aggregation Fix**: Aggregations matching by `gymId` now cast the string parameter to `mongoose.Types.ObjectId` to prevent empty results.
- **Chronological Sorting**: Trend charts automatically sort data chronologically (oldest to newest) to display lines correctly.
