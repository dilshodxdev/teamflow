import dotenv from "dotenv";
import path from "node:path";
import { openSync, writeFileSync, closeSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
const backend = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
dotenv.config({ path: path.join(backend, ".env") });
const databasePath = path.resolve(
  backend,
  process.env.DATABASE_PATH || "data/teamflow.db",
);
const dbName = path.parse(databasePath).name;
const credentialsPath = path.join(
  path.dirname(databasePath),
  dbName === "teamflow"
    ? "demo-credentials.json"
    : `${dbName}.demo-credentials.json`,
);
const { db } = createApp({ databasePath });
const one = (sql: string, ...a: any[]) =>
  db.prepare(sql).get(...a) as Record<string, any> | undefined;
const run = (sql: string, ...a: any[]) => db.prepare(sql).run(...a);
const stamp = new Date().toISOString();
const names = [
  "Matyaqubov Dilshodbek",
  "Komilov Amirbek Oybek o‘g‘li",
  "Xajiyeva Sevinch Shavkatovna",
  "Qalandarova Sohiba Ulug‘bek qizi",
  "Xudayberdiyeva Maftuna Kamol qizi",
];
const roles = [
  "Project Manager / Team Lead",
  "Backend Developer",
  "Frontend Developer",
  "Frontend Developer",
  "Business Analyst / QA Engineer",
];
const emails = [
  process.env.DEMO_MANAGER_EMAIL || "manager@example.test",
  process.env.DEMO_MEMBER_EMAIL || "member@example.test",
  "frontend1@example.test",
  "frontend2@example.test",
  "qa@example.test",
].map((s) => s.trim().toLowerCase());
if (
  new Set(emails).size !== 5 ||
  emails.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
)
  throw new Error("Demo emails must be valid and distinct");
const credentials: Record<string, { email: string; password: string }> = {};
let credentialFileCreated = false;
const day = (offset: number) => {
  const now = new Date(Date.now() + offset * 86400000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
};
db.exec("BEGIN IMMEDIATE");
try {
  const memberIds: string[] = [];
  for (let i = 0; i < 5; i++) {
    let member = one("SELECT * FROM members WHERE email=?", emails[i]);
    if (!member) {
      let uid: string | null = null;
      if (
        i < 2 &&
        !one("SELECT id FROM users WHERE email=?", emails[i]) &&
        (i !== 0 || !one("SELECT id FROM members WHERE access_role='manager'"))
      ) {
        const supplied =
          i === 0
            ? process.env.DEMO_MANAGER_PASSWORD
            : process.env.DEMO_MEMBER_PASSWORD;
        const pass = supplied || randomBytes(18).toString("base64url");
        if (pass.length < 8 || Buffer.byteLength(pass) > 72)
          throw new Error("Demo passwords must be 8–72 bytes");
        uid = randomUUID();
        run(
          "INSERT INTO users VALUES (?,?,?,?,?)",
          uid,
          names[i],
          emails[i],
          bcrypt.hashSync(pass, 10),
          stamp,
        );
        if (!supplied)
          credentials[i === 0 ? "manager" : "member"] = {
            email: emails[i],
            password: pass,
          };
      }
      const mid = randomUUID();
      run(
        "INSERT INTO members VALUES (?,?,?,?,?,?,?)",
        mid,
        uid,
        names[i],
        emails[i],
        roles[i],
        i === 0 && uid ? "manager" : "member",
        stamp,
      );
      member = { id: mid };
    }
    memberIds.push(member.id);
  }
  if (!one("SELECT id FROM projects WHERE name=?", "TeamFlow MVP (demo)")) {
    const pid = randomUUID();
    run(
      "INSERT INTO projects VALUES (?,?,?,?,?,?,?)",
      pid,
      "TeamFlow MVP (demo)",
      "Fictional demonstration data; not verified student contributions.",
      day(-10),
      day(20),
      stamp,
      stamp,
    );
    const titles = [
      "Define project scope",
      "Design data model",
      "Build authentication",
      "Create project API",
      "Implement task board",
      "Build dashboard",
      "Implement calendar",
      "Manage team members",
      "Add risk register",
      "Verify permissions",
      "Prepare demo",
      "Review acceptance criteria",
    ];
    for (let i = 0; i < titles.length; i++)
      run(
        "INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        randomUUID(),
        pid,
        titles[i],
        "Demonstration task",
        memberIds[i % 5],
        day(-9 + i),
        day(-4 + i * 2),
        ["high", "medium", "low"][i % 3],
        ["done", "in_progress", "todo"][i % 3],
        stamp,
        stamp,
      );
    for (const [title, probability, impact, mitigation, status, index] of [
      ["Schedule delay", 4, 4, "Prioritize core workflow", "active", 0],
      ["Integration mismatch", 3, 4, "Verify API contract", "monitoring", 1],
      ["Incomplete testing", 2, 3, "Run acceptance checks", "active", 4],
      ["Scope growth", 2, 2, "Keep MVP scope fixed", "resolved", 0],
    ] as const)
      run(
        "INSERT INTO risks VALUES (?,?,?,?,?,?,?,?,?,?)",
        randomUUID(),
        pid,
        title,
        probability,
        impact,
        mitigation,
        memberIds[index],
        status,
        stamp,
        stamp,
      );
  }
  if (Object.keys(credentials).length) {
    const fd = openSync(credentialsPath, "wx", 0o600);
    credentialFileCreated = true;
    try {
      writeFileSync(fd, JSON.stringify(credentials, null, 2) + "\n", "utf8");
    } finally {
      closeSync(fd);
    }
  }
  db.exec("COMMIT");
} catch (e) {
  db.exec("ROLLBACK");
  if (credentialFileCreated) unlinkSync(credentialsPath);
  throw e;
} finally {
  db.close();
}
console.log("Demo seed complete. Existing accounts and data were preserved.");
if (credentialFileCreated)
  console.log(`Generated demo credentials saved to ${credentialsPath}`);
else
  console.log(
    "No new generated credentials; existing credentials were not changed.",
  );
