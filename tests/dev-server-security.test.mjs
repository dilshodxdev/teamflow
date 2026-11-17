import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createServer } from "vite";
import frontendConfig from "../apps/frontend/vite.config.ts";

test("Vite refuses unauthenticated filesystem access to backend credential files", async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const dataDirectory = path.join(root, "apps", "backend", "data");
  const synthetic = path.join(
    dataDirectory,
    `security-probe-${randomUUID()}.demo-credentials.json`,
  );
  const cacheDirectory = mkdtempSync(
    path.join(tmpdir(), "teamflow-vite-security-"),
  );
  let server;
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(
    synthetic,
    JSON.stringify({ synthetic: "not a real credential" }),
    { flag: "wx", mode: 0o600 },
  );
  try {
    // Read the real exported config without bundling/emitting a config file.
    // Cache is temporary and dependency discovery/watchers are disabled.
    server = await createServer({
      ...frontendConfig,
      configFile: false,
      root: path.join(root, "apps", "frontend"),
      cacheDir: cacheDirectory,
      logLevel: "silent",
      server: {
        ...frontendConfig.server,
        host: "127.0.0.1",
        port: 0,
        watch: null,
        preTransformRequests: false,
      },
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    await server.listen();
    const address = server.httpServer.address();
    assert.ok(address && typeof address === "object");
    const response = await fetch(
      `http://127.0.0.1:${address.port}/@fs/${synthetic.replaceAll("\\", "/")}`,
    );
    assert.equal(
      response.status,
      403,
      "backend local credential files must never be served through Vite",
    );
  } finally {
    await server?.close();
    unlinkSync(synthetic);
    const resolved = path.resolve(cacheDirectory);
    assert.ok(resolved.startsWith(path.resolve(tmpdir()) + path.sep));
    assert.ok(path.basename(resolved).startsWith("teamflow-vite-security-"));
    rmSync(resolved, { recursive: true, force: true });
  }
});
