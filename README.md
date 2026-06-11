# BMI Tracker Pro

A mobile-first Gym Body Analysis Management System for digitizing paper-based BMI tracking workflows.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Zustand, Recharts |
| Backend | Node.js, Express.js, JWT, PDFKit, Nodemailer |
| Database | MongoDB, Mongoose |

## Project Structure

```
bmitracker/
├── docs/                 # Architecture, API, ER diagrams, roadmap
├── backend/              # Express REST API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── package.json
├── frontend/             # Next.js 15 App Router
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## User Roles

| Role | Access |
|------|--------|
| **Gym Owner** | Full system access, backoffice, analytics, RBAC |
| **Gym Staff** | Member registration, BMI analysis, reports |
| **Gym Member** | Own profile, history, progress charts |

## Documentation

- [System Architecture](./docs/ARCHITECTURE.md)
- [Database Design & ER Diagram](./docs/DATABASE.md)
- [API Reference](./docs/API.md)
- [UI Screens & Wireframes](./docs/UI-SCREENS.md)
- [RBAC Architecture](./docs/RBAC.md)
- [Development Roadmap](./docs/ROADMAP.md)

## License

Proprietary — Commercial gym management usage.
