# Tungi topshirish qabul ro‘yxati

Run: **TEAMFLOW-OVERNIGHT-01**. Joriy handoff qabul qilingan, real API integratsiyasi va alohida tekshiruvlar bajarilgan. Asosiy agent bergan oraliq natijalar: backend **17**, frontend yordamchi/shartnoma **3**, dev xavfsizlik **1**, production integratsiya **1** test muvaffaqiyatli; brauzerning **13 ssenariysi alohida bajarishlarda yashil**. Yakuniy to‘liq suite qayta bajarilishi va yakuniy audit **kutilmoqda**. Bu yozuv yakuniy GO emas. Natija, buyruq va cheklovlarning authoritative manbai `docs/IMPLEMENTATION_REPORT.md`.

| Guruh            | Majburiy ssenariylar                                                                                                                            | Joriy hujjat holati                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Handoff          | Joriy RUN_ID; READY_FOR_CODEX terminal holati; Gemini tahrirlari to‘xtagan                                                                      | 02:37 e’lon, 02:38 Codex qabul; 2026-11-17 Asia/Tashkent                                 |
| Auth             | Registratsiya, login, noto‘g‘ri login, logout, sessiyani tiklash, manager tasdiqlashi, pending cheklovi, himoyalangan sahifalar, rol ruxsatlari | Backend va alohida brauzer ssenariylari o‘tgan; final suite kutilmoqda                   |
| Loyiha           | Yaratish, tahrirlash, o‘chirish va bog‘liq yozuvlar cascade                                                                                     | Backend/CRUD brauzer dalillari bor; final suite kutilmoqda                               |
| Vazifa           | Yaratish, tahrirlash, o‘chirish, mas’ul tayinlash, holat, Kanban yangilanishi, progress, sanalar validatsiyasi                                  | Backend/CRUD brauzer dalillari bor; final suite kutilmoqda                               |
| Boshqa modullar  | Haqiqiy dashboard statistikasi, taqvim sanalari, jamoa a’zolarini boshqarish, risk yaratish/tahrirlash/hisoblash/o‘chirish                      | Alohida real-data va regressiya ssenariylari o‘tgan; final suite kutilmoqda              |
| Saqlanish        | Backend restartidan keyin SQLite ma’lumoti va sessiyani tekshirish                                                                              | Production integratsiya 1 o‘tgan; tafsilotlar root hisobotda                             |
| Texnik sifat     | Root install, TypeScript, backend testlari, production build, root dev, Vite proxy, JSON DTO va cookie                                          | Oraliq build/test dalillari bor; barcha yakuniy buyruqlar qayta tekshiriladi             |
| Xavfsizlik va UX | Maxfiy ma’lumot chiqmaydi, jiddiy authz nuqsoni yo‘q, loading/error holatlari, mock o‘chirilgan, tasdiqlangan UI saqlangan                      | Mocklar olib tashlangan; Vite sintetik credential testi 1 o‘tgan; final audit kutilmoqda |
| Brauzer          | Haqiqiy UI oqimlari alohida headless Edge sessiyalarida                                                                                         | 13 individual ssenariy yashil; to‘liq yakuniy suite kutilmoqda                           |

Connected Chrome plugin buyruq xatosi sabab foydalanuvchining ochiq Chrome sessiyasida UI testlari bajarilgani da’vo qilinmaydi. `pnpm test:e2e` Edge o‘rnatilganini, ishlayotgan dev serverlarni va lokal demo seed/credential faylini talab qiladi. Bosqichma-bosqich buyruqlar [demo-guide.md](demo-guide.md)da.

Qabul jarayoni: kritik xato → qayta yaratuvchi test → tuzatish → qayta tekshirish. Backend avtomatik testi browserdagi ko‘rinish, Kanban yoki taqvim ishlashini o‘z-o‘zidan isbotlamaydi. Essential funksiya tugallanmagan bo‘lsa NO-GO. Versiyalangan sxema upgrade mexanizmi bor deb taxmin qilinmaydi; migratsiya va eski bazaga moslik faqat amalga oshirilgan kod hamda alohida dalil doirasida baholanadi.

## Hibernate uchun qat’iy 14 shart

Har bir band asosiy agent tomonidan yakuniy tekshiruvda tasdiqlanishi kerak. Ushbu hujjatda ular bajarilgan deb belgilanmagan.

- [ ] 1. Gemini joriy ishning terminal handoffini e’lon qilgan.
- [ ] 2. Gemini frontend fayllarini tahrirlashni to‘xtatgan.
- [ ] 3. Terra va barcha boshqa subagentlar ishini tugatgan.
- [ ] 4. Hech qaysi agent loyiha fayllarini tahrirlamayapti.
- [ ] 5. Dependency o‘rnatish tugagan.
- [ ] 6. Backend implementatsiyasi tugagan.
- [ ] 7. Frontend implementatsiyasi tugagan.
- [ ] 8. Frontend/backend integratsiyasi tugagan.
- [ ] 9. Muhim funksiyalar amalda tekshirilgan.
- [ ] 10. Majburiy build va kritik testlar o‘tgan.
- [ ] 11. Barcha loyiha fayllari va hisobotlar saqlangan.
- [ ] 12. `docs/IMPLEMENTATION_REPORT.md` mavjud.
- [ ] 13. Yakuniy topshirish qarori GO.
- [ ] 14. Hech qanday muhim loyiha ishi qolmagan.

Bitta shart bajarilmasa ham hibernate mumkin emas. Tuzatiladigan ish davom ettiriladi; blok bo‘lsa aniq NO-GO hisoboti saqlanadi va kompyuter ishlashda qoladi.

## Windows imkoniyati va vakolat

Hibernation mavjudligi **noma’lum; ushbu docs vazifasida tekshirilmagan**. Power operatsiyasi faqat asosiy Sol agentiga tegishli; subagentlar buyruq bajarmaydi. Barcha 14 shartdan keyin asosiy agent o‘zi boshlagan serverlarni muloyim to‘xtatishi, package/build/test/migratsiya/fayl yozishlar tugaganini, DB yozuvlari saqlanganini, Git holatini va `powercfg /a` natijasini tekshirishi kerak.

Imkon mavjud bo‘lsa asosiy agent gate dalilini hisobotga saqlab, yakuniy operatsiya sifatida `shutdown.exe /h` bajarishi mumkin. `/f`, restart, oddiy shutdown, begona jarayonlarni to‘xtatish va power sozlamalarini o‘zgartirib cheklovni chetlab o‘tish taqiqlangan. Imkon yo‘q yoki buyruq xato bersa, haqiqiy xato qayd qilinadi va kompyuter ishlashda qoladi. Hibernation sodir bo‘lmasdan oldin muvaffaqiyat deb yozilmaydi.
