# pnpm monorepo migratsiyasi

2026-11-17, Asia/Tashkent.

## Natija

- `frontend/` → `apps/frontend/`.
- `backend/` → `apps/backend/`, jumladan mavjud lokal SQLite baza va credential fayli.
- `ui/` → `docs/design/`; 17 ta fayl xeshlari tekshirildi, mazmuni o‘zgarmagan.
- Ildizda `pnpm-workspace.yaml`, `packageManager: pnpm@12.14.0` va yagona `pnpm-lock.yaml`.
- npm lockfile import qilindi. Oldingi `package-lock.json` va dependency kataloglari recovery nusxasida saqlandi.
- Dev, build, typecheck, seed, production va test skriptlari pnpmga moslandi.
- Ildiz testlari bevosita ishlatadigan `tsx` va `vite` ildiz manifestida e’lon qilindi.
- Vite ruxsat etilgan yo‘llari ilovaning hamda ildizning `node_modules` kataloglariga moslandi; backend credential himoyasi saqlandi.
- Test importlari, E2E baza yo‘llari, Git ignore va amaldagi qo‘llanmalar yangilandi. Backendning production frontend yo‘li ilovalar o‘zaro joylashuvi saqlangani uchun o‘zgartirish talab qilmadi.

Gemini handoffi va frontend ilova manbalari mazmuni o‘zgartirilmadi. Tarixiy hisobotlarga yangi yo‘llarni tushuntiruvchi izoh qo‘shildi.

## Tekshiruvlar

| Tekshiruv | Natija |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm typecheck` | PASS, ikkala ilova |
| `pnpm test` | PASS, 17 backend + 3 frontend contract + 1 dev-security |
| `pnpm test:integration` | PASS, production build va 1 HTTP integration |
| Tanlangan production brauzer testlari | PASS, 12 ta, alohida SQLite nusxasida |
| `pnpm dev` | PASS, 5173 frontend, 4000 backend va API proxy |
| Dev brauzer smoke | PASS, Vite modullari, login, dashboard, API, logout; brauzer xatolari yo‘q |
| Asl ma’lumotlarni solishtirish | PASS, users/members/projects/tasks/risks yozuvlari va credential fayli saqlangan |

Dastlab ko‘chirilgan backend testlarida `apps/node_modules/tsx`ga bog‘langan ikkita yo‘l xato berdi: `demo seed never elevates a registered account matching the fictional manager email` va `demo seed is repeatable and preserves existing passwords and user edits`. Ular `import.meta.resolve("tsx/cli")` orqali paketni aniqlashga o‘zgartirildi va yakuniy to‘liq `pnpm test` o‘tdi.

Brauzer tekshiruvi butun E2E suite emas: alohida bazada CRUD va regressiya ssenariylari bajarildi; watcher restart va default bazaga to‘g‘ridan-to‘g‘ri cleanup qiladigan testlar bajarilmadi. Vaqtinchalik brauzer bazasi testdan so‘ng olib tashlandi. Node SQLite/MockTimers experimental ogohlantirishlari va Playwright rang muhiti ogohlantirishi test natijalariga ta’sir qilmadi.

## Ishga tushirish

Loyiha ildizidan:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Frontend: http://localhost:5173. Production: `pnpm build`, so‘ng `pnpm start`.

`setup` skriptini chaqirish kerak bo‘lsa, `pnpm run setup` ishlating: `pnpm setup` pnpmning o‘z ichki buyrug‘idir.

## Recovery

Migratsiyadan oldingi kod, testlar, hujjatlar, lokal data va npm dependency kataloglari quyida saqlangan:

`C:\Users\user\AppData\Local\Temp\teamflow-monorepo-20261117-103053`

Dev loglari, izolyatsiyalangan brauzer runneri va test konfiguratsiyasi ham shu katalogda. Lokal data va credential nusxalari repositoryga qo‘shilmagan. Git repositoryda hali commit yo‘q; fayllar untracked holatda, commit yoki reset bajarilmadi.
