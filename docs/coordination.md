# Monorepo va frontend handoff kelishuvi

Asosiy, joriy koordinatsiya fayli: [COORDINATION_LOG.md](COORDINATION_LOG.md). Joriy ish identifikatori: **TEAMFLOW-OVERNIGHT-01**. Gemini tugagach `apps/frontend/FRONTEND_HANDOFF.md` yozadi. Ushbu hujjat boshqaruv qoidalarini izohlaydi; haqiqiy handoff va integratsiya holati uchun root faylni tekshiring.

Joriy handoff 2026-11-17 **02:37 Asia/Tashkent**da e’lon qilingan va asosiy agent **02:38**da `READY_FOR_CODEX` sifatida qabul qilgan; Gemini terminal ko‘rsatmasiga ko‘ra frontend tahrirlarini to‘xtatgan. Shundan so‘ng Codex integratsiya va tuzatishlarni qabul qilgan. `apps/frontend/FRONTEND_HANDOFF.md` tarixiy topshirish yozuvi sifatida o‘zgartirilmaydi; uning dastlabki tavsifi keyingi Codex tuzatishlarini aks ettirmasligi mumkin.

Joriy frontend faqat haqiqiy Express/SQLite API bilan ishlaydi: MockContext, mockAdapter va mockData olib tashlangan. Dependencylar rootdan o‘rnatilgan; React Router 7.18.5ga yangilangan va asosiy agent xabar qilgan install audit natijasi 0 vulnerability. Vite orqali lokal credential fayli ochilishini sintetik qiymat bilan tekshiruvchi regressiya testi qo‘shilgan. Yakuniy testlar va topshirish qarorining yagona joriy manbai — root hisobot; bu yozuv GO degani emas.

Root: `C:\Users\user\Desktop\TEAMFLOW`. Bitta Git repository; `apps/frontend` va `apps/backend` pnpm workspaces; faqat root `pnpm-lock.yaml`. Turborepo va Nx ishlatilmaydi.

**Faqat Codex** root `package.json`, root konfiguratsiya va lockfileni boshqaradi. Barcha dependency o‘rnatishlar rootdan `pnpm install` bilan, ketma-ket bajariladi. Gemini `apps/frontend/package.json`ga kerakli dependencylarni yozishi mumkin, lekin `pnpm install` ishga tushirmaydi va lockfile yaratmaydi. Ichki `.git` yoki workspace lockfile yaratilmang.

Gemini faol paytda frontend fayllari uning tasarrufida. Codex backend, docs va root fayllarini boshqaradi. Asl `docs/design/` faqat o‘qish uchun. Qo‘shni workspace yoki boshqa agent fayllarini bir vaqtda tahrirlash mumkin emas.

Frontend kutishi kerak bo‘lgan shartlar:

- Vite porti 5173; `/api` proxy nishoni `http://localhost:4000`.
- Relative `/api/...` fetch; cookie orqali auth; token localStoragega yozilmaydi.
- JSON mutatsiyalarda `Content-Type: application/json`; brauzer Origin yuboradi.
- `{data: ...}` va `{error: {code, message}}`; 204 javob JSON sifatida o‘qilmaydi.
- `pending` hisobi uchun tasdiqlash kutilayotgan ekran; manager/member ruxsatlari UI va serverda mos.
- Mock yozuvlar haqiqiy ma’lumot deb ko‘rsatilmaydi; sana semantikasi Asia/Tashkent.

Handoff yozuvida: frontend tahrirlari tugagani, dependencylar, ishlash/build skriptlari, qaysi sahifalar real APIga ulanganligi, ma’lum xatolar va bajarilgan tekshiruvlar ko‘rsatiladi. Codex egalikni qabul qilishi uchun joriy ishning terminal handoffi kerak:

```text
RUN_ID: TEAMFLOW-OVERNIGHT-01
FRONTEND_STATUS: READY_FOR_CODEX
```

Gemini frontend tahrirlarini to‘xtatgani ham tasdiqlanishi kerak. Eski handoff, boshqa RUN_ID, frontend fayllari mavjudligi yoki vaqt o‘tganligi yetarli emas. `FRONTEND_STATUS: BLOCKED` bo‘lsa, sabablar o‘qiladi va handoffda **frontend tahrirlari to‘xtagani aniq yozilgan** bo‘lgandagina Codex qolgan ishni qabul qiladi. Terminal handoff bo‘lmasa Codex frontendni tahrirlamaydi; mustaqil backend, test va hujjat ishini davom ettiradi, keyin oqilona davriylikda tekshiradi.

To‘g‘ri terminal handoff va tahrirlar to‘xtagani tasdiqlangandan keyin Codex workspace manifestlarini tekshiradi, rootdan ketma-ket `pnpm install` bajaradi va integratsiyani tekshiradi. Qabul qilish hamda haqiqiy tuzatishlar root hisobotda yoziladi. Handoff va amaliy integratsiya tekshiruvisiz loyiha tugallangan deb hisoblanmaydi.

Hibernate faqat asosiy Sol agentiga ruxsat etilgan va [overnight-acceptance.md](overnight-acceptance.md)dagi barcha 14 shart bajarilgandagina mumkin. Handoff yo‘q yoki muhim ish qolgan bo‘lsa kompyuter ishlashda qoladi.
