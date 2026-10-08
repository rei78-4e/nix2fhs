import { toFhs } from "./fhs.js";

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
