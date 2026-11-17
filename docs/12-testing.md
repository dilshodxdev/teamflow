# Sinov rejasi

Bu hujjat **reja va qabul testlari**. O‘tgan testlar soni, build va integratsiya dalillari faqat `docs/IMPLEMENTATION_REPORT.md`dagi haqiqiy bajarish natijalari bilan belgilanadi.

Avtomatik testlar alohida vaqtinchalik SQLite bazasida ishlaydi; demo yoki foydalanuvchi bazasi test uchun tozalanmaydi. Test avval yetishmayotgan xatti-harakatni ko‘rsatishi, implementatsiyadan so‘ng qayta bajarilishi kerak.

| ID  | Ssenariy                                                       | Kutilgan natija                             |
| --- | -------------------------------------------------------------- | ------------------------------------------- |
| T01 | To‘g‘ri registratsiya                                          | Hisob, HttpOnly sessiya, `pending`          |
| T02 | Qisqa parol / takroriy email                                   | 400 / 409                                   |
| T03 | To‘g‘ri va noto‘g‘ri login                                     | Hisob / 401                                 |
| T04 | Cookie yo‘q, buzilgan yoki eskirgan                            | 401                                         |
| T05 | Logout va eski cookie bilan qayta so‘rov                       | 204, so‘ng 401                              |
| T06 | Pending kolleksiyani o‘qiydi                                   | 403                                         |
| T07 | Email mos bo‘lsa registratsiya avtomatik bog‘lanmaydi          | Pending saqlanadi                           |
| T08 | Manager a’zoni aniq saqlaydi                                   | Hisob bog‘lanadi, keyingi so‘rov member     |
| T09 | Member loyiha/risk/a’zo mutatsiyasi                            | 403                                         |
| T10 | Member o‘ziga vazifa yaratadi/tahrirlaydi                      | 201 / 200                                   |
| T11 | Member boshqa mas’ul yoki o‘chirishni so‘raydi                 | 403                                         |
| T12 | Loyiha va vazifa CRUD, filtr                                   | Aniq DTO va HTTP kodlari                    |
| T13 | Vazifa holatini o‘zgartirish                                   | Progress va loyiha holati qayta hisoblanadi |
| T14 | Nol vazifa; hammasi todo; hammasi done                         | 0/planned; 0/planned; 100/done              |
| T15 | Risk ball chegaralari 5, 6, 12, 13                             | low, medium, medium, high                   |
| T16 | Oddiy a’zoni o‘chirish                                         | Vazifa/risk mas’ulsiz; sessiyalar bekor     |
| T17 | Birlamchi managerni o‘chirish/identifikatsiyasini almashtirish | Rad etiladi                                 |
| T18 | Loyihani o‘chirish                                             | Bog‘liq vazifa va risklar cascade           |
| T19 | Noto‘g‘ri sana, ID, enum va risk soni                          | 400 yoki mavjud bo‘lmagan resurs uchun 404  |
| T20 | Begona Origin yoki noto‘g‘ri Content-Type                      | Mutatsiya rad etiladi                       |
| T21 | Login limitini oshirish                                        | 429                                         |
| T22 | Ilovani qayta boshlash                                         | Oldingi loyiha va sessiya DBda saqlanadi    |

Rootdan: `pnpm test`, `pnpm build`; TypeScript tekshiruvi workspace skriptlariga muvofiq bajariladi. Frontend handoffdan keyin brauzerda kirish → loyiha → vazifa → Kanban → taqvim → risk → logout tekshiriladi. `pnpm dev` ikkala portni, production `pnpm start` esa build qilingan ilovani tekshirish uchun ishlatiladi.
