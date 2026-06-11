# UI Screens & Wireframes

## Screen Inventory

### Public / Auth (Mobile-First)

| Screen | Route | Description |
|--------|-------|-------------|
| Landing | `/` | Gym branding, login CTA |
| Login | `/login` | Email/password or phone OTP tabs |
| Register | `/register` | Self-registration form |
| Forgot Password | `/forgot-password` | Email input |
| Reset Password | `/reset-password` | New password form |
| OTP Verify | `/verify-otp` | 6-digit OTP input |

### Gym Owner Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Owner Dashboard | `/owner` | Stats cards + charts |
| Members List | `/owner/members` | Searchable member table |
| Member Detail | `/owner/members/[id]` | Profile + history tabs |
| Staff Management | `/owner/staff` | CRUD staff accounts |
| Analytics | `/owner/analytics` | Deep analytics charts |
| Reports | `/owner/reports` | All gym reports |
| Backoffice | `/owner/settings` | Theme, rules, email |
| Diet Templates | `/owner/diet-plans` | Template CRUD |
| BMI Rules | `/owner/settings/bmi-rules` | Classification config |
| Body Rules | `/owner/settings/body-rules` | Composition thresholds |
| RBAC | `/owner/settings/roles` | Role management |
| Audit Logs | `/owner/audit-logs` | Activity log viewer |
| Export | `/owner/export` | Excel/PDF export |

### Gym Staff Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Staff Dashboard | `/staff` | Today's stats + quick actions |
| Add Member | `/staff/members/new` | Registration form |
| Members List | `/staff/members` | Assigned members |
| Member Detail | `/staff/members/[id]` | View/edit member |
| New BMI Analysis | `/staff/bmi/new` | Analysis form wizard |
| BMI History | `/staff/bmi/[memberId]` | Member analysis list |
| Generate Report | `/staff/reports/generate` | Report builder |
| Print/Email Report | `/staff/reports/[id]` | Report actions |

### Gym Member Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Member Dashboard | `/member` | Current stats + goal progress |
| My Profile | `/member/profile` | Edit personal info |
| BMI History | `/member/bmi` | Analysis timeline |
| Progress Charts | `/member/progress` | Weight, BMI, fat, muscle charts |
| My Reports | `/member/reports` | Download past reports |
| Goals | `/member/goals` | Weight loss goal tracker |
| Diet Plan | `/member/diet` | Assigned diet view |

---

## Dashboard Wireframes

### Owner Dashboard (Mobile)

```
┌─────────────────────────────┐
│  🏋️ FitZone Gym    [👤][🔔] │
├─────────────────────────────┤
│ ┌─────────┐ ┌─────────┐    │
│ │  248    │ │  198    │    │
│ │ Members │ │ Active  │    │
│ └─────────┘ └─────────┘    │
│ ┌─────────┐ ┌─────────┐    │
│ │   12    │ │   89    │    │
│ │ Today   │ │ Monthly │    │
│ └─────────┘ └─────────┘    │
│ ┌─────────┐ ┌─────────┐    │
│ │    8    │ │   +15   │    │
│ │ Staff   │ │ New Reg │    │
│ └─────────┘ └─────────┘    │
├─────────────────────────────┤
│  BMI Category Distribution  │
│  ┌─────────────────────┐   │
│  │    [Donut Chart]    │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│  Weight Loss Trends         │
│  ┌─────────────────────┐   │
│  │   [Line Chart]      │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│ [🏠] [👥] [📊] [⚙️] [👤]   │  ← Bottom Nav
└─────────────────────────────┘
```

### Staff Dashboard (Mobile)

```
┌─────────────────────────────┐
│  Staff Portal        [👤]   │
├─────────────────────────────┤
│ ┌─────────┐ ┌─────────┐    │
│ │    5    │ │   32    │    │
│ │ Today   │ │ Members │    │
│ └─────────┘ └─────────┘    │
│ ┌─────────────────────────┐│
│ │      3 Pending          ││
│ │      Follow-ups         ││
│ └─────────────────────────┘│
├─────────────────────────────┤
│  Quick Actions              │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │+ BMI │ │+ Mem │ │Report│ │
│ └──────┘ └──────┘ └──────┘ │
├─────────────────────────────┤
│  Recent Analyses            │
│  ┌─────────────────────┐   │
│  │ Raj K. - 27.2 BMI   │   │
│  │ Priya S. - 22.1 BMI │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│ [🏠] [👥] [➕] [📄] [👤]   │
└─────────────────────────────┘
```

### Member Dashboard (Mobile)

```
┌─────────────────────────────┐
│  My Progress           [👤] │
├─────────────────────────────┤
│ ┌─────────┐ ┌─────────┐    │
│ │  78.5   │ │  27.2   │    │
│ │  kg     │ │  BMI    │    │
│ └─────────┘ └─────────┘    │
│ ┌─────────┐ ┌─────────┐    │
│ │Obesity 1│ │  65%    │    │
│ │ Category│ │  Goal   │    │
│ └─────────┘ └─────────┘    │
├─────────────────────────────┤
│  Weight Trend (30 days)     │
│  ┌─────────────────────┐   │
│  │   [Area Chart]      │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│  Body Composition           │
│  ┌─────────────────────┐   │
│  │ Fat │ Muscle │ VF   │   │
│  │[═══]│ [════] │ [═]  │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│ [🏠] [📈] [📄] [🍽️] [👤]   │
└─────────────────────────────┘
```

---

## Component Library

### Layout Components

- `BottomNav` — 5-tab mobile navigation
- `Sidebar` — Desktop collapsible sidebar
- `PageHeader` — Title + actions
- `StatCard` — Dashboard metric card
- `MobileTable` — Responsive table → cards

### Form Components

- `MemberForm` — Full member registration
- `BMIAnalysisForm` — Body analysis wizard
- `DietPlanForm` — Meal schedule builder
- `ThemeSettingsForm` — Color/logo picker
- `OTPInput` — 6-digit OTP component

### Chart Components

- `BMIDistributionChart` — Donut/pie
- `WeightTrendChart` — Area/line
- `BodyFatTrendChart` — Multi-line
- `MemberGrowthChart` — Bar chart
- `GoalProgressRing` — Circular progress

### Theme

Default: **Orange (#F97316) + Black (#0A0A0A)**

Configurable via backoffice settings.
