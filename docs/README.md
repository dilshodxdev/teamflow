# TeamFlow

Urganch davlat universiteti, Dasturiy ta'minot loyihalarini boshqarish kursi uchun mahalliy loyiha boshqaruvi MVP.

Bitta Git repository, **pnpm 12.14.0** workspace va ildizdagi yagona `pnpm-lock.yaml` ishlatiladi. Node.js 22.13+ talab qilinadi.

```text
TEAMFLOW/
├── apps/
│   ├── frontend/       # React, TypeScript, Vite
│   └── backend/        # Express, SQLite, API testlari
├── docs/
│   └── design/         # Asl UI dizaynlari va dizayn tizimi
├── tests/              # API shartnomasi, integratsiya va brauzer testlari
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Ishga tushirish

Terminalni loyiha ildizida oching. `pnpm --version` 12.14.0 bo‘lishi kerak; o‘rnatish usullari [pnpm hujjatlarida](https://pnpm.io/installation).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health
- Frontend `/api` so‘rovlarini Vite proxy orqali backendga yuboradi.

Faqat bitta ilovani ishga tushirish: `pnpm dev:frontend` yoki `pnpm dev:backend`. Dependencylar loyiha ildizidan boshqariladi. `pnpm run setup` ham `pnpm install`ni bajaradi.

Demo ma’lumotlari kerak bo‘lsa, `pnpm db:seed` bajaring. Seed mavjud bazani tozalamaydi va mavjud parollarni almashtirmaydi. Lokal baza `apps/backend/data/teamflow.db`, generatsiya qilingan kirish ma’lumotlari `apps/backend/data/demo-credentials.json`da saqlanadi. Ikkalasi Gitdan chiqarilgan. Maxsus `DATABASE_PATH` backend katalogiga nisbatan yechiladi; uning credential fayli shu baza yonida bo‘ladi.

## Tekshirish va production

Formatter, ESLint va lokal Git branchlari: [GIT_WORKFLOW.md](GIT_WORKFLOW.md).

```sh
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
pnpm start
```

`pnpm test:integration` buildni ham bajaradi. Production server http://localhost:4000 orqali `apps/frontend/dist` va API’ni birga beradi. Sozlamalar: [backend README](../apps/backend/README.md), [frontend README](../apps/frontend/README.md), [API shartnomasi](API_CONTRACT.md), [demo qo‘llanmasi](demo-guide.md).

Brauzer testlari uchun Microsoft Edge, demo seed va ishlayotgan `pnpm dev` kerak; keyin `pnpm test:e2e` bajaring. Ushbu testlar lokal demo bazaga vaqtinchalik yozuvlar qo‘shishi mumkin.

## Dizayn va tarixiy hujjatlar

Asl `ui/` materiallari mazmuni o‘zgartirilmasdan [docs/design/](design/)ga ko‘chirildi. Dizayn tizimi: [DESIGN.md](design/teamflow_design_system/DESIGN.md). Handoff [apps/frontend/FRONTEND_HANDOFF.md](../apps/frontend/FRONTEND_HANDOFF.md)da tarixiy holicha saqlangan. Eski hisobotlardagi `frontend/`, `backend/`, `ui/` va npm buyruqlari migratsiyadan oldingi holatni bildiradi.
