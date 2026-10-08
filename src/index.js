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

const toFhs = (text) =>
  text.replace(NIX_PATH, (_, rest = "") =>
    rest.startsWith("/etc/") ? rest : "/usr" + rest,
  );

export default {
  async fetch(req) {
    if (req.method === "GET") {
      const p = new URL(req.url).searchParams.get("p");
      if (!p) return new Response("usage: ?p=<path>\n", { status: 400 });
      return new Response(toFhs(p) + "\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (req.method !== "POST")
      return new Response("Method Not Allowed\n", {
        status: 405,
        headers: { Allow: "GET, POST" },
      });
    if (!(req.headers.get("content-type") || "").startsWith("text/plain"))
      return new Response("Unsupported Media Type\n", { status: 415 });

    return new Response(toFhs(await req.text()), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
