import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const call = async (path, init) => {
  const res = await worker.fetch(new Request("https://n2f.test" + path, init));
  return [res.status, await res.text()];
};

test("GET ?p= を変換する", async () => {
  assert.deepEqual(await call("/?p=/run/wrappers/bin/sudo"), [200, "/usr/bin/sudo\n"]);
});

test("GET で p が無いと 400", async () => {
  assert.equal((await call("/"))[0], 400);
});

test("POST text/plain を変換する", async () => {
  const body = "x /run/current-system/sw/bin/ls\ny\n";
  const init = { method: "POST", headers: { "Content-Type": "text/plain" }, body };
  assert.deepEqual(await call("/", init), [200, "x /usr/bin/ls\ny\n"]);
});

test("POST で text/plain 以外は 415", async () => {
  const init = { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" };
  assert.equal((await call("/", init))[0], 415);
});

test("GET/POST 以外は 405", async () => {
  const res = await worker.fetch(new Request("https://n2f.test/", { method: "PUT" }));
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("Allow"), "GET, POST");
});
