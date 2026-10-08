import { test } from "node:test";
import assert from "node:assert/strict";
import { toFhs } from "../src/fhs.js";

const H = "abcdefghijklmnopqrstuvwxyz012345";
const S = (name) => `/nix/store/${H}-${name}`;

const cases = [
  // 各種プロファイル
  [`${S("bash-5.2")}/bin/bash`, "/usr/bin/bash"],
  [S("bash-5.2"), "/usr"],
  ["/run/current-system/sw/bin/ls", "/usr/bin/ls"],
  ["/run/wrappers/bin/sudo", "/usr/bin/sudo"],
  ["/etc/profiles/per-user/rei/bin/vim", "/usr/bin/vim"],
  ["/nix/var/nix/profiles/default/bin/nix", "/usr/bin/nix"],
  ["/home/rei/.nix-profile/bin/git", "/usr/bin/git"],
  ["/home/rei/.local/state/nix/profiles/home-manager/bin/hm", "/usr/bin/hm"],
  // /etc はそのまま
  ["/etc/profiles/per-user/rei/etc/xdg", "/etc/xdg"],
  [`${S("a")}/etc/foo.conf`, "/etc/foo.conf"],
  // 前後の文字列は保持
  [`error: ${S("a")}/bin/x: not found`, "error: /usr/bin/x: not found"],
  [`see ${S("a")}/bin/x.`, "see /usr/bin/x."],
  [`file://${S("a")}/share/doc`, "file:///usr/share/doc"],
  // 複数パス
  [`cp ${S("a")}/bin/x /run/current-system/sw/bin/y`, "cp /usr/bin/x /usr/bin/y"],
  [`PATH=${S("a")}/bin:${S("b")}/bin:/run/current-system/sw/bin`, "PATH=/usr/bin:/usr/bin:/usr/bin"],
  [`${S("a")}/bin/x,${S("b")}/bin/y`, "/usr/bin/x,/usr/bin/y"],
  [`${S("a")}:${S("b")}`, "/usr:/usr"],
  // 区切り文字・引用符
  [`"${S("a")}"`, '"/usr"'],
  [`"${S("a")}/lib/x.so", '/run/wrappers/bin/sudo'`, `"/usr/lib/x.so", '/usr/bin/sudo'`],
  [`(${S("a")}/bin/x)`, "(/usr/bin/x)"],
  ["[/home/rei/.nix-profile/bin/x]", "[/usr/bin/x]"],
  // 複数行
  [`a ${S("a")}/bin/x\nb ${S("b")}/lib/y\n`, "a /usr/bin/x\nb /usr/lib/y\n"],
];

for (const [input, expected] of cases)
  test(JSON.stringify(input), () => assert.equal(toFhs(input), expected));

test("Nix 以外のパスは変更しない", () => {
  for (const s of [
    "/usr/bin/bash",
    "/etc/nixos/configuration.nix",
    "/nix/store/short-hash/bin/x", // ハッシュが32文字でない
    "/home/rei/.config/nix",
    "",
  ])
    assert.equal(toFhs(s), s);
});
