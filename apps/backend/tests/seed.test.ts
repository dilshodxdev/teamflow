import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";

test("demo seed creates records once without resetting existing accounts", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "teamflow-seed-"));
  const file = path.join(dir, "test.db");
  try {
    const run = () =>
      spawnSync(process.execPath, ["--import", "tsx", "src/seed.ts"], {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          DATABASE_PATH: file,
          DEMO_MANAGER_EMAIL: "manager@example.test",
          DEMO_MEMBER_EMAIL: "member@example.test",
          DEMO_MANAGER_PASSWORD: "first-password",
          DEMO_MEMBER_PASSWORD: "second-password",
        },
      });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const db = new DatabaseSync(file);
    const before = db
      .prepare("SELECT password_hash FROM users WHERE email=?")
      .get("manager@example.test") as { password_hash: string };
    assert.equal(
      (db.prepare("SELECT count(*) n FROM tasks").get() as { n: number }).n,
      12,
    );
    assert.equal(
      (db.prepare("SELECT count(*) n FROM risks").get() as { n: number }).n,
      4,
    );
    db.close();
    const second = run();
    assert.equal(second.status, 0, second.stderr);
    const after = new DatabaseSync(file);
    assert.equal(
      (
        after
          .prepare("SELECT password_hash FROM users WHERE email=?")
          .get("manager@example.test") as { password_hash: string }
      ).password_hash,
      before.password_hash,
    );
    assert.equal(
      (after.prepare("SELECT count(*) n FROM projects").get() as { n: number })
        .n,
      1,
    );
    after.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("generated credentials are saved beside the database and survive reseeding", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "teamflow-generated-"));
  const file = path.join(dir, "isolated.db");
  const credentialsPath = path.join(dir, "isolated.demo-credentials.json");
  try {
    const env = {
      ...process.env,
      DATABASE_PATH: file,
      DEMO_MANAGER_EMAIL: "manager@example.test",
      DEMO_MEMBER_EMAIL: "member@example.test",
    };
    delete env.DEMO_MANAGER_PASSWORD;
    delete env.DEMO_MEMBER_PASSWORD;
    const run = () =>
      spawnSync(process.execPath, ["--import", "tsx", "src/seed.ts"], {
        cwd: process.cwd(),
        encoding: "utf8",
        env,
      });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const saved = readFileSync(credentialsPath, "utf8");
    const credentials = JSON.parse(saved) as {
      manager: { email: string; password: string };
      member: { email: string; password: string };
    };
    const db = new DatabaseSync(file);
    for (const account of [credentials.manager, credentials.member]) {
      const row = db
        .prepare("SELECT password_hash FROM users WHERE email=?")
        .get(account.email) as { password_hash: string };
      assert.ok(bcrypt.compareSync(account.password, row.password_hash));
      assert.ok(!first.stdout.includes(account.password));
    }
    db.close();
    const second = run();
    assert.equal(second.status, 0, second.stderr);
    assert.equal(readFileSync(credentialsPath, "utf8"), saved);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
