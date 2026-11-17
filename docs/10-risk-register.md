# Risk reyestri

Quyidagilar rejalashtirish uchun dastlabki baholar. Ehtimol va ta’sir 1–5 oralig‘ida butun son; ball = ehtimol × ta’sir. 1–5 past, 6–12 o‘rta, 13–25 yuqori.

| ID  | Risk                               | Ehtimol | Ta’sir | Ball/daraja | Kamaytirish                               | Rejadagi mas’ul   |
| --- | ---------------------------------- | ------: | -----: | ----------- | ----------------------------------------- | ----------------- |
| R1  | Frontend va API mos kelmaydi       |       3 |      5 | 15 yuqori   | Shartnoma, proxy, integratsiya testi      | Team Lead         |
| R2  | Lockfile bir vaqtda o‘zgartiriladi |       3 |      4 | 12 o‘rta    | Faqat Codex rootdan install qiladi        | Team Lead         |
| R3  | A’zo ortiqcha ruxsat oladi         |       2 |      5 | 10 o‘rta    | Har so‘rovda server authz testi           | Backend Developer |
| R4  | Ma’lumot migratsiyada yo‘qoladi    |       2 |      5 | 10 o‘rta    | Non-destructive migratsiya, restart testi | Backend Developer |
| R5  | Bir kunlik muddat yetmaydi         |       4 |      4 | 16 yuqori   | MVP ko‘lami, WIP chegarasi, erta handoff  | Team Lead         |

```mermaid
quadrantChart
    title Riskni ko‘rib chiqish matritsasi
    x-axis Past ehtimol --> Yuqori ehtimol
    y-axis Past ta’sir --> Yuqori ta’sir
    quadrant-1 Birinchi navbatda boshqarish
    quadrant-2 Ta’sirni kamaytirish
    quadrant-3 Kuzatish
    quadrant-4 Ehtimolni kamaytirish
    R1: [0.6, 1.0]
    R2: [0.6, 0.8]
    R3: [0.4, 1.0]
    R4: [0.4, 1.0]
    R5: [0.8, 0.8]
```

Matritsa vizual yo‘riqnoma; ilovadagi daraja yuqoridagi sonli chegaralar bilan hisoblanadi. Risk holatlari: `active`, `monitoring`, `resolved`.
