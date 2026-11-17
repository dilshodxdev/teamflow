# Talablar

| ID  | Funksional talab                                          | Tekshirish                                 |
| --- | --------------------------------------------------------- | ------------------------------------------ |
| F01 | Ro‘yxatdan o‘tish, kirish, chiqish va sessiya             | API testi va brauzer                       |
| F02 | Boshqaruvchi a’zoni qo‘lda tasdiqlaydi                    | Pending → member oqimi                     |
| F03 | Loyihani yaratish, ko‘rish, tahrirlash, o‘chirish         | CRUD testi                                 |
| F04 | Vazifa, mas’ul, ustuvorlik va holatni boshqarish          | CRUD va ruxsat testi                       |
| F05 | Dashboard, Kanban va taqvim haqiqiy vazifalardan tuziladi | Integratsiya                               |
| F06 | Jamoa a’zolarini boshqarish                               | A’zoni o‘chirish va sessiyani bekor qilish |
| F07 | Risk bahosi va darajasi serverda hisoblanadi              | Chegara qiymatlar testi                    |

| ID  | Nofunksional talab                        | Qabul sharti                                                            |
| --- | ----------------------------------------- | ----------------------------------------------------------------------- |
| N01 | Windowsda bitta terminaldan ishga tushish | Root `pnpm dev` ikki serverni boshlaydi                                 |
| N02 | Ma’lumot doimiyligi                       | Qayta ishga tushganda SQLite yozuvlari saqlanadi                        |
| N03 | Xavfsizlik                                | Hashlangan parol va sessiya; HttpOnly cookie; server ruxsat nazorati    |
| N04 | Validatsiya                               | Noto‘g‘ri sana, enum, ID va risk qiymatlari rad etiladi                 |
| N05 | Soddalik                                  | Bitta Git, pnpm workspaces, bitta root lockfile; bulut talab qilinmaydi |
| N06 | Xatolar                                   | Bir xil JSON xato shakli, ichki sirlar javobga chiqmaydi                |

Aniq REST shakllari: [API_CONTRACT.md](API_CONTRACT.md). Amalga oshirilgan tekshiruv natijalari `docs/IMPLEMENTATION_REPORT.md`da qayd qilinadi.
