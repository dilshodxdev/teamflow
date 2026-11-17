import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID, randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const demo = JSON.parse(
  readFileSync("apps/backend/data/demo-credentials.json", "utf8"),
);
async function login(page: Page, account = demo.manager) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Parol", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: /^Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
async function change(
  page: Page,
  method: string,
  endpoint: string,
  action: () => Promise<unknown>,
) {
  const promise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/" + endpoint &&
      response.request().method() === method,
  );
  await action();
  const response = await promise;
  expect(response.status()).toBe(
    method === "POST" ? 201 : method === "DELETE" ? 204 : 200,
  );
  return response.status() === 204 ? undefined : (await response.json()).data;
}
const save = (page: Page, method: string, endpoint: string) =>
  change(page, method, endpoint, () =>
    page
      .getByRole("dialog")
      .getByRole("button", { name: /Saqlash/ })
      .click(),
  );
const card = (page: Page, name: string) =>
  page
    .locator(".group")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });
const remove = (page: Page, endpoint: string) =>
  change(page, "DELETE", endpoint, () =>
    page
      .getByRole("dialog")
      .getByRole("button", { name: "O'chirish", exact: true })
      .click(),
  );

test("manager project/task/risk CRUD updates Kanban, dashboard and calendar using real data", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const suffix = randomUUID().slice(0, 8);
  let projectId: string | undefined;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page);
  const members = (await (await page.request.get("/api/members")).json()).data;
  const manager = members.find(
    (member: any) => member.accessRole === "manager",
  );
  const ordinary = members.find(
    (member: any) => member.email === demo.member.email,
  );
  const baselineTasks = (await (await page.request.get("/api/tasks")).json())
    .data.length;
  const projectName = `UI project ${suffix}`;
  const editedProject = projectName + " edited";
  const taskName = `UI task ${suffix}`;
  const editedTask = taskName + " edited";
  const riskName = `UI risk ${suffix}`;
  try {
    await page.goto("/projects");
    await page.getByRole("button", { name: /Yangi loyiha/ }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Loyiha nomi *", { exact: true }).fill(projectName);
    await dialog
      .getByLabel("Tavsif", { exact: true })
      .fill("Temporary automated acceptance data");
    await dialog
      .getByLabel("Boshlanish sanasi *", { exact: true })
      .fill("2026-11-19");
    await dialog
      .getByLabel("Tugash sanasi *", { exact: true })
      .fill("2026-11-18");
    await dialog.getByRole("button", { name: /Saqlash/ }).click();
    await expect(
      dialog.getByText(
        "Boshlanish sanasi tugash sanasidan keyin bo‘lishi mumkin emas",
        { exact: true },
      ),
    ).toBeVisible();
    await dialog
      .getByLabel("Boshlanish sanasi *", { exact: true })
      .fill("2026-11-17");
    const project = await save(page, "POST", "projects");
    projectId = project.id;
    await expect(
      page.getByRole("heading", { name: projectName, exact: true }),
    ).toBeVisible();
    await card(page, projectName)
      .getByTitle("Tahrirlash", { exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Loyiha nomi *", { exact: true })
      .fill(editedProject);
    await save(page, "PATCH", `projects/${projectId}`);
    await expect(
      page.getByRole("heading", { name: editedProject, exact: true }),
    ).toBeVisible();

    await page.goto(`/tasks?projectId=${projectId}`);
    await page.getByRole("button", { name: /Yangi vazifa/ }).click();
    dialog = page.getByRole("dialog");
    await dialog.locator("#taskTitle").fill(taskName);
    await dialog
      .locator("#taskDesc")
      .fill("Temporary task that verifies the real API");
    await dialog.locator("#taskProject").selectOption(projectId!);
    await dialog.locator("#taskAssignee").selectOption(ordinary.id);
    await dialog.locator("#taskStartDate").fill("2026-11-17");
    await dialog.locator("#taskDueDate").fill("2026-11-18");
    await dialog.locator("#taskPriority").selectOption("high");
    const task = await save(page, "POST", "tasks");
    expect(task.assigneeId).toBe(ordinary.id);
    await expect(
      page.getByRole("heading", { name: taskName, exact: true }),
    ).toBeVisible();
    await card(page, taskName)
      .getByTitle("Tahrirlash", { exact: true })
      .click();
    await page.getByRole("dialog").locator("#taskTitle").fill(editedTask);
    await page
      .getByRole("dialog")
      .locator("#taskAssignee")
      .selectOption(manager.id);
    const changedTask = await save(page, "PATCH", `tasks/${task.id}`);
    expect(changedTask.assigneeId).toBe(manager.id);
    await change(page, "PATCH", `tasks/${task.id}`, () =>
      card(page, editedTask).getByRole("combobox").selectOption("done"),
    );
    await expect(card(page, editedTask).getByRole("combobox")).toHaveValue(
      "done",
    );
    const completed = (
      await (await page.request.get(`/api/projects/${projectId}`)).json()
    ).data;
    expect(completed.progress).toBe(100);
    expect(completed.status).toBe("done");

    await page.goto("/dashboard");
    await page.getByRole("combobox").selectOption(projectId!);
    await expect(
      page.getByText("Bajarilish: 100%", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("main")
        .getByText("Vazifalar", { exact: true })
        .locator(".."),
    ).toContainText(String(baselineTasks + 1));
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("button", { name: /Chiqish/ })).toBeVisible();
    await page.goto("/calendar");
    await page.getByRole("combobox").selectOption(projectId!);
    const calendarGrid = page
      .locator(".grid-cols-7")
      .filter({ hasText: editedTask });
    await expect(
      calendarGrid.getByText(editedTask, { exact: true }),
    ).toBeVisible();
    await calendarGrid.getByText(editedTask, { exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("18 Noyabr 2026");
    await page.keyboard.press("Escape");

    await page.goto("/risks");
    await page.getByRole("button", { name: /Yangi risk/ }).click();
    dialog = page.getByRole("dialog");
    await dialog.locator("#riskTitle").fill(riskName);
    await dialog.locator("#riskProject").selectOption(projectId!);
    await dialog.locator("#riskAssignee").selectOption(ordinary.id);
    await dialog.locator("#probRange").press("End");
    await dialog.locator("#impactRange").press("End");
    await dialog.locator("#riskMitigation").fill("Acceptance mitigation");
    const risk = await save(page, "POST", "risks");
    expect(risk.score).toBe(25);
    expect(risk.level).toBe("high");
    let row = page.getByRole("row").filter({ hasText: riskName });
    await expect(row).toContainText("25 • Yuqori");
    await row.getByTitle("Tahrirlash", { exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog.locator("#riskTitle").fill(riskName + " edited");
    await dialog.locator("#probRange").press("Home");
    await dialog.locator("#probRange").press("ArrowRight");
    await dialog.locator("#impactRange").press("Home");
    await dialog.locator("#impactRange").press("ArrowRight");
    const editedRisk = await save(page, "PATCH", `risks/${risk.id}`);
    expect(editedRisk.score).toBe(4);
    expect(editedRisk.level).toBe("low");
    row = page.getByRole("row").filter({ hasText: riskName + " edited" });
    await expect(row).toContainText("4 • Past");
    await row.getByTitle("O'chirish", { exact: true }).click();
    await remove(page, `risks/${risk.id}`);
    await expect(row).toHaveCount(0);

    await page.goto(`/tasks?projectId=${projectId}`);
    await card(page, editedTask)
      .getByTitle("O'chirish", { exact: true })
      .click();
    await remove(page, `tasks/${task.id}`);
    await expect(
      page.getByRole("heading", { name: editedTask, exact: true }),
    ).toHaveCount(0);
    await page.goto("/projects");
    await card(page, editedProject)
      .getByTitle("O'chirish", { exact: true })
      .click();
    await remove(page, `projects/${projectId}`);
    await expect(
      page.getByRole("heading", { name: editedProject, exact: true }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally {
    if (projectId)
      await page.request.delete(`/api/projects/${projectId}`, {
        headers: { "Content-Type": "application/json" },
      });
  }
});

test("registration, manual team approval and member permissions use separate real sessions", async ({
  page,
  browser,
}) => {
  test.setTimeout(90_000);
  const suffix = randomUUID().slice(0, 8);
  const account = {
    fullName: `Temporary QA ${suffix}`,
    email: `qa-${suffix}@example.test`,
    password: randomBytes(24).toString("base64url"),
  };
  const memberContext = await browser.newContext({
    baseURL: "http://localhost:5173",
    timezoneId: "UTC",
  });
  const memberPage = await memberContext.newPage();
  let memberId: string | undefined,
    userId: string | undefined,
    projectId: string | undefined;
  await login(page);
  try {
    await memberPage.goto("/register");
    await memberPage
      .getByLabel("Ism va familiya", { exact: true })
      .fill(account.fullName);
    await memberPage.getByLabel("Email", { exact: true }).fill(account.email);
    await memberPage
      .getByLabel("Parol", { exact: true })
      .fill(account.password);
    await memberPage
      .getByLabel("Parolni tasdiqlash", { exact: true })
      .fill(account.password);
    const registered = await change(memberPage, "POST", "auth/register", () =>
      memberPage.getByRole("button", { name: /Ro‘yxatdan o‘tish/ }).click(),
    );
    userId = registered.id;
    expect(registered.role).toBe("pending");
    await expect(memberPage).toHaveURL(/\/pending$/);
    expect((await memberPage.request.get("/api/projects")).status()).toBe(403);
    await memberPage.goto("/projects");
    await expect(memberPage).toHaveURL(/\/pending$/);

    await page.goto("/team");
    await page.getByRole("button", { name: /A‘zo qo‘shish/ }).click();
    let dialog = page.getByRole("dialog");
    await dialog.locator("#memberName").fill(account.fullName);
    await dialog.locator("#memberEmail").fill(account.email);
    await dialog.locator("#memberRole").selectOption("QA Engineer");
    const approved = await save(page, "POST", "members");
    memberId = approved.id;
    expect(approved.accessRole).toBe("member");
    await memberPage
      .getByRole("button", { name: /Holatni tekshirish/ })
      .click();
    await expect(memberPage).toHaveURL(/\/dashboard$/);
    await memberPage.goto("/projects");
    await expect(
      memberPage.getByRole("button", { name: /Yangi loyiha/ }),
    ).toHaveCount(0);
    expect(
      (
        await memberPage.request.post("/api/projects", {
          data: {
            name: "Forbidden",
            description: "",
            startDate: "2026-11-17",
            dueDate: "2026-11-18",
          },
        })
      ).status(),
    ).toBe(403);
    await memberPage.goto("/team");
    await expect(
      memberPage.getByRole("button", { name: /A‘zo qo‘shish/ }),
    ).toHaveCount(0);
    await memberPage.goto("/risks");
    await expect(
      memberPage.getByRole("button", { name: /Yangi risk/ }),
    ).toHaveCount(0);

    const project = (
      await (
        await page.request.post("/api/projects", {
          data: {
            name: `Member workflow ${suffix}`,
            description: "Temporary acceptance fixture",
            startDate: "2026-11-17",
            dueDate: "2026-11-18",
          },
        })
      ).json()
    ).data;
    projectId = project.id;
    await memberPage.goto(`/tasks?projectId=${projectId}`);
    await memberPage.getByRole("button", { name: /Yangi vazifa/ }).click();
    dialog = memberPage.getByRole("dialog");
    await expect(dialog.locator("#taskAssignee")).toBeDisabled();
    await expect(dialog.locator("#taskAssignee")).toHaveValue(memberId!);
    await dialog.locator("#taskTitle").fill(`Own task ${suffix}`);
    await dialog.locator("#taskDueDate").fill("2026-11-18");
    const ownTask = await save(memberPage, "POST", "tasks");
    expect(ownTask.assigneeId).toBe(memberId);
    await card(memberPage, ownTask.title)
      .getByTitle("Tahrirlash", { exact: true })
      .click();
    await memberPage
      .getByRole("dialog")
      .locator("#taskTitle")
      .fill(`Own task edited ${suffix}`);
    await save(memberPage, "PATCH", `tasks/${ownTask.id}`);
    await expect(
      card(memberPage, `Own task edited ${suffix}`).getByTitle("O'chirish", {
        exact: true,
      }),
    ).toHaveCount(0);
    expect(
      (
        await memberPage.request.delete(`/api/tasks/${ownTask.id}`, {
          headers: { "Content-Type": "application/json" },
        })
      ).status(),
    ).toBe(403);
    await change(memberPage, "PATCH", `tasks/${ownTask.id}`, () =>
      card(memberPage, `Own task edited ${suffix}`)
        .getByRole("combobox")
        .selectOption("done"),
    );

    await page.goto("/team");
    const teamCard = page
      .locator("div.rounded-2xl")
      .filter({ hasText: account.email });
    await teamCard.getByTitle("Tahrirlash", { exact: true }).click();
    await page
      .getByRole("dialog")
      .locator("#memberRole")
      .selectOption("Backend Developer");
    await save(page, "PATCH", `members/${memberId}`);
    await expect(teamCard).toContainText("Backend Developer");
    await teamCard.getByTitle("O'chirish", { exact: true }).click();
    await remove(page, `members/${memberId}`);
    await memberPage.reload();
    await expect(memberPage).toHaveURL(/\/login$/);
    const unassigned = (
      await (await page.request.get(`/api/tasks/${ownTask.id}`)).json()
    ).data;
    expect(unassigned.assigneeId).toBeNull();
    await page.getByRole("button", { name: /Chiqish/ }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/login$/);
  } finally {
    await memberContext.close();
    // Reauthenticate for cleanup even if the test deliberately logged out.
    await page.request.post("/api/auth/login", { data: demo.manager });
    if (memberId)
      await page.request.delete(`/api/members/${memberId}`, {
        headers: { "Content-Type": "application/json" },
      });
    if (projectId)
      await page.request.delete(`/api/projects/${projectId}`, {
        headers: { "Content-Type": "application/json" },
      });
    if (userId) {
      const db = new DatabaseSync("apps/backend/data/teamflow.db");
      try {
        db.exec("PRAGMA foreign_keys=ON");
        db.prepare("DELETE FROM users WHERE id=? AND email=?").run(
          userId,
          account.email,
        );
      } finally {
        db.close();
      }
    }
  }
});
