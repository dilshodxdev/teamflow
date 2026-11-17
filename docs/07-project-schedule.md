# Bir kunlik ish jadvali

Rejalashtirilgan sana: **2026-11-17**, vaqt zonasi **Asia/Tashkent**. Boshlanish vaqti jamoaning mavjudligiga moslashtiriladi; jadval sarflangan haqiqiy vaqt hisoboti emas.

| Nisbiy vaqt | Rejalashtirilgan ish                    | Natija                      |
| ----------- | --------------------------------------- | --------------------------- |
| 0:00–0:45   | Talab, API va egalik chegaralari        | Bir xil shartnoma           |
| 0:45–2:30   | DB, auth; frontend karkasi parallel     | Sessiya va sahifa asoslari  |
| 2:30–4:30   | CRUD, ruxsatlar; UI ulash               | Funksional modullar         |
| 4:30–5:30   | Test, seed, hujjat                      | Tekshiruvga tayyor backend  |
| 5:30–7:00   | Frontend handoff va integratsiya        | Real ma’lumot bilan oqimlar |
| 7:00–8:00   | Qayta ishga tushirish testi va namoyish | GO/NO-GO hisoboti           |

Kritik yo‘l: API → auth → CRUD → frontend handoff → integratsiya → qabul. Handoff kechiksa, backend alohida tekshiriladi, to‘liq ilova tayyor deb e’lon qilinmaydi. Zaxira vaqt: oxirgi bir soatdagi xatolarni tuzatish.
