# Ishlarni dekompozitsiya qilish — WBS

| Kod | Ish paketi          | Natija                                    | Bog‘liqlik |
| --- | ------------------- | ----------------------------------------- | ---------- |
| 1.1 | Talab va API        | Muzlatilgan shartnoma                     | —          |
| 1.2 | Root monorepo       | Workspaces va yagona lockfile             | 1.1        |
| 2.1 | SQLite sxema        | Qayta ishlatiladigan migratsiya           | 1.1        |
| 2.2 | Auth va ruxsat      | Sessiya, pending, tasdiqlash              | 2.1        |
| 2.3 | CRUD va hisoblar    | Loyiha, vazifa, a’zo, risk                | 2.2        |
| 2.4 | Seed va test        | Xavfsiz demo va izolyatsiyalangan testlar | 2.3        |
| 3.1 | Frontend sahifalari | Tasdiqlangan UI                           | 1.1        |
| 3.2 | API ulash           | Relative fetch va Vite proxy              | 2.3, 3.1   |
| 4.1 | Integratsiya        | To‘liq foydalanuvchi oqimlari             | 2.4, 3.2   |
| 4.2 | Hujjat va demo      | Qo‘llanma, dalil, GO/NO-GO                | 4.1        |

Bu reja; ish paketining bajarilgani haqiqiy tekshiruv hisobotida belgilanadi.
