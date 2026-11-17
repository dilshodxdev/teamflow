# GitHub issue draftlari

Quyidagilar mahalliy **draftlar**; GitHubga chop etilmagan va hech kimga assignment yuborilmagan. Mas’ullar taklif etilgan; GitHub username berilmaganligi sabab uydirma account ishlatilmagan. Bajarilgan hissalar sifatida talqin qilinmasin.

## 1. MVP ko‘lami, integratsiya va demo qabulini boshqarish

Taklif etilgan mas’ul: Matyaqubov Dilshodbek. Label: `management`, `integration`.

Natija: API shartnomasini saqlash, bir kunlik jadval va handoffni kuzatish, yakuniy GO/NO-GO dalillarini yig‘ish.

Qabul: root monorepo buyruqlari bajariladi; boshqa agent install qilmaydi; frontend handoff mavjud; demo ssenariy va cheklovlar yozilgan. Bog‘liqlik: barcha texnik issue.

## 2. SQLite REST backend va ruxsatlarni tekshirish

Taklif etilgan mas’ul: Komilov Amirbek Oybek o‘g‘li. Label: `backend`, `security`.

Natija: auth, pending approval, CRUD, migratsiya, seed va izolyatsiyalangan testlarni ko‘rib chiqish.

Qabul: API_CONTRACTga mos javoblar; member o‘z vazifasigagina yozadi; primary manager himoyalangan; session token hash; restartda saqlanish; avtomatik test va build dalili. Bog‘liqlik: muzlatilgan API.

## 3. Auth, dashboard va loyiha interfeysini real APIga ulash

Taklif etilgan mas’ul: Xajiyeva Sevinch Shavkatovna. Label: `frontend`, `auth`.

Natija: tasdiqlangan UI bilan login/register/pending, dashboard va project CRUD.

Qabul: relative fetch/Vite proxy; HttpOnly cookie; xato va 204 ishlovi; roldan kelib chiqib amallar; mock o‘rniga haqiqiy ma’lumot; responsive ko‘rinish. Faqat frontend fayllari, installni Codex bajaradi. Bog‘liqlik: auth va loyiha API.

## 4. Vazifa, Kanban, taqvim va jamoa interfeysi

Taklif etilgan mas’ul: Qalandarova Sohiba Ulug‘bek qizi. Label: `frontend`, `tasks`.

Natija: vazifa formasi, mas’ul, ustuvorlik, Kanban holati, taqvim va jamoa statistikasi.

Qabul: o‘zgarish SQLitega saqlanadi; reload natijani saqlaydi; Asia/Tashkent sanalari; member ruxsati va server xatosi ko‘rsatiladi; tasdiqlangan UI saqlanadi. Xajiyeva bilan frontend fayl egaligi oldindan bo‘linadi. Bog‘liqlik: task/member API.

## 5. Risk, talablar va yakuniy qabul sinovlari

Taklif etilgan mas’ul: Xudayberdiyeva Maftuna Kamol qizi. Label: `qa`, `documentation`, `risks`.

Natija: talablar kuzatuvi, risk reyestri, test ssenariylari va demo tekshiruvi.

Qabul: risk 1–5 validatsiyasi va 5/6/12/13 chegaralari; pending/member/manager oqimlari; deletion/cascade/restart tekshiruvi; har bir natija bajarilgan yoki kutilmoqda deb aniq belgilangan. Haqiqiy talaba hissasi uydirilmaydi. Bog‘liqlik: integratsiyaga tayyor apps/frontend/backend.
