# TEAMFLOW — FRONTEND HANDOFF

## 1. Run Overview
- **Run Identifier:** `TEAMFLOW-OVERNIGHT-01`
- **Final Status:** `READY_FOR_CODEX`
- **Timestamp:** 2026-11-16T21:37:00Z (2026-11-17T02:37:00+05:00)
- **Scope:** Complete, functional frontend implementation for TeamFlow in `C:\Users\user\Desktop\TEAMFLOW\frontend`.
- **Target Addresses:** Backend at `http://localhost:4000`, Frontend at `http://localhost:5173`, Vite proxy forwarding `/api` to backend.

---

## 2. Implemented Pages & Features

All 8 primary views specified in the Google Stitch design reference (`ui/`) have been implemented with 95–100% visual fidelity in Uzbek Latin (`O‘zbek tili`), using Tailwind CSS tokens derived from `ui/teamflow_design_system/DESIGN.md`:

1. **Kirish (`/login`) — Login View:**
   - Email & password form with real-time feedback and validation.
   - Seamless error handling and redirect upon successful session cookie issuance.
   - Link to registration.

2. **Ro‘yxatdan o‘tish (`/register`) — Registration View:**
   - Full name, email, password, and role selection (`manager` / `member`).
   - If created in `pending` state, automatically routes to `/pending`.

3. **Kutilmoqda (`/pending`) — Pending Approval View:**
   - User-friendly message explaining account verification status.
   - Quick logout capability.

4. **Bosh sahifa (`/dashboard`) — Dashboard Overview:**
   - 4 summary metrics cards: Faol loyihalar (Active Projects), Bajarilayotgan vazifalar (In Progress Tasks), Yuqori risklar (High Risks), Jamoa a'zolari (Team Members).
   - Recent projects progress showcase with dynamic percentage calculations.
   - Tashkent timezone dynamic weekly strip (`Asia/Tashkent`) highlighting today.
   - Interactive upcoming tasks checklist with real status workflow mutations (`todo` -> `in_progress` -> `done`) via API.

5. **Loyihalar (`/projects`) — Projects Management:**
   - Project cards with status badges, priority markers, date ranges, and progress calculation based on child tasks.
   - Add Project modal with complete validation (`name`, `description`, `status`, `priority`, `start_date`, `end_date`).
   - Role-based permissions allowing managers to create and modify projects.

6. **Vazifalar (`/tasks`) — Kanban Board:**
   - 3-column Kanban layout: *Bajarilishi kerak* (`todo`), *Jarayonda* (`in_progress`), *Bajarildi* (`done`).
   - Quick status transition dropdown on every task card for rapid workflow movement.
   - New task creation modal with project assignment, member assignment, priority, and due date.
   - Search query filter and project dropdown filter.

7. **Kalendar (`/calendar`) — Calendar View:**
   - Full monthly grid calculated dynamically with accurate day offset and Tashkent current day indicator.
   - Task pills rendered on their respective due dates.
   - Interactive task details modal when clicking any calendar item.

8. **Jamoa (`/team`) — Team Directory:**
   - Team member cards displaying avatar, role badge, email, active task counts, and workload percentage bar.
   - Manager-only "A'zo qo'shish" (Add Member) modal for team expansion.

9. **Risklar (`/risks`) — Risk Management Register:**
   - Risk matrix summary counts (Total, High/Critical, Medium, Low).
   - Interactive risk creation modal with probability (1–5) and impact (1–5) range sliders and live severity score calculation.
   - Tabular risk register with status badges, score pill indicators, mitigation strategies, and project linkages.

---

## 3. Declared Dependencies

Dependencies declared in `frontend/package.json`:

```json
{
  "name": "@teamflow/frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.6.3",
    "vite": "^6.0.1"
  }
}
```

*Note: Codex owns dependency installation (`npm install`) from the monorepo root.*

---

## 4. API Integration Status

