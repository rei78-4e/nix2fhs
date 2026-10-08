#!/usr/bin/env node
// Usage: nix2fhs <path>...   or   <command> | nix2fhs
import { toFhs } from "../src/fhs.js";

const args = process.argv.slice(2);

if (args.length > 0) {
  for (const p of args) process.stdout.write(toFhs(p) + "\n");
} else if (!process.stdin.isTTY) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  process.stdout.write(toFhs(Buffer.concat(chunks).toString("utf8")));
} else {
  process.stderr.write("usage: nix2fhs <path>...  |  <command> | nix2fhs\n");
  process.exit(2);
}
