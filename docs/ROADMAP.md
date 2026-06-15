# Development Roadmap

## Phase 1: Foundation (Weeks 1–2)

**Goal:** Project scaffolding, database, authentication

- [x] Monorepo structure (backend + frontend)
- [x] MongoDB schemas (10 collections)
- [x] Express API bootstrap with middleware
- [x] JWT + refresh token authentication
- [x] RBAC middleware + seed permissions
- [x] Next.js 15 app with auth pages
- [x] Zustand auth store
- [x] API client with token refresh

**Deliverable:** Users can register, login, and see role-based redirect.

---

## Phase 2: Core Modules (Weeks 3–4)

**Goal:** Member management + BMI analysis

- [x] Member CRUD (admin create + self-register)
- [ ] Member approval workflow
- [ ] Trainer management
- [ ] BMI calculation engine with classification
- [ ] Body composition status evaluation
- [ ] BMI analysis CRUD with history
- [ ] Staff dashboard with quick actions
- [ ] Member dashboard with current stats

**Deliverable:** Staff can register members and record BMI analyses.

---

## Phase 3: Reports & Diet (Weeks 5–6)

**Goal:** PDF reports, diet plans, email

- [ ] Diet template CRUD (owner)
- [ ] Diet assignment to BMI sessions
- [ ] PDF report generation (PDFKit)
- [ ] Report download / print / email
- [ ] Nodemailer integration
- [ ] Welcome email on registration
- [ ] Analysis report email

**Deliverable:** Complete analysis → report → email workflow.

---

## Phase 4: Dashboards & Analytics (Weeks 7–8)

**Goal:** Charts, analytics, owner dashboard

- [ ] Owner dashboard with stat cards
- [ ] Recharts integration (BMI distribution, trends)
- [ ] Member progress charts (weight, BMI, fat, muscle)
- [ ] Analytics API endpoints
- [ ] Search & filter on member lists
- [ ] Pagination across all list views

**Deliverable:** Full dashboard experience for all three roles.

---

## Phase 5: Backoffice & Settings (Weeks 9–10)

**Goal:** Owner configuration panel

- [ ] Theme management (colors, logo, gym name)
- [ ] BMI classification rules editor
- [ ] Body composition rules editor
- [ ] Email settings configuration
- [ ] Staff management CRUD
- [ ] RBAC role editor
- [ ] Audit log viewer

**Deliverable:** Owner can fully configure the gym system.

---

## Phase 6: Polish & Production (Weeks 11–12)

**Goal:** PWA, exports, production readiness

- [ ] PWA manifest + service worker
- [ ] Dark mode toggle
- [ ] Excel export (members, BMI data)
- [ ] Notification system
- [ ] Forgot password + OTP flows
- [ ] Mobile OTP login
- [ ] Rate limiting + security hardening
- [ ] Error boundaries + loading states
- [ ] E2E tests (critical paths)
- [ ] Docker + deployment configs
- [ ] Performance optimization (Lighthouse 90+)

**Deliverable:** Production-ready commercial gym management app.

---

## Phase 7: Future Enhancements

- Multi-gym SaaS tenancy
- Subscription billing integration
- WhatsApp report delivery
- Inbody machine API integration
- AI-powered diet recommendations
- Member mobile app (React Native)
- Gym chain analytics

---

## Priority Matrix


| Feature             | Priority | Phase |
| ------------------- | -------- | ----- |
| Auth + RBAC         | P0       | 1     |
| Member CRUD         | P0       | 2     |
| BMI Analysis        | P0       | 2     |
| PDF Reports         | P0       | 3     |
| Owner Dashboard     | P1       | 4     |
| Diet Templates      | P1       | 3     |
| Backoffice Settings | P1       | 5     |
| PWA                 | P1       | 6     |
| Excel Export        | P2       | 6     |
| Multi-Gym           | P3       | 7     |


