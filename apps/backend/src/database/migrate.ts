import type { DatabaseSync } from "node:sqlite";

export function migrate(db: DatabaseSync) {
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, user_id TEXT UNIQUE REFERENCES users(id) ON DELETE SET NULL, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role TEXT NOT NULL, access_role TEXT NOT NULL CHECK(access_role IN ('manager','member')), created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, start_date TEXT NOT NULL, due_date TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT NOT NULL, assignee_id TEXT REFERENCES members(id) ON DELETE SET NULL, start_date TEXT NOT NULL, due_date TEXT NOT NULL, priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')), status TEXT NOT NULL CHECK(status IN ('todo','in_progress','done')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS risks (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title TEXT NOT NULL, probability INTEGER NOT NULL CHECK(probability BETWEEN 1 AND 5), impact INTEGER NOT NULL CHECK(impact BETWEEN 1 AND 5), mitigation TEXT NOT NULL, assignee_id TEXT REFERENCES members(id) ON DELETE SET NULL, status TEXT NOT NULL CHECK(status IN ('active','monitoring','resolved')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id); CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at); CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks(project_id); CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON tasks(assignee_id); CREATE INDEX IF NOT EXISTS risks_project_idx ON risks(project_id); CREATE INDEX IF NOT EXISTS risks_assignee_idx ON risks(assignee_id);`);
}
