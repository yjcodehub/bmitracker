# Database Design

## ER Diagram

```mermaid
erDiagram
    GYM ||--o{ USER : employs
    GYM ||--o{ MEMBER : registers
    GYM ||--o{ TRAINER : has
    GYM ||--|| SETTINGS : configures

    USER ||--o| ROLE : has
    ROLE ||--o{ PERMISSION : grants

    MEMBER ||--o{ BMI_RECORD : tracks
    MEMBER }o--|| TRAINER : assigned_to
    MEMBER }o--o| USER : linked_account

    BMI_RECORD ||--o| DIET_PLAN : recommends
    BMI_RECORD ||--o| REPORT : generates

    USER ||--o{ AUDIT_LOG : performs

    GYM {
        ObjectId _id PK
        string name
        string logo
        ObjectId ownerId FK
    }

    USER {
        ObjectId _id PK
        ObjectId gymId FK
        ObjectId roleId FK
        string email
        string phone
        string passwordHash
        enum status
        ObjectId memberId FK
    }

    ROLE {
        ObjectId _id PK
        string name
        string slug
        array permissionIds
        boolean isSystem
    }

    PERMISSION {
        ObjectId _id PK
        string resource
        string action
        string slug
    }

    MEMBER {
        ObjectId _id PK
        ObjectId gymId FK
        ObjectId trainerId FK
        ObjectId userId FK
        string fullName
        string membershipNumber
        number height
        number currentWeight
        enum gender
        enum status
    }

    BMI_RECORD {
        ObjectId _id PK
        ObjectId memberId FK
        ObjectId gymId FK
        ObjectId staffId FK
        date analysisDate
        number weight
        number bmi
        string bmiCategory
        object bodyComposition
    }

    TRAINER {
        ObjectId _id PK
        ObjectId gymId FK
        string name
        boolean isActive
    }

    DIET_PLAN {
        ObjectId _id PK
        ObjectId gymId FK
        string name
        boolean isTemplate
        object meals
    }

    REPORT {
        ObjectId _id PK
        ObjectId memberId FK
        ObjectId bmiRecordId FK
        string pdfUrl
        date generatedAt
    }

    SETTINGS {
        ObjectId _id PK
        ObjectId gymId FK
        object theme
        object bmiRules
        object bodyCompositionRules
        object emailSettings
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId gymId FK
        ObjectId userId FK
        string action
        string resource
        object metadata
        date createdAt
    }
```

## Collections Summary

| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `users` | Auth accounts (owner, staff, member) | `email`, `phone`, `gymId+roleId` |
| `roles` | RBAC roles | `slug` (unique) |
| `permissions` | Granular permissions | `slug` (unique) |
| `members` | Gym member profiles | `gymId+membershipNumber`, `gymId+email`, `trainerId` |
| `bmirecords` | Body analysis sessions | `memberId+analysisDate`, `gymId+analysisDate` |
| `dietplans` | Diet templates & assignments | `gymId+isTemplate` |
| `trainers` | Trainer directory | `gymId+name` |
| `reports` | Generated PDF metadata | `memberId+generatedAt` |
| `settings` | Gym config (theme, rules) | `gymId` (unique) |
| `auditlogs` | Activity tracking | `gymId+createdAt`, `userId+createdAt` |

## Design Decisions

### Embed vs Reference

| Data | Strategy | Reason |
|------|----------|--------|
| BMI body composition fields | Embed in `bmirecords` | Always read with analysis |
| Diet meal schedule | Embed in `dietplans` | Template is self-contained |
| BMI rules / theme | Embed in `settings` | Single document per gym |
| Member → Trainer | Reference | Trainer reused across members |
| BMI history | Separate collection | Unbounded growth (1:many) |

### BMI Record Document Shape

```json
{
  "_id": "ObjectId",
  "memberId": "ObjectId",
  "gymId": "ObjectId",
  "staffId": "ObjectId",
  "analysisDate": "2026-06-11",
  "weight": 78.5,
  "height": 170,
  "bmi": 27.2,
  "bmiCategory": "Obesity Grade 1",
  "healthRisk": "Increased risk of cardiovascular disease",
  "suggestedAction": "Consult trainer for structured weight loss program",
  "bodyComposition": {
    "bodyFatPercent": 22.5,
    "visceralFat": 9,
    "visceralFatStatus": "normal",
    "bmr": 1650,
    "bodyAge": 35,
    "totalBodyFat": 17.6,
    "trunkFat": 14.2,
    "armFat": 2.1,
    "legFat": 5.3,
    "muscleMass": 34.2
  },
  "dietPlanId": "ObjectId",
  "trainerNotes": "Focus on cardio 4x/week",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Member Status Flow

```
pending_approval → active → inactive → archived
         ↑
    self_register
```

## Index Strategy

- **Compound indexes** match query patterns: `{ gymId: 1, analysisDate: -1 }`
- **Unique constraints**: `membershipNumber` per gym, `email` per gym for members
- **TTL index** on OTP documents (if stored separately): 600 seconds
- **Text index** on `members.fullName` for search

## Schema Validation

Mongoose schemas enforce types at application level. Optional MongoDB `$jsonSchema` validators can be added in production for defense-in-depth.
