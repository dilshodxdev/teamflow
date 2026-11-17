# Namoyish qo‘llanmasi

Joriy ish **TEAMFLOW-OVERNIGHT-01**. Joriy `READY_FOR_CODEX` handoffi 2026-11-17 02:37 Asia/Tashkentda e’lon qilingan, Codex 02:38da qabul qilgan; Gemini tahrirlari to‘xtagan. Codex frontendni haqiqiy APIga integratsiya qilib, mock qatlamlarini olib tashlagan. Quyida takrorlash ssenariysi keltirilgan; bajarilgan tekshiruvlar va yakuniy qaror `docs/IMPLEMENTATION_REPORT.md`da. Tarixiy handoff fayli keyingi tuzatishlar bilan qayta yozilmaydi.

1. Root terminal: `pnpm install`, `pnpm run setup`. Barcha o‘rnatishlar faqat rootdan; Gemini bilan lockfile egaligini kelishing.
2. Kerak bo‘lsa `apps/backend/.env.example`ni lokal `apps/backend/.env`ga nusxalang. `DEMO_MANAGER_PASSWORD` va `DEMO_MEMBER_PASSWORD`ni mahalliy belgilang yoki seedning xavfsiz birinchi ishga tushirish generatsiyasidan foydalaning. Haqiqiy parolni Gitga qo‘shmang.
3. `pnpm db:seed`. Bu ixtiyoriy, takroriy xavfsiz demo seed; mavjud bazani reset qilmaydi. Standart fiktiv hisoblar: `manager@example.test` va `member@example.test`; `.env` bilan o‘zgartirish mumkin. Yangi demo hisoblar uchun yaratilgan kirish ma’lumotlari Git e’tiborsiz qoldiradigan **lokal** `apps/backend/data/demo-credentials.json` faylida saqlanadi. Custom baza `/path/name.db` bo‘lsa fayl `/path/name.demo-credentials.json` bo‘ladi. Takroriy seed mavjud parolni qayta yaratmaydi; birinchi generatsiyadagi lokal faylni xavfsiz saqlang. Fayl, uning nusxasi va ichidagi parollar/tokenlar tracked hujjatlarga, handoffga yoki Gitga ko‘chirilmaydi. Bu manzillar haqiqiy talabalar emaili emas.
4. `pnpm dev`. Frontend `http://localhost:5173`, API `http://localhost:4000/api/health`.
5. Manager bilan kiring. “TeamFlow MVP” loyihasidagi 10–15 demo vazifa va 3–5 riskni ko‘ring. Ular haqiqiy talabalar hissasi emasligini ayting.
6. Yangi loyiha yarating, sana va tavsifni tahrirlang. Vazifa qo‘shing, a’zoga tayinlang, holatini done qiling; dashboard progressini tekshiring. Kanban ustunlari va taqvimda shu vazifani toping.
7. Risk yarating: probability=3, impact=5 → score=15, level=high. Holatni monitoringga o‘zgartiring.
8. Alohida brauzer profilida ro‘yxatdan o‘ting. Pending sahifasi chiqishi, jamoa ma’lumoti ochilmasligini tekshiring. Avvaldan bir xil emailli member mavjud bo‘lsa ham avtomatik tasdiqlanmasligini ko‘rsating.
9. Manager yangi hisob emaili bilan member yaratsin yoki mavjud memberni aniq saqlasin. Hisobdagi `/auth/me`ni yangilang; member ruxsati keladi. Bu email egasini tekshirish emas, qo‘lda tasdiqlash.
10. Member o‘ziga vazifa yaratsin va tahrirlasin; boshqa kishiga tayinlash, o‘chirish va loyiha/risk yozish rad etilishini ko‘rsating.
11. Manager oddiy a’zoni o‘chirsin: uning sessiyasi bekor, vazifa/risk mas’ulsiz bo‘lishi kerak. Birlamchi manager o‘chirilmaydi.
12. Serverni to‘xtatib qayta boshlang; yaratilgan loyiha/vazifa saqlanganini tekshiring. Demo uchun yaratilgan loyihani o‘chirish bog‘liq task/risklarni cascade qiladi. Logoutdan keyin himoyalangan sahifa ochilmasin.

Production tekshiruvi: `pnpm build`, so‘ng `pnpm start`. Browser orqali asosiy oqimlarni qayta tekshiring. Baza `apps/backend/data/teamflow.db`; `DATABASE_PATH` backend katalogiga nisbatan yechiladi. DB, WAL/SHM, `.env`, cookie va parollarni repositoryga qo‘shmang.

Rootdan avtomatik tekshiruvlar:

```powershell
pnpm typecheck
pnpm test
pnpm test:integration
```

`pnpm test` backend, frontend yordamchi/shartnoma va Vite credential himoyasi testlarini bajaradi. `test:integration` avval production buildni bajaradi, keyin alohida bazali production integratsiyasini tekshiradi. Brauzer testi uchun Microsoft Edge o‘rnatilgan bo‘lishi, demo seed va uning ignored lokal credential fayli mavjud bo‘lishi, `pnpm dev` boshqa terminalda ishlab turishi kerak. So‘ng rootdan `pnpm test:e2e` bajaring. Playwright alohida headless Edge sessiyalarini ochadi; foydalanuvchining ochiq Chrome sessiyasini boshqarmaydi. Testlar haqiqiy lokal demo bazaga vaqtinchalik yozuvlar qo‘shishi mumkin; o‘zingizning muhim ma’lumotingizdan alohida demo bazadan foydalaning.

Windows qayta uyg‘ongach rootdan `pnpm dev` yetarli bo‘lishi kerak; yangi checkout yoki dependency o‘zgarishida avval rootdan install kerak. Hibernate faqat [qat’iy 14 shart](overnight-acceptance.md) bajarilib, asosiy agentning yakuniy qarori GO bo‘lganda mumkin. Windowsda hibernation mavjudligi bu qo‘llanma bilan tasdiqlanmaydi.
