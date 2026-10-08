import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/nix2fhs.js", import.meta.url));
const run = (args, input) =>
  spawnSync(process.execPath, [BIN, ...args], { input, encoding: "utf8" });

test("引数ごとに1行で出力する", () => {
  const r = run(["/run/wrappers/bin/sudo", "/home/rei/.nix-profile/bin/a b"]);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "/usr/bin/sudo\n/usr/bin/a b\n");
});

test("stdin を変換する", () => {
  const r = run([], "x /run/current-system/sw/bin/ls\ny\n");
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "x /usr/bin/ls\ny\n");
});
