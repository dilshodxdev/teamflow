# Kanban usuli

Bir kunlik MVP uchun Kanban: kichik vazifa, aniq mas’ul, ko‘rinadigan holat. Vazifa holatlari API bilan bir xil: `todo`, `in_progress`, `done`.

| Holat       | Kirish sharti                   | Chiqish sharti                            |
| ----------- | ------------------------------- | ----------------------------------------- |
| todo        | Vazifa va qabul mezoni yozilgan | Mas’ul ishni boshlaydi                    |
| in_progress | Mas’ul belgilangan              | Kod tayyor, tegishli tekshiruv bajarilgan |
| done        | Tekshiruv dalili mavjud         | Qabul mezoni bajarilgan                   |

Rejalashtirilgan WIP chegarasi: har bir kishi uchun bir faol vazifa. Bloklangan ish `in_progress`da qoladi, sabab issue ichida yoziladi. Qisqa nazorat: boshlanish, integratsiya oldi va topshirish oldi.

Demo seed holatlari usulni ko‘rsatish uchun; ular haqiqiy bajarilgan ish hisoboti emas. GitHub issue draftlari [github-issue-drafts.md](github-issue-drafts.md)da.
