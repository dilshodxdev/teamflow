# TeamFlow REST API shartnomasi

Ushbu hujjat frontend va backendning kelishilgan chegarasi. Mashina o‘qiydigan shakl: [openapi.yaml](openapi.yaml). API shaklini Gemini va foydalanuvchi bilan kelishmasdan o‘zgartirmang.

Development: frontend `http://localhost:5173`, backend `http://localhost:4000`, prefiks `/api`. Frontend relative so‘rov va Vite proxy ishlatadi. **Barcha mutatsiyalarda, shu jumladan DELETE va logoutda**, `Content-Type: application/json` talab qilinadi; body kerak bo‘lmasa ham shu headerni yuboring, logout uchun `{}` yuborish mumkin. Kutilgan browser Origin tekshiriladi. Auth — `teamflow_session` HttpOnly cookie, bearer token emas.

Muvaffaqiyat: `{ "data": ... }`. Xato: `{ "error": { "code": "ERROR_CODE", "message": "Error message" } }`. GET kolleksiya `data` ichidagi massiv. POST — 201; GET/PATCH — 200; DELETE/logout — tanasiz 204. 204ga `response.json()` chaqirmang.

| HTTP | Ma’nosi                                                  | Kod              |
| ---- | -------------------------------------------------------- | ---------------- |
| 400  | Noto‘g‘ri input, noma’lum maydon yoki bo‘sh PATCH        | VALIDATION_ERROR |
| 401  | Sessiya yo‘q, yaroqsiz yoki login noto‘g‘ri              | UNAUTHORIZED     |
| 403  | Ruxsat, pending yoki origin cheklovi                     | FORBIDDEN        |
| 404  | Resurs topilmadi                                         | NOT_FOUND        |
| 409  | Unikal email yoki himoyalangan identifikatsiya ziddiyati | CONFLICT         |
| 429  | Login urinishlari chegarasi                              | RATE_LIMITED     |
| 500  | Sanitizatsiya qilingan ichki xato                        | INTERNAL_ERROR   |

Server ichki SQL, parol hash yoki sessiya hashini qaytarmaydi. IDlar UUID string, sanalar haqiqiy `YYYY-MM-DD`; `startDate <= dueDate`. PATCH faqat yuborilgan maydonlarni yangilaydi, kamida bitta ruxsatli maydon talab qiladi. Noma’lum va hisoblanadigan maydonlar mutatsiyada rad etiladi.

## Auth va health

| Endpoint              | Body                                             | Natija                            |
| --------------------- | ------------------------------------------------ | --------------------------------- |
| POST `/auth/register` | `{fullName,email,password}`                      | 201 AuthUser; yangi hisob pending |
| POST `/auth/login`    | `{email,password}`                               | 201 AuthUser; sessiya cookie      |
| GET `/auth/me`        | —                                                | 200 AuthUser                      |
| POST `/auth/logout`   | JSON body talab qilinganida `{}` yuborish mumkin | 204; sessiya va cookie bekor      |
| GET `/health`         | —                                                | 200 `{data:{status:"ok"}}`        |

```ts
type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "manager" | "member" | "pending";
  memberId: string | null;
};
```

Email trim va lowercase qilinadi (maksimum 254 belgi); parol kamida sakkiz belgi va ko‘pi bilan 72 UTF-8 bayt. Nom/sarlavha/kasbiy rol trimdan keyin 1–200 belgi; description/mitigation ko‘pi bilan 5000 belgi. Bir xil email 409. Registratsiya mavjud memberga email mosligi asosida avtomatik bog‘lanmaydi. Manager memberni yaratishi yoki aniq saqlashi matching ro‘yxatdan o‘tgan hisobni tasdiqlaydi. Bu qo‘lda tasdiqlash, email ownership verification emas.

## Loyihalar

GET/POST `/projects`; GET/PATCH/DELETE `/projects/:id`.

