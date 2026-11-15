import http from "node:http";

export type RouteHandler = (req: Request) => Promise<Response>;

export type RouteMap = Record<
  string,
  Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", RouteHandler>>
>;

/** Minimal HTTP server so supertest can hit App Router handlers without `next dev`. */
export function createTestServer(routes: RouteMap): http.Server {
  return http.createServer((nodeReq, nodeRes) => {
    void handle(nodeReq, nodeRes, routes).catch((err) => {
      nodeRes.statusCode = 500;
      nodeRes.end(err instanceof Error ? err.message : "error");
    });
  });
}

async function handle(
  nodeReq: http.IncomingMessage,
  nodeRes: http.ServerResponse,
  routes: RouteMap,
): Promise<void> {
  const path = (nodeReq.url ?? "/").split("?")[0] ?? "/";
  const method = (nodeReq.method ?? "GET").toUpperCase() as keyof NonNullable<
    RouteMap[string]
  >;
  const handler = routes[path]?.[method];
  if (!handler) {
    nodeRes.statusCode = 404;
    nodeRes.end();
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of nodeReq) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);

  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeReq.headers)) {
    if (value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  const host = nodeReq.headers.host ?? "127.0.0.1";
  const webReq = new Request(`http://${host}${nodeReq.url ?? path}`, {
    method,
    headers,
    body:
      method === "GET" || method === "HEAD" || body.length === 0
        ? undefined
        : body,
  });

  const webRes = await handler(webReq);
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    nodeRes.setHeader(key, value);
  });
  const cookies = webRes.headers.getSetCookie?.() ?? [];
  if (cookies.length) {
    nodeRes.setHeader("Set-Cookie", cookies);
  }

  const buf = Buffer.from(await webRes.arrayBuffer());
  nodeRes.end(buf);
}