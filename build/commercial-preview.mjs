import { readFileSync } from 'node:fs';

// Local adapter for this project's ordered routes. It runs only in dev/preview,
// never in the built pages. Vercel remains the production routing authority.
export function resolvePreviewRoute(request, host, routes) {
  const url = new URL(request, 'http://' + (host || 'localhost'));
  for (const route of routes) {
    if (route.handle) break;
    const match = new RegExp(route.src).exec(url.pathname);
    if (!match || route.has?.some(condition => {
      if (condition.type === 'host') return url.hostname !== condition.value;
      if (condition.type === 'query') return !url.searchParams.has(condition.key);
      return true;
    })) continue;
    const expand = value => value.replace(/\$(\d+)/g, (_, group) => match[Number(group)] || '');
    const headers = Object.fromEntries(Object.entries(route.headers || {}).map(([key, value]) => [key, expand(value)]));
    if (route.status >= 300 && route.status < 400 && headers.Location) {
      // Vercel forwards the query on routes redirects. A fragment is never sent
      // to the server; browsers inherit it when Location has no fragment.
      headers.Location += url.search;
      return { status: route.status, headers };
    }
    if (route.dest) return { url: expand(route.dest) + url.search, headers };
  }
  return null;
}

export function commercialPreview() {
  let routes;
  function configure(server) {
    server.middlewares.use((req, res, next) => {
      const result = resolvePreviewRoute(req.url || '/', req.headers.host, routes);
      if (result) {
        for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
        if (result.status) { res.statusCode = result.status; res.end(); return; }
        req.url = result.url;
      }
      next();
    });
  }
  return {
    name: 'nordra-commercial-preview',
    configResolved(config) { routes = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).routes; },
    configureServer: configure,
    configurePreviewServer: configure,
  };
}