```ts
type ProjectInput = {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
};
type Project = ProjectInput & {
  id: string;
  status: "planned" | "in_progress" | "done";
  progress: number;
};
```

POST barcha input maydonlarini oladi; PATCH qisman oladi. Faqat manager yozadi. Progress = done/total × 100, eng yaqin butun songa yaxlitlanadi, vazifa yo‘q bo‘lsa 0. Vazifa yo‘q yoki barchasi todo → planned; barchasi done → done; qolgan holatlar → in_progress. Status/progress clientdan qabul qilinmaydi. DELETE vazifalar va risklarni ham o‘chiradi.

## Vazifalar

GET/POST `/tasks`; GET/PATCH/DELETE `/tasks/:id`; GET `/tasks?projectId=ID`.

```ts
type TaskInput = {
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  startDate: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
};
type Task = TaskInput & { id: string };
```

POST barcha input maydonlarini oladi; PATCH qisman. Project/member havolasi mavjud bo‘lishi shart. Manager to‘liq CRUD qiladi. Member faqat o‘z `memberId`iga biriktirilgan vazifani yaratadi yoki tahrirlaydi, boshqa a’zoga yoki nullga tayinlay olmaydi, o‘chira olmaydi. Boshqa mas’ulning vazifasini tahrirlash 403.

Overdue: `dueDate` Asia/Tashkentdagi bugungi kundan oldin va status done emas. DTOga qo‘shimcha computed overdue maydoni kiritilmaydi. Taqvim va statistika shu vazifalardan hosil qilinadi.

## A’zolar

GET/POST `/members`; PATCH/DELETE `/members/:id`. Alohida GET-by-id yo‘q.

```ts
type MemberInput = { fullName: string; email: string; role: string };
type Member = MemberInput & { id: string; accessRole: "manager" | "member" };
```

`role` kasbiy rol, ilova ruxsati emas. Faqat manager yozadi. Yangi member `accessRole: "member"` oladi; input `accessRole` qabul qilinmaydi. Login hisobi bo‘lmagan member mumkin. Explicit create/PATCH matching registratsiya hisobini bog‘lashi mumkin; allaqachon bog‘langan identifikatsiya va birlamchi manager hisobi himoyalanadi. Oddiy a’zo o‘chirilganda task/risk `assigneeId=null`, jamoaga kirish va sessiyalar bekor bo‘ladi.

## Risklar

GET/POST `/risks`; PATCH/DELETE `/risks/:id`; GET `/risks?projectId=ID`. Alohida GET-by-id yo‘q.

```ts
type RiskInput = {
  projectId: string;
  title: string;
  probability: number;
  impact: number;
  mitigation: string;
  assigneeId: string | null;
  status: "active" | "monitoring" | "resolved";
};
type Risk = RiskInput & {
  id: string;
  score: number;
  level: "low" | "medium" | "high";
};
```

Faqat manager yozadi. Probability va impact 1–5 butun son. Score = probability × impact; 1–5 low, 6–12 medium, 13–25 high. Score/level inputda rad etiladi. Project va nullable assignee havolalari tekshiriladi.

## Ruxsatlar

| Amal                                           | Manager | Member | Pending |
| ---------------------------------------------- | ------- | ------ | ------- |
| me/logout                                      | Ha      | Ha     | Ha      |
| Team ma’lumotlarini o‘qish                     | Ha      | Ha     | Yo‘q    |
| Project/member/risk yozish                     | Ha      | Yo‘q   | Yo‘q    |
| O‘ziga task yaratish va o‘z taskini tahrirlash | Ha      | Ha     | Yo‘q    |
| Boshqalarga task tayinlash yoki task o‘chirish | Ha      | Yo‘q   | Yo‘q    |

Har so‘rovdagi joriy DB a’zoligi yakuniy ruxsat manbai; frontend yuborgan rolga ishonilmaydi. Health va register/login ommaviy endpointlar.
