# Muvaffaqiyat va qabul mezonlari

GO faqat barcha majburiy mezonlar amalda tekshirilganda beriladi. Quyidagi ro‘yxatning mavjudligi uning bajarilganini anglatmaydi.

- Root `pnpm install`, `pnpm run setup`, `pnpm dev` pnpm workspaces bilan ishlaydi; bitta Git va bitta root `pnpm-lock.yaml` mavjud.
- Frontend 5173, backend 4000 portida boshlanadi; production build va start ishlaydi.
- Registratsiya, login, logout, pending va manager tasdiqlashi ishlaydi.
- Project/task/member/risk operatsiyalari haqiqiy SQLitega yoziladi; restartdan keyin saqlanadi.
- Member faqat o‘z vazifasini yozadi; server qolgan mutatsiyalarni rad etadi.
- Kanban, dashboard, taqvim va jamoa statistikasi real API ma’lumotidan hosil qilinadi.
- Loyiha progressi va risk darajasi server formulasiga mos.
- Avtomatik backend testlari, TypeScript va build muvaffaqiyatli; kritik runtime xatosi yo‘q.
- Tasdiqlangan UI saqlangan; frontend handoff va to‘liq integratsiya bajarilgan.
- Hujjatlar, xavfsiz demo seed va ma’lum cheklovlar hisoboti mavjud.

Frontend hali faol ishlab chiqilayotgan yoki integratsiya bajarilmagan bo‘lsa, yakuniy qaror NO-GO. Backend alohida tayyorligi aniq ko‘rsatilishi mumkin. Haqiqiy qaror va dalillar: `docs/IMPLEMENTATION_REPORT.md`.
