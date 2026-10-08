const END = "\\s:,;\"'`()<>\\[\\]{}"; // パスの終わりとみなす文字
const SEG = `[^/${END}]+`; // パスの1要素

const NIX_PATH = new RegExp(
  `(?:/nix/store/[0-9a-z]{32}-${SEG}` + // /nix/store/<hash>-<name>
    `|/etc/profiles/per-user/${SEG}` + // home-manager (NixOS module)
    "|/run/current-system/sw" + // システムプロファイル
    "|/run/wrappers" + // setuid wrappers (sudo等)
    `|/nix/var/nix/profiles/${SEG}` + // デフォルトプロファイル
    `|/home/${SEG}/\\.nix-profile` + // ユーザープロファイル
    `|/home/${SEG}/\\.local/state/nix/profiles/${SEG})` +
    `(/[^${END}]*)?`,
  "g",
);

export const toFhs = (text) =>
  text.replace(NIX_PATH, (_, rest = "") =>
    rest.startsWith("/etc/") ? rest : "/usr" + rest,
  );
