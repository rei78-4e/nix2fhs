const NIX_PATH = new RegExp(
  "(?:/nix/store/[0-9a-z]{32}-[^/\\s]+" + // /nix/store/<hash>-<name>
    "|/etc/profiles/per-user/[^/\\s]+" + // home-manager (NixOS module)
    "|/run/current-system/sw" + // システムプロファイル
    "|/run/wrappers" + // setuid wrappers (sudo等)
    "|/nix/var/nix/profiles/[^/\\s]+" + // デフォルトプロファイル
    "|/home/[^/\\s]+/\\.nix-profile" + // ユーザープロファイル
    "|/home/[^/\\s]+/\\.local/state/nix/profiles/[^/\\s]+)" +
    "(/[^\\s]*)?",
  "g",
);

export const toFhs = (text) =>
  text.replace(NIX_PATH, (_, rest = "") =>
    rest.startsWith("/etc/") ? rest : "/usr" + rest,
  );