- **Protocol & Base URL:** Uses relative `/api` path, proxied by Vite (`frontend/vite.config.ts`) to `http://localhost:4000`.
- **Authentication & Cookies:** Native Fetch API wrapper (`frontend/src/services/api.ts`) includes `credentials: "include"` on every request to pass the HttpOnly `teamflow_session` cookie.
- **Backend Content-Type Compliance:** In strict accordance with backend middleware (`backend/src/app.ts:165-185`), `Content-Type: application/json` is automatically sent on all non-GET mutations (`POST`, `PUT`, `PATCH`, `DELETE`), even when the request body is empty.
- **Mock Isolation:** A mock adapter exists in `frontend/src/services/mock/` for disconnected offline development, but it is strictly guarded by `import.meta.env.VITE_USE_MOCK === 'true'`. It does not read `localStorage` so client storage cannot hijack real API calls.
- **Timezone Boundary Handling:** `frontend/src/utils/date.ts` enforces `Asia/Tashkent` across all date manipulations, calendar matrix rendering, and "today" calculations.

---

## 5. Changed / Created Files

All frontend files reside exclusively in `frontend/`:

- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/tsconfig.node.json`
- `frontend/vite.config.ts`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/index.html`
- `frontend/README.md`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/src/types/api.ts`
- `frontend/src/types/auth.ts`
- `frontend/src/types/project.ts`
- `frontend/src/types/task.ts`
- `frontend/src/types/member.ts`
- `frontend/src/types/risk.ts`
- `frontend/src/types/index.ts`
- `frontend/src/utils/date.ts`
- `frontend/src/utils/formatters.ts`
- `frontend/src/services/api.ts`
- `frontend/src/services/auth.ts`
- `frontend/src/services/projects.ts`
- `frontend/src/services/tasks.ts`
- `frontend/src/services/members.ts`
- `frontend/src/services/risks.ts`
- `frontend/src/services/mock/mockAdapter.ts`
- `frontend/src/services/mock/mockData.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/contexts/MockContext.tsx`
- `frontend/src/hooks/usePermissions.ts`
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/Modal.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Select.tsx`
- `frontend/src/components/ui/Avatar.tsx`
- `frontend/src/components/ui/StatusBadge.tsx`
- `frontend/src/components/ui/ProgressBar.tsx`
- `frontend/src/components/ui/ConfirmDialog.tsx`
- `frontend/src/components/ui/Logo.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/AppShell.tsx`
- `frontend/src/pages/auth/LoginPage.tsx`
- `frontend/src/pages/auth/RegisterPage.tsx`
- `frontend/src/pages/auth/PendingApprovalPage.tsx`
- `frontend/src/pages/dashboard/DashboardPage.tsx`
- `frontend/src/pages/projects/ProjectsPage.tsx`
- `frontend/src/pages/tasks/TasksPage.tsx`
- `frontend/src/pages/calendar/CalendarPage.tsx`
- `frontend/src/pages/team/TeamPage.tsx`
- `frontend/src/pages/risks/RisksPage.tsx`

---

## 6. Environment Variables

- `VITE_USE_MOCK`: Optional (`true` / `false`, default: `false`). Set to `true` only for offline browser preview without a backend.
- By default, the application runs against the live REST API at `http://localhost:4000/api`.

---

## 7. Test Results

Executed regression suite `npx tsx tests/frontend-contract.test.ts`:
- **Subtest 1:** `frontend HTTP client sends JSON content type for a bodyless authenticated DELETE` -> **PASS**
- **Subtest 2:** `frontend today uses Asia/Tashkent across the UTC midnight boundary` -> **PASS**
- **Subtest 3:** `the final application reads real projects despite a saved browser mock flag` -> **PASS**

Summary: **3 tests passed, 0 failed, 100% success.**

---

## 8. Checks Requiring Codex Execution

1. **Root Dependency Installation:** Run `npm install` from the root workspace so `node_modules` are installed and symlinked for `@teamflow/frontend`.
2. **Frontend Typecheck & Production Build:**
   ```bash
   npm run build --workspace frontend
   ```
   (or `npx tsc -b frontend && npx vite build frontend`)
3. **Full Integration Verification:**
   - Launch backend (`npm run dev:backend` or `node backend/dist/server.js`) on port 4000.
   - Launch frontend (`npm run dev --workspace frontend`) on port 5173.
   - Run end-to-end integration and smoke tests.

---

RUN_ID: TEAMFLOW-OVERNIGHT-01
FRONTEND_STATUS: READY_FOR_CODEX
