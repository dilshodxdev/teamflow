# TeamFlow — Frontend

TeamFlow loyihalar va vazifalar boshqaruv tizimi foydalanuvchi interfeysi (UI).

## Texnologiyalar

- **React 18** & **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router 7.18.5**
- **Lucide React** & **Material Symbols Outlined**
- **Native Fetch API** (`credentials: "include"`)

## Loyiha tuzilishi

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── layout/       # AppShell, Sidebar, Header
│   │   └── ui/           # Button, Card, Modal, Input, Select, Avatar, StatusBadge, ProgressBar, ConfirmDialog, Logo
│   ├── contexts/         # AuthContext, cookie sessiyasini tiklash
│   ├── hooks/            # usePermissions
│   ├── pages/
│   │   ├── auth/         # LoginPage, RegisterPage, PendingApprovalPage
│   │   ├── dashboard/    # DashboardPage
│   │   ├── projects/     # ProjectsPage
│   │   ├── tasks/        # TasksPage
│   │   ├── calendar/     # CalendarPage
│   │   ├── team/         # TeamPage
│   │   └── risks/        # RisksPage
│   ├── services/         # api.ts, auth.ts, projects.ts, tasks.ts, members.ts, risks.ts
│   ├── types/            # auth.ts, project.ts, task.ts, member.ts, risk.ts, api.ts
│   └── utils/            # date.ts, formatters.ts
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── FRONTEND_HANDOFF.md
```

## Ishga tushirish

Monorepo root papkasidan:

```powershell
cd C:\Users\user\Desktop\TEAMFLOW
pnpm install
pnpm db:seed
pnpm dev
```

Dependencylar **faqat rootdan** o‘rnatiladi. Bitta root `pnpm-lock.yaml` ishlatiladi; `apps/frontend/` ichida install yoki yangi lockfile/Git yaratilmang. `pnpm run setup` ham root `pnpm install`ni bajaradi. Node.js 22.13+ kerak.

Faqat frontendni ishlab chiqish rejimida ishga tushirish:

```powershell
pnpm dev:frontend
```

Frontend manzili: `http://localhost:5173`
Backend proxy: `/api` -> `http://localhost:4000`

Frontend faqat haqiqiy Express backend va SQLite bilan ishlaydi; mock rejimi olib tashlangan. Bitta frontend serverini boshlash backendni avtomatik boshlamaydi. Asosiy buyruq root `pnpm dev` bo‘lib, ikkala serverni `concurrently` bilan boshlaydi.

Demo manager/member kirish ma’lumotlari generatsiya qilinganda ignored lokal `apps/backend/data/demo-credentials.json`ga saqlanadi. Custom `name.db` bazasi uchun shu katalogdagi `name.demo-credentials.json` ishlatiladi. Parollarni tracked README, handoff yoki Gitga ko‘chirmang. Server authni HttpOnly cookie orqali boshqaradi; yangi registratsiya manager tasdiqlaguncha pending bo‘ladi.

## Tekshirish va production

Quyidagi buyruqlar root terminalidan bajariladi:

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm test:integration
pnpm start
```

`pnpm start` production backend orqali `apps/frontend/dist`ni beradi. `test:integration` buildni ham bajaradi. `pnpm test:e2e` uchun Microsoft Edge o‘rnatilgan, demo seed tayyor va `pnpm dev` boshqa terminalda ishlayotgan bo‘lishi kerak. Playwright alohida headless Edge sessiyasidan foydalanadi; u foydalanuvchining ochiq Chrome sessiyasi emas. Brauzer testlari real lokal demo ma’lumotini o‘zgartirishi mumkin.

## Integratsiya holati

`TEAMFLOW-OVERNIGHT-01` joriy `READY_FOR_CODEX` handoffi 2026-11-17 02:37 Asia/Tashkentda e’lon qilingan, Codex 02:38da qabul qilgan; Gemini tahrirlari to‘xtagan. Codex keyin real API, xato/loading holatlari, sessiya va logout, modal fokus/nomi, Tashkent taqvimi, dashboard sanalari va Back filtr holatini tuzatgan. Tarixiy `FRONTEND_HANDOFF.md` o‘zgartirilmagan; joriy kodning to‘liq tavsifi sifatida o‘qilmasin.

13 brauzer ssenariysi individual bajarishlarda o‘tgan; yakuniy to‘liq suite va topshirish qarori root [IMPLEMENTATION_REPORT.md](../../docs/IMPLEMENTATION_REPORT.md)da qayd etiladi. API: [API_CONTRACT.md](../../docs/API_CONTRACT.md); demo: [demo-guide.md](../../docs/demo-guide.md). Ushbu README yakuniy GO yoki hibernation bajarilganini da’vo qilmaydi.
