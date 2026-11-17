# TeamFlow — Git va jamoa branchlari

Git sozlamalari faqat ushbu repository uchun lokal o‘rnatilgan:

- Username: `dilshodxdev`
- Email: `dilshodxdev@gmail.com`
- Remote `origin`: `https://github.com/dilshodxdev/teamflow.git`
- Integratsiya branchi: `develop`

| Jamoa a’zosi | Branch                       | Vazifasi                       |
| ------------ | ---------------------------- | ------------------------------ |
| Dilshodbek   | `develop`                    | Team Lead, integratsiya        |
| Amirbek      | `feature/backend`            | Backend, API, Database         |
| Sevinch      | `feature/dashboard-projects` | Dashboard, Loyihalar, Kalendar |
| Sohiba       | `feature/tasks-team`         | Vazifalar, Jamoa, Risklar      |
| Maftuna      | `docs/project-management`    | Hujjatlar, talablar, testlash  |

Branchlar bitta tekshirilgan lokal boshlang‘ich commitdan yaratiladi. Ishlash uchun kerakli branchga `git switch feature/backend` kabi buyruq bilan o‘ting. Integratsiya `develop`da qilinadi. Remote sozlash hech qanday faylni GitHub’ga yubormaydi; push yoki remote branch yaratish bajarilmagan.

## Kod tekshiruvlari

Loyiha ildizidan:

```sh
pnpm format
pnpm format:check
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm test
pnpm test:integration
```

`pnpm check` format, lint, TypeScript va unit/contract/security testlarini ketma-ket bajaradi. `pnpm test:integration` production buildni ham tekshiradi.

ESLint flat config barcha JavaScript/TypeScript manbalariga, frontendda React Hook qoidalariga qo‘llanadi. API/SQLite chegaralaridagi mavjud explicit `any` turlari hozircha ruxsat etilgan. `react-hooks/exhaustive-deps` ogohlantirish sifatida yoqilgan; dashboard, tasks va risks sahifalarida oldindan mavjud uchta dependency ogohlantirishi bor. Bu sozlashda ilova xatti-harakati o‘zgartirilmagan.

Prettier alohida formatter sifatida ishlaydi; `eslint-config-prettier` qarama-qarshi stil qoidalarini o‘chiradi. `.editorconfig` UTF-8, LF va ikki probelni belgilaydi. VS Code uchun formatter, ESLint va EditorConfig kengaytmalari tavsiya qilingan; ular avtomatik o‘rnatilmaydi.

Generated fayllar, lokal baza/credentiallar, asl dizayn materiallari va tarixiy handoff/hisobotlar formatlashdan chiqarilgan. Git bazalar, credentiallar, `.env`, dependencylar va test natijalarini kuzatmaydi.

## Fayllar joylashuvi

- Asosiy qo‘llanma: [README.md](README.md).
- Eski root koordinatsiya jurnali: [COORDINATION_LOG.md](COORDINATION_LOG.md). Mavjud [coordination.md](coordination.md) saqlangan.
- Amalga oshirish hisoboti: [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md).
- Rasm: `apps/frontend/public/teamflow.png`; dev va production URL: `/teamflow.png`.
